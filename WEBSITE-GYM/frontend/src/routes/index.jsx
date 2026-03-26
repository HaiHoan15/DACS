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

//trang quản lý các tài khoản
import UserManagement from "../pages/Admin/UserManagement";
import UM_Detail from "../pages/Admin/UserManagement/UM_Detail";

//trang quản lý sản phẩm
import ProductManagement from "../pages/Admin/ProductManagement";
import AddCategory from "../pages/Admin/ProductManagement/Category/dashboard/add";
import EditCategory from "../pages/Admin/ProductManagement/Category/dashboard/edit";
import CategoryDetail from "../pages/Admin/ProductManagement/Category/dashboard/detail";
import AddProduct from "../pages/Admin/ProductManagement/Product/dashboard/add";
import EditProduct from "../pages/Admin/ProductManagement/Product/dashboard/edit";
import ProductDetail from "../pages/Admin/ProductManagement/Product/dashboard/detail";

//trang test
import test from "../pages/Admin/TEST";

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
                element: ProtectedUserRouteWrapper(UserPage),
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
            {
                path: "UserManagement",
                element: UserManagement,
            },
            {
                path: "UserManagement/UM_Detail/:username",
                element: UM_Detail,
            },
            {
                path: "ProductManagement",
                element: ProductManagement,
            },
            {
                path: "ProductManagement/category/dashboard/add",
                element: AddCategory,
            },
            {
                path: "ProductManagement/category/dashboard/edit/:categoryId",
                element: EditCategory,
            },
            {
                path: "ProductManagement/category/dashboard/detail/:categoryId",
                element: CategoryDetail,
            },
            {
                path: "ProductManagement/product/dashboard/add",
                element: AddProduct,
            },
            {
                path: "ProductManagement/product/dashboard/edit/:productId",
                element: EditProduct,
            },
            {
                path: "ProductManagement/product/dashboard/detail/:productId",
                element: ProductDetail,
            },
            {
                path: "test",
                element: test,
            }
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
    if (!user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
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

//chặn vào trang user nếu chưa đăng nhập
function ProtectedUserRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
function ProtectedUserRouteWrapper(Component) {
    return function ProtectedUser() {
        return (
            <ProtectedUserRoute>
                <Component />
            </ProtectedUserRoute>
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

// Export toSlug để dùng ở components khác
export { toSlug };

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
