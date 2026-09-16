import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

const hasCerts =
  fs.existsSync("./certs/cert.key") && fs.existsSync("./certs/cert.crt");

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,

    ...(hasCerts
      ? {
          https: {
            key: fs.readFileSync("./certs/cert.key"),
            cert: fs.readFileSync("./certs/cert.crt"),
          },
        }
      : {}),
  },
});