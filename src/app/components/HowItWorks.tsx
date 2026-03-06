import { Search, UserCheck, Calendar, Brain } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Tìm HLV phù hợp",
    desc: "Dùng bộ lọc thông minh để tìm HLV theo môn thể thao, khu vực, lịch trống và mức giá phù hợp với bạn.",
    color: "bg-orange-50 text-orange-500 border-orange-100",
    accent: "from-orange-400 to-red-400",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Xem hồ sơ & video 360°",
    desc: "Xem chứng chỉ, kinh nghiệm và thư viện video 360° của HLV. Quan sát kỹ thuật từ mọi góc độ trước khi đặt lịch.",
    color: "bg-blue-50 text-blue-500 border-blue-100",
    accent: "from-blue-400 to-cyan-400",
  },
  {
    step: "03",
    icon: Calendar,
    title: "Đặt lịch & tập luyện",
    desc: "Đặt buổi tập trực tiếp hoặc online. Sau buổi tập, upload video để AI phân tích động tác ngay lập tức.",
    color: "bg-purple-50 text-purple-500 border-purple-100",
    accent: "from-purple-400 to-violet-400",
  },
  {
    step: "04",
    icon: Brain,
    title: "AI phân tích & cải thiện",
    desc: "AI nhận dạng 33 điểm khớp, chấm điểm kỹ thuật, phát hiện lỗi và đề xuất bài tập khắc phục chính xác.",
    color: "bg-amber-50 text-amber-500 border-amber-100",
    accent: "from-amber-400 to-orange-400",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <span className="text-blue-500" style={{ fontSize: "0.85rem", fontWeight: 600 }}>⚡ Đơn giản & nhanh chóng</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2 }} className="text-gray-900 mb-4">
            Bắt Đầu Chỉ Trong 4 Bước
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Từ việc tìm HLV đến buổi tập đầu tiên, mọi thứ diễn ra nhanh chóng và dễ dàng.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative group">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-0" style={{ width: "calc(100% - 3rem)", left: "calc(50% + 3rem)" }} />
                )}

                <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Step number */}
                  <div className={`w-14 h-14 rounded-2xl ${step.color} border flex items-center justify-center mb-5`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Number badge */}
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}
                    className={`text-transparent bg-clip-text bg-gradient-to-r ${step.accent}`}
                  >
                    BƯỚC {step.step}
                  </span>

                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }} className="text-gray-900 mt-1 mb-3">
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }} className="text-gray-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}