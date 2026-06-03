// BLOCKED DATES CONFIG — Edit this to manage unavailable days
// Format: 'YYYY-MM-DD' strings

// Example: blocks every Sunday (handled in calendar logic)
// Block specific dates by adding them here:
export const BLOCKED_DATES: string[] = [
  // '2025-07-04', // example: holiday
  // '2025-07-15', // example: personal day
];

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

// Block specific time slots on specific dates
// e.g. { '2025-07-10': ['10:00 AM', '11:00 AM'] }
export const BLOCKED_TIME_SLOTS: Record<string, string[]> = {};
