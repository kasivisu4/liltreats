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

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomeRoute });
const inventoryRoute = createRoute({ getParentRoute: () => rootRoute, path: "/inventory", component: InventoryRoute });
const bookRoute = createRoute({ getParentRoute: () => rootRoute, path: "/book/$tier", component: PreferencesRoute });
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart", component: CartRoute });
const confirmRoute = createRoute({ getParentRoute: () => rootRoute, path: "/confirm", component: ConfirmRoute });
const ordersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/orders", component: OrdersRoute });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactRoute });

// Extended routes rendered inside existing files
import { ShopRoute, ShopItemRoute } from "./routes/InventoryRoute";
import { AccountRoute, BookingsRoute, LoginRoute } from "./routes/OrdersRoute";
import { AdminLayout, AdminDashboardRoute, AdminOrdersRoute, AdminVideoBookingsRoute, AdminInventoryRoute, AdminProductsRoute, AdminCustomersRoute, AdminProfitRoute, AdminScoopBookingsRoute, AdminReportsRoute, AdminScoopManagementRoute, AdminDeliveryRoute, AdminPaymentsRoute } from "./routes/ConfirmRoute";

const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop", component: ShopRoute });
const shopItemRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop/$itemId", component: ShopItemRoute });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account", component: AccountRoute });
const bookingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/bookings", component: BookingsRoute });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginRoute });

const adminLayout = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: AdminLayout });
const adminIndexRoute = createRoute({ getParentRoute: () => adminLayout, path: "/", component: AdminDashboardRoute });
const adminOrdersRoute = createRoute({ getParentRoute: () => adminLayout, path: "/orders", component: AdminOrdersRoute });
const adminScoopBookingsRoute = createRoute({ getParentRoute: () => adminLayout, path: "/scoop-bookings", component: AdminScoopBookingsRoute });
const adminVideoBookingsRoute = createRoute({ getParentRoute: () => adminLayout, path: "/video-bookings", component: AdminVideoBookingsRoute });
const adminInventoryRoute = createRoute({ getParentRoute: () => adminLayout, path: "/inventory", component: AdminInventoryRoute });
const adminProductsRoute = createRoute({ getParentRoute: () => adminLayout, path: "/products", component: AdminProductsRoute });
const adminCustomersRoute = createRoute({ getParentRoute: () => adminLayout, path: "/customers", component: AdminCustomersRoute });
const adminProfitRoute = createRoute({ getParentRoute: () => adminLayout, path: "/profit", component: AdminProfitRoute });
const adminReportsRoute = createRoute({ getParentRoute: () => adminLayout, path: "/reports", component: AdminReportsRoute });
const adminScoopManagementRoute = createRoute({ getParentRoute: () => adminLayout, path: "/scoop-management", component: AdminScoopManagementRoute });
const adminDeliveryRoute = createRoute({ getParentRoute: () => adminLayout, path: "/delivery", component: AdminDeliveryRoute });
const adminPaymentsRoute = createRoute({ getParentRoute: () => adminLayout, path: "/payments", component: AdminPaymentsRoute });

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  bookRoute,
  cartRoute,
  confirmRoute,
  ordersRoute,
  contactRoute,
  shopRoute,
  shopItemRoute,
  accountRoute,
  bookingsRoute,
  loginRoute,
  adminLayout.addChildren([
    adminIndexRoute,
    adminOrdersRoute,
    adminScoopBookingsRoute,
    adminVideoBookingsRoute,
    adminInventoryRoute,
    adminProductsRoute,
    adminCustomersRoute,
    adminProfitRoute,
    adminReportsRoute,
    adminScoopManagementRoute,
    adminDeliveryRoute,
    adminPaymentsRoute,
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
