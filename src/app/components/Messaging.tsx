import { useState, useRef, useEffect } from "react";
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip, Smile,
  Lock, Check, CheckCheck, ArrowLeft, Info, X
} from "lucide-react";
import {
  getConversationMessages,
  getConversations,
  markConversationRead,
  sendConversationMessage,
} from "../api/chat";
import { chatWebSocketService, useChatWebSocket } from "../api/websocket";
import type { ChatMessage as ApiChatMessage, Conversation as ApiConversation } from "../types/chat";

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

function mapApiMessage(message: ApiChatMessage): Message {
  return {
    id: String(message.id),
    senderId: message.ownMessage ? "learner" : "coach",
    text: message.content,
    time: formatChatTime(message.createdAt),
    status: message.read ? "read" : "delivered",
  };
}

function mapApiConversation(conversation: ApiConversation): Conversation {
  return {
    id: String(conversation.id),
    coach: {
      name: conversation.participantFullName || conversation.participantUsername,
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

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && <div className="w-1 shrink-0" />}
      <div className={`max-w-[72%] group`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
          }`}
          style={{ fontSize: "0.88rem", lineHeight: 1.55 }}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{msg.time}</span>
          {isMe && (msg.status === "read" ? <CheckCheck className="w-3 h-3 text-blue-400" /> : msg.status === "delivered" ? <CheckCheck className="w-3 h-3 text-gray-400" /> : <Check className="w-3 h-3 text-gray-400" />)}
        </div>
      </div>
    </div>
  );
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
  const [showMobileList, setShowMobileList] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
      
      const newConv = { ...conv, messages: [...conv.messages, mappedMsg], lastMessage: mappedMsg.text, lastTime: "Vừa xong", unread: isCurrentActive ? 0 : conv.unread + 1 };
      if (isCurrentActive && !incomingMsg.ownMessage) markConversationRead(Number(convId)).catch(() => {});
      return [newConv, ...prev.filter(c => c.id !== convId)];
    });
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv?.messages.length]);

  useEffect(() => {
    let mounted = true;
    getConversations().then((items) => {
      if (!mounted || items.length === 0) return;
      const mapped = items.map(mapApiConversation);
      setConversations(mapped);
      let initialId = String(mapped[0].id);
      if (targetUsername) {
        const found = mapped.find(c => c.coach.name === targetUsername);
        if (found) {
          initialId = found.id;
          setShowMobileList(false);
        }
      }
      setActiveId(initialId);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (targetUsername && conversations.length > 0) {
      const found = conversations.find(c => c.coach.name === targetUsername);
      if (found) {
        setActiveId(found.id);
        setShowMobileList(false);
      }
    }
  }, [targetUsername, conversations.length]);

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
    if (activeId) setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || !activeConv?.subscribed) return;
    if (/^\d+$/.test(activeId)) {
      try {
        const sent = await sendConversationMessage(Number(activeId), msg);
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, mapApiMessage(sent)], lastMessage: msg, lastTime: "Vừa xong" } : c));
        setInputText("");
        setShowQuickReplies(false);
        return;
      } catch {}
    }
    const newMsg: Message = { id: `m${Date.now()}`, senderId: "learner", text: msg, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), status: "sent" };
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg], lastMessage: msg, lastTime: "Vừa xong" } : c));
    setInputText("");
    setShowQuickReplies(false);
  };

  const handleVideoCall = () => {
    if (activeConv) {
      chatWebSocketService.sendCallSignal({ type: "call", targetUsername: activeConv.coach.name });
    }
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
              <button onClick={handleVideoCall} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button onClick={handleVideoCall} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button onClick={() => setShowInfo(!showInfo)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showInfo ? "bg-orange-50 text-orange-500" : "text-gray-400 hover:bg-gray-50"}`}>
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {activeConv.messages.map(msg => <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === "learner"} />)}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl shrink-0"><Paperclip className="w-5 h-5" /></button>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-end relative transition-colors focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
              <textarea 
                ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
                className="w-full bg-transparent px-4 py-2.5 resize-none outline-none text-gray-700" style={{ minHeight: "44px", maxHeight: "120px" }} placeholder="Nhập tin nhắn..." 
              />
              <button className="p-2.5 text-gray-400 hover:text-orange-500 shrink-0"><Smile className="w-5 h-5" /></button>
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
