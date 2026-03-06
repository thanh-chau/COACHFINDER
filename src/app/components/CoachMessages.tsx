import { useState, useRef, useEffect } from "react";
import {
  Search, Send, Paperclip, Smile, Video, Phone,
  MoreHorizontal, Check, CheckCheck,
  Image, FileText, Star, Pin,
  ChevronLeft, Info, X,
  Calendar, TrendingUp, Clock, Award, MessageSquare,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type MsgStatus  = "sent"|"delivered"|"read";
type ConvStatus = "online"|"offline"|"away";

interface Message {
  id: string; from: "coach"|"student"; text: string;
  time: string; status?: MsgStatus; type?: "text"|"file"|"video"|"system";
  fileName?: string; fileSize?: string;
}

interface Conversation {
  id: string; name: string; avatar: string; sport: string;
  status: ConvStatus; lastMsg: string; lastTime: string;
  unread: number; pinned?: boolean; messages: Message[];
  sessions: number; progress: number; nextSession?: string;
  joined: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const AVT = {
  a: "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  b: "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  c: "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
};

const INITIAL_CONVS: Conversation[] = [
  {
    id:"c1", name:"Nguyễn Minh Anh", avatar:AVT.a, sport:"Thể hình",
    status:"online", lastMsg:"Thầy ơi ngày mai tập có cần mang đồ gì không ạ?", lastTime:"08:42",
    unread:2, pinned:true, sessions:26, progress:87, nextSession:"Ngày mai 09:00", joined:"01/10/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi em mới xem video Squat rồi ạ, kỹ thuật này của thầy chi tiết quá!",time:"T2 08:00",status:"read"},
      {id:"m2",from:"coach",  text:"Tốt lắm! Em xem kỹ phần Low Bar vs High Bar nhé, quan trọng nhất là bar path thẳng.",time:"T2 08:15",status:"read"},
      {id:"m3",from:"student",text:"Vâng thầy, em đã nộp video tập squat lên rồi ạ, thầy xem giúp em với!",time:"T2 09:30",status:"read"},
      {id:"m4",from:"coach",  text:"Thầy xem rồi, form của em khá tốt! Chỉ cần chú ý độ sâu hơn một chút nữa. Thầy đã gửi nhận xét chi tiết trong Video Studio rồi nhé.",time:"T2 14:00",status:"read"},
      {id:"m5",from:"student",text:"Cảm ơn thầy nhiều ạ 🙏 Em sẽ cố gắng cải thiện!",time:"T2 14:05",status:"read"},
      {id:"m6",from:"coach",  text:"Cố lên! Em đang tiến bộ rất nhanh đó. Buổi tới mình tập Deadlift nhé.",time:"T2 14:10",status:"read"},
      {id:"m7",from:"student",text:"Thầy ơi ngày mai tập có cần mang đồ gì không ạ?",time:"08:40",status:"read"},
      {id:"m8",from:"student",text:"Thầy ơi ngày mai tập có cần mang đồ gì không ạ?",time:"08:42",status:"delivered"},
    ]
  },
  {
    id:"c2", name:"Trần Bảo Long", avatar:AVT.b, sport:"Thể hình",
    status:"online", lastMsg:"Video squat của em đã nộp rồi ạ thầy ơi", lastTime:"Hôm nay",
    unread:1, sessions:12, progress:68, nextSession:"Hôm nay 17:00", joined:"15/11/2025",
    messages:[
      {id:"m1",from:"coach",  text:"Bảo Long, hôm nay em tập Deadlift thế nào?",time:"T4 10:00",status:"read"},
      {id:"m2",from:"student",text:"Dạ em tập được 5 set thầy ơi, nhưng lưng hơi mỏi ạ.",time:"T4 10:30",status:"read"},
      {id:"m3",from:"coach",  text:"Lưng mỏi là do form chưa đúng. Em nhớ brace core trước khi kéo nhé. Thầy gửi video 360° Deadlift cho em xem lại.",time:"T4 11:00",status:"read"},
      {id:"m4",from:"student",text:"Dạ em đã xem rồi ạ, hiểu rõ hơn nhiều! Cảm ơn thầy",time:"T4 14:00",status:"read"},
      {id:"m5",from:"student",type:"file",text:"",fileName:"Bai_tap_tuan_3.pdf",fileSize:"1.2 MB",time:"T5 08:00",status:"read"},
      {id:"m6",from:"coach",  text:"OK thầy xem rồi. Bài tập tuần này ổn. Nhớ nghỉ ngơi đủ giấc ngủ nhé.",time:"T5 09:00",status:"read"},
      {id:"m7",from:"student",text:"Video squat của em đã nộp rồi ạ thầy ơi",time:"Hôm nay",status:"delivered"},
    ]
  },
  {
    id:"c3", name:"Võ Thị Hoa", avatar:AVT.a, sport:"Yoga",
    status:"away", lastMsg:"Cảm ơn thầy đã nhận xét bài Pilates! Em sẽ cố 🎉", lastTime:"Hôm qua",
    unread:0, sessions:22, progress:95, nextSession:"Hôm nay 14:00", joined:"01/09/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi em đã hoàn thành Pilates Mat Series rồi! Teaser pose đẹp chưa thầy?",time:"T6 09:00",status:"read"},
      {id:"m2",from:"coach",  text:"Xuất sắc! Teaser của em đẹp nhất trong lớp đó 🏆 Thầy đã chấm Đạt chuẩn rồi.",time:"T6 10:00",status:"read"},
      {id:"m3",from:"student",text:"Thật không thầy? Em vui lắm ạ 😊",time:"T6 10:05",status:"read"},
      {id:"m4",from:"coach",  text:"Thật đó! Em tiến bộ rất nhanh. 95 điểm AI — top 1 trong tất cả học viên của thầy!",time:"T6 10:10",status:"read"},
      {id:"m5",from:"student",text:"Cảm ơn thầy đã nhận xét bài Pilates! Em sẽ cố 🎉",time:"Hôm qua",status:"read"},
    ]
  },
  {
    id:"c4", name:"Phạm Đức Hải", avatar:AVT.a, sport:"Boxing",
    status:"offline", lastMsg:"Thầy ơi em bị đau vai hôm nay, buổi tập có thể đổi giờ không ạ?", lastTime:"10:15",
    unread:3, sessions:8, progress:62, joined:"01/12/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi hôm qua em tập combo 4 đòn nhưng footwork vẫn chưa tốt lắm ạ.",time:"T3 09:00",status:"read"},
      {id:"m2",from:"coach",  text:"Thầy thấy rồi, guard sau combo 4 của em bị hạ xuống. Quan trọng là reset guard ngay sau mỗi đòn. Xem lại timestamp 1:02 trong video nhé.",time:"T3 10:00",status:"read"},
      {id:"m3",from:"student",text:"Dạ em xem rồi ạ! Hiểu rồi, em sẽ luyện thêm",time:"T3 11:00",status:"read"},
      {id:"m4",from:"student",text:"Thầy ơi em bị đau vai hôm nay",time:"10:13",status:"read"},
      {id:"m5",from:"student",text:"Buổi tập có thể đổi giờ không ạ?",time:"10:14",status:"read"},
      {id:"m6",from:"student",text:"Thầy ơi em bị đau vai hôm nay, buổi tập có thể đổi giờ không ạ?",time:"10:15",status:"delivered"},
    ]
  },
  {
    id:"c5", name:"Lê Thúy Nga", avatar:AVT.c, sport:"Yoga",
    status:"online", lastMsg:"Thầy gửi thêm bài breathing cho em nhé ạ", lastTime:"09:20",
    unread:0, sessions:11, progress:91, nextSession:"T5 16:00", joined:"15/10/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi bài Pranayama của thầy hay quá! Em tập buổi sáng thấy tinh thần tốt hơn hẳn.",time:"T2 07:30",status:"read"},
      {id:"m2",from:"coach",  text:"Tốt quá! Nadi Shodhana buổi sáng rất tốt cho thần kinh. Em tập bao nhiêu vòng?",time:"T2 08:00",status:"read"},
      {id:"m3",from:"student",text:"Dạ em tập 10 vòng mỗi bên ạ",time:"T2 08:10",status:"read"},
      {id:"m4",from:"coach",  text:"Hoàn hảo! Tuần sau mình học Kapalabhati nhé, tốt cho detox phổi.",time:"T2 08:15",status:"read"},
      {id:"m5",from:"student",text:"Thầy gửi thêm bài breathing cho em nhé ạ",time:"09:20",status:"read"},
    ]
  },
  {
    id:"c6", name:"Đặng Quốc Tuấn", avatar:AVT.b, sport:"Cardio",
    status:"offline", lastMsg:"Ngày mai em thi 10km, chúc thầy ngủ ngon!", lastTime:"Hôm qua",
    unread:0, sessions:15, progress:79, joined:"01/08/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi form chạy Sprint của em cải thiện nhiều chưa ạ?",time:"T5 17:00",status:"read"},
      {id:"m2",from:"coach",  text:"Cải thiện rõ rệt! Gối nâng cao hơn, lean forward đúng góc. Chỉ cần mạnh ở giai đoạn drive hơn nữa thôi.",time:"T5 18:00",status:"read"},
      {id:"m3",from:"student",text:"Thầy ơi video nộp của em ở timestamp 0:38 thầy thấy thế nào ạ?",time:"T6 09:00",status:"read"},
      {id:"m4",from:"coach",  text:"Thầy thấy rồi, ghi chú 'Nâng gối chưa đủ cao' ở đó. Em xem feedback chi tiết nhé. Đang tiến bộ tốt lắm!",time:"T6 10:00",status:"read"},
      {id:"m5",from:"student",text:"Ngày mai em thi 10km, chúc thầy ngủ ngon!",time:"Hôm qua",status:"read"},
    ]
  },
  {
    id:"c7", name:"Bùi Văn Nam", avatar:AVT.b, sport:"Cardio",
    status:"away", lastMsg:"Thầy cho em hỏi về chế độ ăn sau tập HIIT ạ", lastTime:"11:45",
    unread:1, sessions:18, progress:73, joined:"01/07/2025",
    messages:[
      {id:"m1",from:"student",text:"Thầy ơi hôm nay em tập HIIT Jump Rope 20 phút, mệt lắm thầy ơi 😅",time:"T4 07:00",status:"read"},
      {id:"m2",from:"coach",  text:"Tốt lắm! Cảm giác mệt sau HIIT là bình thường. Em nghỉ 2 phút rồi thả lỏng nhé.",time:"T4 07:15",status:"read"},
      {id:"m3",from:"student",text:"Thầy cho em hỏi về chế độ ăn sau tập HIIT ạ",time:"11:45",status:"delivered"},
    ]
  },
];

const QUICK_REPLIES = [
  "OK thầy sẽ xem!","Buổi tới mình điều chỉnh nhé 💪","Form của em tốt lắm! 🎉",
  "Xem feedback trong Video Studio nhé","Nhớ nghỉ ngơi đủ giấc nhé","Cố lên! Đang tiến bộ rất tốt 🏆",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_DOT:Record<ConvStatus,string> = {
  online:"bg-emerald-400", offline:"bg-gray-300", away:"bg-amber-400"
};
const STATUS_LBL:Record<ConvStatus,string> = {
  online:"Đang online", offline:"Offline", away:"Vắng mặt"
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MsgBubble({ msg, isCoach }:{ msg:Message; isCoach:boolean }) {
  const mine = isCoach ? msg.from==="coach" : msg.from==="student";
  if (msg.type==="system") return (
    <div className="flex justify-center">
      <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full" style={{fontSize:"0.68rem"}}>{msg.text}</span>
    </div>
  );
  return (
    <div className={`flex items-end gap-2 ${mine?"flex-row-reverse":"flex-row"}`}>
      <div className={`max-w-xs lg:max-w-sm`}>
        {msg.type==="file" ? (
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl ${mine?"bg-blue-500 rounded-br-sm":"bg-white border border-gray-200 rounded-bl-sm"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mine?"bg-white/20":"bg-blue-50"}`}>
              <FileText className={`w-4 h-4 ${mine?"text-white":"text-blue-500"}`}/>
            </div>
            <div>
              <div style={{fontSize:"0.78rem",fontWeight:600}} className={mine?"text-white":"text-gray-800"}>{msg.fileName}</div>
              <div style={{fontSize:"0.65rem"}} className={mine?"text-blue-100":"text-gray-400"}>{msg.fileSize}</div>
            </div>
          </div>
        ) : (
          <div className={`px-3.5 py-2.5 rounded-2xl ${mine?"bg-blue-500 text-white rounded-br-sm":"bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm"}`}
            style={{fontSize:"0.85rem",lineHeight:1.6}}>
            {msg.text}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-1 ${mine?"justify-end":"justify-start"}`}>
          <span style={{fontSize:"0.62rem"}} className="text-gray-400">{msg.time}</span>
          {mine && msg.status && (
            msg.status==="read"
              ? <CheckCheck className="w-3 h-3 text-blue-400"/>
              : msg.status==="delivered"
              ? <CheckCheck className="w-3 h-3 text-gray-300"/>
              : <Check className="w-3 h-3 text-gray-300"/>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student Info Panel ────────────────────────────────────────────────────────
function InfoPanel({ conv, onClose }:{ conv:Conversation; onClose:()=>void }) {
  return (
    <div className="w-64 shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span style={{fontWeight:700,fontSize:"0.88rem"}} className="text-gray-900">Hồ sơ học viên</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4"/></button>
      </div>
      <div className="p-4 text-center border-b border-gray-100">
        <div className="relative inline-block mb-3">
          <img src={conv.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover"/>
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${STATUS_DOT[conv.status]}`}/>
        </div>
        <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900">{conv.name}</div>
        <div style={{fontSize:"0.75rem"}} className="text-gray-400 mt-0.5">{conv.sport} · Từ {conv.joined}</div>
        <div className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full ${conv.status==="online"?"bg-emerald-50 text-emerald-600":"bg-gray-100 text-gray-400"}`}
          style={{fontSize:"0.68rem",fontWeight:600}}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[conv.status]}`}/>{STATUS_LBL[conv.status]}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div style={{fontWeight:600,fontSize:"0.78rem"}} className="text-gray-500 uppercase tracking-wide">Thống kê</div>
        {[
          {icon:Calendar,  label:"Buổi đã tập",  value:conv.sessions+" buổi",   color:"text-blue-500"},
          {icon:TrendingUp,label:"Tiến độ AI",    value:conv.progress+"/100",    color:"text-emerald-500"},
        ].map(({icon:Icon,label,value,color})=>(
          <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${color}`}/>
              <span style={{fontSize:"0.78rem"}} className="text-gray-500">{label}</span>
            </div>
            <span style={{fontSize:"0.82rem",fontWeight:700}} className="text-gray-800">{value}</span>
          </div>
        ))}
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span style={{fontSize:"0.72rem"}} className="text-gray-400">Tiến độ</span>
            <span style={{fontSize:"0.72rem",fontWeight:700}} className={conv.progress>=80?"text-emerald-500":"text-blue-500"}>{conv.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className={`h-2 rounded-full transition-all ${conv.progress>=80?"bg-emerald-400":"bg-blue-400"}`} style={{width:`${conv.progress}%`}}/>
          </div>
        </div>
        {conv.nextSession&&(
          <div className="bg-blue-50 rounded-xl p-3">
            <div style={{fontSize:"0.7rem",fontWeight:600}} className="text-blue-500 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/>Buổi tập tiếp theo</div>
            <div style={{fontSize:"0.82rem",fontWeight:700}} className="text-blue-700">{conv.nextSession}</div>
          </div>
        )}
        <div className="space-y-1.5 pt-1">
          {[
            {icon:Video,    label:"Xem Video Studio",  color:"bg-blue-50 text-blue-600"},
            {icon:Calendar, label:"Xem lịch học",       color:"bg-purple-50 text-purple-600"},
            {icon:Award,    label:"Xem tiến độ",        color:"bg-emerald-50 text-emerald-600"},
          ].map(({icon:Icon,label,color})=>(
            <button key={label} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl ${color} transition-colors hover:opacity-80`} style={{fontSize:"0.78rem",fontWeight:600}}>
              <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function CoachMessages() {
  const [convs,setConvs]         = useState<Conversation[]>(INITIAL_CONVS);
  const [activeId,setActiveId]   = useState<string>("c1");
  const [text,setText]           = useState("");
  const [search,setSearch]       = useState("");
  const [showInfo,setShowInfo]   = useState(false);
  const [showMobile,setShowMobile] = useState<"list"|"chat">("list");
  const [filter,setFilter]       = useState<"all"|"unread"|"pinned">("all");
  const [showQuick,setShowQuick] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const active = convs.find(c=>c.id===activeId)!;

  const totalUnread = convs.reduce((s,c)=>s+c.unread,0);

  const filtered = convs.filter(c=>{
    const q = search.toLowerCase();
    if(q && !c.name.toLowerCase().includes(q) && !c.lastMsg.toLowerCase().includes(q)) return false;
    if(filter==="unread"  && c.unread===0) return false;
    if(filter==="pinned"  && !c.pinned)    return false;
    return true;
  });

  useEffect(()=>{
    msgEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[activeId, active?.messages.length]);

  const openConv = (id:string) => {
    setActiveId(id);
    setShowMobile("chat");
    setConvs(prev=>prev.map(c=>c.id===id?{...c,unread:0}:c));
  };

  const sendMsg = () => {
    const t = text.trim();
    if(!t) return;
    const newMsg:Message = {
      id:"m"+Date.now(), from:"coach", text:t,
      time:new Date().toLocaleTimeString("vi",{hour:"2-digit",minute:"2-digit"}),
      status:"sent", type:"text",
    };
    setConvs(prev=>prev.map(c=>
      c.id===activeId ? {...c, messages:[...c.messages,newMsg], lastMsg:t, lastTime:"Vừa xong"} : c
    ));
    setText("");
    setShowQuick(false);
  };

  return (
    <div className="flex flex-col" style={{height:"calc(100vh - 130px)"}}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
        <div>
          <h1 style={{fontWeight:800,fontSize:"1.2rem"}} className="text-gray-900">Tin nhắn</h1>
          <p style={{fontSize:"0.78rem"}} className="text-gray-400 mt-0.5">
            {totalUnread>0?<><span className="text-blue-600 font-bold">{totalUnread} tin chưa đọc</span> · </> : ""}{convs.length} cuộc trò chuyện
          </p>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 min-h-0 flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <div className={`flex flex-col border-r border-gray-100 shrink-0 ${showMobile==="chat"?"hidden lg:flex":"flex"}`} style={{width:288}}>
          {/* Search + Filter */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm học viên..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
                style={{fontSize:"0.82rem"}}/>
            </div>
            <div className="flex bg-gray-50 rounded-xl p-0.5 gap-0.5">
              {([["all","Tất cả"],["unread","Chưa đọc"],["pinned","Ghim"]] as [typeof filter,string][]).map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${filter===v?"bg-white text-gray-800 shadow-sm":"text-gray-400"}`}
                  style={{fontSize:"0.72rem",fontWeight:filter===v?700:400}}>
                  {l}{v==="unread"&&totalUnread>0&&<span className="ml-1 bg-blue-500 text-white rounded-full px-1" style={{fontSize:"0.58rem"}}>{totalUnread}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length===0&&(
              <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40"/>
                <span style={{fontSize:"0.8rem"}}>Không tìm thấy</span>
              </div>
            )}
            {filtered.map(c=>(
              <button key={c.id} onClick={()=>openConv(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${activeId===c.id?"bg-blue-50 border-blue-100":""}`}>
                <div className="relative shrink-0">
                  <img src={c.avatar} alt="" className="w-10 h-10 rounded-xl object-cover"/>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[c.status]}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {c.pinned&&<Pin className="w-2.5 h-2.5 text-blue-400 shrink-0"/>}
                      <span style={{fontWeight:c.unread>0?700:500,fontSize:"0.85rem"}} className="text-gray-900 truncate">{c.name}</span>
                    </div>
                    <span style={{fontSize:"0.62rem"}} className="text-gray-400 shrink-0">{c.lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span style={{fontSize:"0.75rem"}} className={`truncate ${c.unread>0?"text-gray-700 font-medium":"text-gray-400"}`}>{c.lastMsg}</span>
                    {c.unread>0&&<span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0" style={{fontSize:"0.58rem",fontWeight:700}}>{c.unread}</span>}
                  </div>
                  <span className="inline-flex items-center gap-1 mt-0.5" style={{fontSize:"0.62rem"}}>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">{c.sport}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CHAT AREA ─────────────────────────────────────── */}
        {active && (
          <div className={`flex-1 flex flex-col min-w-0 ${showMobile==="list"?"hidden lg:flex":"flex"}`}>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-white">
              <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" onClick={()=>setShowMobile("list")}>
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <div className="relative">
                <img src={active.avatar} alt="" className="w-9 h-9 rounded-xl object-cover"/>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[active.status]}`}/>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{fontWeight:700,fontSize:"0.9rem"}} className="text-gray-900">{active.name}</div>
                <div style={{fontSize:"0.68rem"}} className="text-gray-400 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[active.status]}`}/>
                  {STATUS_LBL[active.status]}
                  {active.nextSession&&<><span className="text-gray-200">·</span><Clock className="w-2.5 h-2.5"/>{active.nextSession}</>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Phone className="w-4 h-4"/></button>
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Video className="w-4 h-4"/></button>
                <button onClick={()=>setShowInfo(v=>!v)} className={`p-2 rounded-xl transition-colors ${showInfo?"bg-blue-50 text-blue-500":"hover:bg-gray-100 text-gray-400"}`}>
                  <Info className="w-4 h-4"/>
                </button>
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
              {active.messages.map(msg=>(
                <MsgBubble key={msg.id} msg={msg} isCoach={true}/>
              ))}
              <div ref={msgEndRef}/>
            </div>

            {/* Quick replies */}
            {showQuick&&(
              <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto">
                {QUICK_REPLIES.map(qr=>(
                  <button key={qr} onClick={()=>{setText(qr);setShowQuick(false);}}
                    className="shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap"
                    style={{fontSize:"0.75rem",fontWeight:500}}>{qr}</button>
                ))}
                <button onClick={()=>setShowQuick(false)} className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5"/></button>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 flex items-end gap-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <textarea
                    value={text} onChange={e=>setText(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                    placeholder={`Nhắn tin với ${active.name.split(" ").pop()}...`}
                    rows={1} className="flex-1 bg-transparent text-gray-800 resize-none focus:outline-none"
                    style={{fontSize:"0.88rem",lineHeight:1.5,maxHeight:96}}/>
                  <div className="flex items-center gap-1 pb-0.5 shrink-0">
                    <button onClick={()=>setShowQuick(v=>!v)} className={`p-1.5 rounded-lg transition-colors ${showQuick?"text-blue-500 bg-blue-50":"text-gray-400 hover:text-gray-600 hover:bg-gray-200"}`}>
                      <Zap className="w-4 h-4"/>
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"><Smile className="w-4 h-4"/></button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"><Paperclip className="w-4 h-4"/></button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"><Image className="w-4 h-4"/></button>
                  </div>
                </div>
                <button onClick={sendMsg} disabled={!text.trim()}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${text.trim()?"bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-200 text-white":"bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
                  <Send className="w-4 h-4"/>
                </button>
              </div>
              <div style={{fontSize:"0.62rem"}} className="text-gray-400 mt-1.5 px-1 flex items-center gap-2">
                <span>Enter để gửi · Shift+Enter xuống dòng</span>
                <button onClick={()=>setShowQuick(v=>!v)} className="flex items-center gap-1 text-blue-400 hover:text-blue-600 transition-colors">
                  <Zap className="w-2.5 h-2.5"/>Trả lời nhanh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── INFO PANEL ──────────────────────────────────── */}
        {active && showInfo && (
          <div className="hidden lg:block">
            <InfoPanel conv={active} onClose={()=>setShowInfo(false)}/>
          </div>
        )}
      </div>
    </div>
  );
}
