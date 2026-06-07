import { publicSupabase } from './supabase';

export type UnavailableBookingSlot = {
  start_date: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean | null;
};

const DEFAULT_SLOT_DURATION_MINUTES = 60;

export async function getUnavailableBookingSlots(targetDate: string) {
  const { data, error } = await publicSupabase.rpc('get_unavailable_booking_slots', {
    target_date: targetDate,
  });

  if (error) {
    throw new Error(error.message || 'Unable to check booking availability.');
  }

  return (data ?? []) as UnavailableBookingSlot[];
}

export function bookingTimeToMinutes(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;

  const twelveHourMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const [, rawHour, rawMinute, meridiem] = twelveHourMatch;
    let hour = Number(rawHour);
    const minute = Number(rawMinute);

    if (meridiem.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!twentyFourHourMatch) return null;

  const [, rawHour, rawMinute] = twentyFourHourMatch;
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

export function dateHasAllDayBlock(slots: UnavailableBookingSlot[]) {
  return slots.some((slot) => Boolean(slot.all_day));
}

export function bookingTimeOverlapsUnavailableSlot(
  time: string,
  unavailableSlots: UnavailableBookingSlot[],
  slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
) {
  if (dateHasAllDayBlock(unavailableSlots)) return true;

  const selectedStart = bookingTimeToMinutes(time);
  if (selectedStart === null) return false;

  const selectedEnd = selectedStart + slotDurationMinutes;

  return unavailableSlots.some((slot) => {
    const blockedStart = bookingTimeToMinutes(slot.start_time);
    if (blockedStart === null) return false;

    const blockedEnd = bookingTimeToMinutes(slot.end_time) ?? blockedStart + slotDurationMinutes;
    return selectedStart < blockedEnd && selectedEnd > blockedStart;
  });
}
