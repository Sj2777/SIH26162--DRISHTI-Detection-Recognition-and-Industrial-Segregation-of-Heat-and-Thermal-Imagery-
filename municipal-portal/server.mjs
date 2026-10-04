import { serve } from "srvx/node";
import { staticMiddleware } from "srvx/static";
import { resolve } from "node:path";
import app from "./dist/server/server.js";

const staticFiles = staticMiddleware({
  dir: resolve("dist/client"),
});

const municipalStatic = async (request, next) => {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/municipal/assets/")) {
    const rewrittenUrl = new URL(url);
    rewrittenUrl.pathname = url.pathname.replace(/^\/municipal/, "");

    const rewrittenRequest = new Request(rewrittenUrl, request);

    return staticFiles(rewrittenRequest, next);
  }

  return next();
};

serve({
  fetch: (request) => app.fetch(request, process.env, {}),
  middleware: [municipalStatic],
});