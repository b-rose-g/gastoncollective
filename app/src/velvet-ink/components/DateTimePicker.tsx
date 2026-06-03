import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, CalendarDays } from 'lucide-react';
import {
  BLOCKED_DATES,
  BLOCK_SUNDAYS,
  BLOCK_SATURDAYS,
  MAX_BOOKING_DAYS_AHEAD,
  MIN_BOOKING_DAYS_AHEAD,
  TIME_SLOTS,
  BLOCKED_TIME_SLOTS,
} from '../config/blockedDates';

interface TimeSlot {
  date: string;
  time: string;
  label: string;
}

interface DateTimePickerProps {
  selections: TimeSlot[];
  onChange: (selections: TimeSlot[]) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DateTimePicker({ selections, onChange }: DateTimePickerProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + MIN_BOOKING_DAYS_AHEAD);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + MAX_BOOKING_DAYS_AHEAD);
    return d;
  }, []);

  const isDateBlocked = (date: Date): boolean => {
    const key = formatDateKey(date);

    if (date < minDate || date > maxDate) return true;

    if (BLOCKED_DATES.includes(key)) return true;

    const day = date.getDay();
    if (BLOCK_SUNDAYS && day === 0) return true;
    if (BLOCK_SATURDAYS && day === 6) return true;

    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    const key = formatDateKey(date);
    return selections.some((s) => s.date === key);
  };

  const getAvailableTimesForDate = (dateKey: string): string[] => {
    const blocked = BLOCKED_TIME_SLOTS[dateKey] || [];
    return TIME_SLOTS.filter((t) => !blocked.includes(t));
  };

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date)) return;
    const key = formatDateKey(date);
    setSelectedDate(selectedDate === key ? null : key);
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    if (selections.length >= 3) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const label = `${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()} at ${time}`;

    onChange([...selections, { date: selectedDate, time, label }]);
    setSelectedDate(null);
  };

  const removeSelection = (index: number) => {
    onChange(selections.filter((_, i) => i !== index));
  };

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDayOfMonth.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const canGoPrev =
    viewDate.getFullYear() > today.getFullYear() ||
    (viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() > today.getMonth());

  const canGoNext = viewDate < maxDate;

  return (
    <div className="w-full" role="group" aria-label="Preferred dates and times">
      {/* Selections display */}
      {selections.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {selections.map((sel, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2"
              style={{
                backgroundColor: 'rgba(209, 74, 110, 0.1)',
                border: '1px solid rgba(209, 74, 110, 0.3)',
              }}
            >
              <Clock size={14} style={{ color: '#D14A6E' }} />
              <span className="font-sans text-sm" style={{ color: '#E8DDD4' }}>
                {sel.label}
              </span>
              <button
                type="button"
                aria-label={`Remove ${sel.label}`}
                onClick={() => removeSelection(i)}
                style={{
                  color: '#D14A6E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: 4,
                }}
                data-cursor-hover
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selections.length >= 3 && (
        <p className="font-sans text-xs mb-4" style={{ color: '#D14A6E', opacity: 0.7 }}>
          Maximum 3 selections reached. Remove one to add another.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              aria-label="Show previous month"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              disabled={!canGoPrev}
              className="transition-opacity duration-200"
              style={{
                color: canGoPrev ? '#E8DDD4' : '#E8DDD420',
                background: 'none',
                border: 'none',
                cursor: canGoPrev ? 'pointer' : 'default',
              }}
              data-cursor-hover={canGoPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className="font-serif text-lg"
              style={{ color: '#E8DDD4', letterSpacing: '0.02em' }}
            >
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              aria-label="Show next month"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              disabled={!canGoNext}
              className="transition-opacity duration-200"
              style={{
                color: canGoNext ? '#E8DDD4' : '#E8DDD420',
                background: 'none',
                border: 'none',
                cursor: canGoNext ? 'pointer' : 'default',
              }}
              data-cursor-hover={canGoNext}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="font-sans text-center text-[10px] uppercase tracking-[0.15em] py-2"
                style={{ color: '#E8DDD4', opacity: 0.3 }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) {
                return <div key={i} className="aspect-square" />;
              }

              const key = formatDateKey(date);
              const blocked = isDateBlocked(date);
              const selected = isDateSelected(date);
              const isToday = isSameDay(date, today);
              const isPicked = selectedDate === key;

              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}${blocked ? ' unavailable' : ''}`}
                  aria-pressed={isPicked || selected}
                  onClick={() => handleDateClick(date)}
                  disabled={blocked}
                  className="aspect-square flex items-center justify-center font-sans text-sm transition-all duration-200"
                  style={{
                    color: blocked
                      ? '#E8DDD415'
                      : selected
                        ? '#D14A6E'
                        : isPicked
                          ? '#0A0A0A'
                          : '#E8DDD4',
                    backgroundColor: isPicked
                      ? '#D14A6E'
                      : selected
                        ? 'rgba(209, 74, 110, 0.1)'
                        : isToday
                          ? 'rgba(209, 74, 110, 0.05)'
                          : 'transparent',
                    border: isToday && !isPicked
                      ? '1px solid rgba(209, 74, 110, 0.2)'
                      : '1px solid transparent',
                    cursor: blocked ? 'not-allowed' : 'pointer',
                  }}
                  data-cursor-hover={!blocked}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, backgroundColor: '#D14A6E' }} />
              <span className="font-sans text-[10px] uppercase tracking-[0.1em]" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, border: '1px solid rgba(209, 74, 110, 0.2)' }} />
              <span className="font-sans text-[10px] uppercase tracking-[0.1em]" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                Today
              </span>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div>
          {selectedDate ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={16} style={{ color: '#D14A6E' }} />
                <span className="font-serif text-base" style={{ color: '#E8DDD4' }}>
                  {(() => {
                    const d = new Date(selectedDate + 'T00:00:00');
                    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                  })()}
                </span>
              </div>

              {selections.length >= 3 ? (
                <p className="font-sans text-sm" style={{ color: '#D14A6E', opacity: 0.7 }}>
                  You've already selected 3 preferred times. Remove one above to choose another.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableTimesForDate(selectedDate).map((time) => (
                    <button
                      key={time}
                      type="button"
                      aria-label={`Select ${time}`}
                      onClick={() => handleTimeSelect(time)}
                      className="font-sans text-sm py-3 px-4 border transition-all duration-300 hover:border-[#D14A6E] hover:text-[#D14A6E]"
                      style={{
                        color: '#E8DDD4',
                        borderColor: '#1A1A1A',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                      data-cursor-hover
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="font-sans text-xs uppercase tracking-[0.15em] mt-4 transition-opacity duration-200 hover:opacity-100"
                style={{ color: '#E8DDD4', opacity: 0.4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <CalendarDays size={32} style={{ color: '#E8DDD4', opacity: 0.15 }} />
              <p className="font-sans text-sm mt-4 text-center" style={{ color: '#E8DDD4', opacity: 0.3 }}>
                Pick a date from the calendar
                <br />
                to see available time slots
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
