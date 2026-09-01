import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export const TYPE_META = {
  trade_proposed: { label: "Trade", color: "#2DD4FF" },
  message_received: { label: "Message", color: "#FF4D6D" },
  trade_completed: { label: "Completed", color: "#34D399" },
  promotion_available: { label: "Promotion", color: "#FBBF3D" },
};

export const routeForType = (type) => {
  switch (type) {
    case "trade_proposed":
    case "trade_completed":
      return "/my-trades";
    case "message_received":
      return "/messages";
    case "promotion_available":
      return "/explore";
    default:
      return "/notifications";
  }
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const recent = notifications.slice(0, 6);

  const handleClick = async (n) => {
    if (!n.is_read) await markAsRead(n.id);
    setOpen(false);
    navigate(routeForType(n.type));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors select-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center"
              style={{ boxShadow: "0 0 8px rgba(255,77,109,0.6)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              You're all caught up
            </div>
          ) : (
            recent.map((n) => {
              const meta = TYPE_META[n.type] || { label: "Update", color: "#8C97A3" };
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className="w-full text-left flex gap-3 px-4 py-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                >
                  {!n.is_read && (
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: meta.color }}
                    />
                  )}
                  <div className={n.is_read ? "flex-1 min-w-0 opacity-70" : "flex-1 min-w-0"}>
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <Link
          to="/notifications"
          onClick={() => setOpen(false)}
          className="block text-center text-sm text-primary py-2.5 hover:bg-secondary transition-colors border-t border-border"
        >
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}