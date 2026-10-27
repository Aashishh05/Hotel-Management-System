import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BedDouble } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const roomTypeLabel = (type) => {
  const labels = {
    single: "Single Room",
    double: "Double Room",
    suite: "Suite",
    deluxe: "Deluxe Suite",
  };
  return labels[type] || type;
};

export const roomStatus = (status) => {
  const map = {
    available: {
      label: "Available",
      className: "text-primary border-primary/40 bg-primary/10",
      bookable: true,
    },
    reserved: {
      label: "Reserved",
      className: "border-sky-500/30 bg-sky-500/10 text-sky-600",
      bookable: false,
    },
    cleaning: {
      label: "Cleaning",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
      bookable: false,
    },
    occupied: {
      label: "Occupied",
      className: "border-border bg-muted/60 text-foreground",
      bookable: false,
    },
    maintenance: {
      label: "Maintenance",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
      bookable: false,
    },
  };

  return (
    map[status] || {
      label: status,
      className: "border-border bg-muted/60 text-foreground",
      bookable: false,
    }
  );
};

const RoomCard = ({ room, user, onBook }) => {
  const navigate = useNavigate();
  const statusInfo = roomStatus(room.status);
  const imageUrl = room.images?.[0]?.url;

  return (
    <Card className="flex flex-col p-4 min-[420px]:p-5 h-full transition-all hover:ring-2 hover:ring-primary/30">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Room ${room.number}`}
          loading="lazy"
          className="h-32 w-full rounded-lg object-cover border border-border"
        />
      ) : (
        <div className="h-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
          <BedDouble className="w-10 h-10 text-primary" />
        </div>
      )}

      <CardHeader className="px-0 pt-3 min-[420px]:pt-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm min-[420px]:text-base">
            Room {room.number} · {roomTypeLabel(room.type)}
          </CardTitle>
          <Badge variant="outline" className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
        </div>
        <CardDescription>
          Floor {room.floor ?? "—"} ·{" "}
          <span className="text-primary font-semibold text-base">
            ${room.pricePerNight}
          </span>
          <span className="text-muted-foreground"> / night</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pt-3 space-y-3 flex-1">
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="text-muted-foreground"
              >
                {amenity}
              </Badge>
            ))}
          </div>
        )}
        {room.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {room.description}
          </p>
        )}
      </CardContent>

      <div className="flex justify-end pt-2">
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
          aria-label={`View details for room ${room.number}`}
          onClick={() => navigate(`/rooms/${room._id}`)}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {statusInfo.bookable ? (
        user ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onBook?.(room)}
          >
            Book this room
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            nativeButton={false}
            render={<Link to="/login" />}
          >
            Book this room
          </Button>
        )
      ) : (
        <Button variant="outline" size="sm" className="w-full mt-2" disabled>
          {statusInfo.label}
        </Button>
      )}
    </Card>
  );
};

export default RoomCard;
