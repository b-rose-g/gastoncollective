import { publicSupabase } from './supabase';

export type PublicCalendarEvent = {
  id: number | string | null;
  event_type: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  all_day: boolean | null;
  location: string | null;
  external_link: string | null;
  status: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type GetPublicCalendarEventsOptions = {
  fromDate?: string;
  limit?: number;
};

type PublicCalendarEventRow = Partial<PublicCalendarEvent> & Record<string, unknown>;

type PublicCalendarLoadResult = {
  ok: boolean;
  events: PublicCalendarEvent[];
  error?: unknown;
};

const publicCalendarColumns = [
  'id',
  'event_type',
  'title',
  'description',
  'start_date',
  'start_time',
  'end_date',
  'end_time',
  'all_day',
  'location',
  'external_link',
  'status',
  'is_public',
  'created_at',
  'updated_at',
].join(',');

const legacyPublicCalendarColumns = [
  'event_type',
  'title',
  'description',
  'start_date',
  'start_time',
  'end_date',
  'end_time',
  'all_day',
  'location',
  'external_link',
  'status',
].join(',');

const publicCalendarStatuses = ['published', 'scheduled', 'confirmed'];
const publicEventTypes = ['book_signing', 'poetry_night', 'popup_event', 'shop_drop'];

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getPublicCalendarEvents(options: GetPublicCalendarEventsOptions = {}) {
  const rpcResult = await loadPublicCalendarEventsFromRpc(options);
  if (rpcResult.events.length > 0) return rpcResult.events;

  const viewResult = await loadPublicCalendarEventsFromView(options);
  if (viewResult.events.length > 0) return viewResult.events;

  const directResult = await loadPublicCalendarEventsFromCalendarEvents(options);
  if (directResult.events.length > 0) return directResult.events;

  if (rpcResult.ok || viewResult.ok || directResult.ok) {
    return [];
  }

  throw new Error('Events could not be loaded right now. Please check back soon.');
}

async function loadPublicCalendarEventsFromRpc(options: GetPublicCalendarEventsOptions): Promise<PublicCalendarLoadResult> {
  const { data, error } = await publicSupabase.rpc('get_public_calendar_events');

  if (error) {
    return { ok: false, events: [], error };
  }

  return { ok: true, events: normalizePublicCalendarEvents(data, options) };
}

async function loadPublicCalendarEventsFromView(options: GetPublicCalendarEventsOptions): Promise<PublicCalendarLoadResult> {
  const strictResult = await queryPublicCalendarEventsView(options, publicCalendarColumns, true);
  if (strictResult.ok || !isMissingPublicColumnError(strictResult.error)) return strictResult;

  return queryPublicCalendarEventsView(options, legacyPublicCalendarColumns, false);
}

async function queryPublicCalendarEventsView(
  options: GetPublicCalendarEventsOptions,
  columns: string,
  includeVisibilityFilter: boolean,
): Promise<PublicCalendarLoadResult> {
  let query = publicSupabase
    .from('public_calendar_events')
    .select(columns)
    .in('status', publicCalendarStatuses)
    .in('event_type', publicEventTypes)
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (includeVisibilityFilter) {
    query = query.eq('is_public', true);
  }

  if (options.fromDate) {
    query = query.gte('start_date', options.fromDate);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, events: [], error };
  }

  return { ok: true, events: normalizePublicCalendarEvents(data, options) };
}

async function loadPublicCalendarEventsFromCalendarEvents(options: GetPublicCalendarEventsOptions): Promise<PublicCalendarLoadResult> {
  let query = publicSupabase
    .from('calendar_events')
    .select(publicCalendarColumns)
    .eq('is_public', true)
    .in('status', publicCalendarStatuses)
    .in('event_type', publicEventTypes)
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (options.fromDate) {
    query = query.gte('start_date', options.fromDate);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, events: [], error };
  }

  return { ok: true, events: normalizePublicCalendarEvents(data, options) };
}

function normalizePublicCalendarEvents(data: unknown, options: GetPublicCalendarEventsOptions) {
  const rows = Array.isArray(data) ? (data as PublicCalendarEventRow[]) : [];

  const events = rows
    .filter((event) => {
      if (!isVisiblePublicEvent(event)) return false;
      if (!event.start_date) return false;
      if (options.fromDate && event.start_date < options.fromDate) return false;
      return true;
    })
    .map(toPublicCalendarEvent)
    .sort(comparePublicCalendarEvents);

  return typeof options.limit === 'number' ? events.slice(0, options.limit) : events;
}

function isVisiblePublicEvent(event: PublicCalendarEventRow) {
  if (!event.status || !publicCalendarStatuses.includes(String(event.status))) return false;
  if (!event.event_type || !publicEventTypes.includes(String(event.event_type))) return false;
  if ('is_public' in event && event.is_public !== true) return false;
  return true;
}

function toPublicCalendarEvent(event: PublicCalendarEventRow): PublicCalendarEvent {
  return {
    id: typeof event.id === 'number' || typeof event.id === 'string' ? event.id : null,
    event_type: stringOrNull(event.event_type),
    title: typeof event.title === 'string' ? event.title : 'Untitled Event',
    description: stringOrNull(event.description),
    start_date: stringOrNull(event.start_date),
    start_time: stringOrNull(event.start_time),
    end_date: stringOrNull(event.end_date),
    end_time: stringOrNull(event.end_time),
    all_day: typeof event.all_day === 'boolean' ? event.all_day : null,
    location: stringOrNull(event.location),
    external_link: stringOrNull(event.external_link),
    status: stringOrNull(event.status),
    is_public: 'is_public' in event ? event.is_public === true : true,
    created_at: stringOrNull(event.created_at),
    updated_at: stringOrNull(event.updated_at),
  };
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function comparePublicCalendarEvents(left: PublicCalendarEvent, right: PublicCalendarEvent) {
  const leftValue = `${left.start_date ?? '9999-12-31'}T${left.start_time || '00:00:00'}`;
  const rightValue = `${right.start_date ?? '9999-12-31'}T${right.start_time || '00:00:00'}`;
  return leftValue.localeCompare(rightValue) || String(left.title).localeCompare(String(right.title));
}

function isMissingPublicColumnError(error: unknown) {
  const text = error instanceof Error ? error.message : JSON.stringify(error ?? '');
  return ['id', 'is_public', 'created_at', 'updated_at'].some((column) => text.toLowerCase().includes(column));
}

export function publicEventTypeLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    book_signing: 'Book Signing',
    poetry_night: 'Poetry Night',
    popup_event: 'Pop-up Event',
    shop_drop: 'Shop Drop',
    other: 'Event',
  };

  return value ? labels[value] ?? value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : 'Event';
}

export function publicStatusLabel(value: string | null | undefined) {
  return value ? value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : 'Scheduled';
}

export function publicFormatDate(value: string | null | undefined) {
  if (!value) return 'Date TBD';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function publicFormatTime(value: string | null | undefined) {
  if (!value) return '';
  const [hourValue, minuteValue] = value.split(':');
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function publicEventDateTime(event: PublicCalendarEvent) {
  const startDate = publicFormatDate(event.start_date);
  const endDate = event.end_date && event.end_date !== event.start_date ? publicFormatDate(event.end_date) : '';

  if (event.all_day) {
    return endDate ? `${startDate} - ${endDate} | All day` : `${startDate} | All day`;
  }

  const startTime = publicFormatTime(event.start_time);
  const endTime = publicFormatTime(event.end_time);
  const timeText = startTime && endTime ? `${startTime} - ${endTime}` : startTime;

  if (endDate && timeText) return `${startDate} - ${endDate} | ${timeText}`;
  if (timeText) return `${startDate} | ${timeText}`;
  return endDate ? `${startDate} - ${endDate}` : startDate;
}
