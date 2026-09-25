import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Search } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { logoutApi } from "../../api/authApi.js";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center gap-4 px-4 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="hidden md:flex items-center flex-1 gap-2 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          className="pl-10"
        />
      </div>

      <div className="flex-1 md:hidden" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="relative text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
      </Button>

      <div className="h-8 w-px bg-border hidden sm:block" />

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[roleName] || roleName}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Log out"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="hidden xl:inline">Logout</span>
        </Button>
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