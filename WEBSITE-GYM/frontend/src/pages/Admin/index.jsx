import { Outlet } from "react-router-dom";
export default function Admin() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}