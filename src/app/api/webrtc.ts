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
  return apiRequest<WebRtcIceConfig>("/api/v1/webrtc/ice-servers");
}
