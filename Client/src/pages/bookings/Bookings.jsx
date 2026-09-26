import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
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
  createBooking,
  getAllBookings,
  updateBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  deleteBooking,
} from "../../api/bookingApi";
import { getAllGuests, createGuest } from "../../api/guestApi";
import { getAllRooms, getRoomAvailability } from "../../api/roomApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
};

const STATUS_BADGE = {
  pending: "bg-amber-500/10 text-amber-600 border-transparent",
  confirmed: "bg-sky-500/10 text-sky-600 border-transparent",
  "checked-in": "bg-emerald-500/10 text-emerald-600 border-transparent",
  "checked-out": "bg-slate-500/10 text-slate-600 border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

const ROOM_TYPE_LABELS = {
  single: "Single",
  double: "Double",
  suite: "Suite",
  deluxe: "Deluxe",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const nightCount = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0;
  const diff =
    new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
  return Math.max(0, Math.round(diff / 86400000));
};

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const buildBookingSchema = (isGuest) => {
  const schema = {
    guestName: Yup.string()
      .trim()
      .min(2, "Guest name must be at least 2 characters")
      .max(100, "Guest name cannot exceed 100 characters")
      .when("guest", {
        is: "__new",
        then: (s) => s.required("Guest name is required"),
      }),
    guestEmail: Yup.string()
      .trim()
      .transform((value, original) => (original === "" ? undefined : value))
      .email("Please provide a valid email address")
      .when("guest", {
        is: "__new",
        then: (s) => s,
      }),
    guestPhone: Yup.string()
      .trim()
      .transform((value, original) => (original === "" ? undefined : value))
      .matches(phoneRegex, "Please provide a valid phone number")
      .when("guest", {
        is: "__new",
        then: (s) => s,
      }),
    room: Yup.string().required("Room is required"),
    checkInDate: Yup.string()
      .required("Check-in date is required")
      .test("not-past", "Check-in date cannot be in the past", (value) =>
        Boolean(value && value >= todayStr()),
      ),
    checkOutDate: Yup.string()
      .required("Check-out date is required")
      .test(
        "after-check-in",
        "Check-out must be after check-in",
        function (value) {
          return Boolean(
            value && this.parent.checkInDate && value > this.parent.checkInDate,
          );
        },
      ),
    specialRequests: Yup.string()
      .trim()
      .max(1000, "Special requests cannot exceed 1000 characters"),
  };

  if (!isGuest) {
    schema.guest = Yup.string().required("Guest is required");
    schema.status = Yup.string()
      .oneOf(["pending", "confirmed"], "Invalid status")
      .required("Status is required");
  }

  return Yup.object(schema);
};

const Bookings = () => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [availability, setAvailability] = useState(null);

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const isGuest = roleName === "guest";
  const bookingsPerm = permissions?.modules?.bookings;
  const canCreate = isSuperAdmin || bookingsPerm?.create === true;
  const canUpdate = isSuperAdmin || bookingsPerm?.update === true;
  const canDelete = isSuperAdmin || bookingsPerm?.delete === true;
  const canManage = canUpdate && !isGuest;

  const loadBookings = async () => {
    const requests = [
      getAllBookings(),
      getAllRooms(),
      ...(!isGuest ? [getAllGuests()] : []),
    ];
    try {
      const results = await Promise.all(requests);
      setBookings(results[0]?.bookings || []);
      setRooms(results[1]?.rooms || []);
      if (!isGuest) {
        setGuests(results[2]?.guests || []);
      }
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

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      guest: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      room: "",
      checkInDate: "",
      checkOutDate: "",
      status: "pending",
      specialRequests: "",
    },
    validationSchema: buildBookingSchema(isGuest),
    onSubmit: async (values) => {
      try {
        setSaving(true);

        let guestId = values.guest;
        if (!isGuest) {
          if (guestId === "__new") {
            const match = findExistingGuest(values);
            if (match) {
              guestId = match._id;
            } else {
              const res = await createGuest({
                name: values.guestName.trim(),
                email: values.guestEmail?.trim() || undefined,
                phone: values.guestPhone?.trim() || undefined,
              });
              guestId = res?.guest?._id;
              if (guestId) {
                setGuests((prev) => [res.guest, ...prev].filter(Boolean));
              }
            }
            if (!guestId) {
              throw new Error("Could not assign a guest to this booking");
            }
          }
        }

        const selectedRoom = rooms.find((r) => r._id === values.room);
        const nightsCount = nightCount(values.checkInDate, values.checkOutDate);
        const totalAmount =
          nightsCount * Number(selectedRoom?.pricePerNight || 0);

        const payload = {
          room: values.room,
          checkInDate: values.checkInDate,
          checkOutDate: values.checkOutDate,
          totalAmount,
          specialRequests: values.specialRequests?.trim() || undefined,
        };

        if (isGuest) {
          payload.status = "pending";
        } else {
          payload.guest = guestId;
          payload.status = values.status;
        }

        const res = await createBooking(payload);

        setBookings((prev) => [res?.booking, ...prev].filter(Boolean));
        closeForm();
        showToast({ type: "success", message: "Booking created successfully" });
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Could not create booking",
        });
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    if (!formOpen) return;
    const checkIn = form.values.checkInDate;
    const checkOut = form.values.checkOutDate;
    if (!checkIn || !checkOut) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    getRoomAvailability(checkIn, checkOut)
      .then((res) => {
        if (cancelled) return;
        const map = {};
        (res?.rooms || []).forEach((room) => {
          map[room._id] = room;
        });
        setAvailability(map);
      })
      .catch(() => {
        if (!cancelled) setAvailability(null);
      });
    return () => {
      cancelled = true;
    };
  }, [formOpen, form.values.checkInDate, form.values.checkOutDate]);

  useEffect(() => {
    if (!formOpen || !availability) return;
    const roomId = form.values.room;
    if (!roomId) return;
    const room = rooms.find((r) => r._id === roomId);
    const dateBooked = availability[roomId]?.availability === "booked";
    const physicallyUnavailable = room
      ? ["occupied", "maintenance"].includes(room.status)
      : false;
    if (dateBooked || physicallyUnavailable) {
      form.setFieldValue("room", "");
    }
  }, [formOpen, availability, form.values.room, rooms]);

  const roomOptions = (rooms || []).map((room) => {
    const dateBooked = availability?.[room._id]?.availability === "booked";
    const physicallyUnavailable = ["occupied", "maintenance"].includes(
      room.status,
    );
    return {
      room,
      disabled: dateBooked || physicallyUnavailable,
      text: `${room.number} · ${ROOM_TYPE_LABELS[room.type]} — ${
        room.status
      }${dateBooked ? " · Booked for these dates" : ""}`,
    };
  });

  const findExistingGuest = (values) => {
    const email = values.guestEmail?.trim().toLowerCase();
    const phone = values.guestPhone?.trim();
    if (!email && !phone) return null;
    return (
      guests.find(
        (g) =>
          (email && g.email?.trim().toLowerCase() === email) ||
          (phone && g.phone?.trim() === phone),
      ) || null
    );
  };

  const existingMatch = findExistingGuest(form.values);

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

  const f = form;

  const selectedRoom = rooms.find((r) => r._id === f.values.room);
  const nightsCount = nightCount(f.values.checkInDate, f.values.checkOutDate);
  const totalAmount = nightsCount * Number(selectedRoom?.pricePerNight || 0);

  const bookingActions = (booking) => {
    const disabled = busyId === booking._id;
    const busyLabel = busyId === booking._id ? "Working…" : undefined;
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
          onClick={() => handleConfirm(booking)}
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
          onClick={() => handleCancel(booking)}
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
          onClick={() => handleCheckIn(booking)}
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
          onClick={() => handleCheckOut(booking)}
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
          onClick={() => setConfirmDelete(booking)}
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
                <TableRow key={booking._id} className="animate-fade-in-up">
                  <TableCell>
                    <Link
                      to={`/guests/${booking.guest?._id}`}
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

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        {formOpen && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>New booking</DialogTitle>
              <DialogDescription>
                {isGuest
                  ? "Book a room for your upcoming stay."
                  : "Pick an existing guest, or create one on the spot."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={f.handleSubmit}
              noValidate
              className="space-y-4"
              id="booking-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isGuest && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="f-guest">Guest</Label>
                    <Select
                      value={f.values.guest}
                      onValueChange={(value) => f.setFieldValue("guest", value)}
                      items={{
                        ...Object.fromEntries(
                          guests.map((guest) => [
                            guest._id,
                            `${guest.name}${guest.phone ? ` · ${guest.phone}` : ""}`,
                          ]),
                        ),
                        __new: "Create new guest…",
                      }}
                    >
                      <SelectTrigger id="f-guest" className="w-full">
                        <SelectValue placeholder="Select a guest or create one" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((guest) => (
                          <SelectItem
                            key={guest._id}
                            value={guest._id}
                            label={`${guest.name}${guest.phone ? ` · ${guest.phone}` : ""}`}
                          >
                            {guest.name}
                            {guest.phone ? ` · ${guest.phone}` : ""}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new" label="Create new guest…">
                          Create new guest…
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {f.submitCount > 0 && f.errors.guest && (
                      <p className={errorClass}>{f.errors.guest}</p>
                    )}
                  </div>
                )}

                {!isGuest && f.values.guest === "__new" && (
                  <>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="f-guestName">Guest name</Label>
                      <Input
                        id="f-guestName"
                        name="guestName"
                        value={f.values.guestName}
                        onChange={f.handleChange}
                        onBlur={f.handleBlur}
                        disabled={saving}
                        placeholder="John Smith"
                        aria-invalid={
                          f.submitCount > 0 && f.errors.guestName
                            ? true
                            : undefined
                        }
                        className={
                          f.submitCount > 0 && f.errors.guestName
                            ? "aria-invalid"
                            : ""
                        }
                      />
                      {f.submitCount > 0 && f.errors.guestName && (
                        <p className={errorClass}>{f.errors.guestName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="f-guestEmail">Email</Label>
                      <Input
                        id="f-guestEmail"
                        name="guestEmail"
                        type="email"
                        value={f.values.guestEmail}
                        onChange={f.handleChange}
                        onBlur={f.handleBlur}
                        disabled={saving}
                        placeholder="john@example.com"
                        aria-invalid={
                          f.submitCount > 0 && f.errors.guestEmail
                            ? true
                            : undefined
                        }
                        className={
                          f.submitCount > 0 && f.errors.guestEmail
                            ? "aria-invalid"
                            : ""
                        }
                      />
                      {f.submitCount > 0 && f.errors.guestEmail && (
                        <p className={errorClass}>{f.errors.guestEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="f-guestPhone">Phone</Label>
                      <Input
                        id="f-guestPhone"
                        name="guestPhone"
                        value={f.values.guestPhone}
                        onChange={f.handleChange}
                        onBlur={f.handleBlur}
                        disabled={saving}
                        placeholder="+1 555 123 4567"
                        aria-invalid={
                          f.submitCount > 0 && f.errors.guestPhone
                            ? true
                            : undefined
                        }
                        className={
                          f.submitCount > 0 && f.errors.guestPhone
                            ? "aria-invalid"
                            : ""
                        }
                      />
                      {f.submitCount > 0 && f.errors.guestPhone && (
                        <p className={errorClass}>{f.errors.guestPhone}</p>
                      )}
                    </div>

                    {existingMatch && (
                      <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          Existing guest found:{" "}
                          <span className="font-semibold text-foreground">
                            {existingMatch.name}
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            f.setFieldValue("guest", existingMatch._id);
                            f.setFieldValue("guestName", "");
                            f.setFieldValue("guestEmail", "");
                            f.setFieldValue("guestPhone", "");
                          }}
                        >
                          Attach existing
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-room">Room</Label>
<Select
                    value={f.values.room}
                    onValueChange={(value) => f.setFieldValue("room", value)}
                    items={Object.fromEntries(
                      roomOptions.map(({ room, text }) => [room._id, text])
                    )}
                  >
                    <SelectTrigger id="f-room" className="w-full">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map(({ room, text, disabled }) => (
                        <SelectItem
                          key={room._id}
                          value={room._id}
                          disabled={disabled}
                        >
                          {text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {f.submitCount > 0 && f.errors.room && (
                    <p className={errorClass}>{f.errors.room}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-checkInDate">Check-in</Label>
                  <Input
                    id="f-checkInDate"
                    name="checkInDate"
                    type="date"
                    min={todayStr()}
                    value={f.values.checkInDate}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    aria-invalid={
                      f.submitCount > 0 && f.errors.checkInDate
                        ? true
                        : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.checkInDate
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.checkInDate && (
                    <p className={errorClass}>{f.errors.checkInDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-checkOutDate">Check-out</Label>
                  <Input
                    id="f-checkOutDate"
                    name="checkOutDate"
                    type="date"
                    min={f.values.checkInDate || todayStr()}
                    value={f.values.checkOutDate}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    aria-invalid={
                      f.submitCount > 0 && f.errors.checkOutDate
                        ? true
                        : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.checkOutDate
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.checkOutDate && (
                    <p className={errorClass}>{f.errors.checkOutDate}</p>
                  )}
                </div>

                {!isGuest && (
                  <div className="space-y-2">
                    <Label htmlFor="f-status">Status</Label>
                    <Select
                      value={f.values.status}
                      onValueChange={(value) =>
                        f.setFieldValue("status", value)
                      }
                      items={{ pending: "Pending", confirmed: "Confirmed" }}
                    >
                      <SelectTrigger id="f-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Price preview</Label>
                  {selectedRoom && nightsCount > 0 ? (
                    <div className="rounded-lg border border-border px-3 py-2 text-sm">
                      {nightsCount} night{nightsCount > 1 ? "s" : ""} × $
                      {Number(selectedRoom.pricePerNight).toLocaleString()} ={" "}
                      <span className="font-semibold text-foreground">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                      Pick a room and dates to see the total
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-specialRequests">Special requests</Label>
                  <Textarea
                    id="f-specialRequests"
                    name="specialRequests"
                    value={f.values.specialRequests}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="Optional notes for the stay"
                  />
                  {f.submitCount > 0 && f.errors.specialRequests && (
                    <p className={errorClass}>{f.errors.specialRequests}</p>
                  )}
                </div>
              </div>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" form="booking-form" disabled={saving}>
                {saving ? "Creating…" : "Create booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

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
