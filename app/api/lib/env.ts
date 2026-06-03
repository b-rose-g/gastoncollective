import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function requiredOneOf(names: string[]): void {
  if (process.env.NODE_ENV !== "production") return;
  if (names.some((name) => Boolean(process.env[name]))) return;
  throw new Error(`Missing one required environment variable: ${names.join(" or ")}`);
}

requiredOneOf(["ADMIN_PASSWORD_HASH", "ADMIN_PASSWORD"]);

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || required("APP_SECRET"),
  canonicalHost: process.env.CANONICAL_HOST || "gastoncollective.com",
  uploadDir: process.env.UPLOAD_DIR || "storage/uploads",
  monitoringLogPath: process.env.MONITORING_LOG_PATH || "storage/monitoring.log",
};
