import { useState } from "react";
import {
  Check, X, Zap, Crown, Sparkles, ChevronRight,
  CreditCard, Smartphone, Building2, Shield,
  ArrowLeft, CheckCircle2, Star, Users, Brain,
  Video, Calendar, MessageCircle, BarChart2,
  Gift, Clock, AlertCircle, Lock, Flame
} from "lucide-react";

// ─── Plan data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Sparkles,
    color: "gray",
    accent: "#6b7280",
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: "Bắt đầu hành trình thể thao của bạn",
    badge: null,
    cta: "Gói hiện tại",
    current: true,
    features: {
      coaches: "1 HLV",
      ai: "3 lần/tháng",
      video360: "Cơ bản",
      schedule: "Cơ bản",
      chat: "Giới hạn",
      group: false,
      priority: false,
      analytics: false,
      offline: false,
      badge: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    color: "orange",
    accent: "#f97316",
    monthlyPrice: 199000,
    yearlyPrice: 1990000,
    desc: "Dành cho người luyện tập nghiêm túc",
    badge: "Phổ biến nhất",
    cta: "Nâng cấp Pro",
    current: false,
    features: {
      coaches: "5 HLV",
      ai: "20 lần/tháng",
      video360: "Full HD",
      schedule: "Nâng cao",
      chat: "Không giới hạn",
      group: true,
      priority: true,
      analytics: false,
      offline: false,
      badge: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    color: "purple",
    accent: "#8b5cf6",
    monthlyPrice: 499000,
    yearlyPrice: 4990000,
    desc: "Trải nghiệm đỉnh cao không giới hạn",
    badge: "Tốt nhất",
    cta: "Nâng cấp Premium",
    current: false,
    features: {
      coaches: "Không giới hạn",
      ai: "Không giới hạn",
      video360: "4K + Exclusive",
      schedule: "Premium ưu tiên",
      chat: "VIP 24/7",
      group: true,
      priority: true,
      analytics: true,
      offline: true,
      badge: true,
    },
  },
];

const FEATURE_ROWS = [
  { key: "coaches", icon: Users, label: "Số HLV theo học" },
  { key: "ai", icon: Brain, label: "AI phân tích động tác" },
  { key: "video360", icon: Video, label: "Video 360° HLV" },
  { key: "schedule", icon: Calendar, label: "Đặt lịch tập" },
  { key: "chat", icon: MessageCircle, label: "Chat với HLV" },
  { key: "group", icon: Users, label: "Nhóm tập online" },
  { key: "priority", icon: Zap, label: "Hỗ trợ ưu tiên" },
  { key: "analytics", icon: BarChart2, label: "Phân tích tiến độ chi tiết" },
  { key: "offline", icon: Calendar, label: "Buổi tập offline đặc biệt" },
  { key: "badge", icon: Crown, label: "Badge Premium Profile" },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Thẻ tín dụng / ghi nợ", icon: CreditCard, brands: ["Visa", "MC", "JCB"] },
  { id: "momo", label: "Ví MoMo", icon: Smartphone, color: "text-pink-500" },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: Building2, color: "text-blue-500" },
  { id: "vnpay", label: "VNPAY QR", icon: Smartphone, color: "text-red-500" },
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
type ModalStep = "method" | "form" | "success";

function PaymentModal({
  plan,
  yearly,
  onClose,
}: {
  plan: typeof PLANS[0];
  yearly: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("method");
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const saving = yearly ? plan.monthlyPrice * 12 - plan.yearlyPrice : 0;
  const c = PlanColor(plan.color);
  const PlanIcon = plan.icon;

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === "card") {
      if (!card.number.replace(/\s/g, "").match(/^\d{16}$/)) e.number = "Số thẻ không hợp lệ";
      if (!card.name.trim()) e.name = "Vui lòng nhập tên chủ thẻ";
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Định dạng MM/YY";
      if (!card.cvv.match(/^\d{3,4}$/)) e.cvv = "CVV không hợp lệ";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setStep("success");
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
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
              onClick={step === "form" ? () => setStep("method") : onClose}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {step === "form" ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
                { icon: Zap, text: "Tính năng mới đã được mở khoá", sub: plan.features.coaches + " HLV · " + plan.features.ai + " AI" },
                { icon: Brain, text: "AI phân tích động tác nâng cấp", sub: plan.features.ai },
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
              <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-4">Chọn phương thức thanh toán</p>
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
                onClick={() => setStep("form")}
                className={`w-full py-3.5 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${c.btn}`}
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-400" />
                <span style={{ fontSize: "0.72rem" }} className="text-gray-400">Thanh toán bảo mật SSL 256-bit</span>
              </div>
            </div>
          )}

          {/* ── STEP: FORM ── */}
          {step === "form" && (
            <div className="space-y-4">
              {method === "card" ? (
                <>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.83rem", fontWeight: 600 }}>Số thẻ</label>
                    <div className={`relative flex items-center border-2 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-orange-400 transition-all ${errors.number ? "border-red-300" : "border-gray-200"}`}>
                      <CreditCard className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
                        className="w-full bg-transparent pl-10 pr-4 py-3 outline-none text-gray-800 placeholder-gray-400 font-mono"
                        style={{ fontSize: "0.9rem" }}
                        maxLength={19}
                      />
                    </div>
                    {errors.number && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: "0.75rem" }}><AlertCircle className="w-3 h-3" />{errors.number}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.83rem", fontWeight: 600 }}>Tên chủ thẻ</label>
                    <div className={`relative flex items-center border-2 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-orange-400 transition-all ${errors.name ? "border-red-300" : "border-gray-200"}`}>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={card.name}
                        onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                        className="w-full bg-transparent px-4 py-3 outline-none text-gray-800 placeholder-gray-400 uppercase"
                        style={{ fontSize: "0.9rem" }}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: "0.75rem" }}><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.83rem", fontWeight: 600 }}>Ngày hết hạn</label>
                      <div className={`border-2 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-orange-400 transition-all ${errors.expiry ? "border-red-300" : "border-gray-200"}`}>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                          className="w-full bg-transparent px-4 py-3 outline-none text-gray-800 placeholder-gray-400 font-mono"
                          style={{ fontSize: "0.9rem" }}
                          maxLength={5}
                        />
                      </div>
                      {errors.expiry && <p className="text-red-500 mt-1" style={{ fontSize: "0.72rem" }}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.83rem", fontWeight: 600 }}>CVV</label>
                      <div className={`relative border-2 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-orange-400 transition-all ${errors.cvv ? "border-red-300" : "border-gray-200"}`}>
                        <input
                          type="password"
                          placeholder="•••"
                          value={card.cvv}
                          onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          className="w-full bg-transparent px-4 py-3 outline-none text-gray-800 placeholder-gray-400 font-mono"
                          style={{ fontSize: "0.9rem" }}
                          maxLength={4}
                        />
                      </div>
                      {errors.cvv && <p className="text-red-500 mt-1" style={{ fontSize: "0.72rem" }}>{errors.cvv}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  {/* QR / bank transfer placeholder */}
                  <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div style={{ fontSize: "3rem" }}>
                        {method === "momo" ? "💜" : method === "vnpay" ? "📱" : "🏦"}
                      </div>
                      <p style={{ fontSize: "0.78rem" }} className="text-gray-500 mt-2">Quét mã QR</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.85rem" }} className="text-gray-500">
                    {method === "bank"
                      ? "MB Bank · STK: 0123456789 · Tên: COACHFINDER JSC"
                      : `Mở app ${method === "momo" ? "MoMo" : "VNPAY"} và quét mã QR để thanh toán`}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mx-auto" style={{ maxWidth: 300 }}>
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-amber-600">Mã QR hết hạn sau 15:00 phút</span>
                  </div>
                </div>
              )}

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 py-2">
                {["SSL", "PCI DSS", "3D Secure"].map(b => (
                  <div key={b} className="flex items-center gap-1 text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span style={{ fontSize: "0.68rem", fontWeight: 700 }}>{b}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className={`w-full py-3.5 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${c.btn}`}
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Thanh toán {formatPrice(price)}</>
                )}
              </button>
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
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);

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
                Free
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }} className="text-orange-100">
              Bạn đang dùng 1/1 HLV · 3/3 lần AI còn lại tháng này. Nâng cấp để mở khoá toàn bộ tính năng!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Flame className="w-4 h-4 text-orange-200" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-orange-100">Streak 14 ngày</span>
          </div>
        </div>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
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
                  {plan.id === "premium" ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
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
                {[
                  { label: plan.features.coaches + " HLV", ok: true },
                  { label: "AI phân tích: " + plan.features.ai, ok: true },
                  { label: "Video 360°: " + plan.features.video360, ok: true },
                  { label: "Nhóm tập online", ok: plan.features.group },
                  { label: "Hỗ trợ ưu tiên", ok: plan.features.priority },
                  { label: "Phân tích tiến độ chi tiết", ok: plan.features.analytics },
                  { label: "Buổi offline đặc biệt", ok: plan.features.offline },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${ok ? `${c.bg}` : "bg-gray-100"}`}>
                      {ok
                        ? <Check className={`w-2.5 h-2.5 ${c.text}`} strokeWidth={3} />
                        : <X className="w-2.5 h-2.5 text-gray-300" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.82rem" }} className={ok ? "text-gray-700" : "text-gray-400"}>{label}</span>
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
                <th className="text-left px-6 py-3.5 text-gray-500" style={{ fontSize: "0.78rem", fontWeight: 700, width: "40%" }}>Tính năng</th>
                {PLANS.map(p => {
                  const c = PlanColor(p.color);
                  return (
                    <th key={p.id} className="px-4 py-3.5 text-center" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                      <span className={p.current ? "text-gray-500" : c.text}>{p.name}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, idx) => {
                const RowIcon = row.icon;
                return (
                  <tr key={row.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <RowIcon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span style={{ fontSize: "0.83rem" }} className="text-gray-700">{row.label}</span>
                      </div>
                    </td>
                    {PLANS.map(plan => {
                      const val = plan.features[row.key as keyof typeof plan.features];
                      const c = PlanColor(plan.color);
                      return (
                        <td key={plan.id} className="px-4 py-3.5 text-center">
                          {typeof val === "boolean" ? (
                            val
                              ? <div className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center mx-auto`}>
                                  <Check className={`w-3.5 h-3.5 ${c.text}`} strokeWidth={3} />
                                </div>
                              : <X className="w-4 h-4 text-gray-300 mx-auto" strokeWidth={2.5} />
                          ) : (
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }} className={plan.current ? "text-gray-400" : c.text}>{val as string}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ / GUARANTEE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Bảo đảm hoàn tiền", desc: "Hoàn tiền 100% trong 7 ngày nếu không hài lòng, không cần lý do." },
          { icon: Clock, title: "Huỷ bất kỳ lúc nào", desc: "Không ràng buộc hợp đồng dài hạn. Huỷ gói chỉ trong 1 cú click." },
          { icon: Lock, title: "Thanh toán bảo mật", desc: "Dữ liệu thẻ được mã hoá SSL. Không lưu thông tin thẻ trên server." },
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
        />
      )}
    </div>
  );
}
