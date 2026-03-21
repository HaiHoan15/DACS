import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UserPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Nếu không có user, redirect về login
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        User page here
    </div>
  );
}