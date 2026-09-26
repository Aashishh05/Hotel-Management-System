import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Trash2,
  Check,
  DoorOpen,
  LogOut,
  X,
  CalendarCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  getAllBookings,
  updateBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  deleteBooking,
} from "../../api/bookingApi";
import { getAllRooms } from "../../api/roomApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import BookingForm from "./BookingForm.jsx";
import {
  STATUS_LABELS,
  STATUS_BADGE,
  ROOM_TYPE_LABELS,
  formatDate,
} from "./bookingUtils.js";

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const isGuest = roleName === "guest";
  const bookingsPerm = permissions?.modules?.bookings;
  const canCreate = isSuperAdmin || bookingsPerm?.create === true;
  const canUpdate = isSuperAdmin || bookingsPerm?.update === true;
  const canDelete = isSuperAdmin || bookingsPerm?.delete === true;
  const canManage = canUpdate && !isGuest;

  const loadBookings = async () => {
    try {
      const results = await Promise.all([getAllBookings(), getAllRooms()]);
      setBookings(results[0]?.bookings || []);
      setRooms(results[1]?.rooms || []);
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

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  const performAction = async (id, actionFn, successMessage) => {
    setBusyId(id);
    try {
      const res = await actionFn(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? (res?.booking ?? b) : b)),
      );
      showToast({ type: "success", message: successMessage });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Action failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = (booking) =>
    performAction(
      booking._id,
      confirmBooking,
      "Booking confirmed successfully",
    );

  const handleCheckIn = (booking) =>
    performAction(booking._id, checkInBooking, "Guest checked in successfully");

  const handleCheckOut = (booking) =>
    performAction(
      booking._id,
      checkOutBooking,
      "Guest checked out successfully",
    );

  const handleCancel = (booking) =>
    performAction(
      booking._id,
      (id) => updateBooking(id, { status: "cancelled" }),
      "Booking cancelled",
    );

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteBooking(confirmDelete._id);
      setBookings((prev) => prev.filter((b) => b._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "Booking deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete booking",
      });
    } finally {
      setDeleting(false);
    }
  };

  const bookingActions = (booking) => {
    const disabled = busyId === booking._id;
    const busyLabel = busyId === booking._id ? "Working…" : undefined;
    const stop = (handler) => (e) => {
      e.stopPropagation();
      handler();
    };
    const actions = [];

    if (booking.status === "pending" && canManage) {
      actions.push(
        <Button
          key="confirm"
          type="button"
          variant="outline"
          size="sm"
          className="text-emerald-600 hover:text-emerald-600"
          disabled={disabled}
          onClick={stop(() => handleConfirm(booking))}
        >
          <Check className="w-3.5 h-3.5" />
          {busyLabel || "Confirm"}
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
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={stop(() => handleCancel(booking))}
        >
          <X className="w-3.5 h-3.5" />
          {busyLabel || "Cancel"}
        </Button>,
      );
    }

    if (booking.status === "confirmed" && canManage) {
      actions.push(
        <Button
          key="checkin"
          type="button"
          size="sm"
          disabled={disabled}
          onClick={stop(() => handleCheckIn(booking))}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          {busyLabel || "Check-in"}
        </Button>,
      );
    }

    if (booking.status === "checked-in" && canManage) {
      actions.push(
        <Button
          key="checkout"
          type="button"
          size="sm"
          disabled={disabled}
          onClick={stop(() => handleCheckOut(booking))}
        >
          <LogOut className="w-3.5 h-3.5" />
          {busyLabel || "Check-out"}
        </Button>,
      );
    }

    if (!["checked-in", "checked-out"].includes(booking.status) && canDelete) {
      actions.push(
        <Button
          key="delete"
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={disabled}
          onClick={stop(() => setConfirmDelete(booking))}
          aria-label={`Delete booking for ${booking.guest?.name || "guest"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>,
      );
    }

    return actions;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage reservations, confirm, check guests in and out.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openForm}>
            <Plus className="w-4 h-4" />
            New booking
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="py-6 px-0">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in-up animate-delay-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              {(canUpdate || canDelete) && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-40 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 7 : 6}
                  className="py-14 text-center"
                >
                  <CalendarCheck className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No bookings yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first booking using the New booking button.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
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
                    {booking.guest?.phone && (
                      <div className="text-xs text-muted-foreground">
                        {booking.guest.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/rooms/${booking.room?._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {booking.room?.number || "—"}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {ROOM_TYPE_LABELS[booking.room?.type] || ""}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[booking.status]}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(booking.totalAmount || 0).toLocaleString()}
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {bookingActions(booking)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <BookingForm
        open={formOpen}
        onOpenChange={(open) => !open && closeForm()}
        rooms={rooms}
        onCreated={(booking) =>
          setBookings((prev) => [booking, ...prev].filter(Boolean))
        }
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete booking"
        message={`Are you sure you want to delete the booking for ${confirmDelete?.guest?.name || "this guest"}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Bookings;