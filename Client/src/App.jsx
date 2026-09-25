import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Rooms from "./pages/rooms/Rooms.jsx";
import RoomDetails from "./pages/rooms/RoomDetails.jsx";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
          </Route>
        </Route>
      </Routes>

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
