import { useEffect, useState } from "react";
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  Wallet,
  UtensilsCrossed,
  Receipt,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DoorOpen,
  Home,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { getDashboardReport } from "../../api/reportApi";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const percent = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

const KpiCard = ({ label, value, hint, Icon, delay }) => (
  <Card className={`animate-fade-in-up animate-delay-${delay}`}>
    <CardContent className="py-4 flex items-start gap-3">
      <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </p>
        {hint && (
          <p className="truncate text-[11px] text-muted-foreground/80">{hint}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const BreakdownRow = ({ label, value, total, color, Icon }) => {
  const share = percent(value, total);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          {label}
        </span>
        <span className="font-medium text-foreground tabular-nums">
          {value}
          <span className="ml-2 text-xs text-muted-foreground tabular-nums">
            {share}%
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${share}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      const res = await getDashboardReport();
      setReport(res?.data || null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <CardContent className="space-y-4 px-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Occupancy, bookings and revenue at a glance.
            </p>
          </div>
          <Button variant="outline" onClick={() => loadReport(true)}>
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="py-10 px-0 text-center">
            <BarChart3 className="mx-auto w-9 h-9 text-primary" />
            <p className="mt-3 font-display text-lg text-foreground">
              Report unavailable
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "No report data to show."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { rooms, bookings, billing, payments, restaurant } = report;

  const occupancyRate = percent(rooms.occupiedRooms, rooms.totalRooms);
  const collectionRate = percent(billing.paidAmount, billing.totalRevenue);

  const kpis = [
    {
      label: "Occupancy",
      value: `${occupancyRate}%`,
      hint: `${rooms.occupiedRooms} of ${rooms.totalRooms} rooms`,
      Icon: BedDouble,
    },
    {
      label: "Total Bookings",
      value: bookings.totalBookings,
      hint: `${bookings.checkedInBookings} in house now`,
      Icon: CalendarCheck,
    },
    {
      label: "Billed Revenue",
      value: formatPrice(billing.totalRevenue),
      hint: `${formatPrice(billing.paidAmount)} collected`,
      Icon: Wallet,
    },
    {
      label: "Restaurant Revenue",
      value: formatPrice(restaurant.restaurantRevenue),
      hint: `${restaurant.totalOrders} orders`,
      Icon: UtensilsCrossed,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Occupancy, bookings and revenue at a glance.
          </p>
        </div>
        <Button variant="outline" onClick={() => loadReport(true)} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.label} {...kpi} delay={(idx + 1) * 100} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in-up animate-delay-200">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-foreground">
                  Room status
                </h2>
                <p className="text-xs text-muted-foreground">
                  {rooms.totalRooms} rooms in total
                </p>
              </div>
              <BedDouble className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              <BreakdownRow
                label="Available"
                value={rooms.availableRooms}
                total={rooms.totalRooms}
                color="rgb(16 185 129)"
                Icon={DoorOpen}
              />
              <BreakdownRow
                label="Occupied"
                value={rooms.occupiedRooms}
                total={rooms.totalRooms}
                color="rgb(139 92 246)"
                Icon={Home}
              />
              <BreakdownRow
                label="Reserved"
                value={rooms.reservedRooms}
                total={rooms.totalRooms}
                color="rgb(14 165 233)"
                Icon={CalendarCheck}
              />
              <BreakdownRow
                label="Maintenance"
                value={rooms.maintenanceRooms}
                total={rooms.totalRooms}
                color="rgb(239 68 68)"
                Icon={Wrench}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-300">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-foreground">
                  Booking status
                </h2>
                <p className="text-xs text-muted-foreground">
                  {bookings.totalBookings} bookings recorded
                </p>
              </div>
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              <BreakdownRow
                label="Confirmed"
                value={bookings.confirmedBookings}
                total={bookings.totalBookings}
                color="rgb(99 102 241)"
                Icon={CheckCircle2}
              />
              <BreakdownRow
                label="Checked in"
                value={bookings.checkedInBookings}
                total={bookings.totalBookings}
                color="rgb(16 185 129)"
                Icon={Home}
              />
              <BreakdownRow
                label="Checked out"
                value={bookings.checkedOutBookings}
                total={bookings.totalBookings}
                color="rgb(100 116 139)"
                Icon={Clock}
              />
              <BreakdownRow
                label="Cancelled"
                value={bookings.cancelledBookings}
                total={bookings.totalBookings}
                color="rgb(239 68 68)"
                Icon={XCircle}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up animate-delay-400">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg text-foreground">Finance</h2>
              <p className="text-xs text-muted-foreground">
                {collectionRate}% of billed amount collected
              </p>
            </div>
            <Receipt className="w-5 h-5 text-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Billed",
                value: formatPrice(billing.totalRevenue),
                Icon: Receipt,
                tone: "text-foreground",
              },
              {
                label: "Collected",
                value: formatPrice(billing.paidAmount),
                Icon: TrendingUp,
                tone: "text-emerald-600",
              },
              {
                label: "Outstanding",
                value: formatPrice(billing.outstandingAmount),
                Icon: TrendingDown,
                tone: "text-red-600",
              },
              {
                label: "Payments Received",
                value: formatPrice(payments.totalPaid),
                hint: `${payments.totalPayments} completed`,
                Icon: Wallet,
                tone: "text-foreground",
              },
            ].map(({ label, value, hint, Icon, tone }) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  <p className="text-xs">{label}</p>
                </div>
                <p
                  className={`mt-2 font-display text-lg tabular-nums ${tone}`}
                >
                  {value}
                </p>
                {hint && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                    {hint}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Collection progress
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {formatPrice(billing.paidAmount)} of{" "}
                {formatPrice(billing.totalRevenue)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
