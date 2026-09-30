import { useEffect, useState } from "react";
import {
  ScrollText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Globe,
  Monitor,
  Activity,
  Hash,
  LogIn,
  LogOut,
  CalendarCheck,
  UtensilsCrossed,
  CreditCard,
  Trash2,
  Pencil,
  PlusCircle,
} from "lucide-react";
import {
  getActivityStats,
  getAuditLogs,
} from "../../api/auditLogApi";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
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

const STATUSES = ["success", "failed"];
const PAGE_SIZES = [10, 20, 50];

const MODULES = ["bookings", "restaurant", "payment", "billing", "api"];

const EVENT_META = {
  "booking.created": {
    label: "Booking created",
    Icon: PlusCircle,
    tone: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  },
  "booking.confirmed": {
    label: "Booking confirmed",
    Icon: CalendarCheck,
    tone: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  },
  "booking.updated": {
    label: "Booking updated",
    Icon: Pencil,
    tone: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  },
  "booking.cancelled": {
    label: "Booking cancelled",
    Icon: XCircle,
    tone: "text-orange-600 bg-orange-500/10 border-orange-500/30",
  },
  "booking.deleted": {
    label: "Booking deleted",
    Icon: Trash2,
    tone: "text-red-600 bg-red-500/10 border-red-500/30",
  },
  "guest.checked_in": {
    label: "Guest checked in",
    Icon: LogIn,
    tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  },
  "guest.checked_out": {
    label: "Guest checked out",
    Icon: LogOut,
    tone: "text-violet-600 bg-violet-500/10 border-violet-500/30",
  },
  "order.placed": {
    label: "Order placed",
    Icon: UtensilsCrossed,
    tone: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  },
  "order.pending": {
    label: "Order pending",
    Icon: UtensilsCrossed,
    tone: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  },
  "order.preparing": {
    label: "Order preparing",
    Icon: UtensilsCrossed,
    tone: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  },
  "order.served": {
    label: "Order served",
    Icon: CheckCircle2,
    tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  },
  "order.cancelled": {
    label: "Order cancelled",
    Icon: XCircle,
    tone: "text-red-600 bg-red-500/10 border-red-500/30",
  },
  "order.deleted": {
    label: "Order deleted",
    Icon: Trash2,
    tone: "text-red-600 bg-red-500/10 border-red-500/30",
  },
  "payment.completed": {
    label: "Payment received",
    Icon: CreditCard,
    tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  },
  "payment.pending": {
    label: "Payment pending",
    Icon: CreditCard,
    tone: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  },
  "payment.failed": {
    label: "Payment failed",
    Icon: XCircle,
    tone: "text-red-600 bg-red-500/10 border-red-500/30",
  },
  "payment.deleted": {
    label: "Payment deleted",
    Icon: Trash2,
    tone: "text-red-600 bg-red-500/10 border-red-500/30",
  },
};

const STATUS_META = {
  success: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  failed: "text-red-600 bg-red-500/10 border-red-500/30",
};

const eventLabel = (action) =>
  EVENT_META[action]?.label ||
  (action ? action.replace(/[._]/g, " ") : "Activity");

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const actorName = (user) => user?.name || user?.email || "System";

const EventBadge = ({ action }) => {
  const meta = EVENT_META[action];

  if (!meta) {
    return (
      <Badge variant="outline" className="font-mono text-[11px]">
        {action || "request"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={meta.tone}>
      <meta.Icon />
      {meta.label}
    </Badge>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [detailLog, setDetailLog] = useState(null);

  const loadLogs = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);

      const params = { page, limit };
      if (eventFilter !== "all") params.action = eventFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (moduleFilter !== "all") params.module = moduleFilter;

      const [listRes, statsRes] = await Promise.all([
        getAuditLogs(params),
        getActivityStats(),
      ]);

      const data = listRes?.data || {};

      setLogs(data.logs || []);
      setTotalLogs(data.totalLogs || 0);
      setTotalPages(Math.max(data.totalPages || 1, 1));
      setStats(statsRes?.data || null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load activity");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, limit, eventFilter, statusFilter, moduleFilter]);

  const modules = [
    ...new Set([
      ...MODULES,
      ...logs.map((log) => log.module).filter(Boolean),
    ]),
  ].sort();

  const summary = [
    { label: "Total Activity", value: stats?.totalLogs ?? 0, Icon: ScrollText },
    {
      label: "Check-ins & Bookings",
      value: stats?.modules?.bookings ?? 0,
      Icon: CalendarCheck,
    },
    {
      label: "Restaurant Orders",
      value: stats?.modules?.restaurant ?? 0,
      Icon: UtensilsCrossed,
    },
    {
      label: "Payments",
      value: stats?.modules?.payment ?? 0,
      Icon: CreditCard,
    },
  ];

  const resetFilters = () => {
    setEventFilter("all");
    setStatusFilter("all");
    setModuleFilter("all");
    setPage(1);
  };

  const filtersActive =
    eventFilter !== "all" || statusFilter !== "all" || moduleFilter !== "all";

  const from = totalLogs === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalLogs);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Bookings, check-ins, orders and payments as they happen.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadLogs(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.map((stat, idx) => (
            <Card
              key={stat.label}
              className={`animate-fade-in-up animate-delay-${(idx + 1) * 100}`}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold leading-none tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={eventFilter}
          onValueChange={(value) => {
            setEventFilter(value);
            setPage(1);
          }}
          items={Object.fromEntries(
            [
              "all",
              ...Object.keys(EVENT_META),
            ].map((item) => [item, eventLabel(item)]),
          )}
          className="w-48"
        >
          <SelectTrigger aria-label="Filter by activity">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {Object.entries(EVENT_META).map(([action, meta]) => (
              <SelectItem key={action} value={action}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={moduleFilter}
          onValueChange={(value) => {
            setModuleFilter(value);
            setPage(1);
          }}
          items={Object.fromEntries(
            ["all", ...modules].map((item) => [item, item]),
          )}
          className="w-40"
        >
          <SelectTrigger aria-label="Filter by module">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module} className="capitalize">
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          items={Object.fromEntries(
            ["all", ...STATUSES].map((item) => [item, item]),
          )}
          className="w-32"
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
          >
            Clear filters
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

      <Card className="overflow-hidden animate-fade-in-up animate-delay-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>By</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">More</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-56" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center">
                  <ScrollText className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    Nothing here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filtersActive
                      ? "Try clearing the filters to see more."
                      : "Bookings, orders and payments will appear here."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} className="animate-fade-in-up">
                  <TableCell>
                    <EventBadge action={log.action} />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-foreground break-words">
                      {log.description || eventLabel(log.action)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">
                      {actorName(log.user)}
                    </p>
                    {log.user?.email && (
                      <p className="text-xs text-muted-foreground">
                        {log.user.email}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_META[log.status] || ""}`}
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailLog(log)}
                        aria-label={`View activity ${log._id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {!loading && logs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {from}-{to} of {totalLogs}
          </p>

          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
              items={Object.fromEntries(
                PAGE_SIZES.map((size) => [String(size), size]),
              )}
              className="w-28"
            >
              <SelectTrigger aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>

            <span className="text-xs text-muted-foreground tabular-nums">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={detailLog !== null}
        onOpenChange={(open) => !open && setDetailLog(null)}
      >
        {detailLog && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {eventLabel(detailLog.action)}
              </DialogTitle>
              <DialogDescription>
                {formatDate(detailLog.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {detailLog.description && (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                <p className="text-sm text-foreground">{detailLog.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Performed by</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {actorName(detailLog.user)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {detailLog.status}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Module</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {detailLog.module || "api"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">IP address</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {detailLog.ipAddress || "—"}
                  </p>
                </div>
              </div>
            </div>

            {detailLog.targetId && (
              <>
                <Separator />
                <div className="flex items-start gap-2">
                  <Hash className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Record ID</p>
                    <p className="text-sm font-medium text-foreground break-all">
                      {detailLog.targetId}
                    </p>
                  </div>
                </div>
              </>
            )}

            {detailLog.userAgent && (
              <div className="flex items-start gap-2">
                <Monitor className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-xs text-foreground break-words">
                    {detailLog.userAgent}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailLog(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AuditLogs;