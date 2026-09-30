import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import GuestLayout from "./components/layout/GuestLayout.jsx";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const Rooms = lazy(() => import("./pages/rooms/Rooms.jsx"));
const RoomDetails = lazy(() => import("./pages/rooms/RoomDetails.jsx"));
const Guests = lazy(() => import("./pages/guests/Guests.jsx"));
const GuestDetails = lazy(() => import("./pages/guests/GuestDetails.jsx"));
const Bookings = lazy(() => import("./pages/bookings/Bookings.jsx"));
const BookingDetails = lazy(
  () => import("./pages/bookings/BookingDetails.jsx"),
);
const CheckInCheckout = lazy(
  () => import("./pages/checkin-checkout/CheckInCheckout.jsx"),
);
const Users = lazy(() => import("./pages/users/Users.jsx"));
const UserDetails = lazy(() => import("./pages/users/UserDetails.jsx"));
const Roles = lazy(() => import("./pages/roles/Roles.jsx"));
const Permissions = lazy(() => import("./pages/permissions/Permissions.jsx"));
const Housekeeping = lazy(
  () => import("./pages/housekeeping/Housekeeping.jsx"),
);
const Maintenance = lazy(() => import("./pages/maintenance/Maintenance.jsx"));
const MaintenanceDetails = lazy(
  () => import("./pages/maintenance/MaintenanceDetails.jsx"),
);
const Billing = lazy(() => import("./pages/billing/Billing.jsx"));
const MyStay = lazy(() => import("./pages/my-stay/MyStay.jsx"));
const GuestOverview = lazy(() => import("./pages/guest/Overview.jsx"));
const GuestStays = lazy(() => import("./pages/guest/MyStays.jsx"));
const GuestMenu = lazy(() => import("./pages/guest/Menu.jsx"));
const GuestOrders = lazy(() => import("./pages/guest/Orders.jsx"));
const GuestOrderDetails = lazy(() => import("./pages/guest/OrderDetails.jsx"));
const GuestMaintenance = lazy(() => import("./pages/guest/Maintenance.jsx"));
const GuestBills = lazy(() => import("./pages/guest/Bills.jsx"));
const MenuAdmin = lazy(() => import("./pages/menu/Menu.jsx"));
const Restaurant = lazy(() => import("./pages/resturant/Restaurant.jsx"));
const Reports = lazy(() => import("./pages/reports/Reports.jsx"));
const AuditLogs = lazy(() => import("./pages/auditLogs/AuditLogs.jsx"));

const PageLoader = () => (
  <div className="grid min-h-svh place-items-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-stay" element={<MyStay />} />
          </Route>

          <Route element={<GuestLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/guest" element={<GuestOverview />} />
              <Route path="/guest/stays" element={<GuestStays />} />
              <Route path="/guest/menu" element={<GuestMenu />} />
              <Route path="/guest/orders" element={<GuestOrders />} />
              <Route path="/guest/orders/:id" element={<GuestOrderDetails />} />
              <Route path="/guest/maintenance" element={<GuestMaintenance />} />
              <Route path="/guest/billing" element={<GuestBills />} />
            </Route>
          </Route>

          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/guests/:id" element={<GuestDetails />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetails />} />
              <Route path="/checkin-checkout" element={<CheckInCheckout />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<UserDetails />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/housekeeping" element={<Housekeeping />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetails />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/menu" element={<MenuAdmin />} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
};

export default App;
