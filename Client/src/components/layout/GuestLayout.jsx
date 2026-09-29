import { Suspense, useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  Hexagon,
  X,
  LogOut,
  Menu,
  LayoutDashboard,
  BedDouble,
  UtensilsCrossed,
  ClipboardList,
  Wrench,
  Receipt,
  Home,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { logoutApi } from "../../api/authApi.js";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
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

const GUEST_LINKS = [
  { label: "Overview", path: "/guest", Icon: LayoutDashboard },
  { label: "My Stays", path: "/guest/stays", Icon: BedDouble },
  { label: "Restaurant", path: "/guest/menu", Icon: UtensilsCrossed },
  { label: "My Orders", path: "/guest/orders", Icon: ClipboardList },
  { label: "Maintenance", path: "/guest/maintenance", Icon: Wrench },
  { label: "Invoices", path: "/guest/billing", Icon: Receipt },
];

const PageLoader = () => (
  <div className="grid min-h-64 place-items-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const GuestLayout = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    } catch (error) {
      console.log(error);
    } finally {
      logoutUser();
      window.location.assign("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar text-sidebar-foreground/80 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer text-left"
          >
            <Hexagon className="w-6 h-6 text-sidebar-primary" strokeWidth={2.5} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground tracking-wide">
                Grand Horizon
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-sidebar-primary">
                Guest Portal
              </p>
            </div>
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {GUEST_LINKS.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
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

          <div className="pt-3 mt-3 border-t border-sidebar-border">
            <NavLink
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Home className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">Back to Home</span>
            </NavLink>
          </div>
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

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center gap-4 px-4 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1" />

          <ThemeToggle />

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
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default GuestLayout;