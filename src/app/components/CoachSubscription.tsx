import { useState } from "react";
import {
  Check, X, Zap, Crown, Star, Award, ArrowRight,
  Users, Video, BarChart2, MessageCircle,
  Shield, Headphones, Globe, ChevronDown, ChevronUp,
  CheckCircle2, Sparkles, Gift
} from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Gói Thường",
    tagline: "Phù hợp cho HLV mới tham gia nền tảng.",
    price: 0,
    yearlyPrice: 0,
    priceNote: "Miễn phí",
    color: "gray",
    gradient: "from-gray-600 to-gray-700",
    gradientLight: "from-gray-50 to-slate-50",
    border: "border-gray-200",
    badge: null,
    accentColor: "text-gray-600",
    accentBg: "bg-gray-100",
    btnClass: "bg-gray-900 hover:bg-gray-800 text-white",
    iconColor: "text-gray-500",
    features: [
      { label: "Tạo hồ sơ HLV", included: true },
      { label: "Đăng thông tin cá nhân, kinh nghiệm, môn dạy", included: true },
      { label: "Nhận booking từ học viên", included: true },
      { label: "Quản lý lịch dạy cơ bản", included: true },
      { label: "Quản lý danh sách học viên cơ bản", included: true },
      { label: "Xem đánh giá từ học viên", included: true },
      { label: "Upload video 360° không giới hạn", included: false },
      { label: "Công cụ quản lý học viên nâng cao", included: false },
      { label: "Theo dõi tiến bộ của học viên", included: false },
      { label: "Xem thống kê lượt xem hồ sơ, lượt booking", included: false },
      { label: "Ưu tiên hiển thị trong kết quả tìm kiếm", included: false },
      { label: "Dashboard doanh thu và hiệu suất", included: false },
    ],
  },
  {
    id: "pro",
    name: "Gói Pro",
    tagline: "Phù hợp cho HLV muốn tăng độ chuyên nghiệp và thu hút thêm học viên.",
    price: 200000,
    yearlyPrice: 160000,
    priceNote: "/ tháng",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
    gradientLight: "from-blue-50 to-indigo-50",
    border: "border-blue-300",
    badge: "Đang dùng",
    accentColor: "text-blue-600",
    accentBg: "bg-blue-100",
    btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
    iconColor: "text-blue-500",
    features: [
      { label: "Bao gồm toàn bộ quyền lợi gói thường", included: true },
      { label: "Hồ sơ nổi bật hơn trên nền tảng", included: true },
      { label: "Upload video 360° không giới hạn", included: true },
      { label: "Công cụ quản lý học viên tốt hơn", included: true },
      { label: "Theo dõi tiến bộ của học viên", included: true },
      { label: "Xem thống kê lượt xem hồ sơ, lượt booking", included: true },
      { label: "Hỗ trợ xây dựng hình ảnh chuyên nghiệp", included: true },
      { label: "Ưu tiên hiển thị trong kết quả tìm kiếm", included: false },
      { label: "Gắn nhãn HLV nổi bật / xác minh", included: false },
      { label: "Dashboard doanh thu và hiệu suất chi tiết", included: false },
      { label: "Quản lý lịch dạy và nhắc lịch tự động", included: false },
      { label: "Hỗ trợ thương hiệu cá nhân nâng cao", included: false },
    ],
  },
  {
    id: "elite",
    name: "Gói Premium",
    tagline: "Phù hợp cho HLV muốn tối đa hóa doanh thu và thương hiệu cá nhân.",
    price: 400000,
    yearlyPrice: 320000,
    priceNote: "/ tháng",
    color: "purple",
    gradient: "from-violet-500 to-purple-600",
    gradientLight: "from-violet-50 to-purple-50",
    border: "border-violet-300",
    badge: "Đề xuất",
    accentColor: "text-violet-600",
    accentBg: "bg-violet-100",
    btnClass: "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200",
    iconColor: "text-violet-500",
    features: [
      { label: "Bao gồm toàn bộ quyền lợi gói Pro", included: true },
      { label: "Ưu tiên hiển thị cao hơn trong kết quả tìm kiếm", included: true },
      { label: "Gắn nhãn HLV nổi bật / xác minh", included: true },
      { label: "Dashboard doanh thu và hiệu suất chi tiết", included: true },
      { label: "Quản lý học viên nâng cao", included: true },
      { label: "Quản lý lịch dạy và nhắc lịch tự động", included: true },
      { label: "Ưu tiên tiếp cận học viên tiềm năng", included: true },
      { label: "Hỗ trợ thương hiệu cá nhân trên nền tảng ở mức cao hơn", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Tôi có thể nâng/hạ cấp gói bất kỳ lúc nào không?",
    a: "Có! Bạn có thể nâng cấp ngay lập tức và hưởng quyền lợi mới. Khi hạ cấp, gói hiện tại vẫn có hiệu lực đến hết chu kỳ thanh toán.",
  },
  {
    q: "Gói Premium có hoàn lại tiền không?",
    a: "Chúng tôi hỗ trợ hoàn tiền trong 14 ngày đầu nếu bạn không hài lòng với dịch vụ. Liên hệ đội ngũ hỗ trợ để được xử lý.",
  },
  {
    q: "Phí gói có thay đổi không?",
    a: "Giá được khoá trong chu kỳ thanh toán của bạn. Nếu có thay đổi giá, chúng tôi thông báo trước ít nhất 30 ngày.",
  },
  {
    q: "Nhãn HLV nổi bật/xác minh có ý nghĩa gì?",
    a: "Nhãn này giúp học viên nhận ra bạn là HLV đã được nền tảng xác minh và có chất lượng cao, tăng độ tin cậy và tỉ lệ booking.",
  },
];

export function CoachSubscription() {
  const currentPlan = "pro";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [yearly, setYearly] = useState(false);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: 120 + i * 40, height: 120 + i * 40, top: -30 + i * 10, right: -40 + i * 15, opacity: 0.08 - i * 0.01 }} />
          ))}
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-blue-400" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-blue-300 uppercase tracking-wider">Gói đăng ký HLV</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.4rem" }} className="mb-1">
              Chọn gói phù hợp với bạn
            </div>
            <p style={{ fontSize: "0.85rem" }} className="text-gray-300">
              Nâng cấp gói để mở khoá thêm tính năng và tăng cơ hội tiếp cận học viên
            </p>
          </div>
          {/* Current plan badge */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl px-5 py-4 shrink-0">
            <div style={{ fontSize: "0.72rem" }} className="text-blue-300 mb-1">Gói hiện tại</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> Gói Pro
            </div>
            <div style={{ fontSize: "0.75rem" }} className="text-blue-200 mt-1">{yearly ? "160.000đ / tháng" : "200.000đ / tháng"}</div>
          </div>
        </div>
      </div>

      {/* Yearly toggle */}
      <div className="flex items-center justify-center gap-3">
        <span style={{ fontWeight: yearly ? 400 : 600, fontSize: "0.9rem" }} className={yearly ? "text-gray-400" : "text-gray-800"}>
          Theo tháng
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${yearly ? "translate-x-8" : "translate-x-1"}`} />
        </button>
        <span style={{ fontWeight: yearly ? 600 : 400, fontSize: "0.9rem" }} className={yearly ? "text-gray-800" : "text-gray-400"}>
          Theo năm
        </span>
        {yearly && (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
            <Gift className="w-3 h-3" /> Tiết kiệm 20%
          </span>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isElite = plan.id === "elite";
          const displayPrice = yearly ? plan.yearlyPrice : plan.price;

          return (
            <div key={plan.id} className={`relative bg-white rounded-2xl border-2 ${isCurrent ? plan.border : "border-gray-100"} shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg`}>

              {/* Top accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${plan.gradient}`} />

              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full ${isCurrent ? "bg-blue-500 text-white" : "bg-gradient-to-r from-violet-500 to-purple-600 text-white"}`}
                  style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                  {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  {plan.badge}
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col">

                {/* Plan header */}
                <div className="mb-5">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${plan.accentBg} mb-3`}>
                    {plan.id === "starter" && <Star className={`w-3.5 h-3.5 ${plan.accentColor}`} />}
                    {plan.id === "pro" && <Zap className={`w-3.5 h-3.5 ${plan.accentColor}`} />}
                    {plan.id === "elite" && <Crown className={`w-3.5 h-3.5 ${plan.accentColor}`} />}
                    <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className={plan.accentColor}>{plan.name}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem" }} className="text-gray-500 mb-3">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    {displayPrice === 0 ? (
                      <span style={{ fontWeight: 900, fontSize: "1.8rem", lineHeight: 1 }} className="text-gray-900">Miễn phí</span>
                    ) : (
                      <>
                        <span style={{ fontWeight: 900, fontSize: "1.7rem", lineHeight: 1 }} className="text-gray-900">
                          {(displayPrice / 1000).toFixed(0)}K
                        </span>
                        <span style={{ fontSize: "0.8rem" }} className="text-gray-400">đ/ tháng</span>
                      </>
                    )}
                  </div>
                  {yearly && displayPrice > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ fontSize: "0.72rem" }} className="text-gray-400 line-through">
                        {(plan.price / 1000).toFixed(0)}Kđ/tháng
                      </span>
                      <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full" style={{ fontSize: "0.65rem", fontWeight: 700 }}>-20%</span>
                    </div>
                  )}
                  {yearly && displayPrice > 0 && (
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">
                      Thanh toán {((displayPrice * 12) / 1000000).toFixed(displayPrice * 12 % 1000000 === 0 ? 0 : 1)}Mđ/năm
                    </div>
                  )}

                  {/* Commission highlight */}
                </div>

                {/* Features */}
                <div className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {f.included ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                      )}
                      <span style={{ fontSize: "0.8rem" }} className={f.included ? "text-gray-700" : "text-gray-400"}>{f.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <button className="w-full py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-600 cursor-default"
                    style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    ✓ Gói hiện tại
                  </button>
                ) : plan.id === "starter" ? (
                  <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    Hạ cấp
                  </button>
                ) : (
                  <button className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${plan.btnClass}`}
                    style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    {isElite ? <Crown className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    {isElite ? "Nâng lên Premium" : "Nâng cấp"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: "Bảo vệ thu nhập", desc: "Thanh toán được bảo đảm qua hệ thống escrow an toàn", color: "text-blue-500", bg: "bg-blue-50" },
          { icon: Headphones, label: "Hỗ trợ ưu tiên", desc: "Đội ngũ hỗ trợ HLV chuyên biệt, phản hồi trong 2h", color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Globe, label: "Tiếp cận rộng hơn", desc: "HLV Pro & Premium xuất hiện ưu tiên trong kết quả tìm kiếm", color: "text-violet-500", bg: "bg-violet-50" },
          { icon: BarChart2, label: "Insights chuyên sâu", desc: "AI phân tích hiệu suất và gợi ý cải thiện thu nhập", color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ icon: Icon, label, desc, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900 mb-1">{label}</div>
            <p style={{ fontSize: "0.76rem", lineHeight: 1.6 }} className="text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* What's included per tier - quick visual */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Tóm tắt quyền lợi theo gói</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-2 text-left" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", minWidth: 180 }}>Tính năng</th>
                {plans.map(p => (
                  <th key={p.id} className="py-2 text-center px-3" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                    <span className={p.accentColor}>{p.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { label: "Tạo hồ sơ & nhận booking", values: [true, true, true] },
                { label: "Quản lý lịch dạy", values: ["Cơ bản", "Nâng cao", "Tự động"] },
                { label: "Upload video 360°", values: [false, "Không giới hạn", "Không giới hạn"] },
                { label: "Hồ sơ nổi bật trên nền tảng", values: [false, true, true] },
                { label: "Theo dõi tiến bộ học viên", values: [false, true, true] },
                { label: "Thống kê lượt xem & booking", values: [false, true, true] },
                { label: "Ưu tiên hiển thị tìm kiếm", values: [false, false, true] },
                { label: "Nhãn HLV nổi bật/xác minh", values: [false, false, true] },
                { label: "Dashboard doanh thu & hiệu suất", values: [false, false, true] },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-2.5" style={{ fontSize: "0.82rem", color: "#374151" }}>{row.label}</td>
                  {row.values.map((v, vi) => (
                    <td key={vi} className="py-2.5 text-center px-3">
                      {typeof v === "boolean" ? (
                        v ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                      ) : (
                        <span style={{ fontSize: "0.82rem", fontWeight: 700 }}
                          className={vi === 0 ? "text-gray-600" : vi === 1 ? "text-blue-600" : "text-violet-600"}>
                          {v}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Câu hỏi thường gặp</div>
        </div>
        <div className="divide-y divide-gray-50">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <MessageCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-800 flex-1">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 pl-12">
                  <p style={{ fontSize: "0.83rem", lineHeight: 1.7 }} className="text-gray-500">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium upsell banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex-1">
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="mb-1">Nâng lên Gói Premium để tối đa hoá thu nhập</div>
            <p style={{ fontSize: "0.84rem" }} className="text-purple-200">
              Gói Premium <strong className="text-white">400.000đ/tháng</strong> — ưu tiên hiển thị, nhãn HLV nổi bật và dashboard doanh thu chi tiết giúp bạn thu hút nhiều học viên hơn.
            </p>
          </div>
          <button className="shrink-0 px-5 py-3 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-2"
            style={{ fontSize: "0.85rem", fontWeight: 700 }}>
            <Sparkles className="w-4 h-4" /> Nâng cấp ngay
          </button>
        </div>
      </div>
    </div>
  );
}
