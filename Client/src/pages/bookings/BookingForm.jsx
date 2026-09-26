import { useEffect, useState } from "react";
import { useFormik } from "formik";
import useAuth from "../../hooks/useAuth.js";
import { createBooking } from "../../api/bookingApi";
import { getAllGuests, createGuest } from "../../api/guestApi";
import { getRoomAvailability } from "../../api/roomApi";
import { showToast } from "../../components/common/Toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import {
  EMPTY_FORM_VALUES,
  ROOM_TYPE_LABELS,
  buildBookingSchema,
  errorClass,
  nightCount,
  todayStr,
} from "./bookingUtils.js";

const BookingForm = ({
  open,
  onOpenChange,
  rooms = [],
  initialRoomId = "",
  onCreated,
}) => {
  const { user } = useAuth();
  const roleName = user?.role?.name;
  const isGuest = roleName === "guest";

  const [saving, setSaving] = useState(false);
  const [guests, setGuests] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [lockedRoom, setLockedRoom] = useState(Boolean(initialRoomId));

  useEffect(() => {
    if (!open) return;
    if (isGuest) {
      setGuests([]);
      return;
    }
    let active = true;
    getAllGuests()
      .then((res) => active && setGuests(res?.guests || []))
      .catch(() => active && setGuests([]));
    return () => {
      active = false;
    };
  }, [open, isGuest]);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: { ...EMPTY_FORM_VALUES, room: initialRoomId || "" },
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
          guestsCount: Number(values.guestsCount) || 1,
        };

        if (isGuest) {
          payload.status = "pending";
        } else {
          payload.guest = guestId;
          payload.status = values.status;
        }

        const res = await createBooking(payload);

        onCreated?.(res?.booking);
        onOpenChange(false);
        showToast({
          type: "success",
          message: "Booking created successfully",
        });
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
    if (open) {
      form.setValues({ ...EMPTY_FORM_VALUES, room: initialRoomId || "" });
      setLockedRoom(Boolean(initialRoomId));
    }
  }, [open, initialRoomId]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, form.values.checkInDate, form.values.checkOutDate]);

  useEffect(() => {
    if (!open || !availability) return;
    const roomId = form.values.room;
    if (!roomId) return;
    const room = rooms.find((r) => r._id === roomId);
    const dateBooked = availability[roomId]?.availability === "booked";
    const physicallyUnavailable = room
      ? ["occupied", "maintenance"].includes(room.status)
      : false;
    if (dateBooked || physicallyUnavailable) {
      form.setFieldValue("room", "");
      setLockedRoom(false);
    }
  }, [open, availability, form.values.room, rooms]);

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

  const f = form;

  const selectedRoom = rooms.find((r) => r._id === f.values.room);
  const nightsCount = nightCount(f.values.checkInDate, f.values.checkOutDate);
  const totalAmount = nightsCount * Number(selectedRoom?.pricePerNight || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      f.submitCount > 0 && f.errors.guestName ? true : undefined
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
                      f.submitCount > 0 && f.errors.guestEmail ? true : undefined
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
                      f.submitCount > 0 && f.errors.guestPhone ? true : undefined
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
              {lockedRoom && selectedRoom ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      Room {selectedRoom.number} ·{" "}
                      {ROOM_TYPE_LABELS[selectedRoom.type] ||
                        selectedRoom.type}
                    </span>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      ${Number(selectedRoom.pricePerNight).toLocaleString()} /
                      night
                      {selectedRoom.floor !== undefined &&
                        ` · Floor ${selectedRoom.floor}`}
                      {selectedRoom.amenities?.length > 0 &&
                        ` · ${selectedRoom.amenities.join(", ")}`}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setLockedRoom(false)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
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
              )}
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
                  f.submitCount > 0 && f.errors.checkInDate ? true : undefined
                }
                className={
                  f.submitCount > 0 && f.errors.checkInDate ? "aria-invalid" : ""
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
                  f.submitCount > 0 && f.errors.checkOutDate ? true : undefined
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
              <Label htmlFor="f-guestsCount">Number of guests</Label>
              <Input
                id="f-guestsCount"
                name="guestsCount"
                type="number"
                min={1}
                max={20}
                value={f.values.guestsCount}
                onChange={f.handleChange}
                onBlur={f.handleBlur}
                disabled={saving}
                placeholder="2"
                aria-invalid={
                  f.submitCount > 0 && f.errors.guestsCount ? true : undefined
                }
                className={
                  f.submitCount > 0 && f.errors.guestsCount
                    ? "aria-invalid"
                    : ""
                }
              />
              {f.submitCount > 0 && f.errors.guestsCount && (
                <p className={errorClass}>{f.errors.guestsCount}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" form="booking-form" disabled={saving}>
            {saving ? "Creating…" : "Create booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;