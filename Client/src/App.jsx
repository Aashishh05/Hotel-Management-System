import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const Rooms = lazy(() => import("./pages/rooms/Rooms.jsx"));
const RoomDetails = lazy(() => import("./pages/rooms/RoomDetails.jsx"));
const Guests = lazy(() => import("./pages/guests/Guests.jsx"));
const GuestDetails = lazy(() => import("./pages/guests/GuestDetails.jsx"));
const Bookings = lazy(() => import("./pages/bookings/Bookings.jsx"));
const BookingDetails = lazy(() =>
  import("./pages/bookings/BookingDetails.jsx")
);

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

          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/guests/:id" element={<GuestDetails />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetails />} />
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
