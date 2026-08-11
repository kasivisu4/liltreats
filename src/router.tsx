import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "./components/AppLayout";
import { HomeRoute } from "./routes/HomeRoute";
import { InventoryRoute } from "./routes/InventoryRoute";
import { PreferencesRoute } from "./routes/PreferencesRoute";
import { CartRoute } from "./routes/CartRoute";
import { ConfirmRoute } from "./routes/ConfirmRoute";
import { OrdersRoute } from "./routes/OrdersRoute";
import { ContactRoute } from "./routes/ContactRoute";
import { LoginRoute } from "./routes/LoginRoute";
import { AccountRoute } from "./routes/AccountRoute";
import { BookingsRoute } from "./routes/BookingsRoute";
import { ShopRoute } from "./routes/ShopRoute";
import { ShopItemRoute } from "./routes/ShopItemRoute";
import { HowItWorksRoute } from "./routes/HowItWorksRoute";
import { AdminLayout } from "./routes/admin/AdminLayout";
import { AdminDashboardRoute } from "./routes/admin/AdminDashboardRoute";
import { AdminOrdersRoute } from "./routes/admin/AdminOrdersRoute";
import { AdminInventoryRoute } from "./routes/admin/AdminInventoryRoute";
import { AdminVideoBookingsRoute } from "./routes/admin/AdminVideoBookingsRoute";
import { AdminScoopBookingsRoute } from "./routes/admin/AdminScoopBookingsRoute";
import { AdminProductsRoute } from "./routes/admin/AdminProductsRoute";
import { AdminCustomersRoute } from "./routes/admin/AdminCustomersRoute";
import { AdminPaymentsRoute } from "./routes/admin/AdminPaymentsRoute";
import { AdminDeliveryRoute } from "./routes/admin/AdminDeliveryRoute";
import { AdminProfitRoute } from "./routes/admin/AdminProfitRoute";
import { AdminReportsRoute } from "./routes/admin/AdminReportsRoute";
import { AdminScoopManagementRoute } from "./routes/admin/AdminScoopManagementRoute";

const rootRoute = createRootRoute({ component: AppLayout });

// Customer routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomeRoute });
const inventoryRoute = createRoute({ getParentRoute: () => rootRoute, path: "/inventory", component: InventoryRoute });
const bookRoute = createRoute({ getParentRoute: () => rootRoute, path: "/book/$tier", component: PreferencesRoute });
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart", component: CartRoute });
const confirmRoute = createRoute({ getParentRoute: () => rootRoute, path: "/confirm", component: ConfirmRoute });
const ordersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/orders", component: OrdersRoute });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactRoute });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginRoute });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account", component: AccountRoute });
const bookingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/bookings", component: BookingsRoute });
const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop", component: ShopRoute });
const shopItemRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop/$itemId", component: ShopItemRoute });
const howItWorksRoute = createRoute({ getParentRoute: () => rootRoute, path: "/how-it-works", component: HowItWorksRoute });

// Admin routes
const adminRootRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: AdminLayout });
const adminIndexRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/", component: AdminDashboardRoute });
const adminOrdersRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/orders", component: AdminOrdersRoute });
const adminInventoryRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/inventory", component: AdminInventoryRoute });
const adminVideoRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/video-bookings", component: AdminVideoBookingsRoute });
const adminScoopBookingsRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/scoop-bookings", component: AdminScoopBookingsRoute });
const adminProductsRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/products", component: AdminProductsRoute });
const adminCustomersRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/customers", component: AdminCustomersRoute });
const adminPaymentsRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/payments", component: AdminPaymentsRoute });
const adminDeliveryRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/delivery", component: AdminDeliveryRoute });
const adminProfitRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/profit", component: AdminProfitRoute });
const adminReportsRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/reports", component: AdminReportsRoute });
const adminScoopMgmtRoute = createRoute({ getParentRoute: () => adminRootRoute, path: "/scoop-management", component: AdminScoopManagementRoute });

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  bookRoute,
  cartRoute,
  confirmRoute,
  ordersRoute,
  contactRoute,
  loginRoute,
  accountRoute,
  bookingsRoute,
  shopRoute,
  shopItemRoute,
  howItWorksRoute,
  adminRootRoute.addChildren([
    adminIndexRoute,
    adminOrdersRoute,
    adminInventoryRoute,
    adminVideoRoute,
    adminScoopBookingsRoute,
    adminProductsRoute,
    adminCustomersRoute,
    adminPaymentsRoute,
    adminDeliveryRoute,
    adminProfitRoute,
    adminReportsRoute,
    adminScoopMgmtRoute,
  ]),
]);

const rawBase = import.meta.env.BASE_URL;
const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

export const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
