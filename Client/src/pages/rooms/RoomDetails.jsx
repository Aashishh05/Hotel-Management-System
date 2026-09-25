import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, ImageIcon } from "lucide-react";
import { getRoomById } from "../../api/roomApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";

const roomTypeLabel = {
  single: "Single Room",
  double: "Double Room",
  suite: "Suite",
  deluxe: "Deluxe Suite",
};

const STATUS_STYLES = {
  available: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  occupied: "text-violet-600 bg-violet-500/10 border-violet-500/30",
  cleaning: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  maintenance: "text-red-600 bg-red-500/10 border-red-500/30",
  reserved: "text-sky-600 bg-sky-500/10 border-sky-500/30",
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right">
      {children}
    </dd>
  </div>
);

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRoomById(id);
        setRoom(res?.room || null);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load room");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="animate-fade-in-up">
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to rooms
        </Link>
        <Card className="mt-6 p-10 text-center">
          <p className="text-sm text-destructive">{error || "Room not found"}</p>
        </Card>
      </div>
    );
  }

  const images = room.images?.length ? room.images : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to rooms
        </Link>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl text-foreground">
            Room {room.number}
          </h1>
          <Badge
            variant="outline"
            className={`capitalize ${STATUS_STYLES[room.status] || ""}`}
          >
            {room.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg text-foreground">Images</h2>
          </div>
          {images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((src) => (
                <Card
                  key={src}
                  className="overflow-hidden animate-fade-in-up"
                >
                  <img
                    src={src}
                    alt={`Room ${room.number}`}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BedDouble className="mx-auto w-9 h-9 text-primary" />
              <p className="mt-3 font-display text-base text-foreground">
                No images yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add image URLs from the Rooms list to show this room here.
              </p>
            </Card>
          )}
        </div>

        <Card className="h-fit">
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
                <span className="capitalize">{room.status}</span>
              </DetailRow>
              <DetailRow label="Amenities">
                {room.amenities?.length ? (
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Description">
                {room.description || "—"}
              </DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoomDetails;