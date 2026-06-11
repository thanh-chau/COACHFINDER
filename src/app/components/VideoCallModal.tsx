import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, UserRound, Video, VideoOff } from "lucide-react";
import { chatWebSocketService, useVideoCallWebSocket } from "../api/websocket";
import type { CallType } from "../types/chat";
import { getAuthSession } from "../utils/authSession";
import { getWebRtcIceConfig, type WebRtcIceConfig } from "../api/webrtc";

interface CallModalProps {
  targetUsername: string;
  conversationId: number;
  callType: CallType;
  isCaller: boolean;
  callId?: number;
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
  onClose,
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
  const connectedRef = useRef(false);
  const closingRef = useRef(false);
  const sessionCallIdRef = useRef<number | undefined>(callId);
  const timeoutRef = useRef<number | undefined>();
  const [sessionCallId, setSessionCallId] = useState<number | undefined>(callId);
  const [status, setStatus] = useState(isCaller ? "Dang goi..." : "Dang ket noi...");
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(callType === "VIDEO");
  const isVideoCall = callType === "VIDEO";

  useEffect(() => {
    sessionCallIdRef.current = sessionCallId;
  }, [sessionCallId]);

  const sendSignal = (
    type: Parameters<typeof chatWebSocketService.sendCallSignal>[0]["type"],
    payload?: RTCSessionDescriptionInit | RTCIceCandidateInit,
  ) => {
    if (closingRef.current && ["OFFER", "ANSWER", "ICE"].includes(type)) return;
    chatWebSocketService.sendCallSignal({
      type,
      callId: sessionCallIdRef.current,
      conversationId,
      callType,
      targetUsername,
      payload,
    });
  };

  const cleanup = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    remoteStream.current = null;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingIceCandidates.current = [];
    connectedRef.current = false;
  };

  const flushPendingIceCandidates = async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidates.current;
    pendingIceCandidates.current = [];
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn("[WebRTC] Unable to add queued ICE candidate", error);
      }
    }
  };

  const loadIceConfig = async () => {
    try {
      const iceConfig = await getWebRtcIceConfig();
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

  const ensurePeerConnection = async (shouldCreateOffer: boolean) => {
    if (peerConnection.current) return peerConnection.current;

    try {
      setStatus("Dang lay quyen thiet bi...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      });
      localStream.current = stream;
      if (localVideoRef.current && isVideoCall) {
        localVideoRef.current.srcObject = stream;
      }

      const iceConfig = await loadIceConfig();
      const pc = new RTCPeerConnection({
        iceServers: iceConfig.iceServers,
        iceTransportPolicy: iceConfig.iceTransportPolicy ?? "all",
      });
      peerConnection.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        connectedRef.current = true;
        setStatus("Dang trong cuoc goi");
        remoteStream.current = event.streams[0];
        if (isVideoCall && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        if (!isVideoCall && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          if (event.candidate.candidate.includes(" typ relay ")) {
            console.info("[WebRTC] TURN relay candidate discovered");
          }
          sendSignal("ICE", event.candidate);
        }
      };

      pc.onicecandidateerror = (event) => {
        console.warn("[WebRTC] ICE candidate error", {
          errorCode: event.errorCode,
          errorText: event.errorText,
        });
      };

      pc.onconnectionstatechange = () => {
        if (isDevelopment()) {
          console.info("[WebRTC] connection state:", pc.connectionState);
        }
        if (pc.connectionState === "connected") {
          connectedRef.current = true;
          setStatus("Dang trong cuoc goi");
        }
        if (pc.connectionState === "failed") {
          if (!closingRef.current) {
            setStatus("Khong the ket noi cuoc goi");
            window.setTimeout(() => closeCall("CALL_END"), 700);
          }
        } else if (["disconnected", "closed"].includes(pc.connectionState)) {
          if (!closingRef.current) setStatus("Ket noi bi gian doan");
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (isDevelopment()) {
          console.info("[WebRTC] ICE state:", pc.iceConnectionState);
        }
      };

      pc.onicegatheringstatechange = () => {
        if (isDevelopment()) {
          console.info("[WebRTC] ICE gathering state:", pc.iceGatheringState);
        }
      };

      pc.onsignalingstatechange = () => {
        if (isDevelopment()) {
          console.info("[WebRTC] signaling state:", pc.signalingState);
        }
      };

      if (shouldCreateOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal("OFFER", offer);
      }

      if (!shouldCreateOffer) {
        setStatus("Dang cho ket noi...");
      }

      return pc;
    } catch (error) {
      console.error("Media device access failed", error);
      setStatus(isVideoCall ? "Khong the truy cap camera/mic" : "Khong the truy cap microphone");
      sendSignal("CALL_END");
      return null;
    }
  };

  useEffect(() => {
    if (isCaller) {
      setStatus("Dang goi...");
      chatWebSocketService.sendCallSignal({
        type: "CALL_INVITE",
        conversationId,
        callType,
        targetUsername,
      });
      return;
    }

    void ensurePeerConnection(false);
  }, []);

  useEffect(() => {
    if (!isCaller || connectedRef.current) return;
    timeoutRef.current = window.setTimeout(() => {
      if (!connectedRef.current && !closingRef.current) {
        setStatus("Cuoc goi bi nho");
        closeCall("TIMEOUT");
      }
    }, 45000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [isCaller]);

  useEffect(() => cleanup, []);

  useVideoCallWebSocket(async (signal) => {
    const currentUsername = getAuthSession()?.username;
    const signalMatchesCall =
      (sessionCallIdRef.current && signal.callId === sessionCallIdRef.current) ||
      (!sessionCallIdRef.current &&
        signal.conversationId === conversationId &&
        signal.callType === callType &&
        (signal.senderUsername === targetUsername || signal.senderUsername === currentUsername));

    if (!signalMatchesCall) return;

    if (signal.type === "CALL_INVITE" && isCaller && signal.callId) {
      setSessionCallId(signal.callId);
      setStatus("Dang do chuong...");
      return;
    }

    if (signal.type === "CALL_ACCEPT" && isCaller) {
      if (signal.callId) setSessionCallId(signal.callId);
      setStatus("Dang ket noi...");
      await ensurePeerConnection(true);
      return;
    }

    if (signal.type === "OFFER" && !isCaller) {
      if (signal.callId) setSessionCallId(signal.callId);
      const pc = await ensurePeerConnection(false);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
      await flushPendingIceCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal("ANSWER", answer);
      return;
    }

    if (signal.type === "ANSWER" && isCaller) {
      const pc = peerConnection.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
        await flushPendingIceCandidates(pc);
      }
      return;
    }

    if (signal.type === "ICE") {
      const pc = peerConnection.current;
      if (pc && signal.payload) {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.payload as RTCIceCandidateInit));
          } catch (error) {
            console.warn("[WebRTC] Unable to add ICE candidate", error);
          }
        } else {
          pendingIceCandidates.current.push(signal.payload as RTCIceCandidateInit);
        }
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

  const handleEndCall = () => {
    closeCall(connectedRef.current ? "CALL_END" : "CALL_CANCEL");
  };

  const toggleMic = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(value => !value);
  };

  const toggleCam = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !camEnabled;
    });
    setCamEnabled(value => !value);
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
