import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // refresh periodically
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                <p className="text-xs text-slate-500">{unreadCount} unread updates</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markSingleRead(n.id);
                    }}
                    className={`pt-2.5 first:pt-0 p-2 rounded-xl transition-colors cursor-pointer ${
                      n.is_read ? 'hover:bg-slate-50' : 'bg-emerald-50/60 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5
                        className={`text-xs ${
                          n.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                        }`}
                      >
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline mt-1.5"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
