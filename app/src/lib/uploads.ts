import { publicSupabase } from "./supabase";

export type UploadedReference = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export const REFERENCE_IMAGE_MAX_FILES = 5;
export const REFERENCE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const REFERENCE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const storageBucket = String(import.meta.env.VITE_SUPABASE_REFERENCE_BUCKET ?? "").trim() || "reference-images";

function cleanFileName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "reference-image";
}

function uniqueStoragePath(file: File) {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `form-references/${id}-${cleanFileName(file.name)}`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function getReferenceImageValidationError(files: File[]) {
  if (files.length > REFERENCE_IMAGE_MAX_FILES) {
    const overLimit = files.length - REFERENCE_IMAGE_MAX_FILES;
    return `You can upload up to ${REFERENCE_IMAGE_MAX_FILES} reference images. Please remove ${overLimit} ${pluralize(overLimit, "file")} and try again.`;
  }

  const unsupported = files.find((file) => !imageTypes.has(file.type));
  if (unsupported) {
    return `"${unsupported.name}" is not a supported file type. Please upload a JPG, PNG, or WebP image.`;
  }

  const tooLarge = files.find((file) => file.size > REFERENCE_IMAGE_MAX_BYTES);
  if (tooLarge) {
    return `"${tooLarge.name}" is too large. Reference images must be 5 MB or smaller.`;
  }

  return null;
}

export async function uploadReferenceImages(files: File[]): Promise<UploadedReference[]> {
  if (files.length === 0) return [];

  const validationError = getReferenceImageValidationError(files);
  if (validationError) {
    throw new Error(validationError);
  }

  const uploaded: UploadedReference[] = [];

  for (const file of files) {
    const path = uniqueStoragePath(file);
    const { data, error } = await publicSupabase.storage.from(storageBucket).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("Supabase reference image upload failed", {
        bucket: storageBucket,
        message: error.message,
      });
      throw new Error("Reference images could not be uploaded. Please try again.");
    }

    const { data: publicUrlData } = publicSupabase.storage.from(storageBucket).getPublicUrl(data.path);
    uploaded.push({
      name: file.name,
      url: publicUrlData.publicUrl,
      size: file.size,
      type: file.type,
    });
  }

  return uploaded;
}
