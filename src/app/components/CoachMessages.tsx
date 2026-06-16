import { useState, useRef, useEffect } from "react";
import {
  Search, Send, Paperclip, Smile, Video, Phone,
  MoreHorizontal, Check, CheckCheck,
  Image, FileText, Star, Pin,
  ChevronLeft, Info, X,
  Calendar, TrendingUp, Clock, Award, MessageSquare,
  Zap, Download, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createConversation,
  getConversationCalls,
  getConversationMessages,
  getConversations,
  markConversationRead,
  sendConversationAttachment,
  sendConversationMessage,
} from "../api/chat";
import { useChatWebSocket } from "../api/websocket";
import { normalizeCallType, type CallSession, type CallType, type ChatMessage as ApiChatMessage, type ChatTarget, type Conversation as ApiConversation } from "../types/chat";

// ─── Types ────────────────────────────────────────────────────────────────────
type MsgStatus  = "sent"|"delivered"|"read";
type ConvStatus = "online"|"offline"|"away";

interface Message {
  id: string; from: "coach"|"student"; text: string;
  time: string; status?: MsgStatus; type?: "text"|"file"|"video"|"system";
  fileName?: string; fileSize?: string;
  fileSizeBytes?: number | null;
  fileUrl?: string;
  mimeType?: string | null;
  messageType?: ApiChatMessage["messageType"];
}

interface Conversation {
  id: string; name: string; username: string; avatar: string; sport: string;
  status: ConvStatus; lastMsg: string; lastTime: string;
  unread: number; pinned?: boolean; messages: Message[];
  sessions: number; progress: number; nextSession?: string;
  joined: string;
}

const INITIAL_CONVS: Conversation[] = [];
const DEFAULT_CONVERSATION_AVATAR =
  "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80";

const QUICK_REPLIES = [
  "OK thầy sẽ xem!","Buổi tới mình điều chỉnh nhé 💪","Form của em tốt lắm! 🎉",
  "Xem feedback trong Video Studio nhé","Nhớ nghỉ ngơi đủ giấc nhé","Cố lên! Đang tiến bộ rất tốt 🏆",
];

function formatChatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatFileSize(size?: number | null) {
  if (!size) return "";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function getMessagePreview(message: Message) {
  if (message.messageType === "IMAGE") return "Đã gửi một hình ảnh";
  if (message.messageType === "VIDEO") return "Đã gửi một video";
  if (message.messageType === "PDF") return "Đã gửi một PDF";
  if (message.messageType === "FILE") return "Đã gửi một tệp";
  return message.text;
}

function mapApiMessage(message: ApiChatMessage): Message {
  const messageType = message.messageType ?? "TEXT";
  return {
    id: String(message.id),
    from: message.ownMessage ? "coach" : "student",
    text: message.content,
    time: formatChatTime(message.createdAt),
    status: message.read ? "read" : "delivered",
    type: messageType === "TEXT" ? "text" : messageType === "VIDEO" ? "video" : "file",
    fileName: message.attachmentFileName ?? undefined,
    fileSize: formatFileSize(message.attachmentSizeBytes),
    fileSizeBytes: message.attachmentSizeBytes,
    fileUrl: message.attachmentUrl ?? undefined,
    mimeType: message.attachmentMimeType,
    messageType,
  };
}

function mapApiConversation(conversation: ApiConversation): Conversation {
  return {
    id: String(conversation.id),
    name: conversation.participantFullName || conversation.participantUsername,
    username: conversation.participantUsername,
    avatar: conversation.participantAvatarUrl || DEFAULT_CONVERSATION_AVATAR,
    sport: "Học viên",
    status: "offline",
    lastMsg: conversation.lastMessage || "Chưa có tin nhắn",
    lastTime: formatChatTime(conversation.lastMessageAt || conversation.updatedAt),
    unread: 0,
    messages: [],
    sessions: 0,
    progress: 0,
    joined: "",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseChatTarget(raw?: string | null): ChatTarget | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ChatTarget | string;
    return typeof parsed === "string" ? { name: parsed } : parsed;
  } catch {
    return { name: raw };
  }
}

function getTargetParticipantId(target: ChatTarget | null) {
  const id = target?.participantId ?? target?.userId ?? target?.id;
  return Number.isFinite(id) ? id : undefined;
}

function canCreateTargetConversation(target: ChatTarget | null) {
  return !!target && (getTargetParticipantId(target) !== undefined || Number.isFinite(target.coachProfileId));
}

function matchesTarget(conversation: ApiConversation, target: ChatTarget | null) {
  if (!target) return false;
  const participantId = getTargetParticipantId(target);
  if (participantId && conversation.participantId === participantId) return true;
  const targetName = (target.name || target.username || "").trim().toLocaleLowerCase();
  return !!targetName && [conversation.participantFullName, conversation.participantUsername]
    .some(value => value?.trim().toLocaleLowerCase() === targetName);
}

function formatCallDuration(seconds: number | null) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

function callStatusLabel(status: CallSession["status"]) {
  const labels: Record<CallSession["status"], string> = {
    RINGING: "Dang do chuong",
    ACCEPTED: "Da ket noi",
    REJECTED: "Bi tu choi",
    MISSED: "Bi nho",
    CANCELLED: "Da huy",
    ENDED: "Da ket thuc",
    FAILED: "That bai",
  };
  return labels[status];
}

const STATUS_DOT:Record<ConvStatus,string> = {
  online:"bg-emerald-400", offline:"bg-gray-300", away:"bg-amber-400"
};
const STATUS_LBL:Record<ConvStatus,string> = {
  online:"Đang online", offline:"Offline", away:"Vắng mặt"
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MsgBubble({ msg, isCoach }:{ msg:Message; isCoach:boolean }) {
  const mine = isCoach ? msg.from==="coach" : msg.from==="student";
  const hasAttachment = !!msg.fileUrl && msg.messageType && msg.messageType !== "TEXT";
  if (msg.type==="system") return (
    <div className="flex justify-center">
      <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full" style={{fontSize:"0.68rem"}}>{msg.text}</span>
    </div>
  );
  return (
    <div className={`flex items-end gap-2 ${mine?"flex-row-reverse":"flex-row"}`}>
      <div className={`max-w-xs lg:max-w-sm`}>
        {hasAttachment ? (
          <div className={`overflow-hidden rounded-2xl ${mine?"bg-blue-500 text-white rounded-br-sm":"bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm"}`}>
            {msg.messageType === "IMAGE" && (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                <img src={msg.fileUrl} alt={msg.fileName || "Hình ảnh"} className="max-h-72 w-full object-cover" />
              </a>
            )}
            {msg.messageType === "VIDEO" && (
              <video src={msg.fileUrl} controls preload="metadata" className="max-h-72 w-full bg-black" />
            )}
            {(msg.messageType === "PDF" || msg.messageType === "FILE") && (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2.5 px-3 py-2.5 ${mine?"text-white":"text-gray-800"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mine?"bg-white/20":"bg-blue-50"}`}>
                  <FileText className={`w-4 h-4 ${mine?"text-white":"text-blue-500"}`}/>
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{fontSize:"0.78rem",fontWeight:600}} className={`truncate ${mine?"text-white":"text-gray-800"}`}>{msg.fileName || msg.text}</div>
                  <div style={{fontSize:"0.65rem"}} className={mine?"text-blue-100":"text-gray-400"}>{msg.fileSize || formatFileSize(msg.fileSizeBytes)}</div>
                </div>
                <Download className={`w-4 h-4 shrink-0 ${mine?"text-white":"text-gray-400"}`} />
              </a>
            )}
            {msg.text && msg.text !== getMessagePreview(msg) && (
              <div className="px-3.5 py-2.5" style={{fontSize:"0.85rem",lineHeight:1.6}}>
                {msg.text}
              </div>
            )}
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
export function CoachMessages({ targetUsername }: { targetUsername?: string | null }) {
  const [convs,setConvs]         = useState<Conversation[]>(INITIAL_CONVS);
  const [loading,setLoading]     = useState(true);
  const [activeId,setActiveId]   = useState<string>("c1");
  const [text,setText]           = useState("");
  const [search,setSearch]       = useState("");
  const [showInfo,setShowInfo]   = useState(false);
  const [showCallHistory,setShowCallHistory] = useState(false);
  const [callHistory,setCallHistory] = useState<CallSession[]>([]);
  const [showMobile,setShowMobile] = useState<"list"|"chat">("list");
  const [filter,setFilter]       = useState<"all"|"unread"|"pinned">("all");
  const [showQuick,setShowQuick] = useState(false);
  const [uploadingAttachment,setUploadingAttachment] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const usingApi = convs.some((conversation) => /^\d+$/.test(conversation.id));

  const active = convs.find(c=>c.id===activeId)!;

  const totalUnread = convs.reduce((s,c)=>s+c.unread,0);

  useChatWebSocket((incomingMsg) => {
    setConvs((prev) => {
      const convId = String(incomingMsg.conversationId);
      const convIndex = prev.findIndex(c => c.id === convId);
      if (convIndex === -1) {
        // Just reload conversations list if a new one pops up
        getConversations().then(items => {
          setConvs(items.map(mapApiConversation));
        }).catch(() => {});
        return prev;
      }
      const conv = prev[convIndex];
      if (conv.messages.some(m => m.id === String(incomingMsg.id))) {
        return prev;
      }
      const mappedMsg = mapApiMessage(incomingMsg);
      const isCurrentActive = activeIdRef.current === convId;
      
      const newConv = {
        ...conv,
        messages: [...conv.messages, mappedMsg],
        lastMsg: getMessagePreview(mappedMsg),
        lastTime: "Vừa xong",
        unread: isCurrentActive ? 0 : conv.unread + 1,
      };

      if (isCurrentActive && !incomingMsg.ownMessage) {
        markConversationRead(Number(convId)).catch(() => {});
      }

      return [newConv, ...prev.filter(c => c.id !== convId)];
    });
  });
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

  useEffect(() => {
    let mounted = true;
    const target = parseChatTarget(targetUsername);
    const targetParticipantId = getTargetParticipantId(target);
    setLoading(true);

    async function loadConversations() {
      let items = await getConversations();
      if (target && !items.some(item => matchesTarget(item, target)) && canCreateTargetConversation(target)) {
        const created = await createConversation({
          participantId: targetParticipantId,
          coachProfileId: target.coachProfileId,
        });
        items = [created, ...items.filter(item => item.id !== created.id)];
      }
      if (!mounted) return;

      const mapped = items.map(mapApiConversation);
      let initialId = mapped.length > 0 ? String(mapped[0].id) : "";
      if (target) {
        const foundApi = items.find(item => matchesTarget(item, target));
        const found = foundApi ? mapped.find(c => c.id === String(foundApi.id)) : undefined;
        if (found) initialId = found.id;
        setShowMobile("chat");
      }
      setConvs(mapped);
      if (initialId) setActiveId(initialId);
    }

    loadConversations()
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [targetUsername]);

  useEffect(() => {
    if (!/^\d+$/.test(activeId)) return;
    let mounted = true;
    const conversationId = Number(activeId);

    Promise.all([
      getConversationMessages(conversationId, 0, 50),
      markConversationRead(conversationId).catch(() => undefined),
    ])
      .then(([page]) => {
        if (!mounted) return;
        setConvs((prev) => prev.map((conversation) =>
          conversation.id === activeId
            ? { ...conversation, messages: page.content.map(mapApiMessage), unread: 0 }
            : conversation
        ));
      })
      .catch(() => {
        // Keep current messages if fetching this conversation fails.
      });
    return () => {
      mounted = false;
    };
  }, [activeId]);

  useEffect(() => {
    if (!/^\d+$/.test(activeId)) return;
    let mounted = true;
    getConversationCalls(Number(activeId), 0, 8)
      .then(page => {
        if (mounted) setCallHistory(page.content);
      })
      .catch(() => {
        if (mounted) setCallHistory([]);
      });
    return () => {
      mounted = false;
    };
  }, [activeId]);

  const openConv = (id:string) => {
    setActiveId(id);
    setShowMobile("chat");
    setConvs(prev=>prev.map(c=>c.id===id?{...c,unread:0}:c));
  };

  const sendMsg = async () => {
    const t = text.trim();
    if (!t || !/^\d+$/.test(activeId)) return;

    try {
      const sent = await sendConversationMessage(Number(activeId), t);
      const mapped = mapApiMessage(sent);
      setConvs(prev=>prev.map(c=>
        c.id===activeId ? {
          ...c,
          messages: c.messages.some(message => message.id === mapped.id) ? c.messages : [...c.messages, mapped],
          lastMsg:t,
          lastTime:"Vừa xong",
        } : c
      ));
      setText("");
      setShowQuick(false);
    } catch {}
  };

  const handleAttachmentSelected = async (file?: File) => {
    if (!file || !/^\d+$/.test(activeId)) return;
    setUploadingAttachment(true);
    try {
      const sent = await sendConversationAttachment(Number(activeId), file);
      const mapped = mapApiMessage(sent);
      setConvs(prev=>prev.map(c=>
        c.id===activeId ? {
          ...c,
          messages: c.messages.some(message => message.id === mapped.id) ? c.messages : [...c.messages, mapped],
          lastMsg:getMessagePreview(mapped),
          lastTime:"Vừa xong",
        } : c
      ));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi file. Vui lòng thử lại.");
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCall = (callType: CallType) => {
    if (!active || !/^\d+$/.test(activeId)) return;
    window.dispatchEvent(new CustomEvent("coachfinder:start-call", {
      detail: {
        targetUsername: active.username,
        conversationId: Number(activeId),
        callType,
      },
    }));
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
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span style={{fontSize:"0.85rem"}}>Đang tải tin nhắn...</span>
              </div>
            ) : filtered.length===0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40"/>
                <span style={{fontSize:"0.8rem"}}>Không tìm thấy</span>
              </div>
            ) : filtered.map(c=>(
              <button key={c.id} onClick={()=>{
                setActiveId(c.id);
                if(showMobile==="list") setShowMobile("chat");
              }}
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
                <button onClick={() => startCall("audio")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Phone className="w-4 h-4"/></button>
                <button onClick={() => startCall("video")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Video className="w-4 h-4"/></button>
                <button onClick={()=>setShowInfo(v=>!v)} className={`p-2 rounded-xl transition-colors ${showInfo?"bg-blue-50 text-blue-500":"hover:bg-gray-100 text-gray-400"}`}>
                  <Info className="w-4 h-4"/>
                </button>
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
              <button
                onClick={() => setShowCallHistory(value => !value)}
                className="mx-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-blue-500 hover:border-blue-200"
                style={{ fontSize: "0.75rem" }}
              >
                Lich su cuoc goi ({callHistory.length})
              </button>
              {showCallHistory && (
                <div className="max-w-md mx-auto space-y-2">
                  {callHistory.length === 0 ? (
                    <div className="text-center text-gray-400 bg-white rounded-2xl py-3" style={{ fontSize: "0.78rem" }}>Chua co cuoc goi</div>
                  ) : callHistory.map(call => (
                    <div key={call.id} className="bg-white border border-gray-100 rounded-2xl px-3 py-2 flex items-center justify-between text-gray-600">
                      <div>
                        <div className="font-semibold" style={{ fontSize: "0.78rem" }}>{normalizeCallType(call.callType) === "video" ? "Video call" : "Goi thoai"} - {callStatusLabel(call.status)}</div>
                        <div className="text-gray-400" style={{ fontSize: "0.68rem" }}>{formatChatTime(call.createdAt)} {formatCallDuration(call.durationSeconds) && `- ${formatCallDuration(call.durationSeconds)}`}</div>
                      </div>
                      <span className={`text-xs font-bold ${call.ownCall ? "text-blue-500" : "text-orange-500"}`}>{call.ownCall ? "Di" : "Den"}</span>
                    </div>
                  ))}
                </div>
              )}
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*,video/*"
                className="hidden"
                onChange={(event) => handleAttachmentSelected(event.target.files?.[0])}
              />
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
                    <button type="button" onClick={()=>fileInputRef.current?.click()} disabled={uploadingAttachment} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50">
                      {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin"/> : <Paperclip className="w-4 h-4"/>}
                    </button>
                    <button type="button" onClick={()=>fileInputRef.current?.click()} disabled={uploadingAttachment} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"><Image className="w-4 h-4"/></button>
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
