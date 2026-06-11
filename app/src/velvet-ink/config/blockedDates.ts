// Booking window rules. Date and time-specific unavailability comes from
// get_unavailable_booking_slots, backed by the admin calendar.

// Block all Sundays (true) or allow them (false)
export const BLOCK_SUNDAYS = true;

// Block all Saturdays (true) or allow them (false)
export const BLOCK_SATURDAYS = false;

// How many days ahead can customers book?
export const MAX_BOOKING_DAYS_AHEAD = 60;

// Minimum days ahead required (can't book today or tomorrow)
export const MIN_BOOKING_DAYS_AHEAD = 2;

// Available time slots
export const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];
