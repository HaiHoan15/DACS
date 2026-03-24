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

  return (
    <BrowserRouter>
      <Routes>
        {generateRoutes()}
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;