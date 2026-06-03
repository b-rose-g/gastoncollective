export type UploadedReference = {
  name: string;
  url: string;
  size: number;
  type: string;
};

async function readJsonIfPresent<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;

  const text = await response.text();
  if (!text.trim()) return null;

  return JSON.parse(text) as T;
}

export async function uploadReferenceImages(files: File[]): Promise<UploadedReference[]> {
  if (files.length === 0) return [];

  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const response = await fetch("/api/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await readJsonIfPresent<{ error?: string }>(response).catch(() => null);
    throw new Error(payload?.error || "Image upload failed. Please try again.");
  }

  const payload = await readJsonIfPresent<{ files?: UploadedReference[] }>(response).catch(() => null);

  return payload?.files ?? [];
}
