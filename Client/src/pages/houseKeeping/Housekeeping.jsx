import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  Clock3,
  CalendarDays,
  UserRound,
} from "lucide-react";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
} from "../../api/houseKeepingApi";
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

const TASK_TYPES = ["cleaning", "turndown", "deep-clean"];
const TASK_LABELS = {
  cleaning: "Cleaning",
  turndown: "Turndown",
  "deep-clean": "Deep clean",
};
const TASK_STATUSES = ["pending", "in-progress", "done"];
const FILTERS = ["all", ...TASK_STATUSES];

const STATUS_STYLES = {
  pending: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  "in-progress": "text-sky-600 bg-sky-500/10 border-sky-500/30",
  done: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const roomLabel = (room) => (room ? `Room ${room.number}` : "Unknown room");
const assigneeLabel = (user) => (user ? user.name : "Unassigned");

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const taskSchema = Yup.object({
  room: Yup.string().required("Room is required"),
  type: Yup.string()
    .oneOf(TASK_TYPES, "Invalid task type")
    .required("Task type is required"),
  status: Yup.string()
    .oneOf(TASK_STATUSES, "Invalid status")
    .required("Status is required"),
  assignedTo: Yup.string().nullable(),
  scheduledAt: Yup.string().nullable(),
  notes: Yup.string().max(1000, "Notes cannot exceed 1000 characters"),
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

const Housekeeping = () => {
  const { permissions } = useSelector((state) => state.permission);

  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const housePerm = permissions?.modules?.housekeeping;
  const canCreate = housePerm?.create === true;
  const canUpdate = housePerm?.update === true;
  const canDelete = housePerm?.delete === true;

  const loadTasks = async () => {
    try {
      const res = await getAllTasks();
      setTasks(res?.tasks || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    Promise.all([getAllRooms(), getAllUsers()])
      .then(([roomsRes, usersRes]) => {
        setRooms(roomsRes?.rooms || []);
        setStaff((usersRes?.users || []).filter((u) => u.role?.name !== "guest"));
      })
      .catch(() => {});
  }, []);

  const isCreate = formTarget === "new";
  const targetTask = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (task) => setFormTarget(task);
  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      room: targetTask?.room?._id || "",
      type: targetTask?.type || "cleaning",
      status: targetTask?.status || "pending",
      assignedTo: targetTask?.assignedTo?._id || "",
      scheduledAt: targetTask?.scheduledAt
        ? new Date(targetTask.scheduledAt).toISOString().slice(0, 10)
        : "",
      notes: targetTask?.notes || "",
    },
    validationSchema: taskSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = {
          room: values.room,
          type: values.type,
          status: values.status,
          assignedTo: values.assignedTo || null,
          scheduledAt: values.scheduledAt || undefined,
          notes: values.notes.trim() || undefined,
        };
        if (isCreate) {
          const res = await createTask(payload);
          setTasks((prev) => [res?.task, ...prev].filter(Boolean));
          setFormTarget(null);
          showToast({ type: "success", message: "Task added successfully" });
        } else {
          const res = await updateTask(targetTask._id, payload);
          setTasks((prev) =>
            prev.map((task) => (task._id === targetTask._id ? res?.task : task)),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Task updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not add task" : "Could not update task"),
        });
      } finally {
        setSaving(false);
      }
    },
  });

  const runQuickAction = async (task, actionFn, successMessage) => {
    setBusyId(task._id);
    try {
      const res = await actionFn(task._id);
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res?.task : t)),
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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteTask(confirmDelete._id);
      setTasks((prev) => prev.filter((task) => task._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "Task deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete task",
      });
    } finally {
      setDeleting(false);
    }
  };

  const visibleTasks =
    activeFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === activeFilter);

  const countByStatus = (status) =>
    tasks.filter((task) => task.status === status).length;

  const stats = [
    {
      label: "Total Tasks",
      value: tasks.length,
      hint: "All housekeeping tasks",
      Icon: ClipboardList,
    },
    {
      label: "Pending",
      value: countByStatus("pending"),
      hint: "Awaiting start",
      Icon: Clock3,
    },
    {
      label: "In Progress",
      value: countByStatus("in-progress"),
      hint: "Being handled",
      Icon: Sparkles,
    },
    {
      label: "Done",
      value: countByStatus("done"),
      hint: "Completed tasks",
      Icon: CheckCircle2,
    },
  ];

  const f = form;
  const editingLabel = isCreate ? "Add task" : "Edit task";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Housekeeping</h1>
          <p className="text-sm text-muted-foreground">
            Assign and track cleaning tasks for your rooms.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add task
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
              <TableHead>Room</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
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
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
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
            ) : visibleTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 6 : 5}
                  className="py-14 text-center"
                >
                  <Sparkles className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No tasks here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Add your first housekeeping task using the Add task button."
                      : `No tasks with status "${activeFilter}" right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleTasks.map((task) => (
                <TableRow key={task._id} className="animate-fade-in-up">
                  <TableCell className="font-semibold">
                    <Link
                      to={`/rooms/${task.room?._id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {roomLabel(task.room).replace("Room ", "")}
                    </Link>
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {task.room?.type}
                    </span>
                  </TableCell>
                  <TableCell>{TASK_LABELS[task.type] || task.type}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="w-3.5 h-3.5 text-muted-foreground" />
                      {assigneeLabel(task.assignedTo)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_STYLES[task.status] || ""}`}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDate(task.scheduledAt) || "—"}
                    </span>
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && task.status === "pending" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === task._id}
                            onClick={() =>
                              runQuickAction(
                                task,
                                startTask,
                                "Task started. Room marked cleaning.",
                              )
                            }
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start
                          </Button>
                        )}
                        {canUpdate && task.status === "in-progress" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === task._id}
                            onClick={() =>
                              runQuickAction(
                                task,
                                completeTask,
                                "Task completed. Room marked available.",
                              )
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(task)}
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
                            onClick={() => setConfirmDelete(task)}
                            aria-label={`Delete task for ${roomLabel(task.room)}`}
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
                  ? "Fill in the details to add a new housekeeping task."
                  : "Update the task details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="task-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="f-room">Room</Label>
                  <Select
                    value={f.values.room}
                    onValueChange={(value) => f.setFieldValue("room", value)}
                  >
                    <SelectTrigger id="f-room" className="w-full">
                      <SelectValue>
                        {rooms.find((room) => room._id === f.values.room)
                          ? `Room ${rooms.find((room) => room._id === f.values.room).number}`
                          : "Select a room"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          Room {room.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {f.submitCount > 0 && f.errors.room && (
                    <p className={errorClass}>{f.errors.room}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-type">Task type</Label>
                  <Select
                    value={f.values.type}
                    onValueChange={(value) => f.setFieldValue("type", value)}
                  >
                    <SelectTrigger id="f-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {TASK_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {f.submitCount > 0 && f.errors.type && (
                    <p className={errorClass}>{f.errors.type}</p>
                  )}
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
                      {TASK_STATUSES.map((status) => (
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
                          {assigneeLabel(
                            staff.find(
                              (user) => user._id === f.values.assignedTo,
                            ),
                          )}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staff.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-scheduled">Scheduled date</Label>
                  <Input
                    id="f-scheduled"
                    name="scheduledAt"
                    type="date"
                    value={f.values.scheduledAt}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-notes">Notes</Label>
                  <Input
                    id="f-notes"
                    name="notes"
                    value={f.values.notes}
                    onChange={f.handleChange}
                    disabled={saving}
                    placeholder="Optional instructions"
                  />
                  {f.submitCount > 0 && f.errors.notes && (
                    <p className={errorClass}>{f.errors.notes}</p>
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
              <Button type="submit" form="task-form" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Add task"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete task"
        message={`Are you sure you want to delete this task for ${roomLabel(confirmDelete?.room)}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Housekeeping;