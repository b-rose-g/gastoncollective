export type UploadedReference = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export async function uploadReferenceImages(files: File[]): Promise<UploadedReference[]> {
  if (files.length === 0) return [];

  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const response = await fetch("/api/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });

  const payload = await response.json().catch(() => null) as { files?: UploadedReference[]; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Image upload failed. Please try again.");
  }

  return payload?.files ?? [];
}
