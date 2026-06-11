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

export type LegacyVelvetInkImage = GalleryItemInput & {
  legacy_key: string;
  source_label: 'Legacy';
  public_category: 'tattoo' | 'piercing';
  width: number;
  height: number;
  previewCrop?: {
    aspectRatio: string;
    scale: number;
    origin: string;
  };
};

export type LegacyGalleryImportResult = {
  created: GalleryItem[];
  skipped: number;
};

type GetGalleryItemsOptions = {
  activeOnly?: boolean;
  limit?: number;
};

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const LEGACY_VELVET_INK_IMAGES: LegacyVelvetInkImage[] = [
  {
    legacy_key: 'velvet-ink-tattoo-1',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_1.jpg',
    image_path: 'images/tattoo_1.jpg',
    title: 'Piece #1',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 10,
    alt_text: 'Velvet Ink tattoo portfolio piece 1',
    width: 556,
    height: 660,
  },
  {
    legacy_key: 'velvet-ink-tattoo-2',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_2.jpg',
    image_path: 'images/tattoo_2.jpg',
    title: 'Piece #2',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 20,
    alt_text: 'Velvet Ink tattoo portfolio piece 2',
    width: 780,
    height: 1210,
  },
  {
    legacy_key: 'velvet-ink-tattoo-3',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_3.jpg',
    image_path: 'images/tattoo_3.jpg',
    title: 'Piece #3',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 30,
    alt_text: 'Velvet Ink tattoo portfolio piece 3',
    width: 1080,
    height: 1440,
    previewCrop: {
      aspectRatio: '3 / 4',
      scale: 1.75,
      origin: '58% 66%',
    },
  },
  {
    legacy_key: 'velvet-ink-tattoo-4',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_4.jpg',
    image_path: 'images/tattoo_4.jpg',
    title: 'Piece #4',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 40,
    alt_text: 'Velvet Ink tattoo portfolio piece 4',
    width: 957,
    height: 1643,
  },
  {
    legacy_key: 'velvet-ink-tattoo-5',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_5.jpg',
    image_path: 'images/tattoo_5.jpg',
    title: 'Piece #5',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 50,
    alt_text: 'Velvet Ink tattoo portfolio piece 5',
    width: 529,
    height: 1197,
  },
  {
    legacy_key: 'velvet-ink-tattoo-6',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_6.jpg',
    image_path: 'images/tattoo_6.jpg',
    title: 'Piece #6',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 60,
    alt_text: 'Velvet Ink tattoo portfolio piece 6',
    width: 670,
    height: 1126,
  },
  {
    legacy_key: 'velvet-ink-tattoo-7',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_7.jpg',
    image_path: 'images/tattoo_7.jpg',
    title: 'Piece #7',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 70,
    alt_text: 'Velvet Ink tattoo portfolio piece 7',
    width: 366,
    height: 628,
  },
  {
    legacy_key: 'velvet-ink-tattoo-8',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_8.jpg',
    image_path: 'images/tattoo_8.jpg',
    title: 'Piece #8',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 80,
    alt_text: 'Velvet Ink tattoo portfolio piece 8',
    width: 471,
    height: 938,
  },
  {
    legacy_key: 'velvet-ink-tattoo-9',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_9.jpg',
    image_path: 'images/tattoo_9.jpg',
    title: 'Piece #9',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 90,
    alt_text: 'Velvet Ink tattoo portfolio piece 9',
    width: 277,
    height: 774,
  },
  {
    legacy_key: 'velvet-ink-tattoo-10',
    source_label: 'Legacy',
    public_category: 'tattoo',
    image_url: '/images/tattoo_10.jpg',
    image_path: 'images/tattoo_10.jpg',
    title: 'Piece #10',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 100,
    alt_text: 'Velvet Ink tattoo portfolio piece 10',
    width: 659,
    height: 623,
  },
  {
    legacy_key: 'velvet-ink-piercing-1',
    source_label: 'Legacy',
    public_category: 'piercing',
    image_url: '/images/piercing_1.jpg',
    image_path: 'images/piercing_1.jpg',
    title: 'Piece #11',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 110,
    alt_text: 'Velvet Ink piercing portfolio piece 1',
    width: 1206,
    height: 2208,
  },
  {
    legacy_key: 'velvet-ink-piercing-2',
    source_label: 'Legacy',
    public_category: 'piercing',
    image_url: '/images/piercing_2.jpg',
    image_path: 'images/piercing_2.jpg',
    title: 'Piece #12',
    description: 'Imported from the original Velvet Ink public gallery.',
    category: 'tattoo_gallery',
    display_location: 'velvet_ink',
    is_active: true,
    is_featured: false,
    display_order: 120,
    alt_text: 'Velvet Ink piercing portfolio piece 2',
    width: 1242,
    height: 2208,
  },
];

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

export async function importLegacyVelvetInkGalleryItems(): Promise<LegacyGalleryImportResult> {
  const existingItems = await getGalleryItems({ activeOnly: false });
  const existingKeys = new Set(existingItems.flatMap((item) => galleryIdentityKeys(item)));
  const payloads = LEGACY_VELVET_INK_IMAGES.filter((image) => {
    const keys = galleryIdentityKeys(image);
    return keys.length > 0 && keys.every((key) => !existingKeys.has(key));
  });

  if (payloads.length === 0) {
    return { created: [], skipped: LEGACY_VELVET_INK_IMAGES.length };
  }

  const { data, error } = await supabase
    .from('gallery_items')
    .insert(payloads.map((image) => cleanGalleryPayload(image)))
    .select(galleryColumns);

  if (error) {
    throw new Error(error.message || 'Existing Velvet Ink images could not be imported.');
  }

  const created = (data ?? []) as unknown as GalleryItem[];
  return {
    created,
    skipped: LEGACY_VELVET_INK_IMAGES.length - created.length,
  };
}

export function getLegacyVelvetInkImageForItem(item: Pick<GalleryItem, 'image_url' | 'image_path'>) {
  const itemKeys = new Set(galleryIdentityKeys(item));
  return LEGACY_VELVET_INK_IMAGES.find((image) => galleryIdentityKeys(image).some((key) => itemKeys.has(key))) ?? null;
}

export function isLegacyVelvetInkGalleryItem(item: Pick<GalleryItem, 'image_url' | 'image_path'>) {
  return Boolean(getLegacyVelvetInkImageForItem(item));
}

export function galleryItemSourceLabel(item: Pick<GalleryItem, 'image_url' | 'image_path'>) {
  if (isLegacyVelvetInkGalleryItem(item)) return 'Legacy';

  const imageUrl = normalizeGalleryIdentity(item.image_url);
  const imagePath = normalizeGalleryIdentity(item.image_path);
  if (imageUrl.startsWith('images/') || imagePath.startsWith('images/')) return 'Static';

  return 'Uploaded';
}

function galleryItemMatchesLocation(item: GalleryItem, location: GalleryDisplayLocation) {
  if (item.display_location === location) return true;

  if (location === 'homepage') return item.category === 'homepage' || item.is_featured === true;
  if (location === 'velvet_ink') return ['velvet_ink', 'tattoo_gallery', 'flash_art'].includes(String(item.category));
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

function galleryIdentityKeys(item: Pick<GalleryItem, 'image_url' | 'image_path'>) {
  return [normalizeGalleryIdentity(item.image_url), normalizeGalleryIdentity(item.image_path)].filter(Boolean);
}

function normalizeGalleryIdentity(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).pathname.replace(/^\/+/, '').toLowerCase();
    }
  } catch {
    return trimmed.replace(/^\/+/, '').toLowerCase();
  }

  return trimmed.replace(/^\/+/, '').toLowerCase();
}

function uniqueGalleryStoragePath(file: File) {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `gallery/${id}-${cleanFileName(file.name)}`;
}

function cleanFileName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'gallery-image';
}
