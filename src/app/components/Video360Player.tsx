import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Move3d,
  FileVideo, Upload, Trash2, Maximize2, Minimize2, Info,
  Globe
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Video360PlayerProps {
  /** Optional initial file (e.g. shared from parent upload) */
  initialFile?: File | null;
}

// ─── Compass overlay ──────────────────────────────────────────────────────────
function Compass({ lon }: { lon: number }) {
  const directions = [
    { label: "N", deg: 0 },
    { label: "E", deg: 90 },
    { label: "S", deg: 180 },
    { label: "W", deg: 270 },
  ];
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="22" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {directions.map(({ label, deg }) => {
          const rad = ((deg - lon) * Math.PI) / 180;
          const x = 24 + 14 * Math.sin(rad);
          const y = 24 - 14 * Math.cos(rad);
          return (
            <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill={label === "N" ? "#f87171" : "rgba(255,255,255,0.7)"}
              fontSize="8" fontWeight="700">
              {label}
            </text>
          );
        })}
        {/* Crosshair */}
        <circle cx="24" cy="24" r="2" fill="white" opacity="0.9" />
        <line x1="24" y1="4" x2="24" y2="10" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Vui lòng chọn file video (MP4, MOV, WebM...)");
      return;
    }
    setError("");
    onFile(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      onClick={() => fileRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
        ${dragOver ? "border-violet-500 bg-violet-50/80 scale-[1.01]" : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/40 bg-gray-50"}`}
      style={{ minHeight: 340 }}
    >
      <input
        ref={fileRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />

      {/* Decorative globe */}
      <div className="relative">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all
          ${dragOver ? "bg-violet-200 shadow-lg shadow-violet-200" : "bg-gradient-to-br from-violet-100 to-indigo-100"}`}>
          <Globe className="w-12 h-12 text-violet-500" />
        </div>
        {/* Orbit rings */}
        <div className="absolute inset-0 rounded-full border-2 border-violet-300/40 scale-110 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-0 rounded-full border border-indigo-300/30 scale-125" />
        {/* Rotate icon */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
          <Move3d className="w-4 h-4 text-violet-500" />
        </div>
      </div>

      <div className="text-center px-6">
        <p style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-800 mb-1">
          {dragOver ? "Thả video vào đây!" : "Upload Video 360°"}
        </p>
        <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }} className="text-gray-500">
          Kéo & thả video định dạng equirectangular vào đây<br />
          hoặc <span className="text-violet-600 font-semibold">click để chọn file</span>
        </p>
        <p style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-1.5">
          MP4, MOV, WebM · Tối đa 2GB · Hỗ trợ 4K 360°
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex gap-2 flex-wrap justify-center px-6">
        {["🖱️ Kéo xoay góc nhìn", "📱 Hỗ trợ cảm ứng", "🔊 Audio 360°", "⚡ Realtime render"].map(t => (
          <span key={t} style={{ fontSize: "0.72rem", fontWeight: 600 }}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
            {t}
          </span>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: "0.78rem" }} className="text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// ─── Main 360° Player ─────────────────────────────────────────────────────────
export function Video360Player({ initialFile = null }: Video360PlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef(0);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const rotation = useRef({ lon: 0, lat: 0 });
  const fovRef = useRef(75);

  const [file, setFile] = useState<File | null>(initialFile);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayLon, setDisplayLon] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const controlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Init Three.js scene when file changes ─────────────────────────────────
  useEffect(() => {
    if (!file || !mountRef.current) return;

    const mount = mountRef.current;
    const url = URL.createObjectURL(file);

    // Video element
    const video = document.createElement("video");
    video.src = url;
    video.loop = true;
    video.muted = isMuted;
    video.volume = volume;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    videoRef.current = video;

    video.addEventListener("loadedmetadata", () => {
      setDuration(video.duration);
    });
    video.addEventListener("timeupdate", () => {
      setCurrentTime(video.currentTime);
    });
    video.addEventListener("ended", () => setIsPlaying(false));

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const W = mount.clientWidth || 600;
    const H = mount.clientHeight || 380;
    const camera = new THREE.PerspectiveCamera(fovRef.current, W / H, 0.1, 1000);
    camera.position.set(0, 0, 0.01);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere with video texture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1); // Flip normals so we see from inside
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lighting (subtle ambient)
    const ambient = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambient);

    // Animate
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const lat = Math.max(-85, Math.min(85, rotation.current.lat));
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(rotation.current.lon);
      const x = 500 * Math.sin(phi) * Math.cos(theta);
      const y = 500 * Math.cos(phi);
      const z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(x, y, z);
      renderer.render(scene, camera);
      setDisplayLon(Math.round(((rotation.current.lon % 360) + 360) % 360));
    };
    animate();
    rafRef.current = animId;

    // Resize
    const ro = new ResizeObserver(() => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      if (W2 > 0 && H2 > 0) {
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
        renderer.setSize(W2, H2);
      }
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      video.pause();
      video.src = "";
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // ── Sync mute/volume to video ─────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // ── FOV zoom with mouse wheel ─────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    fovRef.current = Math.max(30, Math.min(110, fovRef.current + e.deltaY * 0.05));
    cameraRef.current.fov = fovRef.current;
    cameraRef.current.updateProjectionMatrix();
  }, []);

  // ── Mouse drag ────────────────────────────────────────────────────────────
  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current = true;
    lastPointer.current = { x, y };
    setShowTip(false);
  }, []);

  const moveDrag = useCallback((x: number, y: number) => {
    if (!isDragging.current) return;
    const dx = x - lastPointer.current.x;
    const dy = y - lastPointer.current.y;
    rotation.current.lon -= dx * 0.25;
    rotation.current.lat = Math.max(-85, Math.min(85, rotation.current.lat + dy * 0.25));
    lastPointer.current = { x, y };
  }, []);

  const endDrag = useCallback(() => { isDragging.current = false; }, []);

  // ── Controls auto-hide ────────────────────────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
    controlTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // ── Play/Pause ────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) { v.pause(); setIsPlaying(false); }
    else { v.play().then(() => setIsPlaying(true)).catch(() => {}); }
  }, [isPlaying]);

  // ── Seek ──────────────────────────────────────────────────────────────────
  const seek = useCallback((t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  // ── Reset view ────────────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    rotation.current = { lon: 0, lat: 0 };
    fovRef.current = 75;
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Format time ──────────────────────────────────────────────────────────
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Upload phase ─────────────────────────────────────────────────────────
  if (!file) {
    return (
      <div className="space-y-4">
        {/* Tips row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "🎥", title: "Video Equirectangular", desc: "Định dạng 360° tiêu chuẩn (2:1 aspect ratio)" },
            { icon: "🖱️", title: "Kéo xoay tự do", desc: "Drag chuột hoặc vuốt ngón tay để nhìn xung quanh" },
            { icon: "🔍", title: "Zoom bằng cuộn chuột", desc: "Scroll để phóng to / thu nhỏ góc nhìn" },
          ].map(c => (
            <div key={c.title} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
              <span style={{ fontSize: "1.4rem" }}>{c.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.82rem" }} className="text-gray-800">{c.title}</p>
                <p style={{ fontSize: "0.74rem", lineHeight: 1.5 }} className="text-gray-500">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <UploadZone onFile={setFile} />
      </div>
    );
  }

  // ─── Player phase ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* File info bar */}
      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
          <FileVideo className="w-4 h-4 text-violet-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800 truncate">{file.name}</p>
          <p style={{ fontSize: "0.72rem" }} className="text-gray-400">
            {(file.size / 1024 / 1024).toFixed(1)} MB · {fmt(duration)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-full" style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7c3aed" }}>
            <Globe className="w-3 h-3" /> 360°
          </span>
          <button
            onClick={() => { setFile(null); setIsPlaying(false); setCurrentTime(0); rotation.current = { lon: 0, lat: 0 }; }}
            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-400 hover:text-red-500 transition-colors"
            title="Xoá video"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 360° Viewer */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black shadow-xl"
        onMouseMove={e => { moveDrag(e.clientX, e.clientY); showControlsTemporarily(); }}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={endDrag}
        onWheel={handleWheel}
        style={{
          height: isFullscreen ? "100vh" : 420,
          cursor: isDragging.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        {/* Three.js mount */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Top HUD */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)" }}>
          {/* Left: badge + compass */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
              style={{ fontSize: "0.72rem", fontWeight: 700, color: "white" }}>
              <Globe className="w-3 h-3" /> 360° LIVE
            </span>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>
              {displayLon}° · {Math.round(fovRef.current)}° FOV
            </span>
          </div>
          {/* Right: compass + fullscreen */}
          <div className="flex items-center gap-2">
            <Compass lon={displayLon} />
            <button onClick={toggleFullscreen}
              className="w-8 h-8 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Drag tip */}
        {showTip && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Move3d className="w-7 h-7 text-white" />
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                Kéo để xoay góc nhìn 360°
              </span>
            </div>
          </div>
        )}

        {/* Center click to play */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-all flex items-center justify-center border-2 border-white/40 shadow-xl">
              <Play className="w-7 h-7 text-white ml-0.5" />
            </div>
          </button>
        )}

        {/* Bottom controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
          onMouseEnter={() => { if (controlTimerRef.current) clearTimeout(controlTimerRef.current); setShowControls(true); }}
          onMouseLeave={showControlsTemporarily}
        >
          {/* Progress bar */}
          <div className="mb-3 group">
            <input
              type="range" min={0} max={duration || 1} step={0.1} value={currentTime}
              onChange={e => seek(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a78bfa ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.25) 0%)`,
                accentColor: "#a78bfa",
              }}
            />
          </div>

          {/* Control row */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Time */}
            <span style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-white/80 tabular-nums whitespace-nowrap">
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(m => !m)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                className="w-20 h-1 rounded-full appearance-none cursor-pointer hidden sm:block"
                style={{ accentColor: "#a78bfa", background: `linear-gradient(to right, #a78bfa ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) 0%)` }}
              />
            </div>

            {/* Reset view */}
            <button onClick={resetView}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              title="Reset góc nhìn">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Info */}
            <div className="group/info relative">
              <button className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-10 right-0 bg-black/80 backdrop-blur-sm text-white rounded-xl p-3 w-52 hidden group-hover/info:block"
                style={{ fontSize: "0.72rem", lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700 }} className="mb-1">🎮 Điều khiển</p>
                <p>🖱️ Kéo chuột — Xoay góc nhìn</p>
                <p>🖱️ Cuộn chuột — Zoom in/out</p>
                <p>📱 Vuốt ngón tay — Xoay (mobile)</p>
                <p>↺ Reset — Về góc nhìn ban đầu</p>
                <p className="mt-1 text-white/50">FOV: {Math.round(fovRef.current)}° · Lon: {displayLon}°</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip card */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-violet-500" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.82rem" }} className="text-violet-700 mb-0.5">Mẹo xem Video 360°</p>
          <p style={{ fontSize: "0.75rem", lineHeight: 1.65 }} className="text-violet-600">
            <strong>Scroll chuột</strong> để zoom. <strong>Kéo</strong> để quay góc nhìn.
            Dùng nút <strong>↺ Reset</strong> để trở về góc nhìn ban đầu.
            Video nên ở định dạng <strong>equirectangular 2:1</strong> (ví dụ: 4096×2048px).
          </p>
        </div>
      </div>

      {/* Change video */}
      <button
        onClick={() => { setFile(null); setIsPlaying(false); setCurrentTime(0); rotation.current = { lon: 0, lat: 0 }; }}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-all flex items-center justify-center gap-2"
        style={{ fontSize: "0.82rem", fontWeight: 600 }}
      >
        <Upload className="w-4 h-4" /> Đổi video 360° khác
      </button>
    </div>
  );
}
