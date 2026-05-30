import { useState } from "react";
import { User, Lock, Bell, Camera, Save } from "lucide-react";
import { getAuthSession } from "../utils/authSession";

export function CoachSettings() {
  const session = getAuthSession();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
              activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
              activeTab === "security" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Lock className="w-4 h-4" /> Bảo mật & Đăng nhập
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
              activeTab === "notifications" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-4 h-4" /> Cài đặt thông báo
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative group">
                  {session?.avatar ? (
                    <img src={session.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-md flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{session?.fullName?.charAt(0) || "C"}</span>
                    </div>
                  )}
                  <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Họ và tên</label>
                      <input type="text" defaultValue={session?.fullName || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
                      <input type="email" defaultValue={session?.email || session?.username || ""} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bio / Chuyên môn</label>
                    <textarea rows={3} placeholder="Mô tả ngắn về bạn..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
                      <Save className="w-4 h-4" /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-500 mt-1">Đảm bảo tài khoản của bạn luôn được bảo mật</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mật khẩu hiện tại</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Xác nhận mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                </div>
                <div className="pt-2">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-amber-200">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900">Email thông báo booking mới</h4>
                  <p className="text-sm text-gray-500 mt-0.5">Nhận email khi có học viên đăng ký lịch tập</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
