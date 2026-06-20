import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// Custom Vite plugin to serve landing.html at "/" and React app for /app/* routes
const landingPagePlugin = () => {
  return {
    name: "landing-page-plugin",
    configureServer(server) {
      // Make sure our middleware runs BEFORE Vite's default middleware
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        
        // Only handle the root route "/" and "/index.html"
        if (url === "/" || url === "/index.html") {
          // Serve landing page
          const landingPath = path.resolve(__dirname, "landing.html");
          const content = fs.readFileSync(landingPath, "utf-8");
          res.setHeader("Content-Type", "text/html");
          res.end(content);
        } else {
          // Let Vite handle everything else, including /app/* and assets
          next();
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), landingPagePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        changeOrigin: true,
        ws: true,
      },
    },
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "landing.html"),
        app: path.resolve(__dirname, "index.html"),
      },
    },
  },
});
