import { Star, MapPin, BadgeCheck, Heart } from "lucide-react";
import { useState } from "react";

const COACH1 = "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZml0bmVzcyUyMGNvYWNoJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNjM1NTg1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const COACH2 = "https://images.unsplash.com/photo-1672829985408-2191772a9bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzcG9ydHMlMjBjb2FjaCUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2MzU1ODV8MA&ixlib=rb-4.1.0&q=80&w=1080";
const COACH3 = "https://images.unsplash.com/photo-1758875569414-120ebc62ada3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2glMjBneW0lMjB0cmFpbmluZyUyMHNlc3Npb258ZW58MXx8fHwxNzcyNjM1NTc5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const COACH4 = "https://images.unsplash.com/photo-1730251446354-bc3570752717?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY29hY2glMjBhdGhsZXRlJTIwdHJhY2slMjBmaWVsZHxlbnwxfHx8fDE3NzI2MzU1ODV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const coaches = [
  {
    id: 1,
    name: "Nguyễn Minh Tuấn",
    title: "HLV Thể hình & PT",
    avatar: COACH1,
    rating: 4.9,
    reviews: 312,
    location: "TP. Hồ Chí Minh",
    price: "250.000đ/giờ",
    tags: ["Giảm cân", "Tăng cơ", "Dinh dưỡng"],
    experience: "8 năm",
    badge: "Top HLV",
    badgeColor: "bg-orange-500",
    students: 156,
    verified: true,
  },
  {
    id: 2,
    name: "Trần Thị Lan Anh",
    title: "HLV Yoga & Pilates",
    avatar: COACH2,
    rating: 4.8,
    reviews: 247,
    location: "Hà Nội",
    price: "200.000đ/giờ",
    tags: ["Yoga", "Thiền định", "Linh hoạt"],
    experience: "6 năm",
    badge: "Pro",
    badgeColor: "bg-purple-500",
    students: 203,
    verified: true,
  },
  {
    id: 3,
    name: "Lê Văn Hùng",
    title: "HLV Thể lực & CrossFit",
    avatar: COACH3,
    rating: 4.7,
    reviews: 189,
    location: "Đà Nẵng",
    price: "300.000đ/giờ",
    tags: ["CrossFit", "Sức mạnh", "HIIT"],
    experience: "10 năm",
    badge: "Premium",
    badgeColor: "bg-blue-600",
    students: 98,
    verified: true,
  },
  {
    id: 4,
    name: "Phạm Quốc Bảo",
    title: "HLV Chạy bộ & Cardio",
    avatar: COACH4,
    rating: 4.9,
    reviews: 421,
    location: "TP. Hồ Chí Minh",
    price: "180.000đ/giờ",
    tags: ["Marathon", "Cardio", "Chạy bộ"],
    experience: "12 năm",
    badge: "Top HLV",
    badgeColor: "bg-green-600",
    students: 287,
    verified: true,
  },
];

export function FeaturedCoaches() {
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-4">
              <span className="text-green-600" style={{ fontSize: "0.85rem", fontWeight: 600 }}>⭐ HLV nổi bật tuần này</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2 }} className="text-gray-900">
              Gặp Gỡ Các HLV Xuất Sắc
            </h2>
            <p className="text-gray-500 mt-2" style={{ fontSize: "1rem" }}>
              Được chọn lọc dựa trên đánh giá và thành tích thực tế.
            </p>
          </div>
          <button className="mt-4 md:mt-0 text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1.5" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
            Xem tất cả HLV →
          </button>
        </div>

        {/* Coach cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={coach.avatar}
                  alt={coach.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Badge */}
                <div className={`absolute top-3 left-3 ${coach.badgeColor} text-white px-2.5 py-0.5 rounded-full`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                  {coach.badge}
                </div>

                {/* Like button */}
                <button
                  onClick={() => toggleLike(coach.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={liked.includes(coach.id) ? "#ef4444" : "none"}
                    stroke={liked.includes(coach.id) ? "#ef4444" : "#6b7280"}
                  />
                </button>

                {/* Rating overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" fill="#fbbf24" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }} className="text-gray-800">{coach.rating}</span>
                  <span style={{ fontSize: "0.75rem" }} className="text-gray-500">({coach.reviews})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">{coach.name}</h3>
                  {coach.verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                </div>
                <p style={{ fontSize: "0.8rem" }} className="text-gray-500 mb-2">{coach.title}</p>

                <div className="flex items-center gap-1 text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span style={{ fontSize: "0.8rem" }}>{coach.location}</span>
                  <span className="mx-1 text-gray-300">•</span>
                  <span style={{ fontSize: "0.8rem" }}>{coach.experience}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {coach.tags.map((tag) => (
                    <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">{coach.price}</div>
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{coach.students} học viên</div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Đặt lịch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
