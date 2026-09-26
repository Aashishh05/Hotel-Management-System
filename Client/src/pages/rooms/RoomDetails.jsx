import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Check,
  Hexagon,
  Ruler,
  Tag,
} from "lucide-react";
import { getPublicRooms } from "../../api/roomApi";
import useAuth from "../../hooks/useAuth.js";
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
import { showToast } from "../../components/common/Toast";
import BookingForm from "../bookings/BookingForm.jsx";

const roomTypeLabel = {
  single: "Single Room",
  double: "Double Room",
  suite: "Suite",
  deluxe: "Deluxe Suite",
};

const STATUS_META = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    badge: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30",
    bookable: true,
  },
  occupied: {
    label: "Occupied",
    dot: "bg-violet-500",
    badge: "text-violet-700 bg-violet-500/10 border-violet-500/30",
    bookable: false,
  },
  cleaning: {
    label: "Cleaning",
    dot: "bg-amber-500",
    badge: "text-amber-700 bg-amber-500/10 border-amber-500/30",
    bookable: false,
  },
  maintenance: {
    label: "Under maintenance",
    dot: "bg-red-500",
    badge: "text-red-700 bg-red-500/10 border-red-500/30",
    bookable: false,
  },
  reserved: {
    label: "Reserved",
    dot: "bg-sky-500",
    badge: "text-sky-700 bg-sky-500/10 border-sky-500/30",
    bookable: false,
  },
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right">
      {children}
    </dd>
  </div>
);

const RelatedRoomCard = ({ room }) => {
  const navigate = useNavigate();
  const status = STATUS_META[room.status] || {
    dot: "bg-slate-500",
    bookable: false,
  };

  return (
    <Card className="group flex flex-col p-5 h-full transition-all hover:ring-2 hover:ring-primary/30">
      <button
        type="button"
        className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-border transition-colors group-hover:border-primary/40"
        onClick={() => navigate(`/rooms/${room._id}`)}
        aria-label={`View room ${room.number}`}
      >
        <BedDouble className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
        <span className="absolute bottom-2 left-2 text-xs font-semibold text-foreground/80">
          Room {room.number}
        </span>
        <span className="absolute top-2 right-2">
          <span className={`inline-flex size-1.5 rounded-full ${status.dot}`} />
        </span>
      </button>

      <CardHeader className="px-0 pt-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">
            {roomTypeLabel[room.type] || room.type}
          </CardTitle>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground group-hover:text-primary"
            aria-label={`View room ${room.number} details`}
            onClick={() => navigate(`/rooms/${room._id}`)}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-2 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-primary">
            ${room.pricePerNight}
          </span>
          <span className="text-xs text-muted-foreground">/ night</span>
        </div>
      </CardContent>
    </Card>
  );
};

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicRooms()
      .then((res) => {
        if (!active) return;
        const list = res?.rooms || [];
        const found = list.find((r) => r._id === id) || null;
        setRooms(list);
        setRoom(found);
        setError(found ? "" : "Room not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.message || "Failed to load room");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleBook = () => {
    if (user) {
      setBookingOpen(true);
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-8">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Skeleton className="h-80 w-full rounded-2xl lg:col-span-3" />
            <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Card className="mt-6 p-10 text-center">
            <p className="text-sm text-destructive">
              {error || "Room not found"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const status = STATUS_META[room.status] || {
    label: room.status,
    dot: "bg-slate-500",
    badge: "",
    bookable: false,
  };
  const images = room.images?.length ? room.images : [];
  const amenities = room.amenities || [];
  const otherRooms = rooms.filter((r) => r._id !== room._id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Hexagon className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide">
              Grand Horizon
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-primary">
              Hotel Management
            </span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to rooms
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 lg:px-8 py-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="relative flex h-72 sm:h-96 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-primary/5 to-background">
              <Hexagon
                className="absolute -top-8 -right-8 w-40 h-40 text-primary/5 rotate-12"
                strokeWidth={1}
              />
              <BedDouble
                className="w-24 h-24 text-primary/40"
                strokeWidth={1.25}
              />
              <span className="absolute top-4 left-4 text-xs uppercase tracking-[0.25em] text-primary font-medium">
                Room {room.number}
              </span>
              <Badge
                variant="outline"
                className={`absolute top-4 right-4 capitalize ${status.badge}`}
              >
                {status.label}
              </Badge>
              <span className="absolute bottom-4 left-4 font-display text-3xl text-foreground">
                {roomTypeLabel[room.type] || room.type}
              </span>
              <span className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                Floor {room.floor ?? "—"}
              </span>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((src) => (
                  <div
                    key={src}
                    className="aspect-video overflow-hidden rounded-xl border border-border"
                  >
                    <img
                      src={src}
                      alt={`Room ${room.number}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Rooms &amp; Suites</span>
              <span>/</span>
              <span className="text-foreground">Room {room.number}</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24 h-fit rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-display">
                  Room {room.number}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {roomTypeLabel[room.type] || room.type} · Floor{" "}
                  {room.floor ?? "—"}
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold text-foreground">
                    ${room.pricePerNight}
                  </span>
                  <span className="text-sm text-muted-foreground">/ night</span>
                </div>

                <Separator className="my-6" />

                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Key features
                </h3>
                {amenities.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-1 gap-2.5">
                    {amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="w-3 h-3" />
                        </span>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No listed amenities yet.
                  </p>
                )}

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Tag className="w-3.5 h-3.5" />
                      Room type
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {roomTypeLabel[room.type] || room.type}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ruler className="w-3.5 h-3.5" />
                      Floor
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {room.floor ?? "—"}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                  <span
                    className={`inline-flex size-2 rounded-full ${status.dot}`}
                  />
                  {status.bookable
                    ? "This room is available for your dates"
                    : `Currently: ${status.label}`}
                </div>

                <div className="mt-4">
                  {status.bookable ? (
                    <Button className="w-full h-11" onClick={handleBook}>
                      <BedDouble className="w-4 h-4" />
                      Book this room
                    </Button>
                  ) : (
                    <Button className="w-full h-11" disabled>
                      {status.label}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>About this room</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {room.description ||
                  "No description available for this room yet."}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Room details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <DetailRow label="Room number">{room.number}</DetailRow>
                <DetailRow label="Type">
                  {roomTypeLabel[room.type] || room.type}
                </DetailRow>
                <DetailRow label="Floor">{room.floor ?? "—"}</DetailRow>
                <DetailRow label="Price / night">
                  <span className="text-primary">${room.pricePerNight}</span>
                </DetailRow>
                <DetailRow label="Status">
                  <span className="capitalize">{status.label}</span>
                </DetailRow>
              </dl>
            </CardContent>
          </Card>
        </div>

        {otherRooms.length > 0 && (
          <div>
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-primary">
                  More to explore
                </span>
                <h2 className="font-display text-2xl mt-1 text-foreground">
                  Other rooms you might like
                </h2>
              </div>
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all rooms
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherRooms.map((other) => (
                <RelatedRoomCard key={other._id} room={other} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border px-4 py-6">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="font-semibold text-sm tracking-wide">
              Grand Horizon Hotel
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Grand Horizon Hotel. All rights
            reserved.
          </p>
        </div>
      </footer>

      <BookingForm
        open={bookingOpen}
        onOpenChange={(open) => !open && setBookingOpen(false)}
        rooms={rooms}
        initialRoomId={room._id}
        onCreated={(booking) => {
          showToast({
            type: "success",
            message: "Booking created successfully",
          });
          navigate(`/bookings/${booking._id}`);
        }}
      />
    </div>
  );
};

export default RoomDetails;