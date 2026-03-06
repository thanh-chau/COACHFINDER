import { useState } from "react";
import {
  Video, Globe, BarChart3, Upload, Star, Eye, Play,
  Settings, CheckCircle, TrendingUp, Users, Clock,
  RotateCcw, Layers, Maximize2, Film, DollarSign
} from "lucide-react";

const VIDEO360_IMG = "https://images.unsplash.com/photo-1764431568957-0d422d83d6ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzNjAlMjBjYW1lcmElMjB2aWRlbyUyMHJlY29yZGluZyUyMHNwb3J0JTIwYWN0aW9ufGVufDF8fHx8MTc3MjYzNjA4Mnww&ixlib=rb-4.1.0&q=80&w=1080";
const COACH_IMG = "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZml0bmVzcyUyMGNvYWNoJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNjM1NTg1fDA&ixlib=rb-4.1.0&q=80&w=1080";

const recentVideos = [
  { title: "Squat chuẩn kỹ thuật 360°", views: 1420, likes: 87, duration: "4:32", tag: "360°", color: "bg-orange-500" },
  { title: "Deadlift form guide", views: 980, likes: 64, duration: "6:18", tag: "Tutorial", color: "bg-blue-500" },
  { title: "Warmup routine full body", views: 2310, likes: 156, duration: "8:45", tag: "360°", color: "bg-purple-500" },
  { title: "Progressive overload tips", views: 670, likes: 41, duration: "3:22", tag: "Tips", color: "bg-green-500" },
];

const statsData = [
  { label: "Học viên active", value: "156", change: "+12 tháng này", icon: Users, color: "text-blue-400" },
  { label: "Lượt xem video", value: "24.8K", change: "+34% so với tháng trước", icon: Eye, color: "text-purple-400" },
  { label: "Thu nhập tháng này", value: "12.4M đ", change: "+18% so với tháng trước", icon: DollarSign, color: "text-green-400" },
  { label: "Đánh giá trung bình", value: "4.9★", change: "Từ 312 đánh giá", icon: Star, color: "text-amber-400" },
];

const coachFeatures = [
  {
    icon: RotateCcw,
    title: "Upload video 360°",
    desc: "Hỗ trợ camera 360° chuyên dụng (GoPro Max, Insta360, Ricoh Theta). Học viên xem từ mọi góc độ để học kỹ thuật chuẩn nhất.",
    tag: "Pro & Premium",
    tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    icon: Layers,
    title: "Annotation & Chú thích",
    desc: "Thêm chú thích, mũi tên và điểm nhấn trực tiếp lên video 360° để hướng dẫn học viên rõ ràng hơn.",
    tag: "Pro & Premium",
    tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics chi tiết",
    desc: "Theo dõi ai xem video của bạn, thời gian xem, điểm drop-off. Tối ưu nội dung dựa trên dữ liệu thực.",
    tag: "Premium",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    icon: Globe,
    title: "Thư viện công khai",
    desc: "Xây dựng thư viện video coaching cá nhân. Học viên tiềm năng xem trước để tin tưởng và đặt lịch với bạn.",
    tag: "Tất cả gói",
    tagColor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
];

export function CoachStudio() {
  const [activeNav, setActiveNav] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploading(false), 800);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 250);
  };

  const navItems = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "videos", label: "Video của tôi", icon: Film },
    { id: "students", label: "Học viên", icon: Users },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-5">
            <Video className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Dành cho Huấn Luyện Viên
            </span>
          </div>
          <h2
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, lineHeight: 1.2 }}
            className="text-gray-900 mb-5"
          >
            Studio Coach 360° —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Xây Dựng Thương Hiệu Cá Nhân
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.75 }}>
            Tạo thư viện video coaching chuyên nghiệp với công nghệ 360°. Thu hút học viên,
            tăng doanh thu và xây dựng thương hiệu HLV số một trong môn của bạn.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-16">
          {/* Dashboard topbar */}
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={COACH_IMG} alt="Coach" className="w-9 h-9 rounded-xl object-cover border-2 border-orange-500/40" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-white">Nguyễn Minh Tuấn</div>
                <div style={{ fontSize: "0.7rem" }} className="text-gray-400">HLV Thể hình · Premium Coach</div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                <span className="text-amber-400" style={{ fontSize: "0.7rem" }}>👑 Premium</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                style={{ fontSize: "0.82rem", fontWeight: 600 }}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Đang upload..." : "Upload video 360°"}
              </button>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="border-b border-gray-100 px-6 flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all ${
                    activeNav === item.id
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                  style={{ fontSize: "0.85rem", fontWeight: activeNav === item.id ? 600 : 400 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsData.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: "0.75rem" }} className="text-gray-500">{s.label}</span>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800 }} className="text-gray-900">{s.value}</div>
                    <div style={{ fontSize: "0.72rem" }} className="text-green-500 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {s.change}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Video list */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-800">
                    Video gần đây
                  </h4>
                  <button className="text-orange-500 hover:text-orange-600 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Xem tất cả →
                  </button>
                </div>

                <div className="space-y-3">
                  {recentVideos.map((v) => (
                    <div key={v.title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img src={VIDEO360_IMG} alt={v.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-orange-500/80 transition-colors">
                            <Play className="w-3 h-3 text-white" fill="white" />
                          </div>
                        </div>
                        <div className={`absolute top-1 right-1 ${v.color} text-white px-1.5 py-0.5 rounded`} style={{ fontSize: "0.55rem", fontWeight: 700 }}>
                          {v.tag}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-800 truncate">{v.title}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Eye className="w-3 h-3" />
                            <span style={{ fontSize: "0.72rem" }}>{v.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Star className="w-3 h-3" />
                            <span style={{ fontSize: "0.72rem" }}>{v.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span style={{ fontSize: "0.72rem" }}>{v.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload 360 panel */}
              <div className="lg:col-span-2">
                <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-800 mb-4">
                  Upload Video 360°
                </h4>

                {/* 360 preview mockup */}
                <div
                  className={`relative rounded-2xl overflow-hidden aspect-video mb-3 border-2 transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? "border-orange-400 bg-orange-50"
                      : "border-dashed border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(); }}
                  onClick={handleUpload}
                >
                  <img src={VIDEO360_IMG} alt="360 preview" className="w-full h-full object-cover opacity-25" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
                      <RotateCcw className="w-7 h-7 text-orange-400" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-700">
                      Kéo thả video 360° vào đây
                    </div>
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400">
                      .mp4 · Equirectangular hoặc fisheye
                    </div>
                  </div>

                  {/* 360 compass indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 rounded-full px-2 py-1">
                    <Globe className="w-3 h-3 text-blue-500" />
                    <span style={{ fontSize: "0.65rem", fontWeight: 600 }} className="text-blue-600">360°</span>
                  </div>
                </div>

                {/* Upload progress */}
                {uploading && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }} className="text-orange-700">
                        Đang xử lý video 360°...
                      </span>
                      <span style={{ fontSize: "0.8rem" }} className="text-orange-500">{Math.min(Math.round(uploadProgress), 100)}%</span>
                    </div>
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                      />
                    </div>
                    <div style={{ fontSize: "0.72rem" }} className="text-orange-400 mt-1.5">
                      Chuyển đổi định dạng equirectangular...
                    </div>
                  </div>
                )}

                {!uploading && uploadProgress >= 100 && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span style={{ fontSize: "0.8rem" }} className="text-green-700">Video 360° đã upload thành công!</span>
                  </div>
                )}

                {/* Settings mini */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                  {[
                    { label: "Chất lượng xuất", value: "4K 360°" },
                    { label: "Chế độ xem", value: "Equirectangular" },
                    { label: "Quyền xem", value: "Học viên của tôi" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span style={{ fontSize: "0.78rem" }} className="text-gray-500">{s.label}</span>
                      <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2.5 py-1">
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-700">{s.value}</span>
                        <Maximize2 className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coach feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coachFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-6 h-6 text-blue-500" />
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-2">{f.title}</div>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }} className="text-gray-500 mb-3">{f.desc}</p>
                <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${f.tagColor}`} style={{ fontWeight: 600, fontSize: "0.72rem" }}>
                  {f.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
