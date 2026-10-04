import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  CalendarCheck,
  CheckCheck,
  CircleCheck,
  CircleAlert,
  CreditCard,
  Info,
  TriangleAlert,
  Wrench,
  UtensilsCrossed,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../api/notificationApi";
import useAuth from "../../hooks/useAuth";
import { showToast } from "../common/Toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const TYPE_ICONS = {
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  booking: CalendarCheck,
  payment: CreditCard,
  maintenance: Wrench,
  housekeeping: Wrench,
  restaurant: UtensilsCrossed,
};

const TYPE_TONES = {
  success: "text-primary",
  warning: "text-amber-600",
  error: "text-destructive",
  booking: "text-sky-600",
  payment: "text-primary",
  maintenance: "text-amber-600",
  housekeeping: "text-amber-600",
  restaurant: "text-sky-600",
};

const MODULE_PATHS = {
  bookings: { staff: "/bookings", guest: "/guest/stays", detail: true },
};

const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString();
};

const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = user?.role?.name === "guest";
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res?.data?.count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 8 });
      setNotifications(res?.data?.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) {
      loadNotifications();
      loadUnreadCount();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
      setUnreadCount(0);
      showToast({ type: "success", message: "All notifications marked as read" });
    } catch {
      showToast({ type: "error", message: "Could not mark notifications as read" });
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        /* keep the item marked unread if the update failed */
      }
    }

    const entry = MODULE_PATHS[notification.targetModule];

    if (entry) {
      const base = entry[isGuest ? "guest" : "staff"];
      const path =
        entry.detail && notification.targetId
          ? `${base}/${notification.targetId}`
          : base;

      setOpen(false);
      navigate(path);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className="relative flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="h-px bg-border" />

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm text-muted-foreground">
              <BellOff className="w-5 h-5" />
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] || Info;

              return (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleOpenNotification(notification)}
                  className={`flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
                    notification.isRead ? "opacity-60" : "bg-accent/40"
                  }`}
                >
                  <Icon
                    className={`mt-0.5 w-4 h-4 shrink-0 ${
                      TYPE_TONES[notification.type] || "text-muted-foreground"
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground/70">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;