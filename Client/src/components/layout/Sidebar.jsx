import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Hexagon, X } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { sidebarItems } from "../../constants/sidebarConfig.js";

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const isSuperAdmin = user?.role?.name === "superadmin";

  const visibleItems = sidebarItems.filter((item) => {
    if (isSuperAdmin) return true;
    return permissions?.modules?.[item.module]?.read === true;
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-900 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Hexagon className="w-6 h-6 text-[#C9A15A]" strokeWidth={2.5} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white tracking-wide">
                Grand Horizon
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A15A]">
                Hotel Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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
                    ? "bg-[#C9A15A] text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;