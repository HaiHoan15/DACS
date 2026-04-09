import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserAsync } from "./redux/authSlice";
import { generateRoutes } from "./routes/index.jsx";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Refresh user data từ server khi app load
  useEffect(() => {
    console.log("App useEffect - user:", user);
    if (user && user.id) {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);
      if (token) {
        console.log("Dispatching fetchUserAsync for userId:", user.id);
        dispatch(fetchUserAsync({
          userId: user.id,
          token: token
        })).then(result => {
          console.log("fetchUserAsync result:", result);
        });
      }
    }
  }, []); // Chỉ chạy một lần khi app mount

  // Kiểm tra role và redirect tự động
  useEffect(() => {
    if (user && user.role) {
      const currentPath = window.location.pathname;
      
      // Nếu là Admin, redirect sang trang admin
      if (user.role === "admin" && !currentPath.startsWith("/admin")) {
        window.location.href = "/admin";
      }
      // Nếu là User, không redirect, cho phép duyệt trang chính
      else if (user.role === "user" && currentPath.startsWith("/admin")) {
        window.location.href = "/";
      }
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        {generateRoutes()}
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;