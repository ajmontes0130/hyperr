import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return;
      const items = await base44.entities.Notification.filter(
        { user_id: me.id },
        "-created_date",
        50
      );
      setNotifications(items || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = base44.entities.Notification.subscribe(() => {
      refresh();
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await base44.entities.Notification.update(id, { is_read: true });
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await base44.entities.Notification.bulkUpdate(
        unread.map((n) => ({ id: n.id, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await base44.entities.Notification.delete(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refresh };
}