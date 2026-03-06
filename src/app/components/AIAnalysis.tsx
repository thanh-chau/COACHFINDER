import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Brain, Zap, CheckCircle2, AlertCircle, XCircle,
  Play, Pause, RotateCcw, ChevronRight, TrendingUp,
  Target, Video, Clock, Flame, AlertTriangle,
  BarChart2, Lightbulb, Award, RefreshCw, Camera,
  ChevronDown, ArrowRight, FileVideo, Star, Globe
} from "lucide-react";
import { Video360Player } from "./Video360Player";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "upload" | "analyzing" | "results";
type Severity = "good" | "warning" | "error";
interface Vec2 { x: number; y: number; }
type Pose = Record<string, Vec2>;
type JointMap = Record<string, Severity>;

interface BodyPartResult {
  name: string;
  score: number;
  angleActual?: number;
  angleIdeal?: number;
  severity: Severity;
  feedback: string;
}
interface Metric { label: string; value: string; unit: string; status: Severity; }
interface TechniqueData {
  name: string; emoji: string;
  poseTop: Pose; poseBottom: Pose;
  score: number;
  jointIssues: JointMap;
  bodyParts: BodyPartResult[];
  recommendations: string[];
  metrics: Metric[];
}

interface SportCategory {
  name: string;
  emoji: string;
  color: string;
  bg: string;
  techniques: Record<string, TechniqueData>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CW = 280; const CH = 460;
const BONES: [string, string][] = [
  ["head","neck"],
  ["neck","r_shoulder"],["neck","l_shoulder"],
  ["r_shoulder","r_elbow"],["r_elbow","r_wrist"],
  ["l_shoulder","l_elbow"],["l_elbow","l_wrist"],
  ["r_shoulder","r_hip"],["l_shoulder","l_hip"],
  ["r_hip","l_hip"],
  ["r_hip","r_knee"],["r_knee","r_ankle"],
  ["l_hip","l_knee"],["l_knee","l_ankle"],
];
const SEV_COLOR: Record<Severity, string> = {
  good: "#10b981", warning: "#f59e0b", error: "#ef4444",
};
const JOINT_NAMES = ["head","neck","r_shoulder","l_shoulder","r_elbow","l_elbow","r_wrist","l_wrist","r_hip","l_hip","r_knee","l_knee","r_ankle","l_ankle"];

// ─── Sport-specific technique data ────────────────────────────────────────────
const SPORTS: Record<string, SportCategory> = {
  badminton: {
    name: "Cầu lông", emoji: "🏸", color: "text-green-600", bg: "bg-green-50",
    techniques: {
      smash: {
        name: "Đập cầu (Smash)", emoji: "💥",
        poseTop: {
          head:{x:.48,y:.06}, neck:{x:.48,y:.13},
          r_shoulder:{x:.58,y:.18}, l_shoulder:{x:.38,y:.18},
          r_elbow:{x:.68,y:.10}, l_elbow:{x:.28,y:.28},
          r_wrist:{x:.75,y:.04}, l_wrist:{x:.22,y:.38},
          r_hip:{x:.55,y:.45}, l_hip:{x:.42,y:.45},
          r_knee:{x:.58,y:.65}, l_knee:{x:.35,y:.68},
          r_ankle:{x:.60,y:.86}, l_ankle:{x:.30,y:.88},
        },
        poseBottom: {
          head:{x:.50,y:.10}, neck:{x:.50,y:.17},
          r_shoulder:{x:.60,y:.22}, l_shoulder:{x:.40,y:.22},
          r_elbow:{x:.72,y:.30}, l_elbow:{x:.30,y:.32},
          r_wrist:{x:.78,y:.42}, l_wrist:{x:.25,y:.42},
          r_hip:{x:.56,y:.48}, l_hip:{x:.44,y:.48},
          r_knee:{x:.56,y:.68}, l_knee:{x:.40,y:.70},
          r_ankle:{x:.56,y:.88}, l_ankle:{x:.38,y:.90},
        },
        score: 76,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"warning", l_elbow:"good",
          r_wrist:"warning", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"warning",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Điểm tiếp xúc vợt", score:68, angleActual:155, angleIdeal:170, severity:"warning",
            feedback:"Cánh tay chưa duỗi hết khi đập. Cần vươn cao hơn để tiếp xúc cầu ở điểm cao nhất, tạo góc đập lớn hơn." },
          { name:"Xoay thân trên", score:82, severity:"good",
            feedback:"Xoay hông và vai khá tốt, tạo lực xoay cơ thể hiệu quả trong pha đập." },
          { name:"Tư thế chân & Bước nhảy", score:74, angleActual:42, angleIdeal:35, severity:"warning",
            feedback:"Chân trụ (chân trái) hơi khuỵu, cần duỗi thẳng hơn khi bật nhảy để tạo lực nâng tối đa." },
          { name:"Follow-through", score:88, severity:"good",
            feedback:"Pha vung vợt sau đập tự nhiên và đúng hướng, giảm áp lực lên vai." },
          { name:"Cổ tay & Snap", score:70, angleActual:45, angleIdeal:60, severity:"warning",
            feedback:"Cổ tay snap (bẻ cổ tay) chưa đủ mạnh. Cần bẻ cổ tay nhanh hơn ở thời điểm tiếp xúc cầu để tăng tốc độ đập." },
        ],
        recommendations: [
          "Tập drill shadow smash: đứng tại chỗ, vung vợt từ sau lưng lên cao, tập trung vào việc duỗi thẳng tay ở điểm cao nhất",
          "Tập wrist snap với quả bóng tennis: cầm vợt và bẻ cổ tay đập bóng vào tường liên tục 50 lần/set",
          "Tập nhảy tại chỗ (scissor jump): bật nhảy và xoay hông trên không, đáp đất nhẹ nhàng bằng chân trước",
          "Quay video chậm (slow-motion) từ góc bên để kiểm tra điểm tiếp xúc cầu và góc cánh tay",
        ],
        metrics: [
          {label:"Góc cánh tay", value:"155", unit:"°", status:"warning"},
          {label:"Xoay hông", value:"Tốt", unit:"", status:"good"},
          {label:"Wrist snap", value:"45", unit:"°", status:"warning"},
          {label:"Chiều cao đập", value:"82", unit:"%", status:"good"},
        ],
      },
      dropshot: {
        name: "Bỏ nhỏ (Drop Shot)", emoji: "🪶",
        poseTop: {
          head:{x:.48,y:.08}, neck:{x:.48,y:.15},
          r_shoulder:{x:.58,y:.20}, l_shoulder:{x:.38,y:.20},
          r_elbow:{x:.65,y:.14}, l_elbow:{x:.30,y:.30},
          r_wrist:{x:.70,y:.08}, l_wrist:{x:.24,y:.38},
          r_hip:{x:.54,y:.46}, l_hip:{x:.42,y:.46},
          r_knee:{x:.56,y:.66}, l_knee:{x:.38,y:.68},
          r_ankle:{x:.58,y:.87}, l_ankle:{x:.34,y:.89},
        },
        poseBottom: {
          head:{x:.49,y:.10}, neck:{x:.49,y:.17},
          r_shoulder:{x:.59,y:.22}, l_shoulder:{x:.39,y:.22},
          r_elbow:{x:.66,y:.18}, l_elbow:{x:.31,y:.32},
          r_wrist:{x:.68,y:.24}, l_wrist:{x:.26,y:.40},
          r_hip:{x:.54,y:.47}, l_hip:{x:.43,y:.47},
          r_knee:{x:.55,y:.67}, l_knee:{x:.40,y:.69},
          r_ankle:{x:.57,y:.88}, l_ankle:{x:.36,y:.90},
        },
        score: 84,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"warning",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Giả động tác (Deception)", score:90, severity:"good",
            feedback:"Pha chuẩn bị giống với smash – đối thủ khó đoán. Giữ nguyên cách này!" },
          { name:"Kiểm soát lực cổ tay", score:82, severity:"good",
            feedback:"Lực bỏ nhỏ khá ổn, cầu rơi sát lưới. Cần nhẹ tay hơn 1 chút ở cuối." },
          { name:"Điểm tiếp xúc", score:85, severity:"good",
            feedback:"Tiếp xúc cầu ở vị trí trước thân người – tốt cho việc kiểm soát hướng." },
          { name:"Trọng tâm & Di chuyển", score:72, severity:"warning",
            feedback:"Trọng tâm hơi thấp. Cần nâng cao hơn để sẵn sàng di chuyển lại trung tâm sau khi bỏ nhỏ." },
          { name:"Recovery", score:80, severity:"good",
            feedback:"Phục hồi về trung tâm tương đối nhanh, nhưng có thể cải thiện thêm." },
        ],
        recommendations: [
          "Tập drill bỏ nhỏ chéo sân: đứng ở góc phải, bỏ nhỏ chéo sang góc trái đối diện lưới",
          "Luyện phản xạ phục hồi: sau mỗi quả bỏ nhỏ, lập tức lùi về vị trí trung tâm sân",
          "Kết hợp drill smash → drop shot liên tiếp để đối thủ không đoán được",
          "Tập nhịp tay: chạm cầu nhẹ, lực tập trung ở ngón tay chứ không phải cánh tay",
        ],
        metrics: [
          {label:"Deception", value:"90", unit:"%", status:"good"},
          {label:"Lực kiểm soát", value:"Tốt", unit:"", status:"good"},
          {label:"Recovery", value:"1.2", unit:"s", status:"warning"},
          {label:"Độ chính xác", value:"85", unit:"%", status:"good"},
        ],
      },
      clear: {
        name: "Đánh cao (Clear)", emoji: "🌈",
        poseTop: {
          head:{x:.47,y:.07}, neck:{x:.47,y:.14},
          r_shoulder:{x:.57,y:.19}, l_shoulder:{x:.37,y:.19},
          r_elbow:{x:.67,y:.11}, l_elbow:{x:.28,y:.28},
          r_wrist:{x:.73,y:.05}, l_wrist:{x:.22,y:.36},
          r_hip:{x:.54,y:.45}, l_hip:{x:.41,y:.45},
          r_knee:{x:.56,y:.65}, l_knee:{x:.37,y:.67},
          r_ankle:{x:.58,y:.86}, l_ankle:{x:.33,y:.88},
        },
        poseBottom: {
          head:{x:.49,y:.12}, neck:{x:.49,y:.19},
          r_shoulder:{x:.59,y:.24}, l_shoulder:{x:.39,y:.24},
          r_elbow:{x:.70,y:.18}, l_elbow:{x:.30,y:.32},
          r_wrist:{x:.76,y:.12}, l_wrist:{x:.24,y:.40},
          r_hip:{x:.55,y:.47}, l_hip:{x:.43,y:.47},
          r_knee:{x:.56,y:.67}, l_knee:{x:.40,y:.69},
          r_ankle:{x:.57,y:.87}, l_ankle:{x:.37,y:.89},
        },
        score: 81,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"warning", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Tầm với & Điểm đánh", score:85, severity:"good",
            feedback:"Đánh cầu ở điểm cao tốt, tạo quỹ đạo cầu bay cao và sâu vào cuối sân đối thủ." },
          { name:"Xoay vai & Lực đánh", score:72, angleActual:150, angleIdeal:170, severity:"warning",
            feedback:"Vai chưa xoay đủ rộng. Cần kéo vợt ra sau vai nhiều hơn trước khi đánh để tạo lực mạnh." },
          { name:"Thân dưới & Bước chân", score:86, severity:"good",
            feedback:"Bước chân di chuyển tốt, trọng tâm ổn định khi đánh clear." },
          { name:"Follow-through", score:82, severity:"good",
            feedback:"Vung vợt hoàn chỉnh sau khi đánh, cánh tay theo hướng cầu bay tự nhiên." },
        ],
        recommendations: [
          "Tập xoay vai rộng hơn: đứng quay lưng về phía lưới, xoay vai 180° rồi đánh clear",
          "Drill clear sâu sân: đánh 20 quả liên tiếp, mỗi quả phải bay qua đường cuối sân đối thủ",
          "Kết hợp footwork: lùi 3 bước → đánh clear → tiến lên trung tâm liên tục",
          "Tập sức mạnh vai: dùng dây kháng lực (resistance band) mô phỏng động tác đánh clear",
        ],
        metrics: [
          {label:"Điểm đánh", value:"Cao", unit:"", status:"good"},
          {label:"Xoay vai", value:"150", unit:"°", status:"warning"},
          {label:"Quỹ đạo cầu", value:"Tốt", unit:"", status:"good"},
          {label:"Độ sâu", value:"92", unit:"%", status:"good"},
        ],
      },
      footwork: {
        name: "Bước chân (Footwork)", emoji: "👟",
        poseTop: {
          head:{x:.50,y:.08}, neck:{x:.50,y:.15},
          r_shoulder:{x:.60,y:.21}, l_shoulder:{x:.40,y:.21},
          r_elbow:{x:.65,y:.32}, l_elbow:{x:.35,y:.32},
          r_wrist:{x:.62,y:.42}, l_wrist:{x:.38,y:.42},
          r_hip:{x:.56,y:.46}, l_hip:{x:.44,y:.46},
          r_knee:{x:.62,y:.64}, l_knee:{x:.38,y:.66},
          r_ankle:{x:.66,y:.85}, l_ankle:{x:.34,y:.87},
        },
        poseBottom: {
          head:{x:.50,y:.10}, neck:{x:.50,y:.17},
          r_shoulder:{x:.60,y:.23}, l_shoulder:{x:.40,y:.23},
          r_elbow:{x:.64,y:.34}, l_elbow:{x:.36,y:.34},
          r_wrist:{x:.61,y:.44}, l_wrist:{x:.39,y:.44},
          r_hip:{x:.55,y:.47}, l_hip:{x:.45,y:.47},
          r_knee:{x:.58,y:.66}, l_knee:{x:.42,y:.68},
          r_ankle:{x:.60,y:.87}, l_ankle:{x:.40,y:.89},
        },
        score: 72,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"warning", l_hip:"good",
          r_knee:"warning", l_knee:"warning",
          r_ankle:"warning", l_ankle:"good",
        },
        bodyParts: [
          { name:"Bước lunge trước", score:65, angleActual:115, angleIdeal:90, severity:"warning",
            feedback:"Bước lunge chưa đủ sâu. Cần bước rộng hơn và hạ trọng tâm thấp hơn khi tiến lên lưới." },
          { name:"Recovery về trung tâm", score:68, severity:"warning",
            feedback:"Phục hồi về trung tâm hơi chậm (1.5s). Cần đẩy mạnh chân trước để lùi nhanh hơn." },
          { name:"Bước chéo (Cross-step)", score:80, severity:"good",
            feedback:"Bước chéo sang hai bên tương đối nhanh và ổn định." },
          { name:"Tư thế sẵn sàng (Ready)", score:75, severity:"warning",
            feedback:"Trọng tâm hơi cao ở tư thế sẵn sàng. Hạ thấp hông và đứng trên nửa bàn chân trước." },
          { name:"Nhịp chân Split-step", score:82, severity:"good",
            feedback:"Thời điểm split-step khá tốt, đồng bộ với pha đánh cầu của đối thủ." },
        ],
        recommendations: [
          "Tập drill 6 góc: đặt 6 quả cầu ở 6 góc sân, di chuyển nhặt từng quả rồi trở về trung tâm",
          "Tập lunge sâu: chân trước gập 90° ở đầu gối, giữ 3 giây mỗi lần x 20 reps",
          "Drill recovery: lunge tới lưới → đẩy mạnh chân trước → lùi 3 bước nhanh, lặp 30 lần",
          "Tập shadow footwork theo nhịp: dùng metronome tăng dần tốc độ từ 60 → 120 bpm",
        ],
        metrics: [
          {label:"Lunge depth", value:"115", unit:"°", status:"warning"},
          {label:"Recovery", value:"1.5", unit:"s", status:"warning"},
          {label:"Split-step", value:"Tốt", unit:"", status:"good"},
          {label:"Cross-step", value:"Ổn", unit:"", status:"good"},
        ],
      },
    },
  },
  tennis: {
    name: "Tennis", emoji: "🎾", color: "text-yellow-600", bg: "bg-yellow-50",
    techniques: {
      serve: {
        name: "Giao bóng (Serve)", emoji: "🎯",
        poseTop: {
          head:{x:.48,y:.06}, neck:{x:.48,y:.13},
          r_shoulder:{x:.58,y:.18}, l_shoulder:{x:.38,y:.18},
          r_elbow:{x:.68,y:.08}, l_elbow:{x:.32,y:.10},
          r_wrist:{x:.72,y:.03}, l_wrist:{x:.36,y:.04},
          r_hip:{x:.55,y:.45}, l_hip:{x:.42,y:.46},
          r_knee:{x:.58,y:.65}, l_knee:{x:.38,y:.68},
          r_ankle:{x:.60,y:.86}, l_ankle:{x:.35,y:.89},
        },
        poseBottom: {
          head:{x:.50,y:.12}, neck:{x:.50,y:.19},
          r_shoulder:{x:.60,y:.24}, l_shoulder:{x:.40,y:.24},
          r_elbow:{x:.72,y:.32}, l_elbow:{x:.30,y:.34},
          r_wrist:{x:.80,y:.40}, l_wrist:{x:.25,y:.42},
          r_hip:{x:.56,y:.48}, l_hip:{x:.44,y:.48},
          r_knee:{x:.56,y:.68}, l_knee:{x:.42,y:.70},
          r_ankle:{x:.56,y:.88}, l_ankle:{x:.40,y:.90},
        },
        score: 79,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"warning", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"warning", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Tung bóng (Ball Toss)", score:70, severity:"warning",
            feedback:"Bóng tung hơi lệch sang phải. Cần tung thẳng lên phía trước, cao hơn tầm với 15-20cm." },
          { name:"Xoay chuỗi động học", score:85, severity:"good",
            feedback:"Chuỗi xoay chân → hông → vai → tay khá tốt, lực truyền liên tục." },
          { name:"Trophy Position", score:72, angleActual:85, angleIdeal:90, severity:"warning",
            feedback:"Vai hơi thấp ở tư thế trophy. Nâng cùi chỏ ngang tầm vai, vợt chỉ xuống lưng." },
          { name:"Pronation (Xoay cổ tay)", score:82, severity:"good",
            feedback:"Xoay cổ tay ở pha đánh tương đối tốt, tạo topspin hiệu quả." },
          { name:"Follow-through", score:88, severity:"good",
            feedback:"Pha vung vợt kết thúc tự nhiên bên hông trái – đúng kỹ thuật." },
        ],
        recommendations: [
          "Drill tung bóng: đứng cạnh tường, tung bóng 50 lần, bóng phải chạm tường ở cùng 1 điểm",
          "Tập trophy position trước gương: giơ cùi chỏ ngang vai, giữ 5s × 20 reps",
          "Tập serve với mục tiêu: đặt hộp ở các góc ô giao bóng, aim vào hộp",
          "Quay video góc bên và góc sau lưng để kiểm tra ball toss và body rotation",
        ],
        metrics: [
          {label:"Ball toss", value:"Lệch", unit:"", status:"warning"},
          {label:"Trophy pos", value:"85", unit:"°", status:"warning"},
          {label:"Pronation", value:"Tốt", unit:"", status:"good"},
          {label:"Tốc độ", value:"155", unit:"km/h", status:"good"},
        ],
      },
      forehand: {
        name: "Thuận tay (Forehand)", emoji: "💪",
        poseTop: {
          head:{x:.50,y:.08}, neck:{x:.50,y:.15},
          r_shoulder:{x:.60,y:.20}, l_shoulder:{x:.40,y:.20},
          r_elbow:{x:.72,y:.28}, l_elbow:{x:.32,y:.28},
          r_wrist:{x:.80,y:.22}, l_wrist:{x:.28,y:.36},
          r_hip:{x:.56,y:.46}, l_hip:{x:.44,y:.46},
          r_knee:{x:.60,y:.66}, l_knee:{x:.40,y:.68},
          r_ankle:{x:.62,y:.86}, l_ankle:{x:.38,y:.88},
        },
        poseBottom: {
          head:{x:.50,y:.10}, neck:{x:.50,y:.17},
          r_shoulder:{x:.60,y:.22}, l_shoulder:{x:.40,y:.22},
          r_elbow:{x:.36,y:.30}, l_elbow:{x:.52,y:.28},
          r_wrist:{x:.28,y:.36}, l_wrist:{x:.58,y:.34},
          r_hip:{x:.54,y:.47}, l_hip:{x:.46,y:.47},
          r_knee:{x:.56,y:.67}, l_knee:{x:.44,y:.69},
          r_ankle:{x:.58,y:.87}, l_ankle:{x:.42,y:.89},
        },
        score: 86,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"warning", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Unit Turn (Xoay thân)", score:90, severity:"good",
            feedback:"Xoay vai và hông đồng bộ tốt, vợt kéo ra sau đủ sâu." },
          { name:"Điểm tiếp xúc bóng", score:88, severity:"good",
            feedback:"Đánh bóng phía trước thân người tốt, tạo lực tối đa." },
          { name:"Windshield Wiper Finish", score:85, severity:"good",
            feedback:"Pha kết thúc vợt xoay qua vai trái tự nhiên, tạo topspin." },
          { name:"Chân trụ & Trọng tâm", score:75, severity:"warning",
            feedback:"Đầu gối chân phải hơi cứng. Cần gập chân trụ hơn để hạ trọng tâm." },
        ],
        recommendations: [
          "Tập rally cross-court 100 quả liên tiếp, tập trung vào điểm tiếp xúc phía trước thân",
          "Drill footwork: nhảy split-step → bước chéo → xoay hông → đánh forehand",
          "Tập gập gối chân trụ: đứng tại chỗ, gập gối 30° và giữ khi đánh forehand 20 lần",
          "Quay video từ phía sau để kiểm tra unit turn và windshield wiper finish",
        ],
        metrics: [
          {label:"Unit turn", value:"90", unit:"%", status:"good"},
          {label:"Tiếp xúc", value:"Trước", unit:"", status:"good"},
          {label:"Topspin", value:"2200", unit:"rpm", status:"good"},
          {label:"Chân trụ", value:"Cải thiện", unit:"", status:"warning"},
        ],
      },
    },
  },
  boxing: {
    name: "Boxing", emoji: "🥊", color: "text-red-600", bg: "bg-red-50",
    techniques: {
      jab: {
        name: "Jab (Đấm thẳng)", emoji: "👊",
        poseTop: {
          head:{x:.48,y:.08}, neck:{x:.48,y:.15},
          r_shoulder:{x:.56,y:.21}, l_shoulder:{x:.40,y:.21},
          r_elbow:{x:.56,y:.30}, l_elbow:{x:.36,y:.22},
          r_wrist:{x:.55,y:.20}, l_wrist:{x:.28,y:.20},
          r_hip:{x:.54,y:.48}, l_hip:{x:.44,y:.48},
          r_knee:{x:.56,y:.67}, l_knee:{x:.42,y:.67},
          r_ankle:{x:.58,y:.87}, l_ankle:{x:.40,y:.87},
        },
        poseBottom: {
          head:{x:.48,y:.10}, neck:{x:.48,y:.17},
          r_shoulder:{x:.56,y:.23}, l_shoulder:{x:.40,y:.23},
          r_elbow:{x:.52,y:.24}, l_elbow:{x:.20,y:.22},
          r_wrist:{x:.50,y:.22}, l_wrist:{x:.12,y:.21},
          r_hip:{x:.54,y:.49}, l_hip:{x:.44,y:.49},
          r_knee:{x:.56,y:.68}, l_knee:{x:.42,y:.68},
          r_ankle:{x:.58,y:.88}, l_ankle:{x:.40,y:.88},
        },
        score: 82,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"warning", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"warning", l_ankle:"good",
        },
        bodyParts: [
          { name:"Tay guard (Tay phải giữ)", score:90, severity:"good",
            feedback:"Tay phải giữ sát cằm tốt khi đấm jab tay trái – phòng thủ tốt." },
          { name:"Vai bảo vệ cằm", score:85, severity:"good",
            feedback:"Vai trái nâng lên bảo vệ cằm khi duỗi jab – kỹ thuật tốt." },
          { name:"Xoay nắm đấm", score:74, severity:"warning",
            feedback:"Cổ tay chưa xoay đủ ở cuối jab. Nắm đấm cần xoay ngang (palm down) khi tiếp xúc." },
          { name:"Chân trước & Trọng tâm", score:78, severity:"warning",
            feedback:"Chân trước hơi trượt khi jab. Giữ chân trước ổn định, chỉ xoay nhẹ bàn chân." },
          { name:"Tốc độ & Retract", score:88, severity:"good",
            feedback:"Tốc độ jab nhanh và kéo tay về guard tốt." },
        ],
        recommendations: [
          "Tập jab trước gương: chú ý xoay nắm đấm 90° khi duỗi hết tay",
          "Drill jab–cross combo: 3 phút liên tục trên bao cát, giữ guard tay kia ở cằm",
          "Tập footwork với jab: bước trước → jab → bước lui, giữ khoảng cách ổn định",
          "Tập resistance band jab: đeo dây kháng lực ở cổ tay, jab 50 lần mỗi set",
        ],
        metrics: [
          {label:"Guard tay", value:"90", unit:"%", status:"good"},
          {label:"Xoay đấm", value:"74", unit:"%", status:"warning"},
          {label:"Tốc độ", value:"0.18", unit:"s", status:"good"},
          {label:"Retract", value:"Nhanh", unit:"", status:"good"},
        ],
      },
      cross: {
        name: "Cross (Đấm thẳng sau)", emoji: "💥",
        poseTop: {
          head:{x:.48,y:.08}, neck:{x:.48,y:.15},
          r_shoulder:{x:.56,y:.21}, l_shoulder:{x:.40,y:.21},
          r_elbow:{x:.60,y:.22}, l_elbow:{x:.36,y:.30},
          r_wrist:{x:.66,y:.18}, l_wrist:{x:.38,y:.20},
          r_hip:{x:.54,y:.48}, l_hip:{x:.44,y:.48},
          r_knee:{x:.56,y:.67}, l_knee:{x:.42,y:.67},
          r_ankle:{x:.58,y:.87}, l_ankle:{x:.40,y:.87},
        },
        poseBottom: {
          head:{x:.48,y:.10}, neck:{x:.48,y:.17},
          r_shoulder:{x:.52,y:.23}, l_shoulder:{x:.40,y:.23},
          r_elbow:{x:.28,y:.21}, l_elbow:{x:.42,y:.22},
          r_wrist:{x:.16,y:.20}, l_wrist:{x:.44,y:.20},
          r_hip:{x:.50,y:.49}, l_hip:{x:.46,y:.49},
          r_knee:{x:.52,y:.68}, l_knee:{x:.44,y:.68},
          r_ankle:{x:.56,y:.88}, l_ankle:{x:.42,y:.88},
        },
        score: 77,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"warning", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"warning", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"good", l_ankle:"warning",
        },
        bodyParts: [
          { name:"Xoay hông", score:70, angleActual:35, angleIdeal:45, severity:"warning",
            feedback:"Hông chưa xoay đủ mạnh. Cross cần lực từ chân sau → hông → vai → nắm đấm." },
          { name:"Chân sau & Pivot", score:72, severity:"warning",
            feedback:"Gót chân sau chưa nâng lên khi xoay. Cần pivot trên mũi chân để truyền lực tối đa." },
          { name:"Đường đấm (Punch line)", score:85, severity:"good",
            feedback:"Đường đấm thẳng, nắm đấm đến mục tiêu theo đường thẳng – tốt." },
          { name:"Vai bảo vệ cằm", score:80, severity:"good",
            feedback:"Vai phải nâng bảo vệ cằm khi đấm cross, nhưng có thể nâng cao hơn." },
        ],
        recommendations: [
          "Tập pivot chân sau: đứng tại chỗ, xoay chân sau trên mũi bàn chân 50 lần",
          "Drill xoay hông trước gương: tập chuỗi chân → hông → vai không cần đấm, tập trung cảm giác xoay",
          "Tập heavy bag: đấm cross đơn 3 phút, chú ý gót chân sau phải nâng lên",
          "Shadow boxing với dây kháng lực ở thắt lưng để tăng lực xoay hông",
        ],
        metrics: [
          {label:"Xoay hông", value:"35", unit:"°", status:"warning"},
          {label:"Pivot chân", value:"Thiếu", unit:"", status:"warning"},
          {label:"Đường đấm", value:"Thẳng", unit:"", status:"good"},
          {label:"Lực đấm", value:"78", unit:"%", status:"good"},
        ],
      },
    },
  },
  gym: {
    name: "Thể hình", emoji: "🏋️", color: "text-orange-600", bg: "bg-orange-50",
    techniques: {
      squat: {
        name: "Squat", emoji: "🦵",
        poseTop: {
          head:{x:.50,y:.06}, neck:{x:.50,y:.14},
          r_shoulder:{x:.62,y:.20}, l_shoulder:{x:.38,y:.20},
          r_elbow:{x:.69,y:.30}, l_elbow:{x:.31,y:.30},
          r_wrist:{x:.70,y:.41}, l_wrist:{x:.30,y:.41},
          r_hip:{x:.57,y:.48}, l_hip:{x:.43,y:.48},
          r_knee:{x:.57,y:.67}, l_knee:{x:.43,y:.67},
          r_ankle:{x:.57,y:.86}, l_ankle:{x:.43,y:.86},
        },
        poseBottom: {
          head:{x:.50,y:.11}, neck:{x:.50,y:.19},
          r_shoulder:{x:.63,y:.27}, l_shoulder:{x:.37,y:.27},
          r_elbow:{x:.74,y:.38}, l_elbow:{x:.26,y:.38},
          r_wrist:{x:.80,y:.46}, l_wrist:{x:.20,y:.46},
          r_hip:{x:.62,y:.57}, l_hip:{x:.38,y:.57},
          r_knee:{x:.65,y:.75}, l_knee:{x:.35,y:.75},
          r_ankle:{x:.65,y:.91}, l_ankle:{x:.35,y:.91},
        },
        score: 78,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"warning", l_knee:"warning",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Đầu gối", score:62, angleActual:145, angleIdeal:160, severity:"warning",
            feedback:"Đầu gối đổ vào trong (knee valgus). Cần ép đầu gối hướng ra ngoài theo hướng ngón chân." },
          { name:"Hông & Độ sâu", score:88, angleActual:92, angleIdeal:90, severity:"good",
            feedback:"Độ sâu squat tốt – hông xuống dưới đường song song với mặt đất." },
          { name:"Cột sống", score:75, angleActual:38, angleIdeal:30, severity:"warning",
            feedback:"Lưng nghiêng về trước hơi nhiều (38°). Cố gắng giữ ngực hướng lên." },
          { name:"Cổ chân", score:85, severity:"good",
            feedback:"Độ linh hoạt cổ chân tốt, gót chân ổn định." },
        ],
        recommendations: [
          "Đứng gần tường 30cm, squat không để đầu gối chạm tường để sửa knee valgus",
          "Tập hip thrust và clamshell để kích hoạt cơ mông (glute activation)",
          "Đặt chân rộng hơn vai 10–15cm, mũi bàn chân xoay ra ngoài 30°",
          "Hít sâu và brace core (Valsalva) trước khi xuống squat",
        ],
        metrics: [
          {label:"Góc đầu gối", value:"145", unit:"°", status:"warning"},
          {label:"Góc hông", value:"92", unit:"°", status:"good"},
          {label:"Độ sâu", value:"101", unit:"%", status:"good"},
          {label:"Knee valgus", value:"8", unit:"°", status:"warning"},
        ],
      },
      deadlift: {
        name: "Deadlift", emoji: "🏋️",
        poseTop: {
          head:{x:.50,y:.07}, neck:{x:.50,y:.14},
          r_shoulder:{x:.61,y:.21}, l_shoulder:{x:.39,y:.21},
          r_elbow:{x:.62,y:.35}, l_elbow:{x:.38,y:.35},
          r_wrist:{x:.60,y:.53}, l_wrist:{x:.40,y:.53},
          r_hip:{x:.57,y:.48}, l_hip:{x:.43,y:.48},
          r_knee:{x:.57,y:.67}, l_knee:{x:.43,y:.67},
          r_ankle:{x:.57,y:.86}, l_ankle:{x:.43,y:.86},
        },
        poseBottom: {
          head:{x:.54,y:.24}, neck:{x:.53,y:.31},
          r_shoulder:{x:.63,y:.33}, l_shoulder:{x:.45,y:.30},
          r_elbow:{x:.62,y:.53}, l_elbow:{x:.45,y:.50},
          r_wrist:{x:.61,y:.71}, l_wrist:{x:.44,y:.69},
          r_hip:{x:.62,y:.57}, l_hip:{x:.48,y:.54},
          r_knee:{x:.64,y:.76}, l_knee:{x:.51,y:.73},
          r_ankle:{x:.65,y:.91}, l_ankle:{x:.51,y:.91},
        },
        score: 85,
        jointIssues: {
          head:"warning", neck:"warning",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Cột sống & Lưng", score:80, angleActual:12, angleIdeal:5, severity:"warning",
            feedback:"Cột sống hơi cong ở lưng trên. Kéo vai ra sau và giữ ngực mở rộng." },
          { name:"Hip hinge", score:90, severity:"good",
            feedback:"Hip hinge tốt, cơ đùi sau được kéo căng hiệu quả." },
          { name:"Đầu gối", score:88, severity:"good",
            feedback:"Góc đầu gối ổn định trong suốt động tác." },
          { name:"Đầu & Cổ", score:70, severity:"warning",
            feedback:"Đầu hơi cúi xuống. Nhìn xuống điểm 2–3m trước mặt." },
        ],
        recommendations: [
          "Tập Good Morning để cải thiện hip hinge và kiểm soát lưng trên",
          "Trước lift: hít sâu, brace core, 'squeeze oranges dưới nách'",
          "Quay video góc bên (side view) để kiểm tra bar path",
          "Thêm Romanian Deadlift để cải thiện kiểm soát cột sống bằng tải nhẹ",
        ],
        metrics: [
          {label:"Cong cột sống", value:"12", unit:"°", status:"warning"},
          {label:"Hip hinge", value:"Tốt", unit:"", status:"good"},
          {label:"Bar path", value:"Thẳng", unit:"", status:"good"},
          {label:"Lockout", value:"Hoàn chỉnh", unit:"", status:"good"},
        ],
      },
    },
  },
  football: {
    name: "Bóng đá", emoji: "⚽", color: "text-emerald-600", bg: "bg-emerald-50",
    techniques: {
      shot: {
        name: "Sút bóng (Shooting)", emoji: "⚽",
        poseTop: {
          head:{x:.48,y:.07}, neck:{x:.48,y:.14},
          r_shoulder:{x:.58,y:.20}, l_shoulder:{x:.38,y:.20},
          r_elbow:{x:.64,y:.30}, l_elbow:{x:.32,y:.30},
          r_wrist:{x:.62,y:.40}, l_wrist:{x:.30,y:.40},
          r_hip:{x:.55,y:.46}, l_hip:{x:.42,y:.46},
          r_knee:{x:.60,y:.58}, l_knee:{x:.38,y:.66},
          r_ankle:{x:.65,y:.72}, l_ankle:{x:.35,y:.86},
        },
        poseBottom: {
          head:{x:.50,y:.09}, neck:{x:.50,y:.16},
          r_shoulder:{x:.60,y:.22}, l_shoulder:{x:.40,y:.22},
          r_elbow:{x:.65,y:.32}, l_elbow:{x:.34,y:.32},
          r_wrist:{x:.63,y:.42}, l_wrist:{x:.32,y:.42},
          r_hip:{x:.56,y:.47}, l_hip:{x:.44,y:.47},
          r_knee:{x:.50,y:.64}, l_knee:{x:.40,y:.67},
          r_ankle:{x:.44,y:.80}, l_ankle:{x:.38,y:.87},
        },
        score: 80,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"warning", l_hip:"good",
          r_knee:"warning", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Chân trụ (Planting foot)", score:85, severity:"good",
            feedback:"Chân trụ đặt cạnh bóng ổn định, khoảng cách 20cm – tốt." },
          { name:"Pha vung chân (Backswing)", score:72, angleActual:80, angleIdeal:100, severity:"warning",
            feedback:"Pha vung chân sau chưa đủ rộng. Cần kéo chân sút ra sau hông nhiều hơn." },
          { name:"Điểm tiếp xúc bóng", score:82, severity:"good",
            feedback:"Tiếp xúc bóng bằng mu bàn chân tốt, bóng đi thẳng." },
          { name:"Follow-through", score:78, severity:"warning",
            feedback:"Pha vung chân sau sút hơi ngắn. Chân sút cần theo hướng mục tiêu." },
          { name:"Cân bằng thân trên", score:88, severity:"good",
            feedback:"Thân trên giữ thẳng, hơi ngả về sau khi sút – tốt cho lực sút." },
        ],
        recommendations: [
          "Tập sút vào tường 50 lần: tập trung vào pha vung chân rộng và follow-through dài",
          "Đặt cone cạnh bóng để luyện vị trí chân trụ chính xác",
          "Quay video slow-motion để kiểm tra mu bàn chân tiếp xúc bóng",
          "Tập sút bóng tĩnh trước, sau đó tăng dần tốc độ chạy đà",
        ],
        metrics: [
          {label:"Chân trụ", value:"Tốt", unit:"", status:"good"},
          {label:"Backswing", value:"80", unit:"°", status:"warning"},
          {label:"Điểm chạm", value:"Mu chân", unit:"", status:"good"},
          {label:"Follow-through", value:"Ngắn", unit:"", status:"warning"},
        ],
      },
      dribble: {
        name: "Rê bóng (Dribbling)", emoji: "🏃",
        poseTop: {
          head:{x:.50,y:.08}, neck:{x:.50,y:.15},
          r_shoulder:{x:.58,y:.20}, l_shoulder:{x:.42,y:.20},
          r_elbow:{x:.64,y:.30}, l_elbow:{x:.36,y:.30},
          r_wrist:{x:.62,y:.39}, l_wrist:{x:.38,y:.39},
          r_hip:{x:.55,y:.46}, l_hip:{x:.45,y:.46},
          r_knee:{x:.58,y:.65}, l_knee:{x:.42,y:.67},
          r_ankle:{x:.60,y:.84}, l_ankle:{x:.40,y:.86},
        },
        poseBottom: {
          head:{x:.50,y:.10}, neck:{x:.50,y:.17},
          r_shoulder:{x:.58,y:.22}, l_shoulder:{x:.42,y:.22},
          r_elbow:{x:.63,y:.32}, l_elbow:{x:.37,y:.32},
          r_wrist:{x:.61,y:.41}, l_wrist:{x:.39,y:.41},
          r_hip:{x:.55,y:.47}, l_hip:{x:.45,y:.47},
          r_knee:{x:.56,y:.66}, l_knee:{x:.44,y:.68},
          r_ankle:{x:.58,y:.85}, l_ankle:{x:.42,y:.87},
        },
        score: 74,
        jointIssues: {
          head:"warning", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"warning", l_ankle:"warning",
        },
        bodyParts: [
          { name:"Tầm nhìn (Head up)", score:65, severity:"warning",
            feedback:"Mắt nhìn xuống bóng quá nhiều. Cần ngẩng đầu lên để quan sát đồng đội và đối thủ." },
          { name:"Chạm bóng nhẹ (Soft touch)", score:78, severity:"good",
            feedback:"Lực chạm bóng tương đối nhẹ, bóng không rời xa chân." },
          { name:"Thay đổi hướng", score:72, severity:"warning",
            feedback:"Cổ chân hơi cứng khi đổi hướng. Cần linh hoạt mắt cá chân hơn." },
          { name:"Tốc độ & Nhịp", score:80, severity:"good",
            feedback:"Nhịp rê bóng đều, tốc độ ổn định khi di chuyển thẳng." },
        ],
        recommendations: [
          "Tập rê bóng quanh cone mà KHÔNG nhìn xuống bóng – bắt đầu chậm rồi tăng tốc",
          "Drill inside-outside touch: rê bóng luân phiên trong-ngoài chân 100 lần mỗi bên",
          "Tập cổ chân flexibility: xoay mắt cá chân 20 vòng mỗi hướng trước khi tập",
          "Rê bóng qua 10 cone zigzag, mỗi cone đổi chân chạm, tính thời gian và cải thiện dần",
        ],
        metrics: [
          {label:"Head up", value:"35", unit:"%", status:"warning"},
          {label:"Soft touch", value:"Tốt", unit:"", status:"good"},
          {label:"Đổi hướng", value:"Cứng", unit:"", status:"warning"},
          {label:"Tốc độ", value:"Ổn", unit:"", status:"good"},
        ],
      },
    },
  },
  yoga: {
    name: "Yoga", emoji: "🧘", color: "text-indigo-600", bg: "bg-indigo-50",
    techniques: {
      warrior2: {
        name: "Warrior II (Virabhadrasana)", emoji: "🧘",
        poseTop: {
          head:{x:.50,y:.08}, neck:{x:.50,y:.15},
          r_shoulder:{x:.60,y:.21}, l_shoulder:{x:.40,y:.21},
          r_elbow:{x:.75,y:.21}, l_elbow:{x:.25,y:.21},
          r_wrist:{x:.88,y:.21}, l_wrist:{x:.12,y:.21},
          r_hip:{x:.55,y:.48}, l_hip:{x:.45,y:.48},
          r_knee:{x:.68,y:.68}, l_knee:{x:.32,y:.68},
          r_ankle:{x:.75,y:.88}, l_ankle:{x:.25,y:.88},
        },
        poseBottom: {
          head:{x:.50,y:.10}, neck:{x:.50,y:.17},
          r_shoulder:{x:.60,y:.23}, l_shoulder:{x:.40,y:.23},
          r_elbow:{x:.74,y:.23}, l_elbow:{x:.26,y:.23},
          r_wrist:{x:.86,y:.23}, l_wrist:{x:.14,y:.23},
          r_hip:{x:.55,y:.49}, l_hip:{x:.45,y:.49},
          r_knee:{x:.66,y:.69}, l_knee:{x:.34,y:.69},
          r_ankle:{x:.74,y:.89}, l_ankle:{x:.26,y:.89},
        },
        score: 83,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"good", l_hip:"good",
          r_knee:"warning", l_knee:"good",
          r_ankle:"good", l_ankle:"good",
        },
        bodyParts: [
          { name:"Cánh tay song song", score:90, severity:"good",
            feedback:"Hai cánh tay song song mặt đất tốt, vai thả lỏng không nhún lên." },
          { name:"Đầu gối trước", score:75, angleActual:100, angleIdeal:90, severity:"warning",
            feedback:"Đầu gối trước chưa gập đủ 90°. Hạ hông xuống thêm để đùi song song mặt đất." },
          { name:"Hông mở", score:85, severity:"good",
            feedback:"Hông mở rộng tốt, xương chậu hướng ra phía bên." },
          { name:"Cột sống thẳng", score:88, severity:"good",
            feedback:"Cột sống thẳng đứng, không nghiêng về phía trước." },
        ],
        recommendations: [
          "Đứng dựa tường: tập Warrior II với lưng sát tường để cảm nhận cột sống thẳng",
          "Giữ tư thế 30 giây → nghỉ → tăng dần lên 60 giây để tăng sức bền đùi",
          "Đặt block yoga dưới đùi trước để kiểm tra đùi có song song mặt đất không",
          "Tập trung thở đều: hít vào 4 nhịp, thở ra 6 nhịp khi giữ tư thế",
        ],
        metrics: [
          {label:"Cánh tay", value:"Song song", unit:"", status:"good"},
          {label:"Đầu gối", value:"100", unit:"°", status:"warning"},
          {label:"Hông mở", value:"Tốt", unit:"", status:"good"},
          {label:"Cột sống", value:"Thẳng", unit:"", status:"good"},
        ],
      },
      treepose: {
        name: "Tree Pose (Vrksasana)", emoji: "🌳",
        poseTop: {
          head:{x:.50,y:.06}, neck:{x:.50,y:.13},
          r_shoulder:{x:.60,y:.19}, l_shoulder:{x:.40,y:.19},
          r_elbow:{x:.56,y:.10}, l_elbow:{x:.44,y:.10},
          r_wrist:{x:.53,y:.03}, l_wrist:{x:.47,y:.03},
          r_hip:{x:.55,y:.46}, l_hip:{x:.45,y:.46},
          r_knee:{x:.66,y:.52}, l_knee:{x:.45,y:.66},
          r_ankle:{x:.60,y:.42}, l_ankle:{x:.45,y:.87},
        },
        poseBottom: {
          head:{x:.50,y:.08}, neck:{x:.50,y:.15},
          r_shoulder:{x:.60,y:.21}, l_shoulder:{x:.40,y:.21},
          r_elbow:{x:.57,y:.12}, l_elbow:{x:.43,y:.12},
          r_wrist:{x:.54,y:.05}, l_wrist:{x:.46,y:.05},
          r_hip:{x:.55,y:.47}, l_hip:{x:.45,y:.47},
          r_knee:{x:.64,y:.54}, l_knee:{x:.45,y:.67},
          r_ankle:{x:.58,y:.44}, l_ankle:{x:.45,y:.88},
        },
        score: 79,
        jointIssues: {
          head:"good", neck:"good",
          r_shoulder:"good", l_shoulder:"good",
          r_elbow:"good", l_elbow:"good",
          r_wrist:"good", l_wrist:"good",
          r_hip:"warning", l_hip:"good",
          r_knee:"good", l_knee:"good",
          r_ankle:"good", l_ankle:"warning",
        },
        bodyParts: [
          { name:"Cân bằng 1 chân", score:72, severity:"warning",
            feedback:"Hơi lắc khi giữ tư thế. Tập trung nhìn 1 điểm cố định (drishti) phía trước." },
          { name:"Hông cân bằng", score:75, severity:"warning",
            feedback:"Hông bên chân nâng hơi nhô lên. Giữ hai bên hông ngang bằng nhau." },
          { name:"Hai tay Namaste", score:92, severity:"good",
            feedback:"Tay ở vị trí trên đầu ổn định, cánh tay thẳng – rất tốt." },
          { name:"Chân nâng", score:80, severity:"good",
            feedback:"Bàn chân nâng ép vào đùi trong ở vị trí tốt, không đặt lên đầu gối." },
        ],
        recommendations: [
          "Tập nhìn 1 điểm cố định (drishti) trên tường khi giữ tư thế Tree Pose",
          "Bắt đầu với bàn chân nâng ở bắp chân, tăng dần lên đùi trong khi cân bằng tốt hơn",
          "Tập core: plank 30s + side plank 15s mỗi bên để cải thiện cân bằng",
          "Nhắm mắt giữ Tree Pose 10s để thử thách cân bằng nâng cao",
        ],
        metrics: [
          {label:"Cân bằng", value:"72", unit:"%", status:"warning"},
          {label:"Hông", value:"Lệch", unit:"", status:"warning"},
          {label:"Namaste", value:"Tốt", unit:"", status:"good"},
          {label:"Chân nâng", value:"Đúng", unit:"", status:"good"},
        ],
      },
    },
  },
};

// ─── Build history from all sports ────────────────────────────────────────────
const HISTORY_ITEMS = [
  { sport: "badminton", technique: "smash", score: 76, date: "Hôm nay, 09:15", improvement: null as number | null },
  { sport: "badminton", technique: "dropshot", score: 84, date: "03/03, 14:00", improvement: 3 },
  { sport: "tennis", technique: "serve", score: 79, date: "01/03, 08:30", improvement: 5 },
  { sport: "gym", technique: "squat", score: 78, date: "28/02, 16:00", improvement: null },
  { sport: "boxing", technique: "jab", score: 82, date: "25/02, 10:00", improvement: 4 },
];

const ANALYZE_STEPS = [
  { progress: 8,  msg: "🎬 Đang giải mã video và trích xuất frame..." },
  { progress: 22, msg: "👤 Phát hiện và phân đoạn cơ thể người..." },
  { progress: 38, msg: "🦴 Định vị 14 keypoints khung xương..." },
  { progress: 55, msg: "📐 Tính toán góc khớp & vector cơ thể..." },
  { progress: 70, msg: "🧠 Phân tích kỹ thuật với mô hình AI chuyên môn..." },
  { progress: 83, msg: "📊 So sánh với 50.000+ rep chuẩn trong DB..." },
  { progress: 94, msg: "✍️ Tổng hợp báo cáo & đề xuất cá nhân hoá..." },
  { progress: 100, msg: "✅ Phân tích hoàn tất!" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const r: Pose = {};
  for (const k of Object.keys(a)) {
    r[k] = { x: lerp(a[k].x, b[k]?.x ?? a[k].x, t), y: lerp(a[k].y, b[k]?.y ?? a[k].y, t) };
  }
  return r;
}
function rRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

// ─── Skeleton Canvas ──────────────────────────────────────────────────────────
function SkeletonCanvas({
  technique, phase, progress, playing = true,
}: {
  technique: TechniqueData; phase: "analyzing" | "results"; progress: number; playing?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (ts: number) => {
      const speed = phase === "analyzing" ? 1.1 : 0.55;
      const t = (Math.sin(ts * 0.001 * speed) + 1) / 2;
      const pose = lerpPose(technique.poseTop, technique.poseBottom, playing ? t : 0.6);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, CH);
      bg.addColorStop(0, "#060d1f"); bg.addColorStop(1, "#0d1530");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);

      // Grid
      ctx.strokeStyle = "rgba(99,102,241,0.07)"; ctx.lineWidth = 1;
      for (let x = 0; x < CW; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CH); ctx.stroke(); }
      for (let y = 0; y < CH; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CW,y); ctx.stroke(); }

      // Floor line
      ctx.strokeStyle = "rgba(99,102,241,0.2)"; ctx.lineWidth = 1.5;
      ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(0, CH*0.935); ctx.lineTo(CW, CH*0.935); ctx.stroke();
      ctx.setLineDash([]);

      // Scan line (analyzing)
      if (phase === "analyzing") {
        const sy = (ts * 0.12) % (CH + 40) - 20;
        const sg = ctx.createLinearGradient(0, sy-18, 0, sy+18);
        sg.addColorStop(0,"transparent"); sg.addColorStop(.5,"rgba(139,92,246,.28)"); sg.addColorStop(1,"transparent");
        ctx.fillStyle = sg; ctx.fillRect(0, sy-18, CW, 36);
        ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(CW,sy);
        ctx.strokeStyle = "rgba(139,92,246,.6)"; ctx.lineWidth = 1.5; ctx.stroke();
      }

      const visCount = phase === "analyzing"
        ? Math.floor((progress / 100) * JOINT_NAMES.length * 1.3)
        : JOINT_NAMES.length;

      const getColor = (j: string): string => {
        const idx = JOINT_NAMES.indexOf(j);
        if (phase === "analyzing") {
          if (idx > visCount) return "";
          if (progress < 55) return "#e0e7ff";
          const frac = (progress - 55) / 45;
          if (frac < idx / JOINT_NAMES.length) return "#e0e7ff";
        }
        return SEV_COLOR[technique.jointIssues[j] ?? "good"];
      };

      // Bones
      ctx.lineCap = "round";
      BONES.forEach(([a, b]) => {
        const p1 = pose[a]; const p2 = pose[b];
        if (!p1 || !p2) return;
        const c1 = getColor(a); const c2 = getColor(b);
        if (!c1 || !c2) return;
        const x1 = p1.x*CW, y1 = p1.y*CH, x2 = p2.x*CW, y2 = p2.y*CH;
        const g = ctx.createLinearGradient(x1,y1,x2,y2);
        g.addColorStop(0, c1+"bb"); g.addColorStop(1, c2+"bb");
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.stroke();
      });

      // Joints
      JOINT_NAMES.forEach(name => {
        const pos = pose[name]; if (!pos) return;
        const color = getColor(name); if (!color) return;
        const x = pos.x*CW, y = pos.y*CH;
        const sev = technique.jointIssues[name] ?? "good";
        let r = 4.5;
        if (phase === "results" && sev !== "good")
          r = 4.5 + Math.sin(ts * 0.005) * 1.8;

        ctx.beginPath(); ctx.arc(x, y, r+7, 0, Math.PI*2);
        ctx.fillStyle = color + "18"; ctx.fill();

        if (phase === "results" && sev !== "good") {
          ctx.beginPath(); ctx.arc(x, y, r+3, 0, Math.PI*2);
          ctx.strokeStyle = color + "55"; ctx.lineWidth = 1.5; ctx.stroke();
        }

        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;

        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI*2);
        ctx.fillStyle = "#fff"; ctx.fill();
      });

      // Corner HUD
      ctx.font = "bold 9px monospace";
      if (phase === "analyzing") {
        ctx.fillStyle = "rgba(139,92,246,.9)";
        ctx.fillText(`${Math.min(visCount, 14)}/14 KP`, 8, CH-8);
        ctx.fillStyle = "rgba(255,255,255,.4)";
        ctx.fillText(`SCAN ${Math.floor(progress)}%`, CW-55, CH-8);
        for (let i = 0; i < 5; i++) {
          const on = i < Math.floor(progress / 20);
          ctx.beginPath(); ctx.arc(8 + i*10, CH-22, 3, 0, Math.PI*2);
          ctx.fillStyle = on ? "#8b5cf6" : "#1e293b"; ctx.fill();
        }
      } else {
        ctx.fillStyle = "rgba(255,255,255,.7)";
        ctx.fillText(technique.name.toUpperCase(), 8, 18);
        const sc = technique.score;
        const sc_color = sc >= 85 ? "#10b981" : sc >= 70 ? "#f59e0b" : "#ef4444";
        rRect(ctx, CW-46, 6, 40, 18, 9);
        ctx.fillStyle = sc_color+"28"; ctx.fill();
        ctx.strokeStyle = sc_color+"70"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = sc_color; ctx.textAlign = "center";
        ctx.fillText(`${sc}pt`, CW-26, 18.5); ctx.textAlign = "left";
        const legends: [string, Severity][] = [["✓ Tốt","good"],["⚠ Cảnh báo","warning"]];
        legends.forEach(([label, sev], i) => {
          ctx.fillStyle = SEV_COLOR[sev]; ctx.fillText(label, 8, CH - 8 - i*14);
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [technique, phase, progress, playing]);

  return <canvas ref={canvasRef} width={CW} height={CH} className="w-full rounded-2xl" style={{ maxWidth: CW }} />;
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SevBadge({ sev }: { sev: Severity }) {
  const cfg = {
    good:    { cls: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: CheckCircle2, label: "Tốt" },
    warning: { cls: "bg-amber-100 text-amber-600 border-amber-200",       icon: AlertTriangle, label: "Cảnh báo" },
    error:   { cls: "bg-red-100 text-red-500 border-red-200",             icon: XCircle, label: "Lỗi" },
  }[sev];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${cfg.cls}`} style={{ fontSize: "0.68rem", fontWeight: 700 }}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontWeight: 900, fontSize: "1.7rem", lineHeight: 1, color }}>
          {score}
        </span>
        <span style={{ fontSize: "0.65rem", fontWeight: 600 }} className="text-gray-400">/100</span>
      </div>
    </div>
  );
}

// ─── Main AIAnalysis ──────────────────────────────────────────────────────────
interface Props { onNavigate?: (v: string) => void; }

export function AIAnalysis({ onNavigate }: Props) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedSport, setSelectedSport] = useState("badminton");
  const [selectedTechnique, setSelectedTechnique] = useState("smash");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [stepMsg, setStepMsg] = useState(ANALYZE_STEPS[0].msg);
  const [playing, setPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "detail" | "tips">("overview");
  const [selectedHistory, setSelectedHistory] = useState<typeof HISTORY_ITEMS[0] | null>(null);
  const [show360, setShow360] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const AI_USED = 2; const AI_TOTAL = 3;

  const sport = SPORTS[selectedSport];
  const techniques = sport.techniques;
  const firstTechKey = Object.keys(techniques)[0];

  // Ensure selectedTechnique is valid for current sport
  const techKey = techniques[selectedTechnique] ? selectedTechnique : firstTechKey;
  const currentTechnique = selectedHistory
    ? SPORTS[selectedHistory.sport]?.techniques[selectedHistory.technique] ?? techniques[techKey]
    : techniques[techKey];

  const runAnalysis = useCallback(() => {
    setPhase("analyzing");
    setProgress(0);
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx >= ANALYZE_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("results"), 600);
        return;
      }
      const s = ANALYZE_STEPS[stepIdx];
      setProgress(s.progress);
      setStepMsg(s.msg);
    }, 480);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    setFileName(file.name);
  };

  const handleSportChange = (sportKey: string) => {
    setSelectedSport(sportKey);
    const firstTech = Object.keys(SPORTS[sportKey].techniques)[0];
    setSelectedTechnique(firstTech);
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ── HEADER BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-purple-200">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute right-20 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 p-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="mb-0.5">AI Phân tích kỹ thuật thể thao 🤖</div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }} className="text-purple-100">
              Chọn môn thể thao → Chọn kỹ thuật → Upload video → AI phân tích chuyên sâu theo từng môn
            </p>
          </div>
          {/* Usage */}
          <div className="hidden sm:block shrink-0 text-right">
            <div style={{ fontSize: "0.72rem" }} className="text-purple-200 mb-1">Lần dùng tháng này</div>
            <div className="flex items-center gap-1.5 justify-end">
              {[...Array(AI_TOTAL)].map((_, i) => (
                <div key={`usage-${i}`} className={`w-7 h-2 rounded-full ${i < AI_USED ? "bg-white" : "bg-white/25"}`} />
              ))}
            </div>
            <div style={{ fontSize: "0.72rem" }} className="text-purple-200 mt-1">
              {AI_USED}/{AI_TOTAL} · <span className="text-white font-semibold">Nâng cấp Pro →</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Canvas + Upload ────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Canvas */}
          {phase !== "upload" && (
            <div className="relative">
              <SkeletonCanvas
                technique={currentTechnique}
                phase={phase === "analyzing" ? "analyzing" : "results"}
                progress={progress}
                playing={playing}
              />
              {phase === "results" && (
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              {phase === "results" && (
                <button
                  onClick={() => { setPhase("upload"); setFileName(""); setSelectedHistory(null); }}
                  className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Upload phase */}
          {phase === "upload" && (
            <div className="space-y-4">
              {/* Sport picker */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-2">🏅 Chọn môn thể thao</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(SPORTS).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => handleSportChange(key)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all ${selectedSport === key ? "border-violet-500 bg-violet-50 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <span style={{ fontSize: "1.3rem" }}>{s.emoji}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: selectedSport === key ? 700 : 500 }} className={selectedSport === key ? "text-violet-600" : "text-gray-600"}>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Technique picker */}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-2">🎯 Chọn kỹ thuật phân tích</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(techniques).map(([key, tech]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTechnique(key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${techKey === key ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{tech.emoji}</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: techKey === key ? 700 : 500 }} className={techKey === key ? "text-violet-600" : "text-gray-700"}>{tech.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragOver ? "border-violet-500 bg-violet-50" : fileName ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/30 bg-gray-50"}`}
              >
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {fileName ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-emerald-600 mb-0.5">Sẵn sàng phân tích!</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-gray-500 truncate px-4">{fileName}</div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                      <FileVideo className="w-6 h-6 text-violet-500" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-700 mb-1">Kéo thả video vào đây</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-gray-400">hoặc click để chọn file</div>
                    <div style={{ fontSize: "0.68rem" }} className="text-gray-300 mt-2">MP4, MOV, AVI · Tối đa 500MB</div>
                  </>
                )}
              </div>

              {/* Tips - sport specific */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <div style={{ fontWeight: 700, fontSize: "0.8rem" }} className="text-blue-700 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Mẹo quay video {sport.name}
                </div>
                {(selectedSport === "badminton" ? [
                  "Quay từ phía sau hoặc bên hông sân",
                  "Bắt toàn bộ chuyển động từ chuẩn bị → đánh → recovery",
                  "Đảm bảo ánh sáng sân đủ rõ",
                  "Quay 3–5 quả liên tiếp cùng kỹ thuật",
                ] : selectedSport === "tennis" ? [
                  "Quay từ phía sau baseline hoặc bên hông",
                  "Bắt cả pha chuẩn bị và follow-through",
                  "Quay cả phần chân di chuyển",
                  "Tốt nhất là quay slow-motion 120fps",
                ] : selectedSport === "boxing" ? [
                  "Quay từ phía trước và bên hông",
                  "Bắt cả pha guard và retract",
                  "Nền tối giúp AI nhận diện tốt hơn",
                  "Quay 5–10 combo liên tiếp",
                ] : selectedSport === "football" ? [
                  "Quay từ phía bên khi sút bóng",
                  "Bắt cả pha chạy đà và follow-through",
                  "Quay nhiều góc nếu có thể",
                  "Tốt nhất ở sân có nền cỏ rõ ràng",
                ] : selectedSport === "yoga" ? [
                  "Quay từ phía trước và bên hông",
                  "Giữ tư thế ít nhất 10 giây khi quay",
                  "Mặc đồ ôm sát để AI nhận diện khớp",
                  "Nền đơn giản, ánh sáng đều",
                ] : [
                  "Quay góc 45° từ bên hông",
                  "Đủ ánh sáng, nền tương phản tốt",
                  "Quay 2–5 rep đầy đủ",
                  "Không bị che khuất khi quay",
                ]).map(tip => (
                  <div key={tip} className="flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                    <span style={{ fontSize: "0.75rem" }} className="text-blue-600">{tip}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={runAnalysis}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2.5"
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                <Brain className="w-4.5 h-4.5" />
                {fileName ? `Phân tích ${currentTechnique.name} ngay →` : "Demo thử (không cần video)"}
              </button>
            </div>
          )}

          {/* Analyzing progress */}
          {phase === "analyzing" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-800">Đang phân tích {currentTechnique.name}...</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ fontSize: "0.78rem", lineHeight: 1.6 }} className="text-gray-500">{stepMsg}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Frame", value: `${Math.floor(progress * 1.2)}`, unit: "/120" },
                  { label: "Keypoints", value: `${Math.min(Math.floor(progress * 0.15), 14)}`, unit: "/14" },
                  { label: "Confidence", value: `${Math.min(87 + Math.floor(progress * 0.1), 96)}`, unit: "%" },
                  { label: "FPS", value: "30", unit: " fps" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-3 py-2">
                    <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{label}</div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-violet-600">{value}<span style={{ fontWeight: 400, fontSize: "0.72rem" }} className="text-gray-400">{unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Lịch sử phân tích
            </div>
            <div className="space-y-2">
              {HISTORY_ITEMS.map((item, i) => {
                const hSport = SPORTS[item.sport];
                const hTech = hSport?.techniques[item.technique];
                const sc = item.score;
                const c = sc >= 85 ? "text-emerald-500" : sc >= 70 ? "text-amber-500" : "text-red-500";
                return (
                  <button
                    key={`hist-${i}`}
                    onClick={() => { setSelectedHistory(item); setSelectedSport(item.sport); setSelectedTechnique(item.technique); if (phase !== "results") setPhase("results"); }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base shrink-0">{hTech?.emoji ?? hSport?.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-800 truncate">{hTech?.name ?? "Unknown"}</div>
                      <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{hSport?.emoji} {hSport?.name} · {item.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className={c}>{sc}</div>
                      {item.improvement && (
                        <div style={{ fontSize: "0.65rem", fontWeight: 600 }} className="text-emerald-500">+{item.improvement}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Results ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Results phase */}
          {phase === "results" && (
            <>
              {/* Sport + technique tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${sport.bg} border border-gray-200`}>
                  <span style={{ fontSize: "0.95rem" }}>{sport.emoji}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className={sport.color}>{sport.name}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200">
                  <span style={{ fontSize: "0.95rem" }}>{currentTechnique.emoji}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-violet-600">{currentTechnique.name}</span>
                </span>
              </div>

              {/* Score + header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-5">
                  <ScoreRing score={currentTechnique.score} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: "1.4rem" }}>{currentTechnique.emoji}</span>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">{currentTechnique.name}</span>
                      <SevBadge sev={currentTechnique.score >= 85 ? "good" : currentTechnique.score >= 70 ? "warning" : "error"} />
                    </div>
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.65 }} className="text-gray-500">
                      {currentTechnique.score >= 85
                        ? `Kỹ thuật ${currentTechnique.name} tốt! Còn vài điểm nhỏ cần chú ý để hoàn hảo.`
                        : currentTechnique.score >= 70
                        ? `Kỹ thuật ${currentTechnique.name} khá tốt nhưng có vấn đề cần sửa.`
                        : `Cần cải thiện kỹ thuật ${currentTechnique.name} đáng kể. Đọc kỹ đề xuất bên dưới.`}
                    </p>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {currentTechnique.metrics.slice(0, 3).map(m => (
                        <div key={m.label} className="bg-gray-50 rounded-xl px-3 py-2">
                          <div style={{ fontSize: "0.65rem" }} className="text-gray-400">{m.label}</div>
                          <div style={{ fontWeight: 800, fontSize: "0.92rem" }} className={m.status === "good" ? "text-emerald-500" : m.status === "warning" ? "text-amber-500" : "text-red-500"}>
                            {m.value}{m.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-gray-100 p-1 rounded-2xl flex gap-1">
                {([["overview", BarChart2, "Tổng quan"], ["detail", Target, "Chi tiết khớp"], ["tips", Lightbulb, "Đề xuất AI"]] as const).map(([v, Icon, label]) => (
                  <button key={v} onClick={() => setActiveTab(v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${activeTab === v ? "bg-white shadow text-violet-600" : "text-gray-500 hover:text-gray-700"}`}
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  {currentTechnique.bodyParts.map(part => (
                    <div key={part.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">{part.name}</span>
                          <SevBadge sev={part.severity} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "1rem" }}
                          className={part.severity === "good" ? "text-emerald-500" : part.severity === "warning" ? "text-amber-500" : "text-red-500"}>
                          {part.score}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 mb-2.5">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${part.score}%`,
                            backgroundColor: part.severity === "good" ? "#10b981" : part.severity === "warning" ? "#f59e0b" : "#ef4444"
                          }} />
                      </div>
                      {part.angleActual !== undefined && (
                        <div className="flex gap-3 mb-2">
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                            <div style={{ fontSize: "0.65rem" }} className="text-gray-400">Thực tế</div>
                            <div style={{ fontWeight: 800, fontSize: "1rem" }} className={part.severity === "good" ? "text-emerald-500" : "text-amber-500"}>
                              {part.angleActual}°
                            </div>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          <div className="flex-1 bg-emerald-50 rounded-xl px-3 py-2 text-center">
                            <div style={{ fontSize: "0.65rem" }} className="text-emerald-500">Lý tưởng</div>
                            <div style={{ fontWeight: 800, fontSize: "1rem" }} className="text-emerald-600">
                              {part.angleIdeal}°
                            </div>
                          </div>
                        </div>
                      )}
                      <p style={{ fontSize: "0.8rem", lineHeight: 1.65 }} className="text-gray-600">{part.feedback}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Detail joints */}
              {activeTab === "detail" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Phân tích từng khớp</div>
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400">14 keypoints · {currentTechnique.score}% confidence</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {(["Đầu & Cổ", "Vai phải", "Vai trái", "Cùi chỏ phải", "Cùi chỏ trái", "Cổ tay phải", "Cổ tay trái",
                       "Hông phải", "Hông trái", "Đầu gối phải", "Đầu gối trái", "Cổ chân phải", "Cổ chân trái"] as const
                    ).map((jointLabel, i) => {
                      const jointKey = ["neck","r_shoulder","l_shoulder","r_elbow","l_elbow","r_wrist","l_wrist","r_hip","l_hip","r_knee","l_knee","r_ankle","l_ankle"][i];
                      const sev: Severity = currentTechnique.jointIssues[jointKey] ?? "good";
                      const conf = sev === "good" ? 92 + (i % 5) : sev === "warning" ? 78 + (i % 8) : 65;
                      return (
                        <div key={jointLabel} className="px-5 py-3 flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: SEV_COLOR[sev] }} />
                          <span style={{ fontSize: "0.85rem", fontWeight: 500 }} className="flex-1 text-gray-700">{jointLabel}</span>
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div className="h-full rounded-full" style={{ width: `${conf}%`, backgroundColor: SEV_COLOR[sev] }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, width: 36, textAlign: "right" }} className={sev === "good" ? "text-emerald-500" : sev === "warning" ? "text-amber-500" : "text-red-500"}>
                            {conf}%
                          </span>
                          <SevBadge sev={sev} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Key metrics */}
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                    <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-3">Chỉ số kỹ thuật {currentTechnique.name}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentTechnique.metrics.map(m => (
                        <div key={m.label} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: SEV_COLOR[m.status] + "18" }}>
                            {m.status === "good"
                              ? <CheckCircle2 className="w-4 h-4" style={{ color: SEV_COLOR[m.status] }} />
                              : <AlertTriangle className="w-4 h-4" style={{ color: SEV_COLOR[m.status] }} />}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem" }} className="text-gray-400">{m.label}</div>
                            <div style={{ fontWeight: 800, fontSize: "0.92rem" }} className={m.status === "good" ? "text-emerald-500" : m.status === "warning" ? "text-amber-500" : "text-red-500"}>
                              {m.value}{m.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Recommendations */}
              {activeTab === "tips" && (
                <div className="space-y-3">
                  {/* Priority fix */}
                  {currentTechnique.bodyParts.filter(p => p.severity !== "good").length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-amber-700">
                          Ưu tiên sửa ngay ({currentTechnique.bodyParts.filter(p => p.severity !== "good").length} vấn đề)
                        </span>
                      </div>
                      {currentTechnique.bodyParts.filter(p => p.severity !== "good").map(p => (
                        <div key={p.name} className="flex items-start gap-2.5 mb-2 last:mb-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div>
                            <span style={{ fontWeight: 700, fontSize: "0.82rem" }} className="text-amber-700">{p.name}: </span>
                            <span style={{ fontSize: "0.82rem" }} className="text-amber-600">{p.feedback}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {currentTechnique.recommendations.map((rec, i) => (
                    <div key={`rec-${i}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 text-violet-600" style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }} className="text-gray-700">{rec}</p>
                      </div>
                    </div>
                  ))}

                  {/* Find coach CTA */}
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-white mb-0.5">Muốn cải thiện {currentTechnique.name} nhanh hơn?</div>
                      <p style={{ fontSize: "0.75rem" }} className="text-purple-200">Đặt lịch với HLV {sport.name} chuyên nghiệp trên CoachFinder</p>
                    </div>
                    <button onClick={() => onNavigate?.("find")} className="shrink-0 px-3 py-2 bg-white text-violet-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                      Tìm HLV <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Re-analyze */}
                  <button onClick={() => { setPhase("upload"); setFileName(""); setSelectedHistory(null); }}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-violet-400 hover:text-violet-500 transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    <RefreshCw className="w-4 h-4" /> Phân tích kỹ thuật khác
                  </button>
                </div>
              )}
            </>
          )}

          {/* Upload phase: empty state */}
          {phase === "upload" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-violet-500" />
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-2">
                Phân tích kỹ thuật {sport.name} {sport.emoji}
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }} className="text-gray-500 max-w-sm mb-5">
                AI sẽ phân tích kỹ thuật <strong>{currentTechnique.name}</strong> của bạn: nhận diện khung xương, đánh giá từng yếu tố kỹ thuật chuyên môn và đề xuất cải thiện.
              </p>
              <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {[
                  { icon: "🦴", label: "Nhận diện khung xương" },
                  { icon: sport.emoji, label: `Phân tích ${sport.name}` },
                  { icon: "💡", label: "Đề xuất cá nhân" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div style={{ fontSize: "1.4rem" }} className="mb-1">{item.icon}</div>
                    <div style={{ fontSize: "0.65rem", lineHeight: 1.4 }} className="text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 360° VIDEO SECTION ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Collapsible header */}
        <button
          onClick={() => setShow360(v => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-200">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">
                Xem lại Video 360°
              </span>
              <span className="px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-600 rounded-full" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                NEW
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", lineHeight: 1.5 }} className="text-gray-500">
              Upload video 360° của bạn · Kéo xoay góc nhìn · Zoom · Điều khiển audio
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${show360 ? "rotate-180" : ""}`}
          />
        </button>

        {/* Player (expand/collapse) */}
        {show360 && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4">
            <Video360Player />
          </div>
        )}
      </div>

    </div>
  );
}
