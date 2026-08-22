import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  DollarSign,
  UserCheck,
  Sparkles,
  Trash2,
  Check,
  Filter,
  RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { getSocket } from '@/config/socket';

export default function AdminNotifications() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATIONS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        const list = data.data?.notifications || [];
        setNotifications(list.map(n => ({
          ...n,
          status: n.isRead || n.status === 'read' ? 'read' : 'unread'
        })));
      }
    } catch (err) {
      console.warn('Failed to fetch notifications page data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNewNotif = (newNotif) => {
        setNotifications(prev => [
          { ...newNotif, status: newNotif.isRead || newNotif.status === 'read' ? 'read' : 'unread' },
          ...prev
        ]);
      };
      socket.on('admin_notification', handleNewNotif);
      return () => {
        socket.off('admin_notification', handleNewNotif);
      };
    }
  }, []);

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read', isRead: true })));
    try {
      const token = getAdminToken();
      await fetch(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}/mark-read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
  };

  const markAsRead = async (id) => {
    setNotifications(notifications.map(n => String(n.id) === String(id) ? { ...n, status: 'read', isRead: true } : n));
    try {
      const token = getAdminToken();
      await fetch(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => String(n.id) !== String(id)));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'creator') return n.type === 'creator_registration' || n.title?.toLowerCase().includes('creator');
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const getNotifMeta = (notif) => {
    const isCreatorReg = notif.type === 'creator_registration' || notif.title?.toLowerCase().includes('creator');
    if (isCreatorReg) {
      return {
        icon: Sparkles,
        color: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30',
        badge: 'Creator Reg'
      };
    }
    if (notif.type === 'kyc') {
      return {
        icon: UserCheck,
        color: 'text-[#FFD60A] bg-[#FFD60A]/10 border-[#FFD60A]/30',
        badge: 'KYC'
      };
    }
    if (notif.type === 'payout') {
      return {
        icon: DollarSign,
        color: 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30',
        badge: 'Payout'
      };
    }
    if (notif.type === 'security') {
      return {
        icon: ShieldAlert,
        color: 'text-[#FF3D71] bg-[#FF3D71]/10 border-[#FF3D71]/30',
        badge: 'Security'
      };
    }
    return {
      icon: Info,
      color: 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30',
      badge: 'System'
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#13131A] via-[#1A1A26] to-[#13131A] border border-[#1C1C26] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Admin Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF3D71] text-white animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Real-time platform alerts, creator registrations, KYC requests, payout triggers, and security events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={fetchNotifications}
            title="Refresh Notifications"
            className="p-2 text-xs font-bold rounded-xl bg-[#1C1C26] text-[#8B8B96] hover:text-white border border-[#2C2C3E] transition"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] border border-[#2C2C3E] transition flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5 text-[#00F5D4]" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'unread', 'creator', 'kyc', 'payout', 'security', 'system'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition whitespace-nowrap ${
              filter === t
                ? 'bg-brand-gradient text-[#0A0A0F] shadow-lg shadow-[#00F5D4]/20'
                : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
            }`}
          >
            {t === 'all' ? 'All Alerts' : t === 'creator' ? 'Creator Registrations' : t}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 text-center bg-[#13131A] rounded-2xl border border-[#1C1C26]">
            <RefreshCw className="h-8 w-8 text-[#00F5D4] animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#8B8B96]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-[#13131A] rounded-2xl border border-[#1C1C26]">
            <Bell className="h-10 w-10 text-[#8B8B96] mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-white">No notifications found</h3>
            <p className="text-xs text-[#8B8B96] mt-1">There are no alerts matching the selected filter.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const { icon: Icon, color, badge } = getNotifMeta(notif);
            const isUnread = notif.status === 'unread';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-[#13131A] border-[#00F5D4]/40 shadow-sm shadow-[#00F5D4]/5'
                    : 'bg-[#0E0E14] border-[#1C1C26] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-[#00F5D4]"></span>
                      )}
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#1C1C26] text-[#8B8B96] border border-[#2C2C3E]">
                        {badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#8B8B96] mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-[#8B8B96]/70 mt-2 block">{notif.time || 'Recently'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as Read"
                      className="p-2 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#00F5D4] hover:bg-[#252533] transition"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete Notification"
                    className="p-2 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#252533] transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

