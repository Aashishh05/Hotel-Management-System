import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  CalendarCheck,
  CalendarX2,
  BedDouble,
  Wallet,
  DoorOpen,
  ReceiptText,
  Wrench,
  UtensilsCrossed,
  CheckCircle2,
  LogOut,
  Sparkles,
  TrendingUp,
  Percent,
  Users,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { getDashboardSummary } from "../../api/dashboardApi.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

const ROLE_LABELS = {
  superadmin: "Super Admin",
  hoteladmin: "Hotel Admin",
  frontdesk: "Front Desk",
  housekeeper: "Housekeeper",
  maintenance: "Maintenance",
  accountant: "Accountant",
  restaurantmanager: "Restaurant Manager",
  chef: "Chef",
  securitystaff: "Security Staff",
  guest: "Guest",
};

const money = (n = 0) => `$${Number(n || 0).toLocaleString()}`;

const pct = (part, whole) =>
  whole > 0 ? Math.round((Number(part || 0) / Number(whole || 0)) * 100) : 0;

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const end = Number(target || 0);
    if (!end) {
      setValue(0);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
};

const buildMetric = (report) => {
  const { rooms, bookings, billing, payments, restaurant } = report;

  return {
    revenue: {
      label: "Total Revenue",
      value: money(billing.totalRevenue),
      raw: billing.totalRevenue,
      hint: "From all bills",
      Icon: Banknote,
      tone: "text-primary bg-primary/10",
    },
    paid: {
      label: "Paid",
      value: money(billing.paidAmount),
      raw: billing.paidAmount,
      hint: `${payments.totalPayments} payments`,
      Icon: Wallet,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    outstanding: {
      label: "Outstanding",
      value: money(billing.outstandingAmount),
      raw: billing.outstandingAmount,
      hint: "Unpaid balance",
      Icon: ReceiptText,
      tone: "text-amber-600 bg-amber-500/10",
    },
    bookings: {
      label: "Bookings",
      value: bookings.totalBookings,
      hint: `${bookings.confirmedBookings} confirmed`,
      Icon: CalendarCheck,
      tone: "text-sky-600 bg-sky-500/10",
    },
    confirmed: {
      label: "Confirmed",
      value: bookings.confirmedBookings,
      hint: `${bookings.checkedInBookings} checked in`,
      Icon: CalendarCheck,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    cancelled: {
      label: "Cancelled",
      value: bookings.cancelledBookings,
      hint: "Of all bookings",
      Icon: CalendarX2,
      tone: "text-destructive bg-destructive/10",
    },
    rooms: {
      label: "Rooms",
      value: rooms.totalRooms,
      hint: `${rooms.availableRooms} available`,
      Icon: BedDouble,
      tone: "text-primary bg-primary/10",
    },
    availableRooms: {
      label: "Rooms Available",
      value: rooms.availableRooms,
      hint: `of ${rooms.totalRooms} total`,
      Icon: BedDouble,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    occupiedRooms: {
      label: "Rooms Occupied",
      value: rooms.occupiedRooms,
      hint: `${rooms.reservedRooms} reserved`,
      Icon: DoorOpen,
      tone: "text-sky-600 bg-sky-500/10",
    },
    roomsMaintenance: {
      label: "Maintenance",
      value: rooms.maintenanceRooms,
      hint: "Needs repair",
      Icon: Wrench,
      tone: "text-amber-600 bg-amber-500/10",
    },
    orders: {
      label: "Restaurant Orders",
      value: restaurant.totalOrders,
      hint: "All orders",
      Icon: UtensilsCrossed,
      tone: "text-violet-600 bg-violet-500/10",
    },
    restaurantRevenue: {
      label: "Restaurant Revenue",
      value: money(restaurant.restaurantRevenue),
      raw: restaurant.restaurantRevenue,
      hint: "From orders",
      Icon: Banknote,
      tone: "text-violet-600 bg-violet-500/10",
    },
  };
};

const ROLE_METRICS = {
  superadmin: ["revenue", "bookings", "rooms", "orders"],
  hoteladmin: ["revenue", "bookings", "rooms", "orders"],
  frontdesk: ["availableRooms", "occupiedRooms", "confirmed", "outstanding"],
  housekeeper: ["rooms", "occupiedRooms", "availableRooms", "roomsMaintenance"],
  maintenance: ["rooms", "occupiedRooms", "availableRooms", "roomsMaintenance"],
  accountant: ["revenue", "paid", "outstanding", "cancelled"],
  restaurantmanager: ["orders", "restaurantRevenue", "bookings", "rooms"],
  chef: ["orders", "restaurantRevenue"],
  securitystaff: ["rooms", "occupiedRooms", "availableRooms", "confirmed"],
  guest: ["availableRooms", "rooms", "orders", "bookings"],
};

const AnimatedValue = ({ metric }) => {
  const isMoney = typeof metric.value === "string";
  const animated = useCountUp(metric.raw);

  if (!isMoney) return <>{metric.value}</>;

  return <>{money(animated)}</>;
};

const StatCard = ({ metric, delay }) => {
  const { label, hint, Icon } = metric;

  return (
    <Card className={`animate-fade-in-up animate-delay-${delay}`}>
      <CardContent className="py-4 flex items-start gap-3">
        <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold leading-none tracking-tight tabular-nums">
            <AnimatedValue metric={metric} />
          </p>
          <p className="truncate text-[11px] text-muted-foreground/80">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const StatSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="space-y-3 px-0">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-16" />
    </CardContent>
  </Card>
);

const RingStat = ({ percent, label, sub, icon: Icon }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="9"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="text-xl font-semibold tabular-nums">{percent}%</p>
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
};

const ProgressRow = ({ label, value, count, tone }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {value}%
        {count !== undefined && (
          <span className="ml-1.5 text-muted-foreground/70">{count}</span>
        )}
      </span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${tone} transition-[width] duration-1000 ease-out`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

const BreakdownRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <span className="flex items-center gap-2.5 text-xs">
      <span className={`size-2 rounded-full ${tone}`} />
      <span className="text-muted-foreground">{label}</span>
    </span>
    <span className="text-xs font-medium tabular-nums">{value}</span>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const roleName = user?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const firstName = user?.name?.split(" ")[0] || "there";
  const roleLabel = ROLE_LABELS[roleName] || roleName;

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        const res = await getDashboardSummary();
        if (mounted) setReport(res?.data);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const metricKeys = ROLE_METRICS[roleName] || ROLE_METRICS.guest;
  const metrics = report ? buildMetric(report) : null;

  const rooms = report?.rooms;
  const bookings = report?.bookings;
  const billing = report?.billing;
  const restaurant = report?.restaurant;

  const occupancyRate = pct(rooms?.occupiedRooms, rooms?.totalRooms);
  const collectionRate = pct(billing?.paidAmount, billing?.totalRevenue);
  const cancellationRate = pct(bookings?.cancelledBookings, bookings?.totalBookings);
  const restaurantShare = pct(
    restaurant?.restaurantRevenue,
    Number(billing?.totalRevenue || 0) + Number(restaurant?.restaurantRevenue || 0),
  );

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/8 animate-fade-in">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-chart-5/20 blur-3xl"
        />
<CardHeader className="relative flex-row flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {today}
              </p>
              <CardTitle className="mt-1 text-xl lg:text-2xl">
                Welcome back, {firstName}
              </CardTitle>
              <CardDescription className="text-xs">
                {isSuperAdmin
                  ? "Full property overview — revenue, occupancy and operations at a glance."
                  : "Here's what's happening across the property today."}
              </CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary"
              >
                {roleLabel}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live
              </Badge>
            </div>
          </CardHeader>

          {!loading && !error && (
            <CardContent className="relative">
              <Separator className="mb-3 bg-border/70" />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Revenue",
                    value: money(billing?.totalRevenue),
                    Icon: TrendingUp,
                  },
                  {
                    label: "Occupancy",
                    value: `${occupancyRate}%`,
                    Icon: BedDouble,
                  },
                  {
                    label: "Collected",
                    value: `${collectionRate}%`,
                    Icon: Wallet,
                  },
                  {
                    label: "In House",
                    value: rooms?.occupiedRooms ?? 0,
                    Icon: Users,
                  },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-base font-semibold tabular-nums tracking-tight">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

      {error ? (
        <Card className="animate-fade-in-up">
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : loading || !metrics || !report ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metricKeys.map((key, index) => (
            <StatCard
              key={key}
              metric={metrics[key]}
              delay={(index + 1) * 100}
            />
          ))}
        </div>
      )}

      {!loading && !error && report && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card
              size="sm"
              className="animate-fade-in-up animate-delay-200"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Occupancy
                </CardTitle>
                <CardDescription className="text-xs">
                  Live room status across the property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <RingStat
                  percent={occupancyRate}
                  label="Occupied"
                  sub={`${rooms.occupiedRooms} of ${rooms.totalRooms} rooms occupied`}
                  icon={Percent}
                />
                <Separator className="bg-border/70" />
                <div className="divide-y divide-border/60">
                  <BreakdownRow
                    label="Available"
                    value={rooms.availableRooms}
                    tone="bg-emerald-500"
                  />
                  <BreakdownRow
                    label="Occupied"
                    value={rooms.occupiedRooms}
                    tone="bg-sky-500"
                  />
                  <BreakdownRow
                    label="Reserved"
                    value={rooms.reservedRooms}
                    tone="bg-chart-3"
                  />
                  <BreakdownRow
                    label="Maintenance"
                    value={rooms.maintenanceRooms}
                    tone="bg-amber-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="animate-fade-in-up animate-delay-300"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Revenue
                </CardTitle>
                <CardDescription className="text-xs">
                  Collections and income mix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {money(billing.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {money(billing.paidAmount)} collected ·{" "}
                    {money(billing.outstandingAmount)} outstanding
                  </p>
                </div>
                <Separator className="bg-border/70" />
                <div className="space-y-2.5">
                  <ProgressRow
                    label="Collected"
                    value={collectionRate}
                    tone="bg-emerald-500"
                  />
                  <ProgressRow
                    label="Outstanding"
                    value={100 - collectionRate}
                    tone="bg-amber-500"
                  />
                  <ProgressRow
                    label="Restaurant share"
                    value={restaurantShare}
                    count={`${money(restaurant.restaurantRevenue)}`}
                    tone="bg-violet-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="animate-fade-in-up animate-delay-400"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Bookings
                </CardTitle>
                <CardDescription className="text-xs">
                  Reservation pipeline health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2.5">
                  <ProgressRow
                    label="Confirmed"
                    value={pct(bookings.confirmedBookings, bookings.totalBookings)}
                    count={bookings.confirmedBookings}
                    tone="bg-primary"
                  />
                  <ProgressRow
                    label="Checked in"
                    value={pct(bookings.checkedInBookings, bookings.totalBookings)}
                    count={bookings.checkedInBookings}
                    tone="bg-sky-500"
                  />
                  <ProgressRow
                    label="Checked out"
                    value={pct(bookings.checkedOutBookings, bookings.totalBookings)}
                    count={bookings.checkedOutBookings}
                    tone="bg-muted-foreground/60"
                  />
                  <ProgressRow
                    label="Cancelled"
                    value={cancellationRate}
                    count={bookings.cancelledBookings}
                    tone="bg-destructive/70"
                  />
                </div>
                <Separator className="bg-border/70" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total bookings</span>
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {bookings.totalBookings}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <LogOut className="w-3.5 h-3.5" />
            Signed in as {user?.email}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;