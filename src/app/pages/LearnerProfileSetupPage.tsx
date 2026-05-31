import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  GraduationCap,
  HeartPulse,
  LoaderCircle,
  Phone,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  createTraineeProfile,
  getMyTraineeProfile,
  updateMyTraineeProfile,
} from "../api/trainees";
import type { Trainee } from "../types/trainee";
import { getAuthSession, updateAuthSession } from "../utils/authSession";

interface LearnerProfileFormData {
  goal: string;
  age: string;
  weight: string;
  height: string;
  phone: string;
  avatar?: FileList;
}

function ErrorNotice({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-600">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span style={{ fontSize: "0.83rem" }}>{children}</span>
    </div>
  );
}

export function LearnerProfileSetupPage() {
  const session = getAuthSession();
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<Trainee | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LearnerProfileFormData>({
    defaultValues: {
      phone: session?.phone || "",
    },
  });

  const avatarName = watch("avatar")?.[0]?.name;
  const isLearner = session?.role === "TRAINEES";
  const isEditing = !!currentProfile;

  useEffect(() => {
    if (!isLearner) {
      setProfileLoading(false);
      return;
    }

    let active = true;
    getMyTraineeProfile()
      .then(profile => {
        if (!active) return;
        setCurrentProfile(profile);
        reset({
          goal: profile.goal || "",
          age: profile.age ? String(profile.age) : "",
          weight: profile.weight ? String(profile.weight) : "",
          height: profile.height ? String(profile.height) : "",
          phone: profile.phone || session?.phone || "",
        });
      })
      .catch(() => {
        if (active) setCurrentProfile(null);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLearner, reset, session?.phone]);

  const onSubmit = async (data: LearnerProfileFormData) => {
    setSubmitError("");
    try {
      const request = {
        goal: data.goal.trim(),
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        phone: data.phone.trim(),
        avatar: data.avatar?.[0],
      };

      const profile = isEditing
        ? await updateMyTraineeProfile(request)
        : await createTraineeProfile({ ...request, avatar: data.avatar![0] });

      updateAuthSession({
        fullName: profile.fullName || session?.fullName,
        avatar: profile.avatar,
        phone: profile.phone,
      });
      navigate("/dashboard/learner", { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo hồ sơ học viên. Vui lòng thử lại.");
    }
  };

  if (!isLearner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="max-w-md rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-gray-900 mb-2" style={{ fontSize: "1.3rem", fontWeight: 800 }}>Cần tài khoản học viên</h1>
          <p className="text-gray-500 mb-6" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
            Vui lòng đăng ký hoặc đăng nhập bằng tài khoản học viên để thiết lập hồ sơ.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-xl hover:bg-orange-600 transition-colors" style={{ fontWeight: 700, fontSize: "0.88rem" }}>
            Đến trang đăng nhập <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 bg-white border-b border-gray-100 px-6 lg:px-10 flex items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Coach<span className="text-orange-500">Finder</span>
          </span>
        </Link>
        <span className="ml-auto bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
          Bước cuối: Hồ sơ học viên
        </span>
      </header>

      <main className="max-w-5xl mx-auto p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="rounded-3xl bg-gradient-to-br from-gray-950 to-orange-950 p-6 text-white h-fit">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-5">
            <Sparkles className="w-6 h-6 text-orange-300" />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.35 }} className="mb-3">
            Hoàn thiện hồ sơ để HLV tìm thấy bạn
          </h1>
          <p className="text-gray-300 mb-6" style={{ fontSize: "0.84rem", lineHeight: 1.7 }}>
            Xin chào {session.fullName || session.username}. Hồ sơ được lưu sau khi hoàn tất thành công.
          </p>
          <div className="space-y-4">
            {[
              { icon: Camera, text: "Ảnh rõ ràng giúp hồ sơ đáng tin cậy hơn" },
              { icon: Target, text: "Mục tiêu tập luyện giúp HLV lọc nhanh" },
              { icon: HeartPulse, text: "Thông số cơ thể hỗ trợ theo dõi tiến độ" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-orange-300 shrink-0 mt-0.5" />
                <span className="text-gray-300" style={{ fontSize: "0.8rem", lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-gray-900" style={{ fontSize: "1.45rem", fontWeight: 800 }}>{isEditing ? "Cập nhật hồ sơ công khai" : "Thiết lập hồ sơ công khai"}</h2>
            <p className="text-gray-500 mt-1" style={{ fontSize: "0.85rem" }}>
              Thông tin này sẽ hiển thị cho HLV khi tìm và quản lý học viên.
            </p>
          </div>

          {profileLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              <span style={{ fontSize: "0.85rem" }}>Đang kiểm tra hồ sơ...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Ảnh đại diện *</label>
                <label className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-700 truncate" style={{ fontSize: "0.84rem", fontWeight: 600 }}>{avatarName || "Tải ảnh đại diện lên"}</div>
                    <div className="text-gray-400" style={{ fontSize: "0.74rem" }}>PNG/JPG/WEBP, ảnh vuông là phù hợp nhất.</div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    {...register("avatar", {
                      validate: files => {
                        if (!isEditing && (!files || !files.length)) return "Vui lòng tải ảnh đại diện";
                        if (files && files.length > 0) {
                          const file = files[0];
                          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                            return "Chỉ chấp nhận file ảnh PNG, JPG hoặc WEBP";
                          }
                        }
                        return true;
                      },
                    })}
                  />
                </label>
                {errors.avatar && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.avatar.message}</p>}
              </div>

              <div>
                <label htmlFor="goal" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Mục tiêu tập luyện *</label>
                <textarea
                  id="goal"
                  rows={4}
                  placeholder="Ví dụ: giảm 5kg trong 3 tháng, cải thiện thể lực, học boxing cơ bản..."
                  className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-orange-400 resize-none"
                  style={{ fontSize: "0.86rem" }}
                  {...register("goal", { required: "Vui lòng nhập mục tiêu tập luyện" })}
                />
                {errors.goal && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.goal.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="age" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Tuổi *</label>
                  <div className="relative">
                    <HeartPulse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="age"
                      type="number"
                      min={1}
                      max={120}
                      placeholder="25"
                      className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-3.5 py-3 outline-none focus:border-orange-400"
                      style={{ fontSize: "0.86rem" }}
                      {...register("age", { required: "Bắt buộc", min: { value: 1, message: "Tuổi không hợp lệ" }, max: { value: 120, message: "Tuổi không hợp lệ" } })}
                    />
                  </div>
                  {errors.age && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.age.message}</p>}
                </div>

                <div>
                  <label htmlFor="weight" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Cân nặng (kg) *</label>
                  <div className="relative">
                    <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="weight"
                      type="number"
                      min={1}
                      step="0.1"
                      placeholder="60"
                      className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-3.5 py-3 outline-none focus:border-orange-400"
                      style={{ fontSize: "0.86rem" }}
                      {...register("weight", { required: "Bắt buộc", min: { value: 1, message: "Cân nặng không hợp lệ" } })}
                    />
                  </div>
                  {errors.weight && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.weight.message}</p>}
                </div>

                <div>
                  <label htmlFor="height" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Chiều cao (cm) *</label>
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="height"
                      type="number"
                      min={1}
                      step="0.1"
                      placeholder="170"
                      className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-3.5 py-3 outline-none focus:border-orange-400"
                      style={{ fontSize: "0.86rem" }}
                      {...register("height", { required: "Bắt buộc", min: { value: 1, message: "Chiều cao không hợp lệ" } })}
                    />
                  </div>
                  {errors.height && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.height.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Số điện thoại *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="0901234567"
                    className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-3.5 py-3 outline-none focus:border-orange-400"
                    style={{ fontSize: "0.86rem" }}
                    {...register("phone", {
                      required: "Vui lòng nhập số điện thoại",
                      pattern: { value: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                    })}
                  />
                </div>
                {errors.phone && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.phone.message}</p>}
              </div>

              {submitError && <ErrorNotice>{submitError}</ErrorNotice>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                style={{ fontSize: "0.92rem", fontWeight: 700 }}
              >
                {isSubmitting ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Đang lưu hồ sơ...</> : <>{isEditing ? "Cập nhật hồ sơ học viên" : "Hoàn tất hồ sơ học viên"} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
