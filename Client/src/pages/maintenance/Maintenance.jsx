import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getAllRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} from "../../api/maintenanceApi";
import { getAllRooms } from "../../api/roomApi";
import { getAllUsers } from "../../api/userApi";
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

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["open", "in-progress", "resolved", "closed"];
const FILTERS = ["all", ...STATUSES];

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

const errorClass = "mt-1.5 text-xs text-destructive";

const userLabel = (user) =>
  user && typeof user === "object" ? user.name : "—";

const requestSchema = Yup.object({
  room: Yup.string().nullable(),
  issue: Yup.string()
    .trim()
    .min(3, "Issue must be at least 3 characters")
    .max(1000, "Issue cannot exceed 1000 characters")
    .required("Issue is required"),
  priority: Yup.string()
    .oneOf(PRIORITIES, "Invalid priority")
    .required("Priority is required"),
  status: Yup.string()
    .oneOf(STATUSES, "Invalid status")
    .required("Status is required"),
  assignedTo: Yup.string().nullable(),
  reportedBy: Yup.string().nullable(),
});

const TaskStatCard = ({ label, value, hint, Icon }) => (
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

const Maintenance = () => {
  const navigate = useNavigate();
  const { permissions } = useSelector((state) => state.permission);

  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const maintPerm = permissions?.modules?.maintenance;
  const canCreate = maintPerm?.create === true;
  const canUpdate = maintPerm?.update === true;
  const canDelete = maintPerm?.delete === true;

  const loadRequests = async () => {
    try {
      const res = await getAllRequests();
      setRequests(res?.requests || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    Promise.all([getAllRooms(), getAllUsers()])
      .then(([roomsRes, usersRes]) => {
        setRooms(roomsRes?.rooms || []);
        setStaff((usersRes?.users || []).filter((u) => u.role?.name !== "guest"));
      })
      .catch(() => {});
  }, []);

  const isCreate = formTarget === "new";
  const targetRequest = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (request) => setFormTarget(request);
  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      room: targetRequest?.room?._id || "",
      issue: targetRequest?.issue || "",
      priority: targetRequest?.priority || "medium",
      status: targetRequest?.status || "open",
      assignedTo: targetRequest?.assignedTo?._id || "",
      reportedBy: targetRequest?.reportedBy?._id || "",
    },
    validationSchema: requestSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = {
          room: values.room || null,
          issue: values.issue.trim(),
          priority: values.priority,
          status: values.status,
          assignedTo: values.assignedTo || null,
          reportedBy: values.reportedBy || undefined,
        };
        if (isCreate) {
          const res = await createRequest(payload);
          setRequests((prev) => [res?.request, ...prev].filter(Boolean));
          setFormTarget(null);
          showToast({
            type: "success",
            message: "Request added successfully",
          });
        } else {
          const res = await updateRequest(targetRequest._id, payload);
          setRequests((prev) =>
            prev.map((request) =>
              request._id === targetRequest._id ? res?.request : request,
            ),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Request updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not add request" : "Could not update request"),
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
      await deleteRequest(confirmDelete._id);
      setRequests((prev) =>
        prev.filter((request) => request._id !== confirmDelete._id),
      );
      setConfirmDelete(null);
      showToast({ type: "success", message: "Request deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete request",
      });
    } finally {
      setDeleting(false);
    }
  };

  const visibleRequests =
    activeFilter === "all"
      ? requests
      : requests.filter((request) => request.status === activeFilter);

  const countByStatus = (status) =>
    requests.filter((request) => request.status === status).length;

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      hint: "All maintenance requests",
      Icon: ClipboardList,
    },
    {
      label: "Open",
      value: countByStatus("open"),
      hint: "Not started yet",
      Icon: AlertCircle,
    },
    {
      label: "In Progress",
      value: countByStatus("in-progress"),
      hint: "Being worked on",
      Icon: Clock3,
    },
    {
      label: "Resolved",
      value: countByStatus("resolved"),
      hint: "Fixed requests",
      Icon: CheckCircle2,
    },
  ];

  const f = form;
  const editingLabel = isCreate ? "Add request" : "Edit request";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Track issues and repairs for your rooms.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add request
          </Button>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <TaskStatCard
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
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Reported by</TableHead>
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
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : visibleRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 7 : 6}
                  className="py-14 text-center"
                >
                  <Wrench className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No requests here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Add your first maintenance request using the Add request button."
                      : `No requests with status "${activeFilter}" right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleRequests.map((request) => (
                <TableRow
                  key={request._id}
                  className="cursor-pointer animate-fade-in-up transition-colors hover:bg-muted/40"
                  onClick={() => navigate(`/maintenance/${request._id}`)}
                >
                  <TableCell className="font-semibold">
                    {request.room ? (
                      <Link
                        to={`/rooms/${request.room._id}`}
                        className="text-foreground hover:text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {request.room.number}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <p
                      className="max-w-xs truncate text-sm text-foreground"
                      title={request.issue}
                    >
                      {request.issue}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${PRIORITY_STYLES[request.priority] || ""}`}
                    >
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_STYLES[request.status] || ""}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{userLabel(request.assignedTo)}</TableCell>
                  <TableCell>{userLabel(request.reportedBy)}</TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(request);
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
                              setConfirmDelete(request);
                            }}
                            aria-label={`Delete request ${request.issue}`}
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
                  ? "Fill in the details to add a maintenance request."
                  : "Update the request details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="maintenance-form"
            >
              <div className="space-y-2">
                <Label htmlFor="f-issue">Issue</Label>
                <Input
                  id="f-issue"
                  name="issue"
                  value={f.values.issue}
                  onChange={f.handleChange}
                  onBlur={f.handleBlur}
                  disabled={saving}
                  placeholder="AC not cooling in room"
                  aria-invalid={
                    f.submitCount > 0 && f.errors.issue ? true : undefined
                  }
                  className={
                    f.submitCount > 0 && f.errors.issue ? "aria-invalid" : ""
                  }
                />
                {f.submitCount > 0 && f.errors.issue && (
                  <p className={errorClass}>{f.errors.issue}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="f-room">Room No</Label>
                  <Select
                    value={f.values.room}
                    onValueChange={(value) => f.setFieldValue("room", value)}
                  >
                    <SelectTrigger id="f-room" className="w-full">
                      <SelectValue>
                        {rooms.find((room) => room._id === f.values.room)
                          ? `${
                              rooms.find(
                                (room) => room._id === f.values.room,
                              ).number
                            }`
                          : "No room"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No room</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-priority">Priority</Label>
                  <Select
                    value={f.values.priority}
                    onValueChange={(value) => f.setFieldValue("priority", value)}
                  >
                    <SelectTrigger id="f-priority" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <span className="capitalize">{priority}</span>
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
                  >
                    <SelectTrigger id="f-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-assigned">Assign to</Label>
                  <Select
                    value={f.values.assignedTo}
                    onValueChange={(value) =>
                      f.setFieldValue("assignedTo", value)
                    }
                  >
                    <SelectTrigger id="f-assigned" className="w-full">
                      <SelectValue>
                        <span
                          className={
                            f.values.assignedTo ? "" : "text-muted-foreground"
                          }
                        >
                          {userLabel(
                            staff.find(
                              (user) => user._id === f.values.assignedTo,
                            ),
                          )}
                          {!f.values.assignedTo && "Unassigned"}
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

                <div className="space-y-2">
                  <Label htmlFor="f-reported">Reported by</Label>
                  <Select
                    value={f.values.reportedBy}
                    onValueChange={(value) =>
                      f.setFieldValue("reportedBy", value)
                    }
                  >
                    <SelectTrigger id="f-reported" className="w-full">
                      <SelectValue>
                        <span
                          className={
                            f.values.reportedBy
                              ? ""
                              : "text-muted-foreground"
                          }
                        >
                          {userLabel(
                            staff.find(
                              (user) => user._id === f.values.reportedBy,
                            ),
                          )}
                          {!f.values.reportedBy && "Defaults to you"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Defaults to you</SelectItem>
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
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" form="maintenance-form" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Add request"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete request"
        message={`Are you sure you want to delete this maintenance request${confirmDelete?.room ? ` for Room ${confirmDelete.room.number}` : ""}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Maintenance;