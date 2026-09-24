import useAuth from "../../hooks/useAuth.js";

const Dashboard = () => {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Welcome back, {firstName}
        </h2>
        <p className="text-sm text-slate-500">
          Your dashboard is ready. Module pages will be added here next.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {["Rooms", "Bookings", "Guests", "Revenue"].map((label) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse"
          >
            <div className="h-2.5 w-16 bg-slate-200 rounded mb-4" />
            <div className="h-7 w-10 bg-slate-200 rounded mb-2" />
            <div className="h-2 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;