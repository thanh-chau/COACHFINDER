import { apiRequest } from "./client";

export interface WebRtcIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRtcIceConfig {
  iceServers: WebRtcIceServer[];
  iceTransportPolicy: RTCIceTransportPolicy;
  turnConfigured: boolean;
  expiresAt: number;
}

export async function getWebRtcIceConfig() {
  const config = await apiRequest<WebRtcIceConfig>("/api/v1/webrtc/ice-servers", {
    noCache: true,
  });

  if (!Array.isArray(config.iceServers) || config.iceServers.length === 0) {
    throw new Error("Backend khong tra ve danh sach ICE server hop le");
  }

  return {
    ...config,
    iceTransportPolicy: config.iceTransportPolicy === "relay" ? "relay" : "all",
    turnConfigured: Boolean(config.turnConfigured),
  };
}
