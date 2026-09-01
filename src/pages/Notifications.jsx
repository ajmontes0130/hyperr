import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MobileBackButton from "@/components/MobileBackButton";
import { TYPE_META, routeForType } from "@/components/NotificationBell";

export default function Notifications() {
  useSEO({
    title: "Notifications | hyperr",
    description: "Your activity notifications on hyperr.",
  });
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (n) => {
    if (!n.is_read) await markAsRead(n.id);
    navigate(routeForType(n.type));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MobileBackButton />
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-sm">
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] || { label: "Update", color: "#8C97A3" };
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  n.is_read
                    ? "bg-card/50 border-border"
                    : "bg-secondary/60 border-primary/30"
                }`}
              >
                <button
                  onClick={() => handleClick(n)}
                  className="flex-1 flex gap-3 text-left min-w-0"
                >
                  <span
                    className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={
                      n.is_read
                        ? { background: "transparent", border: `1px solid ${meta.color}` }
                        : { background: meta.color }
                    }
                  />
                  <div className="min-w-0">
                    <p className={`text-sm ${n.is_read ? "text-muted-foreground" : "font-medium"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}