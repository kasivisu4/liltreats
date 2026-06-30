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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: InventoryRoute,
});

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/book/$tier",
  component: PreferencesRoute,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartRoute,
});

const confirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirm",
  component: ConfirmRoute,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersRoute,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  bookRoute,
  cartRoute,
  confirmRoute,
  ordersRoute,
  contactRoute,
]);

// In production the app is served from a GitHub Pages subpath (/liltreats/).
// Vite exposes that as BASE_URL; the router needs it as its basepath.
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
