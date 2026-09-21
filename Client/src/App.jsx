import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/guards/ProtectedRoute";

const Dashboard = () => (
  <div
    className="min-h-screen grid place-items-center"
    style={{ fontFamily: "'Montserrat', sans-serif" }}
  >
    <h1 className="text-2xl text-slate-800">Dashboard — logged in!</h1>
  </div>
);

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
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