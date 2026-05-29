import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import {
  AlertCircle, ArrowRight, Camera, Dumbbell, LoaderCircle,
  MapPin, ShieldCheck, Sparkles, Wallet
} from "lucide-react";
import { createCoachProfile, getCategories, getCurrentCoachProfile, updateCurrentCoachProfile } from "../api/coaches";
import type { Category, CoachDetail, TeachingType } from "../types/coach";
import { getAuthSession, updateAuthSession } from "../utils/authSession";

interface CoachProfileFormData {
  categoryId: string;
  price: string;
  experienceYears: string;
  avatar?: FileList;
  location: string;
  teachingType: TeachingType;
  bio: string;
}

function ErrorNotice({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-600">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span style={{ fontSize: "0.83rem" }}>{children}</span>
    </div>
  );
}

export function CoachProfileSetupPage() {
  const session = getAuthSession();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [currentProfile, setCurrentProfile] = useState<CoachDetail | null>(null);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CoachProfileFormData>({
    defaultValues: { teachingType: "BOTH" },
  });

  const avatarName = watch("avatar")?.[0]?.name;
  const isCoach = session?.role === "COACHES";
  const isEditing = !!currentProfile;

  const loadCategories = async () => {
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      setCategories([]);
      setCategoryError(error instanceof Error ? error.message : "Không thể tải danh mục.");
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isCoach) {
      setCategoryLoading(false);
      return;
    }

    let active = true;
    setCategoryLoading(true);
    setCategoryError("");
    getCategories()
      .then(result => {
        if (active) setCategories(result);
      })
      .catch(error => {
        if (active) {
          setCategoryError(error instanceof Error ? error.message : "Không thể tải danh mục.");
        }
      })
      .finally(() => {
        if (active) setCategoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isCoach]);

  useEffect(() => {
    if (!isCoach) return;

    let active = true;
    getCurrentCoachProfile()
      .then(profile => {
        if (!active) return;
        setCurrentProfile(profile);
        const matchedCategory = categories.find(category => category.name === profile.category);
        reset({
          categoryId: String(profile.categoryId ?? matchedCategory?.id ?? ""),
          price: profile.price ? String(profile.price) : "",
          experienceYears: profile.experienceYears ? String(profile.experienceYears) : "",
          location: profile.location || "",
          teachingType: profile.teachingType || "BOTH",
          bio: profile.bio || "",
        });
      })
      .catch(() => {
        if (active) setCurrentProfile(null);
      });

    return () => {
      active = false;
    };
  }, [categories, isCoach, reset]);

  const onSubmit = async (data: CoachProfileFormData) => {
    setSubmitError("");
    try {
      const request = {
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        experienceYears: Number(data.experienceYears),
        avatar: data.avatar?.[0],
        location: data.location.trim(),
        teachingType: data.teachingType,
        bio: data.bio.trim(),
      };
      const coach = isEditing
        ? await updateCurrentCoachProfile(request)
        : await createCoachProfile({ ...request, avatar: data.avatar![0] });
      updateAuthSession({
        coachId: coach.id,
        fullName: coach.fullName || session?.fullName,
        avatar: coach.avatar,
        category: coach.category,
      });
      navigate("/dashboard/coach", { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo hồ sơ HLV. Vui lòng thử lại.");
    }
  };

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="max-w-md rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-gray-900 mb-2" style={{ fontSize: "1.3rem", fontWeight: 800 }}>Cần tài khoản HLV</h1>
          <p className="text-gray-500 mb-6" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
            Vui lòng đăng ký hoặc đăng nhập bằng tài khoản huấn luyện viên để thiết lập hồ sơ.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl hover:bg-blue-600 transition-colors" style={{ fontWeight: 700, fontSize: "0.88rem" }}>
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Coach<span className="text-blue-500">Finder</span>
          </span>
        </Link>
        <span className="ml-auto bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
          Bước cuối: Hồ sơ HLV
        </span>
      </header>

      <main className="max-w-5xl mx-auto p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="rounded-3xl bg-gradient-to-br from-gray-950 to-blue-950 p-6 text-white h-fit">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-5">
            <Sparkles className="w-6 h-6 text-blue-300" />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.35 }} className="mb-3">
            Hoàn thiện hồ sơ để học viên tìm thấy bạn
          </h1>
          <p className="text-gray-300 mb-6" style={{ fontSize: "0.84rem", lineHeight: 1.7 }}>
            Xin chào {session.fullName || session.username}. Hồ sơ được công bố sau khi lưu thành công.
          </p>
          <div className="space-y-4">
            {[
              { icon: Camera, text: "Ảnh rõ ràng giúp hồ sơ đáng tin cậy hơn" },
              { icon: MapPin, text: "Khu vực và hình thức giúp học viên lọc nhanh" },
              { icon: Wallet, text: "Mức giá hiển thị trong kết quả tìm kiếm" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <span className="text-gray-300" style={{ fontSize: "0.8rem", lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-gray-900" style={{ fontSize: "1.45rem", fontWeight: 800 }}>{isEditing ? "Cập nhật hồ sơ công khai" : "Thiết lập hồ sơ công khai"}</h2>
            <p className="text-gray-500 mt-1" style={{ fontSize: "0.85rem" }}>Thông tin này sẽ hiển thị cho học viên khi tìm HLV.</p>
          </div>

          {categoryError && (
            <div className="mb-5 space-y-3">
              <ErrorNotice>{categoryError}</ErrorNotice>
              <button
                type="button"
                onClick={loadCategories}
                disabled={categoryLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-blue-600 disabled:opacity-60"
                style={{ fontSize: "0.82rem", fontWeight: 700 }}
              >
                {categoryLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
                Tải lại môn huấn luyện
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Ảnh đại diện *</label>
              <label className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-gray-700 truncate" style={{ fontSize: "0.84rem", fontWeight: 600 }}>{avatarName || "Tải ảnh đại diện lên"}</div>
                  <div className="text-gray-400" style={{ fontSize: "0.74rem" }}>Bắt buộc theo API hiện tại. PNG/JPG, ảnh vuông là phù hợp nhất.</div>
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
                        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                          return "Chỉ chấp nhận file ảnh (PNG, JPG, WEBP)";
                        }
                      }
                      return true;
                    } 
                  })}
                />
              </label>
              {errors.avatar && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.avatar.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoryId" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Môn huấn luyện *</label>
                <select
                  id="categoryId"
                  disabled={categoryLoading}
                  className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400 disabled:opacity-60"
                  style={{ fontSize: "0.86rem" }}
                  {...register("categoryId", { required: "Vui lòng chọn môn huấn luyện" })}
                >
                  <option value="">{categoryLoading ? "Đang tải danh mục..." : "Chọn môn thể thao"}</option>
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.categoryId.message}</p>}
                {!categoryLoading && categories.length === 0 && !categoryError && (
                  <p className="text-gray-400 mt-1.5" style={{ fontSize: "0.76rem" }}>Chưa có môn huấn luyện trên hệ thống.</p>
                )}
              </div>

              <div>
                <label htmlFor="experienceYears" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Số năm kinh nghiệm *</label>
                <input
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="Ví dụ: 5"
                  className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400"
                  style={{ fontSize: "0.86rem" }}
                  {...register("experienceYears", { required: "Vui lòng nhập kinh nghiệm", min: { value: 0, message: "Kinh nghiệm không hợp lệ" } })}
                />
                {errors.experienceYears && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.experienceYears.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Giá mỗi buổi (VNĐ) *</label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  placeholder="Ví dụ: 250000"
                  className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400"
                  style={{ fontSize: "0.86rem" }}
                  {...register("price", { required: "Vui lòng nhập mức giá", min: { value: 0, message: "Mức giá không hợp lệ" } })}
                />
                {errors.price && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.price.message}</p>}
              </div>

              <div>
                <label htmlFor="teachingType" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Hình thức dạy *</label>
                <select
                  id="teachingType"
                  className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400"
                  style={{ fontSize: "0.86rem" }}
                  {...register("teachingType", { required: true })}
                >
                  <option value="BOTH">Online và trực tiếp</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Trực tiếp</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Khu vực hoạt động *</label>
              <input
                id="location"
                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400"
                style={{ fontSize: "0.86rem" }}
                {...register("location", { required: "Vui lòng nhập khu vực hoạt động" })}
              />
              {errors.location && <p className="text-red-500 mt-1.5" style={{ fontSize: "0.76rem" }}>{errors.location.message}</p>}
            </div>

            <div>
              <label htmlFor="bio" className="block text-gray-700 mb-2" style={{ fontSize: "0.84rem", fontWeight: 700 }}>Giới thiệu bản thân <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Chia sẻ kinh nghiệm, phong cách huấn luyện và đối tượng học viên phù hợp..."
                className="w-full rounded-xl border-2 border-gray-200 px-3.5 py-3 outline-none focus:border-blue-400 resize-none"
                style={{ fontSize: "0.86rem" }}
                {...register("bio")}
              />
            </div>

            {submitError && <ErrorNotice>{submitError}</ErrorNotice>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{ fontSize: "0.92rem", fontWeight: 700 }}
            >
              {isSubmitting ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Đang lưu hồ sơ...</> : <>{isEditing ? "Cập nhật hồ sơ HLV" : "Công bố hồ sơ HLV"} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
