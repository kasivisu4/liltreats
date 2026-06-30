import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Served from a GitHub Pages project subpath in production, root in dev.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/liltreats/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "liltreats — mystery scoops",
        short_name: "liltreats",
        description: "Handcrafted mystery scoops. Limited weekly drops.",
        theme_color: "#6B2D3E",
        background_color: "#FBF6F0",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
}));
