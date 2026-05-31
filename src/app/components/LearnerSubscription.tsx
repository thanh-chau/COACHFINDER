import { useEffect, useState } from "react";
import {
  Check, X, Zap, Sparkles, ChevronRight,
  Shield, Wallet,
  CheckCircle2, Star, Brain,
  Gift, Lock, Flame, Clock
} from "lucide-react";
import {
  getTraineeSubscriptionCatalog,
  purchaseSubscription,
} from "../api/subscriptions";
import type { SubscriptionBillingCycle, SubscriptionPlanCard } from "../types/subscription";
import { WalletPanel } from "./WalletPanel";

type LearnerPlan = {
  id: string;
  planCode: "FREE" | "PRO" | "PREMIUM";
  name: string;
  icon: typeof Sparkles;
  color: string;
  accent: string;
  monthlyPrice: number;
  yearlyPrice: number;
  desc: string;
  badge: string | null;
  cta: string;
  current: boolean;
  features: string[];
};

// ─── Plan data ────────────────────────────────────────────────────────────────
const PLANS: LearnerPlan[] = [
  {
    id: "free",
    planCode: "FREE",
    name: "Gói Thường",
    icon: Sparkles,
    color: "gray",
    accent: "#6b7280",
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: "Phù hợp cho người mới bắt đầu, chỉ cần các tính năng cơ bản.",
    badge: null,
    cta: "Gói hiện tại",
    current: true,
    features: [
      "Tạo tài khoản học viên",
      "Xem hồ sơ HLV",
      "Tìm kiếm và lọc HLV theo môn học, trình độ, mục tiêu",
      "Đặt lịch học",
      "Lưu HLV yêu thích",
      "Xem lịch sử buổi học",
      "Nhận hỗ trợ cơ bản từ hệ thống",
    ],
  },
  {
    id: "pro",
    planCode: "PRO",
    name: "Gói Pro",
    icon: Zap,
    color: "orange",
    accent: "#f97316",
    monthlyPrice: 99000,
    yearlyPrice: 990000,
    desc: "Phù hợp cho học viên muốn học nghiêm túc và cải thiện nhanh hơn.",
    badge: "Phổ biến nhất",
    cta: "Nâng cấp Pro",
    current: false,
    features: [
      "Bao gồm toàn bộ quyền lợi gói thường",
      "Upload video để nhận đánh giá",
      "AI feedback kỹ thuật chi tiết hơn",
      "Theo dõi tiến bộ theo thời gian",
      "Gợi ý lỗi sai và cách sửa",
      "Lộ trình luyện tập cá nhân hóa",
      "Ưu tiên hỗ trợ",
      "Ưu tiên ghép với HLV phù hợp hơn",
    ],
  },
];

function mapCatalogPlan(plan: SubscriptionPlanCard): LearnerPlan {
  const code = plan.planCode;
  const isFree = code === "FREE";
  const isPremium = code === "PREMIUM";
  const features = Array.isArray(plan.features) ? plan.features : [];
  return {
    id: code.toLowerCase(),
    planCode: code,
    name: plan.displayName,
    icon: isFree ? Sparkles : isPremium ? Brain : Zap,
    color: isFree ? "gray" : isPremium ? "purple" : "orange",
    accent: isFree ? "#6b7280" : isPremium ? "#8b5cf6" : "#f97316",
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.billingPrice,
    desc: plan.description,
    badge: plan.ribbonText,
    cta: plan.actionLabel,
    current: plan.current,
    features: features.map(feature => feature.text).filter(Boolean),
  };
}

const PAYMENT_METHODS = [
  { id: "wallet", label: "Ví CoachFinder", icon: Wallet, brands: ["Số dư ví"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number) {
  if (price === 0) return "Miễn phí";
  return price.toLocaleString("vi-VN") + "đ";
}

function PlanColor(color: string) {
  const map: Record<string, { bg: string; text: string; border: string; ring: string; btn: string; badge: string; light: string }> = {
    gray: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", ring: "ring-gray-200", btn: "bg-gray-800 hover:bg-gray-900", badge: "bg-gray-200 text-gray-700", light: "bg-gray-50" },
    orange: { bg: "bg-orange-100", text: "text-orange-500", border: "border-orange-400", ring: "ring-orange-300", btn: "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600", badge: "bg-orange-500 text-white", light: "bg-orange-50" },
    purple: { bg: "bg-purple-100", text: "text-purple-500", border: "border-purple-400", ring: "ring-purple-300", btn: "bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700", badge: "bg-purple-500 text-white", light: "bg-purple-50" },
  };
  return map[color] ?? map.gray;
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
type ModalStep = "method" | "success";

function PaymentModal({
  plan,
  yearly,
  onClose,
  onPurchased,
}: {
  plan: LearnerPlan;
  yearly: boolean;
  onClose: () => void;
  onPurchased: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("method");
  const [method, setMethod] = useState("wallet");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const saving = yearly ? plan.monthlyPrice * 12 - plan.yearlyPrice : 0;
  const c = PlanColor(plan.color);
  const PlanIcon = plan.icon;

  const handlePay = async () => {
    setLoading(true);
    setPaymentError(null);
    try {
      await purchaseSubscription({
        planCode: plan.planCode,
        billingCycle: yearly ? "YEARLY" : "MONTHLY",
      });
      onPurchased();
      setStep("success");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Thanh toán thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative px-6 pt-6 pb-5 ${step === "success" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gray-950"}`}>
          {step !== "success" && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {step === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem" }} className="text-white mb-1">Thanh toán thành công!</div>
              <p className="text-emerald-100" style={{ fontSize: "0.85rem" }}>Gói {plan.name} đã được kích hoạt ngay lập tức</p>
            </div>
          ) : (
            <div className="text-center pt-2">
              <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mx-auto mb-3`}>
                <PlanIcon className={`w-6 h-6 ${c.text}`} />
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.15rem" }} className="text-white">
                {step === "method" ? `Nâng cấp lên ${plan.name}` : "Thông tin thanh toán"}
              </div>
              {/* Price */}
              <div className="flex items-baseline justify-center gap-1.5 mt-3">
                <span style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1 }} className="text-white">
                  {formatPrice(price)}
                </span>
                {price > 0 && (
                  <span className="text-gray-400" style={{ fontSize: "0.82rem" }}>/{yearly ? "năm" : "tháng"}</span>
                )}
              </div>
              {saving > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full mt-2">
                  <Gift className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                    Tiết kiệm {formatPrice(saving)} so với tháng
                  </span>
                </div>
              )}
              {paymentError && (
                <div className="mt-3 bg-red-500/15 border border-red-400/30 text-red-100 rounded-xl px-3 py-2" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  {paymentError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <div className="space-y-4">
              {[
                { icon: CheckCircle2, text: `Gói ${plan.name} hiệu lực ngay hôm nay`, sub: "4 tháng 3, 2026" },
                { icon: Zap, text: "Tính năng mới đã được mở khoá", sub: "Upload video · AI feedback kỹ thuật" },
                { icon: Brain, text: "AI phân tích động tác nâng cấp", sub: "Phân tích chi tiết · Gợi ý lỗi sai" },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-800">{text}</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-gray-400">{sub}</div>
                  </div>
                </div>
              ))}
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 mt-2"
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                Bắt đầu ngay →
              </button>
            </div>
          )}

          {/* ── STEP: METHOD ── */}
          {step === "method" && (
            <div className="space-y-3">
              <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-4">Thanh toán mặc định bằng ví của tài khoản</p>
              {PAYMENT_METHODS.map((pm) => {
                const PMIcon = pm.icon;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${method === pm.id ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method === pm.id ? "bg-orange-100" : "bg-gray-100"}`}>
                      <PMIcon className={`w-5 h-5 ${method === pm.id ? "text-orange-500" : (pm.color ?? "text-gray-500")}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-800">{pm.label}</div>
                      {pm.brands && (
                        <div className="flex gap-1.5 mt-1">
                          {pm.brands.map(b => (
                            <span key={b} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded" style={{ fontSize: "0.65rem", fontWeight: 700 }}>{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${method === pm.id ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                      {method === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}

              {/* Order summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mt-2 space-y-2">
                <div style={{ fontWeight: 700, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Tóm tắt đơn hàng</div>
                {[
                  { label: `Gói ${plan.name} · ${yearly ? "12 tháng" : "1 tháng"}`, value: formatPrice(price) },
                  ...(saving > 0 ? [{ label: "Giảm giá gói năm", value: `-${formatPrice(saving)}`, green: true }] : []),
                  { label: "Tổng thanh toán", value: formatPrice(price), bold: true },
                ].map(({ label, value, green, bold }) => (
                  <div key={label} className={`flex items-center justify-between ${bold ? "pt-2 border-t border-gray-200" : ""}`}>
                    <span style={{ fontSize: "0.82rem", fontWeight: bold ? 700 : 400 }} className={bold ? "text-gray-800" : "text-gray-500"}>{label}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className={green ? "text-emerald-500" : bold ? "text-gray-900" : "text-gray-700"}>{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePay}
                className={`w-full py-3.5 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${c.btn}`}
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                Thanh toán bằng ví <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-400" />
                <span style={{ fontSize: "0.72rem" }} className="text-gray-400">Thanh toán bảo mật SSL 256-bit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main LearnerSubscription ─────────────────────────────────────────────────
export function LearnerSubscription() {
  const [yearly, setYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearnerPlan | null>(null);
  const [plans, setPlans] = useState<LearnerPlan[]>(PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const loadCatalog = () => {
    const billingCycle: SubscriptionBillingCycle = yearly ? "YEARLY" : "MONTHLY";
    setLoadingPlans(true);
    getTraineeSubscriptionCatalog(billingCycle)
      .then((catalog) => {
        setPlans((Array.isArray(catalog.plans) ? catalog.plans : []).map(mapCatalogPlan));
        setPlansError(null);
      })
      .catch((err) => {
        setPlans(PLANS);
        setPlansError(err instanceof Error ? err.message : "Không tải được gói đăng ký.");
      })
      .finally(() => setLoadingPlans(false));
  };

  useEffect(() => {
    loadCatalog();
  }, [yearly]);

  return (
    <div className="space-y-8 pb-8">

      {/* ── CURRENT PLAN BANNER ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-100">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>Gói hiện tại: </span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full" style={{ fontWeight: 700, fontSize: "0.82rem" }}>
                Gói Thường
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }} className="text-orange-100">
              Bạn đang dùng gói Thường. Nâng cấp lên Pro để mở khoá AI feedback và video phân tích kỹ thuật!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Flame className="w-4 h-4 text-orange-200" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-orange-100">Streak 14 ngày</span>
          </div>
        </div>
      </div>

      <WalletPanel mode="learner" allowTopUp />

      {loadingPlans && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500" style={{ fontSize: "0.85rem" }}>
          Đang tải gói đăng ký...
        </div>
      )}

      {plansError && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl px-4 py-3" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
          {plansError}
        </div>
      )}

      {/* ── HEADER + TOGGLE ─────────────────────────────────── */}
      <div className="text-center">
        <h2 style={{ fontWeight: 800, fontSize: "1.5rem" }} className="text-gray-900 mb-2">Chọn gói phù hợp với bạn</h2>
        <p style={{ fontSize: "0.9rem" }} className="text-gray-500 mb-6">Nâng cấp bất kỳ lúc nào · Huỷ dễ dàng · Không ràng buộc</p>

        {/* Monthly/Yearly toggle */}
        <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-xl transition-all ${!yearly ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            style={{ fontSize: "0.88rem", fontWeight: 600 }}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all ${yearly ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            style={{ fontSize: "0.88rem", fontWeight: 600 }}
          >
            Theo năm
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
              -2 tháng
            </span>
          </button>
        </div>
      </div>

      {/* ── PLAN CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(Array.isArray(plans) ? plans : []).map((plan) => {
          const c = PlanColor(plan.color);
          const PlanIcon = plan.icon;
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const monthlyEquiv = yearly && plan.yearlyPrice > 0
            ? Math.round(plan.yearlyPrice / 12)
            : null;
          const isPro = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border-2 p-6 flex flex-col transition-all duration-200 hover:shadow-xl ${isPro ? `border-orange-400 shadow-lg shadow-orange-100 ${c.light}` : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1 rounded-full ${c.badge} shadow-sm`} style={{ fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  <Star className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="mb-5">
                <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center mb-3`}>
                  <PlanIcon className={`w-5.5 h-5.5 ${c.text}`} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.15rem" }} className="text-gray-900 mb-1">{plan.name}</div>
                <p style={{ fontSize: "0.8rem", lineHeight: 1.6 }} className="text-gray-500">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-5">
                {price === 0 ? (
                  <div style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1 }} className="text-gray-900">Miễn phí</div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontWeight: 900, fontSize: "1.9rem", lineHeight: 1 }} className="text-gray-900">
                        {(yearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice).toLocaleString("vi-VN")}đ
                      </span>
                      <span style={{ fontSize: "0.82rem" }} className="text-gray-400">/tháng</span>
                    </div>
                    {yearly && (
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontSize: "0.75rem" }} className="text-gray-400 line-through">
                          {(plan.monthlyPrice * 12).toLocaleString("vi-VN")}đ/năm
                        </span>
                        <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                          Tiết kiệm {(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                    {yearly && (
                      <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mt-0.5">
                        Thanh toán {plan.yearlyPrice.toLocaleString("vi-VN")}đ/năm
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2.5 flex-1 mb-6">
                {(Array.isArray(plan.features) ? plan.features : []).map((label) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${c.bg}`}>
                      <Check className={`w-2.5 h-2.5 ${c.text}`} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: "0.82rem" }} className="text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {plan.current ? (
                <div className="w-full py-3 rounded-2xl border-2 border-gray-200 text-center text-gray-400" style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                  ✓ Gói hiện tại
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3.5 text-white rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${c.btn}`}
                  style={{ fontSize: "0.9rem", fontWeight: 700 }}
                >
                  {plan.cta} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── COMPARISON TABLE ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-900">So sánh chi tiết tính năng</h3>
          <p style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Tất cả tính năng theo từng gói dịch vụ</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3.5 text-gray-500" style={{ fontSize: "0.78rem", fontWeight: 700, width: "50%" }}>Tính năng</th>
                <th className="px-4 py-3.5 text-center" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                  <span className="text-gray-500">Gói Thường</span>
                </th>
                <th className="px-4 py-3.5 text-center" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                  <span className="text-orange-500">Gói Pro</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Tạo tài khoản học viên", free: true, pro: true },
                { label: "Xem hồ sơ HLV", free: true, pro: true },
                { label: "Tìm kiếm và lọc HLV theo môn học, trình độ, mục tiêu", free: true, pro: true },
                { label: "Đặt lịch học", free: true, pro: true },
                { label: "Lưu HLV yêu thích", free: true, pro: true },
                { label: "Xem lịch sử buổi học", free: true, pro: true },
                { label: "Nhận hỗ trợ cơ bản từ hệ thống", free: true, pro: true },
                { label: "Upload video để nhận đánh giá", free: false, pro: true },
                { label: "AI feedback kỹ thuật chi tiết hơn", free: false, pro: true },
                { label: "Theo dõi tiến bộ theo thời gian", free: false, pro: true },
                { label: "Gợi ý lỗi sai và cách sửa", free: false, pro: true },
                { label: "Lộ trình luyện tập cá nhân hóa", free: false, pro: true },
                { label: "Ưu tiên hỗ trợ", free: false, pro: true },
                { label: "Ưu tiên ghép với HLV phù hợp hơn", free: false, pro: true },
              ].map((row, idx) => (
                <tr key={row.label} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <td className="px-6 py-3.5">
                    <span style={{ fontSize: "0.83rem" }} className="text-gray-700">{row.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.free
                      ? <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto"><Check className="w-3.5 h-3.5 text-gray-600" strokeWidth={3} /></div>
                      : <X className="w-4 h-4 text-gray-300 mx-auto" strokeWidth={2.5} />}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.pro
                      ? <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mx-auto"><Check className="w-3.5 h-3.5 text-orange-500" strokeWidth={3} /></div>
                      : <X className="w-4 h-4 text-gray-300 mx-auto" strokeWidth={2.5} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ / GUARANTEE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Bảo đảm hoàn tiền", desc: "Hoàn tiền 100% trong 7 ngày nếu không hài lòng, không cần lý do." },
          { icon: Clock, title: "Huỷ bất kỳ lúc nào", desc: "Không ràng buộc hợp đồng dài hạn. Huỷ gói chỉ trong 1 cú click." },
          { icon: Lock, title: "Thanh toán bảo mật", desc: "Thanh toán gói được trừ trực tiếp từ ví CoachFinder của tài khoản." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-4.5 h-4.5 text-gray-600" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800 mb-1">{title}</div>
              <p style={{ fontSize: "0.75rem", lineHeight: 1.6 }} className="text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          yearly={yearly}
          onClose={() => setSelectedPlan(null)}
          onPurchased={loadCatalog}
        />
      )}
    </div>
  );
}
