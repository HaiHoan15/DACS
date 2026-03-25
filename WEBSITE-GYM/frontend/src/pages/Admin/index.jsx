import { Outlet } from "react-router-dom";
import Header from "./_Components/header";

export default function Admin() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <Outlet />
    </div>
  );
}