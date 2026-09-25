import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Hexagon, X, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { sidebarItems } from "../../constants/sidebarConfig.js";
import { logoutApi } from "../../api/authApi.js";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import { Button } from "../ui/button";

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

const Sidebar = ({ open, onClose }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { permissions } = useSelector((state) => state.permission);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSuperAdmin = user?.role?.name === "superadmin";

  const roleName = user?.role?.name;
  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const visibleItems = sidebarItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.module === "dashboard") return true;
    return permissions?.modules?.[item.module]?.read === true;
  });

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutApi();
    } catch (error) {
      console.log(error);
    } finally {
      logoutUser();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar text-sidebar-foreground/80 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Hexagon className="w-6 h-6 text-sidebar-primary" strokeWidth={2.5} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground tracking-wide">
                Grand Horizon
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-sidebar-primary">
                Hotel Management
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleItems.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {ROLE_LABELS[roleName] || roleName}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmOpen(true)}
              aria-label="Log out"
              className="text-sidebar-foreground/60 hover:text-destructive"
            >
              <LogOut className="w-4.5 h-4.5" />
            </Button>
          </div>
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
      </aside>
    </>
  );
};

export default Sidebar;
