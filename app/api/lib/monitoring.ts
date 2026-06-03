import fs from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

export type MonitoringEvent = {
  type: "api_error" | "form_error" | "upload_error" | "auth_error" | "uptime";
  message: string;
  path?: string;
  details?: Record<string, unknown>;
  createdAt: string;
};

export async function recordEvent(
  type: MonitoringEvent["type"],
  message: string,
  details: Omit<MonitoringEvent, "type" | "message" | "createdAt"> = {},
) {
  const event: MonitoringEvent = {
    type,
    message,
    ...details,
    createdAt: new Date().toISOString(),
  };

  const line = `${JSON.stringify(event)}\n`;
  console.error(`[monitoring:${type}] ${message}`, details);

  try {
    await fs.mkdir(path.dirname(env.monitoringLogPath), { recursive: true });
    await fs.appendFile(env.monitoringLogPath, line, "utf8");
  } catch (error) {
    console.error("[monitoring:write_failed]", error);
  }
}

export async function listEvents(limit = 25): Promise<MonitoringEvent[]> {
  try {
    const content = await fs.readFile(env.monitoringLogPath, "utf8");
    return content
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as MonitoringEvent)
      .reverse();
  } catch {
    return [];
  }
}
