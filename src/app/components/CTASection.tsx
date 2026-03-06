import { ArrowRight, Play } from "lucide-react";

const COACH_IMAGE = "https://images.unsplash.com/photo-1564282350350-a8355817fd2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBjb2FjaGluZyUyMGF0aGxldGUlMjBzcG9ydHN8ZW58MXx8fHwxNzcyNjM1NTc5fDA&ixlib=rb-4.1.0&q=80&w=1080";

const highlights = [
  { emoji: "🎯", text: "Bắt đầu với 1 buổi thử miễn phí" },
  { emoji: "🔒", text: "Thanh toán an toàn, bảo mật 100%" },
  { emoji: "📱", text: "Ứng dụng iOS & Android sắp ra mắt" },
];

export function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950">
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={COACH_IMAGE} alt="CTA background" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-900/80" />
          </div>

          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
            {/* Left content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-orange-400" style={{ fontSize: "0.85rem", fontWeight: 600 }}>🚀 Sẵn sàng bắt đầu?</span>
              </div>

              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }} className="text-white mb-5">
                Hành Trình Của Bạn{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  Bắt Đầu Hôm Nay
                </span>
              </h2>

              <p className="text-gray-400 mb-8 max-w-lg" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
                Đăng ký miễn phí ngay hôm nay. Tìm HLV phù hợp và đặt buổi tập thử trong vài phút. 
                Hàng nghìn người đã thay đổi cuộc sống của họ — đến lượt bạn!
              </p>

              {/* Highlights */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {highlights.map((h) => (
                  <div key={h.text} className="flex items-center gap-2">
                    <span style={{ fontSize: "1.1rem" }}>{h.emoji}</span>
                    <span className="text-gray-300" style={{ fontSize: "0.85rem" }}>{h.text}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5" style={{ fontWeight: 700, fontSize: "1rem" }}>
                  Đăng ký miễn phí
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 transition-all duration-200 backdrop-blur-sm" style={{ fontWeight: 600, fontSize: "1rem" }}>
                  <Play className="w-5 h-5 text-orange-400" fill="currentColor" />
                  Xem video giới thiệu
                </button>
              </div>
            </div>

            {/* Right - Stats cards */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-72">
              {[
                { label: "HLV mới tham gia", value: "+120", period: "tháng này", color: "text-orange-400" },
                { label: "Buổi tập hoàn thành", value: "98%", period: "hài lòng", color: "text-green-400" },
                { label: "Thời gian phản hồi", value: "<2h", period: "trung bình", color: "text-blue-400" },
                { label: "Hoàn tiền", value: "7 ngày", period: "bảo đảm", color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                  <div style={{ fontSize: "1.5rem", fontWeight: 800 }} className={stat.color}>{stat.value}</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-white mt-0.5">{stat.label}</div>
                  <div style={{ fontSize: "0.7rem" }} className="text-gray-500">{stat.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
