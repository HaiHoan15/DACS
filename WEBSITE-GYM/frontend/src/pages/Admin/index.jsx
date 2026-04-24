import { Outlet } from "react-router-dom";
import Header from "./_Components/header";
import { useState } from "react";
import AdminDashboard from "./AdminPage/AdminDashboard";

export default function Admin() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 min-h-0">
        <AdminDashboard
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((prev) => !prev)}
        />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}