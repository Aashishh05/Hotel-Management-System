import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Search } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { logoutApi } from "../../api/authApi.js";
import ConfirmDialog from "../common/ConfirmDialog.jsx";

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

const Topbar = ({ onMenuClick }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const roleName = user?.role?.name;
  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutApi();
    } catch(error) {
      console.log(error)
    } finally {
      logoutUser();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="text-slate-500 hover:text-slate-900 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden md:flex items-center flex-1 gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
        />
      </div>

      <div className="flex-1 md:hidden" />

      <button
        type="button"
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A15A]" />
      </button>

      <div className="h-8 w-px bg-slate-200 hidden sm:block" />

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-medium text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-400">
            {ROLE_LABELS[roleName] || roleName}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D9B872] to-[#C9A15A] text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          aria-label="Log out"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="hidden xl:inline">Logout</span>
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        busy={loggingOut}
        onConfirm={() => {
          setConfirmOpen(false);
          handleLogout();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </header>
  );
};

export default Topbar;