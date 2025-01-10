import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const path = fileURLToPath(import.meta.url);
const root = resolve(dirname(path), "client");

const plugins = [react()];

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  define: {
    __webpack_require__: {},
  },
});
