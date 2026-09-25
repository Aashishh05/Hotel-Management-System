import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
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
  LayoutDashboard,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { sidebarItems } from "../../constants/sidebarConfig.js";
import { getDashboardSummary } from "../../api/dashboardApi.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";

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

const money = (n = 0) => `$${Number(n).toLocaleString()}`;

const buildMetric = (report) => {
  const { rooms, bookings, billing, payments, restaurant } = report;

  return {
    revenue: {
      label: "Total Revenue",
      value: money(billing.totalRevenue),
      hint: "From all bills",
      Icon: Banknote,
    },
    paid: {
      label: "Paid",
      value: money(billing.paidAmount),
      hint: `${payments.totalPayments} payments`,
      Icon: Wallet,
    },
    outstanding: {
      label: "Outstanding",
      value: money(billing.outstandingAmount),
      hint: "Unpaid balance",
      Icon: ReceiptText,
    },
    bookings: {
      label: "Bookings",
      value: bookings.totalBookings,
      hint: `${bookings.confirmedBookings} confirmed`,
      Icon: CalendarCheck,
    },
    confirmed: {
      label: "Confirmed",
      value: bookings.confirmedBookings,
      hint: `${bookings.checkedInBookings} checked in`,
      Icon: CalendarCheck,
    },
    cancelled: {
      label: "Cancelled",
      value: bookings.cancelledBookings,
      hint: "Of all bookings",
      Icon: CalendarX2,
    },
    rooms: {
      label: "Rooms",
      value: rooms.totalRooms,
      hint: `${rooms.availableRooms} available`,
      Icon: BedDouble,
    },
    availableRooms: {
      label: "Rooms Available",
      value: rooms.availableRooms,
      hint: `of ${rooms.totalRooms} total`,
      Icon: BedDouble,
    },
    occupiedRooms: {
      label: "Rooms Occupied",
      value: rooms.occupiedRooms,
      hint: `${rooms.reservedRooms} reserved`,
      Icon: DoorOpen,
    },
    roomsMaintenance: {
      label: "Maintenance",
      value: rooms.maintenanceRooms,
      hint: "Needs repair",
      Icon: Wrench,
    },
    orders: {
      label: "Restaurant Orders",
      value: restaurant.totalOrders,
      hint: "All orders",
      Icon: UtensilsCrossed,
    },
    restaurantRevenue: {
      label: "Restaurant Revenue",
      value: money(restaurant.restaurantRevenue),
      hint: "From orders",
      Icon: Banknote,
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

const StatCard = ({ metric, delay }) => {
  const { label, value, hint, Icon } = metric;

  return (
    <Card
      className={`transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/40 animate-fade-in-up animate-delay-${delay}`}
    >
      <CardContent className="py-4 px-0 flex items-start justify-between space-x-2">
        <div className="space-y-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight truncate">{value}</p>
          <p className="text-xs text-muted-foreground/70">{hint}</p>
        </div>
        <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
};

const StatSkeleton = () => (
  <Card className="p-5 animate-pulse">
    <CardContent className="space-y-4 px-0">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-7 w-10" />
      <Skeleton className="h-2 w-24 bg-muted-foreground/10" />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const roleName = user?.role?.name;
  const firstName = user?.name?.split(" ")[0] || "there";
  const roleLabel = ROLE_LABELS[roleName] || roleName;
  const isSuperAdmin = roleName === "superadmin";

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

  const quickLinks = sidebarItems
    .filter((item) => {
      if (isSuperAdmin) return true;
      if (item.module === "dashboard") return false;
      return permissions?.modules?.[item.module]?.read === true;
    })
    .slice(0, 6);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Welcome back, {firstName}</CardTitle>
            <CardDescription>{today}</CardDescription>
          </div>
          <Badge variant="outline">{roleLabel}</Badge>
        </CardHeader>
      </Card>

      {error ? (
        <Card className="animate-fade-in-up">
          <CardContent className="py-6 px-0">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : loading || !metrics || !report ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metricKeys.map((key, index) => (
            <StatCard key={key} metric={metrics[key]} delay={(index + 1) * 100} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <Card className="animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump straight into the modules you use most.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.length > 0 ? (
                quickLinks.map(({ label, path, Icon }) => (
                  <Button
                    key={path}
                    variant="outline"
                    className="justify-start h-auto py-3 text-foreground"
                    render={<Link to={path} />}
                  >
                    <Icon className="w-4.5 h-4.5 text-primary" />
                    {label}
                  </Button>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  No other modules available for your role yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;