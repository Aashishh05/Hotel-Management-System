import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  CalendarCheck,
  Users,
  Wrench,
} from "lucide-react";
import { getMyBookings } from "../../api/bookingApi";
import { showToast } from "../../components/common/Toast";
import ReportIssueDialog from "../maintenance/ReportIssueDialog.jsx";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";

const ACTIVE_STATUSES = ["pending", "confirmed", "checked-in"];

const STATUS_META = {
  pending: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  confirmed: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  "checked-in": "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  "checked-out": "text-muted-foreground bg-muted/40 border-border",
  cancelled: "text-red-600 bg-red-500/10 border-red-500/30",
};

const isActive = (booking) => ACTIVE_STATUSES.includes(booking?.status);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const BookingCard = ({ booking, onReport, index = 0 }) => {
  const active = isActive(booking);
  const room = booking.room;

  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
        86400000,
    ),
  );

  return (
    <Card
      style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
      className="gap-0 overflow-hidden border-border/80 bg-gradient-to-b from-card to-muted/20 py-0 transition-shadow hover:shadow-md animate-fade-in-up"
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <BedDouble className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {room?.roomType || "Room"}
              </p>
              {room ? (
                <Link
                  to={`/rooms/${room._id}`}
                  className="font-display text-xl text-foreground transition-colors hover:text-primary"
                >
                  Room {room.number}
                </Link>
              ) : (
                <p className="font-display text-xl text-foreground">
                  Room not found
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`capitalize ${STATUS_META[booking.status] || ""}`}
          >
            {booking.status}
          </Badge>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-background/70 px-3 py-2 text-xs text-muted-foreground">
          <CalendarCheck className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span className="tabular-nums">
            {formatDate(booking.checkInDate)}
          </span>
          <span className="text-border">&rarr;</span>
          <span className="tabular-nums">
            {formatDate(booking.checkOutDate)}
          </span>
          <span className="ml-auto shrink-0 font-medium text-foreground">
            {nights} {nights === 1 ? "night" : "nights"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {booking.guestsCount} guest{booking.guestsCount > 1 ? "s" : ""}
          </span>
          <span className="font-semibold text-primary tabular-nums">
            ${booking.totalAmount}
          </span>
        </div>

        {booking.specialRequests && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {booking.specialRequests}
          </p>
        )}

        {active ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => onReport(room)}
          >
            <Wrench className="w-3.5 h-3.5" />
            Report an issue
          </Button>
        ) : (
          <p className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
            {booking.status === "checked-out"
              ? "Stay completed"
              : "Booking cancelled"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const MyStays = () => {
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

  const activeBookings = bookings.filter(isActive);
  const pastBookings = bookings.filter((booking) => !isActive(booking));

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          My Stays
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          Booked room details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          {loading
            ? "Loading your bookings…"
            : activeBookings.length > 0
              ? "Something wrong in your room? Use 'Report an issue' and our maintenance team will fix it."
              : "No active stays right now. Book a room to get started."}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-4 px-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-10 text-center">
          <BedDouble className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            No bookings yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Browse our rooms and book your first stay.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link to="/" />}
          >
            View rooms
          </Button>
        </Card>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl text-foreground">
                Active stays
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeBookings.map((booking, idx) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onReport={setReportRoom}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          )}

          {activeBookings.length > 0 && pastBookings.length > 0 && (
            <Separator />
          )}

          {pastBookings.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl text-foreground">
                Past stays
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pastBookings.map((booking, idx) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onReport={setReportRoom}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ReportIssueDialog
        open={reportRoom !== null}
        onOpenChange={(open) => !open && setReportRoom(null)}
        room={reportRoom}
      />
    </div>
  );
};

export default MyStays;