import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, UserRound, Video, VideoOff } from "lucide-react";
import { chatWebSocketService, useVideoCallWebSocket } from "../api/websocket";
import { normalizeCallType, type CallType } from "../types/chat";
import { getAuthSession } from "../utils/authSession";
import { getWebRtcIceConfig, type WebRtcIceConfig } from "../api/webrtc";

interface CallModalProps {
  targetUsername: string;
  conversationId: number;
  callType: CallType;
  isCaller: boolean;
  callId?: number;
  onReady?: () => void;
  onClose: () => void;
}

const FALLBACK_ICE_CONFIG: WebRtcIceConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  iceTransportPolicy: "all",
  turnConfigured: false,
  expiresAt: 0,
};

function isDevelopment() {
  return import.meta.env.DEV;
}

export function CallModal({
  targetUsername,
  conversationId,
  callType,
  isCaller,
  callId,
  onReady,
  onClose,
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const peerConnectionPromiseRef = useRef<Promise<RTCPeerConnection | null> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingIceCandidateKeysRef = useRef<Set<string>>(new Set());
  const addedIceCandidateKeysRef = useRef<Set<string>>(new Set());
  const localTracksAddedRef = useRef(false);
  const acceptedRef = useRef(!isCaller);
  const connectedRef = useRef(false);
  const closingRef = useRef(false);
  const cleanedUpRef = useRef(false);
  const sessionCallIdRef = useRef<number | undefined>(callId);
  const ringingTimeoutRef = useRef<number | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const disconnectTimeoutRef = useRef<number | null>(null);
  const [sessionCallId, setSessionCallId] = useState<number | undefined>(callId);
  const [status, setStatus] = useState(isCaller ? "Dang goi..." : "Dang ket noi...");
  const [needsPlaybackInteraction, setNeedsPlaybackInteraction] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const normalizedCallType = normalizeCallType(callType);
  const [camEnabled, setCamEnabled] = useState(normalizedCallType === "video");
  const isVideoCall = normalizedCallType === "video";

  const updateSessionCallId = (nextCallId: number | undefined) => {
    sessionCallIdRef.current = nextCallId;
    setSessionCallId(nextCallId);
  };

  useEffect(() => {
    if (callId !== undefined && callId !== sessionCallIdRef.current) {
      updateSessionCallId(callId);
    }
  }, [callId]);

  const sendSignal = (
    type: Parameters<typeof chatWebSocketService.sendCallSignal>[0]["type"],
    payload?: RTCSessionDescriptionInit | RTCIceCandidateInit,
  ) => {
    if (closingRef.current && ["OFFER", "ANSWER", "ICE"].includes(type)) return;
    chatWebSocketService.sendCallSignal({
      type,
      callId: sessionCallIdRef.current,
      conversationId,
      callType: normalizedCallType,
      targetUsername,
      payload,
    });
  };

  const clearRingingTimeout = () => {
    if (ringingTimeoutRef.current !== null) {
      window.clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
  };

  const clearConnectionTimers = () => {
    clearRingingTimeout();
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (disconnectTimeoutRef.current !== null) {
      window.clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
  };

  const cleanup = () => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;
    clearConnectionTimers();
    pendingIceCandidatesRef.current = [];
    pendingIceCandidateKeysRef.current.clear();
    addedIceCandidateKeysRef.current.clear();

    peerConnectionRef.current?.getSenders().forEach(sender => {
      sender.track?.stop();
    });
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    localTracksAddedRef.current = false;

    remoteStreamRef.current.getTracks().forEach(track => track.stop());
    remoteStreamRef.current = new MediaStream();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    connectedRef.current = false;
  };

  const attachRemoteStream = useCallback(async (stream: MediaStream) => {
    const element = isVideoCall ? remoteVideoRef.current : remoteAudioRef.current;
    if (!element) {
      console.warn("[WebRTC] Remote media element is not mounted");
      return;
    }

    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }

    element.autoplay = true;
    element.muted = false;
    element.volume = 1;
    if ("playsInline" in element) {
      element.playsInline = true;
    }

    try {
      await element.play();
      setNeedsPlaybackInteraction(false);
    } catch (error) {
      console.warn("[WebRTC] Remote autoplay blocked", error);
      setNeedsPlaybackInteraction(true);
    }
  }, [isVideoCall]);

  const addIceCandidateOnce = async (pc: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
    const key = JSON.stringify(candidate);
    if (addedIceCandidateKeysRef.current.has(key)) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    addedIceCandidateKeysRef.current.add(key);
    pendingIceCandidateKeysRef.current.delete(key);
  };

  const flushPendingIceCandidates = async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidatesRef.current.splice(0);
    pendingIceCandidateKeysRef.current.clear();
    for (const candidate of candidates) {
      try {
        await addIceCandidateOnce(pc, candidate);
      } catch (error) {
        console.warn("[WebRTC] Unable to add queued ICE candidate", error);
      }
    }
  };

  const loadIceConfig = async () => {
    try {
      const iceConfig = await getWebRtcIceConfig();
      console.info("[WebRTC] ICE config loaded", {
        turnConfigured: iceConfig.turnConfigured,
        iceTransportPolicy: iceConfig.iceTransportPolicy,
        iceServerCount: iceConfig.iceServers.length,
      });
      if (!iceConfig.turnConfigured) {
        console.warn("[WebRTC] TURN is not configured; calls across networks may fail");
      }
      return iceConfig;
    } catch (error) {
      console.warn("[WebRTC] Failed to load ICE config; using STUN-only fallback", error);
      return FALLBACK_ICE_CONFIG;
    }
  };

  const closeCall = (notifyType?: "CALL_END" | "CALL_CANCEL" | "TIMEOUT") => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (notifyType) {
      sendSignal(notifyType);
    }
    cleanup();
    onClose();
  };

  const ensureLocalMedia = async (pc: RTCPeerConnection) => {
    let stream = localStreamRef.current;

    if (!stream) {
      setStatus("Dang lay quyen thiet bi...");
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && isVideoCall) {
        localVideoRef.current.srcObject = stream;
      }
      setStatus("Dang chuan bi ket noi...");
    }

    for (const track of stream.getTracks()) {
      const alreadyAdded = pc.getSenders().some(sender => sender.track?.id === track.id);
      if (!alreadyAdded) {
        pc.addTrack(track, stream);
      }
    }
    localTracksAddedRef.current = true;

    console.info("[WebRTC] Local tracks:", stream.getTracks().map(track => ({
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
    })));

    setStatus("Dang ket noi...");

    return stream;
  };

  const startConnectionTimeout = () => {
    if (connectionTimeoutRef.current !== null) return;
    connectionTimeoutRef.current = window.setTimeout(() => {
      const pc = peerConnectionRef.current;
      if (!pc || closingRef.current || connectedRef.current) return;
      setStatus("Khong the ket noi cuoc goi");
      closeCall("CALL_END");
    }, 45000);
  };

  const markConnected = () => {
    connectedRef.current = true;
    acceptedRef.current = true;
    clearConnectionTimers();
    setStatus("Dang trong cuoc goi");
  };

  const handleDisconnectedState = (pc: RTCPeerConnection) => {
    if (disconnectTimeoutRef.current !== null || closingRef.current) return;
    setStatus("Ket noi bi gian doan");
    disconnectTimeoutRef.current = window.setTimeout(() => {
      if (
        !closingRef.current &&
        (pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed")
      ) {
        setStatus("Mat ket noi cuoc goi");
        closeCall("CALL_END");
      }
      disconnectTimeoutRef.current = null;
    }, 30000);
  };

  const setupPeerConnectionHandlers = (pc: RTCPeerConnection) => {
    pc.ontrack = (event) => {
      const remoteStream = remoteStreamRef.current;
      if (!remoteStream.getTracks().some(track => track.id === event.track.id)) {
        remoteStream.addTrack(event.track);
      }

      event.track.onmute = () => console.warn("[WebRTC] Remote track muted:", event.track.kind);
      event.track.onunmute = () => {
        console.info("[WebRTC] Remote track unmuted:", event.track.kind);
        void attachRemoteStream(remoteStreamRef.current);
      };
      event.track.onended = () => console.warn("[WebRTC] Remote track ended:", event.track.kind);

      console.info("[WebRTC] Remote tracks:", remoteStream.getTracks().map(track => ({
        kind: track.kind,
        muted: track.muted,
        readyState: track.readyState,
      })));

      void attachRemoteStream(remoteStream);
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const candidate = event.candidate.toJSON();
      if (event.candidate.candidate.includes(" typ relay ")) {
        console.info("[WebRTC] TURN relay candidate discovered");
      }
      sendSignal("ICE", candidate);
    };

    pc.onicecandidateerror = (event) => {
      console.warn("[WebRTC] ICE candidate error", {
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
    };

    pc.onconnectionstatechange = () => {
      console.info("[WebRTC] connectionState:", pc.connectionState);
      if (pc.connectionState === "connected") {
        markConnected();
      } else if (pc.connectionState === "failed") {
        if (!closingRef.current) {
          setStatus("Khong the ket noi cuoc goi");
          window.setTimeout(() => closeCall("CALL_END"), 700);
        }
      } else if (pc.connectionState === "disconnected") {
        handleDisconnectedState(pc);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.info("[WebRTC] iceConnectionState:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        markConnected();
      } else if (pc.iceConnectionState === "failed") {
        if (!closingRef.current) {
          setStatus("Khong the ket noi cuoc goi");
          window.setTimeout(() => closeCall("CALL_END"), 700);
        }
      } else if (pc.iceConnectionState === "disconnected") {
        handleDisconnectedState(pc);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.info("[WebRTC] iceGatheringState:", pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      console.info("[WebRTC] signalingState:", pc.signalingState);
    };
  };

  const createPeerConnection = async () => {
    const iceConfig = await loadIceConfig();
    const pc = new RTCPeerConnection({
      iceServers: iceConfig.iceServers,
      iceTransportPolicy: iceConfig.iceTransportPolicy ?? "all",
    });
    setupPeerConnectionHandlers(pc);
    return pc;
  };

  const getOrCreatePeerConnection = async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    if (peerConnectionPromiseRef.current) return peerConnectionPromiseRef.current;

    peerConnectionPromiseRef.current = createPeerConnection();
    try {
      const pc = await peerConnectionPromiseRef.current;
      peerConnectionRef.current = pc;
      return pc;
    } catch (error) {
      console.error("[WebRTC] Peer connection setup failed", error);
      setStatus("Khong the khoi tao cuoc goi");
      return null;
    } finally {
      peerConnectionPromiseRef.current = null;
    }
  };

  const createAndSendOffer = async () => {
    try {
      const pc = await getOrCreatePeerConnection();
      if (!pc) return;
      await ensureLocalMedia(pc);
      setStatus("Dang tao loi moi ket noi...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      startConnectionTimeout();
      setStatus("Dang cho ket noi WebRTC...");
      sendSignal("OFFER", pc.localDescription ?? offer);
    } catch (error) {
      console.error("[WebRTC] Failed to create/send offer", error);
      setStatus("Khong the tao ket noi cuoc goi");
      closeCall("CALL_END");
    }
  };

  const acceptOfferAndSendAnswer = async (offer: RTCSessionDescriptionInit) => {
    try {
      const pc = await getOrCreatePeerConnection();
      if (!pc) return;
      setStatus("Dang nhan loi moi ket noi...");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingIceCandidates(pc);
      await ensureLocalMedia(pc);
      setStatus("Dang tao phan hoi ket noi...");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      startConnectionTimeout();
      setStatus("Dang cho ket noi WebRTC...");
      sendSignal("ANSWER", pc.localDescription ?? answer);
    } catch (error) {
      console.error("[WebRTC] Failed to accept offer/send answer", error);
      setStatus("Khong the tra loi cuoc goi");
      closeCall("CALL_END");
    }
  };

  useEffect(() => {
    if (isCaller) {
      setStatus("Dang goi...");
      chatWebSocketService.sendCallSignal({
        type: "CALL_INVITE",
        conversationId,
        callType: normalizedCallType,
        targetUsername,
      });
      return;
    }

    setStatus("Dang cho ket noi...");
  }, []);

  useEffect(() => {
    if (!isCaller || connectedRef.current) return;
    ringingTimeoutRef.current = window.setTimeout(() => {
      if (!acceptedRef.current && !closingRef.current) {
        setStatus("Cuoc goi bi nho");
        closeCall("TIMEOUT");
      }
    }, 45000);
    return () => {
      clearRingingTimeout();
    };
  }, [isCaller]);

  useEffect(() => cleanup, []);

  useEffect(() => {
    const stream = remoteStreamRef.current;
    if (stream.getTracks().length === 0) return;
    void attachRemoteStream(stream);
  }, [attachRemoteStream, status]);

  useVideoCallWebSocket(async (signal) => {
    const currentUsername = getAuthSession()?.username;
    const signalMatchesCall =
      (sessionCallIdRef.current && signal.callId === sessionCallIdRef.current) ||
      (!sessionCallIdRef.current &&
        signal.conversationId === conversationId &&
        normalizeCallType(signal.callType) === normalizedCallType &&
        (signal.senderUsername === targetUsername || signal.senderUsername === currentUsername));

    if (!signalMatchesCall) return;

    if (signal.type === "ICE" && signal.payload) {
      const candidate = signal.payload as RTCIceCandidateInit;
      const key = JSON.stringify(candidate);
      const pc = peerConnectionRef.current;

      if (
        pendingIceCandidateKeysRef.current.has(key) ||
        addedIceCandidateKeysRef.current.has(key)
      ) {
        return;
      }

      if (!pc || !pc.remoteDescription) {
        pendingIceCandidateKeysRef.current.add(key);
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await addIceCandidateOnce(pc, candidate);
      } catch (error) {
        console.warn("[WebRTC] Unable to add ICE candidate", error);
      }
      return;
    }

    if (signal.type === "CALL_INVITE" && isCaller && signal.callId) {
      updateSessionCallId(signal.callId);
      setStatus("Dang do chuong...");
      return;
    }

    if (signal.type === "CALL_ACCEPT" && isCaller) {
      if (signal.callId) updateSessionCallId(signal.callId);
      acceptedRef.current = true;
      clearRingingTimeout();
      setStatus("Dang ket noi...");
      await createAndSendOffer();
      return;
    }

    if (signal.type === "OFFER" && !isCaller) {
      if (signal.callId) updateSessionCallId(signal.callId);
      acceptedRef.current = true;
      clearRingingTimeout();
      await acceptOfferAndSendAnswer(signal.payload as RTCSessionDescriptionInit);
      return;
    }

    if (signal.type === "ANSWER" && isCaller) {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
        await flushPendingIceCandidates(pc);
      }
      return;
    }

    if (["CALL_REJECT", "CALL_CANCEL", "CALL_END", "BUSY", "TIMEOUT"].includes(signal.type)) {
      if (signal.type === "BUSY") setStatus("Nguoi dung dang ban");
      if (signal.type === "CALL_REJECT") setStatus("Cuoc goi bi tu choi");
      cleanup();
      window.setTimeout(() => onClose(), 700);
    }
  });

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const handleEndCall = () => {
    closeCall(connectedRef.current ? "CALL_END" : "CALL_CANCEL");
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(value => !value);
  };

  const toggleCam = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !camEnabled;
    });
    setCamEnabled(value => !value);
  };

  const handlePlaybackInteraction = async () => {
    try {
      await remoteVideoRef.current?.play();
      await remoteAudioRef.current?.play();
      setNeedsPlaybackInteraction(false);
    } catch (error) {
      console.warn("[WebRTC] Remote playback still blocked", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center">
      <div className="absolute top-8 text-center">
        <h2 className="text-white text-2xl font-bold">{targetUsername}</h2>
        <p className="text-gray-400 mt-2">
          {isVideoCall ? "Cuoc goi video" : "Cuoc goi thoai"} - {status}
        </p>
      </div>

      {isVideoCall ? (
        <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-700">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <div className="w-72 h-72 rounded-full bg-gray-800 border border-gray-700 flex flex-col items-center justify-center text-white shadow-2xl">
          <UserRound className="w-24 h-24 text-gray-400 mb-4" />
          <div className="text-xl font-bold">{targetUsername}</div>
          <div className="text-sm text-gray-400 mt-2">{status}</div>
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      {needsPlaybackInteraction && (
        <button
          onClick={handlePlaybackInteraction}
          className="absolute bottom-32 px-5 py-2.5 rounded-lg bg-white text-gray-900 font-semibold shadow-lg"
        >
          Bat am thanh
        </button>
      )}

      <div className="absolute bottom-12 flex items-center gap-6">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${micEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        {isVideoCall && (
          <button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${camEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export const VideoCallModal = CallModal;
