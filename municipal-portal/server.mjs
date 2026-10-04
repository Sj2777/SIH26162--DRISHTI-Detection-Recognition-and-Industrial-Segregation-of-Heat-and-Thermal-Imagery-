import { serve } from "srvx/node";
import { staticMiddleware } from "srvx/static";
import { resolve } from "node:path";
import app from "./dist/server/server.js";

serve({
  fetch: (request) => app.fetch(request, process.env, {}),
  middleware: [
    staticMiddleware({
      dir: resolve("dist/client"),
      prefix: "/municipal",
    }),
  ],
});