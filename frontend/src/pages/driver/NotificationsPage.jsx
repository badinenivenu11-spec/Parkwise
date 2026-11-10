import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function NotificationsPage() {
  const { refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshProfile();
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      refreshProfile();
      addToast('Notification removed', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reservation alerts, slot assignments, and parking session reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            filter === 'ALL'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-navy-900 border-navy-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            filter === 'UNREAD'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-navy-900 border-navy-800 text-slate-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-navy-800 text-center max-w-md mx-auto space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-slate-400">
            {filter === 'UNREAD' ? 'You have read all your notifications!' : 'Your notification inbox is clean.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-navy-900/60 border-navy-800 text-slate-300'
                  : 'bg-navy-850 border-emerald-500/40 text-white shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

                  {n.relatedReservation && (
                    <Link
                      to={`/confirmation/${n.relatedReservation}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 pt-1"
                    >
                      <span>View Associated Booking Pass</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-navy-800 transition"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
