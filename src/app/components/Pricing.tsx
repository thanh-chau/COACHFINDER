import { useState } from "react";
import { Check, X, Zap, Crown, Star, Users, Video, BarChart3, Shield, Dumbbell, Globe } from "lucide-react";

// ─── LEARNER PLANS ───────────────────────────────────────────────────────────
const learnerPlans = [
  {
    id: "free",
    name: "Free",
    tagline: "Khởi đầu hành trình",
    icon: Star,
    iconColor: "text-gray-500",
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "from-gray-100 to-slate-100",
    border: "border-gray-200",
    badge: null,
    highlight: false,
    btnStyle: "bg-gray-900 text-white hover:bg-gray-800",
    features: [
      { text: "Tìm kiếm HLV cơ bản", ok: true },
      { text: "Xem 5 hồ sơ HLV/tháng", ok: true },
      { text: "Nhắn tin giới hạn (3 tin/ngày)", ok: true },
      { text: "Đặt lịch 1 buổi thử miễn phí", ok: true },
      { text: "3 lần phân tích AI/tháng", ok: true },
      { text: "Xem video 360° công khai", ok: true },
      { text: "Báo cáo AI PDF chi tiết", ok: false },
      { text: "30 lần phân tích AI/tháng", ok: false },
      { text: "AI Coach 1-1 không giới hạn", ok: false },
      { text: "Kế hoạch dinh dưỡng AI", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Dành cho người nghiêm túc",
    icon: Zap,
    iconColor: "text-orange-500",
    monthlyPrice: 199000,
    yearlyPrice: 149000,
    color: "from-orange-50 to-red-50",
    border: "border-orange-300",
    badge: "Phổ biến nhất",
    highlight: true,
    btnStyle: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-200",
    features: [
      { text: "Tìm kiếm & nhắn tin không giới hạn", ok: true },
      { text: "Xem không giới hạn hồ sơ HLV", ok: true },
      { text: "Đặt lịch không giới hạn", ok: true },
      { text: "30 lần phân tích AI/tháng", ok: true },
      { text: "Báo cáo AI PDF + biểu đồ", ok: true },
      { text: "Xem & upload video 360°", ok: true },
      { text: "Theo dõi tiến độ nâng cao", ok: true },
      { text: "Hỗ trợ email trong giờ hành chính", ok: true },
      { text: "AI Coach 1-1 không giới hạn", ok: false },
      { text: "Kế hoạch dinh dưỡng AI cá nhân hóa", ok: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Trải nghiệm đỉnh cao",
    icon: Crown,
    iconColor: "text-amber-500",
    monthlyPrice: 499000,
    yearlyPrice: 379000,
    color: "from-amber-50 to-yellow-50",
    border: "border-amber-300",
    badge: "Toàn diện nhất",
    highlight: false,
    btnStyle: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-200",
    features: [
      { text: "Tất cả tính năng Pro", ok: true },
      { text: "Phân tích AI không giới hạn", ok: true },
      { text: "AI Coach 1-1 không giới hạn", ok: true },
      { text: "Upload video 360° không giới hạn", ok: true },
      { text: "Annotation & chú thích video 360°", ok: true },
      { text: "Kế hoạch dinh dưỡng AI cá nhân hóa", ok: true },
      { text: "Analytics dashboard nâng cao", ok: true },
      { text: "Hỗ trợ ưu tiên 24/7 (chat + gọi)", ok: true },
      { text: "Giảm giá 20% mọi buổi tập", ok: true },
      { text: "Báo cáo sức khỏe hàng tháng", ok: true },
    ],
  },
];

// ─── COACH PLANS ─────────────────────────────────────────────────────────────
const coachPlans = [
  {
    id: "coach-starter",
    name: "Starter",
    tagline: "Bắt đầu sự nghiệp HLV",
    icon: Dumbbell,
    iconColor: "text-green-500",
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "from-green-50 to-emerald-50",
    border: "border-green-200",
    badge: null,
    highlight: false,
    btnStyle: "bg-gray-900 text-white hover:bg-gray-800",
    commission: "20% hoa hồng/giao dịch",
    features: [
      { text: "Trang hồ sơ HLV cơ bản", ok: true },
      { text: "Nhận tối đa 10 học viên", ok: true },
      { text: "Đăng tối đa 3 video giới thiệu", ok: true },
      { text: "Chat với học viên", ok: true },
      { text: "Lịch đặt buổi tập online", ok: true },
      { text: "Thanh toán qua CoachFinder", ok: true },
      { text: "Upload video 360°", ok: false },
      { text: "Dashboard analytics nâng cao", ok: false },
      { text: "Huy hiệu \"Verified Pro\"", ok: false },
      { text: "Ưu tiên hiển thị tìm kiếm", ok: false },
    ],
  },
  {
    id: "coach-pro",
    name: "Pro Coach",
    tagline: "Mở rộng & phát triển",
    icon: BarChart3,
    iconColor: "text-blue-500",
    monthlyPrice: 299000,
    yearlyPrice: 229000,
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-300",
    badge: "Được chọn nhiều nhất",
    highlight: true,
    btnStyle: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200",
    commission: "12% hoa hồng/giao dịch",
    features: [
      { text: "Không giới hạn học viên", ok: true },
      { text: "Upload không giới hạn video", ok: true },
      { text: "Upload & phát video 360°", ok: true },
      { text: "Annotation video chuyên nghiệp", ok: true },
      { text: "Dashboard analytics học viên", ok: true },
      { text: "Huy hiệu \"Verified Pro\" nổi bật", ok: true },
      { text: "Hiển thị ưu tiên trong tìm kiếm", ok: true },
      { text: "Kế hoạch tập luyện tùy chỉnh", ok: true },
      { text: "AI hỗ trợ xây dựng giáo án", ok: false },
      { text: "Hoa hồng 0% (gói Elite)", ok: false },
    ],
  },
  {
    id: "coach-elite",
    name: "Elite Coach",
    tagline: "Dành cho HLV hàng đầu",
    icon: Globe,
    iconColor: "text-purple-500",
    monthlyPrice: 699000,
    yearlyPrice: 529000,
    color: "from-purple-50 to-violet-50",
    border: "border-purple-300",
    badge: "Tối thượng",
    highlight: false,
    btnStyle: "bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-200",
    commission: "0% hoa hồng",
    features: [
      { text: "Tất cả tính năng Pro Coach", ok: true },
      { text: "Hoa hồng 0% — giữ 100% doanh thu", ok: true },
      { text: "AI hỗ trợ xây dựng giáo án tự động", ok: true },
      { text: "Phân tích video 360° học viên bằng AI", ok: true },
      { text: "Trang profile riêng (custom URL)", ok: true },
      { text: "Tích hợp thanh toán quốc tế", ok: true },
      { text: "Hỗ trợ account manager riêng", ok: true },
      { text: "Ưu tiên #1 trong tất cả tìm kiếm", ok: true },
      { text: "Badge \"Elite\" độc quyền", ok: true },
      { text: "Báo cáo kinh doanh hàng tháng", ok: true },
    ],
  },
];

function formatPrice(price: number): string {
  if (price === 0) return "0đ";
  return price.toLocaleString("vi-VN") + "đ";
}

type TabType = "learner" | "coach";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("learner");

  const plans = activeTab === "learner" ? learnerPlans : coachPlans;

  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-600" style={{ fontSize: "0.85rem", fontWeight: 600 }}>💎 Gói dịch vụ</span>
          </div>
          <h2
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2 }}
            className="text-gray-900 mb-4"
          >
            Chọn Gói Phù Hợp Với Bạn
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Bắt đầu miễn phí, nâng cấp khi sẵn sàng. Không ràng buộc, hủy bất cứ lúc nào.
          </p>
        </div>

        {/* ── Role tab switcher ──────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-2xl inline-flex gap-1">
            <button
              onClick={() => setActiveTab("learner")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === "learner"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              <Users className="w-4 h-4" />
              Học viên
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === "coach"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              <Shield className="w-4 h-4" />
              Huấn luyện viên
            </button>
          </div>
        </div>

        {/* ── Coach context banner ───────────────────────── */}
        {activeTab === "coach" && (
          <div className="mb-10 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Video className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-center sm:text-left">
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-800 mb-1">
                Gói dành riêng cho Huấn Luyện Viên
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.65 }} className="text-gray-500">
                Xây dựng thương hiệu cá nhân, quản lý học viên, upload video 360° và tăng doanh thu với bộ công cụ chuyên nghiệp. Phí hoa hồng giảm dần theo gói.
              </p>
            </div>
          </div>
        )}

        {/* ── Billing toggle ─────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            style={{ fontWeight: isYearly ? 400 : 600, fontSize: "0.9rem" }}
            className={isYearly ? "text-gray-400" : "text-gray-800"}
          >
            Hàng tháng
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isYearly ? "bg-orange-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isYearly ? "translate-x-8" : "translate-x-1"}`}
            />
          </button>
          <span
            style={{ fontWeight: isYearly ? 600 : 400, fontSize: "0.9rem" }}
            className={isYearly ? "text-gray-800" : "text-gray-400"}
          >
            Hàng năm
          </span>
          {isYearly && (
            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
              Tiết kiệm 25%
            </span>
          )}
        </div>

        {/* ── Plan cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isCoach = activeTab === "coach";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 ${plan.border} overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.highlight ? "scale-105 shadow-2xl" : "hover:-translate-y-1"
                }`}
              >
                {/* Badge ribbon */}
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
                    <div
                      className={`text-white px-4 py-1 rounded-b-xl ${
                        plan.highlight
                          ? activeTab === "learner"
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : activeTab === "learner"
                          ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                          : "bg-gradient-to-r from-purple-500 to-violet-500"
                      }`}
                      style={{ fontSize: "0.75rem", fontWeight: 700 }}
                    >
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Card header */}
                <div className={`bg-gradient-to-br ${plan.color} p-6 ${plan.badge ? "pt-10" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem" }} className="text-gray-900">{plan.name}</div>
                      <div style={{ fontSize: "0.78rem" }} className="text-gray-500">{plan.tagline}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1 }} className="text-gray-900">
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: "0.85rem" }} className="text-gray-500">/tháng</span>
                    )}
                  </div>
                  {price === 0 && (
                    <p style={{ fontSize: "0.82rem" }} className="text-gray-500">Miễn phí mãi mãi</p>
                  )}
                  {isYearly && price > 0 && (
                    <p style={{ fontSize: "0.72rem" }} className="text-gray-400">
                      Thanh toán {formatPrice(price * 12)}/năm
                    </p>
                  )}

                  {/* Commission badge (coach only) */}
                  {isCoach && "commission" in plan && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                      (plan as typeof coachPlans[0]).commission.includes("0%")
                        ? "bg-green-500/10 border-green-400/30 text-green-700"
                        : "bg-white/60 border-gray-200 text-gray-600"
                    }`}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                        💸 {(plan as typeof coachPlans[0]).commission}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="bg-white p-6">
                  <ul className="space-y-3 mb-7">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${f.ok ? "bg-green-100" : "bg-gray-100"}`}>
                          {f.ok ? (
                            <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" strokeWidth={2.5} />
                          )}
                        </div>
                        <span
                          style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                          className={f.ok ? "text-gray-700" : "text-gray-400 line-through"}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3.5 rounded-xl transition-all duration-200 ${plan.btnStyle}`}
                    style={{ fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    {plan.monthlyPrice === 0
                      ? activeTab === "learner" ? "Bắt đầu miễn phí" : "Đăng ký miễn phí"
                      : `Đăng ký ${plan.name}`}
                  </button>

                  {plan.monthlyPrice > 0 && (
                    <p className="text-center text-gray-400 mt-3" style={{ fontSize: "0.75rem" }}>
                      Hủy bất cứ lúc nào · Không cần thẻ ngân hàng
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Compare note ───────────────────────────────── */}
        <div className="mt-12 bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {activeTab === "learner" ? (
              <>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>🎯</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Thanh toán an toàn</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Bảo vệ 100% qua cổng thanh toán quốc tế VNPay & Stripe</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>🔄</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Hoàn tiền 7 ngày</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Không hài lòng? Hoàn tiền 100% trong vòng 7 ngày đầu</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>⬆️</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Nâng/hạ gói dễ dàng</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Thay đổi gói bất cứ lúc nào, tính phí theo ngày sử dụng thực tế</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>💰</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Thanh toán hàng tuần</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Doanh thu được chuyển khoản mỗi thứ Sáu hàng tuần</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>📊</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Hoa hồng minh bạch</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Không phí ẩn. Xem chi tiết từng giao dịch trên dashboard</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem" }}>🏆</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 mt-1">Hỗ trợ onboarding</div>
                  <div style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-1">Đội ngũ CoachFinder hỗ trợ thiết lập hồ sơ & tối ưu profile miễn phí</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── CTA link ───────────────────────────────────── */}
        <div className="mt-8 text-center">
          <p className="text-gray-500" style={{ fontSize: "0.9rem" }}>
            Có câu hỏi về các gói dịch vụ?{" "}
            <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors" style={{ fontWeight: 600 }}>
              Liên hệ với chúng tôi →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
