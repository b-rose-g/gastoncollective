import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { recordEvent } from "./lib/monitoring";

const app = new Hono<{ Bindings: HttpBindings }>();

const appRoutes = new Set(["/", "/velvet-ink", "/written-word", "/shop", "/events", "/admin", "/privacy", "/terms"]);
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function uploadExtension(type: string, filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  const host = c.req.header("host")?.toLowerCase().split(":")[0];

  if (env.isProduction && host === `www.${env.canonicalHost}`) {
    return c.redirect(`https://${env.canonicalHost}${url.pathname}${url.search}`, 301);
  }

  await next();
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/api/health", (c) => c.json({ status: "ok", checkedAt: new Date().toISOString() }));

app.post("/api/uploads", async (c) => {
  try {
    const formData = await c.req.raw.formData();
    const entries = formData.getAll("files");
    const saved: Array<{ name: string; url: string; size: number; type: string }> = [];

    await fs.mkdir(env.uploadDir, { recursive: true });

    for (const entry of entries) {
      if (typeof entry === "string") continue;
      const file = entry as { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> };

      if (!imageTypes.has(file.type)) {
        return c.json({ error: "Only JPG, PNG, WebP, and GIF images can be uploaded." }, 400);
      }

      if (file.size > 10 * 1024 * 1024) {
        return c.json({ error: "Each image must be 10MB or smaller." }, 400);
      }

      const filename = `${Date.now()}-${randomUUID()}${uploadExtension(file.type, file.name)}`;
      const filePath = path.resolve(env.uploadDir, filename);
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      saved.push({ name: file.name, url: `/uploads/${filename}`, size: file.size, type: file.type });
    }

    if (saved.length === 0) {
      return c.json({ error: "No image files were uploaded." }, 400);
    }

    return c.json({ files: saved });
  } catch (error) {
    await recordEvent("upload_error", "Reference image upload failed", {
      path: "/api/uploads",
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return c.json({ error: "Upload failed. Please try again." }, 500);
  }
});

app.get("/uploads/:file", async (c) => {
  const filename = c.req.param("file");
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return c.json({ error: "Not Found" }, 404);

  const root = path.resolve(env.uploadDir);
  const filePath = path.resolve(root, filename);
  if (!filePath.startsWith(root)) return c.json({ error: "Not Found" }, 404);

  try {
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": getContentType(filePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.json({ error: "Not Found" }, 404);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError: async ({ error, path: trpcPath }) => {
      const isPublicForm =
        trpcPath === "contact.create" ||
        trpcPath === "booking.create" ||
        trpcPath === "commission.create";
      await recordEvent(isPublicForm ? "form_error" : "api_error", error.message, {
        path: trpcPath ? `/api/trpc/${trpcPath}` : "/api/trpc",
        details: { code: error.code },
      });
    },
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

app.onError(async (error, c) => {
  await recordEvent("api_error", error.message, {
    path: new URL(c.req.url).pathname,
  });
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app, appRoutes);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
