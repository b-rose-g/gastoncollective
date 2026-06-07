import { publicSupabase } from './supabase';

export type PublicCalendarEvent = {
  title: string;
  event_type: string | null;
  description: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  all_day: boolean | null;
  location: string | null;
  external_link: string | null;
  status: string | null;
};

const publicCalendarColumns = [
  'title',
  'event_type',
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

const publicCalendarStatuses = ['scheduled', 'confirmed', 'published'];

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadPublicCalendarEvents(options: { fromDate?: string; limit?: number } = {}) {
  let query = publicSupabase
    .from('public_calendar_events')
    .select(publicCalendarColumns)
    .in('status', publicCalendarStatuses)
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
    throw new Error(error.message || 'Unable to load public events.');
  }

  return (data ?? []) as unknown as PublicCalendarEvent[];
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
    return endDate ? `${startDate} - ${endDate} · All day` : `${startDate} · All day`;
  }

  const startTime = publicFormatTime(event.start_time);
  const endTime = publicFormatTime(event.end_time);
  const timeText = startTime && endTime ? `${startTime} - ${endTime}` : startTime;

  if (endDate && timeText) return `${startDate} - ${endDate} · ${timeText}`;
  if (timeText) return `${startDate} · ${timeText}`;
  return endDate ? `${startDate} - ${endDate}` : startDate;
}
