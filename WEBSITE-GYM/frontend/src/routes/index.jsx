/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */

import { Route, Navigate } from "react-router-dom";
// trang chính
import Home from "../pages/Home";
import HomePage from "../pages/Home/HomePage";

//trang tài khoản
import AccountPage from "../pages/Home/AccountPage";
import LoginPage from "../pages/Home/AccountPage/LoginPage";
import RegisterPage from "../pages/Home/AccountPage/RegisterPage";

//trang giao diện người dùng
import AboutPage from "../pages/Home/AboutPage";
import ServicePage from "../pages/Home/ServicePage";
import NewsPage from "../pages/Home/NewsPage";
import NewsDetail from "../pages/Home/NewsPage/NewsDetail";
import TEST from "../pages/Home/TEST";

//trang sản phẩm cho người dùng
import ProductPage from "../pages/Home/ProductPage";
import ProductDetailPage from "../pages/Home/ProductDetailPage";

//trang người dùng
import UserPage from "../pages/Home/UserPage";
import PaymentCallback from "../pages/Home/UserPage/PaymentCallback";
import ServicePaymentCallback from "../pages/Home/ServicePage/PaymentCallback";

//trang giỏ hàng người dùng
import UserWishlist from "../pages/Home/UserPage/UserWishlist";

//trang đơn hàng người dùng
import UserOrder from "../pages/Home/UserPage/UserOrder";

//trang phòng tập người dùng
import UserRoom from "../pages/Home/UserPage/UserRoom";

//trang lớp học người dùng
import UserClass from "../pages/Home/UserPage/UserClass";

//trang AI người dùng
import UserAI from "../pages/Home/UserPage/UserAI";

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

//trang quản lý đơn hàng
import OrderManagement from "../pages/Admin/OrderManagement";
import OrderDetail from "../pages/Admin/OrderManagement/dashboard/detail";

//trang quản lý dịch vụ
import ServiceManagement from "../pages/Admin/ServiceManagement";

//trang quản lý kho
import WarehouseManagement from "../pages/Admin/WarehouseManagement";
import AddWarehouseItem from "../pages/Admin/WarehouseManagement/dashboard/add";
import EditWarehouseItem from "../pages/Admin/WarehouseManagement/dashboard/edit";
import WarehouseDetail from "../pages/Admin/WarehouseManagement/dashboard/detail";

//trang quản lý phòng tập
import RoomManagement from "../pages/Admin/RoomManagement";
import AddRoom from "../pages/Admin/RoomManagement/dashboard/add";
import EditRoom from "../pages/Admin/RoomManagement/dashboard/edit";
import RoomDetail from "../pages/Admin/RoomManagement/dashboard/detail";

//trang xác nhận thành viên
import MemberConfirmationManagement from "../pages/Admin/MemberConfirmationManagement";

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
                path: "ProductDetail/:productId",
                element: ProtectedUserRouteWrapper(ProductDetailPage),
            },
            {
                path: "news",
                element: NewsPage,
            },
            {
                path: "news/:newsId",
                element: NewsDetail,
            },
            {
                path: "user",
                element: RedirectToUser,
            },
            {
                path: "user/:username",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "payment-callback",
                element: PaymentCallback,
            },
            {
                path: "service-payment-callback",
                element: ServicePaymentCallback,
            },
            {
                path: "user/:username/wishlist",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "user/:username/orders",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "user/:username/room",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "user/:username/class",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "user/:username/ai",
                element: ProtectedUserRouteWrapper(UserPage),
            },
            {
                path: "test",
                element: TEST,
            },

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
                path: "OrderManagement",
                element: OrderManagement,
            },
            {
                path: "OrderManagement/dashboard/detail/:orderId",
                element: OrderDetail,
            },
            {
                path: "ServiceManagement",
                element: ServiceManagement,
            },
            {
                path: "WarehouseManagement",
                element: WarehouseManagement,
            },
            {
                path: "WarehouseManagement/dashboard/add",
                element: AddWarehouseItem,
            },
            {
                path: "WarehouseManagement/dashboard/edit/:itemId",
                element: EditWarehouseItem,
            },
            {
                path: "WarehouseManagement/dashboard/detail/:itemId",
                element: WarehouseDetail,
            },
            {
                path: "RoomManagement",
                element: RoomManagement,
            },
            {
                path: "RoomManagement/dashboard/add",
                element: AddRoom,
            },
            {
                path: "RoomManagement/dashboard/edit/:roomId",
                element: EditRoom,
            },
            {
                path: "RoomManagement/dashboard/detail/:roomId",
                element: RoomDetail,
            },
            {
                path: "MemberConfirmationManagement",
                element: MemberConfirmationManagement,
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
    
    // Kiểm tra nếu không có user hoặc role không phải admin
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (user.role !== "admin") {
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

//chặn vào trang user nếu chưa đăng nhập
function ProtectedUserRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Kiểm tra nếu không có user
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Kiểm tra nếu role là admin thì redirect về trang admin
    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
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
