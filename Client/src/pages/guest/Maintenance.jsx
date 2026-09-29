import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  CalendarDays,
  User,
  AlertTriangle,
} from "lucide-react";
import { getMyRequests } from "../../api/maintenanceApi";
import { getMyBookings } from "../../api/bookingApi";
import { showToast } from "../../components/common/Toast";
import ReportIssueDialog from "../maintenance/ReportIssueDialog.jsx";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";

const ACTIVE_STATUSES = ["pending", "confirmed", "checked-in"];

const STATUS_META = {
  open: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  "in-progress": "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  resolved: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  closed: "text-muted-foreground bg-muted/40 border-border",
};

const PRIORITY_META = {
  low: "text-muted-foreground bg-muted/40 border-border",
  medium: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  high: "text-orange-600 bg-orange-500/10 border-orange-500/30",
  urgent: "text-red-600 bg-red-500/10 border-red-500/30",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportRoom, setReportRoom] = useState(null);
  const [reportRoomPlaceholder, setReportRoomPlaceholder] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [reqRes, bookingRes] = await Promise.allSettled([
          getMyRequests(),
          getMyBookings(),
        ]);

        if (!active) return;

        if (reqRes.status === "fulfilled") {
          setRequests(reqRes.value?.requests || []);
        } else {
          showToast({
            type: "error",
            message:
              reqRes.reason?.response?.data?.message ||
              "Could not load maintenance requests",
          });
        }

        if (bookingRes.status === "fulfilled") {
          const bookings = bookingRes.value?.bookings || [];
          const activeBooking = bookings.find((booking) =>
            ACTIVE_STATUSES.includes(booking?.status),
          );
          if (activeBooking?.room) {
            setReportRoomPlaceholder(activeBooking.room);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/30 text-primary gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Maintenance
          </Badge>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
            Maintenance requests
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Report issues with your room and track their progress.
          </p>
        </div>

        <Button
          size="sm"
          disabled={!reportRoomPlaceholder}
          onClick={() => setReportRoom(reportRoomPlaceholder)}
        >
          <Plus className="w-4 h-4" />
          Report an issue
        </Button>
      </div>

      {!reportRoomPlaceholder && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 w-4.5 h-4.5 shrink-0 text-primary" />
          <p>
            You can report an issue while staying at the hotel. Book a room to
            get started.
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-10 text-center">
          <Wrench className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            No requests yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            If something in your room is not working, report it here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="p-5">
              <CardContent className="space-y-3 px-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_META[request.status] || ""}`}
                    >
                      {request.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`capitalize ${PRIORITY_META[request.priority] || ""}`}
                    >
                      {request.priority}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatDate(request.createdAt)}
                  </p>
                </div>

                <p className="text-sm text-foreground">{request.issue}</p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>
                    Room{" "}
                    <span className="font-medium text-foreground">
                      {request.room?.number || "—"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {request.assignedTo?.name || "Not assigned yet"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReportIssueDialog
        open={reportRoom !== null}
        onOpenChange={(open) => !open && setReportRoom(null)}
        room={reportRoom}
      />
    </div>
  );
};

export default Maintenance;