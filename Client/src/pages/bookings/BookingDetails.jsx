import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  UserRound,
  BedDouble,
  CalendarDays,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Check,
  Circle,
  DoorOpen,
  LogOut,
  X,
  Trash2,
  CalendarClock,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  getBookingById,
  updateBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  deleteBooking,
} from "../../api/bookingApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  STATUS_LABELS,
  STATUS_BADGE,
  ROOM_TYPE_LABELS,
  ID_TYPE_LABELS,
  formatDate,
  nightCount,
} from "./bookingUtils.js";

const STATUS_STEPS = ["pending", "confirmed", "checked-in", "checked-out"];
const STEP_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right">
      {children}
    </dd>
  </div>
);

const DetailBlock = ({ Icon, title, children }) => (
  <Card className="rounded-2xl">
    <CardHeader>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </span>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <dl className="space-y-3">{children}</dl>
    </CardContent>
  </Card>
);

const TimelineStep = ({ label, state, isLast }) => {
  const done = state === "done";
  const current = state === "current";

  return (
    <div className="flex items-center flex-1 last:flex-none">
      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`flex size-8 items-center justify-center rounded-full border transition-colors ${
            done
              ? "bg-emerald-500 border-emerald-500 text-white"
              : current
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {done ? (
            <Check className="w-4 h-4" />
          ) : current ? (
            <span className="size-2 rounded-full bg-primary" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
        </span>
        <span
          className={`text-xs font-medium ${
            current ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div
          className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
            done ? "bg-emerald-500" : "bg-border"
          }`}
        />
      )}
    </div>
  );
};

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const isGuest = roleName === "guest";
  const bookingsPerm = permissions?.modules?.bookings;
  const canUpdate = isSuperAdmin || bookingsPerm?.update === true;
  const canDelete = isSuperAdmin || bookingsPerm?.delete === true;
  const canManage = canUpdate && !isGuest;

  const loadBooking = async () => {
    try {
      const res = await getBookingById(id);
      setBooking(res?.booking || null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const runAction = async (actionFn, successMessage) => {
    setBusy(true);
    try {
      const res = await actionFn(id);
      if (res?.booking) setBooking(res.booking);
      showToast({ type: "success", message: successMessage });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Action failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = () =>
    runAction(confirmBooking, "Booking confirmed successfully");

  const handleCheckIn = () =>
    runAction(checkInBooking, "Guest checked in successfully");

  const handleCheckOut = () =>
    runAction(checkOutBooking, "Guest checked out successfully");

  const handleCancel = () =>
    runAction(
      (bookingId) => updateBooking(bookingId, { status: "cancelled" }),
      "Booking cancelled",
    );

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteBooking(id);
      setConfirmDelete(false);
      showToast({ type: "success", message: "Booking deleted successfully" });
      window.history.back();
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete booking",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="animate-fade-in-up">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to bookings
        </Link>
        <Card className="mt-6 p-10 text-center">
          <p className="text-sm text-destructive">
            {error || "Booking not found"}
          </p>
        </Card>
      </div>
    );
  }

  const createdDate = new Date(booking.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const nights = nightCount(booking.checkInDate, booking.checkOutDate);
  const rate = Number(booking.room?.pricePerNight || 0);
  const computedTotal = rate * nights;
  const total = Number(booking.totalAmount || 0) || computedTotal;
  const isCancelled = booking.status === "cancelled";
  const stepIndex = STATUS_STEPS.indexOf(booking.status);

  const actions = [];
  const busyLabel = busy ? "Working…" : undefined;

  if (booking.status === "pending" && canManage) {
    actions.push(
      <Button key="confirm" onClick={handleConfirm} disabled={busy}>
        <Check className="w-4 h-4" />
        {busyLabel || "Confirm booking"}
      </Button>,
    );
  }

  if (
    (booking.status === "pending" || booking.status === "confirmed") &&
    canUpdate
  ) {
    actions.push(
      <Button
        key="cancel"
        variant="outline"
        onClick={handleCancel}
        disabled={busy}
      >
        <X className="w-4 h-4" />
        {busyLabel || "Cancel booking"}
      </Button>,
    );
  }

  if (booking.status === "confirmed" && canManage) {
    actions.push(
      <Button key="checkin" onClick={handleCheckIn} disabled={busy}>
        <DoorOpen className="w-4 h-4" />
        {busyLabel || "Check in"}
      </Button>,
    );
  }

  if (booking.status === "checked-in" && canManage) {
    actions.push(
      <Button key="checkout" onClick={handleCheckOut} disabled={busy}>
        <LogOut className="w-4 h-4" />
        {busyLabel || "Check out"}
      </Button>,
    );
  }

  if (canDelete && !["checked-in", "checked-out"].includes(booking.status)) {
    actions.push(
      <Button
        key="delete"
        variant="outline"
        className="text-destructive hover:text-destructive"
        disabled={busy}
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>,
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </Link>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl text-foreground truncate">
                  {booking.guest?.name || "Guest"}
                </h1>
                <Badge className={STATUS_BADGE[booking.status]}>
                  {STATUS_LABELS[booking.status] || booking.status}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Booked on {createdDate}
                </span>
                {booking.guest?.phone && (
                  <span>· {booking.guest.phone}</span>
                )}
              </div>
            </div>

            <div className="lg:ml-auto text-left lg:text-right">
              <p className="text-xs text-muted-foreground">
                Total for {nights} night{nights === 1 ? "" : "s"}
              </p>
              <p className="text-3xl font-semibold text-foreground">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>

        {actions.length > 0 && (
          <>
            <Separator />
            <CardContent className="py-4 flex flex-wrap gap-2 justify-end">
              {actions}
            </CardContent>
          </>
        )}
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="py-5">
          {isCancelled ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <X className="w-4 h-4" />
              This booking was cancelled.
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {STATUS_STEPS.map((step, index) => (
                <TimelineStep
                  key={step}
                  label={STEP_LABELS[step]}
                  state={
                    index < stepIndex
                      ? "done"
                      : index === stepIndex
                        ? "current"
                        : "upcoming"
                  }
                  isLast={index === STATUS_STEPS.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailBlock Icon={UserRound} title="Guest">
          <DetailRow label="Name">
            {booking.guest?._id ? (
              <Link
                to={`/guests/${booking.guest._id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {booking.guest.name}
              </Link>
            ) : (
              booking.guest?.name || "—"
            )}
          </DetailRow>
          <DetailRow label="Email">{booking.guest?.email || "—"}</DetailRow>
          <DetailRow label="Phone">{booking.guest?.phone || "—"}</DetailRow>
          <DetailRow label="ID type">
            {booking.guest?.idType
              ? ID_TYPE_LABELS[booking.guest.idType] || booking.guest.idType
              : "—"}
          </DetailRow>
          <DetailRow label="ID number">
            {booking.guest?.idNumber || "—"}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={BedDouble} title="Room">
          <DetailRow label="Number">
            {booking.room?._id ? (
              <Link
                to={`/rooms/${booking.room._id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                Room {booking.room.number}
              </Link>
            ) : (
              booking.room?.number || "—"
            )}
          </DetailRow>
          <DetailRow label="Type">
            {booking.room
              ? ROOM_TYPE_LABELS[booking.room.type] || booking.room.type
              : "—"}
          </DetailRow>
          <DetailRow label="Rate per night">
            {rate ? `$${rate.toLocaleString()}` : "—"}
          </DetailRow>
          <DetailRow label="Room status">
            {booking.room?.status || "—"}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={CalendarDays} title="Stay">
          <DetailRow label="Check-in">
            {formatDate(booking.checkInDate)}
          </DetailRow>
          <DetailRow label="Check-out">
            {formatDate(booking.checkOutDate)}
          </DetailRow>
          <DetailRow label="Nights">{nights}</DetailRow>
          <DetailRow label="Guests">{booking.guestsCount ?? 1}</DetailRow>
          <DetailRow label="Status">
            {STATUS_LABELS[booking.status] || booking.status}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={DollarSign} title="Payment">
          <DetailRow label="Rate / night">
            {rate ? `$${rate.toLocaleString()}` : "—"}
          </DetailRow>
          <DetailRow label="Nights">{nights}</DetailRow>
          <DetailRow label="Room total">
            {computedTotal ? `$${computedTotal.toLocaleString()}` : "—"}
          </DetailRow>
          <DetailRow label="Total amount">
            <span className="font-semibold text-foreground">
              ${total.toLocaleString()}
            </span>
          </DetailRow>
          {booking.bookedBy && (
            <DetailRow label="Booked by">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                {booking.bookedBy.name}
                <span className="text-xs font-normal text-muted-foreground">
                  {booking.bookedBy.email}
                </span>
              </span>
            </DetailRow>
          )}
        </DetailBlock>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-4 h-4" />
            </span>
            <CardTitle>Special requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {booking.specialRequests || "None"}
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete booking"
        message={`Are you sure you want to delete the booking for ${booking.guest?.name || "this guest"}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default BookingDetails;