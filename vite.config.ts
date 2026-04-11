import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://100.48.47.44/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data fetching + forms
          "vendor-data": [
            "@tanstack/react-query",
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
            "axios",
          ],
          // UI/animation
          "vendor-ui": [
            "framer-motion",
            "lucide-react",
            "sonner",
            "sweetalert2",
          ],
          // Charts
          "vendor-charts": ["recharts"],
          // Utilities
          "vendor-utils": [
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "dayjs",
          ],
        },
      },
    },
  },
});
