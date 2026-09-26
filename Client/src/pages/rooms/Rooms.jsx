import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  BedDouble,
  ImagePlus,
  DoorOpen,
  Home,
  Sparkles,
  Wrench,
  CalendarClock,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../api/roomApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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

const ROOM_TYPES = ["single", "double", "suite", "deluxe"];
const ROOM_STATUSES = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
  "reserved",
];
const FILTERS = ["all", ...ROOM_STATUSES];

const roomTypeLabel = {
  single: "Single Room",
  double: "Double Room",
  suite: "Suite",
  deluxe: "Deluxe Suite",
};

const STATUS_STYLES = {
  available: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  occupied: "text-violet-600 bg-violet-500/10 border-violet-500/30",
  cleaning: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  maintenance: "text-red-600 bg-red-500/10 border-red-500/30",
  reserved: "text-sky-600 bg-sky-500/10 border-sky-500/30",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const roomSchema = Yup.object({
  number: Yup.string()
    .trim()
    .max(20, "Room number cannot exceed 20 characters")
    .required("Room number is required"),
  type: Yup.string().required("Room type is required"),
  floor: Yup.number()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .min(0, "Floor cannot be negative")
    .max(200, "Floor cannot exceed 200"),
  pricePerNight: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  status: Yup.string().required("Status is required"),
});

const RoomStatCard = ({ stat, delay }) => {
  const { label, value, Icon } = stat;

  return (
    <Card
      className={`transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/40 animate-fade-in-up animate-delay-${delay}`}
    >
      <CardContent className="py-3 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold leading-none tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const buildPayload = (values) => ({
  number: values.number,
  type: values.type,
  floor: values.floor === "" ? undefined : Number(values.floor),
  pricePerNight: Number(values.pricePerNight),
  status: values.status,
  amenities: values.amenities
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean),
  description: values.description.trim() || undefined,
});

const Rooms = () => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const roomsPerm = permissions?.modules?.rooms;
  const canCreate = isSuperAdmin || roomsPerm?.create === true;
  const canUpdate = isSuperAdmin || roomsPerm?.update === true;
  const canDelete = isSuperAdmin || roomsPerm?.delete === true;

  const loadRooms = async () => {
    try {
      const res = await getAllRooms();
      setRooms(res?.rooms || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const isCreate = formTarget === "new";
  const targetRoom = isCreate ? null : formTarget;

  const openCreate = () => {
    setImageFiles([]);
    setFormTarget("new");
  };

  const openEdit = (room) => {
    setImageFiles([]);
    setFormTarget(room);
  };

  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      number: targetRoom?.number || "",
      type: targetRoom?.type || "single",
      floor: targetRoom?.floor != null ? String(targetRoom.floor) : "",
      pricePerNight: targetRoom?.pricePerNight ?? "",
      status: targetRoom?.status || "available",
      amenities: targetRoom?.amenities?.join(", ") || "",
      description: targetRoom?.description || "",
    },
    validationSchema: roomSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = buildPayload(values);
        if (isCreate) {
          const res = await createRoom(payload);
          setRooms((prev) => [res?.room, ...prev].filter(Boolean));
          setFormTarget(null);
          showToast({ type: "success", message: "Room added successfully" });
        } else {
          const res = await updateRoom(targetRoom._id, payload);
          setRooms((prev) =>
            prev.map((room) => (room._id === targetRoom._id ? res?.room : room)),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Room updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not add room" : "Could not update room"),
        });
      } finally {
        setSaving(false);
      }
    },
  });

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteRoom(confirmDelete._id);
      setRooms((prev) => prev.filter((room) => room._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "Room deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete room",
      });
    } finally {
      setDeleting(false);
    }
  };

  const visibleRooms =
    activeFilter === "all"
      ? rooms
      : rooms.filter((room) => room.status === activeFilter);

  const roomCount = (status) =>
    rooms.filter((room) => room.status === status).length;

  const roomStats = [
    {
      label: "Total Rooms",
      value: rooms.length,
      hint: "All rooms registered",
      Icon: BedDouble,
    },
    {
      label: "Available",
      value: roomCount("available"),
      hint: "Ready to book",
      Icon: DoorOpen,
    },
    {
      label: "Occupied",
      value: roomCount("occupied"),
      hint: "Guests in house",
      Icon: Home,
    },
    {
      label: "Cleaning",
      value: roomCount("cleaning"),
      hint: "Being serviced",
      Icon: Sparkles,
    },
    {
      label: "Maintenance",
      value: roomCount("maintenance"),
      hint: "Needs repair",
      Icon: Wrench,
    },
    {
      label: "Reserved",
      value: roomCount("reserved"),
      hint: "Pre-booked",
      Icon: CalendarClock,
    },
  ];

  const f = form;
  const editingLabel = isCreate ? "Add room" : `Edit room ${targetRoom?.number}`;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage your hotel&apos;s rooms, prices and availability.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add room
          </Button>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {roomStats.map((stat, index) => (
            <RoomStatCard
              key={stat.label}
              stat={stat}
              delay={(index + 1) * 100}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
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
              <TableHead>Room No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Price / night</TableHead>
              <TableHead>Status</TableHead>
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
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : visibleRooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 7 : 6}
                  className="py-14 text-center"
                >
                  <BedDouble className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No rooms here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Add your first room using the Add room button."
                      : `No rooms with status "${activeFilter}" right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleRooms.map((room) => (
                <TableRow key={room._id} className="animate-fade-in-up">
                  <TableCell className="font-semibold">
                    <Link
                      to={`/rooms/${room._id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {room.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {room.images?.[0] ? (
                      <img
                        src={room.images[0]}
                        alt={`Room ${room.number}`}
                        className="h-10 w-14 rounded object-cover bg-muted"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{roomTypeLabel[room.type] || room.type}</TableCell>
                  <TableCell>{room.floor ?? "—"}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ${room.pricePerNight}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_STYLES[room.status] || ""}`}
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(room)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(room)}
                            aria-label={`Delete room ${room.number}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && closeForm()}
      >
        {formTarget !== null && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLabel}</DialogTitle>
              <DialogDescription>
                {isCreate
                  ? "Fill in the details to add a new room."
                  : "Update the room details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="room-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="f-number">Room number</Label>
                  <Input
                    id="f-number"
                    name="number"
                    value={f.values.number}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="101"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.number ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.number ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.number && (
                    <p className={errorClass}>{f.errors.number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-type">Type</Label>
                  <Select
                    value={f.values.type}
                    onValueChange={(value) => f.setFieldValue("type", value)}
                    items={Object.fromEntries(
                      ROOM_TYPES.map((type) => [type, roomTypeLabel[type]])
                    )}
                  >
                    <SelectTrigger id="f-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {roomTypeLabel[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-status">Status</Label>
                  <Select
                    value={f.values.status}
                    onValueChange={(value) => f.setFieldValue("status", value)}
                    items={Object.fromEntries(
                      ROOM_STATUSES.map((status) => [
                        status,
                        status.charAt(0).toUpperCase() + status.slice(1),
                      ])
                    )}
                  >
                    <SelectTrigger id="f-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-floor">Floor</Label>
                  <Input
                    id="f-floor"
                    name="floor"
                    type="number"
                    min="0"
                    max="200"
                    value={f.values.floor}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="1"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.floor ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.floor ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.floor && (
                    <p className={errorClass}>{f.errors.floor}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-price">Price / night</Label>
                  <Input
                    id="f-price"
                    name="pricePerNight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.values.pricePerNight}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="120"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.pricePerNight
                        ? true
                        : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.pricePerNight
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.pricePerNight && (
                    <p className={errorClass}>{f.errors.pricePerNight}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-amenities">Amenities (comma separated)</Label>
                  <Input
                    id="f-amenities"
                    name="amenities"
                    value={f.values.amenities}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="Wi-Fi, TV, Mini bar"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-description">Description</Label>
                  <Input
                    id="f-description"
                    name="description"
                    value={f.values.description}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="Optional room description"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-images">Room images</Label>
                  <input
                    ref={fileInputRef}
                    id="f-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      setImageFiles(Array.from(e.target.files || []));
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                  >
                    <ImagePlus className="w-4 h-4" />
                    {imageFiles.length > 0
                      ? `${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""} selected`
                      : "Choose images"}
                  </Button>
                  {imageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-2 rounded-lg border border-border p-2"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-14 w-14 rounded object-cover bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="max-w-40 truncate text-xs font-medium text-foreground">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
              <Button type="submit" form="room-form" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Add room"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete room"
        message={`Are you sure you want to delete room ${confirmDelete?.number}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Rooms;