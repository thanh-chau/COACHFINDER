import { Zap, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  "Dịch vụ": ["Tìm HLV", "Đặt lịch tập", "Gói dịch vụ", "Cho HLV", "API doanh nghiệp"],
  "Môn thể thao": ["Thể hình & PT", "Bóng đá", "Bơi lội", "Yoga & Pilates", "Quyền anh", "Bóng rổ"],
  "Công ty": ["Về chúng tôi", "Blog", "Tuyển dụng", "Đối tác", "Báo chí"],
  "Hỗ trợ": ["Trung tâm trợ giúp", "Điều khoản dịch vụ", "Chính sách bảo mật", "Báo cáo lỗi"],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: "1.25rem" }} className="text-white tracking-tight">
                Coach<span className="text-orange-500">Hub</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6" style={{ fontSize: "0.875rem", lineHeight: 1.75 }}>
              Nền tảng kết nối huấn luyện viên thể thao chuyên nghiệp với học viên trên toàn Việt Nam.
              Hãy bắt đầu hành trình thể thao của bạn ngay hôm nay.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-6">
              {[
                { icon: Mail, text: "support@coachfinder.vn" },
                { icon: Phone, text: "1800 9999 (Miễn phí)" },
                { icon: MapPin, text: "TP. Hồ Chí Minh, Việt Nam" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-gray-400">
                  <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                  <span style={{ fontSize: "0.82rem" }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "Youtube" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }} className="text-white uppercase mb-5">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App download banner */}
        <div className="py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-500" style={{ fontSize: "0.82rem" }}>📱 Ứng dụng sắp ra mắt:</span>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-300 hover:bg-white/10 transition-all" style={{ fontSize: "0.8rem" }}>
              <span>🍎</span> App Store
            </button>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-300 hover:bg-white/10 transition-all" style={{ fontSize: "0.8rem" }}>
              <span>🤖</span> Google Play
            </button>
          </div>
          <p className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            © 2026 CoachFinder. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
