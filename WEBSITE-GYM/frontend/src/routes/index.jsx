/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */

import { Route, Navigate } from "react-router-dom";
// trang chính
import Home from "../pages/Home";
import HomePage from "../pages/Home/HomePage";

import AccountPage from "../pages/Home/AccountPage";
import LoginPage from "../pages/Home/AccountPage/LoginPage";
import RegisterPage from "../pages/Home/AccountPage/RegisterPage";

import AboutPage from "../pages/Home/AboutPage";
import ServicePage from "../pages/Home/ServicePage";
import ProductPage from "../pages/Home/ProductPage";
import NewsPage from "../pages/Home/NewsPage";

//trang người dùng
import UserPage from "../pages/Home/UserPage";

//trang quản lý
import Admin from "../pages/Admin";
import AdminPage from "../pages/Admin/AdminPage";

//trang giáo viên

const routes = [
    {
        path: "/",
        Element: Home,
        nested: [
            {
                index: true,
                element: HomePage,
            },
            {
                path: "account",
                element: AccountPage,
            },
            {
                path: "login",
                element: LoginPage,
            },
            {
                path: "register",
                element: RegisterPage,
            },
            {
                path: "about",
                element: AboutPage,
            },
            {
                path: "service",
                element: ServicePage,
            },
            {
                path: "product",
                element: ProductPage,
            },
            {
                path: "news",
                element: NewsPage,

            },
            {
                path: "user",
                element: RedirectToUser,
            },
            {
                path: "user/:username",
                element: UserPage,
            }
        ],
    },
    {
        path: "admin",
        Element: AdminRouteWrapper(Admin),
        // Element: Admin,
        nested: [
            {
                index: true,
                element: AdminPage,
            },
        ],
    },
    // {
    //     path: "auth",
    //     Element: AuthPage,
    // },
];

//chặn vào trang admin nếu ko phải là admin
function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.Role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        return <Navigate to="/" replace />;
    }
    return children;
}
function AdminRouteWrapper(Component) {
    return function ProtectedAdmin() {
        return (
            <AdminRoute>
                <Component />
            </AdminRoute>
        );
    };
}

// hiện tên người dùng trong đường dẫn
function RedirectToUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return <Navigate to="/login" replace />;
    const username = user.username || "";
    if (!username) return <Navigate to="/login" replace />;
    const slug = toSlug(username);
    return <Navigate to={`/user/${slug}`} replace />;
}

// chỉnh tên đường dẫn ko dấu + space = "-"
function toSlug(s) {
    return (s || "")
        .toString()
        .normalize("NFD")                       // tách dấu
        .replace(/[\u0300-\u036f]/g, "")        // bỏ dấu
        .replace(/[^a-zA-Z0-9\s-]/g, "")        // bỏ ký tự đặc biệt
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

// hàm tạo routes
export const generateRoutes = () => {
    return routes.map((route) => {
        if (route.nested) {
            return (
                <Route
                    key={route.path}
                    path={route.path}
                    element={<route.Element />}
                >
                    {route.nested.map((item) =>
                        item.index ? (
                            <Route key="index" index element={<item.element />} />
                        ) : (
                            <Route
                                key={item.path}
                                path={item.path}
                                element={<item.element />}
                            />
                        )
                    )}
                </Route>
            );
        } else {
            return (
                <Route
                    key={route.path}
                    path={route.path}
                    element={<route.Element />}
                />
            );
        }
    });
};
