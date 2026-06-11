import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, UserRound, Video, VideoOff } from "lucide-react";
import { chatWebSocketService, useVideoCallWebSocket } from "../api/websocket";
import type { CallType } from "../types/chat";
import { getAuthSession } from "../utils/authSession";

interface CallModalProps {
  targetUsername: string;
  conversationId: number;
  callType: CallType;
  isCaller: boolean;
  callId?: number;
  onClose: () => void;
}

function getIceServers(): RTCIceServer[] {
  const fallback = [{ urls: "stun:stun.l.google.com:19302" }];
  const raw = import.meta.env.VITE_WEBRTC_ICE_SERVERS;
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as RTCIceServer[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
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
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
  const connectedRef = useRef(false);
  const closingRef = useRef(false);
  const sessionCallIdRef = useRef<number | undefined>(callId);
  const [sessionCallId, setSessionCallId] = useState<number | undefined>(callId);
  const [status, setStatus] = useState(isCaller ? "Dang goi..." : "Dang ket noi...");
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(callType === "VIDEO");
  const isVideoCall = callType === "VIDEO";

  useEffect(() => {
    sessionCallIdRef.current = sessionCallId;
  }, [sessionCallId]);

  const sendSignal = (type: Parameters<typeof chatWebSocketService.sendCallSignal>[0]["type"], payload?: any) => {
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
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingIceCandidates.current = [];
  };

  const flushPendingIceCandidates = async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidates.current;
    pendingIceCandidates.current = [];
    for (const candidate of candidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
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

      const pc = new RTCPeerConnection({ iceServers: getIceServers() });
      peerConnection.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        connectedRef.current = true;
        setStatus("Dang trong cuoc goi");
        if (isVideoCall && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        if (!isVideoCall && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal("ICE", event.candidate);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          connectedRef.current = true;
          setStatus("Dang trong cuoc goi");
        }
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          if (!closingRef.current) setStatus("Ket noi bi gian doan");
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
    const timer = window.setTimeout(() => {
      if (!connectedRef.current && !closingRef.current) {
        setStatus("Cuoc goi bi nho");
        closeCall("TIMEOUT");
      }
    }, 45000);
    return () => window.clearTimeout(timer);
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
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
      await flushPendingIceCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal("ANSWER", answer);
      return;
    }

    if (signal.type === "ANSWER" && isCaller) {
      const pc = peerConnection.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        await flushPendingIceCandidates(pc);
      }
      return;
    }

    if (signal.type === "ICE") {
      const pc = peerConnection.current;
      if (pc && signal.payload) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        } else {
          pendingIceCandidates.current.push(signal.payload);
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
