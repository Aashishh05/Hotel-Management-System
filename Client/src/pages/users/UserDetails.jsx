import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Clock3,
  UserCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { getUserById } from "../../api/userApi";
import { getAllRoles } from "../../api/roleApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

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

const UserDetails = () => {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          getUserById(id),
          getAllRoles(),
        ]);
        setUser(userRes?.user || null);
        setRoles(rolesRes?.roles || []);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load user");
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

  if (error || !user) {
    return (
      <div className="animate-fade-in-up">
        <Link
          to="/users"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
        <Card className="mt-6 p-10 text-center">
          <p className="text-sm text-destructive">
            {error || "User not found"}
          </p>
        </Card>
      </div>
    );
  }

  const isSelf = user._id === me?._id;
  const roleName = user.role?.name;
  const role = roles.find((r) => r.name === roleName);
  const joinedDate = formatDate(user.createdAt);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          to="/users"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {initials(user.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl text-foreground">
                {user.name}
              </h1>
              {isSelf && (
                <Badge variant="secondary" className="h-5">
                  You
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {joinedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Member since {joinedDate}
                </span>
              )}
              {role && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role.displayName || roleName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailBlock Icon={Mail} title="Contact">
          <DetailRow label="Email">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {user.email}
            </span>
          </DetailRow>
          <DetailRow label="Phone">
            {user.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {user.phone}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
        </DetailBlock>

        <DetailBlock Icon={UserCheck} title="Account">
          <DetailRow label="Role">
            <Badge variant="secondary">
              {role?.displayName || roleName || "—"}
            </Badge>
          </DetailRow>
          <DetailRow label="Status">
            {user.isActive ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </DetailRow>
          <DetailRow label="Last login">
            {user.lastLogin ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-muted-foreground" />
                {formatDateTime(user.lastLogin)}
              </span>
            ) : (
              "Never"
            )}
          </DetailRow>
        </DetailBlock>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="w-4 h-4 text-primary" />
            <CardTitle>Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This user&apos;s activity log will appear here once the Audit Logs
            module is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;