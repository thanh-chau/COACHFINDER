import { useState, useRef } from "react";
import {
  Upload, Play, Pause, Video, Globe, Grid3X3, List,
  Search, MoreHorizontal, Eye, Clock, Users,
  Star, Trash2, Edit3, Share2, Download, Plus,
  X, Check, SplitSquareHorizontal,
  RotateCcw, Maximize2, Tag, Lock, Globe2,
  Copy, Film, Send, ChevronLeft,
  MessageSquare, ThumbsUp, AlertCircle,
  CheckCircle2, TrendingUp, Zap, Award,
} from "lucide-react";
import { Video360Player } from "./Video360Player";

// ─── Avatars & Thumbnails ────────────────────────────────────────────────────
const AVT = {
  minh_anh: "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  bao_long: "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  thuy_nga: "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  duc_hai:  "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  thi_hoa:  "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  quoc_tuan:"https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  van_nam:  "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
};

// Coach reference thumbnails
const REF = {
  squat:        "https://images.unsplash.com/photo-1648659125396-5bf148702e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  deadlift:     "https://images.unsplash.com/photo-1687350119840-3e2cc5977e92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  bench:        "https://images.unsplash.com/photo-1651346847980-ab1c883e8cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  shoulder:     "https://images.unsplash.com/photo-1597452329152-52f9eee96576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  pullup:       "https://images.unsplash.com/photo-1519859660545-3dea8ddf683c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  lunge:        "https://images.unsplash.com/photo-1759476597522-e128dde84a38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  yoga_flex:    "https://images.unsplash.com/photo-1758274536083-b821befda77c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  yoga_warrior: "https://images.unsplash.com/photo-1761035190790-aa1a3472f7fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  yoga_med:     "https://images.unsplash.com/photo-1635617240041-c95219c05542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing_punch: "https://images.unsplash.com/photo-1748485378587-4ed27d79cce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing_combo: "https://images.unsplash.com/photo-1561532325-7d5231a2dede?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing_def:   "https://images.unsplash.com/photo-1729673516991-b0bce1f60d27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  run_sprint:   "https://images.unsplash.com/photo-1762709753339-7bd2fea1f346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  run_endure:   "https://images.unsplash.com/photo-1758586326115-d4e9052b8f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  cardio_rope:  "https://images.unsplash.com/photo-1758875568447-aa45a5d3b351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  tennis_serve: "https://images.unsplash.com/photo-1764906295307-a541927382b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  tennis_back:  "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  swim_free:    "https://images.unsplash.com/photo-1596038863505-44541f4fddba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  swim_fly:     "https://images.unsplash.com/photo-1769989110676-e7e2006d193d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  crossfit:     "https://images.unsplash.com/photo-1656954053654-84622e9275b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  pilates_mat:  "https://images.unsplash.com/photo-1637157216470-d92cd2edb2e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  gym360:       "https://images.unsplash.com/photo-1670004810567-f4328dcc983e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
};

// Student submission thumbnails (student's self-recorded videos)
const SUB = {
  squat_s:   "https://images.unsplash.com/photo-1754257319805-3c5424262197?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  deadlift_s:"https://images.unsplash.com/photo-1656774950529-44a6153521ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  bench_s:   "https://images.unsplash.com/photo-1651346847980-ab1c883e8cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  yoga_s:    "https://images.unsplash.com/photo-1758274535024-be3faa30f507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  boxing_s:  "https://images.unsplash.com/photo-1570442387127-66eb80e00938?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  run_s:     "https://images.unsplash.com/photo-1676917077392-0698469dabb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  swim_s:    "https://images.unsplash.com/photo-1721097777532-e1038b9fcb1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  tennis_s:  "https://images.unsplash.com/photo-1758304455823-35c7b577d051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type VideoType   = "normal" | "360";
type Visibility  = "public" | "students" | "private";
type SubStatus   = "pending" | "reviewed" | "approved";

interface TimestampNote { time: string; note: string; }

interface StudentSubmission {
  id: string;
  studentName: string;
  studentAvatar: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  status: SubStatus;
  scores?: { posture: number; technique: number; rhythm: number; power: number; };
  coachFeedback?: string;
  timestamps?: TimestampNote[];
}

interface CoachVideo {
  id: string; title: string; description: string; thumbnail: string;
  duration: string; durationSec: number;
  type: VideoType; category: string; tags: string[];
  visibility: Visibility; views: number; likes: number;
  uploadDate: string; fileSize: string; resolution: string;
  assignedStudents: string[];
  notes: string;
  submissions: StudentSubmission[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_VIDEOS: CoachVideo[] = [
  // ── Thể hình ──────────────────────────────────────────────────────────────
  { id:"v1", title:"Squat – Form chuẩn từ A→Z",
    description:"Phân tích Squat chi tiết: góc đầu gối, độ sâu, lưng, Low Bar vs High Bar.",
    thumbnail:REF.squat, duration:"12:34", durationSec:754,
    type:"normal", category:"Thể hình", tags:["squat","legs","form"],
    visibility:"students", views:347, likes:89, uploadDate:"28/02/2026",
    fileSize:"1.2 GB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh","Trần Bảo Long","Võ Thị Hoa"],
    notes:"Video chính về squat – yêu cầu xem trước buổi học",
    submissions: [
      { id:"s1a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.squat_s, duration:"02:14", uploadDate:"01/03/2026",
        status:"pending",
        scores:{ posture:6, technique:7, rhythm:8, power:6 },
        coachFeedback:"", timestamps:[] },
      { id:"s1b", studentName:"Trần Bảo Long", studentAvatar:AVT.bao_long,
        thumbnail:SUB.squat_s, duration:"01:58", uploadDate:"02/03/2026",
        status:"reviewed",
        scores:{ posture:5, technique:5, rhythm:6, power:7 },
        coachFeedback:"Đầu gối hơi cúi vào trong ở cuối phase xuống. Cần bung gối ra ngoài hơn.", timestamps:[{time:"0:18","note":"Đầu gối valgus – cần sửa"}] },
      { id:"s1c", studentName:"Võ Thị Hoa", studentAvatar:AVT.thi_hoa,
        thumbnail:SUB.squat_s, duration:"02:30", uploadDate:"03/03/2026",
        status:"approved",
        scores:{ posture:9, technique:8, rhythm:9, power:8 },
        coachFeedback:"Form rất tốt! Độ sâu đạt chuẩn, lưng thẳng đẹp.", timestamps:[] },
    ]},

  { id:"v2", title:"Deadlift 360° – Phân tích bar path",
    description:"Video 360° Deadlift. Xoay góc nhìn để kiểm tra lưng thẳng, bar path sát người.",
    thumbnail:REF.deadlift, duration:"08:15", durationSec:495,
    type:"360", category:"Thể hình", tags:["deadlift","360","powerlifting"],
    visibility:"students", views:512, likes:134, uploadDate:"01/03/2026",
    fileSize:"3.8 GB", resolution:"5760×2880 (360°)",
    assignedStudents:["Đặng Quốc Tuấn","Trần Bảo Long"],
    notes:"Video 360° – dùng headset VR để trải nghiệm tốt nhất",
    submissions: [
      { id:"s2a", studentName:"Đặng Quốc Tuấn", studentAvatar:AVT.quoc_tuan,
        thumbnail:SUB.deadlift_s, duration:"01:45", uploadDate:"03/03/2026",
        status:"pending",
        scores:{ posture:7, technique:6, rhythm:7, power:8 },
        coachFeedback:"", timestamps:[] },
      { id:"s2b", studentName:"Trần Bảo Long", studentAvatar:AVT.bao_long,
        thumbnail:SUB.deadlift_s, duration:"02:01", uploadDate:"04/03/2026",
        status:"reviewed",
        scores:{ posture:5, technique:5, rhythm:6, power:7 },
        coachFeedback:"Lưng bị tròn khi qua đầu gối. Hông cần kéo ra sau nhiều hơn.", timestamps:[{time:"0:22","note":"Lưng tròn – nguy hiểm"}] },
    ]},

  { id:"v3", title:"Bench Press – 3 lỗi thường gặp & cách sửa",
    description:"Phân tích 3 lỗi kỹ thuật Bench Press: arch quá mức, grip sai, bar path lệch.",
    thumbnail:REF.bench, duration:"09:47", durationSec:587,
    type:"normal", category:"Thể hình", tags:["bench press","chest","correction"],
    visibility:"public", views:1203, likes:287, uploadDate:"25/02/2026",
    fileSize:"890 MB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh","Bùi Văn Nam"],
    notes:"Video công khai",
    submissions: [
      { id:"s3a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.bench_s, duration:"01:52", uploadDate:"27/02/2026",
        status:"approved",
        scores:{ posture:8, technique:8, rhythm:9, power:7 },
        coachFeedback:"Kỹ thuật tốt, tiếp tục duy trì!", timestamps:[] },
      { id:"s3b", studentName:"Bùi Văn Nam", studentAvatar:AVT.van_nam,
        thumbnail:SUB.bench_s, duration:"02:05", uploadDate:"28/02/2026",
        status:"pending",
        scores:{ posture:6, technique:6, rhythm:7, power:8 },
        coachFeedback:"", timestamps:[] },
    ]},

  { id:"v4", title:"Shoulder Press – OHP an toàn",
    description:"Overhead Press không đau vai: vị trí khuỷu tay, core bracing, bar path.",
    thumbnail:REF.shoulder, duration:"07:22", durationSec:442,
    type:"normal", category:"Thể hình", tags:["shoulder","OHP","safety"],
    visibility:"students", views:198, likes:56, uploadDate:"20/02/2026",
    fileSize:"720 MB", resolution:"1920×1080",
    assignedStudents:["Trần Bảo Long","Đặng Quốc Tuấn"],
    notes:"Quan trọng cho học viên mới",
    submissions: [
      { id:"s4a", studentName:"Trần Bảo Long", studentAvatar:AVT.bao_long,
        thumbnail:SUB.squat_s, duration:"01:38", uploadDate:"22/02/2026",
        status:"reviewed",
        scores:{ posture:7, technique:6, rhythm:7, power:6 },
        coachFeedback:"Khuỷu tay bị flare ra quá nhiều, cần tucked vào ~45°.", timestamps:[{time:"0:31","note":"Flare khuỷu – cần sửa"}] },
    ]},

  { id:"v5", title:"Pull-up – Lộ trình 0→10 rep",
    description:"Negative, band assisted, full pull-up. Progression 8 tuần.",
    thumbnail:REF.pullup, duration:"15:08", durationSec:908,
    type:"normal", category:"Thể hình", tags:["pullup","back","progression"],
    visibility:"students", views:423, likes:112, uploadDate:"15/02/2026",
    fileSize:"1.4 GB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh","Trần Bảo Long"],
    notes:"Học viên cần xem nhiều lần",
    submissions: [
      { id:"s5a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.squat_s, duration:"01:10", uploadDate:"17/02/2026",
        status:"approved",
        scores:{ posture:9, technique:9, rhythm:8, power:9 },
        coachFeedback:"Xuất sắc! Full ROM, dead hang đúng chuẩn.", timestamps:[] },
    ]},

  // ── Yoga ──────────────────────────────────────────────────────────────────
  { id:"y1", title:"Yoga – Chuỗi Flexibility buổi sáng",
    description:"12 pose kéo dãn toàn thân: Cat-Cow, Forward Fold, Pigeon, Downward Dog.",
    thumbnail:REF.yoga_flex, duration:"20:00", durationSec:1200,
    type:"normal", category:"Yoga", tags:["flexibility","morning","stretch"],
    visibility:"public", views:892, likes:234, uploadDate:"27/02/2026",
    fileSize:"1.8 GB", resolution:"1920×1080",
    assignedStudents:["Lê Thúy Nga","Võ Thị Hoa"],
    notes:"Video phổ biến nhất kênh",
    submissions: [
      { id:"sy1a", studentName:"Lê Thúy Nga", studentAvatar:AVT.thuy_nga,
        thumbnail:SUB.yoga_s, duration:"04:20", uploadDate:"28/02/2026",
        status:"pending",
        scores:{ posture:7, technique:7, rhythm:8, power:6 },
        coachFeedback:"", timestamps:[] },
      { id:"sy1b", studentName:"Võ Thị Hoa", studentAvatar:AVT.thi_hoa,
        thumbnail:SUB.yoga_s, duration:"05:10", uploadDate:"01/03/2026",
        status:"reviewed",
        scores:{ posture:8, technique:9, rhythm:9, power:7 },
        coachFeedback:"Pigeon pose rất đẹp! Forward Fold cần thả vai hơn.", timestamps:[{time:"2:45","note":"Vai bị gồng – thả xuống"}] },
    ]},

  { id:"y2", title:"Yoga Warrior Series 360°",
    description:"Warrior I, II, III quay 360°. Xoay góc kiểm tra alignment toàn thân.",
    thumbnail:REF.yoga_warrior, duration:"14:30", durationSec:870,
    type:"360", category:"Yoga", tags:["warrior","alignment","360"],
    visibility:"students", views:445, likes:118, uploadDate:"22/02/2026",
    fileSize:"4.1 GB", resolution:"5760×2880 (360°)",
    assignedStudents:["Lê Thúy Nga"],
    notes:"360° giúp kiểm tra tư thế rất tốt",
    submissions: [
      { id:"sy2a", studentName:"Lê Thúy Nga", studentAvatar:AVT.thuy_nga,
        thumbnail:SUB.yoga_s, duration:"03:00", uploadDate:"24/02/2026",
        status:"reviewed",
        scores:{ posture:8, technique:7, rhythm:8, power:7 },
        coachFeedback:"Warrior II cần duỗi thẳng tay hơn, nhìn về phía trước.", timestamps:[{time:"1:20",note:"Tay Warrior II chưa thẳng"}] },
    ]},

  { id:"y3", title:"Yoga – Thiền & Pranayama",
    description:"Nadi Shodhana, Kapalabhati, Ujjayi. Thiền 10 phút giảm stress.",
    thumbnail:REF.yoga_med, duration:"18:45", durationSec:1125,
    type:"normal", category:"Yoga", tags:["meditation","pranayama","breathing"],
    visibility:"students", views:321, likes:87, uploadDate:"18/02/2026",
    fileSize:"1.6 GB", resolution:"1920×1080",
    assignedStudents:["Lê Thúy Nga","Võ Thị Hoa","Nguyễn Minh Anh"],
    notes:"Gửi cho học viên hay bị stress",
    submissions: [] },

  // ── Boxing ────────────────────────────────────────────────────────────────
  { id:"b1", title:"Boxing – Jab & Cross kỹ thuật cơ bản",
    description:"Tư thế tay, xoay hông, bước chân, recoil. Demo chậm → nhanh → bag work.",
    thumbnail:REF.boxing_punch, duration:"10:22", durationSec:622,
    type:"normal", category:"Boxing", tags:["jab","cross","technique"],
    visibility:"students", views:567, likes:143, uploadDate:"26/02/2026",
    fileSize:"950 MB", resolution:"1920×1080",
    assignedStudents:["Phạm Đức Hải","Bùi Văn Nam"],
    notes:"Bài cơ bản – học viên mới bắt buộc xem",
    submissions: [
      { id:"sb1a", studentName:"Phạm Đức Hải", studentAvatar:AVT.duc_hai,
        thumbnail:SUB.boxing_s, duration:"01:30", uploadDate:"27/02/2026",
        status:"pending",
        scores:{ posture:6, technique:6, rhythm:7, power:7 },
        coachFeedback:"", timestamps:[] },
      { id:"sb1b", studentName:"Bùi Văn Nam", studentAvatar:AVT.van_nam,
        thumbnail:SUB.boxing_s, duration:"01:48", uploadDate:"28/02/2026",
        status:"reviewed",
        scores:{ posture:5, technique:5, rhythm:5, power:8 },
        coachFeedback:"Cross chưa xoay hông đủ, tay bảo vệ mặt bị hạ xuống sau khi đấm.", timestamps:[{time:"0:45","note":"Tay bảo vệ mặt bị hạ"}] },
    ]},

  { id:"b2", title:"Boxing – Combo 1-2-3-4 & Footwork",
    description:"Combo 4 đòn kết hợp di chuyển. Góc nhìn trước/bên/trên.",
    thumbnail:REF.boxing_combo, duration:"13:10", durationSec:790,
    type:"normal", category:"Boxing", tags:["combo","footwork","advanced"],
    visibility:"students", views:389, likes:98, uploadDate:"21/02/2026",
    fileSize:"1.1 GB", resolution:"1920×1080",
    assignedStudents:["Phạm Đức Hải"],
    notes:"Chỉ xem sau khi thành thục Jab-Cross",
    submissions: [
      { id:"sb2a", studentName:"Phạm Đức Hải", studentAvatar:AVT.duc_hai,
        thumbnail:SUB.boxing_s, duration:"02:05", uploadDate:"23/02/2026",
        status:"reviewed",
        scores:{ posture:7, technique:6, rhythm:6, power:8 },
        coachFeedback:"Footwork tốt nhưng sau combo 4 đòn bị mất tư thế, cần reset guard nhanh hơn.", timestamps:[{time:"1:02","note":"Reset guard chậm"}] },
    ]},

  { id:"b3", title:"Boxing Defense 360° – Guard & Slip",
    description:"Video 360° Guard, Slip, Roll, Parry từ góc nhìn đối thủ.",
    thumbnail:REF.boxing_def, duration:"09:55", durationSec:595,
    type:"360", category:"Boxing", tags:["defense","guard","360"],
    visibility:"students", views:276, likes:71, uploadDate:"14/02/2026",
    fileSize:"3.5 GB", resolution:"5760×2880 (360°)",
    assignedStudents:["Phạm Đức Hải","Bùi Văn Nam"],
    notes:"360° từ góc đối thủ rất trực quan",
    submissions: [] },

  // ── Cardio ────────────────────────────────────────────────────────────────
  { id:"c1", title:"Chạy bộ – Kỹ thuật Sprinting đúng cách",
    description:"Nâng gối cao, đánh tay, lean forward 10°. Phân tích từng pha tiếp đất.",
    thumbnail:REF.run_sprint, duration:"08:40", durationSec:520,
    type:"normal", category:"Cardio", tags:["sprint","running","form"],
    visibility:"public", views:734, likes:189, uploadDate:"24/02/2026",
    fileSize:"780 MB", resolution:"1920×1080",
    assignedStudents:["Đặng Quốc Tuấn","Bùi Văn Nam"],
    notes:"",
    submissions: [
      { id:"sc1a", studentName:"Đặng Quốc Tuấn", studentAvatar:AVT.quoc_tuan,
        thumbnail:SUB.run_s, duration:"01:20", uploadDate:"25/02/2026",
        status:"reviewed",
        scores:{ posture:8, technique:7, rhythm:8, power:9 },
        coachFeedback:"Tư thế tổng thể tốt! Cần nâng gối cao hơn ở phase drive.", timestamps:[{time:"0:38","note":"Nâng gối chưa đủ cao"}] },
      { id:"sc1b", studentName:"Bùi Văn Nam", studentAvatar:AVT.van_nam,
        thumbnail:SUB.run_s, duration:"01:05", uploadDate:"26/02/2026",
        status:"pending",
        scores:{ posture:7, technique:7, rhythm:7, power:7 },
        coachFeedback:"", timestamps:[] },
    ]},

  { id:"c2", title:"Chạy bộ bền – VO2max & Zone Training",
    description:"Kỹ thuật chạy bền, zone training, bài tập tăng VO2max.",
    thumbnail:REF.run_endure, duration:"16:20", durationSec:980,
    type:"normal", category:"Cardio", tags:["endurance","VO2max","marathon"],
    visibility:"students", views:298, likes:76, uploadDate:"19/02/2026",
    fileSize:"1.5 GB", resolution:"1920×1080",
    assignedStudents:["Đặng Quốc Tuấn"],
    notes:"Cho học viên chuẩn bị marathon",
    submissions: [] },

  { id:"c3", title:"HIIT Jump Rope – Đốt cháy 20 phút",
    description:"20 phút HIIT nhảy dây: 8 biến thể, nghỉ 20s mỗi set.",
    thumbnail:REF.cardio_rope, duration:"21:00", durationSec:1260,
    type:"normal", category:"Cardio", tags:["HIIT","jump rope","fat burn"],
    visibility:"public", views:1456, likes:367, uploadDate:"10/02/2026",
    fileSize:"1.9 GB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh","Võ Thị Hoa","Bùi Văn Nam"],
    notes:"Video phổ biến nhất",
    submissions: [
      { id:"sc3a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.run_s, duration:"05:00", uploadDate:"12/02/2026",
        status:"approved",
        scores:{ posture:9, technique:8, rhythm:9, power:9 },
        coachFeedback:"Xuất sắc! Nhịp điệu cực kỳ đều, tiếp tục!", timestamps:[] },
    ]},

  // ── Tennis ────────────────────────────────────────────────────────────────
  { id:"t1", title:"Tennis – Flat Serve & Kick Serve",
    description:"Phân tích Flat và Kick Serve: tung bóng, backswing, contact point, pronation.",
    thumbnail:REF.tennis_serve, duration:"11:50", durationSec:710,
    type:"normal", category:"Tennis", tags:["serve","flat","kick"],
    visibility:"students", views:412, likes:107, uploadDate:"23/02/2026",
    fileSize:"1.05 GB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh"],
    notes:"",
    submissions: [
      { id:"st1a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.tennis_s, duration:"01:40", uploadDate:"24/02/2026",
        status:"reviewed",
        scores:{ posture:7, technique:6, rhythm:7, power:6 },
        coachFeedback:"Tung bóng bị lệch sang trái, cần tung thẳng và hơi về phía trước.", timestamps:[{time:"0:15",note:"Tung bóng lệch"}] },
    ]},

  { id:"t2", title:"Tennis – Backhand 1 tay vs 2 tay",
    description:"So sánh trực tiếp: ưu nhược điểm từng loại, demo từng bước.",
    thumbnail:REF.tennis_back, duration:"13:05", durationSec:785,
    type:"normal", category:"Tennis", tags:["backhand","one-hand","two-hand"],
    visibility:"students", views:287, likes:74, uploadDate:"17/02/2026",
    fileSize:"1.2 GB", resolution:"1920×1080",
    assignedStudents:["Nguyễn Minh Anh"],
    notes:"Học viên đang phân vân chọn Backhand",
    submissions: [
      { id:"st2a", studentName:"Nguyễn Minh Anh", studentAvatar:AVT.minh_anh,
        thumbnail:SUB.tennis_s, duration:"02:12", uploadDate:"19/02/2026",
        status:"pending",
        scores:{ posture:7, technique:7, rhythm:7, power:7 },
        coachFeedback:"", timestamps:[] },
    ]},

  // ── Bơi lội ───────────────────────────────────────────────────────────────
  { id:"sw1", title:"Bơi lội – Freestyle Stroke kỹ thuật",
    description:"Pull, push, recovery, kick. Camera underwater 60fps.",
    thumbnail:REF.swim_free, duration:"14:10", durationSec:850,
    type:"normal", category:"Bơi lội", tags:["freestyle","stroke","underwater"],
    visibility:"students", views:356, likes:91, uploadDate:"20/02/2026",
    fileSize:"1.3 GB", resolution:"1920×1080",
    assignedStudents:["Lê Thúy Nga"],
    notes:"Quay underwater rõ kỹ thuật",
    submissions: [
      { id:"ssw1a", studentName:"Lê Thúy Nga", studentAvatar:AVT.thuy_nga,
        thumbnail:SUB.swim_s, duration:"01:55", uploadDate:"22/02/2026",
        status:"reviewed",
        scores:{ posture:8, technique:7, rhythm:7, power:7 },
        coachFeedback:"Pull phase rất tốt! Kick cần mạnh hơn ở cuối, đừng quá sâu.", timestamps:[{time:"1:10","note":"Kick quá sâu, lãng phí năng lượng"}] },
    ]},

  { id:"sw2", title:"Bơi Bướm 360° – Underwater",
    description:"Video 360° butterfly underwater. Dolphin kick, undulation, pull pattern.",
    thumbnail:REF.swim_fly, duration:"07:30", durationSec:450,
    type:"360", category:"Bơi lội", tags:["butterfly","underwater","360"],
    visibility:"students", views:189, likes:52, uploadDate:"12/02/2026",
    fileSize:"3.2 GB", resolution:"5760×2880 (360°)",
    assignedStudents:["Lê Thúy Nga"],
    notes:"Cần waterproof 360° cam",
    submissions: [] },

  // ── CrossFit ──────────────────────────────────────────────────────────────
  { id:"cf1", title:"CrossFit – WOD Burpee Box Jump & Thruster",
    description:"5 rounds: 10 Burpee Box Jump + 10 Thruster 40kg. Demo + scaling options.",
    thumbnail:REF.crossfit, duration:"17:25", durationSec:1045,
    type:"normal", category:"CrossFit", tags:["WOD","burpee","thruster"],
    visibility:"students", views:623, likes:158, uploadDate:"03/03/2026",
    fileSize:"1.6 GB", resolution:"1920×1080",
    assignedStudents:["Đặng Quốc Tuấn","Bùi Văn Nam"],
    notes:"WOD tuần 3 tháng 3",
    submissions: [
      { id:"scf1a", studentName:"Đặng Quốc Tuấn", studentAvatar:AVT.quoc_tuan,
        thumbnail:SUB.run_s, duration:"08:30", uploadDate:"04/03/2026",
        status:"pending",
        scores:{ posture:7, technique:6, rhythm:7, power:9 },
        coachFeedback:"", timestamps:[] },
      { id:"scf1b", studentName:"Bùi Văn Nam", studentAvatar:AVT.van_nam,
        thumbnail:SUB.squat_s, duration:"10:15", uploadDate:"04/03/2026",
        status:"reviewed",
        scores:{ posture:6, technique:6, rhythm:6, power:8 },
        coachFeedback:"Thruster bị quarter-squat, cần squat đủ sâu trước khi press.", timestamps:[{time:"3:20",note:"Thruster squat chưa đủ sâu"}] },
    ]},

  // ── Pilates ───────────────────────────────────────────────────────────────
  { id:"p1", title:"Pilates – Mat Core Series 30 phút",
    description:"The Hundred, Roll-Up, Single Leg Stretch, Criss-Cross, Teaser.",
    thumbnail:REF.pilates_mat, duration:"30:00", durationSec:1800,
    type:"normal", category:"Pilates", tags:["core","mat","hundred"],
    visibility:"students", views:278, likes:69, uploadDate:"08/02/2026",
    fileSize:"2.7 GB", resolution:"1920×1080",
    assignedStudents:["Võ Thị Hoa","Lê Thúy Nga"],
    notes:"",
    submissions: [
      { id:"sp1a", studentName:"Võ Thị Hoa", studentAvatar:AVT.thi_hoa,
        thumbnail:SUB.yoga_s, duration:"12:00", uploadDate:"10/02/2026",
        status:"approved",
        scores:{ posture:9, technique:9, rhythm:9, power:8 },
        coachFeedback:"Pilates rất chuẩn! Teaser đẹp xuất sắc.", timestamps:[] },
    ]},

  // ── Tour 360° ─────────────────────────────────────────────────────────────
  { id:"g360", title:"Tour phòng tập 8K 360°",
    description:"Video 360° 8K tour toàn bộ phòng tập, giới thiệu thiết bị.",
    thumbnail:REF.gym360, duration:"04:50", durationSec:290,
    type:"360", category:"Thể hình", tags:["tour","gym","360","8K"],
    visibility:"public", views:1847, likes:456, uploadDate:"01/02/2026",
    fileSize:"4.2 GB", resolution:"7680×3840 (8K 360°)",
    assignedStudents:["Nguyễn Minh Anh","Trần Bảo Long","Lê Thúy Nga","Phạm Đức Hải","Võ Thị Hoa","Đặng Quốc Tuấn","Bùi Văn Nam"],
    notes:"Gửi cho tất cả học viên mới",
    submissions: [] },
];

const CATEGORIES = ["Tất cả","Thể hình","Yoga","Boxing","Cardio","Tennis","Bơi lội","CrossFit","Pilates"];
const STUDENTS_LIST = ["Nguyễn Minh Anh","Trần Bảo Long","Lê Thúy Nga","Phạm Đức Hải","Võ Thị Hoa","Đặng Quốc Tuấn","Bùi Văn Nam"];

const VIS_CFG = {
  public:   { icon: Globe2, label:"Công khai", bg:"bg-emerald-50", text:"text-emerald-600" },
  students: { icon: Users,  label:"Học viên",  bg:"bg-blue-50",    text:"text-blue-600" },
  private:  { icon: Lock,   label:"Riêng tư",  bg:"bg-gray-100",   text:"text-gray-500" },
};

const STATUS_CFG: Record<SubStatus,{ label:string; bg:string; text:string; icon:any }> = {
  pending:  { label:"Chờ chấm",   bg:"bg-amber-50",  text:"text-amber-600",  icon:Clock },
  reviewed: { label:"Đã nhận xét",bg:"bg-blue-50",   text:"text-blue-600",   icon:MessageSquare },
  approved: { label:"Đạt chuẩn",  bg:"bg-emerald-50",text:"text-emerald-600",icon:CheckCircle2 },
};

const SCORE_DIMS = [
  { key:"posture",   label:"Tư thế",    color:"bg-blue-500" },
  { key:"technique", label:"Kỹ thuật",  color:"bg-purple-500" },
  { key:"rhythm",    label:"Nhịp điệu", color:"bg-emerald-500" },
  { key:"power",     label:"Sức mạnh",  color:"bg-orange-500" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtViews = (n:number) => n>=1000 ? (n/1000).toFixed(1)+"K" : String(n);
const avgScore  = (s?: StudentSubmission["scores"]) =>
  s ? Math.round((s.posture+s.technique+s.rhythm+s.power)/4*10)/10 : 0;

// ─── Sub Status Badge ──────────────────────────────────────────────────────────
function SubBadge({ status }:{ status:SubStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}
      style={{ fontSize:"0.63rem", fontWeight:700 }}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size=48 }:{ score:number; size?:number }) {
  const pct = score/10;
  const r = (size-8)/2;
  const circ = 2*Math.PI*r;
  const color = score>=8?"#10b981":score>=6?"#3b82f6":score>=4?"#f59e0b":"#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset .6s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size*0.28} fontWeight="800"
        style={{ transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onUpload }:{ onUpload:(v:Partial<CoachVideo>)=>void }) {
  const [drag,setDrag] = useState(false);
  const [step,setStep] = useState<"drop"|"form">("drop");
  const [file,setFile] = useState<File|null>(null);
  const [preview,setPreview] = useState("");
  const [form,setForm] = useState({ title:"", description:"", category:"Thể hình", visibility:"students" as Visibility, tags:"", type:"normal" as VideoType, notes:"" });
  const ref = useRef<HTMLInputElement>(null);
  const set = (k:string,v:any) => setForm(p=>({...p,[k]:v}));
  const handle = (f:File) => { if(!f.type.startsWith("video/")) return; setFile(f); setPreview(URL.createObjectURL(f)); setStep("form"); };

  if (step==="form"&&file) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 flex items-center gap-3">
        <Film className="w-5 h-5 text-white"/>
        <span style={{fontWeight:700,fontSize:"0.95rem"}} className="text-white">Thông tin video tham chiếu</span>
        <button onClick={()=>{setStep("drop");setFile(null);}} className="ml-auto text-white/70 hover:text-white"><X className="w-4 h-4"/></button>
      </div>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <video src={preview} className="w-full rounded-xl aspect-video object-cover bg-gray-900" controls/>
          <p style={{fontSize:"0.72rem"}} className="text-gray-400 mt-1.5 flex items-center gap-1">
            <Film className="w-3 h-3"/>{file.name} · {(file.size/1024/1024/1024).toFixed(2)} GB
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 block mb-1">Tiêu đề *</label>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="VD: Squat – Form chuẩn"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{fontSize:"0.85rem"}}/>
          </div>
          <div>
            <label style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 block mb-1">Mô tả</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" style={{fontSize:"0.85rem"}}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 block mb-1">Danh mục</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 focus:outline-none" style={{fontSize:"0.82rem"}}>
                {["Thể hình","Yoga","Boxing","Cardio","Tennis","Bơi lội","CrossFit","Pilates"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 block mb-1">Quyền xem</label>
              <select value={form.visibility} onChange={e=>set("visibility",e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 focus:outline-none" style={{fontSize:"0.82rem"}}>
                <option value="public">Công khai</option>
                <option value="students">Học viên</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([["normal","🎥","Thường"],["360","🌐","360°"]] as [VideoType,string,string][]).map(([t,em,lb])=>(
              <button key={t} onClick={()=>set("type",t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${form.type===t?"border-blue-500 bg-blue-50":"border-gray-200"}`}
                style={{fontSize:"0.82rem",fontWeight:form.type===t?700:500}}>
                <span>{em}</span><span className={form.type===t?"text-blue-700":"text-gray-600"}>{lb}</span>
              </button>
            ))}
          </div>
          <div>
            <label style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 block mb-1">Tags</label>
            <input value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="squat, form, beginner..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{fontSize:"0.85rem"}}/>
          </div>
          <button disabled={!form.title.trim()} onClick={()=>{
            onUpload({title:form.title,description:form.description,category:form.category,visibility:form.visibility,type:form.type,
              tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),notes:form.notes,thumbnail:preview,
              duration:"00:00",durationSec:0,views:0,likes:0,fileSize:`${(file.size/1024/1024/1024).toFixed(2)} GB`,
              resolution:form.type==="360"?"5760×2880 (360°)":"1920×1080",uploadDate:"05/03/2026",assignedStudents:[],submissions:[]});
            setStep("drop");setFile(null);
          }} className={`w-full py-3 rounded-xl transition-all ${form.title.trim()?"bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            style={{fontSize:"0.9rem",fontWeight:700}}>✅ Tải lên & Lưu</button>
        </div>
      </div>
      <div className="mx-5 mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/>
        <p style={{fontSize:"0.75rem",lineHeight:1.7}} className="text-blue-700">
          Sau khi upload video tham chiếu, học viên được giao sẽ thấy và <strong>tự quay bài nộp lại</strong> để HLV so sánh kỹ thuật.
        </p>
      </div>
    </div>
  );

  return (
    <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handle(f);}}
      onClick={()=>ref.current?.click()}
      className={`flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-16 ${drag?"border-blue-500 bg-blue-50":"border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30"}`}>
      <input ref={ref} type="file" accept="video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handle(f);}}/>
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${drag?"bg-blue-100 scale-110":"bg-gradient-to-br from-blue-100 to-indigo-100"}`}>
        <Upload className={`w-10 h-10 ${drag?"text-blue-600":"text-blue-500"}`}/>
      </div>
      <div className="text-center">
        <div style={{fontWeight:700,fontSize:"1.1rem"}} className="text-gray-800 mb-1">{drag?"Thả video vào đây!":"Upload video tham chiếu"}</div>
        <p style={{fontSize:"0.85rem",lineHeight:1.7}} className="text-gray-500">Kéo & thả hoặc <span className="text-blue-600" style={{fontWeight:600}}>click để chọn</span></p>
        <p style={{fontSize:"0.72rem"}} className="text-gray-400 mt-1">MP4, MOV, WebM · Tối đa 8GB · 4K & 8K 360°</p>
      </div>
    </div>
  );
}

// ─── Compare Player ────────────────────────────────────────────────────────────
function ComparePlayer({ video, sub, onBack, onSaveFeedback }:{
  video:CoachVideo; sub:StudentSubmission;
  onBack:()=>void; onSaveFeedback:(subId:string,scores:StudentSubmission["scores"],fb:string,ts:TimestampNote[])=>void;
}) {
  const [playing,setPlaying]   = useState(false);
  const [syncPlay,setSyncPlay] = useState(true);
  const [showGuide,setShowGuide] = useState(true);
  const [progress,setProgress] = useState(0);
  const [scores,setScores]     = useState(sub.scores ?? {posture:5,technique:5,rhythm:5,power:5});
  const [feedback,setFeedback] = useState(sub.coachFeedback ?? "");
  const [timestamps,setTimestamps] = useState<TimestampNote[]>(sub.timestamps ?? []);
  const [tsNote,setTsNote]     = useState("");
  const [saved,setSaved]       = useState(false);
  const overall = avgScore(scores);

  const scoreColor = (v:number) => v>=8?"text-emerald-500":v>=6?"text-blue-500":v>=4?"text-amber-500":"text-red-500";
  const addTs = () => {
    if(!tsNote.trim()) return;
    const t = `${Math.floor(progress/100*180)}s`;
    setTimestamps(p=>[...p,{time:t,note:tsNote}]);
    setTsNote("");
  };
  const save = () => {
    onSaveFeedback(sub.id,scores,feedback,timestamps);
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4"/>
        </button>
        <SplitSquareHorizontal className="w-4 h-4 text-blue-400"/>
        <div className="flex-1 min-w-0">
          <div style={{fontWeight:700,fontSize:"0.9rem"}} className="text-white truncate">{video.title}</div>
          <div style={{fontSize:"0.7rem"}} className="text-gray-400">vs bài nộp của {sub.studentName}</div>
        </div>
        <SubBadge status={sub.status}/>
        <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
          <Award className={`w-3.5 h-3.5 ${scoreColor(overall)}`}/>
          <span style={{fontWeight:800,fontSize:"0.85rem"}} className={scoreColor(overall)}>{overall}/10</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Two video panels */}
        <div className="grid grid-cols-2 border-b border-gray-100">
          {/* Coach reference */}
          <div className="border-r border-gray-100">
            <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0" style={{fontSize:"0.65rem",fontWeight:800}}>HLV</div>
              <span style={{fontWeight:600,fontSize:"0.78rem"}} className="text-blue-700 truncate">Tham chiếu – {video.title}</span>
              {video.type==="360"&&<span className="ml-auto bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shrink-0" style={{fontSize:"0.6rem",fontWeight:700}}><Globe className="w-2.5 h-2.5"/>360°</span>}
            </div>
            <div className="relative aspect-video bg-gray-900">
              <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-90"/>
              {showGuide&&(
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400 opacity-80" style={{top:"50%"}}/>
                  <span className="absolute right-2 bg-yellow-400/80 text-gray-900 px-1 rounded text-xs font-bold" style={{top:"47%",fontSize:"0.58rem"}}>Hông</span>
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 opacity-80" style={{top:"70%"}}/>
                  <span className="absolute right-2 bg-cyan-400/80 text-gray-900 px-1 rounded text-xs font-bold" style={{top:"67%",fontSize:"0.58rem"}}>Gối</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={()=>setPlaying(p=>!p)} className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 hover:bg-white/30 transition-colors flex items-center justify-center">
                  {playing?<Pause className="w-6 h-6 text-white"/>:<Play className="w-6 h-6 text-white ml-0.5"/>}
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.65rem",fontWeight:700}}>{video.duration}</div>
            </div>
          </div>

          {/* Student submission */}
          <div>
            <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
              <img src={sub.studentAvatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0"/>
              <span style={{fontWeight:600,fontSize:"0.78rem"}} className="text-purple-700 truncate">Bài nộp – {sub.studentName}</span>
              <span style={{fontSize:"0.65rem"}} className="text-gray-400 ml-auto shrink-0">{sub.uploadDate}</span>
            </div>
            <div className="relative aspect-video bg-gray-900">
              <img src={sub.thumbnail} alt="" className="w-full h-full object-cover opacity-90"/>
              {showGuide&&(
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400/60 opacity-80" style={{top:"55%"}}/>
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400/60 opacity-80" style={{top:"73%"}}/>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={()=>setPlaying(p=>!p)} className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 hover:bg-white/30 transition-colors flex items-center justify-center">
                  {playing?<Pause className="w-6 h-6 text-white"/>:<Play className="w-6 h-6 text-white ml-0.5"/>}
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.65rem",fontWeight:700}}>{sub.duration}</div>
              {/* Score overlay */}
              {sub.scores&&(
                <div className="absolute top-2 left-2">
                  <ScoreRing score={overall} size={40}/>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sync controls */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-32">
            <input type="range" min={0} max={100} value={progress} onChange={e=>setProgress(Number(e.target.value))} className="w-full"/>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={()=>setProgress(0)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><RotateCcw className="w-3.5 h-3.5"/></button>
            <button onClick={()=>setPlaying(!playing)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600">
              {playing?<Pause className="w-3.5 h-3.5"/>:<Play className="w-3.5 h-3.5 ml-0.5"/>}
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className={`w-8 h-4 rounded-full transition-colors ${syncPlay?"bg-blue-500":"bg-gray-300"}`} onClick={()=>setSyncPlay(p=>!p)}>
                <span className={`block w-3 h-3 bg-white rounded-full shadow mt-0.5 transition-transform ${syncPlay?"translate-x-4":"translate-x-0.5"}`}/>
              </div>
              <span style={{fontSize:"0.72rem"}} className="text-gray-500">Đồng bộ</span>
            </label>
            <button onClick={()=>setShowGuide(p=>!p)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors ${showGuide?"border-yellow-400 bg-yellow-50 text-yellow-700":"border-gray-200 text-gray-500"}`}
              style={{fontSize:"0.72rem",fontWeight:600}}>
              📏 Guide
            </button>
          </div>
          <span style={{fontSize:"0.7rem"}} className="text-gray-400 shrink-0">{Math.floor(progress/100*180)}s / 3:00</span>
        </div>

        {/* Scoring + Feedback */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Score sliders */}
          <div className="space-y-3">
            <div style={{fontWeight:700,fontSize:"0.88rem"}} className="text-gray-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500"/> Chấm điểm kỹ thuật
            </div>
            {SCORE_DIMS.map(({key,label,color})=>{
              const val = scores[key] as number;
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span style={{fontSize:"0.78rem",fontWeight:500}} className="text-gray-600">{label}</span>
                    <span style={{fontWeight:800,fontSize:"0.82rem"}} className={scoreColor(val)}>{val}/10</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 rounded-full transition-all ${color}`} style={{width:`${val*10}%`}}/>
                    <input type="range" min={1} max={10} value={val}
                      onChange={e=>setScores(p=>({...p,[key]:Number(e.target.value)}))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"/>
                  </div>
                </div>
              );
            })}
            {/* Overall */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mt-2">
              <ScoreRing score={overall} size={52}/>
              <div>
                <div style={{fontWeight:800,fontSize:"1rem"}} className={scoreColor(overall)}>
                  {overall>=8?"Xuất sắc 🏆":overall>=6?"Khá tốt 👍":overall>=4?"Cần cải thiện ⚡":"Cần luyện tập thêm 💪"}
                </div>
                <div style={{fontSize:"0.72rem"}} className="text-gray-400 mt-0.5">Điểm tổng hợp</div>
              </div>
            </div>
          </div>

          {/* Feedback + Timestamps */}
          <div className="space-y-3">
            <div style={{fontWeight:700,fontSize:"0.88rem"}} className="text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500"/> Nhận xét & Ghi chú
            </div>
            <textarea value={feedback} onChange={e=>setFeedback(e.target.value)}
              rows={4} placeholder="Nhận xét kỹ thuật chi tiết... (VD: Squat chưa đủ sâu ở giây 0:18, đầu gối bị valgus...)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{fontSize:"0.82rem"}}/>

            {/* Timestamp notes */}
            <div>
              <div style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-600 mb-1.5">Ghi chú theo mốc thời gian:</div>
              <div className="flex gap-2">
                <div className="bg-gray-100 text-gray-500 px-2 py-1.5 rounded-lg shrink-0" style={{fontSize:"0.72rem",fontWeight:700}}>
                  {Math.floor(progress/100*180)}s
                </div>
                <input value={tsNote} onChange={e=>setTsNote(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addTs()}
                  placeholder="Ghi chú tại mốc này... (Enter để thêm)"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{fontSize:"0.78rem"}}/>
                <button onClick={addTs} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shrink-0" style={{fontSize:"0.75rem",fontWeight:600}}>+</button>
              </div>
              {timestamps.length>0&&(
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {timestamps.map((ts,i)=>(
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-xs font-bold shrink-0">{ts.time}</span>
                      <span style={{fontSize:"0.75rem"}} className="text-gray-600 flex-1">{ts.note}</span>
                      <button onClick={()=>setTimestamps(p=>p.filter((_,j)=>j!==i))} className="text-gray-300 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3"/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={save}
              className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${saved?"bg-emerald-500 text-white":"bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-200"}`}
              style={{fontSize:"0.85rem",fontWeight:700}}>
              {saved?<><CheckCircle2 className="w-4 h-4"/>Đã gửi phản hồi!</>:<><Send className="w-4 h-4"/>Gửi phản hồi cho học viên</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compare Tab (Pick flow) ───────────────────────────────────────────────────
function CompareTab({ videos, onSaveFeedback }:{
  videos: CoachVideo[];
  onSaveFeedback:(videoId:string,subId:string,scores:StudentSubmission["scores"],fb:string,ts:TimestampNote[])=>void;
}) {
  const [selVideoId, setSelVideoId] = useState<string|null>(null);
  const [selSubId,   setSelSubId]   = useState<string|null>(null);
  const [catFilter,  setCatFilter]  = useState("Tất cả");
  const [search,     setSearch]     = useState("");

  const selVideo = videos.find(v=>v.id===selVideoId)??null;
  const selSub   = selVideo?.submissions.find(s=>s.id===selSubId)??null;

  // Full compare view
  if (selVideo&&selSub) return (
    <div className="h-full">
      <ComparePlayer video={selVideo} sub={selSub} onBack={()=>setSelSubId(null)}
        onSaveFeedback={(sId,scores,fb,ts)=>{ onSaveFeedback(selVideo.id,sId,scores,fb,ts); }}/>
    </div>
  );

  // Pick submission view
  if (selVideo) {
    const pending = selVideo.submissions.filter(s=>s.status==="pending").length;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={()=>setSelVideoId(null)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors" style={{fontSize:"0.82rem",fontWeight:600}}>
            <ChevronLeft className="w-4 h-4"/> Quay lại
          </button>
          <div className="h-4 w-px bg-gray-200"/>
          <span style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900">Bài nộp của học viên</span>
        </div>

        {/* Reference video info */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="relative w-28 h-16 rounded-xl overflow-hidden shrink-0">
            <img src={selVideo.thumbnail} alt="" className="w-full h-full object-cover"/>
            <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 rounded" style={{fontSize:"0.6rem",fontWeight:700}}>{selVideo.duration}</div>
            {selVideo.type==="360"&&<span className="absolute top-1 left-1 bg-purple-600 text-white px-1 rounded" style={{fontSize:"0.55rem",fontWeight:700}}>360°</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{fontWeight:700,fontSize:"0.88rem"}} className="text-white mb-1">📹 Video tham chiếu: {selVideo.title}</div>
            <div className="flex items-center gap-3 text-gray-400">
              <span style={{fontSize:"0.72rem"}} className="flex items-center gap-1"><Users className="w-3 h-3"/>{selVideo.submissions.length} bài nộp</span>
              {pending>0&&<span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full" style={{fontSize:"0.65rem",fontWeight:700}}>{pending} chờ chấm</span>}
            </div>
          </div>
        </div>

        {/* Submission list */}
        {selVideo.submissions.length===0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mb-3"/>
            <div style={{fontWeight:600,fontSize:"0.9rem"}} className="text-gray-400">Chưa có bài nộp</div>
            <p style={{fontSize:"0.78rem"}} className="text-gray-300 mt-1">Học viên chưa tự quay và nộp bài cho video này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {selVideo.submissions.map(sub=>{
              const sc = sub.scores ? avgScore(sub.scores) : null;
              return (
                <button key={sub.id} onClick={()=>setSelSubId(sub.id)}
                  className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg overflow-hidden text-left transition-all group">
                  {/* Thumbnail split */}
                  <div className="relative flex h-28">
                    {/* Left: coach thumb */}
                    <div className="w-1/2 relative overflow-hidden">
                      <img src={selVideo.thumbnail} alt="" className="w-full h-full object-cover opacity-70"/>
                      <div className="absolute inset-0 bg-blue-900/30"/>
                      <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.55rem",fontWeight:700}}>HLV</span>
                    </div>
                    {/* Divider */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center z-10">
                      <div className="w-7 h-7 rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center">
                        <SplitSquareHorizontal className="w-3.5 h-3.5 text-gray-600"/>
                      </div>
                    </div>
                    {/* Right: student thumb */}
                    <div className="w-1/2 relative overflow-hidden">
                      <img src={sub.thumbnail} alt="" className="w-full h-full object-cover opacity-70"/>
                      <div className="absolute inset-0 bg-purple-900/20"/>
                      <span className="absolute top-1.5 right-1.5 bg-purple-600 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.55rem",fontWeight:700}}>HV</span>
                    </div>
                    {/* Score */}
                    {sc!==null&&(
                      <div className="absolute bottom-2 right-2">
                        <ScoreRing score={sc} size={34}/>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={sub.studentAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0"/>
                      <span style={{fontWeight:600,fontSize:"0.82rem"}} className="text-gray-900 truncate">{sub.studentName}</span>
                      <SubBadge status={sub.status}/>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span style={{fontSize:"0.68rem"}} className="flex items-center gap-1"><Clock className="w-2.5 h-2.5"/>Nộp {sub.uploadDate}</span>
                      <span style={{fontSize:"0.68rem"}}>{sub.duration}</span>
                    </div>
                    {sub.coachFeedback&&(
                      <div className="mt-2 bg-blue-50 rounded-lg px-2 py-1.5">
                        <p style={{fontSize:"0.7rem"}} className="text-blue-700 line-clamp-1">💬 {sub.coachFeedback}</p>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span style={{fontSize:"0.7rem",fontWeight:600}} className="text-blue-500 group-hover:text-blue-700 transition-colors">
                        So sánh & Chấm điểm →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Pick video view
  const videosWithSubs = videos.filter(v=>v.submissions.length>0);
  const filtered = videosWithSubs.filter(v=>{
    if(catFilter!=="Tất cả"&&v.category!==catFilter) return false;
    if(search&&!v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const totalPending = videos.reduce((s,v)=>s+v.submissions.filter(sub=>sub.status==="pending").length,0);
  const totalSubs    = videos.reduce((s,v)=>s+v.submissions.length,0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {icon:Film,      label:"Video có bài nộp", value:videosWithSubs.length, bg:"bg-blue-50",   color:"text-blue-500"},
          {icon:MessageSquare,label:"Tổng bài nộp", value:totalSubs,              bg:"bg-purple-50", color:"text-purple-500"},
          {icon:AlertCircle,  label:"Chờ chấm điểm",value:totalPending,           bg:"bg-amber-50",  color:"text-amber-500"},
        ].map(({icon:Icon,label,value,bg,color})=>(
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`}/>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:"1.1rem"}} className="text-gray-900">{value}</div>
              <div style={{fontSize:"0.68rem"}} className="text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm video..."
            className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" style={{fontSize:"0.82rem"}}/>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
          {["Tất cả",...CATEGORIES.filter(c=>c!=="Tất cả")].map(c=>{
            const count = c==="Tất cả" ? videosWithSubs.length : videosWithSubs.filter(v=>v.category===c).length;
            if(c!=="Tất cả"&&count===0) return null;
            return (
              <button key={c} onClick={()=>setCatFilter(c)}
                className={`px-3 py-2 transition-colors text-sm ${catFilter===c?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
                style={{fontSize:"0.75rem",fontWeight:catFilter===c?700:500}}>
                {c}{count>0&&c!=="Tất cả"&&<span className={`ml-1 rounded-full px-1 ${catFilter===c?"bg-white/30":"bg-gray-100 text-gray-400"}`} style={{fontSize:"0.6rem"}}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <SplitSquareHorizontal className="w-5 h-5 text-blue-500 shrink-0"/>
        <p style={{fontSize:"0.8rem",lineHeight:1.7}} className="text-blue-700">
          Chọn <strong>video tham chiếu</strong> để xem bài nộp của học viên → so sánh kỹ thuật song song → chấm điểm & gửi phản hồi.
        </p>
      </div>

      {/* Video grid with submission badges */}
      {filtered.length===0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Film className="w-10 h-10 text-gray-200 mb-3"/>
          <div style={{fontWeight:600,fontSize:"0.9rem"}} className="text-gray-400">Không có video nào có bài nộp</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(v=>{
            const pending = v.submissions.filter(s=>s.status==="pending").length;
            const approved= v.submissions.filter(s=>s.status==="approved").length;
            return (
              <button key={v.id} onClick={()=>setSelVideoId(v.id)}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg overflow-hidden text-left transition-all group">
                <div className="relative aspect-video">
                  <img src={v.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg" style={{fontSize:"0.65rem",fontWeight:700}}>
                        📹 Tham chiếu
                      </span>
                      {v.type==="360"&&<span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-lg" style={{fontSize:"0.62rem",fontWeight:700}}>360°</span>}
                    </div>
                  </div>
                  {/* Pending badge */}
                  {pending>0&&(
                    <div className="absolute top-2 right-2 bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{fontSize:"0.7rem",fontWeight:800}}>
                      {pending}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.65rem",fontWeight:700}}>{v.duration}</div>
                </div>
                <div className="p-3">
                  <div style={{fontWeight:600,fontSize:"0.85rem"}} className="text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{v.title}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {v.submissions.map(sub=>(
                      <div key={sub.id} className="flex items-center gap-1">
                        <img src={sub.studentAvatar} alt="" className="w-5 h-5 rounded-full object-cover border-2 border-white"/>
                      </div>
                    ))}
                    <span style={{fontSize:"0.72rem"}} className="text-gray-500 ml-1">{v.submissions.length} bài nộp</span>
                    {pending>0&&<span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg" style={{fontSize:"0.63rem",fontWeight:700}}>{pending} chờ chấm</span>}
                    {approved>0&&<span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-lg" style={{fontSize:"0.63rem",fontWeight:700}}>{approved} đạt ✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StudioStats({ videos }:{ videos:CoachVideo[] }) {
  const total360   = videos.filter(v=>v.type==="360").length;
  const totalViews = videos.reduce((s,v)=>s+v.views,0);
  const totalSubs  = videos.reduce((s,v)=>s+v.submissions.length,0);
  const pending    = videos.reduce((s,v)=>s+v.submissions.filter(sub=>sub.status==="pending").length,0);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {[
        {icon:Film,         label:"Tổng video",     value:videos.length,       sub:`${total360} video 360°`,    color:"text-blue-500",   bg:"bg-blue-50"},
        {icon:Eye,          label:"Lượt xem",       value:fmtViews(totalViews),sub:"Tất cả video",              color:"text-emerald-500",bg:"bg-emerald-50"},
        {icon:MessageSquare,label:"Bài nộp",        value:totalSubs,           sub:"Từ học viên",               color:"text-purple-500", bg:"bg-purple-50"},
        {icon:AlertCircle,  label:"Chờ chấm điểm",  value:pending,             sub:"Cần xem xét",               color:"text-amber-500",  bg:"bg-amber-50"},
      ].map(({icon:Icon,label,value,sub,color,bg})=>(
        <div key={label} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`}/>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:"1rem"}} className="text-gray-900">{value}</div>
            <div style={{fontSize:"0.68rem"}} className="text-gray-400">{label} · {sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ v, onSelect, onDelete, selected, gridMode, onCompare }:{
  v:CoachVideo; onSelect:()=>void; onDelete:()=>void; selected:boolean; gridMode:boolean; onCompare:()=>void;
}) {
  const [menuOpen,setMenuOpen] = useState(false);
  const vis = VIS_CFG[v.visibility];
  const VisIcon = vis.icon;
  const pending = v.submissions.filter(s=>s.status==="pending").length;

  return (
    <div className={`group bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selected?"border-blue-500 shadow-blue-100":"border-gray-100 hover:border-blue-200"} ${gridMode?"":"flex gap-3 p-3 items-center"}`}>
      <div className={`relative overflow-hidden ${gridMode?"aspect-video":"w-28 h-20 rounded-xl shrink-0"}`} onClick={onSelect}>
        <img src={v.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        <div className="absolute top-2 left-2 flex gap-1">
          {v.type==="360"&&<span className="flex items-center gap-1 bg-purple-600 text-white px-1.5 py-0.5 rounded-lg" style={{fontSize:"0.58rem",fontWeight:700}}><Globe className="w-2.5 h-2.5"/>360°</span>}
        </div>
        {pending>0&&(
          <div className="absolute top-2 right-2 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow" style={{fontSize:"0.65rem",fontWeight:800}}>{pending}</div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 rounded-md" style={{fontSize:"0.65rem",fontWeight:700}}>{v.duration}</div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-gray-800 ml-0.5"/>
          </div>
        </div>
        {selected&&<div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow"><Check className="w-4 h-4 text-white"/></div></div>}
      </div>
      <div className={`${gridMode?"p-3":"flex-1 min-w-0"}`} onClick={onSelect}>
        <div className="flex items-start justify-between gap-1 mb-1">
          <div style={{fontWeight:600,fontSize:"0.85rem"}} className="text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{v.title}</div>
          <div className="relative shrink-0">
            <button onClick={e=>{e.stopPropagation();setMenuOpen(m=>!m);}} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4"/>
            </button>
            {menuOpen&&(
              <div className="absolute right-0 top-6 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 w-44" onClick={e=>e.stopPropagation()}>
                {[
                  {icon:SplitSquareHorizontal,label:"Xem bài nộp",action:()=>{onCompare();setMenuOpen(false);}},
                  {icon:Edit3,label:"Chỉnh sửa",action:()=>setMenuOpen(false)},
                  {icon:Share2,label:"Chia sẻ link",action:()=>setMenuOpen(false)},
                  {icon:Download,label:"Tải về",action:()=>setMenuOpen(false)},
                  {icon:Copy,label:"Nhân bản",action:()=>setMenuOpen(false)},
                  {icon:Trash2,label:"Xoá",action:()=>{onDelete();setMenuOpen(false);},danger:true},
                ].map(({icon:Icon,label,action,danger})=>(
                  <button key={label} onClick={action} className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 ${danger?"text-red-500":"text-gray-600"}`} style={{fontSize:"0.8rem"}}>
                    <Icon className="w-3.5 h-3.5"/>{label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${vis.bg} ${vis.text}`} style={{fontSize:"0.63rem",fontWeight:600}}>
            <VisIcon className="w-2.5 h-2.5"/>{vis.label}
          </span>
          <span style={{fontSize:"0.68rem"}} className="text-gray-400 flex items-center gap-1"><Eye className="w-2.5 h-2.5"/>{fmtViews(v.views)}</span>
          {v.submissions.length>0&&(
            <span style={{fontSize:"0.68rem",fontWeight:600}} className="flex items-center gap-1 text-purple-500">
              <MessageSquare className="w-2.5 h-2.5"/>{v.submissions.length} bài nộp
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
type StudioTab = "library"|"upload"|"compare"|"player360";

export function CoachVideoStudio() {
  const [videos,setVideos]       = useState<CoachVideo[]>(INITIAL_VIDEOS);
  const [tab,setTab]             = useState<StudioTab>("library");
  const [gridMode,setGridMode]   = useState(true);
  const [search,setSearch]       = useState("");
  const [catFilter,setCatFilter] = useState("Tất cả");
  const [typeFilter,setTypeFilter] = useState<"all"|"normal"|"360">("all");
  const [selectedId,setSelectedId] = useState<string|null>("v1");

  const filtered = videos.filter(v=>{
    const q = search.toLowerCase();
    if(q&&!v.title.toLowerCase().includes(q)&&!v.tags.some(t=>t.includes(q))) return false;
    if(catFilter!=="Tất cả"&&v.category!==catFilter) return false;
    if(typeFilter!=="all"&&v.type!==typeFilter) return false;
    return true;
  });

  const selectedVideo = videos.find(v=>v.id===selectedId)??null;
  const totalPending  = videos.reduce((s,v)=>s+v.submissions.filter(sub=>sub.status==="pending").length,0);

  const handleUpload = (partial:Partial<CoachVideo>) => {
    const nv:CoachVideo = {
      id:`v${Date.now()}`, title:partial.title??"Video mới", description:partial.description??"",
      thumbnail:partial.thumbnail??REF.gym360, duration:"00:00", durationSec:0,
      type:partial.type??"normal", category:partial.category??"Thể hình",
      tags:partial.tags??[], visibility:partial.visibility??"private",
      views:0, likes:0, uploadDate:"05/03/2026", fileSize:partial.fileSize??"—",
      resolution:partial.resolution??"1920×1080", assignedStudents:[],
      notes:partial.notes??"", submissions:[],
    };
    setVideos(p=>[nv,...p]); setTab("library"); setSelectedId(nv.id);
  };

  const handleSaveFeedback = (videoId:string,subId:string,scores:StudentSubmission["scores"],fb:string,ts:TimestampNote[]) => {
    setVideos(prev=>prev.map(v=>{
      if(v.id!==videoId) return v;
      return { ...v, submissions: v.submissions.map(s=>
        s.id!==subId ? s : { ...s, scores, coachFeedback:fb, timestamps:ts, status:"reviewed" as SubStatus }
      )};
    }));
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-130px)]">
      <StudioStats videos={videos}/>

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-2 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {([
            ["library","🎬","Thư viện"],
            ["upload","⬆️","Upload"],
            ["compare","↔️","So sánh bài nộp"],
            ["player360","🌐","360° Player"],
          ] as [StudioTab,string,string][]).map(([id,emoji,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 transition-colors border-r border-gray-100 last:border-0 ${tab===id?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
              style={{fontSize:"0.82rem",fontWeight:tab===id?700:500}}>
              <span>{emoji}</span><span className="hidden sm:inline">{label}</span>
              {id==="compare"&&totalPending>0&&(
                <span className={`px-1.5 py-0.5 rounded-full ${tab===id?"bg-white/25 text-white":"bg-amber-500 text-white"}`} style={{fontSize:"0.6rem",fontWeight:800}}>{totalPending}</span>
              )}
            </button>
          ))}
        </div>

        {tab==="library"&&(
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm video..."
                className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 w-40" style={{fontSize:"0.82rem"}}/>
            </div>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none" style={{fontSize:"0.8rem"}}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              {([["all","Tất cả"],["normal","Thường"],["360","360°"]] as [typeof typeFilter,string][]).map(([t,l])=>(
                <button key={t} onClick={()=>setTypeFilter(t)}
                  className={`px-3 py-2 transition-colors ${typeFilter===t?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
                  style={{fontSize:"0.75rem",fontWeight:typeFilter===t?700:500}}>{l}</button>
              ))}
            </div>
            <button onClick={()=>setGridMode(m=>!m)} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              {gridMode?<List className="w-4 h-4"/>:<Grid3X3 className="w-4 h-4"/>}
            </button>
            <div className="ml-auto">
              <button onClick={()=>setTab("upload")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-200" style={{fontSize:"0.82rem",fontWeight:700}}>
                <Plus className="w-4 h-4"/> Upload video
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">

        {/* Library */}
        {tab==="library"&&(
          <>
            <div className={`flex-1 overflow-y-auto ${selectedVideo?"hidden lg:block":""}`}>
              <div className="mb-3 text-gray-400" style={{fontSize:"0.75rem"}}>{filtered.length} video</div>
              {filtered.length===0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-200"><Film className="w-10 h-10 mb-2 opacity-30"/><span style={{fontSize:"0.85rem"}} className="text-gray-400">Không tìm thấy</span></div>
              ) : gridMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pr-1">
                  {filtered.map(v=><VideoCard key={v.id} v={v} gridMode onSelect={()=>setSelectedId(v.id)} onDelete={()=>setVideos(p=>p.filter(x=>x.id!==v.id))} selected={selectedId===v.id} onCompare={()=>{setSelectedId(v.id);setTab("compare");}}/>)}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  {filtered.map(v=><VideoCard key={v.id} v={v} gridMode={false} onSelect={()=>setSelectedId(v.id)} onDelete={()=>setVideos(p=>p.filter(x=>x.id!==v.id))} selected={selectedId===v.id} onCompare={()=>{setSelectedId(v.id);setTab("compare");}}/>)}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedVideo&&(
              <div className="w-72 xl:w-80 shrink-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col bg-white">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-4">
                  <div className="flex justify-between items-center mb-3">
                    <span style={{fontSize:"0.7rem",fontWeight:600}} className="text-gray-400 uppercase tracking-wide">Chi tiết video</span>
                    <button onClick={()=>setSelectedId(null)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden aspect-video mb-3">
                    <img src={selectedVideo.thumbnail} alt="" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center cursor-pointer hover:bg-white/30">
                        <Play className="w-6 h-6 text-white ml-0.5"/>
                      </div>
                    </div>
                    {selectedVideo.type==="360"&&<div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-lg" style={{fontSize:"0.62rem",fontWeight:700}}><Globe className="w-3 h-3"/>360°</div>}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 rounded" style={{fontSize:"0.65rem",fontWeight:700}}>{selectedVideo.duration}</div>
                  </div>
                  <div style={{fontWeight:700,fontSize:"0.88rem"}} className="text-white mb-1.5 leading-snug">{selectedVideo.title}</div>
                  <div className="flex gap-3 text-gray-400">
                    <span className="flex items-center gap-1" style={{fontSize:"0.7rem"}}><Eye className="w-3 h-3"/>{fmtViews(selectedVideo.views)}</span>
                    <span className="flex items-center gap-1" style={{fontSize:"0.7rem"}}><MessageSquare className="w-3 h-3 text-purple-400"/>{selectedVideo.submissions.length} bài nộp</span>
                  </div>
                </div>
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVideo.type==="360"&&(
                      <button onClick={()=>setTab("player360")} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 shadow-md shadow-purple-200" style={{fontSize:"0.8rem",fontWeight:700}}>
                        <Globe className="w-4 h-4"/> Mở 360° Player
                      </button>
                    )}
                    <button onClick={()=>setTab("compare")} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-200" style={{fontSize:"0.8rem",fontWeight:700}}>
                      <SplitSquareHorizontal className="w-4 h-4"/> Xem & So sánh bài nộp
                      {selectedVideo.submissions.filter(s=>s.status==="pending").length>0&&(
                        <span className="bg-amber-400 text-white px-1.5 py-0.5 rounded-full" style={{fontSize:"0.62rem",fontWeight:800}}>
                          {selectedVideo.submissions.filter(s=>s.status==="pending").length} chờ
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Submissions preview */}
                  {selectedVideo.submissions.length>0&&(
                    <div>
                      <div style={{fontWeight:600,fontSize:"0.82rem"}} className="text-gray-700 mb-2">Bài nộp của học viên</div>
                      <div className="space-y-2">
                        {selectedVideo.submissions.map(sub=>(
                          <div key={sub.id} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl">
                            <img src={sub.studentAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0"/>
                            <div className="flex-1 min-w-0">
                              <div style={{fontWeight:600,fontSize:"0.78rem"}} className="text-gray-800 truncate">{sub.studentName}</div>
                              <div style={{fontSize:"0.65rem"}} className="text-gray-400">{sub.uploadDate} · {sub.duration}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {sub.scores&&<ScoreRing score={avgScore(sub.scores)} size={28}/>}
                              <SubBadge status={sub.status}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    {[
                      {label:"Danh mục",value:selectedVideo.category,icon:Tag},
                      {label:"Định dạng",value:selectedVideo.type==="360"?"Video 360°":"Video thường",icon:selectedVideo.type==="360"?Globe:Film},
                      {label:"Dung lượng",value:selectedVideo.fileSize,icon:Film},
                      {label:"Độ phân giải",value:selectedVideo.resolution,icon:Maximize2},
                      {label:"Ngày upload",value:selectedVideo.uploadDate,icon:Clock},
                    ].map(({label,value,icon:Icon})=>(
                      <div key={label} className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-gray-400" style={{fontSize:"0.7rem"}}><Icon className="w-3 h-3"/>{label}</span>
                        <span style={{fontSize:"0.75rem",fontWeight:600}} className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>

                  {selectedVideo.tags.length>0&&(
                    <div className="flex gap-1 flex-wrap">
                      {selectedVideo.tags.map(t=><span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg" style={{fontSize:"0.65rem",fontWeight:600}}>#{t}</span>)}
                    </div>
                  )}
                  {selectedVideo.notes&&(
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div style={{fontSize:"0.7rem",fontWeight:600}} className="text-amber-600 mb-1">📝 Ghi chú nội bộ</div>
                      <p style={{fontSize:"0.75rem",lineHeight:1.6}} className="text-gray-700">{selectedVideo.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Upload */}
        {tab==="upload"&&(
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-3xl mx-auto">
              <UploadZone onUpload={handleUpload}/>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {emoji:"📹",title:"HLV upload tham chiếu",desc:"Upload video demo kỹ thuật chuẩn. Học viên sẽ thấy video này để học theo."},
                  {emoji:"🎥",title:"Học viên tự quay bài",desc:"Học viên tự quay bài tập của mình và nộp để HLV so sánh với video tham chiếu."},
                  {emoji:"⚡",title:"So sánh & Chấm điểm",desc:"HLV so sánh song song, chấm 4 tiêu chí, ghi chú timestamp, gửi phản hồi trực tiếp."},
                ].map(({emoji,title,desc})=>(
                  <div key={title} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div style={{fontSize:"1.5rem"}} className="mb-2">{emoji}</div>
                    <div style={{fontWeight:700,fontSize:"0.85rem"}} className="text-gray-800 mb-1">{title}</div>
                    <p style={{fontSize:"0.75rem",lineHeight:1.6}} className="text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compare */}
        {tab==="compare"&&(
          <div className="flex-1 overflow-y-auto pr-1">
            <CompareTab videos={videos} onSaveFeedback={handleSaveFeedback}/>
          </div>
        )}

        {/* 360° Player */}
        {tab==="player360"&&(
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500"/>
              <span style={{fontWeight:600,fontSize:"0.88rem"}} className="text-gray-800">Xem video 360° – Upload file từ máy tính</span>
            </div>
            {videos.filter(v=>v.type==="360").length>0&&(
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div style={{fontSize:"0.78rem",fontWeight:600}} className="text-purple-700 mb-2">📁 Video 360° trong thư viện:</div>
                <div className="flex gap-2 flex-wrap">
                  {videos.filter(v=>v.type==="360").map(v=>(
                    <div key={v.id} className="flex items-center gap-2 bg-white border border-purple-200 px-3 py-1.5 rounded-xl">
                      <Globe className="w-3 h-3 text-purple-500"/>
                      <span style={{fontSize:"0.75rem"}} className="text-gray-700">{v.title.slice(0,28)}...</span>
                      <span style={{fontSize:"0.65rem"}} className="text-gray-400">{v.fileSize}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Video360Player/>
          </div>
        )}
      </div>
    </div>
  );
}
