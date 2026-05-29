import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import {
  Eye, EyeOff, ArrowLeft, ChevronRight, Check,
  Dumbbell, GraduationCap, Mail, Lock, User,
  Phone, AlertCircle, Zap, Shield, Brain, Star
} from "lucide-react";
import {
  forgotPassword,
  login,
  loginWithFacebook,
  loginWithGoogle,
  registerAccount,
  resetPassword,
} from "../api/auth";
import { getDashboardPath, saveAuthSession } from "../utils/authSession";
import { GoogleLogin } from "@react-oauth/google";

const AUTH_BG =
  "https://images.unsplash.com/photo-1693214674477-1159bddf1598?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2glMjB0cmFpbmluZyUyMGF0aGxldGUlMjBtb2RpdmF0aW9uJTIwZGFyayUyMGd5bXxlbnwxfHx8fDE3NzI2Mzc1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080";

type AuthMode = "login" | "register";
type Role = "learner" | "coach" | "admin";
type RegisterStep = 1 | 2;

// ─── Reusable input ───────────────────────────────────────────────────────────
function FormInput({
  label, icon: Icon, error, type = "text", placeholder, registration, children, focusColor = "orange",
}: {
  label: string; icon: React.ElementType; error?: string;
  type?: string; placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration?: any; children?: React.ReactNode; focusColor?: "orange" | "blue";
}) {
  const ring = focusColor === "blue" ? "focus-within:border-blue-400" : "focus-within:border-orange-400";
  return (
    <div>
      <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</label>
      <div className={`relative flex items-center rounded-xl border-2 transition-all bg-gray-50 focus-within:bg-white ${error ? "border-red-300" : `border-gray-200 ${ring}`}`}>
        <Icon className="absolute left-3.5 w-4 h-4 text-gray-400" />
        {children ?? (
          <input type={type} placeholder={placeholder}
            className="w-full bg-transparent pl-10 pr-4 py-3 outline-none text-gray-800 placeholder-gray-400"
            style={{ fontSize: "0.9rem" }} {...registration}
          />
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-red-500" style={{ fontSize: "0.78rem" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Left panel ──────────────────────────────────────────────────────────────
function LeftPanel({ mode }: { mode: AuthMode }) {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden" style={{ width: "42%" }}>
      <img src={AUTH_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/85 to-orange-950/70" />
      <div className="relative z-10 flex flex-col h-full p-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontSize: "1.3rem", fontWeight: 800 }} className="text-white tracking-tight">
            Coach<span className="text-orange-400">Finder</span>
          </span>
        </Link>

        <div className="my-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Nền tảng HLV thể thao #1 Việt Nam</span>
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.25 }} className="text-white mb-4">
            {mode === "login" ? <>Chào mừng trở lại,<br /><span className="text-orange-400">CoachFinder</span> đang chờ bạn</> : <>Bắt đầu hành trình<br /><span className="text-orange-400">cùng CoachFinder</span></>}
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.75 }} className="text-gray-400 mb-8 max-w-xs">
            {mode === "login" ? "Tiếp tục luyện tập, theo dõi tiến độ và kết nối với HLV của bạn." : "Tham gia cộng đồng thể thao lớn nhất Việt Nam với 2,500+ HLV chuyên nghiệp."}
          </p>
          <div className="space-y-3.5">
            {[
              { icon: Brain, text: "AI phân tích động tác 33 điểm khớp" },
              { icon: Zap, text: "Video 360° từ HLV hàng đầu" },
              { icon: Shield, text: "HLV được xác minh & chứng nhận" },
              { icon: Star, text: "50,000+ học viên tin dùng" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <span style={{ fontSize: "0.85rem" }} className="text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <p style={{ fontSize: "0.82rem", lineHeight: 1.65 }} className="text-gray-300 mb-3">
            "CoachFinder giúp tôi tìm được HLV tennis phù hợp trong 10 phút. Sau 3 tháng kỹ thuật cải thiện rõ rệt!"
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white" style={{ fontSize: "0.75rem", fontWeight: 700 }}>NT</div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-white">Nguyễn Thanh</div>
              <div style={{ fontSize: "0.72rem" }} className="text-gray-400">Học viên Tennis · TP. HCM</div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────
interface LoginData { email: string; password: string; remember: boolean; }
interface ResetData { email: string; otp: string; newPassword: string; }

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();
  const resetForm = useForm<ResetData>();

  const onSubmit = async (data: LoginData) => {
    setLoginError("");
    try {
      const auth = await login(data.email.trim(), data.password);
      saveAuthSession(auth, data.remember);
      navigate(getDashboardPath(auth.role));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Đăng nhập không thành công. Vui lòng thử lại.");
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Nhap email can khoi phuc mat khau");
    if (!email) return;
    setLoginError("");
    setAuthNotice("");
    try {
      await forgotPassword(email.trim());
      resetForm.setValue("email", email.trim());
      setResetMode(true);
      setAuthNotice("Da gui OTP khoi phuc mat khau. Vui long kiem tra email.");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Khong the gui OTP khoi phuc mat khau.");
    }
  };

  const handleResetPassword = async (data: ResetData) => {
    setLoginError("");
    setAuthNotice("");
    try {
      await resetPassword(data.email.trim(), data.otp.trim(), data.newPassword);
      setResetMode(false);
      setAuthNotice("Da doi mat khau. Ban co the dang nhap bang mat khau moi.");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Khong the doi mat khau.");
    }
  };

  const handleSocialLogin = async (provider: "Facebook") => {
    const token = prompt("Nhap Facebook accessToken de dang nhap");
    if (!token) return;
    setLoginError("");
    try {
      const auth = await loginWithFacebook(token.trim());
      saveAuthSession(auth);
      navigate(getDashboardPath(auth.role));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : `Dang nhap ${provider} khong thanh cong.`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }} className="text-gray-900 mb-1">Đăng nhập</h1>
        <p style={{ fontSize: "0.9rem" }} className="text-gray-500">Chào mừng trở lại! Vui lòng nhập thông tin của bạn.</p>
      </div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center justify-center overflow-hidden h-[46px]">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoginError("");
              try {
                if (!credentialResponse.credential) throw new Error("No credential");
                const auth = await loginWithGoogle(credentialResponse.credential);
                saveAuthSession(auth, true);
                navigate(getDashboardPath(auth.role));
              } catch (error) {
                setLoginError(error instanceof Error ? error.message : "Đăng nhập Google không thành công.");
              }
            }}
            onError={() => {
              setLoginError("Đăng nhập Google thất bại.");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="signin_with"
            size="large"
          />
        </div>
        <button type="button" onClick={() => handleSocialLogin("Facebook")} className="flex items-center justify-center gap-2.5 h-[46px] border-2 border-gray-200 rounded-[4px] hover:bg-gray-50 transition-colors" style={{ fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1877F2" }}>f</span>Facebook
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span style={{ fontSize: "0.78rem" }} className="text-gray-400 whitespace-nowrap">hoặc đăng nhập bằng email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="Email" icon={Mail} error={errors.email?.message} placeholder="ban@email.com"
          registration={register("email", { required: "Vui lòng nhập email", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" } })}
        />
        <FormInput label="Mật khẩu" icon={Lock} error={errors.password?.message}>
          <input type={showPw ? "text" : "password"} placeholder="Nhập mật khẩu"
            className="w-full bg-transparent pl-10 pr-10 py-3 outline-none text-gray-800 placeholder-gray-400"
            style={{ fontSize: "0.9rem" }} {...register("password", { required: "Vui lòng nhập mật khẩu" })} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </FormInput>

        {loginError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span style={{ fontSize: "0.82rem" }} className="text-red-600">{loginError}</span>
          </div>
        )}

        {authNotice && (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span style={{ fontSize: "0.82rem" }} className="text-emerald-600">{authNotice}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-orange-500" {...register("remember")} />
            <span style={{ fontSize: "0.85rem" }} className="text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <button type="button" className="text-orange-500 hover:text-orange-600" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Quên mật khẩu?</button>
        </div>

        <button type="button" onClick={handleForgotPassword} className="w-full py-2.5 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors" style={{ fontWeight: 700, fontSize: "0.86rem" }}>
          Dat lai mat khau bang OTP
        </button>

        <button type="submit" disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng nhập...</> : "Đăng nhập →"}
        </button>
      </form>

      {resetMode && (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-3 mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
          <div style={{ fontSize: "0.84rem", fontWeight: 700 }} className="text-gray-800">Dat lai mat khau bang OTP</div>
          <input {...resetForm.register("email", { required: true })} placeholder="Email" className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none" />
          <input {...resetForm.register("otp", { required: true })} placeholder="OTP" className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none" />
          <input type="password" {...resetForm.register("newPassword", { required: true, minLength: 8 })} placeholder="Mat khau moi" className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 outline-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setResetMode(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-gray-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Huy</button>
            <button type="submit" disabled={resetForm.formState.isSubmitting} className="flex-1 rounded-xl bg-orange-500 py-2 text-white disabled:opacity-60" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Doi mat khau</button>
          </div>
        </form>
      )}

      <p className="text-center mt-5" style={{ fontSize: "0.88rem" }}>
        <span className="text-gray-500">Chưa có tài khoản? </span>
        <button onClick={onSwitch} className="text-orange-500 hover:text-orange-600" style={{ fontWeight: 700 }}>Đăng ký ngay</button>
      </p>
    </div>
  );
}

// ─── Role picker ──────────────────────────────────────────────────────────────
function RolePicker({ onSelect }: { onSelect: (r: Role) => void }) {
  const [hovered, setHovered] = useState<Role | null>(null);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }} className="text-gray-900 mb-2">Tạo tài khoản</h1>
        <p style={{ fontSize: "0.9rem" }} className="text-gray-500">Bạn tham gia CoachFinder với vai trò nào?</p>
      </div>
      <div className="space-y-4">
        {[
          { role: "learner" as const, Icon: GraduationCap, title: "Học viên", badge: "Miễn phí", badgeCls: "bg-orange-100 text-orange-600", hoverBorder: "border-orange-400 bg-orange-50 shadow-md shadow-orange-100", defaultBorder: "border-gray-200 hover:border-orange-300", iconActive: "bg-orange-500", iconDefault: "bg-orange-100", iconColorActive: "text-white", iconColorDefault: "text-orange-500", chevron: "text-orange-500", desc: "Tìm HLV, đặt lịch tập, nhận phân tích AI động tác và theo dõi tiến độ.", tags: ["🤖 AI Phân tích", "📅 Đặt lịch", "🎥 Video 360°", "📊 Tiến độ"] },
          { role: "coach" as const, Icon: Dumbbell, title: "Huấn luyện viên", badge: "Kiếm thu nhập", badgeCls: "bg-blue-100 text-blue-600", hoverBorder: "border-blue-400 bg-blue-50 shadow-md shadow-blue-100", defaultBorder: "border-gray-200 hover:border-blue-300", iconActive: "bg-blue-500", iconDefault: "bg-blue-100", iconColorActive: "text-white", iconColorDefault: "text-blue-500", chevron: "text-blue-500", desc: "Xây dựng profile, upload video 360°, quản lý học viên và tăng doanh thu.", tags: ["🎥 Studio 360°", "💰 Thu nhập", "📈 Analytics", "🏆 Badge Verified"] },
        ].map(({ role, Icon, title, badge, badgeCls, hoverBorder, defaultBorder, iconActive, iconDefault, iconColorActive, iconColorDefault, chevron, desc, tags }) => (
          <button key={role} onClick={() => onSelect(role)} onMouseEnter={() => setHovered(role)} onMouseLeave={() => setHovered(null)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${hovered === role ? hoverBorder : defaultBorder}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${hovered === role ? iconActive : iconDefault}`}>
                <Icon className={`w-7 h-7 ${hovered === role ? iconColorActive : iconColorDefault}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-900">{title}</span>
                  <span className={`px-2 py-0.5 rounded-full ${badgeCls}`} style={{ fontSize: "0.7rem", fontWeight: 600 }}>{badge}</span>
                </div>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }} className="text-gray-500">{desc}</p>
              </div>
              <ChevronRight className={`w-5 h-5 shrink-0 transition-colors ${hovered === role ? chevron : "text-gray-300"}`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.72rem" }}>{tag}</span>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Learner register ─────────────────────────────────────────────────────────
interface LearnerData { username: string; name: string; email: string; phone: string; password: string; confirmPassword: string; terms: boolean; }

function LearnerForm({ onBack, onSwitch }: { onBack: () => void; onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LearnerData>();
  const onSubmit = async (data: LearnerData) => {
    setRegisterError("");
    try {
      const auth = await registerAccount({
        username: data.username.trim(),
        fullName: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,
        role: "TRAINEES",
      });
      saveAuthSession(auth);
      navigate(getDashboardPath(auth.role));
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Đăng ký không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 mb-4"><ArrowLeft className="w-4 h-4" /><span style={{ fontSize: "0.85rem" }}>Quay lại</span></button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-orange-500" /></div>
          <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800 }} className="text-gray-900">Đăng ký Học viên</h1><p style={{ fontSize: "0.8rem" }} className="text-gray-400">Tạo tài khoản miễn phí</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div><span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-orange-500">Chọn vai trò</span></div>
          <div className="flex-1 h-px bg-orange-200" />
          <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white" style={{ fontSize: "0.75rem", fontWeight: 700 }}>2</div><span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-orange-500">Thông tin</span></div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <FormInput label="Họ và tên" icon={User} error={errors.name?.message} placeholder="Nguyễn Văn A" registration={register("name", { required: "Bắt buộc" })} />
        <FormInput label="Tên đăng nhập" icon={User} error={errors.username?.message} placeholder="nguyenvana" registration={register("username", { required: "Bắt buộc", minLength: { value: 3, message: "Tối thiểu 3 ký tự" }, maxLength: { value: 50, message: "Tối đa 50 ký tự" } })} />
        <FormInput label="Email" icon={Mail} error={errors.email?.message} placeholder="ban@email.com" registration={register("email", { required: "Bắt buộc", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" } })} />
        <FormInput label="Số điện thoại" icon={Phone} error={errors.phone?.message} placeholder="0901 234 567" type="tel" registration={register("phone", { required: "Bắt buộc", pattern: { value: /^[0-9]{10,11}$/, message: "Không hợp lệ" } })} />
        <FormInput label="Mật khẩu" icon={Lock} error={errors.password?.message}>
          <input type={showPw ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" className="w-full bg-transparent pl-10 pr-10 py-3 outline-none text-gray-800 placeholder-gray-400" style={{ fontSize: "0.9rem" }} {...register("password", { required: "Bắt buộc", minLength: { value: 8, message: "Tối thiểu 8 ký tự" } })} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </FormInput>
        <FormInput label="Xác nhận mật khẩu" icon={Lock} error={errors.confirmPassword?.message}>
          <input type={showCp ? "text" : "password"} placeholder="Nhập lại mật khẩu" className="w-full bg-transparent pl-10 pr-10 py-3 outline-none text-gray-800 placeholder-gray-400" style={{ fontSize: "0.9rem" }} {...register("confirmPassword", { required: "Bắt buộc", validate: v => v === watch("password") || "Mật khẩu không khớp" })} />
          <button type="button" onClick={() => setShowCp(!showCp)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">{showCp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </FormInput>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-orange-500" {...register("terms", { required: true })} />
          <span style={{ fontSize: "0.8rem", lineHeight: 1.6 }} className="text-gray-500">Tôi đồng ý với <a href="#" className="text-orange-500 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-orange-500 hover:underline">Chính sách bảo mật</a></span>
        </label>
        {errors.terms && <p className="text-red-500" style={{ fontSize: "0.78rem" }}>Vui lòng đồng ý với điều khoản</p>}
        {registerError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span style={{ fontSize: "0.82rem" }} className="text-red-600">{registerError}</span>
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-70 flex items-center justify-center gap-2" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</> : "Tạo tài khoản miễn phí 🎉"}
        </button>
      </form>
      <p className="text-center mt-5" style={{ fontSize: "0.88rem" }}><span className="text-gray-500">Đã có tài khoản? </span><button onClick={onSwitch} className="text-orange-500 hover:text-orange-600" style={{ fontWeight: 700 }}>Đăng nhập</button></p>
    </div>
  );
}

// ─── Coach register ───────────────────────────────────────────────────────────
interface CoachData { username: string; name: string; email: string; phone: string; password: string; confirmPassword: string; terms: boolean; }

function CoachForm({ onBack, onSwitch }: { onBack: () => void; onSwitch: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CoachData>();
  const onSubmit = async (data: CoachData) => {
    setRegisterError("");
    try {
      const auth = await registerAccount({
        username: data.username.trim(),
        fullName: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,
        role: "COACHES",
      });
      saveAuthSession(auth);
      navigate("/coach/profile/setup");
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Đăng ký không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 mb-4"><ArrowLeft className="w-4 h-4" /><span style={{ fontSize: "0.85rem" }}>Quay lại</span></button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Dumbbell className="w-5 h-5 text-blue-500" /></div>
          <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800 }} className="text-gray-900">Đăng ký HLV</h1><p style={{ fontSize: "0.8rem" }} className="text-gray-400">Tạo tài khoản để thiết lập hồ sơ HLV</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div><span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-blue-500">Chọn vai trò</span></div>
          <div className="flex-1 h-px bg-blue-200" />
          <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white" style={{ fontSize: "0.75rem", fontWeight: 700 }}>2</div><span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-blue-500">Thông tin</span></div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <FormInput label="Họ và tên" icon={User} error={errors.name?.message} placeholder="Nguyễn Văn A" focusColor="blue" registration={register("name", { required: "Bắt buộc" })} />
        <FormInput label="Tên đăng nhập" icon={User} error={errors.username?.message} placeholder="huanluyenvien" focusColor="blue" registration={register("username", { required: "Bắt buộc", minLength: { value: 3, message: "Tối thiểu 3 ký tự" }, maxLength: { value: 50, message: "Tối đa 50 ký tự" } })} />
        <FormInput label="Email" icon={Mail} error={errors.email?.message} placeholder="hlv@email.com" focusColor="blue" registration={register("email", { required: "Bắt buộc", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" } })} />
        <FormInput label="Số điện thoại" icon={Phone} error={errors.phone?.message} placeholder="0901 234 567" type="tel" focusColor="blue" registration={register("phone", { required: "Bắt buộc", pattern: { value: /^[0-9]{10,11}$/, message: "Không hợp lệ" } })} />
        <FormInput label="Mật khẩu" icon={Lock} error={errors.password?.message} focusColor="blue">
          <input type={showPw ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" className="w-full bg-transparent pl-10 pr-10 py-3 outline-none text-gray-800 placeholder-gray-400" style={{ fontSize: "0.9rem" }} {...register("password", { required: "Bắt buộc", minLength: { value: 8, message: "Tối thiểu 8 ký tự" } })} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </FormInput>
        <FormInput label="Xác nhận mật khẩu" icon={Lock} error={errors.confirmPassword?.message} focusColor="blue">
          <input type={showCp ? "text" : "password"} placeholder="Nhập lại mật khẩu" className="w-full bg-transparent pl-10 pr-10 py-3 outline-none text-gray-800 placeholder-gray-400" style={{ fontSize: "0.9rem" }} {...register("confirmPassword", { required: "Bắt buộc", validate: v => v === watch("password") || "Mật khẩu không khớp" })} />
          <button type="button" onClick={() => setShowCp(!showCp)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">{showCp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </FormInput>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-blue-500" {...register("terms", { required: true })} />
          <span style={{ fontSize: "0.8rem", lineHeight: 1.6 }} className="text-gray-500">Tôi đồng ý với <a href="#" className="text-blue-500 hover:underline">Điều khoản HLV</a> và <a href="#" className="text-blue-500 hover:underline">Chính sách hoa hồng</a></span>
        </label>
        {errors.terms && <p className="text-red-500" style={{ fontSize: "0.78rem" }}>Vui lòng đồng ý với điều khoản</p>}
        {registerError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span style={{ fontSize: "0.82rem" }} className="text-red-600">{registerError}</span>
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</> : "Tạo tài khoản HLV 🏋️"}
        </button>
      </form>
      <p className="text-center mt-5" style={{ fontSize: "0.88rem" }}><span className="text-gray-500">Đã có tài khoản? </span><button onClick={onSwitch} className="text-blue-500 hover:text-blue-600" style={{ fontWeight: 700 }}>Đăng nhập</button></p>
    </div>
  );
}

// ─── Main AuthPage ────────────────────────────────────────────────────────────
export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<RegisterStep>(1);
  const [role, setRole] = useState<Role | null>(null);

  const switchToRegister = () => { setMode("register"); setStep(1); setRole(null); };
  const switchToLogin = () => setMode("login");

  const renderForm = () => {
    if (mode === "login") return <LoginForm onSwitch={switchToRegister} />;
    if (step === 1) return <RolePicker onSelect={(r) => { setRole(r); setStep(2); }} />;
    if (role === "learner") return <LearnerForm onBack={() => { setStep(1); setRole(null); }} onSwitch={switchToLogin} />;
    if (role === "coach") return <CoachForm onBack={() => { setStep(1); setRole(null); }} onSwitch={switchToLogin} />;
  };

  return (
    <div className="min-h-screen flex">
      <LeftPanel mode={mode} />

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800 }} className="text-gray-900">Coach<span className="text-orange-500">Finder</span></span>
          </Link>
          <Link to="/" className="hidden lg:flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontSize: "0.85rem" }}>Trang chủ</span>
          </Link>
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 ml-auto lg:ml-0">
            <button onClick={switchToLogin} className={`px-4 py-1.5 rounded-lg transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>Đăng nhập</button>
            <button onClick={switchToRegister} className={`px-4 py-1.5 rounded-lg transition-all ${mode === "register" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>Đăng ký</button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-6">
          {renderForm()}
        </div>

        {/* Footer */}
        <div className="px-8 py-3.5 border-t border-gray-100 text-center shrink-0">
          <p style={{ fontSize: "0.75rem" }} className="text-gray-400">
            © 2026 CoachFinder · <a href="#" className="hover:text-gray-600">Bảo mật</a> · <a href="#" className="hover:text-gray-600">Điều khoản</a>
          </p>
        </div>
      </div>
    </div>
  );
}
