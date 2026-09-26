import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Pencil, Trash2, UserRound } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  createGuest,
  getAllGuests,
  updateGuest,
  deleteGuest,
} from "../../api/guestApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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

const ID_TYPES = ["passport", "national-id", "drivers-license"];

const ID_TYPE_LABELS = {
  passport: "Passport",
  "national-id": "National ID",
  "drivers-license": "Driver's License",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const guestSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Guest name must be at least 2 characters")
    .max(100, "Guest name cannot exceed 100 characters")
    .required("Guest name is required"),
  email: Yup.string()
    .trim()
    .transform((value, original) => (original === "" ? undefined : value))
    .email("Please provide a valid email address"),
  phone: Yup.string()
    .trim()
    .transform((value, original) => (original === "" ? undefined : value))
    .matches(phoneRegex, "Please provide a valid phone number"),
  idType: Yup.string().oneOf(ID_TYPES, "Invalid ID type"),
  idNumber: Yup.string()
    .trim()
    .max(50, "ID number cannot exceed 50 characters")
    .when("idType", {
      is: (value) => Boolean(value),
      then: (schema) => schema.required("ID number is required"),
    }),
  nationality: Yup.string()
    .trim()
    .max(100, "Nationality cannot exceed 100 characters"),
  address: Yup.string().trim().max(500, "Address cannot exceed 500 characters"),
});

const buildPayload = (values) => ({
  name: values.name.trim(),
  email: values.email?.trim() || undefined,
  phone: values.phone?.trim() || undefined,
  idType: values.idType || undefined,
  idNumber: values.idNumber?.trim() || undefined,
  nationality: values.nationality?.trim() || undefined,
  address: values.address?.trim() || undefined,
});

const Guests = () => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);
  const navigate = useNavigate();

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const guestsPerm = permissions?.modules?.guests;
  const canCreate = isSuperAdmin || guestsPerm?.create === true;
  const canUpdate = isSuperAdmin || guestsPerm?.update === true;
  const canDelete = isSuperAdmin || guestsPerm?.delete === true;

  const loadGuests = async () => {
    try {
      const res = await getAllGuests();
      setGuests(res?.guests || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const isCreate = formTarget === "new";
  const targetGuest = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (guest) => setFormTarget(guest);
  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: targetGuest?.name || "",
      email: targetGuest?.email || "",
      phone: targetGuest?.phone || "",
      idType: targetGuest?.idType || "",
      idNumber: targetGuest?.idNumber || "",
      nationality: targetGuest?.nationality || "",
      address: targetGuest?.address || "",
    },
    validationSchema: guestSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = buildPayload(values);
        if (isCreate) {
          const res = await createGuest(payload);
          setGuests((prev) => [res?.guest, ...prev].filter(Boolean));
          setFormTarget(null);
          showToast({ type: "success", message: "Guest added successfully" });
        } else {
          const res = await updateGuest(targetGuest._id, payload);
          setGuests((prev) =>
            prev.map((guest) =>
              guest._id === targetGuest._id ? res?.guest : guest,
            ),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Guest updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not add guest" : "Could not update guest"),
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
      await deleteGuest(confirmDelete._id);
      setGuests((prev) =>
        prev.filter((guest) => guest._id !== confirmDelete._id),
      );
      setConfirmDelete(null);
      showToast({ type: "success", message: "Guest deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete guest",
      });
    } finally {
      setDeleting(false);
    }
  };

  const f = form;
  const editingLabel = isCreate
    ? "Add guest"
    : `Edit ${targetGuest?.name || "guest"}`;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Guests</h1>
          <p className="text-sm text-muted-foreground">
            Manage the people staying at your hotel.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add guest
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Nationality</TableHead>
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
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : guests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 6 : 5}
                  className="py-14 text-center"
                >
                  <UserRound className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No guests yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first guest using the Add guest button.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow
                  key={guest._id}
                  className="cursor-pointer animate-fade-in-up transition-colors hover:bg-muted/40"
                  onClick={() => navigate(`/guests/${guest._id}`)}
                >
                  <TableCell className="font-semibold">
                    <Link
                      to={`/guests/${guest._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {guest.name}
                    </Link>
                  </TableCell>
                  <TableCell>{guest.email || "—"}</TableCell>
                  <TableCell>{guest.phone || "—"}</TableCell>
                  <TableCell>
                    {guest.idNumber
                      ? `${ID_TYPE_LABELS[guest.idType] || guest.idType} · ${guest.idNumber}`
                      : "—"}
                  </TableCell>
                  <TableCell>{guest.nationality || "—"}</TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(guest);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(guest);
                            }}
                            aria-label={`Delete guest ${guest.name}`}
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
                  ? "Fill in the details to add a new guest."
                  : "Update the guest details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="guest-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-name">Full name</Label>
                  <Input
                    id="f-name"
                    name="name"
                    value={f.values.name}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="John Smith"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.name ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.name ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.name && (
                    <p className={errorClass}>{f.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-email">Email</Label>
                  <Input
                    id="f-email"
                    name="email"
                    type="email"
                    value={f.values.email}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="john@example.com"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.email ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.email ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.email && (
                    <p className={errorClass}>{f.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-phone">Phone</Label>
                  <Input
                    id="f-phone"
                    name="phone"
                    value={f.values.phone}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="+1 555 123 4567"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.phone ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.phone ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.phone && (
                    <p className={errorClass}>{f.errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-idType">ID type</Label>
                  <Select
                    value={f.values.idType}
                    onValueChange={(value) => f.setFieldValue("idType", value)}
                  >
                    <SelectTrigger id="f-idType" className="w-full">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ID_TYPES.map((idType) => (
                        <SelectItem key={idType} value={idType}>
                          {ID_TYPE_LABELS[idType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-idNumber">ID number</Label>
                  <Input
                    id="f-idNumber"
                    name="idNumber"
                    value={f.values.idNumber}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="P1234567"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.idNumber ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.idNumber
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.idNumber && (
                    <p className={errorClass}>{f.errors.idNumber}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-nationality">Nationality</Label>
                  <Input
                    id="f-nationality"
                    name="nationality"
                    value={f.values.nationality}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="United States"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-address">Address</Label>
                  <Input
                    id="f-address"
                    name="address"
                    value={f.values.address}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="Optional home address"
                  />
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
              <Button type="submit" form="guest-form" disabled={saving}>
                {saving ? "Saving…" : isCreate ? "Add guest" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete guest"
        message={`Are you sure you want to delete ${confirmDelete?.name}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Guests;
