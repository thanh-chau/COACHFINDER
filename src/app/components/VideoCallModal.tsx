import { useEffect, useRef, useState } from "react";
import { chatWebSocketService, useVideoCallWebSocket } from "../api/websocket";

interface VideoCallModalProps {
  targetUsername: string;
  isCaller: boolean;
  onClose: () => void;
}

export function VideoCallModal({ targetUsername, isCaller, onClose }: VideoCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState(isCaller ? "Đang gọi..." : "Đang kết nối...");
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Initialize WebRTC
  useEffect(() => {
    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
          ]
        });
        peerConnection.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStatus("Đang trong cuộc gọi");
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            chatWebSocketService.sendCallSignal({
              type: "ice",
              targetUsername,
              payload: event.candidate
            });
          }
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          chatWebSocketService.sendCallSignal({
            type: "offer",
            targetUsername,
            payload: offer
          });
        }
      } catch (e) {
        console.error("Camera/Mic access denied", e);
        setStatus("Lỗi truy cập Camera/Mic");
      }
    };

    initCall();

    return () => {
      // Cleanup
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [isCaller, targetUsername]);

  useVideoCallWebSocket(async (signal) => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (signal.type === "offer" && !isCaller) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      chatWebSocketService.sendCallSignal({
        type: "answer",
        targetUsername,
        payload: answer
      });
    } else if (signal.type === "answer" && isCaller) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
    } else if (signal.type === "ice") {
      await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
    } else if (signal.type === "end") {
      handleEndCall();
    }
  });

  const handleEndCall = () => {
    chatWebSocketService.sendCallSignal({ type: "end", targetUsername });
    onClose();
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => t.enabled = !micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(t => t.enabled = !camEnabled);
      setCamEnabled(!camEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center">
      <div className="absolute top-8 text-center">
        <h2 className="text-white text-2xl font-bold">{targetUsername}</h2>
        <p className="text-gray-400 mt-2">{status}</p>
      </div>

      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-700">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="absolute bottom-12 flex items-center gap-6">
        <button 
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${micEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {micEnabled ? "🎤" : "🔇"}
        </button>
        <button 
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/20"
        >
          ☎️
        </button>
        <button 
          onClick={toggleCam}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${camEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {camEnabled ? "📷" : "🚫"}
        </button>
      </div>
    </div>
  );
}
