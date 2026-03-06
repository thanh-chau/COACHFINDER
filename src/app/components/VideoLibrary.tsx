import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, Filter, Grid3X3, List, Play, Star, Eye, Clock,
  Heart, Share2, Download, BookmarkPlus, ChevronRight,
  Globe, Upload, X, ChevronLeft, Badge, Flame, Trophy,
  Users, Zap, CheckCircle, MoreHorizontal, ThumbsUp,
  Volume2, VolumeX, Maximize2, RotateCcw, Compass
} from "lucide-react";
import { Video360Player } from "./Video360Player";

// ─── Images ──────────────────────────────────────────────────────────────────
const IMG = {
  gym:      "https://images.unsplash.com/photo-1687350119840-3e2cc5977e92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  badminton:"https://images.unsplash.com/photo-1771909712463-b1c7b542f845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  yoga:     "https://images.unsplash.com/photo-1602827114685-efbb2717da9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  boxing:   "https://images.unsplash.com/photo-1620123449238-abaeff62d48d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  swimming: "https://images.unsplash.com/photo-1768576544598-7ad9f8a1d9a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  running:  "https://images.unsplash.com/photo-1765607081625-1df91787f8fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  lifting:  "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  football: "https://images.unsplash.com/photo-1652190416150-d501a60291b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  cycling:  "https://images.unsplash.com/photo-1762014594439-3271cc8a7e3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  coach1:   "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  coach2:   "https://images.unsplash.com/photo-1761034278072-baa90a7d28d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  coach3:   "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  coach4:   "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
};

// ─── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "Tất cả",    emoji: "🎬", count: 128 },
  { id: "strength",  label: "Thể hình",  emoji: "💪", count: 34  },
  { id: "cardio",    label: "Cardio",    emoji: "🏃", count: 22  },
  { id: "martial",   label: "Võ thuật",  emoji: "🥊", count: 18  },
  { id: "yoga",      label: "Yoga",      emoji: "🧘", count: 15  },
  { id: "sports",    label: "Thể thao",  emoji: "⚽", count: 39  },
];

const SORT_OPTIONS = ["Mới nhất", "Xem nhiều nhất", "Đánh giá cao", "Thời lượng ngắn"];

interface VideoItem {
  id: number;
  title: string;
  coachName: string;
  coachAvatar: string;
  coachVerified: boolean;
  sport: string;
  sportEmoji: string;
  category: string;
  thumbnail: string;
  duration: string;
  views: string;
  likes: number;
  rating: number;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  is360: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  tags: string[];
  description: string;
  uploadedAt: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: "Kỹ thuật Squat hoàn hảo — Toàn góc 360°",
    coachName: "Trần Văn Đức",
    coachAvatar: IMG.coach1,
    coachVerified: true,
    sport: "Thể hình",
    sportEmoji: "💪",
    category: "strength",
    thumbnail: IMG.gym,
    duration: "18:42",
    views: "24.5K",
    likes: 1842,
    rating: 4.9,
    level: "Trung cấp",
    is360: true,
    isFeatured: true,
    isHot: true,
    tags: ["squat", "powerlifting", "kỹ thuật", "360°"],
    description: "Phân tích toàn diện kỹ thuật Squat từ mọi góc độ. Video 360° cho phép bạn xoay và quan sát chính xác vị trí cơ thể, góc gối, độ sâu và cách phân bổ trọng lượng.",
    uploadedAt: "2 ngày trước",
  },
  {
    id: 2,
    title: "Smash cầu lông — Phân tích góc xoay tay",
    coachName: "Nguyễn Minh Khoa",
    coachAvatar: IMG.coach3,
    coachVerified: true,
    sport: "Cầu lông",
    sportEmoji: "🏸",
    category: "sports",
    thumbnail: IMG.badminton,
    duration: "12:15",
    views: "18.2K",
    likes: 1256,
    rating: 4.8,
    level: "Trung cấp",
    is360: true,
    isNew: true,
    tags: ["cầu lông", "smash", "kỹ thuật", "360°"],
    description: "Xem và học kỹ thuật smash cầu lông từ góc 360°. Quan sát chi tiết chuyển động cổ tay, xoay thân và bước chân.",
    uploadedAt: "5 ngày trước",
  },
  {
    id: 3,
    title: "Yoga Flow buổi sáng — Đầy đủ 30 phút",
    coachName: "Lê Thị Mai",
    coachAvatar: IMG.coach2,
    coachVerified: true,
    sport: "Yoga",
    sportEmoji: "🧘",
    category: "yoga",
    thumbnail: IMG.yoga,
    duration: "30:00",
    views: "41.8K",
    likes: 3214,
    rating: 5.0,
    level: "Cơ bản",
    is360: false,
    isHot: true,
    tags: ["yoga", "buổi sáng", "linh hoạt", "thư giãn"],
    description: "Chuỗi yoga buổi sáng 30 phút giúp kéo căng toàn thân, tăng sự linh hoạt và tạo năng lượng tích cực cho ngày mới.",
    uploadedAt: "1 tuần trước",
  },
  {
    id: 4,
    title: "Jab — Cross — Hook: Kỹ thuật đấm boxing cơ bản",
    coachName: "Phạm Quốc Hùng",
    coachAvatar: IMG.coach3,
    coachVerified: false,
    sport: "Boxing",
    sportEmoji: "🥊",
    category: "martial",
    thumbnail: IMG.boxing,
    duration: "22:30",
    views: "15.6K",
    likes: 987,
    rating: 4.7,
    level: "Cơ bản",
    is360: true,
    tags: ["boxing", "jab", "cross", "hook", "360°"],
    description: "Học ba đòn đấm cơ bản trong boxing qua video 360°. Từng chuyển động đều được phân tích chi tiết từ nhiều góc độ.",
    uploadedAt: "2 tuần trước",
  },
  {
    id: 5,
    title: "Kỹ thuật bơi tự do — Cách thở đúng",
    coachName: "Đỗ Anh Tú",
    coachAvatar: IMG.coach4,
    coachVerified: true,
    sport: "Bơi lội",
    sportEmoji: "🏊",
    category: "sports",
    thumbnail: IMG.swimming,
    duration: "25:18",
    views: "9.3K",
    likes: 654,
    rating: 4.6,
    level: "Cơ bản",
    is360: false,
    tags: ["bơi lội", "freestyle", "kỹ thuật thở"],
    description: "Hướng dẫn kỹ thuật bơi tự do và cách thở đúng chuẩn. Video quay dưới nước và trên mặt nước cho góc nhìn toàn diện.",
    uploadedAt: "3 tuần trước",
  },
  {
    id: 6,
    title: "Deadlift 100kg — Bài tập nâng cao",
    coachName: "Trần Văn Đức",
    coachAvatar: IMG.coach1,
    coachVerified: true,
    sport: "Thể hình",
    sportEmoji: "🏋️",
    category: "strength",
    thumbnail: IMG.lifting,
    duration: "15:45",
    views: "32.1K",
    likes: 2567,
    rating: 4.9,
    level: "Nâng cao",
    is360: true,
    isHot: true,
    tags: ["deadlift", "powerlifting", "nâng cao", "360°"],
    description: "Phân tích deadlift 100kg từ góc 360°. Học cách bảo vệ cột sống, kỹ thuật hít thở và cách phân bổ lực đúng chuẩn.",
    uploadedAt: "1 tháng trước",
  },
  {
    id: 7,
    title: "Kỹ thuật chạy sprint — Tăng tốc đỉnh cao",
    coachName: "Nguyễn Văn Long",
    coachAvatar: IMG.coach4,
    coachVerified: false,
    sport: "Điền kinh",
    sportEmoji: "🏃",
    category: "cardio",
    thumbnail: IMG.running,
    duration: "11:20",
    views: "7.8K",
    likes: 521,
    rating: 4.5,
    level: "Trung cấp",
    is360: false,
    isNew: true,
    tags: ["chạy", "sprint", "tốc độ"],
    description: "Cải thiện kỹ thuật chạy sprint với các bài phân tích bước chân, góc cơ thể và nhịp thở.",
    uploadedAt: "4 ngày trước",
  },
  {
    id: 8,
    title: "Đá bóng kỹ thuật — Sút bóng chuẩn xác",
    coachName: "Hoàng Minh Đức",
    coachAvatar: IMG.coach3,
    coachVerified: true,
    sport: "Bóng đá",
    sportEmoji: "⚽",
    category: "sports",
    thumbnail: IMG.football,
    duration: "19:55",
    views: "28.4K",
    likes: 2103,
    rating: 4.8,
    level: "Trung cấp",
    is360: true,
    tags: ["bóng đá", "sút bóng", "kỹ thuật", "360°"],
    description: "Kỹ thuật sút bóng chính xác từ nhiều góc độ 360°. Phân tích tiếp cận bóng, đặt chân trụ và tư thế cơ thể.",
    uploadedAt: "2 tuần trước",
  },
  {
    id: 9,
    title: "Đạp xe leo núi — Chinh phục dốc 30°",
    coachName: "Lê Thị Mai",
    coachAvatar: IMG.coach2,
    coachVerified: true,
    sport: "Đạp xe",
    sportEmoji: "🚴",
    category: "cardio",
    thumbnail: IMG.cycling,
    duration: "28:10",
    views: "6.1K",
    likes: 389,
    rating: 4.6,
    level: "Nâng cao",
    is360: false,
    tags: ["đạp xe", "leo núi", "nâng cao"],
    description: "Kỹ thuật đạp xe leo núi với địa hình dốc cao. Tư thế cơ thể, cách đứng pedale và chiến lược tiêu hao năng lượng.",
    uploadedAt: "5 ngày trước",
  },
];

// ─── Panoramic 360° Viewer (CSS-based mock) ─────────────────────────────────
function PanoramicViewer({ thumbnail, title }: { thumbnail: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lon, setLon] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const dragStart = useRef({ x: 0, lon: 0 });
  const animRef = useRef<number>();

  // Auto-rotate when playing
  useEffect(() => {
    if (isPlaying) {
      const tick = () => {
        setLon(l => (l + 0.15) % 360);
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, lon };
  }, [lon]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    setLon((dragStart.current.lon - dx * 0.3 + 360) % 360);
  }, [isDragging]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, lon };
  }, [lon]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    setLon((dragStart.current.lon - dx * 0.3 + 360) % 360);
  }, [isDragging]);

  // Translate lon to X offset percent (full panorama = 200% wide, shifts 0→100% over 0→360°)
  const bgX = (lon / 360) * 100;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black select-none" style={{ aspectRatio: "16/9" }}>
      {/* Panoramic background */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: "200% 100%",
          backgroundPositionX: `${bgX}%`,
          backgroundPositionY: "center",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging ? "none" : "background-position-x 0.05s linear",
          filter: "brightness(0.92)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />

      {/* 360° badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/20">
        <Globe className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-white" style={{ fontSize: "0.72rem", fontWeight: 700 }}>360°</span>
      </div>

      {/* Compass */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <CompassMini lon={lon} />
      </div>

      {/* Drag hint */}
      {!isDragging && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 opacity-80">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
            <span className="text-white/80 bg-black/40 px-3 py-1 rounded-full" style={{ fontSize: "0.72rem" }}>
              ↔ Kéo để xoay góc nhìn 360°
            </span>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        {/* Progress */}
        <div className="w-full bg-white/20 rounded-full h-1 mb-3 cursor-pointer">
          <div className="h-1 rounded-full bg-violet-400" style={{ width: isPlaying ? "34%" : "0%",
            transition: "width 0.5s linear" }} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <button
            onClick={() => setIsMuted(m => !m)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <span className="text-white/70 ml-1" style={{ fontSize: "0.75rem" }}>
            {isPlaying ? "6:22" : "0:00"} / 18:42
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setLon(0)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Lon indicator */}
      <div className="absolute bottom-16 left-4 text-white/50" style={{ fontSize: "0.65rem" }}>
        {Math.round(lon)}°
      </div>
    </div>
  );
}

// ─── Compass Mini ─────────────────────────────────────────────────────────────
function CompassMini({ lon }: { lon: number }) {
  const dirs = [{ l: "N", d: 0 }, { l: "E", d: 90 }, { l: "S", d: 180 }, { l: "W", d: 270 }];
  return (
    <div className="w-10 h-10">
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md">
        <circle cx="20" cy="20" r="18" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {dirs.map(({ l, d }) => {
          const rad = ((d - lon) * Math.PI) / 180;
          const x = 20 + 11 * Math.sin(rad);
          const y = 20 - 11 * Math.cos(rad);
          return (
            <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill={l === "N" ? "#f87171" : "rgba(255,255,255,0.65)"}
              fontSize="7" fontWeight="700">{l}</text>
          );
        })}
        <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

// ─── Pause icon (missing from import) ─────────────────────────────────────────
function Pause({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: VideoItem["level"] }) {
  const map = {
    "Cơ bản":   "bg-emerald-100 text-emerald-700",
    "Trung cấp":"bg-blue-100 text-blue-700",
    "Nâng cao": "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full ${map[level]}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>
      {level}
    </span>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video, onClick, isLarge = false }: {
  video: VideoItem; onClick: () => void; isLarge?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${isLarge ? "" : ""}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img src={video.thumbnail} alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>

        {/* 360 badge */}
        {video.is360 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-violet-600/90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Globe className="w-3 h-3 text-white" />
            <span className="text-white" style={{ fontSize: "0.62rem", fontWeight: 700 }}>360°</span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {video.isHot && (
            <span className="flex items-center gap-0.5 bg-orange-500/90 text-white px-2 py-0.5 rounded-lg" style={{ fontSize: "0.62rem", fontWeight: 700 }}>
              <Flame className="w-2.5 h-2.5" /> HOT
            </span>
          )}
          {video.isNew && (
            <span className="bg-emerald-500/90 text-white px-2 py-0.5 rounded-lg" style={{ fontSize: "0.62rem", fontWeight: 700 }}>
              MỚI
            </span>
          )}
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded-lg" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
          {video.duration}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start gap-2.5">
          <img src={video.coachAvatar} alt={video.coachName}
            className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-gray-900 leading-snug line-clamp-2" style={{ fontWeight: 700, fontSize: isLarge ? "1rem" : "0.88rem" }}>
                {video.title}
              </h3>
              <button
                onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
                className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
              >
                <BookmarkPlus className={`w-4 h-4 ${saved ? "text-violet-500 fill-violet-100" : "text-gray-400"}`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-600">{video.coachName}</span>
              {video.coachVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
              )}
              <span className="text-gray-300">·</span>
              <span style={{ fontSize: "0.72rem" }} className="text-gray-400">{video.sportEmoji} {video.sport}</span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className="text-gray-700">{video.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span style={{ fontSize: "0.7rem" }}>{video.views}</span>
                </div>
                <LevelBadge level={video.level} />
              </div>
              <button
                onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${liked ? "bg-red-50 text-red-500" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
                <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{liked ? video.likes + 1 : video.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Video Detail Modal ────────────────────────────────────────────────────────
function VideoDetail({ video, onClose, onVideoSelect }: {
  video: VideoItem;
  onClose: () => void;
  onVideoSelect: (v: VideoItem) => void;
}) {
  const related = VIDEOS.filter(v => v.id !== video.id && (v.category === video.category || v.coachName === video.coachName)).slice(0, 4);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <Globe className="w-4 h-4 text-violet-500" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-violet-600">Video 360°</span>
            <span className="text-gray-300">/</span>
            <span style={{ fontSize: "0.82rem" }} className="truncate max-w-[200px]">{video.title}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row">
          {/* Left: Player + Info */}
          <div className="flex-1 min-w-0 p-5 space-y-4">
            {/* Player */}
            {video.is360 ? (
              <PanoramicViewer thumbnail={video.thumbnail} title={video.title} />
            ) : (
              <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "16/9" }}>
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-lg" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  {video.duration}
                </div>
              </div>
            )}

            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-gray-900 flex-1" style={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.3 }}>
                  {video.title}
                </h2>
                {video.is360 && (
                  <div className="shrink-0 flex items-center gap-1.5 bg-violet-50 border border-violet-200 px-2.5 py-1.5 rounded-xl">
                    <Globe className="w-3.5 h-3.5 text-violet-500" />
                    <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className="text-violet-600">360° Interactive</span>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-800">{video.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-3.5 h-3.5" />
                  <span style={{ fontSize: "0.82rem" }}>{video.views} lượt xem</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span style={{ fontSize: "0.82rem" }}>{video.duration}</span>
                </div>
                <LevelBadge level={video.level} />
                <span style={{ fontSize: "0.75rem" }} className="text-gray-400">{video.uploadedAt}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setLiked(l => !l)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all ${liked ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
                  {liked ? video.likes + 1 : video.likes}
                </button>
                <button
                  onClick={() => setSaved(s => !s)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all ${saved ? "bg-violet-50 border-violet-200 text-violet-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {saved ? "Đã lưu" : "Lưu lại"}
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  <Download className="w-4 h-4" />
                  Tải về
                </button>
              </div>
            </div>

            {/* Coach info */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <img src={video.coachAvatar} alt={video.coachName}
                className="w-12 h-12 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">{video.coachName}</span>
                  {video.coachVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-50" />}
                </div>
                <div style={{ fontSize: "0.75rem" }} className="text-gray-500">
                  HLV chuyên nghiệp · {video.sportEmoji} {video.sport}
                </div>
              </div>
              <button className="shrink-0 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                Đặt lịch
              </button>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 mb-2">Mô tả</div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }} className="text-gray-600">{video.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {video.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Upload your own */}
            {video.is360 && (
              <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900">Upload video 360° của bạn</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-gray-500">Nhận phân tích AI từ HLV · Hỗ trợ MP4, MOV, WebM</div>
                  </div>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="shrink-0 px-3 py-1.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
                    style={{ fontSize: "0.78rem", fontWeight: 700 }}
                  >
                    Upload
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Related Videos */}
          <div className="xl:w-80 shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 p-5 space-y-4">
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Video liên quan</div>
            <div className="space-y-3">
              {related.map(v => (
                <div
                  key={v.id}
                  className="flex gap-3 cursor-pointer group"
                  onClick={() => onVideoSelect(v)}
                >
                  <div className="relative w-28 rounded-xl overflow-hidden shrink-0" style={{ aspectRatio: "16/9" }}>
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {v.is360 && (
                      <div className="absolute bottom-1 left-1 bg-violet-600/90 px-1.5 py-0.5 rounded-md">
                        <span className="text-white" style={{ fontSize: "0.55rem", fontWeight: 700 }}>360°</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.6rem", fontWeight: 600 }}>
                      {v.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.4 }}>
                      {v.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span style={{ fontSize: "0.7rem" }} className="text-gray-500">{v.coachName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{v.views}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span style={{ fontSize: "0.68rem", fontWeight: 600 }} className="text-gray-600">{v.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload 360° with Three.js player */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-violet-500" />
                <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-violet-700">Player 360° WebGL</span>
              </div>
              <p style={{ fontSize: "0.75rem", lineHeight: 1.6 }} className="text-gray-600 mb-3">
                Upload video 360° của bạn và xem với công nghệ Three.js — xoay toàn hướng bằng chuột hoặc cảm ứng.
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="w-full py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: "0.8rem", fontWeight: 700 }}
              >
                <Upload className="w-4 h-4" /> Mở Video 360° Player
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Three.js 360° uploader modal */}
      {showUploader && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploader(false)}>
          <div className="w-full max-w-3xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white">Video 360° Player — Three.js WebGL</span>
              </div>
              <button onClick={() => setShowUploader(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>
            <div className="p-5">
              <Video360Player />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main VideoLibrary Component ──────────────────────────────────────────────
interface VideoLibraryProps {
  onNavigate?: (view: string) => void;
}

export function VideoLibrary({ onNavigate }: VideoLibraryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Mới nhất");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [show360Only, setShow360Only] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filtered = VIDEOS.filter(v => {
    const matchCat = activeCategory === "all" || v.category === activeCategory;
    const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const match360 = !show360Only || v.is360;
    return matchCat && matchSearch && match360;
  });

  const featured = VIDEOS.find(v => v.isFeatured)!;

  return (
    <div className="space-y-5">

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🎬", label: "Tổng video",    value: "128",  sub: "từ HLV chuyên nghiệp" },
          { icon: "🌐", label: "Video 360°",    value: "54",   sub: "xem được trực tiếp"  },
          { icon: "👁️", label: "Lượt xem",      value: "184K", sub: "cộng đồng CoachFinder"  },
          { icon: "⭐", label: "Đánh giá TB",   value: "4.8",  sub: "từ học viên"         },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-500">{s.label}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.5rem", lineHeight: 1 }} className="text-gray-900">{s.value}</div>
            <div style={{ fontSize: "0.68rem" }} className="text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Featured Video ── */}
      <div className="relative bg-gradient-to-br from-gray-900 to-violet-950 rounded-3xl overflow-hidden border border-white/5 shadow-xl">
        {/* BG image */}
        <img src={featured.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/60 to-transparent" />

        <div className="relative flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2.5 py-1 rounded-xl" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                <Flame className="w-3 h-3" /> Video nổi bật
              </span>
              <span className="flex items-center gap-1 bg-violet-500/20 border border-violet-400/30 text-violet-300 px-2.5 py-1 rounded-xl" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                <Globe className="w-3 h-3" /> 360° Interactive
              </span>
            </div>

            <h2 className="text-white mb-2" style={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.3 }}>
              {featured.title}
            </h2>

            <div className="flex items-center gap-2 mb-3">
              <img src={featured.coachAvatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-gray-200">{featured.coachName}</span>
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>

            <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }} className="text-gray-400 mb-4 line-clamp-2">
              {featured.description}
            </p>

            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-white">{featured.rating}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Eye className="w-4 h-4" />
                <span style={{ fontSize: "0.82rem" }}>{featured.views} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-4 h-4" />
                <span style={{ fontSize: "0.82rem" }}>{featured.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedVideo(featured)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                style={{ fontWeight: 700, fontSize: "0.88rem" }}
              >
                <Play className="w-4 h-4" /> Xem ngay
              </button>
              <button
                onClick={() => setSelectedVideo(featured)}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-500/20 border border-violet-400/40 text-violet-300 rounded-xl hover:bg-violet-500/30 transition-colors"
                style={{ fontWeight: 600, fontSize: "0.88rem" }}
              >
                <Globe className="w-4 h-4" /> Thử 360°
              </button>
            </div>
          </div>

          {/* Right: mini preview */}
          <div className="lg:w-80 xl:w-96 w-full shrink-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group" style={{ aspectRatio: "16/9" }}
              onClick={() => setSelectedVideo(featured)}>
              <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
              {/* 360 badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-violet-600/90 px-2.5 py-1.5 rounded-xl">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span className="text-white" style={{ fontSize: "0.72rem", fontWeight: 700 }}>360°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm video, HLV, môn thể thao..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            style={{ fontSize: "0.85rem" }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-gray-600"
          style={{ fontSize: "0.82rem" }}
        >
          {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>

        {/* 360 filter toggle */}
        <button
          onClick={() => setShow360Only(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${show360Only ? "bg-violet-500 border-violet-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-violet-300"}`}
          style={{ fontSize: "0.82rem", fontWeight: 600 }}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Chỉ 360°</span>
        </button>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border whitespace-nowrap transition-all shrink-0 ${
              activeCategory === cat.id
                ? "bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-200"
                : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600"
            }`}
            style={{ fontSize: "0.82rem", fontWeight: activeCategory === cat.id ? 700 : 500 }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              style={{ fontSize: "0.65rem", fontWeight: 700 }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: "0.85rem" }} className="text-gray-500">
          Hiển thị <span style={{ fontWeight: 700 }} className="text-gray-900">{filtered.length}</span> video
          {show360Only && <span className="ml-1 text-violet-500">· chỉ 360°</span>}
          {searchQuery && <span className="ml-1">cho "<span className="text-gray-900 font-semibold">{searchQuery}</span>"</span>}
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl hover:from-violet-600 hover:to-indigo-600 transition-all shadow-md shadow-violet-200"
          style={{ fontSize: "0.82rem", fontWeight: 700 }}
        >
          <Upload className="w-4 h-4" />
          Upload Video 360°
        </button>
      </div>

      {/* ── Video Grid ── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => setSelectedVideo(v)} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div
              key={v.id}
              className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer group"
              onClick={() => setSelectedVideo(v)}
            >
              <div className="relative w-40 sm:w-48 shrink-0 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {v.is360 && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-violet-600/90 px-1.5 py-0.5 rounded-lg">
                    <Globe className="w-2.5 h-2.5 text-white" />
                    <span className="text-white" style={{ fontSize: "0.6rem", fontWeight: 700 }}>360°</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                  {v.duration}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors" style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                      {v.title}
                    </h3>
                    {v.isHot && <span className="shrink-0 flex items-center gap-0.5 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                      <Flame className="w-2.5 h-2.5" /> HOT
                    </span>}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <img src={v.coachAvatar} alt="" className="w-5 h-5 rounded-md object-cover" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-600">{v.coachName}</span>
                    {v.coachVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                    <span className="text-gray-300">·</span>
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400">{v.sportEmoji} {v.sport}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", lineHeight: 1.6 }} className="text-gray-500 line-clamp-2 hidden sm:block">
                    {v.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-700">{v.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span style={{ fontSize: "0.72rem" }}>{v.views}</span>
                  </div>
                  <LevelBadge level={v.level} />
                  <span style={{ fontSize: "0.7rem" }} className="text-gray-400">{v.uploadedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div style={{ fontSize: "3rem" }} className="mb-3">🎬</div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-700 mb-1">Không tìm thấy video</div>
          <p style={{ fontSize: "0.82rem" }} className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setShow360Only(false); }}
            className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
            style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* ── Video Detail Modal ── */}
      {selectedVideo && (
        <VideoDetail
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onVideoSelect={v => setSelectedVideo(v)}
        />
      )}

      {/* ── Upload 360° Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <div className="w-full max-w-3xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white">Upload & Xem Video 360° — Three.js WebGL</span>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>
            <div className="p-5">
              <Video360Player />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
