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
  CardHeader,
  CardTitle,
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

const BookingCard = ({ booking, onReport }) => {
  const active = isActive(booking);
  const room = booking.room;

  return (
    <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary/30">
      <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border flex items-center justify-center">
        <BedDouble className="w-9 h-9 text-primary/60" strokeWidth={1.5} />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">
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
          <Badge
            variant="outline"
            className={`capitalize ${STATUS_META[booking.status] || ""}`}
          >
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>
              {formatDate(booking.checkInDate)} →{" "}
              {formatDate(booking.checkOutDate)}
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 shrink-0" />
            {booking.guestsCount} guest{booking.guestsCount > 1 ? "s" : ""}
          </p>
        </div>

        {booking.specialRequests && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {booking.specialRequests}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm">
            <span className="text-muted-foreground">Total </span>
            <span className="font-semibold text-primary">
              ${booking.totalAmount}
            </span>
          </p>
          {active ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReport(room)}
            >
              <Wrench className="w-3.5 h-3.5" />
              Report an issue
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {booking.status === "checked-out"
                ? "Stay completed"
                : "Booking cancelled"}
            </span>
          )}
        </div>
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
    <div className="space-y-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onReport={setReportRoom}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onReport={setReportRoom}
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