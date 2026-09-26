import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  IdCard,
  CalendarDays,
  Globe,
  MapPin,
} from "lucide-react";
import { getGuestById } from "../../api/guestApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

const ID_TYPE_LABELS = {
  passport: "Passport",
  "national-id": "National ID",
  "drivers-license": "Driver's License",
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right">
      {children}
    </dd>
  </div>
);

const DetailBlock = ({ Icon, title, children }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <dl className="space-y-3">{children}</dl>
    </CardContent>
  </Card>
);

const GuestDetails = () => {
  const { id } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGuestById(id);
        setGuest(res?.guest || null);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load guest");
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
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="animate-fade-in-up">
        <Link
          to="/guests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to guests
        </Link>
        <Card className="mt-6 p-10 text-center">
          <p className="text-sm text-destructive">
            {error || "Guest not found"}
          </p>
        </Card>
      </div>
    );
  }

  const joinedDate = new Date(guest.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          to="/guests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to guests
        </Link>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl text-foreground">
            {guest.name}
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            Registered {joinedDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailBlock Icon={Mail} title="Contact">
          <DetailRow label="Email">
            {guest.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {guest.email}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Phone">
            {guest.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {guest.phone}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={IdCard} title="Identity & address">
          <DetailRow label="ID type">
            {guest.idType ? ID_TYPE_LABELS[guest.idType] || guest.idType : "—"}
          </DetailRow>
          <DetailRow label="ID number">{guest.idNumber || "—"}</DetailRow>
          <DetailRow label="Nationality">
            {guest.nationality ? (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                {guest.nationality}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Address">
            {guest.address ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                {guest.address}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
        </DetailBlock>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="w-4 h-4 text-primary" />
            <CardTitle>Stays & bookings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This guest&apos;s stays and reservations will appear here once the
            Bookings module is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestDetails;
