import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Wrench,
  BedDouble,
  UserRound,
  Clock3,
  CalendarClock,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserPlus,
} from "lucide-react";
import {
  getRequestById,
  updateRequest,
  deleteRequest,
} from "../../api/maintenanceApi";
import { getAllUsers } from "../../api/userApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const PRIORITY_STYLES = {
  low: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  medium: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  high: "text-orange-600 bg-orange-500/10 border-orange-500/30",
  urgent: "text-red-600 bg-red-500/10 border-red-500/30",
};

const STATUS_STYLES = {
  open: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  "in-progress": "text-amber-600 bg-amber-500/10 border-amber-500/30",
  resolved: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  closed: "text-muted-foreground bg-muted/40 border-border",
};

const roomTypeLabel = {
  single: "Single Room",
  double: "Double Room",
  suite: "Suite",
  deluxe: "Deluxe Suite",
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

const userLabel = (user) =>
  user && typeof user === "object" ? user.name : "—";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

const STATUS_ACTIONS = {
  open: [{ label: "Start", to: "in-progress", Icon: Play }],
  "in-progress": [{ label: "Mark resolved", to: "resolved", Icon: CheckCircle2 }],
  resolved: [{ label: "Close", to: "closed", Icon: XCircle }],
  closed: [{ label: "Reopen", to: "open", Icon: RotateCcw }],
};

const editSchema = Yup.object({
  issue: Yup.string()
    .trim()
    .min(3, "Issue must be at least 3 characters")
    .max(1000, "Issue cannot exceed 1000 characters")
    .required("Issue is required"),
  priority: Yup.string().required("Priority is required"),
  status: Yup.string().required("Status is required"),
  assignedTo: Yup.string().nullable(),
});

const MaintenanceDetails = () => {
  const { id } = useParams();
  const { permissions } = useSelector((state) => state.permission);

  const [request, setRequest] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const maintPerm = permissions?.modules?.maintenance;
  const canUpdate = maintPerm?.update === true;
  const canDelete = maintPerm?.delete === true;

  const loadRequest = async () => {
    try {
      const res = await getRequestById(id);
      setRequest(res?.request || null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    getAllUsers()
      .then((res) =>
        setStaff(
          (res?.users || []).filter((u) => u.role?.name !== "guest"),
        ),
      )
      .catch(() => {});
  }, [id]);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const res = await updateRequest(id, { status });
      if (res?.request) setRequest(res.request);
      showToast({
        type: "success",
        message: `Status changed to ${status}`,
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not update status",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (assignedTo) => {
    setBusy(true);
    try {
      const res = await updateRequest(id, { assignedTo: assignedTo || null });
      if (res?.request) setRequest(res.request);
      showToast({
        type: "success",
        message: assignedTo
          ? "Request assigned successfully"
          : "Request unassigned",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not assign request",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRequest(id);
      setConfirmDelete(false);
      showToast({ type: "success", message: "Request deleted successfully" });
      window.history.back();
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete request",
      });
    } finally {
      setDeleting(false);
    }
  };

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      issue: request?.issue || "",
      priority: request?.priority || "medium",
      status: request?.status || "open",
      assignedTo: request?.assignedTo?._id || "",
    },
    validationSchema: editSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const res = await updateRequest(id, {
          issue: values.issue.trim(),
          priority: values.priority,
          status: values.status,
          assignedTo: values.assignedTo || null,
        });
        if (res?.request) setRequest(res.request);
        setEditOpen(false);
        showToast({ type: "success", message: "Request updated successfully" });
      } catch (err) {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not update request",
        });
      } finally {
        setSaving(false);
      }
    },
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="animate-fade-in-up">
        <Link
          to="/maintenance"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to maintenance
        </Link>
        <Card className="mt-6 p-10 text-center">
          <p className="text-sm text-destructive">
            {error || "Maintenance request not found"}
          </p>
        </Card>
      </div>
    );
  }

  const requestedDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link
        to="/maintenance"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to maintenance
      </Link>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl text-foreground truncate">
                  {request.room
                    ? `Room ${request.room.number}`
                    : "Maintenance Request"}
                </h1>
                <Badge
                  variant="outline"
                  className={`capitalize ${STATUS_STYLES[request.status] || ""}`}
                >
                  {request.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize ${PRIORITY_STYLES[request.priority] || ""}`}
                >
                  {request.priority}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Requested on {requestedDate}
                </span>
                {request.reportedBy && (
                  <span>· Reported by {userLabel(request.reportedBy)}</span>
                )}
              </div>
            </div>

            {canUpdate && (
              <div className="lg:ml-auto flex flex-wrap gap-2">
                {STATUS_ACTIONS[request.status]?.map(({ label, to, Icon }) => (
                  <Button
                    key={to}
                    onClick={() => setStatus(to)}
                    disabled={busy}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {(canUpdate || canDelete) && (
          <>
            <Separator />
            <CardContent className="py-4 flex flex-wrap gap-2">
              {canUpdate && (
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                  disabled={busy || saving}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {canDelete &&
                request.status !== "in-progress" &&
                request.status !== "resolved" && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              {canUpdate && (
                <div className="ml-auto flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={request.assignedTo?._id || ""}
                    onValueChange={handleAssign}
                  >
                    <SelectTrigger className="w-44" aria-label="Assign staff">
                      <SelectValue>
                        <span
                          className={
                            request.assignedTo?._id
                              ? ""
                              : "text-muted-foreground"
                          }
                        >
                          {userLabel(request.assignedTo)}
                          {!request.assignedTo && "Unassigned"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staff.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailBlock Icon={Wrench} title="Issue">
          <DetailRow label="Description">
            <span className="max-w-xs whitespace-pre-wrap break-words text-left">
              {request.issue}
            </span>
          </DetailRow>
          <DetailRow label="Priority">
            <span className="capitalize">{request.priority}</span>
          </DetailRow>
          <DetailRow label="Status">
            <span className="capitalize">{request.status}</span>
          </DetailRow>
          <DetailRow label="Requested"> {requestedDate}</DetailRow>
          <DetailRow label="Last updated">{updatedDate}</DetailRow>
        </DetailBlock>

        <DetailBlock Icon={BedDouble} title="Room">
          <DetailRow label="Number">
            {request.room?._id ? (
              <Link
                to={`/rooms/${request.room._id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                Room {request.room.number}
              </Link>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Type">
            {request.room
              ? roomTypeLabel[request.room.type] || request.room.type
              : "—"}
          </DetailRow>
          <DetailRow label="Floor">{request.room?.floor ?? "—"}</DetailRow>
          <DetailRow label="Room status">
            <span className="capitalize">{request.room?.status || "—"}</span>
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={UserRound} title="People">
          <DetailRow label="Reported by">
            {request.reportedBy?._id ? (
              <Link
                to={`/users/${request.reportedBy._id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {request.reportedBy.name}
              </Link>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Assigned to">
            {request.assignedTo?._id ? (
              <Link
                to={`/users/${request.assignedTo._id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {request.assignedTo.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={Clock3} title="Timing">
          <DetailRow label="Requested on">{requestedDate}</DetailRow>
          <DetailRow label="Last updated">{updatedDate}</DetailRow>
        </DetailBlock>
      </div>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit request</DialogTitle>
            <DialogDescription>
              Update the issue details for this maintenance request.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit}
            noValidate
            className="space-y-4"
            id="maintenance-edit-form"
          >
            <div className="space-y-2">
              <Label htmlFor="e-issue">Issue</Label>
              <Input
                id="e-issue"
                name="issue"
                value={form.values.issue}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                disabled={saving}
                placeholder="AC not cooling in room"
              />
              {form.errors.issue && form.submitCount > 0 && (
                <p className="mt-1.5 text-xs text-destructive">
                  {form.errors.issue}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="e-priority">Priority</Label>
                <Select
                  value={form.values.priority}
                  onValueChange={(value) => form.setFieldValue("priority", value)}
                >
                  <SelectTrigger id="e-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high", "urgent"].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <span className="capitalize">{priority}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="e-status">Status</Label>
                <Select
                  value={form.values.status}
                  onValueChange={(value) => form.setFieldValue("status", value)}
                >
                  <SelectTrigger id="e-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["open", "in-progress", "resolved", "closed"].map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="e-assigned">Assign to</Label>
                <Select
                  value={form.values.assignedTo}
                  onValueChange={(value) => form.setFieldValue("assignedTo", value)}
                >
                  <SelectTrigger id="e-assigned" className="w-full">
                    <SelectValue>
                      <span
                        className={
                          form.values.assignedTo
                            ? ""
                            : "text-muted-foreground"
                        }
                      >
                        {userLabel(
                          staff.find(
                            (member) => member._id === form.values.assignedTo,
                          ),
                        )}
                        {!form.values.assignedTo && "Unassigned"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="maintenance-edit-form" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete request"
        message={`Are you sure you want to delete this maintenance request${request.room ? ` for Room ${request.room.number}` : ""}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default MaintenanceDetails;