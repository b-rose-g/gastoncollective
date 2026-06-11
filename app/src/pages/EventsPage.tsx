import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarDays, ExternalLink, Loader2, MapPin, RefreshCw } from 'lucide-react';
import FooterSection from '@/sections/FooterSection';
import { routeMetadata, usePageMetadata } from '@/lib/seo';
import {
  dateKey,
  getPublicCalendarEvents,
  publicEventDateTime,
  publicEventTypeLabel,
  publicStatusLabel,
  type PublicCalendarEvent,
} from '@/lib/publicEvents';

export default function EventsPage() {
  usePageMetadata(routeMetadata.events);

  const [events, setEvents] = useState<PublicCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const publicEvents = await getPublicCalendarEvents({ fromDate: dateKey(new Date()) });
      setEvents(publicEvents);
    } catch {
      setError('Events could not be loaded right now. Please check back soon.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <main style={{ backgroundColor: '#F5F0E8', color: '#2D2D2D', minHeight: '100vh' }}>
      <header className="px-6 md:px-12 py-6">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="font-serif text-lg" style={{ color: '#7B3B4F', textDecoration: 'none' }}>
            The Gaston Collective
          </Link>
          <div className="flex items-center gap-5">
            <Link className="font-sans text-xs uppercase tracking-[0.14em]" style={{ color: '#2D2D2D', textDecoration: 'none' }} to="/velvet-ink">
              Velvet Ink
            </Link>
            <Link className="font-sans text-xs uppercase tracking-[0.14em]" style={{ color: '#2D2D2D', textDecoration: 'none' }} to="/shop">
              Shop
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 md:px-12 pt-10 pb-20">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#BFA76A' }}>
                Public Calendar
              </p>
              <h1 className="font-serif mt-4" style={{ fontSize: 'clamp(40px, 7vw, 84px)', lineHeight: 1, fontWeight: 600 }}>
                Upcoming Events
              </h1>
              <p className="font-sans text-base mt-5 max-w-2xl" style={{ color: '#5F5650', lineHeight: 1.7 }}>
                Book signings, poetry nights, pop-ups, and shop drops from The Gaston Collective.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadEvents(true)}
              disabled={loading || refreshing}
              className="font-sans text-xs uppercase tracking-[0.14em] px-4 py-3 inline-flex items-center gap-2 transition-opacity duration-300 disabled:opacity-60"
              style={{ color: '#7B3B4F', backgroundColor: 'transparent', border: '1px solid #D8CFC3', borderRadius: 6, cursor: loading || refreshing ? 'wait' : 'pointer' }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 font-sans text-sm py-16" style={{ color: '#5F5650' }}>
              <Loader2 className="animate-spin" size={18} />
              Loading public events
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-5" style={{ border: '1px solid #D14A6E55', borderRadius: 8, backgroundColor: '#FFF9F8', color: '#7B3B4F' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <p className="font-sans text-sm" role="alert">
                {error}
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20" style={{ border: '1px solid #E0D5C5', borderRadius: 8, backgroundColor: '#FAF7F0' }}>
              <CalendarDays size={34} style={{ color: '#A89B8C', margin: '0 auto' }} />
              <p className="font-serif text-2xl mt-5" style={{ color: '#2D2D2D' }}>
                No upcoming events yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {events.map((event, index) => (
                <PublicEventCard key={`${event.start_date}-${event.start_time}-${event.title}-${index}`} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

function PublicEventCard({ event }: { event: PublicCalendarEvent }) {
  return (
    <article style={{ border: '1px solid #E0D5C5', borderRadius: 8, backgroundColor: '#FAF7F0', padding: 22 }}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="font-sans text-xs uppercase tracking-[0.14em]" style={{ color: '#7B3B4F' }}>
          {publicEventTypeLabel(event.event_type)}
        </span>
        <span className="font-sans text-xs uppercase tracking-[0.1em] px-2 py-1" style={{ color: '#6B8F71', border: '1px solid #B8C8B5', borderRadius: 4 }}>
          {publicStatusLabel(event.status)}
        </span>
      </div>

      <h2 className="font-serif" style={{ color: '#2D2D2D', fontSize: 28, lineHeight: 1.15, fontWeight: 600 }}>
        {event.title}
      </h2>

      <p className="font-sans text-sm mt-4 flex items-start gap-2" style={{ color: '#5F5650', lineHeight: 1.55 }}>
        <CalendarDays size={16} style={{ color: '#BFA76A', flexShrink: 0, marginTop: 2 }} />
        <span>{publicEventDateTime(event)}</span>
      </p>

      {event.location && (
        <p className="font-sans text-sm mt-2 flex items-start gap-2" style={{ color: '#5F5650', lineHeight: 1.55 }}>
          <MapPin size={16} style={{ color: '#BFA76A', flexShrink: 0, marginTop: 2 }} />
          <span>{event.location}</span>
        </p>
      )}

      {event.description && (
        <p className="font-sans text-sm mt-5" style={{ color: '#4B443F', lineHeight: 1.7 }}>
          {event.description}
        </p>
      )}

      {event.external_link && (
        <a
          href={event.external_link}
          target="_blank"
          rel="noreferrer"
          className="font-sans text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 mt-6"
          style={{ color: '#7B3B4F', textDecoration: 'none' }}
        >
          Event Link
          <ExternalLink size={14} />
        </a>
      )}
    </article>
  );
}
