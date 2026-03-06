import { useState, useRef, useEffect } from "react";
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip, Smile,
  Image, Lock, Crown, ChevronRight, Check, CheckCheck, Circle,
  Star, Dumbbell, Clock, ArrowLeft, Info, X
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  senderId: "learner" | "coach";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type?: "text" | "image" | "file" | "system";
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  coach: {
    name: string;
    sport: string;
    avatar: string;
    online: boolean;
    rating: number;
    sessions: number;
  };
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
  subscribed: boolean; // learner has active plan with this coach
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const COACH_AVT_1 = "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const COACH_AVT_2 = "https://images.unsplash.com/photo-1679076875671-a30b4dbc6016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const COACH_AVT_3 = "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const LEARNER_AVT = "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    coach: {
      name: "Trần Văn Đức",
      sport: "Thể hình 💪",
      avatar: COACH_AVT_1,
      online: true,
      rating: 4.9,
      sessions: 18,
    },
    lastMessage: "Tốt lắm! Nhớ tập warm-up 10 phút nhé em 🔥",
    lastTime: "09:42",
    unread: 2,
    subscribed: true,
    messages: [
      { id: "m1", senderId: "coach", text: "Chào em Minh Anh! Buổi tập hôm qua cảm thấy thế nào?", time: "08:20", status: "read" },
      { id: "m2", senderId: "learner", text: "Dạ chào anh! Em tập xong khá mệt nhưng cảm giác rất tốt ạ 😄", time: "08:35", status: "read" },
      { id: "m3", senderId: "coach", text: "Haha tốt lắm! Đau cơ là dấu hiệu cơ đang phát triển đó. Em có nhớ uống đủ nước và ăn protein sau tập không?", time: "08:38", status: "read" },
      { id: "m4", senderId: "learner", text: "Dạ em có uống 2 lít nước rồi ạ, nhưng em chưa ăn protein supplement ạ", time: "08:45", status: "read" },
      { id: "m5", senderId: "coach", text: "Thì tốt rồi. Anh sẽ gửi cho em thực đơn protein tự nhiên, không cần phải dùng supplement đâu.\n\nTuần này mình tập theo plan mới nhé, anh đã update lịch cho em rồi. Em xem trong mục Lịch tập 📅", time: "08:50", status: "read" },
      { id: "m6", senderId: "learner", text: "Vâng ạ! Anh ơi em muốn hỏi về bài Deadlift, em hay bị đau lưng ạ 😥", time: "09:15", status: "read" },
      { id: "m7", senderId: "coach", text: "Uh, em cần chú ý form nhiều hơn. Anh sẽ upload video hướng dẫn Deadlift đúng form trong thư viện video nhé, em xem kỹ trước buổi tập tới.", time: "09:30", status: "read" },
      { id: "m8", senderId: "coach", text: "Tốt lắm! Nhớ tập warm-up 10 phút nhé em 🔥", time: "09:42", status: "read" },
    ],
  },
  {
    id: "c2",
    coach: {
      name: "Lê Thị Mai",
      sport: "Yoga 🧘",
      avatar: COACH_AVT_2,
      online: true,
      rating: 4.8,
      sessions: 6,
    },
    lastMessage: "Buổi mai 8h em nhớ mang thảm nhé!",
    lastTime: "Hôm qua",
    unread: 0,
    subscribed: true,
    messages: [
      { id: "m1", senderId: "coach", text: "Xin chào Minh Anh! Chị là HLV Yoga của em từ nay nhé 🌸", time: "Thứ 2", status: "read" },
      { id: "m2", senderId: "learner", text: "Dạ chào chị Mai! Em rất vui được học cùng chị ạ", time: "Thứ 2", status: "read" },
      { id: "m3", senderId: "coach", text: "Chị sẽ bắt đầu bằng các bài Yoga cơ bản nhé. Em đã có kinh nghiệm Yoga chưa?", time: "Thứ 2", status: "read" },
      { id: "m4", senderId: "learner", text: "Em mới học ạ, chỉ thỉnh thoảng tập YouTube thôi ạ", time: "Thứ 2", status: "read" },
      { id: "m5", senderId: "coach", text: "Oke không sao. Chị sẽ hướng dẫn em từ đầu nhé. Buổi đầu mình làm quen nhau, nhẹ nhàng thôi 😊", time: "Thứ 3", status: "read" },
      { id: "m6", senderId: "learner", text: "Dạ em cảm ơn chị nhiều ạ! Em nên chuẩn bị gì không ạ?", time: "Thứ 3", status: "read" },
      { id: "m7", senderId: "coach", text: "Em cần thảm Yoga (nếu chưa có chị có thể cho mượn), quần áo thoải mái, và bụng đói nhé - không ăn trước 2 tiếng 🌿", time: "Thứ 4", status: "read" },
      { id: "m8", senderId: "coach", text: "Buổi mai 8h em nhớ mang thảm nhé!", time: "Hôm qua", status: "read" },
    ],
  },
  {
    id: "c3",
    coach: {
      name: "Nguyễn Hoàng",
      sport: "Tennis 🎾",
      avatar: COACH_AVT_3,
      online: false,
      rating: 4.7,
      sessions: 0,
    },
    lastMessage: "Chào em! Anh thấy em quan tâm đến Tennis...",
    lastTime: "T2",
    unread: 1,
    subscribed: false,
    messages: [
      { id: "m1", senderId: "coach", text: "Chào em! Anh thấy em quan tâm đến Tennis. Em muốn tìm hiểu thêm về gói tập cùng anh không?", time: "T2", status: "delivered" },
    ],
  },
];

const QUICK_REPLIES = [
  "Dạ vâng ạ! 👍",
  "Em hiểu rồi ạ",
  "Cảm ơn anh/chị!",
  "Khi nào thuận tiện?",
  "Em sẽ cố gắng 💪",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && (
        <div className="w-1 shrink-0" /> // spacer to align without avatar repetition
      )}
      <div className={`max-w-[72%] group`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isMe
              ? "bg-orange-500 text-white rounded-br-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
          }`}
          style={{ fontSize: "0.88rem", lineHeight: 1.55 }}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{msg.time}</span>
          {isMe && (
            msg.status === "read"
              ? <CheckCheck className="w-3 h-3 text-blue-400" />
              : msg.status === "delivered"
              ? <CheckCheck className="w-3 h-3 text-gray-400" />
              : <Check className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

function CoachInfoPanel({ conv, onClose }: { conv: Conversation; onClose: () => void }) {
  return (
    <div className="w-72 bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Thông tin HLV</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 flex flex-col items-center text-center border-b border-gray-100">
        <div className="relative mb-3">
          <img src={conv.coach.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          {conv.coach.online && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">{conv.coach.name}</div>
        <div style={{ fontSize: "0.8rem" }} className="text-gray-500 mt-0.5">{conv.coach.sport}</div>
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700">{conv.coach.rating}</span>
          <span style={{ fontSize: "0.75rem" }} className="text-gray-400">/ 5.0</span>
        </div>
      </div>
      <div className="p-4 space-y-3 border-b border-gray-100">
        {[
          { icon: Dumbbell, label: "Buổi đã tập cùng", value: `${conv.coach.sessions} buổi` },
          { icon: Clock, label: "Trạng thái", value: conv.coach.online ? "Đang online" : "Offline" },
          { icon: Star, label: "Đánh giá", value: `${conv.coach.rating}/5.0` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{label}</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-800">{value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4">
        <div style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-700 mb-2">File & Hình ảnh đã chia sẻ</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MessagingProps {
  userPlan?: "free" | "pro" | "premium";
  onNavigate?: (view: string) => void;
}

export function Messaging({ userPlan = "free", onNavigate }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("c1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find(c => c.id === activeId);
  const filteredConvs = conversations.filter(c =>
    c.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.coach.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (activeId) {
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, unread: 0 } : c
      ));
    }
  }, [activeId]);

  const handleSend = (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || !activeConv?.subscribed) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "learner",
      text: msg,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: msg, lastTime: "Vừa xong" }
        : c
    ));
    setInputText("");
    setShowQuickReplies(false);

    // Simulate coach reply
    setTimeout(() => {
      const replies = [
        "Được rồi em nhé! 👍",
        "Anh/chị hiểu rồi, để anh/chị xem lại nhé.",
        "Tốt lắm! Cứ cố gắng đều đặn là sẽ tiến bộ thôi em.",
        "Em có thể upload video lên để anh/chị xem form cho em không?",
        "Nhớ uống đủ nước và ngủ đủ giấc nhé em 😊",
      ];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        senderId: "coach",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      };
      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, lastTime: "Vừa xong" }
          : c
      ));
      // Mark sent as read after reply
      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? {
            ...c,
            messages: c.messages.map(m => m.status === "sent" ? { ...m, status: "read" as const } : m)
          }
          : c
      ));
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setShowMobileList(false);
    setShowInfo(false);
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // ── LOCKED overlay for unsubscribed coaches ──────────────────────────────
  const LockedOverlay = () => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-sm mx-4 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <div style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900 mb-2">
          Nâng cấp để nhắn tin
        </div>
        <p style={{ fontSize: "0.83rem" }} className="text-gray-500 mb-5">
          Đăng ký gói với HLV <strong>{activeConv?.coach.name}</strong> để mở khoá tính năng nhắn tin trực tiếp
        </p>
        <button
          onClick={() => onNavigate?.("subscription")}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ fontWeight: 700, fontSize: "0.88rem" }}
        >
          <Crown className="w-4 h-4" />
          Xem gói dịch vụ
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate?.("find")}
          className="mt-2.5 w-full py-2 text-gray-500 hover:text-gray-700 rounded-xl"
          style={{ fontSize: "0.82rem", fontWeight: 500 }}
        >
          Xem thông tin HLV
        </button>
      </div>
    </div>
  );

  // ── Free plan banner ──────────────────────────────────────────────────────
  const FreeBanner = () => (
    userPlan === "free" ? (
      <div className="shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-3">
        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
        <span style={{ fontSize: "0.78rem" }} className="text-amber-700 flex-1">
          <strong>Gói Free:</strong> Chỉ xem được tin nhắn. Nâng cấp Pro để nhắn tin không giới hạn.
        </span>
        <button
          onClick={() => onNavigate?.("subscription")}
          className="shrink-0 bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors"
          style={{ fontSize: "0.72rem", fontWeight: 700 }}
        >
          Nâng cấp
        </button>
      </div>
    ) : null
  );

  return (
    <div className="flex h-[calc(100vh-130px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── CONVERSATION LIST ─────────────────────────────────────────────── */}
      <div className={`
        flex flex-col border-r border-gray-100 shrink-0
        ${showMobileList ? "flex" : "hidden md:flex"}
        w-full md:w-80
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">Tin nhắn</span>
              {totalUnread > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                  {totalUnread}
                </span>
              )}
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
              style={{ fontSize: "0.82rem" }}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <span style={{ fontSize: "0.82rem" }}>Không tìm thấy</span>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${activeId === conv.id ? "bg-orange-50 border-l-2 border-l-orange-400" : ""}`}
              >
                {/* Avatar + online dot */}
                <div className="relative shrink-0">
                  <img src={conv.coach.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                  <span className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${conv.coach.online ? "bg-emerald-400" : "bg-gray-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900 truncate">{conv.coach.name}</span>
                    <span style={{ fontSize: "0.68rem" }} className={`shrink-0 ml-2 ${conv.unread > 0 ? "text-orange-500 font-semibold" : "text-gray-400"}`}>{conv.lastTime}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mb-1">{conv.coach.sport}</div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.78rem" }} className={`truncate flex-1 ${conv.unread > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {conv.unread}
                      </span>
                    )}
                    {!conv.subscribed && (
                      <Lock className="w-3 h-3 text-gray-300 shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* New chat hint */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onNavigate?.("find")}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-200 rounded-xl text-orange-500 hover:bg-orange-50 transition-colors"
            style={{ fontSize: "0.8rem", fontWeight: 600 }}
          >
            <Search className="w-3.5 h-3.5" />
            Tìm HLV mới để nhắn tin
          </button>
        </div>
      </div>

      {/* ── CHAT WINDOW ──────────────────────────────────────────────────── */}
      {activeConv ? (
        <div className={`flex-1 flex flex-col min-w-0 relative ${showMobileList ? "hidden md:flex" : "flex"}`}>

          {/* Chat header */}
          <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            {/* Mobile back */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              onClick={() => setShowMobileList(true)}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* Avatar */}
            <div className="relative shrink-0">
              <img src={activeConv.coach.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
              {activeConv.coach.online && (
                <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontWeight: 700, fontSize: "0.92rem" }} className="text-gray-900">{activeConv.coach.name}</div>
              <div style={{ fontSize: "0.72rem" }} className={activeConv.coach.online ? "text-emerald-500" : "text-gray-400"}>
                {activeConv.coach.online ? "● Đang online" : "Offline"} · {activeConv.coach.sport}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-xl transition-colors ${showInfo ? "bg-orange-100 text-orange-500" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free plan banner */}
          <FreeBanner />

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {/* Date divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span style={{ fontSize: "0.7rem" }} className="text-gray-400 bg-gray-50 px-2">Hôm nay</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {activeConv.messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === "learner"} />
            ))}

            {/* Typing indicator */}
            {activeConv.coach.online && (
              <div className="flex items-end gap-2">
                <img src={activeConv.coach.avatar} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-3">
                    {[0, 150, 300].map(delay => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Locked overlay */}
          {!activeConv.subscribed && <LockedOverlay />}

          {/* Quick replies */}
          {showQuickReplies && activeConv.subscribed && (
            <div className="shrink-0 px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map(r => (
                <button
                  key={r}
                  onClick={() => handleSend(r)}
                  className="shrink-0 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors"
                  style={{ fontSize: "0.78rem", fontWeight: 500 }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className={`shrink-0 bg-white border-t border-gray-100 px-4 py-3 ${!activeConv.subscribed ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-end gap-2">
              {/* Attach + emoji */}
              <div className="flex gap-1 pb-1.5">
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`p-2 rounded-xl transition-colors ${showQuickReplies ? "bg-orange-100 text-orange-500" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-300 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    userPlan === "free"
                      ? "Nâng cấp Pro để nhắn tin..."
                      : "Nhập tin nhắn... (Enter để gửi)"
                  }
                  disabled={userPlan === "free"}
                  rows={1}
                  className="w-full px-4 py-2.5 bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-400 max-h-28 disabled:cursor-not-allowed"
                  style={{ fontSize: "0.88rem", lineHeight: 1.5 }}
                  onInput={e => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 112) + "px";
                  }}
                />
              </div>

              {/* Send button */}
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || userPlan === "free"}
                className={`p-3 rounded-2xl transition-all pb-1.5 ${
                  inputText.trim() && userPlan !== "free"
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {userPlan !== "free" && (
              <p style={{ fontSize: "0.68rem" }} className="text-gray-400 mt-1.5 text-center">
                Shift+Enter để xuống dòng · Enter để gửi
              </p>
            )}
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <div style={{ fontSize: "3rem" }} className="mb-3">💬</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }} className="text-gray-600">Chọn cuộc trò chuyện</div>
          <p style={{ fontSize: "0.82rem" }} className="text-gray-400 mt-1">Chọn HLV bên trái để bắt đầu nhắn tin</p>
        </div>
      )}

      {/* ── COACH INFO PANEL ─────────────────────────────────────────────── */}
      {showInfo && activeConv && (
        <CoachInfoPanel conv={activeConv} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}
