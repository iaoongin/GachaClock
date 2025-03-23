import react from '@vitejs/plugin-react'
import serveStatic from "serve-static";
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(),
    {
      name: "multi-public-dirs",
      configureServer(server) {
        // 添加其他目录为静态资源
        server.middlewares.use(
          '/data',
          serveStatic("../spider/data", { etag: true }),
        )
        server.middlewares.use(
          '/img',
          serveStatic("../spider/img", { etag: true }),
        )
      }
    },
    viteStaticCopy({
      targets: [
        {
          src: '../spider/data/**/*',  // 源目录（支持通配符）
          dest: 'data'                 // 目标目录（相对于 dist）
        },
        {
          src: '../spider/img/**/*',
          dest: 'img'
        }
      ]
    })
  ],
})
