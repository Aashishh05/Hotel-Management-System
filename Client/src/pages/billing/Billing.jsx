import { useEffect, useState } from "react";
import { useFormik, FieldArray } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  ReceiptText,
  Banknote,
  Timer,
  Wallet,
  CalendarDays,
  PlusCircle,
} from "lucide-react";
import {
  getAllBillings,
  createBilling,
  updateBilling,
  deleteBilling,
} from "../../api/billingApi";
import { getAllBookings } from "../../api/bookingApi";
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

const STATUSES = ["unpaid", "partial", "paid"];
const FILTERS = ["all", ...STATUSES];

const STATUS_STYLES = {
  unpaid: "text-red-600 bg-red-500/10 border-red-500/30",
  partial: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  paid: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const money = (n = 0) => `$${Number(n || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const bookingLabel = (booking) =>
  booking && typeof booking === "object"
    ? `Room ${booking.room?.number ?? "—"} · ${formatDate(booking.checkInDate)}`
    : "Unknown booking";

const itemSchema = Yup.object({
  description: Yup.string()
    .trim()
    .min(3, "Too short")
    .max(200, "Max 200 characters")
    .required("Description required"),
  amount: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Amount required"),
  quantity: Yup.number()
    .typeError("Must be a number")
    .min(1, "At least 1")
    .required("Quantity required"),
});

const billingSchema = Yup.object({
  booking: Yup.string().required("Booking is required"),
  guest: Yup.string().required("Guest is required"),
  items: Yup.array()
    .of(itemSchema)
    .min(1, "Add at least one item"),
  paidAmount: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Paid amount required"),
  dueDate: Yup.string().nullable(),
});

const StatCard = ({ label, value, hint, Icon }) => (
  <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/40">
    <CardContent className="py-3 flex items-center gap-3">
      <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-none tracking-tight">
          {value}
        </p>
        <p className="truncate text-[11px] text-muted-foreground/70">{hint}</p>
      </div>
    </CardContent>
  </Card>
);

const Billing = () => {
  const { permissions } = useSelector((state) => state.permission);

  const [billings, setBillings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const billingPerm = permissions?.modules?.billing;
  const canCreate = billingPerm?.create === true;
  const canUpdate = billingPerm?.update === true;
  const canDelete = billingPerm?.delete === true;

  const loadBillings = async () => {
    try {
      const res = await getAllBillings();
      setBillings(res?.billings || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load billings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillings();
    getAllBookings()
      .then((res) => setBookings(res?.bookings || []))
      .catch(() => {});
  }, []);

  const isCreate = formTarget === "new";
  const targetBilling = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (billing) => setFormTarget(billing);
  const closeForm = () => setFormTarget(null);

  const billedBookingIds = new Set(
    billings.map((b) => b.booking?._id).filter(Boolean),
  );
  const availableBookings = bookings.filter(
    (b) => !billedBookingIds.has(b._id),
  );

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      booking: targetBilling?.booking?._id || "",
      guest: targetBilling?.guest?._id || "",
      items: targetBilling?.items?.length
        ? targetBilling.items.map((item) => ({
            description: item.description,
            amount: item.amount,
            quantity: item.quantity,
          }))
        : [{ description: "", amount: "", quantity: 1 }],
      paidAmount:
        targetBilling?.paidAmount != null ? targetBilling.paidAmount : "0",
      dueDate: targetBilling?.dueDate
        ? new Date(targetBilling.dueDate).toISOString().slice(0, 10)
        : "",
    },
    validationSchema: billingSchema,
    onSubmit: async (values) => {
      const items = values.items
        .map((item) => ({
          description: item.description.trim(),
          amount: Number(item.amount),
          quantity: Number(item.quantity),
        }))
        .filter(
          (item) =>
            item.description &&
            Number.isFinite(item.amount) &&
            item.amount >= 0 &&
            Number.isFinite(item.quantity) &&
            item.quantity >= 1,
        );

      if (!items.length) {
        showToast({ type: "error", message: "Add at least one item" });
        return;
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + item.amount * item.quantity,
        0,
      );
      const paidAmount = Number(values.paidAmount || 0);

      if (paidAmount > totalAmount) {
        showToast({
          type: "error",
          message: "Paid amount cannot exceed total amount",
        });
        return;
      }

      try {
        setSaving(true);
        if (isCreate) {
          const res = await createBilling({
            booking: values.booking,
            guest: values.guest,
            items,
            paidAmount,
            dueDate: values.dueDate || undefined,
          });
          setBillings((prev) => [res?.billing, ...prev].filter(Boolean));
          setFormTarget(null);
          showToast({ type: "success", message: "Billing created successfully" });
        } else {
          const res = await updateBilling(targetBilling._id, {
            items,
            paidAmount,
            dueDate: values.dueDate || undefined,
          });
          setBillings((prev) =>
            prev.map((b) => (b._id === targetBilling._id ? res?.billing : b)),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Billing updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not create billing" : "Could not update billing"),
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
      await deleteBilling(confirmDelete._id);
      setBillings((prev) =>
        prev.filter((b) => b._id !== confirmDelete._id),
      );
      setConfirmDelete(null);
      showToast({ type: "success", message: "Billing deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete billing",
      });
    } finally {
      setDeleting(false);
    }
  };

  const visibleBillings =
    activeFilter === "all"
      ? billings
      : billings.filter((b) => b.status === activeFilter);

  const totalBilled = billings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCollected = billings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const outstanding = totalBilled - totalCollected;

  const stats = [
    {
      label: "Total Billed",
      value: money(totalBilled),
      hint: `${billings.length} invoice${billings.length === 1 ? "" : "s"}`,
      Icon: ReceiptText,
    },
    {
      label: "Collected",
      value: money(totalCollected),
      hint: "Amount received",
      Icon: Banknote,
    },
    {
      label: "Outstanding",
      value: money(outstanding),
      hint: "Still to collect",
      Icon: Timer,
    },
    {
      label: "Unpaid",
      value: billings.filter((b) => b.status === "unpaid").length,
      hint: "Awaiting payment",
      Icon: Wallet,
    },
  ];

  const selectedBooking = bookings.find(
    (b) => b._id === form.values.booking,
  );
  const computedTotal = (form.values.items || []).reduce(
    (sum, item) =>
      sum + (Number(item.amount) || 0) * (Number(item.quantity) || 0),
    0,
  );

  const f = form;
  const editingLabel = isCreate ? "Create billing" : "Edit billing";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices for guest bookings.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Create billing
          </Button>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              Icon={stat.Icon}
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
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in-up animate-delay-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
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
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : visibleBillings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 8 : 7}
                  className="py-14 text-center"
                >
                  <ReceiptText className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No billings here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Create your first invoice with the Create billing button."
                      : `No bills with status "${activeFilter}" right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleBillings.map((billing) => (
                <TableRow key={billing._id} className="animate-fade-in-up">
                  <TableCell>
                    {billing.booking?._id ? (
                      <Link
                        to={`/bookings/${billing.booking._id}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {bookingLabel(billing.booking)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {billing.guest?._id ? (
                      <Link
                        to={`/guests/${billing.guest._id}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {billing.guest.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{billing.items?.length ?? 0}</TableCell>
                  <TableCell className="font-medium">
                    {money(billing.totalAmount)}
                  </TableCell>
                  <TableCell>{money(billing.paidAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_STYLES[billing.status] || ""}`}
                    >
                      {billing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDate(billing.dueDate)}
                    </span>
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(billing)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        )}
                        {canDelete && billing.paidAmount === 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(billing)}
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
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingLabel}</DialogTitle>
              <DialogDescription>
                {isCreate
                  ? "Choose a booking and add the billed items."
                  : "Update the invoice items and payment below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="billing-form"
            >
              <div className="space-y-2">
                <Label htmlFor="b-booking">Booking</Label>
                {isCreate ? (
                  <Select
                    value={f.values.booking}
                    onValueChange={(value) => {
                      f.setFieldValue("booking", value);
                      const booking = bookings.find((b) => b._id === value);
                      f.setFieldValue("guest", booking?.guest?._id || "");
                    }}
                  >
                    <SelectTrigger id="b-booking" className="w-full">
                      <SelectValue>
                        {selectedBooking
                          ? bookingLabel(selectedBooking)
                          : "Select a booking"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableBookings.length === 0 && (
                        <SelectItem value="" disabled>
                          No billable bookings
                        </SelectItem>
                      )}
                      {availableBookings.map((booking) => (
                        <SelectItem key={booking._id} value={booking._id}>
                          {bookingLabel(booking)} · {booking.guest?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="b-booking"
                    value={bookingLabel(targetBilling?.booking)}
                    readOnly
                    disabled
                  />
                )}
                {f.submitCount > 0 && f.errors.booking && (
                  <p className={errorClass}>{f.errors.booking}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="b-guest">Guest</Label>
                {isCreate ? (
                  <Input
                    id="b-guest"
                    value={selectedBooking?.guest?.name || "Select a booking first"}
                    readOnly
                    disabled
                  />
                ) : (
                  <Input
                    id="b-guest"
                    value={targetBilling?.guest?.name || "—"}
                    readOnly
                    disabled
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                <FieldArray
                  name="items"
                  render={({ push, remove }) => (
                    <div className="space-y-2">
                      {f.values.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_5rem_2rem] gap-2"
                        >
                          <div>
                            <Label className="sr-only" htmlFor={`b-item-${index}`}>
                              Description
                            </Label>
                            <Input
                              id={`b-item-${index}`}
                              name={`items.${index}.description`}
                              value={item.description}
                              onChange={f.handleChange}
                              disabled={saving}
                              placeholder="e.g. Room stay, Mini bar"
                            />
                            {f.submitCount > 0 &&
                              f.errors.items?.[index]?.description && (
                                <p className={errorClass}>
                                  {f.errors.items[index].description}
                                </p>
                              )}
                          </div>
                          <div>
                            <Label className="sr-only" htmlFor={`b-amt-${index}`}>
                              Amount
                            </Label>
                            <Input
                              id={`b-amt-${index}`}
                              name={`items.${index}.amount`}
                              type="number"
                              min="0"
                              step="any"
                              value={item.amount}
                              onChange={f.handleChange}
                              disabled={saving}
                              placeholder="Amount"
                            />
                            {f.submitCount > 0 &&
                              f.errors.items?.[index]?.amount && (
                                <p className={errorClass}>
                                  {f.errors.items[index].amount}
                                </p>
                              )}
                          </div>
                          <div>
                            <Label className="sr-only" htmlFor={`b-qty-${index}`}>
                              Quantity
                            </Label>
                            <Input
                              id={`b-qty-${index}`}
                              name={`items.${index}.quantity`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={f.handleChange}
                              disabled={saving}
                              placeholder="Qty"
                            />
                            {f.submitCount > 0 &&
                              f.errors.items?.[index]?.quantity && (
                                <p className={errorClass}>
                                  {f.errors.items[index].quantity}
                                </p>
                              )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="self-start sm:mt-0 text-destructive hover:text-destructive"
                            disabled={saving || f.values.items.length === 1}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={() =>
                          push({ description: "", amount: "", quantity: 1 })
                        }
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add item
                      </Button>
                      {f.submitCount > 0 && f.errors.items && (
                        <p className={errorClass}>{f.errors.items}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="b-paid">Paid amount</Label>
                  <Input
                    id="b-paid"
                    name="paidAmount"
                    type="number"
                    min="0"
                    step="any"
                    value={f.values.paidAmount}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="0"
                  />
                  {f.submitCount > 0 && f.errors.paidAmount && (
                    <p className={errorClass}>{f.errors.paidAmount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="b-due">Due date</Label>
                  <Input
                    id="b-due"
                    name="dueDate"
                    type="date"
                    value={f.values.dueDate}
                    onChange={f.handleChange}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold tracking-tight">
                  {money(computedTotal)}
                </span>
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
              <Button type="submit" form="billing-form" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Create billing"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete billing"
        message={`Are you sure you want to delete this invoice${confirmDelete?.booking ? ` for ${bookingLabel(confirmDelete.booking)}` : ""}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Billing;