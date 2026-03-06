import { Search, Star, Shield, Brain } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1564282350350-a8355817fd2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBjb2FjaGluZyUyMGF0aGxldGUlMjBzcG9ydHN8ZW58MXx8fHwxNzcyNjM1NTc5fDA&ixlib=rb-4.1.0&q=80&w=1080";

const sports = ["Bóng đá", "Thể hình", "Bơi lội", "Tennis", "Yoga", "Quyền anh", "Chạy bộ", "Bóng rổ"];

const stats = [
  { value: "2,500+", label: "HLV chuyên nghiệp" },
  { value: "50,000+", label: "Học viên" },
  { value: "30+", label: "Môn thể thao" },
  { value: "4.9★", label: "Đánh giá trung bình" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-950 pt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Sports coaching"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Nền tảng huấn luyện thể thao #1 Việt Nam
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.15 }} className="text-white mb-6">
            Tìm{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              Huấn Luyện Viên
            </span>
            {" "}Phù Hợp Với Bạn
          </h1>

          <p className="text-gray-300 mb-10 max-w-xl" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            Kết nối với hàng nghìn HLV thể thao chuyên nghiệp được chứng nhận. 
            Luyện tập theo lịch của bạn, đạt mục tiêu nhanh hơn.
          </p>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex flex-col sm:flex-row gap-2 mb-8 max-w-2xl">
            <div className="flex items-center gap-3 flex-1 bg-white/5 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Bạn muốn học môn thể thao gì?"
                className="bg-transparent text-white placeholder-gray-400 outline-none flex-1"
                style={{ fontSize: "0.95rem" }}
              />
            </div>
            <div className="flex items-center gap-3 flex-1 bg-white/5 rounded-xl px-4 py-3">
              <span className="text-gray-400">📍</span>
              <input
                type="text"
                placeholder="Khu vực (TP. HCM, Hà Nội...)"
                className="bg-transparent text-white placeholder-gray-400 outline-none flex-1"
                style={{ fontSize: "0.95rem" }}
              />
            </div>
            <button
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shrink-0"
              style={{ fontWeight: 600 }}
            >
              Tìm HLV
            </button>
          </div>

          {/* Popular sports tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            <span className="text-gray-400 self-center mr-1" style={{ fontSize: "0.85rem" }}>Phổ biến:</span>
            {sports.map((sport) => (
              <button
                key={sport}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300 hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-orange-300 transition-all duration-200"
                style={{ fontSize: "0.8rem" }}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Shield, text: "HLV được xác minh" },
              { icon: Star, text: "Đánh giá thực từ học viên" },
              { icon: Brain, text: "AI phân tích động tác" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-400">
                <Icon className="w-4 h-4 text-orange-400" />
                <span style={{ fontSize: "0.85rem" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }} className="text-white">{stat.value}</div>
              <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}