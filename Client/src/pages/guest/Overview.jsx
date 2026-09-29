import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  Users,
  UtensilsCrossed,
  ClipboardList,
  Wrench,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { getMyBookings } from "../../api/bookingApi";
import useAuth from "../../hooks/useAuth.js";
import { showToast } from "../../components/common/Toast";
import ReportIssueDialog from "../maintenance/ReportIssueDialog.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

const ACTIVE_STATUSES = ["pending", "confirmed", "checked-in"];

const STATUS_META = {
  pending: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  confirmed: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  "checked-in": "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  "checked-out": "text-muted-foreground bg-muted/40 border-border",
  cancelled: "text-red-600 bg-red-500/10 border-red-500/30",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const QUICK_ACTIONS = [
  {
    label: "Hotel Dining",
    description: "Browse the menu and order room service",
    path: "/guest/menu",
    Icon: UtensilsCrossed,
  },
  {
    label: "My Orders",
    description: "Track your room service orders",
    path: "/guest/orders",
    Icon: ClipboardList,
  },
  {
    label: "Maintenance",
    description: "Report issues for your room",
    path: "/guest/maintenance",
    Icon: Wrench,
  },
  {
    label: "Invoices",
    description: "View your bills and payments",
    path: "/guest/billing",
    Icon: Receipt,
  },
];

const Overview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportRoom, setReportRoom] = useState(null);

  useEffect(() => {
    let active = true;
    getMyBookings()
      .then((res) => active && setBookings(res?.bookings || []))
      .catch((err) =>
        active &&
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not load your stays",
        }),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const activeBooking = bookings.find((booking) =>
    ACTIVE_STATUSES.includes(booking?.status),
  );
  const room = activeBooking?.room;
  const firstName = user?.name?.split(" ")[0] || "Guest";

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <BedDouble className="w-3.5 h-3.5" />
          Guest Portal
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          {loading
            ? "Loading your stay…"
            : activeBooking
              ? "Here is a snapshot of your current stay."
              : "Book a room to get the full guest experience."}
        </p>
      </div>

      {loading ? (
        <Card className="p-5">
          <CardContent className="space-y-3 px-0">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : activeBooking ? (
        <Card className="overflow-hidden animate-fade-in-up animate-delay-100">
          <div className="grid lg:grid-cols-[1fr_auto] gap-5 p-6">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Current stay
                  </p>
                  <CardTitle className="mt-1 text-xl">
                    {room ? (
                      <Link
                        to={`/rooms/${room._id}`}
                        className="hover:text-primary hover:underline"
                      >
                        Room {room.number}
                      </Link>
                    ) : (
                      "Room not found"
                    )}
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize ${STATUS_META[activeBooking.status] || ""}`}
                >
                  {activeBooking.status}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {formatDate(activeBooking.checkInDate)} →{" "}
                    {formatDate(activeBooking.checkOutDate)}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" />
                  {activeBooking.guestsCount} guest
                  {activeBooking.guestsCount > 1 ? "s" : ""}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => navigate("/guest/menu")}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Order room service
                </Button>
                {room && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportRoom(room)}
                  >
                    <Wrench className="w-4 h-4" />
                    Report an issue
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link to="/guest/stays" />}
                >
                  All stays
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center border-t lg:border-t-0 lg:border-l border-border lg:pl-6 lg:min-w-56">
              <div>
                <p className="text-sm text-muted-foreground">Total for stay</p>
                <p className="mt-1 font-display text-2xl text-primary">
                  ${activeBooking.totalAmount}
                </p>
                <Link
                  to="/guest/billing"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View invoice
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <BedDouble className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            No active stay
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Browse our rooms and book your stay to unlock dining, maintenance
            and billing from your portal.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link to="/" />}
          >
            View rooms
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(({ label, description, path, Icon }, idx) => (
          <Link
            key={path}
            to={path}
            style={{ animationDelay: `${200 + Math.min(idx, 5) * 60}ms` }}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:ring-2 hover:ring-primary/30 animate-fade-in-up"
          >
            <Icon className="w-6 h-6 text-primary/70" strokeWidth={1.75} />
            <h3 className="mt-3 font-display text-base text-foreground group-hover:text-primary">
              {label}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>

      <ReportIssueDialog
        open={reportRoom !== null}
        onOpenChange={(open) => !open && setReportRoom(null)}
        room={reportRoom}
      />
    </div>
  );
};

export default Overview;