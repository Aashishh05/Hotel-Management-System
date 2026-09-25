import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
