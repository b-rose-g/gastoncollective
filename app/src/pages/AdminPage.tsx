import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Crop,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Megaphone,
  MessageSquareText,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  ZoomIn,
  X,
} from 'lucide-react';
import { routeMetadata, usePageMetadata } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import {
  createGalleryItem,
  GALLERY_CATEGORIES,
  GALLERY_DISPLAY_LOCATIONS,
  GALLERY_IMAGE_ACCEPT,
  galleryItemSourceLabel,
  galleryLabel,
  getGalleryImageValidationError,
  getGalleryItems,
  importLegacyVelvetInkGalleryItems,
  updateGalleryItem,
  uploadGalleryImage,
  type GalleryCategory,
  type GalleryDisplayLocation,
  type GalleryItem,
  type GalleryItemInput,
  type GalleryItemUpdate,
  type LegacyGalleryImportResult,
} from '@/lib/gallery';
import {
  createSiteContent,
  getSiteContent,
  SITE_CONTENT_DISPLAY_LOCATIONS,
  SITE_CONTENT_TYPES,
  setUnderDevelopmentMode,
  siteContentLabel,
  updateSiteContent,
  UNDER_DEVELOPMENT_CONTENT_KEY,
  type SiteContentDisplayLocation,
  type SiteContentInput,
  type SiteContentItem,
  type SiteContentType,
  type SiteContentUpdate,
} from '@/lib/siteContent';

type AdminProfile = {
  id: string;
  is_active: boolean;
  role?: string | null;
  email?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  [key: string]: unknown;
};

type ContactMessage = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type BookingInquiry = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tattoo_idea: string | null;
  placement: string | null;
  size_estimate: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  budget: string | null;
  reference_links: string | null;
  message: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type CommissionInquiry = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  commission_type: string | null;
  description: string | null;
  size_request: string | null;
  budget: string | null;
  deadline: string | null;
  reference_links: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type CalendarEvent = {
  id: number | string;
  event_type: string;
  inquiry_type: string | null;
  inquiry_id: number | string | null;
  title: string;
  description: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  all_day: boolean | null;
  location: string | null;
  external_link: string | null;
  status: string | null;
  is_public: boolean | null;
  blocks_booking: boolean | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type DashboardData = {
  messages: ContactMessage[];
  bookings: BookingInquiry[];
  commissions: CommissionInquiry[];
};

type DashboardErrors = Partial<Record<keyof DashboardData, string>>;
type AdminTab = 'overview' | 'messages' | 'bookings' | 'commissions' | 'calendar' | 'gallery' | 'content';
type SubmissionKind = keyof DashboardData;
type FilterValue = 'all' | 'pending' | 'contacted' | 'approved' | 'archived';
type CalendarVisibilityFilter = 'all' | 'public' | 'private';
type ProfileStatus = 'idle' | 'loading' | 'authorized' | 'unauthorized' | 'error';

type ReferenceLink = {
  name: string;
  url: string;
  type?: string;
};

type RecentSubmission = {
  id: string;
  type: 'Message' | 'Tattoo Booking' | 'Commission';
  title: string;
  detail: string;
  status: string | null;
  createdAt: string | null;
};

type CalendarEventFormValues = {
  event_type: string;
  inquiry_type: string;
  inquiry_id: string;
  title: string;
  description: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  location: string;
  external_link: string;
  status: string;
  is_public: boolean;
  blocks_booking: boolean;
  notes: string;
  updateInquiryStatus?: boolean;
  sourceKind?: 'booking' | 'commission';
  sourceId?: number | string;
};

type GalleryFormValues = {
  title: string;
  description: string;
  alt_text: string;
  category: GalleryCategory;
  display_location: GalleryDisplayLocation;
  is_active: boolean;
  is_featured: boolean;
  display_order: string;
};

type GalleryImageTransformValues = {
  zoom: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

type SiteContentFormValues = {
  content_key: string;
  section: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  image_path: string;
  button_label: string;
  button_url: string;
  display_location: SiteContentDisplayLocation;
  content_type: SiteContentType;
  is_active: boolean;
  is_featured: boolean;
  display_order: string;
  starts_at: string;
  ends_at: string;
};

const emptyDashboardData: DashboardData = {
  messages: [],
  bookings: [],
  commissions: [],
};

const emptyGalleryFormValues: GalleryFormValues = {
  title: '',
  description: '',
  alt_text: '',
  category: 'tattoo_gallery',
  display_location: 'gallery',
  is_active: true,
  is_featured: false,
  display_order: '0',
};

const defaultGalleryImageTransformValues: GalleryImageTransformValues = {
  zoom: 1,
  rotate: 0,
  offsetX: 0,
  offsetY: 0,
};

const emptySiteContentFormValues: SiteContentFormValues = {
  content_key: '',
  section: '',
  title: '',
  subtitle: '',
  body: '',
  image_url: '',
  image_path: '',
  button_label: '',
  button_url: '',
  display_location: 'homepage',
  content_type: 'announcement',
  is_active: true,
  is_featured: false,
  display_order: '0',
  starts_at: '',
  ends_at: '',
};

const ownerContentTemplates = [
  {
    label: 'Homepage announcement',
    description: 'Post a general update on the Gaston Collective homepage.',
    display_location: 'homepage',
    content_type: 'announcement',
    is_featured: true,
    section: 'Homepage announcement',
  },
  {
    label: 'Velvet Ink notice',
    description: 'Share booking, flash, or studio updates on Velvet Ink.',
    display_location: 'velvet_ink',
    content_type: 'notice',
    is_featured: false,
    section: 'Velvet Ink notice',
  },
  {
    label: 'Shop update',
    description: 'Announce drops, stock updates, or commission availability.',
    display_location: 'shop',
    content_type: 'notice',
    is_featured: false,
    section: 'Shop update',
  },
  {
    label: 'Written Word update',
    description: 'Share book, author, signing, or writing updates.',
    display_location: 'written_word',
    content_type: 'announcement',
    is_featured: false,
    section: 'Written Word update',
  },
  {
    label: 'Events notice',
    description: 'Add a note to the public events calendar page.',
    display_location: 'events',
    content_type: 'notice',
    is_featured: false,
    section: 'Events notice',
  },
] satisfies Array<{
  label: string;
  description: string;
  display_location: SiteContentDisplayLocation;
  content_type: SiteContentType;
  is_featured: boolean;
  section: string;
}>;

const messageStatusOptions = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
];

const inquiryStatusOptions = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const filterOptions = [
  { value: 'all', label: 'Show all' },
  { value: 'pending', label: 'New/pending only' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
] satisfies { value: FilterValue; label: string }[];

const calendarEventTypes = [
  { value: 'tattoo_appointment', label: 'Tattoo Appointment' },
  { value: 'commission_work', label: 'Commission Work' },
  { value: 'book_signing', label: 'Book Signing' },
  { value: 'poetry_night', label: 'Poetry Night' },
  { value: 'popup_event', label: 'Pop-up Event' },
  { value: 'shop_drop', label: 'Shop Drop' },
  { value: 'blocked_time', label: 'Blocked Time' },
  { value: 'other', label: 'Other' },
];

const publicEventTypeValues = new Set(['book_signing', 'poetry_night', 'popup_event', 'shop_drop']);

const defaultBlocksBookingByEventType: Record<string, boolean> = {
  tattoo_appointment: true,
  commission_work: false,
  book_signing: true,
  poetry_night: true,
  popup_event: true,
  shop_drop: false,
  blocked_time: true,
  other: false,
};

const calendarStatusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const emptyCalendarEventForm: CalendarEventFormValues = {
  event_type: 'tattoo_appointment',
  inquiry_type: '',
  inquiry_id: '',
  title: '',
  description: '',
  client_name: '',
  client_email: '',
  client_phone: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  all_day: false,
  location: '',
  external_link: '',
  status: 'scheduled',
  is_public: false,
  blocks_booking: true,
  notes: '',
};

function defaultBlocksBookingForEventType(eventType: string) {
  return defaultBlocksBookingByEventType[eventType] ?? false;
}

function newCalendarEventFormValues(overrides: Partial<CalendarEventFormValues> = {}): CalendarEventFormValues {
  const eventType = overrides.event_type ?? emptyCalendarEventForm.event_type;
  const publicFriendly = publicEventTypeValues.has(eventType);

  return {
    ...emptyCalendarEventForm,
    start_date: isoDateKey(new Date()),
    ...overrides,
    event_type: eventType,
    status: overrides.status ?? 'scheduled',
    is_public: publicFriendly ? (overrides.is_public ?? true) : false,
    blocks_booking: overrides.blocks_booking ?? defaultBlocksBookingForEventType(eventType),
  };
}

function profileTextValue(profile: AdminProfile | null, keys: Array<keyof AdminProfile>) {
  for (const key of keys) {
    const value = profile?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function userDisplayName(user: User | undefined, profile: AdminProfile | null) {
  const profileName = profileTextValue(profile, ['full_name', 'display_name', 'name']);
  if (profileName) return profileName;

  const metadataName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();

  return user?.email || 'Admin';
}

function userEmail(user: User | undefined, profile: AdminProfile | null) {
  return profileTextValue(profile, ['email']) || user?.email || 'No email on file';
}

function roleLabel(profile: AdminProfile | null) {
  return profileTextValue(profile, ['role']) || 'admin';
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '-';
  const text = String(value).trim();
  return text || '-';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthLabel(value: Date) {
  return value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatTime(value: string | null | undefined) {
  if (!value) return '';
  const [hourValue, minuteValue] = value.split(':');
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatEventDateTime(event: CalendarEvent) {
  const dateText = formatDateOnly(event.start_date);
  if (event.all_day) return `${dateText} · All day`;

  const start = formatTime(event.start_time);
  const end = formatTime(event.end_time);
  if (start && end) return `${dateText} · ${start} - ${end}`;
  if (start) return `${dateText} · ${start}`;
  return dateText;
}

function eventTypeLabel(value: string | null | undefined) {
  const found = calendarEventTypes.find((eventType) => eventType.value === value);
  return found?.label ?? statusLabel(value);
}

function isoDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function coerceInquiryId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
}

function calendarPayloadFromForm(values: CalendarEventFormValues) {
  const canBePublic = publicEventTypeValues.has(values.event_type);

  return {
    event_type: values.event_type,
    inquiry_type: cleanOptional(values.inquiry_type),
    inquiry_id: coerceInquiryId(values.inquiry_id),
    title: values.title.trim(),
    description: cleanOptional(values.description),
    client_name: cleanOptional(values.client_name),
    client_email: cleanOptional(values.client_email),
    client_phone: cleanOptional(values.client_phone),
    start_date: values.start_date,
    start_time: values.all_day ? null : cleanOptional(values.start_time),
    end_date: cleanOptional(values.end_date),
    end_time: values.all_day ? null : cleanOptional(values.end_time),
    all_day: values.all_day,
    location: cleanOptional(values.location),
    external_link: cleanOptional(values.external_link),
    status: values.status || 'scheduled',
    is_public: canBePublic ? values.is_public : false,
    blocks_booking: values.blocks_booking,
    notes: cleanOptional(values.notes),
  };
}

function calendarEventToFormValues(event: CalendarEvent): CalendarEventFormValues {
  return {
    event_type: event.event_type || 'other',
    inquiry_type: event.inquiry_type ?? '',
    inquiry_id: event.inquiry_id === null || event.inquiry_id === undefined ? '' : String(event.inquiry_id),
    title: event.title ?? '',
    description: event.description ?? '',
    client_name: event.client_name ?? '',
    client_email: event.client_email ?? '',
    client_phone: event.client_phone ?? '',
    start_date: event.start_date ?? '',
    start_time: event.start_time ?? '',
    end_date: event.end_date ?? '',
    end_time: event.end_time ?? '',
    all_day: Boolean(event.all_day),
    location: event.location ?? '',
    external_link: event.external_link ?? '',
    status: event.status ?? 'scheduled',
    is_public: publicEventTypeValues.has(event.event_type) ? Boolean(event.is_public) : false,
    blocks_booking: event.blocks_booking ?? defaultBlocksBookingForEventType(event.event_type),
    notes: event.notes ?? '',
  };
}

function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((left, right) => {
    const leftTime = toTimestamp(`${left.start_date}T${left.start_time || '00:00:00'}`);
    const rightTime = toTimestamp(`${right.start_date}T${right.start_time || '00:00:00'}`);
    return leftTime - rightTime || left.title.localeCompare(right.title);
  });
}

function sortGalleryItems(items: GalleryItem[]) {
  return [...items].sort((left, right) => {
    const orderDifference = (left.display_order ?? 0) - (right.display_order ?? 0);
    if (orderDifference !== 0) return orderDifference;

    return toTimestamp(right.created_at) - toTimestamp(left.created_at);
  });
}

function mergeGalleryItems(current: GalleryItem[], incoming: GalleryItem[]) {
  const byId = new Map(current.map((item) => [String(item.id), item]));
  incoming.forEach((item) => byId.set(String(item.id), item));
  return sortGalleryItems([...byId.values()]);
}

function sortSiteContentItems(items: SiteContentItem[]) {
  return [...items].sort((left, right) => {
    const orderDifference = (left.display_order ?? 0) - (right.display_order ?? 0);
    if (orderDifference !== 0) return orderDifference;

    return toTimestamp(right.created_at) - toTimestamp(left.created_at);
  });
}

function mergeSiteContentItems(current: SiteContentItem[], incoming: SiteContentItem[]) {
  const byId = new Map(current.map((item) => [String(item.id), item]));
  incoming.forEach((item) => byId.set(String(item.id), item));
  return sortSiteContentItems([...byId.values()]);
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normalizeStatus(status: string | null | undefined) {
  return status?.trim().toLowerCase() || '';
}

function isNewMessage(message: ContactMessage) {
  return ['new', 'unread'].includes(normalizeStatus(message.status));
}

function isPending(status: string | null | undefined) {
  return ['new', 'unread', 'pending', 'pending_review'].includes(normalizeStatus(status));
}

function statusLabel(value: string | null | undefined) {
  const normalized = normalizeStatus(value);
  if (!normalized) return '-';
  return normalized
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function matchesFilter(status: string | null | undefined, filter: FilterValue) {
  const normalized = normalizeStatus(status);

  if (filter === 'all') return true;
  if (filter === 'pending') return ['new', 'unread', 'pending', 'pending_review'].includes(normalized);
  if (filter === 'contacted') return ['contacted', 'responded'].includes(normalized);
  if (filter === 'approved') return normalized === 'approved';
  return normalized === 'archived';
}

function editableStatusValue(status: string | null | undefined, options: { value: string }[]) {
  const normalized = normalizeStatus(status);
  const values = new Set(options.map((option) => option.value));

  if (values.has(normalized)) return normalized;
  if (normalized === 'unread' && values.has('new')) return 'new';
  if (normalized === 'pending' && values.has('pending_review')) return 'pending_review';

  return options[0]?.value ?? '';
}

function phoneHref(phone: string | null | undefined) {
  const cleaned = phone?.replace(/[^\d+]/g, '') ?? '';
  return cleaned ? `tel:${cleaned}` : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function referenceFromUnknown(value: unknown, index: number): ReferenceLink | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return { name: `Reference ${index + 1}`, url: trimmed };
  }

  if (!isRecord(value)) return null;

  const rawUrl = value.url ?? value.href ?? value.publicUrl;
  const rawName = value.name ?? value.fileName ?? value.filename;
  const rawType = value.type ?? value.contentType;
  const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!url) return null;

  return {
    name: typeof rawName === 'string' && rawName.trim() ? rawName.trim() : `Reference ${index + 1}`,
    url,
    type: typeof rawType === 'string' ? rawType : undefined,
  };
}

function parseReferenceLinks(value: string | null | undefined): ReferenceLink[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => referenceFromUnknown(item, index))
        .filter((item): item is ReferenceLink => Boolean(item));
    }

    const single = referenceFromUnknown(parsed, 0);
    return single ? [single] : [];
  } catch {
    return value
      .split(',')
      .map((item, index) => referenceFromUnknown(item, index))
      .filter((item): item is ReferenceLink => Boolean(item));
  }
}

function isImageReference(reference: ReferenceLink) {
  const type = reference.type?.toLowerCase() ?? '';
  const url = reference.url.toLowerCase();
  return type.startsWith('image/') || /\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(url);
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-md" style={{ color: '#E8DDD4' }}>
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="font-serif text-lg transition-opacity duration-300 hover:opacity-70"
            style={{ color: '#F4A5AE' }}
          >
            The Gaston Collective
          </Link>
          <h1 className="font-serif mt-6" style={{ fontSize: 30, fontWeight: 600 }}>
            Admin Portal
          </h1>
        </div>
        <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 28 }}>
          {children}
        </div>
      </div>
    </main>
  );
}

function StatusMessage({
  tone,
  children,
}: {
  tone: 'success' | 'error' | 'neutral';
  children: ReactNode;
}) {
  const color = tone === 'success' ? '#6B8F71' : tone === 'error' ? '#D14A6E' : '#E8DDD4';
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : ShieldCheck;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className="font-sans text-sm flex items-start gap-2"
      style={{ color, lineHeight: 1.5 }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <AuthFrame>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="animate-spin" size={26} style={{ color: '#F4A5AE' }} />
        <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#E8DDD4', opacity: 0.78 }}>
          {label}
        </p>
      </div>
    </AuthFrame>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.72 }}>
      <Loader2 className="animate-spin" size={18} style={{ color: '#F4A5AE' }} />
      {label}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div style={{ border: '1px solid #D14A6E55', borderRadius: 8, padding: 18, backgroundColor: 'rgba(209, 74, 110, 0.06)' }}>
      <StatusMessage tone="error">{message}</StatusMessage>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="text-center py-14" style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414' }}>
      <Inbox size={34} style={{ color: '#E8DDD4', opacity: 0.24, margin: '0 auto' }} />
      <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.58 }}>
        {children}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeStatus(status);
  const color =
    normalized === 'unread' || normalized === 'new' || normalized === 'pending' || normalized === 'pending_review'
      ? '#D14A6E'
      : normalized === 'completed' || normalized === 'confirmed' || normalized === 'read' || normalized === 'approved'
        ? '#6B8F71'
        : '#C4A265';

  return (
    <span
      className="inline-flex items-center font-sans text-xs uppercase px-2.5 py-1"
      style={{ color, border: `1px solid ${color}`, borderRadius: 4, letterSpacing: '0.08em' }}
    >
      {statusLabel(status)}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-sans text-xs uppercase mb-1" style={{ color: '#E8DDD4', opacity: 0.52, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <div className="font-sans text-sm break-words whitespace-pre-wrap" style={{ color: '#E8DDD4', lineHeight: 1.55 }}>
        {children || '-'}
      </div>
    </div>
  );
}

function FilterControls({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="font-sans text-xs uppercase px-3 py-2 transition-all duration-300"
          style={{
            color: value === option.value ? '#0A0A0A' : '#E8DDD4',
            backgroundColor: value === option.value ? '#F4A5AE' : 'transparent',
            border: `1px solid ${value === option.value ? '#F4A5AE' : '#2A2A2A'}`,
            borderRadius: 6,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function AdminEditFields({
  status,
  adminNotes,
  statusOptions,
  onSave,
}: {
  status: string | null | undefined;
  adminNotes: string | null | undefined;
  statusOptions: { value: string; label: string }[];
  onSave: (input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const selectedStatusValue = editableStatusValue(status, statusOptions);
  const [selectedStatus, setSelectedStatus] = useState(selectedStatusValue);
  const [notes, setNotes] = useState(adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setSelectedStatus(selectedStatusValue);
    setNotes(adminNotes ?? '');
  }, [adminNotes, selectedStatusValue]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      await onSave({ status: selectedStatus, adminNotes: notes });
      setSaveSuccess('Saved.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 pt-5" style={{ borderTop: '1px solid #1A1A1A' }}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_1fr] gap-4">
        <div>
          <label className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.62, letterSpacing: '0.1em' }}>
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full font-sans text-sm px-3 py-3 outline-none"
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.62, letterSpacing: '0.1em' }}>
            Admin notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full font-sans text-sm px-3 py-3 resize-y outline-none"
            placeholder="Add a private note..."
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6, lineHeight: 1.55 }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="font-sans text-xs uppercase px-4 py-2.5 flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#0A0A0A',
            backgroundColor: '#F4A5AE',
            border: '1px solid #F4A5AE',
            borderRadius: 6,
            cursor: saving ? 'wait' : 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
          {saving ? 'Saving' : 'Save'}
        </button>
        {saveSuccess && <StatusMessage tone="success">{saveSuccess}</StatusMessage>}
        {saveError && <StatusMessage tone="error">{saveError}</StatusMessage>}
      </div>
    </div>
  );
}

function ContactLinks({ email, phone }: { email: string | null | undefined; phone?: string | null }) {
  const cleanEmail = email?.trim();
  const cleanPhone = phone?.trim();
  const tel = phoneHref(cleanPhone);

  return (
    <div className="flex flex-wrap gap-2">
      {cleanEmail && (
        <a
          href={`mailto:${cleanEmail}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs"
          style={{ color: '#F4A5AE', textDecoration: 'none' }}
        >
          <Mail size={13} />
          {cleanEmail}
        </a>
      )}
      {cleanPhone && tel && (
        <a
          href={tel}
          className="inline-flex items-center gap-1.5 font-sans text-xs"
          style={{ color: '#C4A265', textDecoration: 'none' }}
        >
          <Phone size={13} />
          {cleanPhone}
        </a>
      )}
    </div>
  );
}

function ReferenceLinks({ value }: { value: string | null | undefined }) {
  const references = parseReferenceLinks(value);

  if (references.length === 0) {
    return (
      <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.58 }}>
        No reference links.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {references.map((reference, index) => (
        <a
          key={`${reference.url}-${index}`}
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
          style={{ color: '#E8DDD4', textDecoration: 'none' }}
        >
          {isImageReference(reference) ? (
            <span className="block" style={{ width: 92 }}>
              <img
                src={reference.url}
                alt={reference.name}
                loading="lazy"
                className="object-cover"
                style={{ width: 92, height: 92, border: '1px solid #2A2A2A', borderRadius: 6, backgroundColor: '#0A0A0A' }}
              />
              <span className="font-sans text-xs mt-2 flex items-center gap-1 break-words" style={{ color: '#F4A5AE' }}>
                {reference.name}
                <ExternalLink size={11} />
              </span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-2 font-sans text-xs px-3 py-2"
              style={{ border: '1px solid #2A2A2A', borderRadius: 6, color: '#F4A5AE' }}
            >
              {reference.name}
              <ExternalLink size={12} />
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function referenceSummary(value: string | null | undefined) {
  const references = parseReferenceLinks(value);
  if (references.length === 0) return '';
  return references.map((reference) => `${reference.name}: ${reference.url}`).join('\n');
}

function validDateInput(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : '';
}

function bookingCalendarDraft(booking: BookingInquiry): CalendarEventFormValues {
  const referenceText = referenceSummary(booking.reference_links);
  const notes = [
    booking.placement ? `Placement: ${booking.placement}` : '',
    booking.size_estimate ? `Size: ${booking.size_estimate}` : '',
    booking.budget ? `Budget: ${booking.budget}` : '',
    booking.message ? `Message:\n${booking.message}` : '',
    referenceText ? `Reference links:\n${referenceText}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    ...newCalendarEventFormValues(),
    event_type: 'tattoo_appointment',
    inquiry_type: 'booking',
    inquiry_id: String(booking.id),
    title: booking.tattoo_idea?.trim() || 'Tattoo Appointment',
    description: booking.tattoo_idea ?? '',
    client_name: booking.name ?? '',
    client_email: booking.email ?? '',
    client_phone: booking.phone ?? '',
    start_date: validDateInput(booking.preferred_date),
    start_time: booking.preferred_time ?? '',
    status: 'scheduled',
    is_public: false,
    blocks_booking: true,
    notes,
    updateInquiryStatus: true,
    sourceKind: 'booking',
    sourceId: booking.id,
  };
}

function commissionCalendarDraft(commission: CommissionInquiry): CalendarEventFormValues {
  const referenceText = referenceSummary(commission.reference_links);
  const notes = [
    commission.description ? `Description:\n${commission.description}` : '',
    commission.budget ? `Budget: ${commission.budget}` : '',
    commission.deadline ? `Deadline: ${commission.deadline}` : '',
    referenceText ? `Reference links:\n${referenceText}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    ...newCalendarEventFormValues(),
    event_type: 'commission_work',
    inquiry_type: 'commission',
    inquiry_id: String(commission.id),
    title: commission.commission_type?.trim() || 'Commission Work',
    description: commission.description ?? '',
    client_name: commission.name ?? '',
    client_email: commission.email ?? '',
    client_phone: commission.phone ?? '',
    status: 'scheduled',
    is_public: false,
    blocks_booking: false,
    notes,
    updateInquiryStatus: true,
    sourceKind: 'commission',
    sourceId: commission.id,
  };
}

function canCreateCalendarFromInquiry(status: string | null | undefined) {
  return ['approved', 'contacted'].includes(normalizeStatus(status));
}

function galleryFormFromItem(item: GalleryItem): GalleryFormValues {
  return {
    title: item.title ?? '',
    description: item.description ?? '',
    alt_text: item.alt_text ?? '',
    category: GALLERY_CATEGORIES.includes(item.category as GalleryCategory) ? (item.category as GalleryCategory) : 'other',
    display_location: GALLERY_DISPLAY_LOCATIONS.includes(item.display_location as GalleryDisplayLocation) ? (item.display_location as GalleryDisplayLocation) : 'gallery',
    is_active: item.is_active === true,
    is_featured: item.is_featured === true,
    display_order: String(item.display_order ?? 0),
  };
}

function galleryInputFromForm(values: GalleryFormValues, image: { url: string; path: string }): GalleryItemInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    alt_text: values.alt_text.trim() || values.title.trim(),
    image_url: image.url,
    image_path: image.path,
    category: values.category,
    display_location: values.display_location,
    is_active: values.is_active,
    is_featured: values.is_featured,
    display_order: Number.parseInt(values.display_order, 10) || 0,
  };
}

function galleryUpdateFromForm(values: GalleryFormValues, image?: { url: string; path: string }): GalleryItemUpdate {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    alt_text: values.alt_text.trim() || values.title.trim(),
    ...(image ? { image_url: image.url, image_path: image.path } : {}),
    category: values.category,
    display_location: values.display_location,
    is_active: values.is_active,
    is_featured: values.is_featured,
    display_order: Number.parseInt(values.display_order, 10) || 0,
  };
}

function siteContentFormFromItem(item: SiteContentItem): SiteContentFormValues {
  return {
    content_key: item.content_key ?? '',
    section: item.section ?? '',
    title: item.title ?? '',
    subtitle: item.subtitle ?? '',
    body: item.body ?? '',
    image_url: item.image_url ?? '',
    image_path: item.image_path ?? '',
    button_label: item.button_label ?? '',
    button_url: item.button_url ?? '',
    display_location: SITE_CONTENT_DISPLAY_LOCATIONS.includes(item.display_location as SiteContentDisplayLocation)
      ? (item.display_location as SiteContentDisplayLocation)
      : 'general',
    content_type: SITE_CONTENT_TYPES.includes(item.content_type as SiteContentType) ? (item.content_type as SiteContentType) : 'general',
    is_active: item.is_active === true,
    is_featured: item.is_featured === true,
    display_order: String(item.display_order ?? 0),
    starts_at: dateTimeInputValue(item.starts_at),
    ends_at: dateTimeInputValue(item.ends_at),
  };
}

function siteContentInputFromForm(values: SiteContentFormValues): SiteContentInput {
  const contentKey = values.content_key.trim() || generateSiteContentKey(values);

  return {
    content_key: contentKey,
    section: values.section.trim() || defaultSiteContentSection(values),
    title: values.title.trim() || null,
    subtitle: values.subtitle.trim() || null,
    body: values.body.trim() || null,
    image_url: values.image_url.trim() || null,
    image_path: values.image_path.trim() || null,
    button_label: values.button_label.trim() || null,
    button_url: values.button_url.trim() || null,
    display_location: values.display_location,
    content_type: values.content_type,
    is_active: values.is_active,
    is_featured: values.is_featured,
    display_order: Number.parseInt(values.display_order, 10) || 0,
    starts_at: dateTimeInputToIso(values.starts_at),
    ends_at: dateTimeInputToIso(values.ends_at),
  };
}

function siteContentUpdateFromForm(values: SiteContentFormValues): SiteContentUpdate {
  return siteContentInputFromForm(values);
}

function defaultSiteContentSection(values: SiteContentFormValues) {
  return ownerContentTemplates.find((template) => template.display_location === values.display_location)?.section
    ?? siteContentLabel(values.display_location);
}

function generateSiteContentKey(values: SiteContentFormValues) {
  const source = values.title || values.body || values.section || 'update';
  const slug = source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  return `${values.display_location}-${values.content_type}-${slug || 'update'}-${Date.now().toString(36)}`;
}

function dateTimeInputValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function dateTimeInputToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function galleryTransformHasChanges(values: GalleryImageTransformValues) {
  return (
    Math.abs(values.zoom - defaultGalleryImageTransformValues.zoom) > 0.001 ||
    values.rotate !== defaultGalleryImageTransformValues.rotate ||
    values.offsetX !== defaultGalleryImageTransformValues.offsetX ||
    values.offsetY !== defaultGalleryImageTransformValues.offsetY
  );
}

async function createTransformedGalleryImageFile(
  imageUrl: string,
  title: string,
  transform: GalleryImageTransformValues,
) {
  const image = await loadEditableImage(imageUrl);
  const maxOutputDimension = 1800;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const outputScale = Math.min(1, maxOutputDimension / Math.max(sourceWidth, sourceHeight));
  const outputWidth = Math.round(sourceWidth * outputScale);
  const outputHeight = Math.round(sourceHeight * outputScale);
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image editor could not start in this browser.');
  }

  const zoom = clampNumber(transform.zoom, 1, 3);
  const rotate = clampNumber(transform.rotate, -180, 180);
  const offsetX = clampNumber(transform.offsetX, -50, 50);
  const offsetY = clampNumber(transform.offsetY, -50, 50);
  const fitScale = Math.min(outputWidth / sourceWidth, outputHeight / sourceHeight) * zoom;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.translate(
    outputWidth / 2 + (offsetX / 100) * outputWidth,
    outputHeight / 2 + (offsetY / 100) * outputHeight,
  );
  context.rotate((rotate * Math.PI) / 180);
  context.scale(fitScale, fitScale);
  context.drawImage(image, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Image edits could not be exported.'));
        }
      },
      'image/webp',
      0.9,
    );
  });

  return new File([blob], `${cleanGalleryEditFileName(title)}-edited.webp`, { type: 'image/webp' });
}

function loadEditableImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be loaded for editing.'));
    image.src = imageUrl;
  });
}

function cleanGalleryEditFileName(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'gallery-image';
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Unable to sign in. Please check the email and password.');
      setLoading(false);
      return;
    }

    setPassword('');
    setSuccess('Signed in. Checking admin access...');
  };

  return (
    <AuthFrame>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="admin-email" className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.75, letterSpacing: '0.12em' }}>
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
            style={{ color: '#E8DDD4', border: '1px solid #2A2A2A', borderRadius: 6 }}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.75, letterSpacing: '0.12em' }}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
            style={{ color: '#E8DDD4', border: '1px solid #2A2A2A', borderRadius: 6 }}
            required
          />
        </div>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {success && <StatusMessage tone="success">{success}</StatusMessage>}

        <button
          type="submit"
          disabled={loading}
          className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#0A0A0A',
            backgroundColor: '#F4A5AE',
            border: '1px solid #F4A5AE',
            borderRadius: 6,
            cursor: loading ? 'wait' : 'pointer',
            letterSpacing: '0.12em',
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={15} /> : <LogIn size={15} />}
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-7">
        <Link className="font-sans text-xs uppercase" to="/" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.12em' }}>
          Back to site
        </Link>
      </div>
    </AuthFrame>
  );
}

function UnauthorizedState({
  session,
  profile,
  onLogout,
  logoutLoading,
  logoutError,
}: {
  session: Session;
  profile: AdminProfile | null;
  onLogout: () => void;
  logoutLoading: boolean;
  logoutError: string;
}) {
  return (
    <AuthFrame>
      <div className="flex flex-col gap-6">
        <StatusMessage tone="error">
          This account is signed in, but it is not an active admin account.
        </StatusMessage>

        <div className="grid gap-2 font-sans text-sm" style={{ color: '#E8DDD4' }}>
          <p>
            <span style={{ opacity: 0.62 }}>Email:</span> {userEmail(session.user, profile)}
          </p>
          <p>
            <span style={{ opacity: 0.62 }}>Status:</span> Not authorized
          </p>
        </div>

        {logoutError && <StatusMessage tone="error">{logoutError}</StatusMessage>}

        <button
          type="button"
          onClick={onLogout}
          disabled={logoutLoading}
          className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#E8DDD4',
            backgroundColor: 'transparent',
            border: '1px solid #D14A6E',
            borderRadius: 6,
            cursor: logoutLoading ? 'wait' : 'pointer',
            letterSpacing: '0.12em',
          }}
        >
          {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
          Log out
        </button>
      </div>
    </AuthFrame>
  );
}

function OverviewSection({ data, loading, errors }: { data: DashboardData; loading: boolean; errors: DashboardErrors }) {
  const recentSubmissions = useMemo<RecentSubmission[]>(() => {
    const messages = data.messages.map((message) => ({
      id: `message-${message.id}`,
      type: 'Message' as const,
      title: displayValue(message.name),
      detail: displayValue(message.subject || message.message),
      status: message.status,
      createdAt: message.created_at,
    }));

    const bookings = data.bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      type: 'Tattoo Booking' as const,
      title: displayValue(booking.name),
      detail: displayValue(booking.tattoo_idea),
      status: booking.status,
      createdAt: booking.created_at,
    }));

    const commissions = data.commissions.map((commission) => ({
      id: `commission-${commission.id}`,
      type: 'Commission' as const,
      title: displayValue(commission.name),
      detail: displayValue(commission.commission_type || commission.description),
      status: commission.status,
      createdAt: commission.created_at,
    }));

    return [...messages, ...bookings, ...commissions]
      .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
      .slice(0, 5);
  }, [data]);

  const summaryCards = [
    {
      label: 'New messages',
      value: data.messages.filter(isNewMessage).length,
      icon: <Mail size={20} />,
      color: '#F4A5AE',
    },
    {
      label: 'Pending tattoo bookings',
      value: data.bookings.filter((booking) => isPending(booking.status)).length,
      icon: <Calendar size={20} />,
      color: '#C4A265',
    },
    {
      label: 'Pending commissions',
      value: data.commissions.filter((commission) => isPending(commission.status)).length,
      icon: <Palette size={20} />,
      color: '#6B8F71',
    },
  ];

  if (loading) return <InlineLoading label="Loading dashboard overview" />;

  return (
    <div className="flex flex-col gap-8">
      {Object.keys(errors).length > 0 && (
        <ErrorPanel message="Some dashboard data could not be loaded. Check the section tabs for details, then try Refresh." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <article key={card.label} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.58, letterSpacing: '0.1em' }}>
                  {card.label}
                </p>
                <p className="font-serif mt-3" style={{ color: '#E8DDD4', fontSize: 32, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 6, color: card.color, backgroundColor: `${card.color}18` }}>
                {card.icon}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} style={{ color: '#F4A5AE' }} />
          <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
            Recent Submissions
          </h2>
        </div>

        {recentSubmissions.length === 0 ? (
          <EmptyState>No submissions yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <article
                key={submission.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
                      {submission.type}
                    </span>
                    <StatusBadge status={submission.status} />
                  </div>
                  <p className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                    {submission.title}
                  </p>
                  <p className="font-sans text-sm mt-1 break-words" style={{ color: '#E8DDD4', opacity: 0.68 }}>
                    {submission.detail}
                  </p>
                </div>
                <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
                  {formatDate(submission.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SiteStatusPanel({
  underDevelopmentEnabled,
  saving,
  message,
  error,
  onToggle,
  onEditMessage,
}: {
  underDevelopmentEnabled: boolean;
  saving: boolean;
  message: string;
  error: string;
  onToggle: () => void;
  onEditMessage: () => void;
}) {
  const accent = underDevelopmentEnabled ? '#D14A6E' : '#6B8F71';

  return (
    <section
      className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-4 xl:items-center"
      style={{ border: `1px solid ${accent}66`, borderRadius: 8, backgroundColor: underDevelopmentEnabled ? 'rgba(209, 74, 110, 0.08)' : 'rgba(107, 143, 113, 0.08)', padding: 18 }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-sans text-xs uppercase" style={{ color: accent, letterSpacing: '0.12em' }}>
            Site visibility
          </p>
          <span
            className="font-sans text-xs uppercase px-2.5 py-1"
            style={{ color: accent, border: `1px solid ${accent}88`, borderRadius: 4, letterSpacing: '0.08em' }}
          >
            {underDevelopmentEnabled ? 'Under development page is on' : 'Website is live'}
          </span>
        </div>
        <h2 className="font-serif mt-3" style={{ color: '#E8DDD4', fontSize: 24, lineHeight: 1.2, fontWeight: 600 }}>
          {underDevelopmentEnabled ? 'Public visitors are seeing the holding page.' : 'Public visitors can see the website.'}
        </h2>
        <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.68, lineHeight: 1.6 }}>
          Turn this on while the site is unfinished. The admin portal stays available, so you can turn it off whenever the site is ready.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {message && <StatusMessage tone="success">{message}</StatusMessage>}
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row xl:flex-col gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          className="font-sans text-xs uppercase px-5 py-3 inline-flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{ color: '#0A0A0A', backgroundColor: accent, border: `1px solid ${accent}`, borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : underDevelopmentEnabled ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {saving ? 'Saving' : underDevelopmentEnabled ? 'Make website live' : 'Hide site for now'}
        </button>
        <button
          type="button"
          onClick={onEditMessage}
          className="font-sans text-xs uppercase px-5 py-3 transition-all duration-300"
          style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          Edit holding message
        </button>
      </div>
    </section>
  );
}

function MessagesSection({
  messages,
  loading,
  error,
  onSave,
}: {
  messages: ContactMessage[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredMessages = messages.filter((message) => matchesFilter(message.status, filter));

  if (loading) return <InlineLoading label="Loading contact messages" />;
  if (error) return <ErrorPanel message={error} />;
  if (messages.length === 0) return <EmptyState>No messages yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredMessages.length === 0 && <EmptyState>No messages match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredMessages.map((message) => (
        <article key={message.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(message.name)}
                </h2>
                <StatusBadge status={message.status} />
              </div>
              <ContactLinks email={message.email} phone={message.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(message.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {message.subject && <Field label="Subject">{message.subject}</Field>}
            <Field label="Message">{displayValue(message.message)}</Field>
          </div>
          <AdminEditFields
            status={message.status}
            adminNotes={message.admin_notes}
            statusOptions={messageStatusOptions}
            onSave={(input) => onSave(message.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function BookingSection({
  bookings,
  loading,
  error,
  onSave,
  onAddToCalendar,
}: {
  bookings: BookingInquiry[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
  onAddToCalendar: (values: CalendarEventFormValues) => void;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredBookings = bookings.filter((booking) => matchesFilter(booking.status, filter));

  if (loading) return <InlineLoading label="Loading tattoo booking inquiries" />;
  if (error) return <ErrorPanel message={error} />;
  if (bookings.length === 0) return <EmptyState>No tattoo booking inquiries yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredBookings.length === 0 && <EmptyState>No tattoo booking inquiries match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredBookings.map((booking) => (
        <article key={booking.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(booking.name)}
                </h2>
                <StatusBadge status={booking.status} />
              </div>
              <ContactLinks email={booking.email} phone={booking.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(booking.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Tattoo idea">{displayValue(booking.tattoo_idea)}</Field>
            <Field label="Placement">{displayValue(booking.placement)}</Field>
            <Field label="Size estimate">{displayValue(booking.size_estimate)}</Field>
            <Field label="Preferred date">{displayValue(booking.preferred_date)}</Field>
            <Field label="Preferred time">{displayValue(booking.preferred_time)}</Field>
            <Field label="Budget">{displayValue(booking.budget)}</Field>
            <Field label="Message">{displayValue(booking.message)}</Field>
            <Field label="Reference links">
              <ReferenceLinks value={booking.reference_links} />
            </Field>
          </div>
          {canCreateCalendarFromInquiry(booking.status) && (
            <button
              type="button"
              onClick={() => onAddToCalendar(bookingCalendarDraft(booking))}
              className="font-sans text-xs uppercase px-4 py-2.5 mt-5 inline-flex items-center gap-2 transition-all duration-300"
              style={{ color: '#0A0A0A', backgroundColor: '#C4A265', border: '1px solid #C4A265', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              <Plus size={14} />
              Add to calendar
            </button>
          )}
          <AdminEditFields
            status={booking.status}
            adminNotes={booking.admin_notes}
            statusOptions={inquiryStatusOptions}
            onSave={(input) => onSave(booking.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function CommissionsSection({
  commissions,
  loading,
  error,
  onSave,
  onAddToCalendar,
}: {
  commissions: CommissionInquiry[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
  onAddToCalendar: (values: CalendarEventFormValues) => void;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredCommissions = commissions.filter((commission) => matchesFilter(commission.status, filter));

  if (loading) return <InlineLoading label="Loading commission requests" />;
  if (error) return <ErrorPanel message={error} />;
  if (commissions.length === 0) return <EmptyState>No commission requests yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredCommissions.length === 0 && <EmptyState>No commission requests match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredCommissions.map((commission) => (
        <article key={commission.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(commission.name)}
                </h2>
                <StatusBadge status={commission.status} />
              </div>
              <ContactLinks email={commission.email} phone={commission.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(commission.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Commission type">{displayValue(commission.commission_type)}</Field>
            <Field label="Description">{displayValue(commission.description)}</Field>
            <Field label="Size request">{displayValue(commission.size_request)}</Field>
            <Field label="Budget">{displayValue(commission.budget)}</Field>
            <Field label="Deadline">{displayValue(commission.deadline)}</Field>
            <Field label="Reference links">
              <ReferenceLinks value={commission.reference_links} />
            </Field>
          </div>
          {canCreateCalendarFromInquiry(commission.status) && (
            <button
              type="button"
              onClick={() => onAddToCalendar(commissionCalendarDraft(commission))}
              className="font-sans text-xs uppercase px-4 py-2.5 mt-5 inline-flex items-center gap-2 transition-all duration-300"
              style={{ color: '#0A0A0A', backgroundColor: '#C4A265', border: '1px solid #C4A265', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              <Plus size={14} />
              Add to calendar
            </button>
          )}
          <AdminEditFields
            status={commission.status}
            adminNotes={commission.admin_notes}
            statusOptions={inquiryStatusOptions}
            onSave={(input) => onSave(commission.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function GalleryManagerSection({
  items,
  loading,
  error,
  onCreate,
  onUpdate,
  onImportLegacy,
}: {
  items: GalleryItem[];
  loading: boolean;
  error: string;
  onCreate: (input: GalleryItemInput) => Promise<void>;
  onUpdate: (id: number | string, input: GalleryItemUpdate) => Promise<void>;
  onImportLegacy: () => Promise<LegacyGalleryImportResult>;
}) {
  const [values, setValues] = useState<GalleryFormValues>(emptyGalleryFormValues);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editValues, setEditValues] = useState<GalleryFormValues>(emptyGalleryFormValues);
  const [editTransform, setEditTransform] = useState<GalleryImageTransformValues>(defaultGalleryImageTransformValues);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [importingLegacy, setImportingLegacy] = useState(false);
  const [legacyImportNotice, setLegacyImportNotice] = useState('');
  const [legacyImportError, setLegacyImportError] = useState('');
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [editNotice, setEditNotice] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!editingItem) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        closeEditModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingItem, saving]);

  const updateValue = (key: keyof GalleryFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateEditValue = (key: keyof GalleryFormValues, value: string | boolean) => {
    setEditValues((current) => ({ ...current, [key]: value }));
    setEditNotice('');
  };

  const updateEditTransform = (key: keyof GalleryImageTransformValues, value: number) => {
    setEditTransform((current) => ({ ...current, [key]: value }));
    setEditNotice('');
  };

  const resetForm = () => {
    setValues(emptyGalleryFormValues);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditValues(emptyGalleryFormValues);
    setEditTransform(defaultGalleryImageTransformValues);
    setEditError('');
    setEditNotice('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = '';

    const validationError = getGalleryImageValidationError(file);
    if (validationError) {
      setSelectedFile(null);
      setFormError(validationError);
      return;
    }

    setFormError('');
    setSelectedFile(file);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setEditValues(galleryFormFromItem(item));
    setEditTransform(defaultGalleryImageTransformValues);
    setEditError('');
    setEditNotice('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!values.title.trim()) {
      setFormError('Please add a title for this gallery item.');
      return;
    }

    if (!editingItem && !selectedFile) {
      setFormError('Please choose an image to upload.');
      return;
    }

    setSaving(true);
    try {
      const uploaded = selectedFile ? await uploadGalleryImage(selectedFile) : undefined;

      if (uploaded) {
        await onCreate(galleryInputFromForm(values, uploaded));
        setNotice('Gallery item created.');
      }

      resetForm();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Gallery item could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem) return;

    setEditError('');
    setEditNotice('');

    if (!editValues.title.trim()) {
      setEditError('Please add a title for this gallery item.');
      return;
    }

    setSaving(true);
    try {
      let editedImage: { url: string; path: string } | undefined;

      if (editingItem.image_url && galleryTransformHasChanges(editTransform)) {
        const file = await createTransformedGalleryImageFile(editingItem.image_url, editValues.title || editingItem.title || 'gallery-image', editTransform);
        editedImage = await uploadGalleryImage(file);
      }

      await onUpdate(editingItem.id, galleryUpdateFromForm(editValues, editedImage));
      closeEditModal();
      setNotice('Gallery item updated.');
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : 'Gallery item could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (item: GalleryItem) => {
    setFormError('');
    setNotice('');
    setEditError('');
    setEditNotice('');
    setSaving(true);
    try {
      await onUpdate(item.id, { is_active: false });
      setNotice('Gallery item archived.');
      if (editingItem?.id === item.id) closeEditModal();
    } catch (archiveError) {
      const message = archiveError instanceof Error ? archiveError.message : 'Gallery item could not be archived.';
      if (editingItem?.id === item.id) {
        setEditError(message);
      } else {
        setFormError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImportLegacy = async () => {
    setLegacyImportError('');
    setLegacyImportNotice('');
    setImportingLegacy(true);

    try {
      const result = await onImportLegacy();
      if (result.created.length > 0) {
        setLegacyImportNotice(`Imported ${result.created.length} existing Velvet Ink image${result.created.length === 1 ? '' : 's'}. ${result.skipped} already existed.`);
      } else {
        setLegacyImportNotice('Existing Velvet Ink images are already imported.');
      }
    } catch (importError) {
      setLegacyImportError(importError instanceof Error ? importError.message : 'Existing Velvet Ink images could not be imported.');
    } finally {
      setImportingLegacy(false);
    }
  };

  if (loading) return <InlineLoading label="Loading gallery items" />;

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorPanel message={error} />}

      <section style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
              Existing Velvet Ink Images
            </h2>
            <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.62, lineHeight: 1.55 }}>
              Bring the original coded Velvet Ink tattoo and piercing images into Gallery Manager so they can be edited, ordered, featured, or archived here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleImportLegacy()}
            disabled={importingLegacy || saving}
            className="font-sans text-xs uppercase px-5 py-3 inline-flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{
              color: '#0A0A0A',
              backgroundColor: '#C4A265',
              border: '1px solid #C4A265',
              borderRadius: 6,
              cursor: importingLegacy || saving ? 'wait' : 'pointer',
              letterSpacing: '0.1em',
            }}
          >
            {importingLegacy ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
            Import Existing Velvet Ink Images
          </button>
        </div>

        {(legacyImportNotice || legacyImportError) && (
          <div className="mt-4">
            {legacyImportNotice && <StatusMessage tone="success">{legacyImportNotice}</StatusMessage>}
            {legacyImportError && <StatusMessage tone="error">{legacyImportError}</StatusMessage>}
          </div>
        )}
      </section>

      <section style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-2xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
              Add Gallery Item
            </h2>
            <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.62, lineHeight: 1.55 }}>
              Upload live site images, organize where they appear, and archive anything that should be hidden.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            <label
              htmlFor="gallery-image"
              className="min-h-[260px] flex flex-col items-center justify-center gap-3 text-center"
              style={{ border: '1px dashed #2A2A2A', borderRadius: 8, backgroundColor: '#0A0A0A', cursor: 'pointer', overflow: 'hidden' }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Gallery preview" className="w-full h-full object-contain" style={{ minHeight: 260 }} />
              ) : (
                <>
                  <Upload size={24} style={{ color: '#F4A5AE' }} />
                  <span className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.72 }}>
                    Upload JPG, PNG, or WebP
                  </span>
                  <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.45 }}>
                    5 MB max
                  </span>
                </>
              )}
            </label>
            <input id="gallery-image" type="file" accept={GALLERY_IMAGE_ACCEPT} onChange={handleFileChange} className="hidden" />
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CalendarInput id="gallery-title" label="Title" value={values.title} onChange={(value) => updateValue('title', value)} required />
              <CalendarInput id="gallery-alt" label="Alt text" value={values.alt_text} onChange={(value) => updateValue('alt_text', value)} placeholder="Describe the image for screen readers" />
            </div>

            <CalendarTextarea id="gallery-description" label="Description" value={values.description} onChange={(value) => updateValue('description', value)} rows={3} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gallery-category" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                  Category
                </label>
                <select
                  id="gallery-category"
                  value={values.category}
                  onChange={(event) => updateValue('category', event.target.value as GalleryCategory)}
                  className="w-full font-sans text-sm px-3 py-3 outline-none"
                  style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{galleryLabel(category)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gallery-location" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                  Display location
                </label>
                <select
                  id="gallery-location"
                  value={values.display_location}
                  onChange={(event) => updateValue('display_location', event.target.value as GalleryDisplayLocation)}
                  className="w-full font-sans text-sm px-3 py-3 outline-none"
                  style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
                >
                  {GALLERY_DISPLAY_LOCATIONS.map((location) => (
                    <option key={location} value={location}>{galleryLabel(location)}</option>
                  ))}
                </select>
              </div>

              <CalendarInput id="gallery-order" label="Display order" value={values.display_order} onChange={(value) => updateValue('display_order', value)} type="number" />
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
                <input type="checkbox" checked={values.is_active} onChange={(event) => updateValue('is_active', event.target.checked)} />
                Active
              </label>
              <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
                <input type="checkbox" checked={values.is_featured} onChange={(event) => updateValue('is_featured', event.target.checked)} />
                Featured
              </label>
            </div>

            {formError && <StatusMessage tone="error">{formError}</StatusMessage>}
            {notice && <StatusMessage tone="success">{notice}</StatusMessage>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="font-sans text-xs uppercase px-5 py-3 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
                style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                Upload item
              </button>
            </div>
          </div>
        </form>
      </section>

      {items.length === 0 ? (
        <EmptyState>No gallery items yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '4 / 3', backgroundColor: '#0A0A0A' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.alt_text || item.title || 'Gallery item'} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                ) : (
                  <div className="h-full flex items-center justify-center" style={{ color: '#E8DDD4', opacity: 0.35 }}>
                    <ImageIcon size={28} />
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-sans text-xs uppercase px-2.5 py-1" style={{ color: item.is_active ? '#6B8F71' : '#C4A265', border: `1px solid ${item.is_active ? '#6B8F71' : '#C4A265'}`, borderRadius: 4, letterSpacing: '0.08em' }}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {item.is_featured && (
                    <span className="font-sans text-xs uppercase px-2.5 py-1" style={{ color: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 4, letterSpacing: '0.08em' }}>
                      Featured
                    </span>
                  )}
                  <span className="font-sans text-xs uppercase px-2.5 py-1" style={{ color: '#C4A265', border: '1px solid #C4A265', borderRadius: 4, letterSpacing: '0.08em' }}>
                    {galleryItemSourceLabel(item)}
                  </span>
                </div>
                <h3 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>{item.title || 'Untitled'}</h3>
                <p className="font-sans text-xs uppercase mt-2" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
                  {galleryLabel(item.category)} / {galleryLabel(item.display_location)}
                </p>
                {item.description && (
                  <p className="font-sans text-sm mt-3" style={{ color: '#E8DDD4', opacity: 0.68, lineHeight: 1.55 }}>{item.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center gap-2 transition-all duration-300"
                    style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  {item.is_active && (
                    <button
                      type="button"
                      onClick={() => void handleArchive(item)}
                      disabled={saving}
                      className="font-sans text-xs uppercase px-3 py-2 transition-all duration-300 disabled:opacity-60"
                      style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingItem && (
        <GalleryEditDialog
          item={editingItem}
          values={editValues}
          transform={editTransform}
          saving={saving}
          error={editError}
          notice={editNotice}
          onValueChange={updateEditValue}
          onTransformChange={updateEditTransform}
          onResetTransform={() => setEditTransform(defaultGalleryImageTransformValues)}
          onSubmit={handleEditSubmit}
          onArchive={() => void handleArchive(editingItem)}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
}

function GalleryEditDialog({
  item,
  values,
  transform,
  saving,
  error,
  notice,
  onValueChange,
  onTransformChange,
  onResetTransform,
  onSubmit,
  onArchive,
  onClose,
}: {
  item: GalleryItem;
  values: GalleryFormValues;
  transform: GalleryImageTransformValues;
  saving: boolean;
  error: string;
  notice: string;
  onValueChange: (key: keyof GalleryFormValues, value: string | boolean) => void;
  onTransformChange: (key: keyof GalleryImageTransformValues, value: number) => void;
  onResetTransform: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onArchive: () => void;
  onClose: () => void;
}) {
  const previewTransform = `translate(${transform.offsetX}%, ${transform.offsetY}%) rotate(${transform.rotate}deg) scale(${transform.zoom})`;
  const hasImage = Boolean(item.image_url);
  const [dragState, setDragState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    width: number;
    height: number;
  } | null>(null);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true" aria-labelledby="gallery-edit-title">
      <button
        type="button"
        aria-label="Close gallery editor"
        className="absolute inset-0"
        onClick={saving ? undefined : onClose}
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.86)', border: 'none', cursor: saving ? 'wait' : 'pointer' }}
      />

      <section
        className="relative w-full max-w-[1120px] max-h-[92vh] overflow-y-auto"
        style={{ border: '1px solid #2A2A2A', borderRadius: 8, backgroundColor: '#111111', color: '#E8DDD4', boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 md:px-6 py-4" style={{ backgroundColor: 'rgba(17, 17, 17, 0.96)', borderBottom: '1px solid #1A1A1A', backdropFilter: 'blur(10px)' }}>
          <div className="min-w-0">
            <p className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
              Gallery Manager
            </p>
            <h2 id="gallery-edit-title" className="font-serif text-2xl mt-1 truncate" style={{ fontWeight: 600 }}>
              Edit {item.title || 'Gallery Item'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close gallery editor"
            className="flex items-center justify-center shrink-0 transition-all duration-300 disabled:opacity-50"
            style={{ width: 42, height: 42, color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6, cursor: saving ? 'wait' : 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] gap-6 p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#0A0A0A', padding: 14 }}>
              <div
                className="relative overflow-hidden"
                onPointerDown={(event) => {
                  if (!hasImage || saving) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragState({
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                    startOffsetX: transform.offsetX,
                    startOffsetY: transform.offsetY,
                    width: rect.width || 1,
                    height: rect.height || 1,
                  });
                }}
                onPointerMove={(event) => {
                  if (!dragState || dragState.pointerId !== event.pointerId) return;
                  const nextOffsetX = clampNumber(dragState.startOffsetX + ((event.clientX - dragState.startX) / dragState.width) * 100, -50, 50);
                  const nextOffsetY = clampNumber(dragState.startOffsetY + ((event.clientY - dragState.startY) / dragState.height) * 100, -50, 50);
                  onTransformChange('offsetX', Math.round(nextOffsetX));
                  onTransformChange('offsetY', Math.round(nextOffsetY));
                }}
                onPointerUp={(event) => {
                  if (dragState?.pointerId === event.pointerId) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    setDragState(null);
                  }
                }}
                onPointerCancel={() => setDragState(null)}
                style={{
                  aspectRatio: '4 / 3',
                  borderRadius: 6,
                  backgroundColor: '#050505',
                  cursor: hasImage && !saving ? (dragState ? 'grabbing' : 'grab') : 'default',
                  touchAction: 'none',
                }}
              >
                {hasImage ? (
                  <img
                    src={item.image_url || ''}
                    alt={values.alt_text || values.title || item.title || 'Gallery item preview'}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                    style={{ transform: previewTransform, transformOrigin: 'center', transition: dragState ? 'none' : 'transform 180ms ease', pointerEvents: 'none' }}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center" style={{ color: '#E8DDD4', opacity: 0.35 }}>
                    <ImageIcon size={30} />
                  </div>
                )}
                {hasImage && (
                  <div
                    className="absolute left-3 bottom-3 font-sans text-[10px] uppercase px-2.5 py-1"
                    style={{ color: '#E8DDD4', backgroundColor: 'rgba(10,10,10,0.72)', border: '1px solid rgba(232,221,212,0.18)', borderRadius: 4, letterSpacing: '0.08em', pointerEvents: 'none' }}
                  >
                    Drag image to move
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-4">
                <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.58, lineHeight: 1.45 }}>
                  The full image is shown first. Drag the image to reposition it, then use zoom or rotate only if you want to create a new edited copy.
                </p>
                <GalleryRangeControl
                  icon={<ZoomIn size={14} />}
                  label="Zoom"
                  value={transform.zoom}
                  min={1}
                  max={3}
                  step={0.05}
                  disabled={!hasImage || saving}
                  displayValue={`${Math.round(transform.zoom * 100)}%`}
                  onChange={(value) => onTransformChange('zoom', value)}
                />
                <GalleryRangeControl
                  icon={<Crop size={14} />}
                  label="Crop X"
                  value={transform.offsetX}
                  min={-50}
                  max={50}
                  step={1}
                  disabled={!hasImage || saving}
                  displayValue={`${transform.offsetX}%`}
                  onChange={(value) => onTransformChange('offsetX', value)}
                />
                <GalleryRangeControl
                  icon={<Crop size={14} />}
                  label="Crop Y"
                  value={transform.offsetY}
                  min={-50}
                  max={50}
                  step={1}
                  disabled={!hasImage || saving}
                  displayValue={`${transform.offsetY}%`}
                  onChange={(value) => onTransformChange('offsetY', value)}
                />
                <GalleryRangeControl
                  icon={<RotateCw size={14} />}
                  label="Rotate"
                  value={transform.rotate}
                  min={-180}
                  max={180}
                  step={1}
                  disabled={!hasImage || saving}
                  displayValue={`${transform.rotate} deg`}
                  onChange={(value) => onTransformChange('rotate', value)}
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onTransformChange('rotate', clampNumber(transform.rotate - 90, -180, 180))}
                    disabled={!hasImage || saving}
                    className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                    style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: !hasImage || saving ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}
                  >
                    <RotateCcw size={13} />
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => onTransformChange('rotate', clampNumber(transform.rotate + 90, -180, 180))}
                    disabled={!hasImage || saving}
                    className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                    style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: !hasImage || saving ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}
                  >
                    <RotateCw size={13} />
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={onResetTransform}
                    disabled={!hasImage || saving}
                    className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                    style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: !hasImage || saving ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 content-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CalendarInput id="gallery-edit-title-input" label="Title" value={values.title} onChange={(value) => onValueChange('title', value)} required />
              <CalendarInput id="gallery-edit-alt" label="Alt text" value={values.alt_text} onChange={(value) => onValueChange('alt_text', value)} placeholder="Describe the image for screen readers" />
            </div>

            <CalendarTextarea id="gallery-edit-description" label="Description" value={values.description} onChange={(value) => onValueChange('description', value)} rows={4} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gallery-edit-category" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                  Category
                </label>
                <select
                  id="gallery-edit-category"
                  value={values.category}
                  onChange={(event) => onValueChange('category', event.target.value as GalleryCategory)}
                  className="w-full font-sans text-sm px-3 py-3 outline-none"
                  style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{galleryLabel(category)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gallery-edit-location" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                  Display location
                </label>
                <select
                  id="gallery-edit-location"
                  value={values.display_location}
                  onChange={(event) => onValueChange('display_location', event.target.value as GalleryDisplayLocation)}
                  className="w-full font-sans text-sm px-3 py-3 outline-none"
                  style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
                >
                  {GALLERY_DISPLAY_LOCATIONS.map((location) => (
                    <option key={location} value={location}>{galleryLabel(location)}</option>
                  ))}
                </select>
              </div>

              <CalendarInput id="gallery-edit-order" label="Display order" value={values.display_order} onChange={(value) => onValueChange('display_order', value)} type="number" />
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
                <input type="checkbox" checked={values.is_active} onChange={(event) => onValueChange('is_active', event.target.checked)} />
                Active
              </label>
              <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
                <input type="checkbox" checked={values.is_featured} onChange={(event) => onValueChange('is_featured', event.target.checked)} />
                Featured
              </label>
            </div>

            {error && <StatusMessage tone="error">{error}</StatusMessage>}
            {notice && <StatusMessage tone="success">{notice}</StatusMessage>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid #1A1A1A' }}>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="font-sans text-xs uppercase px-5 py-3 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
                  style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
                >
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {saving ? 'Saving' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="font-sans text-xs uppercase px-5 py-3 transition-all duration-300 disabled:opacity-50"
                  style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={onArchive}
                disabled={saving || item.is_active !== true}
                className="font-sans text-xs uppercase px-5 py-3 transition-all duration-300 disabled:opacity-50"
                style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #D14A6E', borderRadius: 6, cursor: saving || item.is_active !== true ? 'not-allowed' : 'pointer', letterSpacing: '0.1em' }}
              >
                Archive
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function GalleryRangeControl({
  icon,
  label,
  value,
  min,
  max,
  step,
  disabled,
  displayValue,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-sans text-xs uppercase flex items-center justify-between gap-3" style={{ color: '#E8DDD4', opacity: 0.72, letterSpacing: '0.1em' }}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span style={{ color: '#F4A5AE', opacity: 1, letterSpacing: 0 }}>{displayValue}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}

function SiteContentManagerSection({
  items,
  loading,
  error,
  onCreate,
  onUpdate,
}: {
  items: SiteContentItem[];
  loading: boolean;
  error: string;
  onCreate: (input: SiteContentInput) => Promise<void>;
  onUpdate: (id: number | string, input: SiteContentUpdate) => Promise<void>;
}) {
  const [values, setValues] = useState<SiteContentFormValues>(emptySiteContentFormValues);
  const [editingItem, setEditingItem] = useState<SiteContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | SiteContentDisplayLocation>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SiteContentType>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (locationFilter !== 'all' && item.display_location !== locationFilter) return false;
      if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
      if (activeFilter === 'active' && item.is_active !== true) return false;
      if (activeFilter === 'inactive' && item.is_active === true) return false;
      if (featuredFilter === 'featured' && item.is_featured !== true) return false;
      if (!query) return true;

      return [item.content_key, item.title, item.subtitle, item.body, item.section]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [activeFilter, featuredFilter, items, locationFilter, search, typeFilter]);

  const updateValue = (key: keyof SiteContentFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setValues(emptySiteContentFormValues);
    setEditingItem(null);
    setFormError('');
    setShowAdvanced(false);
  };

  const handleEdit = (item: SiteContentItem) => {
    setEditingItem(item);
    setValues(siteContentFormFromItem(item));
    setFormError('');
    setNotice('');
    setShowAdvanced(false);
  };

  const applyTemplate = (template: (typeof ownerContentTemplates)[number]) => {
    setEditingItem(null);
    setValues((current) => ({
      ...emptySiteContentFormValues,
      title: current.title,
      body: current.body,
      subtitle: current.subtitle,
      button_label: current.button_label,
      button_url: current.button_url,
      display_location: template.display_location,
      content_type: template.content_type,
      is_featured: template.is_featured,
      section: template.section,
    }));
    setFormError('');
    setNotice('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!values.title.trim() && !values.body.trim()) {
      setFormError('Please add a headline or message so this update has something to show.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, siteContentUpdateFromForm(values));
        setNotice('Site content updated.');
      } else {
        await onCreate(siteContentInputFromForm(values));
        setNotice('Site content created.');
      }
      resetForm();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Site content could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (item: SiteContentItem) => {
    setFormError('');
    setNotice('');
    setSaving(true);
    try {
      await onUpdate(item.id, { is_active: false });
      setNotice('Site content archived.');
      if (editingItem?.id === item.id) resetForm();
    } catch (archiveError) {
      setFormError(archiveError instanceof Error ? archiveError.message : 'Site content could not be archived.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <InlineLoading label="Loading site content" />;

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorPanel message={error} />}

      <section style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-2xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
              {editingItem ? 'Edit Update' : 'Post an Update'}
            </h2>
            <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.62, lineHeight: 1.55 }}>
              Pick where it should show, write the update, and publish. The technical details are handled for you.
            </p>
          </div>
          {editingItem && (
            <button
              type="button"
              onClick={resetForm}
              className="font-sans text-xs uppercase px-4 py-2.5 transition-all duration-300"
              style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              New content
            </button>
          )}
        </div>

        {!editingItem && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
            {ownerContentTemplates.map((template) => {
              const selected = values.display_location === template.display_location && values.content_type === template.content_type;
              return (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="text-left transition-all duration-300"
                  style={{
                    color: '#E8DDD4',
                    backgroundColor: selected ? 'rgba(244, 165, 174, 0.12)' : '#0A0A0A',
                    border: selected ? '1px solid rgba(244, 165, 174, 0.45)' : '1px solid #2A2A2A',
                    borderRadius: 8,
                    cursor: 'pointer',
                    padding: 14,
                  }}
                >
                  <span className="font-serif text-base block" style={{ color: selected ? '#F4A5AE' : '#E8DDD4', fontWeight: 600 }}>
                    {template.label}
                  </span>
                  <span className="font-sans text-xs block mt-2" style={{ color: '#E8DDD4', opacity: 0.58, lineHeight: 1.45 }}>
                    {template.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="content-location" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                Where should this show?
              </label>
              <select
                id="content-location"
                value={values.display_location}
                onChange={(event) => updateValue('display_location', event.target.value as SiteContentDisplayLocation)}
                className="w-full font-sans text-sm px-3 py-3 outline-none"
                style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
              >
                {SITE_CONTENT_DISPLAY_LOCATIONS.filter((location) => location !== 'general').map((location) => (
                  <option key={location} value={location}>{siteContentLabel(location)}</option>
                ))}
              </select>
            </div>
            <CalendarInput id="content-title" label="Headline" value={values.title} onChange={(value) => updateValue('title', value)} placeholder="What should visitors know?" />
          </div>

          <CalendarTextarea id="content-body" label="Message" value={values.body} onChange={(value) => updateValue('body', value)} rows={4} placeholder="Write the update in plain language." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput id="content-button-label" label="Button text (optional)" value={values.button_label} onChange={(value) => updateValue('button_label', value)} placeholder="Book now, Shop now, Learn more" />
            <CalendarInput id="content-button-url" label="Button link (optional)" value={values.button_url} onChange={(value) => updateValue('button_url', value)} placeholder="/events or https://..." />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
              <input type="checkbox" checked={values.is_active} onChange={(event) => updateValue('is_active', event.target.checked)} />
              Publish now
            </label>
            <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
              <input type="checkbox" checked={values.is_featured} onChange={(event) => updateValue('is_featured', event.target.checked)} />
              Feature this update
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            className="font-sans text-xs uppercase justify-self-start px-3 py-2 transition-all duration-300"
            style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
          </button>

          {showAdvanced && (
            <div className="grid gap-4" style={{ border: '1px solid #2A2A2A', borderRadius: 8, backgroundColor: '#0A0A0A', padding: 16 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CalendarInput id="content-key" label="Internal key" value={values.content_key} onChange={(value) => updateValue('content_key', value)} placeholder="Auto-generated if blank" />
                <CalendarInput id="content-section" label="Internal section" value={values.section} onChange={(value) => updateValue('section', value)} placeholder="Optional" />
                <CalendarInput id="content-order" label="Display order" value={values.display_order} onChange={(value) => updateValue('display_order', value)} type="number" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CalendarInput id="content-subtitle" label="Subtitle" value={values.subtitle} onChange={(value) => updateValue('subtitle', value)} />
                <CalendarInput id="content-image-url" label="Image URL" value={values.image_url} onChange={(value) => updateValue('image_url', value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                  <label htmlFor="content-type" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
                    Content style
                  </label>
                  <select
                    id="content-type"
                    value={values.content_type}
                    onChange={(event) => updateValue('content_type', event.target.value as SiteContentType)}
                    className="w-full font-sans text-sm px-3 py-3 outline-none"
                    style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
                  >
                    {SITE_CONTENT_TYPES.map((contentType) => (
                      <option key={contentType} value={contentType}>{siteContentLabel(contentType)}</option>
                    ))}
                  </select>
                </div>

                <CalendarInput id="content-image-path" label="Image path" value={values.image_path} onChange={(value) => updateValue('image_path', value)} />
                <CalendarInput id="content-starts-at" label="Starts at" value={values.starts_at} onChange={(value) => updateValue('starts_at', value)} type="datetime-local" />
                <CalendarInput id="content-ends-at" label="Ends at" value={values.ends_at} onChange={(value) => updateValue('ends_at', value)} type="datetime-local" />
              </div>
            </div>
          )}

          {(values.title || values.subtitle || values.body) && (
            <article style={{ border: '1px solid #2A2A2A', borderRadius: 8, backgroundColor: '#0A0A0A', padding: 16 }}>
              <p className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
                Preview
              </p>
              {values.title && <h3 className="font-serif text-xl mt-2" style={{ color: '#E8DDD4', fontWeight: 600 }}>{values.title}</h3>}
              {values.subtitle && <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.68 }}>{values.subtitle}</p>}
              {values.body && <p className="font-sans text-sm mt-3 whitespace-pre-wrap" style={{ color: '#E8DDD4', opacity: 0.72, lineHeight: 1.6 }}>{values.body}</p>}
            </article>
          )}

          {formError && <StatusMessage tone="error">{formError}</StatusMessage>}
          {notice && <StatusMessage tone="success">{notice}</StatusMessage>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="font-sans text-xs uppercase px-5 py-3 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
              style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {editingItem ? 'Save update' : 'Publish update'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => void handleArchive(editingItem)}
                disabled={saving}
                className="font-sans text-xs uppercase px-5 py-3 transition-all duration-300 disabled:opacity-60"
                style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
              >
                Archive
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 16 }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_repeat(4,minmax(140px,180px))] gap-3">
            <CalendarInput id="content-search" label="Search" value={search} onChange={setSearch} placeholder="Title or key" />
            <FilterSelect id="content-location-filter" label="Location" value={locationFilter} onChange={(value) => setLocationFilter(value as 'all' | SiteContentDisplayLocation)} options={[{ value: 'all', label: 'All' }, ...SITE_CONTENT_DISPLAY_LOCATIONS.map((location) => ({ value: location, label: siteContentLabel(location) }))]} />
            <FilterSelect id="content-type-filter" label="Type" value={typeFilter} onChange={(value) => setTypeFilter(value as 'all' | SiteContentType)} options={[{ value: 'all', label: 'All' }, ...SITE_CONTENT_TYPES.map((contentType) => ({ value: contentType, label: siteContentLabel(contentType) }))]} />
            <FilterSelect id="content-active-filter" label="Status" value={activeFilter} onChange={(value) => setActiveFilter(value as 'all' | 'active' | 'inactive')} options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            <FilterSelect id="content-featured-filter" label="Featured" value={featuredFilter} onChange={(value) => setFeaturedFilter(value as 'all' | 'featured')} options={[{ value: 'all', label: 'All' }, { value: 'featured', label: 'Featured' }]} />
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState>No site content yet.</EmptyState>
        ) : filteredItems.length === 0 ? (
          <EmptyState>No site content matches these filters.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <article key={item.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-sans text-xs uppercase px-2.5 py-1" style={{ color: item.is_active ? '#6B8F71' : '#C4A265', border: `1px solid ${item.is_active ? '#6B8F71' : '#C4A265'}`, borderRadius: 4, letterSpacing: '0.08em' }}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {item.is_featured && (
                    <span className="font-sans text-xs uppercase px-2.5 py-1" style={{ color: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 4, letterSpacing: '0.08em' }}>
                      Featured
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
                  {siteContentLabel(item.content_type)} / {siteContentLabel(item.display_location)}
                </p>
                <h3 className="font-serif text-xl mt-2" style={{ color: '#E8DDD4', fontWeight: 600 }}>{item.title || item.content_key || 'Untitled content'}</h3>
                {item.subtitle && <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.68 }}>{item.subtitle}</p>}
                {item.body && <p className="font-sans text-sm mt-3 line-clamp-3 whitespace-pre-wrap" style={{ color: '#E8DDD4', opacity: 0.72, lineHeight: 1.6 }}>{item.body}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.58 }}>
                  <p>Shows on: {siteContentLabel(item.display_location)}</p>
                  <p>Style: {siteContentLabel(item.content_type)}</p>
                  <p>Starts: {item.starts_at ? formatDate(item.starts_at) : 'Immediately'}</p>
                  <p>Ends: {item.ends_at ? formatDate(item.ends_at) : 'No end date'}</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center gap-2 transition-all duration-300"
                    style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  {item.is_active && (
                    <button
                      type="button"
                      onClick={() => void handleArchive(item)}
                      disabled={saving}
                      className="font-sans text-xs uppercase px-3 py-2 transition-all duration-300 disabled:opacity-60"
                      style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full font-sans text-sm px-3 py-3 outline-none"
        style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function CalendarInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full font-sans text-sm px-3 py-3 outline-none disabled:opacity-50"
        style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
      />
    </div>
  );
}

function CalendarTextarea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full font-sans text-sm px-3 py-3 resize-y outline-none"
        style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6, lineHeight: 1.55 }}
      />
    </div>
  );
}

function CalendarOptionalSection({
  id,
  title,
  helper,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  helper?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section style={{ borderTop: '1px solid #1A1A1A', paddingTop: 14 }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-start justify-between gap-4 text-left"
        style={{ color: '#E8DDD4', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        aria-expanded={open}
      >
        <span>
          <span className="font-serif text-base" style={{ fontWeight: 600 }}>{title}</span>
          {helper && (
            <span className="font-sans text-xs block mt-1" style={{ color: '#E8DDD4', opacity: 0.52, lineHeight: 1.45 }}>
              {helper}
            </span>
          )}
        </span>
        <span className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          {open ? 'Hide' : 'Show'}
        </span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function CalendarEventForm({
  title,
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
}: {
  title: string;
  initialValues: CalendarEventFormValues;
  onSubmit: (values: CalendarEventFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [multiDay, setMultiDay] = useState(Boolean(initialValues.end_date));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    moreDetails: false,
    clientInfo: false,
    linkedInquiry: false,
    internalNotes: false,
    publicSettings: publicEventTypeValues.has(initialValues.event_type),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setValues(initialValues);
    setMultiDay(Boolean(initialValues.end_date));
    setExpanded({
      moreDetails: false,
      clientInfo: false,
      linkedInquiry: false,
      internalNotes: false,
      publicSettings: publicEventTypeValues.has(initialValues.event_type),
    });
    setSaveError('');
  }, [initialValues]);

  const publicFriendlyType = publicEventTypeValues.has(values.event_type);
  const appointmentLike = values.event_type === 'tattoo_appointment' || values.event_type === 'commission_work';
  const publicEvent = publicFriendlyType;
  const blockedTime = values.event_type === 'blocked_time';
  const showClientQuickFields = appointmentLike;
  const showInternalNotesQuickField = appointmentLike || blockedTime;
  const showPublicEventDetails = publicEvent;
  const showClientSection = !publicEvent && !blockedTime;
  const linkedInquiryLabel = values.inquiry_type && values.inquiry_id ? `${statusLabel(values.inquiry_type)} #${values.inquiry_id}` : '';

  const updateValue = (key: keyof CalendarEventFormValues, value: string | boolean) => {
    if (key === 'event_type' && typeof value === 'string') {
      setExpanded((current) => ({ ...current, publicSettings: publicEventTypeValues.has(value) }));
    }

    setValues((current) => {
      if (key === 'event_type' && typeof value === 'string') {
        const nextPublicFriendly = publicEventTypeValues.has(value);
        const wasPublicFriendly = publicEventTypeValues.has(current.event_type);
        return {
          ...current,
          event_type: value,
          is_public: nextPublicFriendly ? (wasPublicFriendly ? current.is_public : true) : false,
          blocks_booking: defaultBlocksBookingForEventType(value),
        };
      }

      if (key === 'is_public') {
        return {
          ...current,
          is_public: publicEventTypeValues.has(current.event_type) ? Boolean(value) : false,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const toggleSection = (id: string) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleMultiDayChange = (checked: boolean) => {
    setMultiDay(checked);
    if (!checked) updateValue('end_date', '');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');

    try {
      await onSubmit(values);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save this event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm('Delete this calendar event?')) return;

    setDeleting(true);
    setSaveError('');

    try {
      await onDelete();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not delete this event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 mx-auto"
      style={{ maxWidth: 900, border: '1px solid #2A2A2A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
            Calendar
          </p>
          <h2 className="font-serif text-xl mt-2" style={{ color: '#E8DDD4', fontWeight: 600 }}>
            {title}
          </h2>
          {linkedInquiryLabel && (
            <p className="font-sans text-xs mt-2" style={{ color: '#C4A265' }}>
              Linked to {linkedInquiryLabel}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center"
          aria-label="Cancel calendar event form"
          style={{ width: 34, height: 34, color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarInput
          id="calendar-title"
          label="Title"
          value={values.title}
          onChange={(value) => updateValue('title', value)}
          required
          placeholder="Tattoo appointment, poetry night, shop drop..."
        />

        <div>
          <label htmlFor="calendar-event-type" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
            Event type *
          </label>
          <select
            id="calendar-event-type"
            value={values.event_type}
            onChange={(event) => updateValue('event_type', event.target.value)}
            className="w-full font-sans text-sm px-3 py-3 outline-none"
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
          >
            {calendarEventTypes.map((eventType) => (
              <option key={eventType.value} value={eventType.value}>
                {eventType.label}
              </option>
            ))}
          </select>
        </div>

        <CalendarInput
          id="calendar-start-date"
          label="Start date"
          value={values.start_date}
          onChange={(value) => updateValue('start_date', value)}
          type="date"
          required
        />

        <div>
          <label htmlFor="calendar-status" className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.1em' }}>
            Status
          </label>
          <select
            id="calendar-status"
            value={values.status}
            onChange={(event) => updateValue('status', event.target.value)}
            className="w-full font-sans text-sm px-3 py-3 outline-none"
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
          >
            {calendarStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <CalendarInput
          id="calendar-start-time"
          label="Start time"
          value={values.start_time}
          onChange={(value) => updateValue('start_time', value)}
          type="time"
          disabled={values.all_day}
          required={!values.all_day}
        />

        <CalendarInput
          id="calendar-end-time"
          label="End time"
          value={values.end_time}
          onChange={(value) => updateValue('end_time', value)}
          type="time"
          disabled={values.all_day}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
          <input
            type="checkbox"
            checked={values.all_day}
            onChange={(event) => updateValue('all_day', event.target.checked)}
          />
          All day
        </label>
        <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
          <input
            type="checkbox"
            checked={multiDay}
            onChange={(event) => handleMultiDayChange(event.target.checked)}
          />
          Multi-day event
        </label>
        <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
          <input
            type="checkbox"
            checked={values.blocks_booking}
            onChange={(event) => updateValue('blocks_booking', event.target.checked)}
          />
          Block booking during this event?
        </label>
      </div>

      <p className="font-sans text-xs mt-2" style={{ color: '#E8DDD4', opacity: 0.52, lineHeight: 1.5 }}>
        Use this when the event makes the artist unavailable for tattoo bookings.
      </p>

      {multiDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CalendarInput
            id="calendar-end-date"
            label="End date"
            value={values.end_date}
            onChange={(value) => updateValue('end_date', value)}
            type="date"
          />
        </div>
      )}

      {showClientQuickFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <CalendarInput
            id="calendar-client-name"
            label="Client name"
            value={values.client_name}
            onChange={(value) => updateValue('client_name', value)}
          />
          <CalendarInput
            id="calendar-client-phone"
            label="Client phone"
            value={values.client_phone}
            onChange={(value) => updateValue('client_phone', value)}
          />
        </div>
      )}

      {showPublicEventDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <CalendarInput
            id="calendar-location"
            label="Location"
            value={values.location}
            onChange={(value) => updateValue('location', value)}
          />
          <CalendarInput
            id="calendar-external-link"
            label="Event Link"
            value={values.external_link}
            onChange={(value) => updateValue('external_link', value)}
            type="url"
          />
          <div className="md:col-span-2">
            <CalendarTextarea
              id="calendar-description"
              label="Description"
              value={values.description}
              onChange={(value) => updateValue('description', value)}
              rows={3}
            />
          </div>
        </div>
      )}

      {showInternalNotesQuickField && (
        <div className="mt-5">
          <CalendarTextarea
            id="calendar-notes"
            label="Internal Notes"
            value={values.notes}
            onChange={(value) => updateValue('notes', value)}
            rows={3}
            placeholder="Private notes for the admin team..."
          />
        </div>
      )}

      <div className="space-y-4 mt-6">
        <CalendarOptionalSection
          id="moreDetails"
          title="More Details"
          helper="Add a location, event link, or description when it matters."
          open={Boolean(expanded.moreDetails)}
          onToggle={toggleSection}
        >
          {showPublicEventDetails ? (
            <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.62 }}>
              Public event details are already shown above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CalendarInput
                id="calendar-location"
                label="Location"
                value={values.location}
                onChange={(value) => updateValue('location', value)}
              />
              <CalendarInput
                id="calendar-external-link"
                label="Event Link"
                value={values.external_link}
                onChange={(value) => updateValue('external_link', value)}
                type="url"
              />
              <div className="md:col-span-2">
                <CalendarTextarea
                  id="calendar-description"
                  label="Description"
                  value={values.description}
                  onChange={(value) => updateValue('description', value)}
                />
              </div>
            </div>
          )}
        </CalendarOptionalSection>

        {showClientSection && (
          <CalendarOptionalSection
            id="clientInfo"
            title="Client Info"
            helper={appointmentLike ? 'Email is optional; name and phone are above for quick scheduling.' : 'Use only for private internal events.'}
            open={Boolean(expanded.clientInfo)}
            onToggle={toggleSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!appointmentLike && (
                <>
                  <CalendarInput
                    id="calendar-client-name"
                    label="Client name"
                    value={values.client_name}
                    onChange={(value) => updateValue('client_name', value)}
                  />
                  <CalendarInput
                    id="calendar-client-phone"
                    label="Client phone"
                    value={values.client_phone}
                    onChange={(value) => updateValue('client_phone', value)}
                  />
                </>
              )}
              <CalendarInput
                id="calendar-client-email"
                label="Client email"
                value={values.client_email}
                onChange={(value) => updateValue('client_email', value)}
                type="email"
              />
            </div>
          </CalendarOptionalSection>
        )}

        <CalendarOptionalSection
          id="linkedInquiry"
          title="Linked Inquiry"
          helper="Usually filled automatically when adding from a booking or commission card."
          open={Boolean(expanded.linkedInquiry)}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput
              id="calendar-inquiry-type"
              label="Linked Inquiry Type"
              value={values.inquiry_type}
              onChange={(value) => updateValue('inquiry_type', value)}
              placeholder="booking or commission"
            />
            <CalendarInput
              id="calendar-inquiry-id"
              label="Linked Inquiry ID"
              value={values.inquiry_id}
              onChange={(value) => updateValue('inquiry_id', value)}
            />
          </div>
        </CalendarOptionalSection>

        {!showInternalNotesQuickField && (
          <CalendarOptionalSection
            id="internalNotes"
            title="Internal Notes"
            helper="Private notes never appear on the public site."
            open={Boolean(expanded.internalNotes)}
            onToggle={toggleSection}
          >
            <CalendarTextarea
              id="calendar-notes"
              label="Internal Notes"
              value={values.notes}
              onChange={(value) => updateValue('notes', value)}
              rows={4}
            />
          </CalendarOptionalSection>
        )}

        {publicFriendlyType && (
          <CalendarOptionalSection
            id="publicSettings"
            title="Public Calendar"
            helper="Public events appear on the live Gaston Collective calendar. Private appointments stay hidden."
            open={Boolean(expanded.publicSettings)}
            onToggle={toggleSection}
          >
            <label className="font-sans text-sm flex items-center gap-2" style={{ color: '#E8DDD4' }}>
              <input
                type="checkbox"
                checked={values.is_public}
                onChange={(event) => updateValue('is_public', event.target.checked)}
              />
              Show on public calendar
            </label>
          </CalendarOptionalSection>
        )}
      </div>

      {!publicFriendlyType && (
        <p className="font-sans text-xs mt-5" style={{ color: '#E8DDD4', opacity: 0.58, lineHeight: 1.5 }}>
          Tattoo appointments, commission work, blocked time, and internal events stay private.
        </p>
      )}

      {values.sourceKind && (
        <label className="font-sans text-sm flex items-center gap-2 mt-5" style={{ color: '#E8DDD4' }}>
          <input
            type="checkbox"
            checked={Boolean(values.updateInquiryStatus)}
            onChange={(event) => updateValue('updateInquiryStatus', event.target.checked)}
          />
          Update inquiry status to scheduled after saving
        </label>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
        <div>{saveError && <StatusMessage tone="error">{saveError}</StatusMessage>}</div>
        <div className="flex flex-wrap items-center gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving || deleting}
              className="font-sans text-xs uppercase px-4 py-2.5 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
              style={{ color: '#D14A6E', backgroundColor: 'transparent', border: '1px solid #D14A6E', borderRadius: 6, cursor: deleting ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
            >
              {deleting ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
              {deleting ? 'Deleting' : 'Delete'}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-xs uppercase px-4 py-2.5 inline-flex items-center gap-2 transition-all duration-300"
            style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            <X size={14} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="font-sans text-xs uppercase px-4 py-2.5 inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.1em' }}
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
            {saving ? 'Saving' : 'Save Event'}
          </button>
        </div>
      </div>
    </form>
  );
}

function CalendarEventCard({ event, onEdit }: { event: CalendarEvent; onEdit: (event: CalendarEvent) => void }) {
  return (
    <article style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
              {eventTypeLabel(event.event_type)}
            </span>
            <StatusBadge status={event.status} />
            <span
              className="font-sans text-xs uppercase px-2.5 py-1"
              style={{ color: event.is_public ? '#6B8F71' : '#C4A265', border: `1px solid ${event.is_public ? '#6B8F71' : '#C4A265'}`, borderRadius: 4, letterSpacing: '0.08em' }}
            >
              {event.is_public ? 'Public' : 'Private'}
            </span>
            <span
              className="font-sans text-xs uppercase px-2.5 py-1"
              style={{ color: event.blocks_booking ? '#D14A6E' : '#E8DDD4', border: `1px solid ${event.blocks_booking ? '#D14A6E' : '#2A2A2A'}`, borderRadius: 4, letterSpacing: '0.08em' }}
            >
              {event.blocks_booking ? 'Blocks booking' : 'Booking open'}
            </span>
          </div>
          <h3 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
            {event.title}
          </h3>
          <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.72 }}>
            {formatEventDateTime(event)}
          </p>
          {event.location && (
            <p className="font-sans text-sm mt-1" style={{ color: '#E8DDD4', opacity: 0.58 }}>
              {event.location}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="font-sans text-xs uppercase px-3 py-2 inline-flex items-center justify-center gap-2 transition-all duration-300"
          style={{ color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          <Edit3 size={14} />
          Edit
        </button>
      </div>
    </article>
  );
}

function CalendarSection({
  events,
  loading,
  error,
  draft,
  onDraftConsumed,
  onCreate,
  onUpdate,
  onDelete,
}: {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  draft: CalendarEventFormValues | null;
  onDraftConsumed: () => void;
  onCreate: (values: CalendarEventFormValues) => Promise<void>;
  onUpdate: (id: number | string, values: CalendarEventFormValues) => Promise<void>;
  onDelete: (id: number | string) => Promise<void>;
}) {
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [viewDate, setViewDate] = useState(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<CalendarVisibilityFilter>('all');
  const [formValues, setFormValues] = useState<CalendarEventFormValues | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!draft) return;
    setFormValues(draft);
    setEditingEvent(null);
    setNotice('');
    onDraftConsumed();
  }, [draft, onDraftConsumed]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => eventTypeFilter === 'all' || event.event_type === eventTypeFilter)
      .filter((event) => statusFilter === 'all' || normalizeStatus(event.status) === statusFilter)
      .filter((event) => {
        if (visibilityFilter === 'all') return true;
        return visibilityFilter === 'public' ? Boolean(event.is_public) : !event.is_public;
      })
      .sort((left, right) => {
        const dateDiff = toTimestamp(`${left.start_date}T${left.start_time || '00:00:00'}`) - toTimestamp(`${right.start_date}T${right.start_time || '00:00:00'}`);
        return dateDiff || String(left.title).localeCompare(String(right.title));
      });
  }, [eventTypeFilter, events, statusFilter, visibilityFilter]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((grouped, event) => {
      grouped[event.start_date] = [...(grouped[event.start_date] ?? []), event];
      return grouped;
    }, {});
  }, [filteredEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const slots: (Date | null)[] = Array.from({ length: firstDay.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      slots.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    }
    return slots;
  }, [viewDate]);

  const openCreateForm = () => {
    setFormValues(newCalendarEventFormValues());
    setEditingEvent(null);
    setNotice('');
  };

  const openEditForm = (event: CalendarEvent) => {
    setFormValues(calendarEventToFormValues(event));
    setEditingEvent(event);
    setNotice('');
  };

  const closeForm = () => {
    setFormValues(null);
    setEditingEvent(null);
  };

  const handleSubmit = async (values: CalendarEventFormValues) => {
    if (editingEvent) {
      await onUpdate(editingEvent.id, values);
      setNotice('Calendar event saved.');
    } else {
      await onCreate(values);
      setNotice('Calendar event created.');
    }
    closeForm();
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    await onDelete(editingEvent.id);
    setNotice('Calendar event deleted.');
    closeForm();
  };

  if (loading) return <InlineLoading label="Loading calendar events" />;
  if (error) return <ErrorPanel message={error} />;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreateForm}
            className="font-sans text-xs uppercase px-4 py-2.5 inline-flex items-center gap-2 transition-all duration-300"
            style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            <Plus size={14} />
            Add Event
          </button>
          {notice && <StatusMessage tone="success">{notice}</StatusMessage>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className="font-sans text-xs uppercase px-3 py-2"
            style={{ color: viewMode === 'month' ? '#0A0A0A' : '#E8DDD4', backgroundColor: viewMode === 'month' ? '#C4A265' : 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.08em' }}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="font-sans text-xs uppercase px-3 py-2"
            style={{ color: viewMode === 'list' ? '#0A0A0A' : '#E8DDD4', backgroundColor: viewMode === 'list' ? '#C4A265' : 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.08em' }}
          >
            List
          </button>
        </div>
      </div>

      {formValues && (
        <CalendarEventForm
          title={editingEvent ? 'Edit Event' : 'Add Event'}
          initialValues={formValues}
          onSubmit={handleSubmit}
          onDelete={editingEvent ? handleDelete : undefined}
          onCancel={closeForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <select
          aria-label="Filter calendar events by event type"
          value={eventTypeFilter}
          onChange={(event) => setEventTypeFilter(event.target.value)}
          className="font-sans text-sm px-3 py-3 outline-none"
          style={{ color: '#E8DDD4', backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 6 }}
        >
          <option value="all">All event types</option>
          {calendarEventTypes.map((eventType) => (
            <option key={eventType.value} value={eventType.value}>
              {eventType.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter calendar events by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="font-sans text-sm px-3 py-3 outline-none"
          style={{ color: '#E8DDD4', backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 6 }}
        >
          <option value="all">All statuses</option>
          {calendarStatusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter calendar events by visibility"
          value={visibilityFilter}
          onChange={(event) => setVisibilityFilter(event.target.value as CalendarVisibilityFilter)}
          className="font-sans text-sm px-3 py-3 outline-none"
          style={{ color: '#E8DDD4', backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 6 }}
        >
          <option value="all">Public and private</option>
          <option value="public">Public only</option>
          <option value="private">Private only</option>
        </select>
      </div>

      {events.length === 0 ? (
        <EmptyState>No calendar events yet.</EmptyState>
      ) : filteredEvents.length === 0 ? (
        <EmptyState>No calendar events match these filters.</EmptyState>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <CalendarEventCard key={event.id} event={event} onEdit={openEditForm} />
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={() => setViewDate((current) => addMonths(current, -1))}
              aria-label="Previous month"
              className="inline-flex items-center justify-center"
              style={{ width: 36, height: 36, color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
              {formatMonthLabel(viewDate)}
            </h2>
            <button
              type="button"
              onClick={() => setViewDate((current) => addMonths(current, 1))}
              aria-label="Next month"
              className="inline-flex items-center justify-center"
              style={{ width: 36, height: 36, color: '#E8DDD4', backgroundColor: 'transparent', border: '1px solid #2A2A2A', borderRadius: 6, cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-sans text-[10px] uppercase text-center py-2" style={{ color: '#E8DDD4', opacity: 0.45, letterSpacing: '0.08em' }}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dateKey = day ? isoDateKey(day) : '';
              const dayEvents = dateKey ? eventsByDate[dateKey] ?? [] : [];

              return (
                <div
                  key={dateKey || `blank-${index}`}
                  className="min-h-[110px]"
                  style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: day ? '#141414' : 'transparent', padding: day ? 10 : 0 }}
                >
                  {day && (
                    <>
                      <p className="font-sans text-xs mb-2" style={{ color: '#E8DDD4', opacity: 0.62 }}>
                        {day.getDate()}
                      </p>
                      <div className="space-y-1.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => openEditForm(event)}
                            className="w-full text-left font-sans text-xs px-2 py-1.5"
                            style={{ color: '#E8DDD4', backgroundColor: event.is_public ? 'rgba(107, 143, 113, 0.18)' : 'rgba(244, 165, 174, 0.12)', border: '1px solid #2A2A2A', borderRadius: 5, cursor: 'pointer', lineHeight: 1.35 }}
                          >
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</span>
                            <span style={{ opacity: 0.62 }}>{formatTime(event.start_time) || eventTypeLabel(event.event_type)}</span>
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="font-sans text-[11px]" style={{ color: '#E8DDD4', opacity: 0.5 }}>
                            +{dayEvents.length - 3} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPortal({
  session,
  profile,
  onLogout,
  logoutLoading,
  logoutError,
}: {
  session: Session;
  profile: AdminProfile;
  onLogout: () => void;
  logoutLoading: boolean;
  logoutError: string;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  const [dashboardErrors, setDashboardErrors] = useState<DashboardErrors>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarError, setCalendarError] = useState('');
  const [calendarDraft, setCalendarDraft] = useState<CalendarEventFormValues | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryError, setGalleryError] = useState('');
  const [siteContentItems, setSiteContentItems] = useState<SiteContentItem[]>([]);
  const [siteContentError, setSiteContentError] = useState('');
  const [siteStatusSaving, setSiteStatusSaving] = useState(false);
  const [siteStatusMessage, setSiteStatusMessage] = useState('');
  const [siteStatusError, setSiteStatusError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const adminName = userDisplayName(session.user, profile);
  const adminEmail = userEmail(session.user, profile);
  const adminRole = roleLabel(profile);
  const underDevelopmentItem = siteContentItems.find((item) => item.content_key === UNDER_DEVELOPMENT_CONTENT_KEY);
  const underDevelopmentEnabled = underDevelopmentItem?.is_active === true;

  const loadDashboardData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
      setRefreshNotice('');
    } else {
      setDashboardLoading(true);
    }

    const [messagesResult, bookingsResult, commissionsResult, calendarResult, galleryResult, siteContentResult] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('booking_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('commission_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('start_date', { ascending: true }).order('start_time', { ascending: true }),
      getGalleryItems({ activeOnly: false }).then((data) => ({ data, error: null })).catch((error: Error) => ({ data: null, error })),
      getSiteContent({ activeOnly: false }).then((data) => ({ data, error: null })).catch((error: Error) => ({ data: null, error })),
    ]);

    const nextErrors: DashboardErrors = {};
    if (messagesResult.error) nextErrors.messages = `Unable to load messages: ${messagesResult.error.message}`;
    if (bookingsResult.error) nextErrors.bookings = `Unable to load tattoo bookings: ${bookingsResult.error.message}`;
    if (commissionsResult.error) nextErrors.commissions = `Unable to load commission requests: ${commissionsResult.error.message}`;
    setCalendarError(calendarResult.error ? `Unable to load calendar events: ${calendarResult.error.message}` : '');
    setGalleryError(galleryResult.error ? `Unable to load gallery items: ${galleryResult.error.message}` : '');
    setSiteContentError(siteContentResult.error ? `Unable to load site content: ${siteContentResult.error.message}` : '');

    setDashboardData((current) => ({
      messages: messagesResult.error ? current.messages : ((messagesResult.data ?? []) as ContactMessage[]),
      bookings: bookingsResult.error ? current.bookings : ((bookingsResult.data ?? []) as BookingInquiry[]),
      commissions: commissionsResult.error ? current.commissions : ((commissionsResult.data ?? []) as CommissionInquiry[]),
    }));
    if (!calendarResult.error) {
      setCalendarEvents((calendarResult.data ?? []) as CalendarEvent[]);
    }
    if (!galleryResult.error) {
      setGalleryItems(sortGalleryItems((galleryResult.data ?? []) as GalleryItem[]));
    }
    if (!siteContentResult.error) {
      setSiteContentItems(sortSiteContentItems((siteContentResult.data ?? []) as SiteContentItem[]));
    }
    setDashboardErrors(nextErrors);
    setDashboardLoading(false);
    setRefreshing(false);

    if (Object.keys(nextErrors).length === 0 && !calendarResult.error && !galleryResult.error && !siteContentResult.error) {
      setLastUpdated(new Date());
      setRefreshNotice(refresh ? 'Dashboard refreshed.' : '');
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const updateSubmission = useCallback(
    async (kind: SubmissionKind, id: number | string, input: { status: string; adminNotes: string }) => {
      const tableByKind: Record<SubmissionKind, string> = {
        messages: 'contact_messages',
        bookings: 'booking_inquiries',
        commissions: 'commission_inquiries',
      };

      const { data, error } = await supabase
        .from(tableByKind[kind])
        .update({
          status: input.status,
          admin_notes: input.adminNotes.trim() || null,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message || 'Could not save changes.');
      }

      if (!data) {
        throw new Error('Could not save changes for this submission.');
      }

      setDashboardData((current) => ({
        ...current,
        [kind]: current[kind].map((item) => (item.id === id ? data : item)),
      }) as DashboardData);
    },
    [],
  );

  const updateInquiryStatusToScheduled = useCallback(async (sourceKind: 'booking' | 'commission', sourceId: number | string) => {
    const table = sourceKind === 'booking' ? 'booking_inquiries' : 'commission_inquiries';
    const dataKey = sourceKind === 'booking' ? 'bookings' : 'commissions';

    const { data, error } = await supabase
      .from(table)
      .update({ status: 'scheduled' })
      .eq('id', sourceId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Calendar event saved, but the inquiry status could not be updated: ${error.message}`);
    }

    if (data) {
      setDashboardData((current) => ({
        ...current,
        [dataKey]: current[dataKey].map((item) => (item.id === sourceId ? data : item)),
      }) as DashboardData);
    }
  }, []);

  const createCalendarEvent = useCallback(
    async (values: CalendarEventFormValues) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(calendarPayloadFromForm(values))
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message || 'Could not create calendar event.');
      }

      if (!data) {
        throw new Error('Could not create calendar event.');
      }

      setCalendarEvents((current) => sortCalendarEvents([...(current ?? []), data as CalendarEvent]));

      if (values.updateInquiryStatus && values.sourceKind && values.sourceId !== undefined) {
        await updateInquiryStatusToScheduled(values.sourceKind, values.sourceId);
      }
    },
    [updateInquiryStatusToScheduled],
  );

  const updateCalendarEvent = useCallback(async (id: number | string, values: CalendarEventFormValues) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(calendarPayloadFromForm(values))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message || 'Could not update calendar event.');
    }

    if (!data) {
      throw new Error('Could not update calendar event.');
    }

    setCalendarEvents((current) => sortCalendarEvents(current.map((event) => (event.id === id ? (data as CalendarEvent) : event))));
  }, []);

  const deleteCalendarEvent = useCallback(async (id: number | string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Could not delete calendar event.');
    }

    setCalendarEvents((current) => current.filter((event) => event.id !== id));
  }, []);

  const openCalendarDraft = useCallback((values: CalendarEventFormValues) => {
    setCalendarDraft(values);
    setActiveTab('calendar');
    setMobileMenuOpen(false);
  }, []);

  const createGalleryEntry = useCallback(async (input: GalleryItemInput) => {
    const item = await createGalleryItem(input);
    setGalleryItems((current) => mergeGalleryItems(current, [item]));
  }, []);

  const updateGalleryEntry = useCallback(async (id: number | string, input: GalleryItemUpdate) => {
    const item = await updateGalleryItem(id, input);
    setGalleryItems((current) => mergeGalleryItems(current.filter((currentItem) => currentItem.id !== id), [item]));
  }, []);

  const importLegacyGalleryEntries = useCallback(async () => {
    const result = await importLegacyVelvetInkGalleryItems();
    if (result.created.length > 0) {
      setGalleryItems((current) => mergeGalleryItems(current, result.created));
    }
    return result;
  }, []);

  const createSiteContentEntry = useCallback(async (input: SiteContentInput) => {
    const item = await createSiteContent(input);
    setSiteContentItems((current) => mergeSiteContentItems(current, [item]));
  }, []);

  const updateSiteContentEntry = useCallback(async (id: number | string, input: SiteContentUpdate) => {
    const item = await updateSiteContent(id, input);
    setSiteContentItems((current) => mergeSiteContentItems(current.filter((currentItem) => currentItem.id !== id), [item]));
  }, []);

  const toggleUnderDevelopmentMode = useCallback(async () => {
    const nextEnabled = !underDevelopmentEnabled;
    setSiteStatusSaving(true);
    setSiteStatusMessage('');
    setSiteStatusError('');

    try {
      const item = await setUnderDevelopmentMode(nextEnabled);
      setSiteContentItems((current) => mergeSiteContentItems(current.filter((currentItem) => currentItem.id !== item.id), [item]));
      setSiteStatusMessage(
        nextEnabled
          ? 'Under development page is on. Public visitors will see the holding page.'
          : 'Website is live again. Public visitors can see the full site.',
      );
    } catch (statusError) {
      setSiteStatusError(statusError instanceof Error ? statusError.message : 'Site visibility could not be changed.');
    } finally {
      setSiteStatusSaving(false);
    }
  }, [underDevelopmentEnabled]);

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: <MessageSquareText size={16} />,
      count: dataCount(dashboardData),
    },
    {
      id: 'messages' as const,
      label: 'Messages',
      icon: <Mail size={16} />,
      count: dashboardData.messages.length,
    },
    {
      id: 'bookings' as const,
      label: 'Tattoo Bookings',
      icon: <Calendar size={16} />,
      count: dashboardData.bookings.length,
    },
    {
      id: 'commissions' as const,
      label: 'Commission Requests',
      icon: <Palette size={16} />,
      count: dashboardData.commissions.length,
    },
    {
      id: 'calendar' as const,
      label: 'Calendar',
      icon: <Calendar size={16} />,
      count: calendarEvents.length,
    },
    {
      id: 'gallery' as const,
      label: 'Gallery Manager',
      icon: <ImageIcon size={16} />,
      count: galleryItems.length,
    },
    {
      id: 'content' as const,
      label: 'Site Content',
      icon: <Megaphone size={16} />,
      count: siteContentItems.length,
    },
  ];

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0A0A0A', color: '#E8DDD4' }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A1A' }}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-navigation"
                className="lg:hidden flex items-center justify-center transition-all duration-300"
                style={{
                  width: 42,
                  height: 42,
                  color: '#E8DDD4',
                  backgroundColor: '#141414',
                  border: '1px solid #2A2A2A',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                <span className="sr-only">{mobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}</span>
              </button>

              <Link to="/" className="font-serif text-lg transition-opacity duration-300 hover:opacity-70 shrink-0" style={{ color: '#F4A5AE' }}>
                TGC
              </Link>

              <div className="hidden sm:block min-w-0">
                <p className="font-sans text-[10px] uppercase" style={{ color: '#6B8F71', letterSpacing: '0.14em' }}>
                  Admin
                </p>
                <p className="font-sans text-sm truncate" style={{ color: '#E8DDD4', opacity: 0.72 }}>
                  {activeTabConfig.label}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0">
              <div className="hidden md:block text-right min-w-0">
                <p className="font-sans text-sm truncate" style={{ color: '#E8DDD4' }}>
                  {adminName}
                </p>
                <p className="font-sans text-xs uppercase truncate" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
                  {adminRole}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadDashboardData(true)}
                disabled={dashboardLoading || refreshing}
                className="font-sans text-xs uppercase px-3 sm:px-4 py-2.5 min-h-[42px] flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
                style={{
                  color: '#E8DDD4',
                  backgroundColor: 'transparent',
                  border: '1px solid #2A2A2A',
                  borderRadius: 6,
                  cursor: dashboardLoading || refreshing ? 'wait' : 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                disabled={logoutLoading}
                className="font-sans text-xs uppercase px-3 sm:px-4 py-2.5 min-h-[42px] flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                style={{
                  color: '#E8DDD4',
                  backgroundColor: '#141414',
                  border: '1px solid #2A2A2A',
                  borderRadius: 6,
                  cursor: logoutLoading ? 'wait' : 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                {logoutLoading ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-[1320px] mx-auto px-4 sm:px-5 md:px-8 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 lg:gap-7">
          <aside
            id="admin-navigation"
            className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24 lg:self-start`}
          >
            <div
              className="flex flex-col gap-4"
              style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#111111', padding: 16 }}
            >
              <div className="flex items-start gap-3 pb-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: 'rgba(244, 165, 174, 0.12)', color: '#F4A5AE' }}
                >
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg truncate" style={{ lineHeight: 1.2 }}>
                    {adminName}
                  </p>
                  <p className="font-sans text-sm mt-1 break-words" style={{ opacity: 0.68 }}>
                    {adminEmail}
                  </p>
                  <p className="font-sans text-xs uppercase mt-3" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
                    {adminRole}
                  </p>
                </div>
              </div>

              <nav className="flex flex-col gap-2" aria-label="Admin sections">
                {tabs.map((tab) => {
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      aria-current={selected ? 'page' : undefined}
                      className="font-sans text-xs uppercase w-full min-h-[46px] px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-300"
                      style={{
                        color: selected ? '#F4A5AE' : '#E8DDD4',
                        backgroundColor: selected ? 'rgba(244, 165, 174, 0.12)' : 'transparent',
                        border: selected ? '1px solid rgba(244, 165, 174, 0.35)' : '1px solid transparent',
                        borderRadius: 6,
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                      }}
                    >
                      <span className="shrink-0">{tab.icon}</span>
                      <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                      <span
                        className="font-sans text-[11px] shrink-0"
                        style={{
                          color: selected ? '#0A0A0A' : '#E8DDD4',
                          backgroundColor: selected ? '#F4A5AE' : '#1A1A1A',
                          borderRadius: 999,
                          minWidth: 28,
                          padding: '3px 7px',
                          textAlign: 'center',
                          opacity: selected ? 1 : 0.8,
                          letterSpacing: 0,
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex flex-col gap-5">
            <div className="flex flex-col gap-5 pb-5" style={{ borderBottom: '1px solid #1A1A1A' }}>
              <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-xs uppercase" style={{ color: '#6B8F71', letterSpacing: '0.14em' }}>
                    Access confirmed
                  </p>
                  <div className="mt-3 flex items-center gap-3 min-w-0">
                    <span
                      className="hidden sm:flex items-center justify-center shrink-0"
                      style={{ width: 42, height: 42, borderRadius: 6, backgroundColor: 'rgba(244, 165, 174, 0.12)', color: '#F4A5AE' }}
                    >
                      {activeTabConfig.icon}
                    </span>
                    <div className="min-w-0">
                      <h1 id="admin-section-heading" className="font-serif" style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 600 }}>
                        {activeTabConfig.label}
                      </h1>
                      <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.64, lineHeight: 1.6 }}>
                        Manage messages, bookings, commissions, calendar events, and live gallery content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {refreshNotice && <StatusMessage tone="success">{refreshNotice}</StatusMessage>}
                  {lastUpdated && (
                    <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.52 }}>
                      Updated {formatDate(lastUpdated.toISOString())}
                    </p>
                  )}
                </div>
              </div>

              {logoutError && <StatusMessage tone="error">{logoutError}</StatusMessage>}

              <SiteStatusPanel
                underDevelopmentEnabled={underDevelopmentEnabled}
                saving={siteStatusSaving}
                message={siteStatusMessage}
                error={siteStatusError}
                onToggle={() => void toggleUnderDevelopmentMode()}
                onEditMessage={() => handleTabChange('content')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Post an update', helper: 'Homepage, shop, events, and studio notices', tab: 'content' as const, icon: <Megaphone size={16} /> },
                  { label: 'Add an event', helper: 'Calendar items, bookings, and blocked time', tab: 'calendar' as const, icon: <Calendar size={16} /> },
                  { label: 'Add a photo', helper: 'Gallery and page images', tab: 'gallery' as const, icon: <ImageIcon size={16} /> },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleTabChange(action.tab)}
                    className="text-left min-h-[78px] transition-all duration-300"
                    style={{ color: '#E8DDD4', backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: 8, cursor: 'pointer', padding: 14 }}
                  >
                    <span className="font-sans text-xs uppercase inline-flex items-center gap-2" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
                      {action.icon}
                      {action.label}
                    </span>
                    <span className="font-sans text-xs block mt-2" style={{ color: '#E8DDD4', opacity: 0.58, lineHeight: 1.45 }}>
                      {action.helper}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {activeTab === 'overview' && (
                <OverviewSection data={dashboardData} loading={dashboardLoading} errors={dashboardErrors} />
              )}
              {activeTab === 'messages' && (
                <MessagesSection
                  messages={dashboardData.messages}
                  loading={dashboardLoading}
                  error={dashboardErrors.messages}
                  onSave={(id, input) => updateSubmission('messages', id, input)}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingSection
                  bookings={dashboardData.bookings}
                  loading={dashboardLoading}
                  error={dashboardErrors.bookings}
                  onSave={(id, input) => updateSubmission('bookings', id, input)}
                  onAddToCalendar={openCalendarDraft}
                />
              )}
              {activeTab === 'commissions' && (
                <CommissionsSection
                  commissions={dashboardData.commissions}
                  loading={dashboardLoading}
                  error={dashboardErrors.commissions}
                  onSave={(id, input) => updateSubmission('commissions', id, input)}
                  onAddToCalendar={openCalendarDraft}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarSection
                  events={calendarEvents}
                  loading={dashboardLoading}
                  error={calendarError}
                  draft={calendarDraft}
                  onDraftConsumed={() => setCalendarDraft(null)}
                  onCreate={createCalendarEvent}
                  onUpdate={updateCalendarEvent}
                  onDelete={deleteCalendarEvent}
                />
              )}
              {activeTab === 'gallery' && (
                <GalleryManagerSection
                  items={galleryItems}
                  loading={dashboardLoading}
                  error={galleryError}
                  onCreate={createGalleryEntry}
                  onUpdate={updateGalleryEntry}
                  onImportLegacy={importLegacyGalleryEntries}
                />
              )}
              {activeTab === 'content' && (
                <SiteContentManagerSection
                  items={siteContentItems}
                  loading={dashboardLoading}
                  error={siteContentError}
                  onCreate={createSiteContentEntry}
                  onUpdate={updateSiteContentEntry}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function dataCount(data: DashboardData) {
  return data.messages.length + data.bookings.length + data.commissions.length;
}

export default function AdminPage() {
  usePageMetadata(routeMetadata.admin);

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle');
  const [profileError, setProfileError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(null);
      setProfileError('');
      setProfileStatus(nextSession ? 'loading' : 'idle');
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      setProfileStatus('idle');
      setProfileError('');
      return;
    }

    let active = true;
    const userId = session.user.id;

    async function loadAdminProfile() {
      setProfileStatus('loading');
      setProfileError('');

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setProfile(null);
        setProfileError(error.message || 'Unable to check admin access.');
        setProfileStatus('error');
        return;
      }

      const nextProfile = data as AdminProfile | null;
      const activeAdmin = nextProfile?.id === userId && nextProfile.is_active === true;

      setProfile(nextProfile);
      setProfileStatus(activeAdmin ? 'authorized' : 'unauthorized');
    }

    void loadAdminProfile();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const handleLogout = async () => {
    setLogoutError('');
    setLogoutLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError(error.message || 'Unable to log out. Please try again.');
      setLogoutLoading(false);
      return;
    }

    setProfile(null);
    setSession(null);
    setProfileStatus('idle');
    setLogoutLoading(false);
  };

  const profileErrorMessage = useMemo(() => {
    if (!profileError) return '';
    return `Unable to check admin access: ${profileError}`;
  }, [profileError]);

  if (authLoading) return <LoadingState label="Checking session" />;
  if (!session) return <AdminLoginForm />;
  if (profileStatus === 'loading' || profileStatus === 'idle') return <LoadingState label="Checking admin access" />;

  if (profileStatus === 'error') {
    return (
      <AuthFrame>
        <div className="flex flex-col gap-6">
          <StatusMessage tone="error">{profileErrorMessage || 'Unable to check admin access.'}</StatusMessage>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{
              color: '#E8DDD4',
              backgroundColor: 'transparent',
              border: '1px solid #D14A6E',
              borderRadius: 6,
              cursor: logoutLoading ? 'wait' : 'pointer',
              letterSpacing: '0.12em',
            }}
          >
            {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
            Log out
          </button>
        </div>
      </AuthFrame>
    );
  }

  if (profileStatus === 'unauthorized' || !profile) {
    return (
      <UnauthorizedState
        session={session}
        profile={profile}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        logoutError={logoutError}
      />
    );
  }

  return (
    <AdminPortal
      session={session}
      profile={profile}
      onLogout={handleLogout}
      logoutLoading={logoutLoading}
      logoutError={logoutError}
    />
  );
}
