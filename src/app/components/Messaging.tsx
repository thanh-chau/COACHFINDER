import { useState, useRef, useEffect } from "react";
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip,
  Lock, Check, CheckCheck, ArrowLeft, Info, X, FileText, Download, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ChatEmojiPicker } from "./ChatEmojiPicker";
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
  fileSize?: number | null;
  mimeType?: string | null;
  messageType?: ApiChatMessage["messageType"];
}

interface Conversation {
  id: string;
  coach: {
    name: string;
    username: string;
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
  subscribed: boolean;
}

const COACH_AVT_1 = "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const COACH_AVT_2 = "https://images.unsplash.com/photo-1679076875671-a30b4dbc6016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const COACH_AVT_3 = "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

const INITIAL_CONVERSATIONS: Conversation[] = [];

const QUICK_REPLIES = ["Dạ vâng ạ! 👍", "Em hiểu rồi ạ", "Cảm ơn anh/chị!", "Khi nào thuận tiện?", "Em sẽ cố gắng 💪"];

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
    senderId: message.ownMessage ? "learner" : "coach",
    text: message.content,
    time: formatChatTime(message.createdAt),
    status: message.read ? "read" : "delivered",
    type: messageType === "TEXT" ? "text" : messageType === "IMAGE" ? "image" : "file",
    fileUrl: message.attachmentUrl ?? undefined,
    fileName: message.attachmentFileName ?? undefined,
    fileSize: message.attachmentSizeBytes,
    mimeType: message.attachmentMimeType,
    messageType,
  };
}

function mapApiConversation(conversation: ApiConversation): Conversation {
  return {
    id: String(conversation.id),
    coach: {
      name: conversation.participantFullName || conversation.participantUsername,
      username: conversation.participantUsername,
      sport: "Coach",
      avatar: conversation.participantAvatarUrl || COACH_AVT_1,
      online: false,
      rating: 5,
      sessions: 0,
    },
    lastMessage: conversation.lastMessage || "Chưa có tin nhắn",
    lastTime: formatChatTime(conversation.lastMessageAt || conversation.updatedAt),
    unread: 0,
    messages: [],
    subscribed: true,
  };
}

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

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  const hasAttachment = !!msg.fileUrl && msg.messageType && msg.messageType !== "TEXT";
  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && <div className="w-1 shrink-0" />}
      <div className={`max-w-[72%] group`}>
        {hasAttachment ? (
          <div
            className={`overflow-hidden rounded-2xl ${
              isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
            }`}
          >
            {msg.messageType === "IMAGE" && (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                <img src={msg.fileUrl} alt={msg.fileName || "Hình ảnh"} className="max-h-72 w-full object-cover" />
              </a>
            )}
            {msg.messageType === "VIDEO" && (
              <video src={msg.fileUrl} controls preload="metadata" className="max-h-72 w-full bg-black" />
            )}
            {(msg.messageType === "PDF" || msg.messageType === "FILE") && (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 ${isMe ? "text-white" : "text-gray-800"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isMe ? "bg-white/20" : "bg-orange-50"}`}>
                  <FileText className={`h-5 w-5 ${isMe ? "text-white" : "text-orange-500"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold" style={{ fontSize: "0.84rem" }}>{msg.fileName || msg.text}</div>
                  <div className={isMe ? "text-orange-100" : "text-gray-400"} style={{ fontSize: "0.7rem" }}>{formatFileSize(msg.fileSize)}</div>
                </div>
                <Download className={`h-4 w-4 shrink-0 ${isMe ? "text-white" : "text-gray-400"}`} />
              </a>
            )}
            {msg.text && msg.text !== getMessagePreview(msg) && (
              <div className="px-3.5 py-2.5" style={{ fontSize: "0.86rem", lineHeight: 1.5 }}>{msg.text}</div>
            )}
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
            }`}
            style={{ fontSize: "0.88rem", lineHeight: 1.55 }}
          >
            {msg.text}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{msg.time}</span>
          {isMe && (msg.status === "read" ? <CheckCheck className="w-3 h-3 text-blue-400" /> : msg.status === "delivered" ? <CheckCheck className="w-3 h-3 text-gray-400" /> : <Check className="w-3 h-3 text-gray-400" />)}
        </div>
      </div>
    </div>
  );
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

function CoachInfoPanel({ conv, onClose }: { conv: Conversation; onClose: () => void }) {
  return (
    <div className="w-72 bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-y-auto z-20 absolute right-0 top-0 h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Thông tin HLV</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 flex flex-col items-center text-center border-b border-gray-100">
        <div className="relative mb-3">
          <img src={conv.coach.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          {conv.coach.online && <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />}
        </div>
        <div style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">{conv.coach.name}</div>
        <div style={{ fontSize: "0.8rem" }} className="text-gray-500 mt-0.5">{conv.coach.sport}</div>
      </div>
    </div>
  );
}

export function Messaging({ userPlan = "free", onNavigate, targetUsername }: { userPlan?: "free" | "pro" | "premium"; onNavigate?: (view: string) => void; targetUsername?: string | null }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("c1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const activeConv = conversations.find(c => c.id === activeId);
  const filteredConvs = conversations.filter(c => c.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.coach.sport.toLowerCase().includes(searchQuery.toLowerCase()));

  useChatWebSocket((incomingMsg) => {
    setConversations((prev) => {
      const convId = String(incomingMsg.conversationId);
      const convIndex = prev.findIndex(c => c.id === convId);
      if (convIndex === -1) {
        getConversations().then(items => setConversations(items.map(mapApiConversation))).catch(() => {});
        return prev;
      }
      const conv = prev[convIndex];
      if (conv.messages.some(m => m.id === String(incomingMsg.id))) return prev;
      const mappedMsg = mapApiMessage(incomingMsg);
      const isCurrentActive = activeIdRef.current === convId;
      
      const newConv = { ...conv, messages: [...conv.messages, mappedMsg], lastMessage: getMessagePreview(mappedMsg), lastTime: "Vừa xong", unread: isCurrentActive ? 0 : conv.unread + 1 };
      if (isCurrentActive && !incomingMsg.ownMessage) markConversationRead(Number(convId)).catch(() => {});
      return [newConv, ...prev.filter(c => c.id !== convId)];
    });
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv?.messages.length]);

  useEffect(() => {
    let mounted = true;
    const target = parseChatTarget(targetUsername);
    const targetParticipantId = getTargetParticipantId(target);

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
        setShowMobileList(false);
      }
      setConversations(mapped);
      if (initialId) setActiveId(initialId);
    }

    loadConversations().catch(() => {});
    return () => { mounted = false; };
  }, [targetUsername]);

  useEffect(() => {
    if (!/^\d+$/.test(activeId)) return;
    let mounted = true;
    const conversationId = Number(activeId);
    Promise.all([ getConversationMessages(conversationId, 0, 50), markConversationRead(conversationId).catch(() => undefined) ])
      .then(([page]) => {
        if (!mounted) return;
        setConversations((prev) => prev.map((conversation) => conversation.id === activeId ? { ...conversation, messages: page.content.map(mapApiMessage), unread: 0 } : conversation));
      }).catch(() => {});
    return () => { mounted = false; };
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
    return () => { mounted = false; };
  }, [activeId]);

  useEffect(() => {
    if (activeId) setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || !activeConv?.subscribed || !/^\d+$/.test(activeId)) return;

    try {
      const sent = await sendConversationMessage(Number(activeId), msg);
      const mapped = mapApiMessage(sent);
      setConversations(prev => prev.map(c => c.id === activeId ? {
        ...c,
        messages: c.messages.some(message => message.id === mapped.id) ? c.messages : [...c.messages, mapped],
        lastMessage: msg,
        lastTime: "Vừa xong",
      } : c));
      setInputText("");
      setShowQuickReplies(false);
    } catch {}
  };

  const handleAttachmentSelected = async (file?: File) => {
    if (!file || !activeConv?.subscribed || !/^\d+$/.test(activeId)) return;
    setUploadingAttachment(true);
    try {
      const sent = await sendConversationAttachment(Number(activeId), file);
      const mapped = mapApiMessage(sent);
      setConversations(prev => prev.map(c => c.id === activeId ? {
        ...c,
        messages: c.messages.some(message => message.id === mapped.id) ? c.messages : [...c.messages, mapped],
        lastMessage: getMessagePreview(mapped),
        lastTime: "Vừa xong",
      } : c));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi file. Vui lòng thử lại.");
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCall = (callType: CallType) => {
    if (!activeConv || !/^\d+$/.test(activeId)) return;
    window.dispatchEvent(new CustomEvent("coachfinder:start-call", {
      detail: {
        targetUsername: activeConv.coach.username,
        conversationId: Number(activeId),
        callType,
      },
    }));
  };

  return (
    <div className="flex h-[calc(100vh-130px)] md:h-[calc(100vh-150px)] lg:h-[calc(100vh-170px)] bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm relative">
      {/* ─── LEFT: LIST CONVERSATIONS ─── */}
      <div className={`w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-white absolute md:relative z-10 h-full transition-transform duration-300 ${showMobileList ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 700, fontSize: "1rem" }} className="text-gray-900">Tin nhắn</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm tin nhắn..." className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700" style={{ fontSize: "0.82rem" }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(conv => (
            <button key={conv.id} onClick={() => { setActiveId(conv.id); setShowMobileList(false); }} className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 text-left ${activeId === conv.id ? "bg-orange-50 border-l-2 border-l-orange-400" : ""}`}>
              <div className="relative shrink-0">
                <img src={conv.coach.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                <span className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${conv.coach.online ? "bg-emerald-400" : "bg-gray-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900 truncate">{conv.coach.name}</span>
                  <span style={{ fontSize: "0.68rem" }} className="text-gray-400 shrink-0 ml-2">{conv.lastTime}</span>
                </div>
                <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mb-1">{conv.coach.sport}</div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "0.78rem" }} className="text-gray-400 truncate flex-1">{conv.lastMessage}</span>
                  {!conv.subscribed && <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT: CHAT CONTENT ─── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMobileList(true)} className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img src={activeConv.coach.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${activeConv.coach.online ? "bg-emerald-500" : "bg-gray-300"}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: "0.95rem" }}>{activeConv.coach.name}</h3>
                <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{activeConv.coach.online ? "Đang hoạt động" : "Ngoại tuyến"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button onClick={() => startCall("audio")} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button onClick={() => startCall("video")} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button onClick={() => setShowInfo(!showInfo)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showInfo ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}>
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <button
              onClick={() => setShowCallHistory(value => !value)}
              className="mx-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-orange-500 hover:border-orange-200"
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
                    <span className={`text-xs font-bold ${call.ownCall ? "text-orange-500" : "text-blue-500"}`}>{call.ownCall ? "Di" : "Den"}</span>
                  </div>
                ))}
              </div>
            )}
            {activeConv.messages.map(msg => <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === "learner"} />)}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,video/*"
              className="hidden"
              onChange={(event) => handleAttachmentSelected(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAttachment}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl shrink-0 disabled:opacity-50"
            >
              {uploadingAttachment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-end relative transition-colors focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
              <textarea 
                ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
                className="w-full bg-transparent px-4 py-2.5 resize-none outline-none text-gray-700" style={{ minHeight: "44px", maxHeight: "120px" }} placeholder="Nhập tin nhắn..." 
              />
              <ChatEmojiPicker
                accent="orange"
                textareaRef={inputRef}
                value={inputText}
                onChange={setInputText}
                triggerClassName="p-2.5 text-gray-400 shrink-0 rounded-xl hover:bg-gray-100 transition-colors"
              />
            </div>
            <button onClick={() => handleSend()} disabled={!inputText.trim()} className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl disabled:opacity-50 shrink-0 transition-colors shadow-sm shadow-orange-500/20">
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><MoreVertical className="w-8 h-8 text-gray-300" /></div>
          <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      )}

      {showInfo && activeConv && <CoachInfoPanel conv={activeConv} onClose={() => setShowInfo(false)} />}
    </div>
  );
}
