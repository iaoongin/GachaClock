import react from "@vitejs/plugin-react";
import serveStatic from "serve-static";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: "multi-public-dirs",
      configureServer(server) {
        // 添加其他目录为静态资源
        server.middlewares.use(
          "/data",
          serveStatic("../spider/data", { etag: true })
        );
        server.middlewares.use(
          "/img",
          serveStatic("../spider/img", { etag: true })
        );
      },
    },
  ],
});
