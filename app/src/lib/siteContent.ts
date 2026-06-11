import { supabase } from './supabase';

export const SITE_CONTENT_DISPLAY_LOCATIONS = [
  'homepage',
  'velvet_ink',
  'shop',
  'written_word',
  'events',
  'global',
  'general',
] as const;

export const SITE_CONTENT_TYPES = [
  'announcement',
  'hero',
  'feature',
  'banner',
  'cta',
  'notice',
  'bio',
  'general',
] as const;

export type SiteContentDisplayLocation = (typeof SITE_CONTENT_DISPLAY_LOCATIONS)[number];
export type SiteContentType = (typeof SITE_CONTENT_TYPES)[number];

export type SiteContentItem = {
  id: number | string;
  content_key: string | null;
  section: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  image_path: string | null;
  button_label: string | null;
  button_url: string | null;
  display_location: SiteContentDisplayLocation | string | null;
  content_type: SiteContentType | string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SiteContentInput = {
  content_key: string;
  section?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  button_label?: string | null;
  button_url?: string | null;
  display_location: SiteContentDisplayLocation;
  content_type: SiteContentType;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type SiteContentUpdate = Partial<SiteContentInput>;

export const UNDER_DEVELOPMENT_CONTENT_KEY = 'site-under-development';

export const UNDER_DEVELOPMENT_DEFAULT_CONTENT = {
  content_key: UNDER_DEVELOPMENT_CONTENT_KEY,
  section: 'Site status',
  title: 'The Gaston Collective is getting a little polish.',
  subtitle: 'We will be back soon.',
  body: 'The site is temporarily under development while we finish updates. Thank you for your patience.',
  image_url: '/images/tattoo_2.jpg',
  image_path: null,
  button_label: 'Email us',
  button_url: 'mailto:hello@gastoncollective.com',
  display_location: 'global',
  content_type: 'notice',
  is_active: false,
  is_featured: false,
  display_order: -1000,
  starts_at: null,
  ends_at: null,
} satisfies SiteContentInput;

type GetSiteContentOptions = {
  activeOnly?: boolean;
  location?: SiteContentDisplayLocation;
  locations?: SiteContentDisplayLocation[];
  contentType?: SiteContentType;
  featuredOnly?: boolean;
  limit?: number;
};

const siteContentColumns = [
  'id',
  'content_key',
  'section',
  'title',
  'subtitle',
  'body',
  'image_url',
  'image_path',
  'button_label',
  'button_url',
  'display_location',
  'content_type',
  'is_active',
  'is_featured',
  'display_order',
  'starts_at',
  'ends_at',
  'created_at',
  'updated_at',
].join(',');

export function siteContentLabel(value: string | null | undefined) {
  return value
    ? value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : 'Unassigned';
}

export async function getSiteContent(options: GetSiteContentOptions = {}) {
  let query = supabase
    .from('site_content')
    .select(siteContentColumns)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (options.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (options.location) {
    query = query.eq('display_location', options.location);
  }

  if (options.locations?.length) {
    query = query.in('display_location', options.locations);
  }

  if (options.contentType) {
    query = query.eq('content_type', options.contentType);
  }

  if (options.featuredOnly) {
    query = query.eq('is_featured', true);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Site content could not be loaded.');
  }

  const items = (data ?? []) as unknown as SiteContentItem[];
  return options.activeOnly !== false ? items.filter((item) => siteContentIsCurrentlyVisible(item)) : items;
}

export async function getSiteContentByLocation(location: SiteContentDisplayLocation, limit?: number) {
  return getSiteContent({ location, limit });
}

export async function getFeaturedSiteContent(limit = 4) {
  return getSiteContent({ locations: ['homepage', 'global'], featuredOnly: true, limit });
}

export async function getActiveSiteContentByKey(contentKey: string) {
  const normalizedKey = contentKey.trim();
  if (!normalizedKey) return null;

  const { data, error } = await supabase
    .from('site_content')
    .select(siteContentColumns)
    .eq('content_key', normalizedKey)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Site content could not be loaded.');
  }

  const item = (data ?? null) as unknown as SiteContentItem | null;
  return item && siteContentIsCurrentlyVisible(item) ? item : null;
}

export async function getUnderDevelopmentContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select(siteContentColumns)
    .eq('content_key', UNDER_DEVELOPMENT_CONTENT_KEY)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Site status could not be loaded.');
  }

  const item = (data ?? null) as unknown as SiteContentItem | null;
  return item && siteContentIsCurrentlyVisible(item) ? item : null;
}

export async function setUnderDevelopmentMode(isActive: boolean) {
  const { data: existing, error: loadError } = await supabase
    .from('site_content')
    .select(siteContentColumns)
    .eq('content_key', UNDER_DEVELOPMENT_CONTENT_KEY)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (loadError) {
    throw new Error(siteContentErrorMessage(loadError.message));
  }

  const input = {
    ...UNDER_DEVELOPMENT_DEFAULT_CONTENT,
    is_active: isActive,
  };

  if (existing) {
    return updateSiteContent((existing as unknown as SiteContentItem).id, input);
  }

  return createSiteContent(input);
}

export async function createSiteContent(input: SiteContentInput) {
  const { data, error } = await supabase
    .from('site_content')
    .insert(cleanSiteContentPayload(input))
    .select(siteContentColumns)
    .single();

  if (error) {
    throw new Error(siteContentErrorMessage(error.message));
  }

  if (!data) throw new Error('Site content could not be created.');
  return data as unknown as SiteContentItem;
}

export async function updateSiteContent(id: number | string, input: SiteContentUpdate) {
  const { data, error } = await supabase
    .from('site_content')
    .update(cleanSiteContentPayload(input))
    .eq('id', id)
    .select(siteContentColumns)
    .single();

  if (error) {
    throw new Error(siteContentErrorMessage(error.message));
  }

  if (!data) throw new Error('Site content could not be updated.');
  return data as unknown as SiteContentItem;
}

function cleanSiteContentPayload(input: SiteContentUpdate) {
  const payload: Record<string, string | number | boolean | null> = {};

  if (input.content_key !== undefined) payload.content_key = input.content_key.trim();
  if (input.section !== undefined || input.display_location !== undefined) {
    payload.section = cleanOptional(input.section) || defaultSectionForLocation(input.display_location);
  }
  if (input.title !== undefined) payload.title = cleanOptional(input.title);
  if (input.subtitle !== undefined) payload.subtitle = cleanOptional(input.subtitle);
  if (input.body !== undefined) payload.body = cleanOptional(input.body);
  if (input.image_url !== undefined) payload.image_url = cleanOptional(input.image_url);
  if (input.image_path !== undefined) payload.image_path = cleanOptional(input.image_path);
  if (input.button_label !== undefined) payload.button_label = cleanOptional(input.button_label);
  if (input.button_url !== undefined) payload.button_url = cleanOptional(input.button_url);
  if (input.display_location !== undefined) payload.display_location = input.display_location;
  if (input.content_type !== undefined) payload.content_type = input.content_type;
  if (input.is_active !== undefined) payload.is_active = input.is_active;
  if (input.is_featured !== undefined) payload.is_featured = input.is_featured;
  if (input.display_order !== undefined) payload.display_order = Number.isFinite(input.display_order) ? input.display_order : 0;
  if (input.starts_at !== undefined) payload.starts_at = cleanOptional(input.starts_at);
  if (input.ends_at !== undefined) payload.ends_at = cleanOptional(input.ends_at);

  return payload;
}

function cleanOptional(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return trimmed || null;
}

function siteContentErrorMessage(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('null value') && normalized.includes('section')) {
    return 'This update needs an internal section. Choose where it should appear and try again.';
  }

  if (normalized.includes('null value') && normalized.includes('content_key')) {
    return 'This update needs an internal key. Leave the Internal key blank so the system can create one automatically.';
  }

  if (normalized.includes('null value') && normalized.includes('title')) {
    return 'This update needs a headline before it can be saved.';
  }

  if (normalized.includes('null value') && normalized.includes('display_location')) {
    return 'Choose where this update should appear, then try saving again.';
  }

  if (normalized.includes('null value') && normalized.includes('content_type')) {
    return 'Choose what kind of update this is, then try saving again.';
  }

  if (normalized.includes('duplicate key') || normalized.includes('already exists')) {
    return 'That internal key is already in use. Leave the Internal key blank so the system can create one automatically.';
  }

  if (normalized.includes('permission') || normalized.includes('row-level security') || normalized.includes('rls')) {
    return 'You are signed in, but this account does not have permission to save site content.';
  }

  return 'This update could not be saved. Please check the required fields and try again.';
}

function defaultSectionForLocation(location: string | null | undefined) {
  return siteContentLabel(location || 'general');
}

function siteContentIsCurrentlyVisible(item: SiteContentItem) {
  if (item.is_active !== true) return false;

  const now = Date.now();
  const startsAt = item.starts_at ? Date.parse(item.starts_at) : Number.NaN;
  const endsAt = item.ends_at ? Date.parse(item.ends_at) : Number.NaN;

  if (!Number.isNaN(startsAt) && startsAt > now) return false;
  if (!Number.isNaN(endsAt) && endsAt < now) return false;

  return true;
}
