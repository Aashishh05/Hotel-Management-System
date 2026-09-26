import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Check,
  DoorClosed,
  DoorOpen,
  LogOut,
  CalendarClock,
  Search,
  ShieldX,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  getAllBookings,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
} from "../../api/bookingApi";
import { showToast } from "../../components/common/Toast";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  STATUS_LABELS,
  STATUS_BADGE,
  ROOM_TYPE_LABELS,
  formatDate,
} from "../bookings/bookingUtils.js";

const TABS = [
  { key: "arriving", label: "Arriving today" },
  { key: "ready", label: "Ready to check in" },
  { key: "inhouse", label: "In-house" },
  { key: "all", label: "All" },
];

const toDateKey = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CheckInCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState("arriving");
  const [search, setSearch] = useState("");

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const isGuest = roleName === "guest";
  const canManage =
    (isSuperAdmin || permissions?.modules?.bookings?.update === true) &&
    !isGuest;

  const loadBookings = async () => {
    try {
      const res = await getAllBookings();
      setBookings(res?.bookings || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const performAction = async (booking, action) => {
    setBusyId(booking._id);
    try {
      const config = {
        confirm: [confirmBooking, "Booking confirmed successfully"],
        checkin: [checkInBooking, "Guest checked in successfully"],
        checkout: [checkOutBooking, "Guest checked out successfully"],
      };
      const [fn, message] = config[action];
      const res = await fn(booking._id);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? (res?.booking ?? b) : b)),
      );
      showToast({ type: "success", message });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Action failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const t = todayKey();
    let arriving = 0;
    let inHouse = 0;
    let departing = 0;
    bookings.forEach((b) => {
      if (b.status === "checked-in") {
        inHouse += 1;
        if (toDateKey(b.checkOutDate) === t) departing += 1;
      } else if (
        (b.status === "pending" || b.status === "confirmed") &&
        toDateKey(b.checkInDate) === t
      ) {
        arriving += 1;
      }
    });
    return { arriving, inHouse, departing };
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    const t = todayKey();
    let list =
      tab === "arriving"
        ? bookings.filter(
            (b) =>
              (b.status === "pending" || b.status === "confirmed") &&
              toDateKey(b.checkInDate) === t,
          )
        : tab === "ready"
          ? bookings.filter((b) => b.status === "confirmed")
          : tab === "inhouse"
            ? bookings.filter((b) => b.status === "checked-in")
            : bookings.filter((b) => b.status !== "cancelled");

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          (b.guest?.name || "").toLowerCase().includes(q) ||
          (b.guest?.phone || "").toLowerCase().includes(q) ||
          String(b.room?.number || "").toLowerCase().includes(q),
      );
    }

    return [...list].sort(
      (a, b) => new Date(a.checkInDate) - new Date(b.checkInDate),
    );
  }, [bookings, tab, search]);

  const statChip = [
    {
      label: "Arriving today",
      value: stats.arriving,
      Icon: CalendarClock,
      className: "text-sky-600 bg-sky-500/10 border-sky-500/30",
    },
    {
      label: "In-house",
      value: stats.inHouse,
      Icon: DoorClosed,
      className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      label: "Departing today",
      value: stats.departing,
      Icon: LogOut,
      className: "text-amber-600 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const stop = (handler) => (e) => {
    e.stopPropagation();
    handler();
  };

  const busyLabel = (booking) =>
    busyId === booking._id
      ? booking.status === "pending"
        ? "Confirming…"
        : booking.status === "confirmed"
          ? "Checking in…"
          : "Checking out…"
      : undefined;

  const rowActions = (booking) => {
    const disabled = busyId === booking._id;
    const label = busyLabel(booking);

    if (booking.status === "pending") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-600 hover:text-emerald-600"
          disabled={disabled}
          onClick={stop(() => performAction(booking, "confirm"))}
        >
          <Check className="w-3.5 h-3.5" />
          {label || "Confirm"}
        </Button>
      );
    }
    if (booking.status === "confirmed") {
      return (
        <Button
          size="sm"
          disabled={disabled}
          onClick={stop(() => performAction(booking, "checkin"))}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          {label || "Check in"}
        </Button>
      );
    }
    if (booking.status === "checked-in") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={stop(() => performAction(booking, "checkout"))}
        >
          <LogOut className="w-3.5 h-3.5" />
          {label || "Check out"}
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Card className="overflow-hidden">
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Check In / Out
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage guest arrivals and departures.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldX className="mx-auto w-9 h-9 text-muted-foreground" />
            <p className="mt-3 font-display text-lg text-foreground">
              No access
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You don't have permission to perform check-ins or check-outs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Check In / Out
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome arrivals, manage in-house guests, and handle departures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statChip.map(({ label, value, Icon, className }) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {value}
                </p>
              </div>
              <span
                className={`flex size-10 items-center justify-center rounded-lg border ${className}`}
              >
                <Icon className="w-5 h-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest, phone, or room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              size="sm"
              className={
                tab === key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }
              onClick={() => setTab(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-14 text-center">
                  <CalendarClock className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    Nothing here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No bookings match this view.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleBookings.map((booking) => (
                <TableRow
                  key={booking._id}
                  className="cursor-pointer animate-fade-in-up transition-colors hover:bg-muted/40"
                  onClick={() => navigate(`/bookings/${booking._id}`)}
                >
                  <TableCell>
                    <Link
                      to={`/bookings/${booking._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {booking.guest?.name || "—"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {booking.guest?.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">
                      {booking.room?.number || "—"}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {ROOM_TYPE_LABELS[booking.room?.type] || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.checkInDate)}
                    {booking.actualCheckIn && (
                      <div className="text-xs text-muted-foreground">
                        {formatTime(booking.actualCheckIn)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.checkOutDate)}
                    {booking.actualCheckOut && (
                      <div className="text-xs text-muted-foreground">
                        {formatTime(booking.actualCheckOut)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{booking.guestsCount}</TableCell>
                  <TableCell className="font-medium">
                    ${Number(booking.totalAmount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[booking.status]}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {rowActions(booking)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CheckInCheckout;