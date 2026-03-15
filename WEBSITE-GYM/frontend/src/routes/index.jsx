/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */

import { Route, Navigate } from "react-router-dom";
// trang chính
import Home from "../pages/Home";
import HomePage from "../pages/Home/HomePage";

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
            // {
            //     path: "gioi-thieu",
            //     element: AboutPage,
            // },
        ],
    },
    {
        path: "admin",
        // Element: AdminRouteWrapper(Admin),
        Element: Admin,
        nested: [
            {
                index: true,
                element: AdminPage,
            },
            // {
            //     path: "quan-ly-san-pham",
            //     element: ProductManagement,
            // },
           
        ],
    },
    // {
    //     path: "auth",
    //     Element: AuthPage,
    // },
];

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
