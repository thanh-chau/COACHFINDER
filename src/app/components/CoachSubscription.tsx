import { useState } from "react";
import {
  Check, X, Zap, Crown, Star, Award, ArrowRight,
  TrendingUp, Users, Video, BarChart2, MessageCircle,
  Shield, Headphones, Globe, ChevronDown, ChevronUp,
  DollarSign, Percent, AlertCircle, CheckCircle2, Sparkles
} from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Khởi đầu hành trình",
    price: 0,
    priceNote: "Miễn phí",
    commission: 20,
    commissionLabel: "Hoa hồng nền tảng",
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
      { label: "Tối đa 10 học viên", included: true },
      { label: "Lịch dạy cơ bản", included: true },
      { label: "Tin nhắn với học viên", included: true },
      { label: "5 video upload / tháng", included: true },
      { label: "Analytics cơ bản", included: true },
      { label: "Hỗ trợ qua email", included: true },
      { label: "Video 360° Studio", included: false },
      { label: "Analytics nâng cao (AI)", included: false },
      { label: "Hỗ trợ ưu tiên", included: false },
      { label: "Gói học viên tuỳ chỉnh", included: false },
      { label: "Xuất hiện nổi bật trong tìm kiếm", included: false },
      { label: "Custom branding & trang cá nhân", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Coach",
    tagline: "Chuyên nghiệp & hiệu quả",
    price: 499000,
    priceNote: "/ tháng",
    commission: 12,
    commissionLabel: "Hoa hồng nền tảng",
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
      { label: "Tối đa 50 học viên", included: true },
      { label: "Lịch dạy nâng cao", included: true },
      { label: "Tin nhắn với học viên", included: true },
      { label: "Video upload không giới hạn", included: true },
      { label: "Analytics cơ bản", included: true },
      { label: "Hỗ trợ ưu tiên (24h)", included: true },
      { label: "Video 360° Studio", included: true },
      { label: "Analytics nâng cao (AI)", included: true },
      { label: "Gói học viên tuỳ chỉnh", included: true },
      { label: "Xuất hiện nổi bật trong tìm kiếm", included: false },
      { label: "Custom branding & trang cá nhân", included: false },
      { label: "Hoa hồng 0% (không tính phí nền tảng)", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite Coach",
    tagline: "Đỉnh cao · Không giới hạn",
    price: 1490000,
    priceNote: "/ tháng",
    commission: 0,
    commissionLabel: "Hoa hồng nền tảng",
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
      { label: "Học viên không giới hạn", included: true },
      { label: "Lịch dạy nâng cao", included: true },
      { label: "Tin nhắn với học viên", included: true },
      { label: "Video upload không giới hạn", included: true },
      { label: "Analytics cơ bản", included: true },
      { label: "Hỗ trợ riêng 24/7", included: true },
      { label: "Video 360° Studio", included: true },
      { label: "Analytics nâng cao (AI)", included: true },
      { label: "Gói học viên tuỳ chỉnh", included: true },
      { label: "Xuất hiện nổi bật trong tìm kiếm", included: true },
      { label: "Custom branding & trang cá nhân", included: true },
      { label: "Hoa hồng 0% (không tính phí nền tảng)", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Hoa hồng nền tảng được tính như thế nào?",
    a: "CoachFinder trừ % hoa hồng trực tiếp từ mỗi giao dịch học viên thanh toán cho bạn. Ví dụ: học viên trả 500.000đ, với gói Starter (20%) bạn nhận 400.000đ; với Elite Coach (0%) bạn nhận đủ 500.000đ.",
  },
  {
    q: "Tôi có thể nâng/hạ cấp gói bất kỳ lúc nào không?",
    a: "Có! Bạn có thể nâng cấp ngay lập tức và hưởng quyền lợi mới. Khi hạ cấp, gói hiện tại vẫn có hiệu lực đến hết chu kỳ thanh toán.",
  },
  {
    q: "Gói Elite Coach có hoàn lại tiền không?",
    a: "Chúng tôi hỗ trợ hoàn tiền trong 14 ngày đầu nếu bạn không hài lòng với dịch vụ. Liên hệ đội ngũ hỗ trợ để được xử lý.",
  },
  {
    q: "Phí gói có thay đổi không?",
    a: "Giá được khoá trong chu kỳ thanh toán của bạn. Nếu có thay đổi giá, chúng tôi thông báo trước ít nhất 30 ngày.",
  },
];

const commissionComparison = [
  { revenue: 5000000, starter: 4000000, pro: 4400000, elite: 5000000 },
  { revenue: 10000000, starter: 8000000, pro: 8800000, elite: 10000000 },
  { revenue: 20000000, starter: 16000000, pro: 17600000, elite: 20000000 },
  { revenue: 50000000, starter: 40000000, pro: 44000000, elite: 50000000 },
];

function formatVND(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(0) + "M";
  return (n / 1000).toFixed(0) + "K";
}

export function CoachSubscription() {
  const currentPlan = "pro";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

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
              Gói càng cao → hoa hồng càng thấp → thu nhập ròng càng nhiều hơn
            </p>
          </div>
          {/* Current plan badge */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl px-5 py-4 shrink-0">
            <div style={{ fontSize: "0.72rem" }} className="text-blue-300 mb-1">Gói hiện tại</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> Pro Coach
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Percent className="w-3 h-3 text-blue-300" />
              <span style={{ fontSize: "0.75rem" }} className="text-blue-200">Hoa hồng 12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isElite = plan.id === "elite";

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
                    {plan.price === 0 ? (
                      <span style={{ fontWeight: 900, fontSize: "1.8rem", lineHeight: 1 }} className="text-gray-900">Miễn phí</span>
                    ) : (
                      <>
                        <span style={{ fontWeight: 900, fontSize: "1.7rem", lineHeight: 1 }} className="text-gray-900">
                          {(plan.price / 1000).toFixed(0)}K
                        </span>
                        <span style={{ fontSize: "0.8rem" }} className="text-gray-400">đ{plan.priceNote}</span>
                      </>
                    )}
                  </div>

                  {/* Commission highlight */}
                  <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl ${plan.id === "elite" ? "bg-violet-50 border border-violet-200" : plan.id === "pro" ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}>
                    <DollarSign className={`w-4 h-4 ${plan.iconColor} shrink-0`} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1rem" }} className={plan.accentColor}>
                        Hoa hồng {plan.commission}%
                      </div>
                      <div style={{ fontSize: "0.68rem" }} className="text-gray-500">{plan.commissionLabel}</div>
                    </div>
                    {plan.commission === 0 && (
                      <span className="ml-auto bg-violet-500 text-white px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.6rem", fontWeight: 700 }}>0đ</span>
                    )}
                  </div>
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
                    {isElite ? "Nâng lên Elite Coach" : "Nâng cấp"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Commission comparison table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">So sánh thu nhập ròng theo gói</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Xem bạn tiết kiệm được bao nhiêu khi nâng cấp</div>
            </div>
          </div>
          {showComparison ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showComparison && (
          <div className="border-t border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>Doanh thu từ HV</th>
                  <th className="px-4 py-3 text-right" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>Starter (−20%)</th>
                  <th className="px-4 py-3 text-right" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#3b82f6" }}>Pro Coach (−12%)</th>
                  <th className="px-4 py-3 text-right" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8b5cf6" }}>Elite Coach (0%)</th>
                </tr>
              </thead>
              <tbody>
                {commissionComparison.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i === 2 ? "bg-blue-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">{formatVND(row.revenue)}đ</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-600">{formatVND(row.starter)}đ</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end">
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-blue-600">{formatVND(row.pro)}đ</span>
                        <span style={{ fontSize: "0.65rem" }} className="text-emerald-500">+{formatVND(row.pro - row.starter)}đ vs Starter</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end">
                        <span style={{ fontWeight: 800, fontSize: "0.9rem" }} className="text-violet-600">{formatVND(row.elite)}đ</span>
                        <span style={{ fontSize: "0.65rem" }} className="text-emerald-500">+{formatVND(row.elite - row.pro)}đ vs Pro</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p style={{ fontSize: "0.78rem" }} className="text-amber-700">
                Thu nhập ròng = Doanh thu từ học viên − Hoa hồng nền tảng. Chưa bao gồm phí đăng ký gói hàng tháng (nếu có).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: "Bảo vệ thu nhập", desc: "Thanh toán được bảo đảm qua hệ thống escrow an toàn", color: "text-blue-500", bg: "bg-blue-50" },
          { icon: Headphones, label: "Hỗ trợ ưu tiên", desc: "Đội ngũ hỗ trợ HLV chuyên biệt, phản hồi trong 2h", color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Globe, label: "Tiếp cận rộng hơn", desc: "HLV Pro & Elite xuất hiện ưu tiên trong kết quả tìm kiếm", color: "text-violet-500", bg: "bg-violet-50" },
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
                { label: "Số học viên", values: ["10", "50", "∞"] },
                { label: "Hoa hồng nền tảng", values: ["20%", "12%", "0%"] },
                { label: "Video upload / tháng", values: ["5", "∞", "∞"] },
                { label: "Video 360° Studio", values: [false, true, true] },
                { label: "Analytics AI", values: [false, true, true] },
                { label: "Hỗ trợ ưu tiên", values: [false, "24h", "24/7"] },
                { label: "Trang cá nhân nổi bật", values: [false, false, true] },
                { label: "Custom branding", values: [false, false, true] },
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

      {/* Elite Coach upsell banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex-1">
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="mb-1">Tiết kiệm 20% với thanh toán năm</div>
            <p style={{ fontSize: "0.84rem" }} className="text-purple-200">
              Elite Coach hàng năm chỉ còn <strong className="text-white">1,192,000đ/tháng</strong> thay vì 1,490,000đ.
              Tiết kiệm <strong className="text-yellow-300">3,576,000đ/năm</strong> + hoa hồng 0%.
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
