import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Trần Minh Châu",
    role: "Học viên Pro · Thể hình",
    initials: "TC",
    color: "bg-orange-500",
    rating: 5,
    text: "CoachFinder đã giúp tôi tìm được HLV hoàn hảo sau 3 năm loay hoay tự tập. Trong 4 tháng, tôi giảm 12kg và cơ bắp rõ ràng hơn hẳn. HLV Tuấn cực kỳ tận tâm và chuyên nghiệp!",
    detail: "Giảm 12kg trong 4 tháng",
  },
  {
    id: 2,
    name: "Nguyễn Phương Linh",
    role: "Học viên Premium · Yoga",
    initials: "NL",
    color: "bg-purple-500",
    rating: 5,
    text: "Tôi đăng ký gói Premium và không hối hận chút nào. Kế hoạch dinh dưỡng cá nhân hóa kết hợp với yoga đã cải thiện sức khỏe của tôi đáng kể. HLV online 1-1 rất tiện lợi!",
    detail: "Cải thiện sức khỏe toàn diện",
  },
  {
    id: 3,
    name: "Lê Hồng Quân",
    role: "Học viên Free · Bóng đá",
    initials: "LQ",
    color: "bg-green-500",
    rating: 5,
    text: "Tôi bắt đầu với gói Free để thử. Sau buổi tập thử với HLV bóng đá, tôi ngay lập tức nâng cấp lên Pro. Giao diện app dễ dùng, đặt lịch chỉ mất 2 phút!",
    detail: "Cải thiện kỹ thuật bóng đá",
  },
  {
    id: 4,
    name: "Võ Thị Thu Thảo",
    role: "Học viên Premium · Chạy bộ",
    initials: "VT",
    color: "bg-blue-500",
    rating: 5,
    text: "Nhờ CoachFinder, tôi hoàn thành marathon đầu tiên sau 6 tháng tập luyện có kế hoạch. HLV Bảo theo dõi từng buổi chạy và điều chỉnh kế hoạch linh hoạt. Xuất sắc!",
    detail: "Hoàn thành marathon đầu tiên",
  },
  {
    id: 5,
    name: "Đặng Văn Khoa",
    role: "Học viên Pro · Quyền anh",
    initials: "ĐK",
    color: "bg-red-500",
    rating: 5,
    text: "Tìm HLV quyền anh ở Đà Nẵng khó lắm, nhưng CoachFinder có ngay 15+ lựa chọn. HLV của tôi tận nơi ở Đà Nẵng, lịch linh hoạt. Đặt lịch trực tiếp qua app rất nhanh.",
    detail: "Thi đấu cấp tỉnh sau 8 tháng",
  },
  {
    id: 6,
    name: "Bùi Khánh Huyền",
    role: "Học viên Premium · Bơi lội",
    initials: "BH",
    color: "bg-cyan-500",
    rating: 5,
    text: "Con tôi từ sợ nước giờ đã bơi được 25m nhờ HLV bơi lội trên CoachFinder. HLV rất kiên nhẫn với trẻ em. Gói Premium còn có phân tích kỹ thuật video rất hay!",
    detail: "Con từ sợ nước → bơi 25m",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-orange-400" style={{ fontSize: "0.85rem", fontWeight: 600 }}>💬 Câu chuyện thành công</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2 }} className="text-white mb-4">
            Học Viên Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Hơn 50,000 học viên đã thay đổi cuộc sống nhờ CoachFinder.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-orange-500/30 group"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-orange-500/30 mb-4 group-hover:text-orange-500/50 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400" fill="#fbbf24" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 mb-5" style={{ fontSize: "0.875rem", lineHeight: 1.75 }}>
                "{t.text}"
              </p>

              {/* Result badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-5">
                <span className="text-green-400" style={{ fontSize: "0.7rem" }}>✓</span>
                <span className="text-green-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{t.detail}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }} className="text-white">{t.initials}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-white">{t.name}</div>
                  <div style={{ fontSize: "0.75rem" }} className="text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
