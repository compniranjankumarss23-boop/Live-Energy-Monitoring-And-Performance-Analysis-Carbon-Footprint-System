import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Enhanced CORS configuration for development
    cors: {
      origin: [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000",
        "http://[::1]:8080",
        "http://[::1]:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "apikey",
        "x-client-info",
        "x-supabase-client-platform",
        "x-supabase-client-platform-version",
        "x-supabase-client-runtime",
        "x-supabase-client-runtime-version",
      ],
      exposedHeaders: [
        "Content-Type",
        "x-supabase-request-id",
        "Access-Control-Allow-Origin",
      ],
    },
    // Enhanced proxy configuration for Supabase
    proxy: {
      // Proxy Supabase REST API calls
      "/api/rest": {
        target: "https://xgczpjvcmtyxauyqqcqi.supabase.co/rest/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rest/, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[Proxy Error]", err);
          });
        },
      },
      // Proxy Supabase Auth API calls
      "/api/auth": {
        target: "https://xgczpjvcmtyxauyqqcqi.supabase.co/auth/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ""),
      },
      // Proxy Supabase Functions (Chat endpoint)
      "/api/functions": {
        target: "https://xgczpjvcmtyxauyqqcqi.supabase.co/functions/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/functions/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Forward auth headers
            const authHeader = proxyReq.getHeader("authorization");
            const apiKey = proxyReq.getHeader("apikey");
            if (authHeader) proxyReq.setHeader("Authorization", authHeader);
            if (apiKey) proxyReq.setHeader("apikey", apiKey);
          });
        },
      },
    },
  },
  define: {
    // Make environment variables available at build time
    "process.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL),
    "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build for production
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
