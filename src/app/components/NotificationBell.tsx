import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import {
  deleteNotification,
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import type { NotificationItem } from "../types/notification";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadCount = () => {
    getNotificationUnreadCount()
      .then(result => setCount(result.unreadCount))
      .catch(() => setCount(0));
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const result = await getNotifications();
      setItems(result || []);
      setCount((result || []).filter(item => !item.read).length);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCount();
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadItems();
  }, [open]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const markRead = async (id: number) => {
    try {
      const updated = await markNotificationRead(id);
      setItems(current => current.map(item => item.id === id ? updated : item));
      loadCount();
    } catch {
      // Keep local state unchanged when the API rejects the action.
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems(current => current.map(item => ({ ...item, read: true })));
      setCount(0);
    } catch {
      // Keep local state unchanged when the API rejects the action.
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteNotification(id);
      setItems(current => current.filter(item => item.id !== id));
      loadCount();
    } catch {
      // Keep local state unchanged when the API rejects the action.
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
      >
        <Bell className="w-[18px] h-[18px] text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white rounded-full ring-2 ring-white flex items-center justify-center" style={{ fontSize: "0.62rem", fontWeight: 800 }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="text-gray-900" style={{ fontSize: "0.9rem", fontWeight: 800 }}>Thong bao</div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={markAllRead} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Danh dau tat ca da doc">
                <Check className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-400" style={{ fontSize: "0.82rem" }}>Dang tai thong bao...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400" style={{ fontSize: "0.82rem" }}>Khong co thong bao</div>
            ) : items.map(item => (
              <div key={item.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 ${item.read ? "bg-white" : "bg-orange-50/40"}`}>
                <button type="button" onClick={() => void markRead(item.id)} className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.read ? "bg-gray-200" : "bg-orange-500"}`} title="Danh dau da doc" />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 truncate" style={{ fontSize: "0.82rem", fontWeight: 700 }}>{item.title}</div>
                  <div className="text-gray-500 mt-0.5 line-clamp-2" style={{ fontSize: "0.76rem", lineHeight: 1.5 }}>{item.message}</div>
                  <div className="text-gray-400 mt-1" style={{ fontSize: "0.68rem" }}>{new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                </div>
                <button type="button" onClick={() => void remove(item.id)} className="self-start p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50" title="Xoa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
