import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../api/roomApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

const quickSchema = Yup.object({
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
});

const editSchema = Yup.object({
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

const Rooms = () => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editing, setEditing] = useState(null);
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

  const quickForm = useFormik({
    initialValues: {
      number: "",
      type: "single",
      floor: "",
      pricePerNight: "",
    },
    validationSchema: quickSchema,
    onSubmit: async (values) => {
      try {
        const res = await createRoom({
          number: values.number,
          type: values.type,
          floor: values.floor === "" ? undefined : Number(values.floor),
          pricePerNight: Number(values.pricePerNight),
        });
        setRooms((prev) => [res?.room, ...prev].filter(Boolean));
        quickForm.resetForm();
        showToast({ type: "success", message: "Room added successfully" });
      } catch (err) {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not add room",
        });
      }
    },
  });

  const editForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      number: editing?.number || "",
      type: editing?.type || "single",
      floor: editing?.floor != null ? String(editing.floor) : "",
      pricePerNight: editing?.pricePerNight ?? "",
      status: editing?.status || "available",
      amenities: editing?.amenities?.join(", ") || "",
      description: editing?.description || "",
    },
    validationSchema: editSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const res = await updateRoom(editing._id, {
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
        setRooms((prev) =>
          prev.map((room) => (room._id === editing._id ? res?.room : room)),
        );
        setEditing(null);
        showToast({ type: "success", message: "Room updated successfully" });
      } catch (err) {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not update room",
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

  const q = quickForm;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl text-foreground">Rooms</h1>
        <p className="text-sm text-muted-foreground">
          Manage your hotel&apos;s rooms, prices and availability.
        </p>
      </div>

      {canCreate && (
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-primary" />
              Add a room
            </CardTitle>
            <CardDescription>
              Create a room and it appears in the grid right away.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={quickForm.handleSubmit}
              noValidate
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="q-number">Room number</Label>
                <Input
                  id="q-number"
                  name="number"
                  value={q.values.number}
                  onChange={q.handleChange}
                  onBlur={q.handleBlur}
                  placeholder="101"
                  disabled={q.isSubmitting}
                  aria-invalid={
                    q.submitCount > 0 && q.errors.number ? true : undefined
                  }
                  className={
                    q.submitCount > 0 && q.errors.number ? "aria-invalid" : ""
                  }
                />
                {q.submitCount > 0 && q.errors.number && (
                  <p className={errorClass}>{q.errors.number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-type">Type</Label>
                <Select
                  value={q.values.type}
                  onValueChange={(value) => q.setFieldValue("type", value)}
                >
                  <SelectTrigger id="q-type" className="w-full">
                    <SelectValue placeholder="Room type" />
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
                <Label htmlFor="q-floor">Floor</Label>
                <Input
                  id="q-floor"
                  name="floor"
                  type="number"
                  min="0"
                  max="200"
                  value={q.values.floor}
                  onChange={q.handleChange}
                  onBlur={q.handleBlur}
                  placeholder="1"
                  disabled={q.isSubmitting}
                  aria-invalid={
                    q.submitCount > 0 && q.errors.floor ? true : undefined
                  }
                  className={
                    q.submitCount > 0 && q.errors.floor ? "aria-invalid" : ""
                  }
                />
                {q.submitCount > 0 && q.errors.floor && (
                  <p className={errorClass}>{q.errors.floor}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-price">Price / night</Label>
                <Input
                  id="q-price"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={q.values.pricePerNight}
                  onChange={q.handleChange}
                  onBlur={q.handleBlur}
                  placeholder="120"
                  disabled={q.isSubmitting}
                  aria-invalid={
                    q.submitCount > 0 && q.errors.pricePerNight
                      ? true
                      : undefined
                  }
                  className={
                    q.submitCount > 0 && q.errors.pricePerNight
                      ? "aria-invalid"
                      : ""
                  }
                />
                {q.submitCount > 0 && q.errors.pricePerNight && (
                  <p className={errorClass}>{q.errors.pricePerNight}</p>
                )}
              </div>

              <Button
                type="submit"
                className="uppercase tracking-wider"
                disabled={q.isSubmitting}
              >
                <Plus className="w-4 h-4" />
                {q.isSubmitting ? "Adding…" : "Add room"}
              </Button>
            </form>
          </CardContent>
        </Card>
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
                  colSpan={canUpdate || canDelete ? 6 : 5}
                  className="py-14 text-center"
                >
                  <BedDouble className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No rooms here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Add your first room using the form above."
                      : `No rooms with status "${activeFilter}" right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleRooms.map((room) => (
                <TableRow key={room._id} className="animate-fade-in-up">
                  <TableCell className="font-semibold text-foreground">
                    {room.number}
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
                            onClick={() => setEditing(room)}
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
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit room {editing.number}</DialogTitle>
              <DialogDescription>
                Update the room details below.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={editForm.handleSubmit}
              noValidate
              className="space-y-4"
              id="edit-room-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-number">Room number</Label>
                  <Input
                    id="e-number"
                    name="number"
                    value={editForm.values.number}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                    disabled={saving}
                    aria-invalid={
                      editForm.submitCount > 0 && editForm.errors.number
                        ? true
                        : undefined
                    }
                    className={
                      editForm.submitCount > 0 && editForm.errors.number
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {editForm.submitCount > 0 && editForm.errors.number && (
                    <p className={errorClass}>{editForm.errors.number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e-type">Type</Label>
                  <Select
                    value={editForm.values.type}
                    onValueChange={(value) =>
                      editForm.setFieldValue("type", value)
                    }
                  >
                    <SelectTrigger id="e-type" className="w-full">
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
                  <Label htmlFor="e-status">Status</Label>
                  <Select
                    value={editForm.values.status}
                    onValueChange={(value) =>
                      editForm.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger id="e-status" className="w-full">
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
                  <Label htmlFor="e-price">Price / night</Label>
                  <Input
                    id="e-price"
                    name="pricePerNight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.values.pricePerNight}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                    disabled={saving}
                    aria-invalid={
                      editForm.submitCount > 0 && editForm.errors.pricePerNight
                        ? true
                        : undefined
                    }
                    className={
                      editForm.submitCount > 0 && editForm.errors.pricePerNight
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {editForm.submitCount > 0 &&
                    editForm.errors.pricePerNight && (
                      <p className={errorClass}>
                        {editForm.errors.pricePerNight}
                      </p>
                    )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="e-description">Description</Label>
                  <Input
                    id="e-description"
                    name="description"
                    value={editForm.values.description}
                    onChange={editForm.handleChange}
                    disabled={saving}
                    placeholder="Optional room description"
                  />
                </div>
              </div>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" form="edit-room-form" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
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
