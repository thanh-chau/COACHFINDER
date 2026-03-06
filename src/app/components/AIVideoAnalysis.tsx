import { useState, useEffect } from "react";
import {
  Upload, Play, Pause, Brain, Zap, Target, Activity,
  CheckCircle, AlertCircle, ChevronRight, Camera, RefreshCw
} from "lucide-react";

const AI_BG = "https://images.unsplash.com/photo-1585834567627-62b9392423a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwbW90aW9uJTIwYW5hbHlzaXMlMjB0ZWNobm9sb2d5JTIwc3BvcnQlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzI2MzYwODF8MA&ixlib=rb-4.1.0&q=80&w=1080";

const metrics = [
  { label: "Điểm hình thức", value: 87, color: "#f97316", bg: "bg-orange-500" },
  { label: "Cân bằng cơ thể", value: 92, color: "#22c55e", bg: "bg-green-500" },
  { label: "Biên độ chuyển động", value: 74, color: "#3b82f6", bg: "bg-blue-500" },
  { label: "Đồng bộ nhịp thở", value: 81, color: "#a855f7", bg: "bg-purple-500" },
];

const feedbacks = [
  { type: "error", icon: AlertCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", text: "Góc khuỷu tay phải lệch 12° — điều chỉnh vào trong hơn" },
  { type: "warning", icon: AlertCircle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", text: "Tốc độ thực hiện hơi nhanh ở pha hạ xuống, cần kiểm soát hơn" },
  { type: "success", icon: CheckCircle, color: "text-green-400 bg-green-500/10 border-green-500/20", text: "Tư thế lưng thẳng xuất sắc, duy trì tốt trong toàn bộ video" },
  { type: "success", icon: CheckCircle, color: "text-green-400 bg-green-500/10 border-green-500/20", text: "Căn chỉnh đầu gối và bàn chân đúng chuẩn kỹ thuật" },
];

const features = [
  { icon: Brain, title: "Nhận dạng 33 điểm khớp", desc: "AI phân tích toàn bộ bộ xương với 33 điểm khớp theo thời gian thực, độ chính xác 97%" },
  { icon: Target, title: "So sánh chuẩn kỹ thuật", desc: "Tự động so sánh động tác của bạn với cơ sở dữ liệu 10,000+ video chuẩn từ HLV hàng đầu" },
  { icon: Activity, title: "Báo cáo chi tiết tức thì", desc: "Nhận báo cáo PDF đầy đủ trong 30 giây sau khi upload video, kèm hướng dẫn cải thiện" },
  { icon: Zap, title: "Phản hồi từ AI Coach", desc: "AI Coach phân tích lỗi kỹ thuật và đề xuất bài tập khắc phục phù hợp với trình độ của bạn" },
];

// Animated skeleton joints
const joints = [
  { x: 50, y: 12, r: 5 }, // head
  { x: 50, y: 24, r: 4 }, // neck
  { x: 35, y: 28, r: 3.5 }, // l-shoulder
  { x: 65, y: 28, r: 3.5 }, // r-shoulder
  { x: 28, y: 40, r: 3 }, // l-elbow
  { x: 72, y: 40, r: 3 }, // r-elbow
  { x: 24, y: 52, r: 2.5 }, // l-wrist
  { x: 76, y: 52, r: 2.5 }, // r-wrist
  { x: 50, y: 42, r: 4 }, // hip
  { x: 42, y: 55, r: 3.5 }, // l-hip
  { x: 58, y: 55, r: 3.5 }, // r-hip
  { x: 40, y: 70, r: 3 }, // l-knee
  { x: 60, y: 70, r: 3 }, // r-knee
  { x: 38, y: 85, r: 2.5 }, // l-ankle
  { x: 62, y: 85, r: 2.5 }, // r-ankle
];

const bones = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7],
  [1, 8], [8, 9], [8, 10], [9, 11], [10, 12], [11, 13], [12, 14],
];

function SkeletonOverlay({ animated }: { animated: boolean }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 20);
    }, 60);
    return () => clearInterval(interval);
  }, [animated]);

  const wave = (x: number, y: number) => {
    if (!animated) return { x, y };
    return {
      x: x + Math.sin((y + offset) * 0.15) * 0.8,
      y: y + Math.cos((x + offset) * 0.12) * 0.5,
    };
  };

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      {bones.map(([from, to]) => {
        const a = wave(joints[from].x, joints[from].y);
        const b = wave(joints[to].x, joints[to].y);
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#f97316" strokeWidth="1" strokeOpacity="0.9"
            strokeLinecap="round"
          />
        );
      })}
      {joints.map((j, i) => {
        const p = wave(j.x, j.y);
        return (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={j.r}
            fill="#fb923c" fillOpacity="0.95"
            stroke="#fff" strokeWidth="0.5" strokeOpacity="0.7"
          />
        );
      })}
    </svg>
  );
}

export function AIVideoAnalysis() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "feedback">("analysis");

  const handleAnalyze = () => {
    setDone(false);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setDone(true);
    }, 2000);
  };

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <img src={AI_BG} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/95 to-gray-950" />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-5">
            <Brain className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              AI-Powered · Độc quyền trên CoachFinder
            </span>
          </div>
          <h2
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, lineHeight: 1.2 }}
            className="text-white mb-5"
          >
            AI Phân Tích Động Tác{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Thời Gian Thực
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.75 }}>
            Upload video luyện tập, AI sẽ phân tích toàn bộ động tác, phát hiện lỗi kỹ thuật và đưa ra
            phản hồi chi tiết chỉ trong 30 giây — như có HLV bên cạnh 24/7.
          </p>
        </div>

        {/* Main mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Left: Video player mockup */}
          <div className="relative">
            {/* Upload area */}
            <div className="bg-gray-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1">
                  <Camera className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-gray-300" style={{ fontSize: "0.75rem" }}>squat_video_001.mp4</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400" style={{ fontSize: "0.7rem" }}>LIVE ANALYSIS</span>
                </div>
              </div>

              {/* Video frame */}
              <div className="relative bg-gray-950 aspect-video overflow-hidden">
                <img
                  src={AI_BG}
                  alt="Video analysis"
                  className="w-full h-full object-cover opacity-60"
                />

                {/* Skeleton overlay */}
                <SkeletonOverlay animated={isPlaying} />

                {/* Scan lines */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(249,115,22,0.02) 3px, rgba(249,115,22,0.02) 4px)",
                  }}
                />

                {/* Corner guides */}
                {[
                  "top-3 left-3 border-t-2 border-l-2",
                  "top-3 right-3 border-t-2 border-r-2",
                  "bottom-3 left-3 border-b-2 border-l-2",
                  "bottom-3 right-3 border-b-2 border-r-2",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-6 h-6 border-orange-400/80 ${cls}`} />
                ))}

                {/* Score overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
                  <div className="text-gray-400" style={{ fontSize: "0.65rem" }}>FORM SCORE</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800 }} className="text-orange-400 leading-none">87</div>
                  <div className="text-gray-400" style={{ fontSize: "0.6rem" }}>/100</div>
                </div>

                {/* AI badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Brain className="w-3 h-3 text-white" />
                  <span className="text-white" style={{ fontSize: "0.65rem", fontWeight: 700 }}>AI ON</span>
                </div>

                {/* Error highlight box */}
                <div
                  className="absolute border-2 border-red-400/70 rounded-lg"
                  style={{ top: "28%", left: "60%", width: "18%", height: "22%", animation: "pulse 2s infinite" }}
                >
                  <div className="absolute -top-5 left-0 bg-red-500/90 text-white px-2 py-0.5 rounded-sm whitespace-nowrap" style={{ fontSize: "0.55rem" }}>
                    ⚠ Góc khuỷu tay +12°
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4">
                  <div className="w-full bg-white/20 rounded-full h-1 mb-3">
                    <div className="bg-orange-400 h-1 rounded-full" style={{ width: "62%" }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <span className="text-gray-300" style={{ fontSize: "0.72rem" }}>0:31 / 0:50</span>
                    <div className="ml-auto flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full px-2.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-blue-300" style={{ fontSize: "0.65rem" }}>Phân tích khung #154</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom tabs + analyze button */}
              <div className="p-4">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                    analyzing
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400 cursor-wait"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang phân tích AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      {done ? "Phân tích lại" : "Bắt đầu phân tích AI"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Upload drop zone */}
            <div className="mt-4 border-2 border-dashed border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                <Upload className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }} className="text-white">Upload video luyện tập của bạn</div>
                <div style={{ fontSize: "0.78rem" }} className="text-gray-500">MP4, MOV, AVI · Tối đa 500MB · Mọi góc quay</div>
              </div>
              <div className="ml-auto shrink-0 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                Chọn file
              </div>
            </div>
          </div>

          {/* Right: Analysis panel */}
          <div className="flex flex-col gap-4">
            {/* Tab switcher */}
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-1.5 flex gap-1">
              {(["analysis", "feedback"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl transition-all duration-200 ${activeTab === tab ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-gray-200"}`}
                  style={{ fontWeight: 600, fontSize: "0.85rem" }}
                >
                  {tab === "analysis" ? "📊 Chỉ số" : "💡 Phản hồi AI"}
                </button>
              ))}
            </div>

            {activeTab === "analysis" ? (
              <>
                {/* Metrics */}
                <div className="bg-gray-900 rounded-2xl border border-white/10 p-5">
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-white mb-4">
                    Chỉ số hiệu suất
                  </div>
                  <div className="space-y-4">
                    {metrics.map((m) => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "0.82rem" }} className="text-gray-300">{m.label}</span>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700 }} className="text-white">{m.value}/100</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.bg} transition-all duration-1000`}
                            style={{ width: `${m.value}%`, opacity: 0.9 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall score */}
                <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-5 flex items-center gap-5">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="#f97316" strokeWidth="3"
                        strokeDasharray={`${87 * 1.005} ${100 - 87 * 1.005}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span style={{ fontSize: "1.4rem", fontWeight: 800 }} className="text-orange-400 leading-none">87</span>
                      <span style={{ fontSize: "0.55rem" }} className="text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }} className="text-white mb-1">Điểm tổng thể: Tốt</div>
                    <div style={{ fontSize: "0.8rem", lineHeight: 1.6 }} className="text-gray-400">
                      Động tác của bạn đạt chất lượng tốt. Cần cải thiện thêm góc khuỷu tay và tốc độ xuống để đạt điểm Xuất sắc.
                    </div>
                  </div>
                </div>

                {/* Frame analysis */}
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-white mb-3">Phân tích theo khung hình</div>
                  <div className="grid grid-cols-5 gap-2">
                    {[92, 88, 75, 87, 91, 83, 89, 78, 90, 85].map((score, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="h-12 rounded-lg mb-1.5 relative overflow-hidden"
                          style={{ background: `rgba(249,115,22,${score / 200})` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-orange-500/60 rounded-b-lg"
                            style={{ height: `${score}%` }}
                          />
                        </div>
                        <span style={{ fontSize: "0.65rem" }} className="text-gray-500">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {feedbacks.map((fb, i) => {
                  const Icon = fb.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${fb.color}`}>
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${fb.color.split(" ")[0]}`} />
                      <p style={{ fontSize: "0.85rem", lineHeight: 1.65 }} className="text-gray-200">{fb.text}</p>
                    </div>
                  );
                })}

                {/* Suggested exercise */}
                <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-blue-300 mb-2">
                    💪 Bài tập AI đề xuất để cải thiện
                  </div>
                  {["Band Pull-Apart (3x15)", "Face Pull (3x12)", "Wall Angels (2x10)"].map((ex) => (
                    <div key={ex} className="flex items-center gap-2 py-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span style={{ fontSize: "0.82rem" }} className="text-gray-300">{ex}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 border border-orange-500/30 rounded-xl text-orange-400 hover:bg-orange-500/10 transition-colors" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Chia sẻ báo cáo với HLV →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/6 hover:border-orange-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white mb-2">{f.title}</div>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }} className="text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Plan tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800 border border-white/10 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-400" style={{ fontSize: "0.8rem" }}>Free: 3 video phân tích/tháng</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300" style={{ fontSize: "0.8rem" }}>Pro: 30 video/tháng + báo cáo PDF</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
            <span className="text-amber-400" style={{ fontSize: "0.8rem" }}>👑 Premium: Không giới hạn + AI Coach 1-1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
