import { useState, useMemo } from "react";
import {
  Search, SlidersHorizontal, Star, MapPin, Clock, Video,
  CheckCircle2, X, ChevronDown, LayoutGrid, List,
  MessageCircle, Calendar, Zap, Crown, Award, Users,
  ArrowUpDown, Heart, Filter, TrendingUp, Shield,
  ChevronRight, Play, ThumbsUp, Dumbbell, Globe, Phone
} from "lucide-react";

// ─── Images ───────────────────────────────────────────────────────────────────
const IMG = {
  coach1: "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach2: "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach3: "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach4: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach5: "https://images.unsplash.com/photo-1677170274581-b85e8469846c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach6: "https://images.unsplash.com/photo-1680759170077-e9e2d838a34c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coach7: "https://images.unsplash.com/photo-1602827114685-efbb2717da9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
type Badge = "Elite Coach" | "Pro Coach" | "Starter" | "Verified";
type Mode = "Online" | "Offline" | "Cả hai";

interface Review { author: string; avatar: string; rating: number; date: string; text: string; }
interface Coach {
  id: number; name: string; avatar: string; sport: string; specialties: string[];
  badge: Badge; rating: number; reviews: number; price: number; experience: number;
  location: string; mode: Mode; students: number; sessions: number;
  responseRate: number; bio: string; certs: string[]; available: string[];
  video360: boolean; liked: boolean; featured: boolean;
  reviewList: Review[];
}

const ALL_COACHES: Coach[] = [
  {
    id: 1, name: "Trần Văn Đức", avatar: IMG.coach1, sport: "Thể hình", specialties: ["Tăng cơ", "Giảm mỡ", "Powerlifting"],
    badge: "Elite Coach", rating: 4.9, reviews: 187, price: 250000, experience: 8,
    location: "TP. Hồ Chí Minh", mode: "Cả hai", students: 48, sessions: 856, responseRate: 98,
    bio: "HLV thể hình với 8 năm kinh nghiệm, từng đào tạo VĐV quốc gia. Chuyên về tăng cơ, giảm mỡ và powerlifting. Sử dụng AI phân tích động tác giúp học viên tiến bộ nhanh hơn 2x.",
    certs: ["ACE Certified Personal Trainer", "NSCA-CSCS", "Chứng chỉ Dinh dưỡng thể thao", "HLV TDTT cấp 2"],
    available: ["T2–T6: 06:00–21:00", "T7–CN: 07:00–17:00"],
    video360: true, liked: false, featured: true,
    reviewList: [
      { author: "Nguyễn Minh Anh", avatar: IMG.coach2, rating: 5, date: "2 ngày trước", text: "HLV Đức rất tận tâm, kỹ thuật hướng dẫn rõ ràng. Sau 3 tháng tôi tăng được 5kg cơ!" },
      { author: "Lê Hoàng Nam", avatar: IMG.coach5, rating: 5, date: "1 tuần trước", text: "Chương trình tập cá nhân hoá rất hiệu quả. Phân tích AI giúp tôi sửa form squat đúng ngay từ đầu." },
      { author: "Phạm Thu Hà", avatar: IMG.coach7, rating: 4, date: "2 tuần trước", text: "Rất hài lòng với cách HLV theo dõi tiến độ và điều chỉnh kế hoạch phù hợp." },
    ],
  },
  {
    id: 2, name: "Lê Thị Mai", avatar: IMG.coach2, sport: "Yoga", specialties: ["Hatha Yoga", "Vinyasa", "Thiền định"],
    badge: "Pro Coach", rating: 4.8, reviews: 142, price: 180000, experience: 6,
    location: "TP. Hồ Chí Minh", mode: "Cả hai", students: 35, sessions: 612, responseRate: 96,
    bio: "Chuyên gia Yoga 6 năm, đào tạo tại Rishikesh Ấn Độ. Phong cách hướng dẫn nhẹ nhàng, tập trung vào sức khoẻ cả thể chất lẫn tinh thần. Phù hợp mọi lứa tuổi.",
    certs: ["RYT 500 Yoga Alliance", "Thiền Vipassana", "Yoga Trị liệu cột sống"],
    available: ["T2–T6: 06:00–20:00", "T7: 07:00–15:00"],
    video360: true, liked: true, featured: true,
    reviewList: [
      { author: "Vũ Thanh Tâm", avatar: IMG.coach4, rating: 5, date: "3 ngày trước", text: "Lớp yoga của Mai rất thư giãn và hiệu quả. Cơn đau lưng của tôi giảm hẳn sau 1 tháng!" },
      { author: "Trần Bảo An", avatar: IMG.coach1, rating: 5, date: "1 tuần trước", text: "Hướng dẫn chi tiết, kiên nhẫn với người mới. Sẽ tiếp tục học dài hạn." },
      { author: "Ngô Thị Hương", avatar: IMG.coach7, rating: 5, date: "3 tuần trước", text: "HLV Mai rất giỏi điều chỉnh bài tập theo tình trạng sức khoẻ từng người." },
    ],
  },
  {
    id: 3, name: "Nguyễn Hoàng Minh", avatar: IMG.coach3, sport: "Tennis", specialties: ["Kỹ thuật cơ bản", "Chiến thuật thi đấu", "Fitness Tennis"],
    badge: "Elite Coach", rating: 4.9, reviews: 203, price: 350000, experience: 12,
    location: "Hà Nội", mode: "Offline", students: 52, sessions: 1240, responseRate: 99,
    bio: "Cựu VĐV Tennis quốc gia, 12 năm kinh nghiệm huấn luyện. Từng đào tạo nhiều học viên đạt giải khu vực và toàn quốc. Phương pháp dạy học hiện đại kết hợp phân tích video.",
    certs: ["ITF Level 3 Coach", "LTA Licensed Coach", "Fitness for Tennis – ITF"],
    available: ["T2–T6: 07:00–19:00", "T7–CN: 08:00–16:00"],
    video360: false, liked: false, featured: true,
    reviewList: [
      { author: "Đinh Công Sơn", avatar: IMG.coach6, rating: 5, date: "1 ngày trước", text: "HLV Minh phân tích kỹ thuật rất chi tiết. Serve của tôi cải thiện rõ rệt chỉ sau 4 buổi!" },
      { author: "Bùi Thị Lan", avatar: IMG.coach4, rating: 5, date: "5 ngày trước", text: "Chuyên nghiệp và tận tâm. Tôi đã đăng ký gói 3 tháng và rất hài lòng." },
      { author: "Lê Văn Thắng", avatar: IMG.coach5, rating: 4, date: "2 tuần trước", text: "Kiến thức chiến thuật rất sâu rộng. Phù hợp cho người muốn thi đấu nghiêm túc." },
    ],
  },
  {
    id: 4, name: "Phạm Thị Linh", avatar: IMG.coach4, sport: "Boxing", specialties: ["Kỹ thuật đấm", "Fitness Boxing", "Self-Defence"],
    badge: "Pro Coach", rating: 4.7, reviews: 98, price: 220000, experience: 5,
    location: "TP. Hồ Chí Minh", mode: "Cả hai", students: 28, sessions: 430, responseRate: 94,
    bio: "HLV Boxing nữ với phong cách năng động, vui vẻ. Chuyên đào tạo boxing fitness giảm cân và tự vệ cho phụ nữ. Không cần kinh nghiệm trước để bắt đầu!",
    certs: ["WBSS Boxing Coach Level 2", "Fitness Boxing Instructor", "Chứng chỉ Sơ cấp cứu"],
    available: ["T3–T7: 08:00–20:00", "CN: 09:00–15:00"],
    video360: true, liked: false, featured: false,
    reviewList: [
      { author: "Trần Ngọc Bích", avatar: IMG.coach7, rating: 5, date: "4 ngày trước", text: "Boxing với Linh rất vui! Vừa giảm được 8kg vừa học được kỹ năng tự vệ cơ bản." },
      { author: "Dương Thị Thu", avatar: IMG.coach2, rating: 5, date: "2 tuần trước", text: "HLV nhiệt tình, hài hước. Buổi tập không hề nhàm chán dù rất vất vả." },
      { author: "Nguyễn Khánh Linh", avatar: IMG.coach7, rating: 4, date: "1 tháng trước", text: "Chương trình tập phù hợp cho người mới hoàn toàn. Sẽ giới thiệu cho bạn bè." },
    ],
  },
  {
    id: 5, name: "Vũ Thanh Nam", avatar: IMG.coach5, sport: "Bơi lội", specialties: ["Freestyle", "Breaststroke", "Triathlon"],
    badge: "Verified", rating: 4.6, reviews: 76, price: 200000, experience: 4,
    location: "Hà Nội", mode: "Offline", students: 22, sessions: 318, responseRate: 91,
    bio: "Cựu VĐV bơi lội cấp tỉnh, chuyên dạy bơi từ cơ bản đến nâng cao. Kiên nhẫn với người mới bắt đầu và trẻ em. Có chương trình riêng cho người sợ nước.",
    certs: ["ASCA Level 2 Swimming Coach", "Red Cross Water Safety Instructor", "Lifeguard Certified"],
    available: ["T2–T6: 06:00–09:00 & 17:00–20:00", "T7–CN: 07:00–11:00"],
    video360: false, liked: false, featured: false,
    reviewList: [
      { author: "Hoàng Minh Quân", avatar: IMG.coach1, rating: 5, date: "1 tuần trước", text: "Tôi từng sợ nước nhưng sau 1 tháng học với Nam đã bơi được 25m liên tục!" },
      { author: "Lê Phương Thảo", avatar: IMG.coach4, rating: 4, date: "3 tuần trước", text: "Kiên nhẫn và tận tâm với học viên lớn tuổi. Kỹ thuật hướng dẫn dễ hiểu." },
      { author: "Bùi Đình Hưng", avatar: IMG.coach6, rating: 5, date: "1 tháng trước", text: "Chuyên môn tốt, biết cách khích lệ học viên tiến bộ từng bước." },
    ],
  },
  {
    id: 6, name: "Đỗ Minh Khoa", avatar: IMG.coach6, sport: "CrossFit", specialties: ["WOD", "Olympic Lifting", "Endurance"],
    badge: "Elite Coach", rating: 5.0, reviews: 89, price: 400000, experience: 9,
    location: "TP. Hồ Chí Minh", mode: "Cả hai", students: 31, sessions: 720, responseRate: 100,
    bio: "CrossFit Level 3 Trainer với 9 năm kinh nghiệm. Từng thi đấu CrossFit Games khu vực châu Á. Chuyên xây dựng thể lực toàn diện và cải thiện hiệu suất vận động.",
    certs: ["CrossFit Level 3 Trainer", "USAW Sports Performance Coach", "Precision Nutrition Level 1"],
    available: ["T2–T7: 05:30–21:00", "CN: 07:00–14:00"],
    video360: true, liked: true, featured: true,
    reviewList: [
      { author: "Trần Hải Long", avatar: IMG.coach1, rating: 5, date: "2 ngày trước", text: "Khoa là HLV CrossFit tốt nhất tôi từng gặp. Chương trình tập cực kỳ khoa học và hiệu quả!" },
      { author: "Nguyễn Yến Nhi", avatar: IMG.coach7, rating: 5, date: "1 tuần trước", text: "5 sao không đủ cho Khoa. Tận tâm, chuyên nghiệp, kết quả vượt mong đợi!" },
      { author: "Lê Bảo Châu", avatar: IMG.coach2, rating: 5, date: "2 tuần trước", text: "Phong độ ổn định, luôn đúng giờ và chuẩn bị bài tập rất kỹ cho từng buổi." },
    ],
  },
  {
    id: 7, name: "Nguyễn Thu Hà", avatar: IMG.coach7, sport: "Pilates", specialties: ["Mat Pilates", "Reformer", "Pre/Postnatal"],
    badge: "Pro Coach", rating: 4.9, reviews: 124, price: 160000, experience: 5,
    location: "Hà Nội", mode: "Cả hai", students: 40, sessions: 580, responseRate: 97,
    bio: "Chuyên gia Pilates với chứng chỉ quốc tế Stott Pilates. Giúp cải thiện tư thế, giảm đau lưng và tăng sức mạnh cơ core. Đặc biệt có chương trình Pilates cho bà bầu.",
    certs: ["Stott Pilates Mat & Reformer", "Pre/Postnatal Pilates", "Pilates for Back Pain"],
    available: ["T2–T6: 07:00–20:00", "T7: 08:00–14:00"],
    video360: true, liked: false, featured: false,
    reviewList: [
      { author: "Đỗ Thanh Hương", avatar: IMG.coach4, rating: 5, date: "3 ngày trước", text: "Đau lưng mãn tính của tôi giảm đến 70% sau 2 tháng học Pilates với Hà!" },
      { author: "Phan Thị Ngọc", avatar: IMG.coach2, rating: 5, date: "1 tuần trước", text: "HLV rất hiểu về giải phẫu học. Bài tập được điều chỉnh rất phù hợp với thể trạng mình." },
      { author: "Hoàng Minh Châu", avatar: IMG.coach7, rating: 5, date: "3 tuần trước", text: "Pilates reformer rất thú vị và hiệu quả hơn tôi tưởng nhiều!" },
    ],
  },
  {
    id: 8, name: "Lê Quang Hải", avatar: IMG.coach3, sport: "Chạy bộ", specialties: ["Marathon", "Trail Running", "Speed Training"],
    badge: "Starter", rating: 4.5, reviews: 54, price: 150000, experience: 3,
    location: "TP. Hồ Chí Minh", mode: "Cả hai", students: 18, sessions: 215, responseRate: 88,
    bio: "Runner nghiệp dư chinh phục 12 marathon trong 3 năm. Chia sẻ phương pháp tập luyện khoa học giúp người mới bắt đầu chạy đúng kỹ thuật và tránh chấn thương.",
    certs: ["RRCA Running Coach Level 1", "First Aid & CPR", "Sports Nutrition Basics"],
    available: ["T3–T7: 05:30–08:00 & 18:00–20:00", "CN: 05:30–09:00"],
    video360: false, liked: false, featured: false,
    reviewList: [
      { author: "Nguyễn Thành Đạt", avatar: IMG.coach5, rating: 5, date: "5 ngày trước", text: "Nhờ Hải tôi đã hoàn thành Half Marathon đầu tiên trong đời. Cảm ơn rất nhiều!" },
      { author: "Lưu Thị Mai", avatar: IMG.coach7, rating: 4, date: "2 tuần trước", text: "Hướng dẫn kỹ thuật chạy đúng giúp tôi không còn đau đầu gối nữa." },
      { author: "Vũ Ngọc Sơn", avatar: IMG.coach6, rating: 4, date: "1 tháng trước", text: "Nhiệt tình, dễ thương. Kế hoạch tập hợp lý cho người bận rộn." },
    ],
  },
];

const SPORTS = ["Tất cả", "Thể hình", "Yoga", "Tennis", "Boxing", "Bơi lội", "CrossFit", "Pilates", "Chạy bộ"];
const PRICE_OPTS = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 200K", min: 0, max: 199999 },
  { label: "200K – 350K", min: 200000, max: 350000 },
  { label: "Trên 350K", min: 350001, max: Infinity },
];
const RATING_OPTS = [
  { label: "Tất cả", min: 0 },
  { label: "4.5+", min: 4.5 },
  { label: "4.7+", min: 4.7 },
  { label: "4.9+", min: 4.9 },
];
const SORT_OPTS = [
  { id: "match", label: "Phù hợp nhất" },
  { id: "rating", label: "Đánh giá cao nhất" },
  { id: "price_asc", label: "Giá thấp nhất" },
  { id: "price_desc", label: "Giá cao nhất" },
  { id: "reviews", label: "Nhiều đánh giá nhất" },
];

const BADGE_CONFIG: Record<Badge, { icon: React.ElementType; cls: string; dotCls: string }> = {
  "Elite Coach": { icon: Crown, cls: "bg-purple-100 text-purple-600 border-purple-200", dotCls: "bg-purple-500" },
  "Pro Coach": { icon: Zap, cls: "bg-orange-100 text-orange-600 border-orange-200", dotCls: "bg-orange-500" },
  "Verified": { icon: CheckCircle2, cls: "bg-blue-100 text-blue-600 border-blue-200", dotCls: "bg-blue-500" },
  "Starter": { icon: Award, cls: "bg-gray-100 text-gray-600 border-gray-200", dotCls: "bg-gray-400" },
};

const MODE_CONFIG: Record<Mode, { cls: string }> = {
  "Online": { cls: "bg-blue-100 text-blue-600" },
  "Offline": { cls: "bg-green-100 text-green-600" },
  "Cả hai": { cls: "bg-emerald-100 text-emerald-600" },
};

// ─── Coach Card ───────────────────────────────────────────────────────────────
function CoachCard({ coach, onSelect, view }: { coach: Coach; onSelect: () => void; view: "grid" | "list" }) {
  const [liked, setLiked] = useState(coach.liked);
  const badge = BADGE_CONFIG[coach.badge];
  const BadgeIcon = badge.icon;

  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-orange-200 transition-all group flex gap-4">
        <div className="relative shrink-0">
          <img src={coach.avatar} alt={coach.name} className="w-20 h-20 rounded-2xl object-cover" />
          {coach.video360 && (
            <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 text-white px-1.5 py-0.5 rounded-lg" style={{ fontSize: "0.55rem", fontWeight: 700 }}>360°</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 800, fontSize: "1rem" }} className="text-gray-900">{coach.name}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${badge.cls}`} style={{ fontWeight: 600, fontSize: "0.68rem" }}>
                  <BadgeIcon className="w-3 h-3" />{coach.badge}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full" style={{ fontSize: "0.73rem", fontWeight: 600 }}>{coach.sport}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span style={{ fontWeight: 700, fontSize: "0.83rem" }} className="text-gray-800">{coach.rating}</span>
                  <span style={{ fontSize: "0.73rem" }} className="text-gray-400">({coach.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span style={{ fontSize: "0.73rem" }}>{coach.location}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full ${MODE_CONFIG[coach.mode].cls}`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>{coach.mode}</span>
              </div>
              <p style={{ fontSize: "0.78rem", lineHeight: 1.6 }} className="text-gray-500 mt-1.5 line-clamp-2">{coach.bio}</p>
            </div>
            <div className="text-right shrink-0">
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-orange-500">{(coach.price / 1000).toFixed(0)}K<span style={{ fontSize: "0.72rem" }} className="text-gray-400 font-normal">/buổi</span></div>
              <div style={{ fontSize: "0.7rem" }} className="text-gray-400 mt-0.5">{coach.experience} năm KN</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <button onClick={onSelect} className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
            Xem hồ sơ
          </button>
          <button
            onClick={e => { e.stopPropagation(); setLiked(!liked); }}
            className={`px-4 py-2 rounded-xl border transition-colors ${liked ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"}`}
            style={{ fontSize: "0.82rem" }}
          >
            <Heart className={`w-4 h-4 mx-auto ${liked ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-200 group flex flex-col">
      {/* Photo */}
      <div className="relative h-44 overflow-hidden">
        <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Like */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${liked ? "bg-red-500" : "bg-white/80 hover:bg-white"}`}
        >
          <Heart className={`w-4 h-4 ${liked ? "text-white fill-white" : "text-gray-500"}`} />
        </button>
        {/* Video 360 badge */}
        {coach.video360 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-lg" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
            <Video className="w-3 h-3" /> 360°
          </div>
        )}
        {/* Featured */}
        {coach.featured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-1 rounded-lg" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
            <TrendingUp className="w-3 h-3" /> Nổi bật
          </div>
        )}
        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl">
          <span style={{ fontWeight: 800, fontSize: "0.88rem" }} className="text-orange-500">{(coach.price / 1000).toFixed(0)}K</span>
          <span style={{ fontSize: "0.65rem" }} className="text-gray-400">/buổi</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900 truncate">{coach.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 600 }}>{coach.sport}</span>
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border ${badge.cls}`} style={{ fontWeight: 600, fontSize: "0.65rem" }}>
                <BadgeIcon className="w-2.5 h-2.5" />{coach.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Rating + location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">{coach.rating}</span>
            <span style={{ fontSize: "0.72rem" }} className="text-gray-400">({coach.reviews} đánh giá)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3" />
            <span style={{ fontSize: "0.72rem" }}>{coach.location.split(". ")[1] ?? coach.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2 py-0.5 rounded-full ${MODE_CONFIG[coach.mode].cls}`} style={{ fontSize: "0.67rem", fontWeight: 600 }}>{coach.mode}</span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem" }}>{coach.experience} năm KN</span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem" }}>{coach.students} HV</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-4 flex-1">
          {coach.specialties.slice(0, 3).map(s => (
            <span key={s} className="bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem" }}>{s}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onSelect}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-100 group-hover:shadow-orange-200"
          style={{ fontSize: "0.85rem", fontWeight: 700 }}
        >
          Xem hồ sơ & Đặt lịch →
        </button>
      </div>
    </div>
  );
}

// ─── Coach Detail Modal ───────────────────────────────────────────────────────
type BookingStep = "idle" | "select" | "confirm" | "success";

function CoachDetailModal({ coach, onClose }: { coach: Coach; onClose: () => void }) {
  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionMode, setSessionMode] = useState<"Online" | "Offline">("Online");
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState(false);

  const badge = BADGE_CONFIG[coach.badge];
  const BadgeIcon = badge.icon;

  const timeSlots = ["07:00", "08:30", "10:00", "14:00", "15:30", "17:00", "18:30"];
  const dates = [
    { label: "T5, 06/03", value: "2026-03-06" },
    { label: "T6, 07/03", value: "2026-03-07" },
    { label: "T7, 08/03", value: "2026-03-08" },
    { label: "CN, 09/03", value: "2026-03-09" },
    { label: "T2, 10/03", value: "2026-03-10" },
  ];

  const handleConfirm = async () => {
    setBooking(true);
    await new Promise(r => setTimeout(r, 1500));
    setBooking(false);
    setBookingStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── SUCCESS ── */}
        {bookingStep === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.4rem" }} className="text-gray-900 mb-2">Đặt lịch thành công!</div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7 }} className="text-gray-500 mb-2">
              Yêu cầu đặt lịch với <strong>{coach.name}</strong> đã được gửi.<br />
              HLV sẽ xác nhận trong vòng <strong>2 giờ</strong>.
            </p>
            <div className="bg-white rounded-2xl border border-emerald-200 p-4 text-left mt-4 w-full max-w-sm shadow-sm">
              {[
                { label: "HLV", value: coach.name },
                { label: "Môn", value: coach.sport },
                { label: "Ngày", value: dates.find(d => d.value === selectedDate)?.label ?? "" },
                { label: "Giờ", value: selectedTime },
                { label: "Hình thức", value: sessionMode },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span style={{ fontSize: "0.82rem" }} className="text-gray-500">{label}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="mt-6 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200" style={{ fontWeight: 700 }}>
              Xong ✓
            </button>
          </div>
        ) : bookingStep !== "idle" ? (
          /* ── BOOKING FLOW ── */
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <button onClick={() => setBookingStep("idle")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">Đặt lịch tập</div>
                <div style={{ fontSize: "0.78rem" }} className="text-gray-400">với {coach.name} · {coach.sport}</div>
              </div>
              <button onClick={onClose} className="ml-auto p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Hình thức */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-2.5">Hình thức</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["Online", "Offline"] as const).map(m => (
                    <button key={m} onClick={() => setSessionMode(m)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${sessionMode === m ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                      {m === "Online" ? <Globe className={`w-5 h-5 ${sessionMode === m ? "text-orange-500" : "text-gray-400"}`} /> : <MapPin className={`w-5 h-5 ${sessionMode === m ? "text-orange-500" : "text-gray-400"}`} />}
                      <div className="text-left">
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className={sessionMode === m ? "text-orange-600" : "text-gray-700"}>{m}</div>
                        <div style={{ fontSize: "0.7rem" }} className="text-gray-400">{m === "Online" ? "Qua Google Meet" : "Tại địa điểm HLV"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn ngày */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-2.5">Chọn ngày</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {dates.map(d => (
                    <button key={d.value} onClick={() => setSelectedDate(d.value)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl border-2 transition-all ${selectedDate === d.value ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                      style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn giờ */}
              {selectedDate && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-2.5">Chọn giờ</p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-xl border-2 transition-all ${selectedTime === t ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-2">Ghi chú cho HLV <span className="text-gray-400 font-normal">(tuỳ chọn)</span></p>
                <textarea rows={3} placeholder="Ví dụ: Tôi muốn tập trung vào kỹ thuật squat, đang bị đau nhẹ ở gối phải..."
                  value={note} onChange={e => setNote(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 resize-none text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p style={{ fontWeight: 700, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Tóm tắt</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "HLV", value: `${coach.name} · ${coach.sport}` },
                      { label: "Thời gian", value: `${dates.find(d => d.value === selectedDate)?.label}, ${selectedTime} – ${selectedTime.split(":").map((v, i) => i === 0 ? String(Number(v) + 1).padStart(2, "0") : v).join(":")}` },
                      { label: "Hình thức", value: sessionMode },
                      { label: "Chi phí", value: `${(coach.price / 1000).toFixed(0)},000đ`, bold: true },
                    ].map(({ label, value, bold }) => (
                      <div key={label} className="flex justify-between">
                        <span style={{ fontSize: "0.82rem" }} className="text-gray-500">{label}</span>
                        <span style={{ fontSize: "0.82rem", fontWeight: bold ? 800 : 600 }} className={bold ? "text-orange-500" : "text-gray-800"}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
              <button
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime || booking}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                {booking ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</> : "Xác nhận đặt lịch →"}
              </button>
            </div>
          </div>
        ) : (
          /* ── PROFILE VIEW ── */
          <>
            {/* Header */}
            <div className="relative shrink-0">
              <div className="h-36 overflow-hidden">
                <img src={coach.avatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
              </div>
              <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              {/* Avatar overlay */}
              <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <div className="relative">
                  <img src={coach.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                  {coach.video360 && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white px-1.5 py-0.5 rounded-lg" style={{ fontSize: "0.55rem", fontWeight: 700 }}>360°</div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Name row */}
              <div className="px-6 pt-10 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 style={{ fontWeight: 800, fontSize: "1.25rem" }} className="text-gray-900">{coach.name}</h2>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${badge.cls}`} style={{ fontWeight: 700, fontSize: "0.72rem" }}>
                        <BadgeIcon className="w-3 h-3" />{coach.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full" style={{ fontSize: "0.78rem", fontWeight: 700 }}>{coach.sport}</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span style={{ fontSize: "0.78rem" }}>{coach.location}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full ${MODE_CONFIG[coach.mode].cls}`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>{coach.mode}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div style={{ fontWeight: 900, fontSize: "1.3rem" }} className="text-orange-500">{(coach.price / 1000).toFixed(0)}K</div>
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400">đồng/buổi</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 px-6 pb-5">
                {[
                  { label: "Đánh giá", value: coach.rating.toString(), icon: Star, iconCls: "text-amber-400" },
                  { label: "Học viên", value: coach.students.toString(), icon: Users, iconCls: "text-blue-500" },
                  { label: "Buổi dạy", value: coach.sessions.toString(), icon: Calendar, iconCls: "text-emerald-500" },
                  { label: "Trả lời", value: `${coach.responseRate}%`, icon: MessageCircle, iconCls: "text-purple-500" },
                ].map(({ label, value, icon: Icon, iconCls }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${iconCls}`} />
                    <div style={{ fontWeight: 800, fontSize: "1rem" }} className="text-gray-900">{value}</div>
                    <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="px-6 space-y-5 pb-6">
                {/* Bio */}
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 mb-2">Giới thiệu</h3>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.75 }} className="text-gray-600">{coach.bio}</p>
                </div>

                {/* Specialties */}
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 mb-2">Chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map(s => (
                      <span key={s} className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-xl" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 mb-2">Chứng chỉ & Bằng cấp</h3>
                  <div className="space-y-2">
                    {coach.certs.map(c => (
                      <div key={c} className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span style={{ fontSize: "0.83rem" }} className="text-gray-700">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 mb-2">Lịch làm việc</h3>
                  <div className="space-y-1.5">
                    {coach.available.map(a => (
                      <div key={a} className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span style={{ fontSize: "0.83rem" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">
                      Đánh giá ({coach.reviews})
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">{coach.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {coach.reviewList.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2.5 mb-2">
                          <img src={r.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                          <div className="flex-1">
                            <div style={{ fontWeight: 700, fontSize: "0.83rem" }} className="text-gray-800">{r.author}</div>
                            <div style={{ fontSize: "0.7rem" }} className="text-gray-400">{r.date}</div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.82rem", lineHeight: 1.65 }} className="text-gray-600">"{r.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
              <button className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2" style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                <MessageCircle className="w-4 h-4" /> Nhắn tin
              </button>
              <button
                onClick={() => setBookingStep("select")}
                className="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                style={{ fontSize: "0.88rem", fontWeight: 700 }}
              >
                <Calendar className="w-4 h-4" /> Đặt lịch tập ngay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main FindCoach ───────────────────────────────────────────────────────────
export function FindCoach() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("Tất cả");
  const [priceIdx, setPriceIdx] = useState(0);
  const [ratingIdx, setRatingIdx] = useState(0);
  const [mode, setMode] = useState<Mode | "Tất cả">("Tất cả");
  const [sort, setSort] = useState("match");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Coach | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_COACHES.filter(c => {
      const matchQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.sport.toLowerCase().includes(query.toLowerCase()) || c.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()));
      const matchSport = sport === "Tất cả" || c.sport === sport;
      const priceOpt = PRICE_OPTS[priceIdx];
      const matchPrice = c.price >= priceOpt.min && c.price <= priceOpt.max;
      const ratingOpt = RATING_OPTS[ratingIdx];
      const matchRating = c.rating >= ratingOpt.min;
      const matchMode = mode === "Tất cả" || c.mode === mode || c.mode === "Cả hai";
      return matchQuery && matchSport && matchPrice && matchRating && matchMode;
    });

    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "reviews") list = [...list].sort((a, b) => b.reviews - a.reviews);
    else list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return list;
  }, [query, sport, priceIdx, ratingIdx, mode, sort]);

  const hasFilters = sport !== "Tất cả" || priceIdx !== 0 || ratingIdx !== 0 || mode !== "Tất cả";
  const clearFilters = () => { setSport("Tất cả"); setPriceIdx(0); setRatingIdx(0); setMode("Tất cả"); };

  return (
    <div className="space-y-5 pb-8">
      {/* ── SEARCH HEADER ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
        <div style={{ fontWeight: 800, fontSize: "1.15rem" }} className="text-white mb-1">Tìm huấn luyện viên 🔍</div>
        <p style={{ fontSize: "0.82rem" }} className="text-gray-400 mb-4">Khám phá {ALL_COACHES.length}+ HLV chuyên nghiệp trên CoachFinder</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, môn thể thao, chuyên môn..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-400 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-400 focus:bg-white/15 transition-all"
            style={{ fontSize: "0.9rem" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── SPORT TABS ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SPORTS.map(s => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`shrink-0 px-4 py-2 rounded-xl border transition-all ${sport === s ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"}`}
            style={{ fontSize: "0.82rem", fontWeight: 600 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── TOOLBAR ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${filterOpen || hasFilters ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
          style={{ fontSize: "0.85rem", fontWeight: 600 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Lọc
          {hasFilters && <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center" style={{ fontSize: "0.65rem", fontWeight: 700 }}>!</span>}
        </button>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none bg-white border-2 border-gray-200 rounded-xl pl-4 pr-9 py-2.5 outline-none focus:border-orange-400 text-gray-700 cursor-pointer"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            {SORT_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Result count */}
        <div className="text-gray-500 ml-auto" style={{ fontSize: "0.82rem" }}>
          <span style={{ fontWeight: 700 }} className="text-gray-800">{filtered.length}</span> HLV được tìm thấy
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-1.5 rounded-lg transition-all ${view === v ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600"}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTER PANEL ──────────────────────────────────── */}
      {filterOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Bộ lọc nâng cao</span>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                <X className="w-3.5 h-3.5" /> Xoá bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Price */}
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Mức giá / buổi</p>
              <div className="space-y-1.5">
                {PRICE_OPTS.map((p, i) => (
                  <label key={p.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price" checked={priceIdx === i} onChange={() => setPriceIdx(i)} className="accent-orange-500" />
                    <span style={{ fontSize: "0.83rem" }} className={priceIdx === i ? "text-orange-600 font-semibold" : "text-gray-600"}>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Rating */}
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Đánh giá tối thiểu</p>
              <div className="space-y-1.5">
                {RATING_OPTS.map((r, i) => (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" checked={ratingIdx === i} onChange={() => setRatingIdx(i)} className="accent-orange-500" />
                    <span style={{ fontSize: "0.83rem" }} className={ratingIdx === i ? "text-orange-600 font-semibold" : "text-gray-600"}>
                      {i > 0 && <Star className="inline w-3 h-3 text-amber-400 fill-amber-400 mr-1" />}{r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Mode */}
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Hình thức</p>
              <div className="space-y-1.5">
                {(["Tất cả", "Online", "Offline", "Cả hai"] as const).map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="accent-orange-500" />
                    <span style={{ fontSize: "0.83rem" }} className={mode === m ? "text-orange-600 font-semibold" : "text-gray-600"}>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Badge */}
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-600 mb-2">Cấp bậc HLV</p>
              <div className="space-y-2">
                {(Object.entries(BADGE_CONFIG) as [Badge, typeof BADGE_CONFIG[Badge]][]).map(([b, cfg]) => {
                  const BIcon = cfg.icon;
                  return (
                    <div key={b} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${cfg.cls}`} style={{ fontSize: "0.75rem" }}>
                      <BIcon className="w-3.5 h-3.5" />
                      <span style={{ fontWeight: 600 }}>{b}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COACH GRID / LIST ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Search className="w-12 h-12 mb-3 text-gray-300" />
          <div style={{ fontWeight: 600, fontSize: "1rem" }} className="text-gray-600 mb-1">Không tìm thấy HLV phù hợp</div>
          <p style={{ fontSize: "0.85rem" }} className="text-gray-400 mb-4">Thử thay đổi từ khoá hoặc điều chỉnh bộ lọc</p>
          <button onClick={() => { setQuery(""); clearFilters(); }} className="px-5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            Xoá tất cả bộ lọc
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => (
            <CoachCard key={c.id} coach={c} onSelect={() => setSelected(c)} view="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <CoachCard key={c.id} coach={c} onSelect={() => setSelected(c)} view="list" />
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && <CoachDetailModal coach={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
