import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Loader2, MapPin } from 'lucide-react';
import {
  dateKey,
  loadPublicCalendarEvents,
  publicEventDateTime,
  publicEventTypeLabel,
  type PublicCalendarEvent,
} from '@/lib/publicCalendarEvents';

export default function UpcomingEventsSection() {
  const [events, setEvents] = useState<PublicCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const publicEvents = await loadPublicCalendarEvents({ fromDate: dateKey(new Date()), limit: 3 });
        if (active) setEvents(publicEvents);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load events.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="events" className="relative" style={{ backgroundColor: '#FDFCF8' }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-9">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#7B3B4F', opacity: 0.7 }}>
              Upcoming Events
            </span>
            <h2 className="font-serif mt-4" style={{ color: '#2D2D2D', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1, fontWeight: 600 }}>
              WHAT'S NEXT
            </h2>
          </div>
          <Link className="font-sans text-xs uppercase tracking-[0.16em] inline-flex items-center gap-2" style={{ color: '#7B3B4F', textDecoration: 'none' }} to="/events">
            View calendar
            <CalendarDays size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 font-sans text-sm" style={{ color: '#6B6560' }}>
            <Loader2 size={16} className="animate-spin" />
            Loading events
          </div>
        ) : error ? (
          <p className="font-sans text-sm" style={{ color: '#7B3B4F' }}>
            Public events could not be loaded right now.
          </p>
        ) : events.length === 0 ? (
          <div style={{ border: '1px solid #E0D5C5', borderRadius: 8, backgroundColor: '#FAF7F0', padding: 24 }}>
            <p className="font-serif text-2xl" style={{ color: '#2D2D2D' }}>
              No public events are scheduled yet.
            </p>
            <p className="font-sans text-sm mt-2" style={{ color: '#6B6560' }}>
              Check back soon for signings, readings, pop-ups, and shop drops.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {events.map((event, index) => (
              <article key={`${event.start_date}-${event.start_time}-${event.title}-${index}`} style={{ border: '1px solid #E0D5C5', borderRadius: 8, backgroundColor: '#FAF7F0', padding: 20 }}>
                <p className="font-sans text-xs uppercase tracking-[0.14em]" style={{ color: '#BFA76A' }}>
                  {publicEventTypeLabel(event.event_type)}
                </p>
                <h3 className="font-serif mt-3" style={{ color: '#2D2D2D', fontSize: 24, lineHeight: 1.2, fontWeight: 600 }}>
                  {event.title}
                </h3>
                <p className="font-sans text-sm mt-4 flex items-start gap-2" style={{ color: '#5F5650', lineHeight: 1.5 }}>
                  <CalendarDays size={15} style={{ color: '#7B3B4F', flexShrink: 0, marginTop: 2 }} />
                  <span>{publicEventDateTime(event)}</span>
                </p>
                {event.location && (
                  <p className="font-sans text-sm mt-2 flex items-start gap-2" style={{ color: '#5F5650', lineHeight: 1.5 }}>
                    <MapPin size={15} style={{ color: '#7B3B4F', flexShrink: 0, marginTop: 2 }} />
                    <span>{event.location}</span>
                  </p>
                )}
                {event.external_link && (
                  <a
                    href={event.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 mt-5"
                    style={{ color: '#7B3B4F', textDecoration: 'none' }}
                  >
                    Event Link
                    <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
