import { supabase } from './supabase';

export const GALLERY_IMAGE_BUCKET = 'gallery-images';
export const GALLERY_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const GALLERY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const GALLERY_CATEGORIES = [
  'homepage',
  'velvet_ink',
  'tattoo_gallery',
  'flash_art',
  'shop',
  'stickers',
  'bookmarks',
  'commissions',
  'written_word',
  'events',
  'other',
] as const;

export const GALLERY_DISPLAY_LOCATIONS = [
  'homepage',
  'velvet_ink',
  'shop',
  'written_word',
  'events',
  'gallery',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
export type GalleryDisplayLocation = (typeof GALLERY_DISPLAY_LOCATIONS)[number];

export type GalleryItem = {
  id: number | string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  category: GalleryCategory | string | null;
  display_location: GalleryDisplayLocation | string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  alt_text: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type GalleryItemInput = {
  title: string;
  description?: string | null;
  image_url: string;
  image_path: string;
  category: GalleryCategory;
  display_location: GalleryDisplayLocation;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  alt_text?: string | null;
};

export type GalleryItemUpdate = Partial<GalleryItemInput>;

export type UploadedGalleryImage = {
  url: string;
  path: string;
};

type GetGalleryItemsOptions = {
  activeOnly?: boolean;
  limit?: number;
};

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const galleryColumns = [
  'id',
  'title',
  'description',
  'image_url',
  'image_path',
  'category',
  'display_location',
  'is_active',
  'is_featured',
  'display_order',
  'alt_text',
  'created_at',
  'updated_at',
].join(',');

export function galleryLabel(value: string | null | undefined) {
  return value
    ? value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : 'Unassigned';
}

export function getGalleryImageValidationError(file: File | null | undefined) {
  if (!file) return 'Please choose an image to upload.';
  if (!imageTypes.has(file.type)) return 'Please upload a JPG, PNG, or WebP image.';
  if (file.size > GALLERY_IMAGE_MAX_BYTES) return 'Gallery images must be 5 MB or smaller.';
  return null;
}

export async function getGalleryItems(options: GetGalleryItemsOptions = {}) {
  let query = supabase
    .from('gallery_items')
    .select(galleryColumns)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (options.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Gallery items could not be loaded.');
  }

  return (data ?? []) as unknown as GalleryItem[];
}

export async function getGalleryItemsByLocation(location: GalleryDisplayLocation, limit?: number) {
  const items = await getGalleryItems({ activeOnly: true });
  const filtered = items.filter((item) => galleryItemMatchesLocation(item, location));
  return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
}

export async function getFeaturedGalleryItems(limit = 6) {
  const items = await getGalleryItems({ activeOnly: true });
  return items
    .filter((item) => item.is_featured === true || item.display_location === 'homepage')
    .slice(0, limit);
}

export async function uploadGalleryImage(file: File): Promise<UploadedGalleryImage> {
  const validationError = getGalleryImageValidationError(file);
  if (validationError) throw new Error(validationError);

  const path = uniqueGalleryStoragePath(file);
  const { data, error } = await supabase.storage.from(GALLERY_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Gallery image could not be uploaded.');
  }

  const { data: publicUrlData } = supabase.storage.from(GALLERY_IMAGE_BUCKET).getPublicUrl(data.path);
  return { path: data.path, url: publicUrlData.publicUrl };
}

export async function createGalleryItem(input: GalleryItemInput) {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert(cleanGalleryPayload(input))
    .select(galleryColumns)
    .single();

  if (error) {
    throw new Error(error.message || 'Gallery item could not be created.');
  }

  if (!data) throw new Error('Gallery item could not be created.');
  return data as unknown as GalleryItem;
}

export async function updateGalleryItem(id: number | string, input: GalleryItemUpdate) {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(cleanGalleryPayload(input))
    .eq('id', id)
    .select(galleryColumns)
    .single();

  if (error) {
    throw new Error(error.message || 'Gallery item could not be updated.');
  }

  if (!data) throw new Error('Gallery item could not be updated.');
  return data as unknown as GalleryItem;
}

function galleryItemMatchesLocation(item: GalleryItem, location: GalleryDisplayLocation) {
  if (item.display_location === location) return true;

  if (location === 'homepage') return item.category === 'homepage' || item.is_featured === true;
  if (location === 'velvet_ink') return item.category === 'velvet_ink' || item.category === 'tattoo_gallery';
  if (location === 'shop') return ['shop', 'stickers', 'bookmarks', 'commissions'].includes(String(item.category));
  if (location === 'written_word') return item.category === 'written_word';
  if (location === 'events') return item.category === 'events';
  return false;
}

function cleanGalleryPayload(input: GalleryItemUpdate) {
  const payload: Record<string, string | number | boolean | null> = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = cleanOptional(input.description);
  if (input.image_url !== undefined) payload.image_url = input.image_url;
  if (input.image_path !== undefined) payload.image_path = input.image_path;
  if (input.category !== undefined) payload.category = input.category;
  if (input.display_location !== undefined) payload.display_location = input.display_location;
  if (input.is_active !== undefined) payload.is_active = input.is_active;
  if (input.is_featured !== undefined) payload.is_featured = input.is_featured;
  if (input.display_order !== undefined) payload.display_order = Number.isFinite(input.display_order) ? input.display_order : 0;
  if (input.alt_text !== undefined) payload.alt_text = cleanOptional(input.alt_text);

  return payload;
}

function cleanOptional(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return trimmed || null;
}

function uniqueGalleryStoragePath(file: File) {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `gallery/${id}-${cleanFileName(file.name)}`;
}

function cleanFileName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'gallery-image';
}
