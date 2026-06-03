import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { trpc } from '@/providers/trpc';
import { routeMetadata, usePageMetadata } from '@/lib/seo';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Inbox,
  LogOut,
  Mail,
  Palette,
  StickyNote,
  X,
} from 'lucide-react';

type Tab = 'messages' | 'bookings' | 'commissions' | 'monitoring';
type ReferenceImage = { name: string; url?: string; type?: string; size?: number };

function parseReferenceImages(value: string | null | undefined): ReferenceImage[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as ReferenceImage[];
    if (Array.isArray(parsed)) return parsed.filter((item) => item.name || item.url);
  } catch {
    return value
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }
  return [];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unread: '#D14A6E',
    read: '#6B8F71',
    pending: '#D14A6E',
    confirmed: '#6B8F71',
    cancelled: '#777777',
    in_progress: '#C4A265',
    completed: '#6B8F71',
    declined: '#777777',
  };
  const color = colors[status] || '#E8DDD4';
  const icons: Record<string, ReactNode> = {
    unread: <AlertCircle size={12} />,
    read: <CheckCircle2 size={12} />,
    pending: <Clock size={12} />,
    confirmed: <CheckCircle2 size={12} />,
    cancelled: <X size={12} />,
    in_progress: <Clock size={12} />,
    completed: <Check size={12} />,
    declined: <X size={12} />,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider px-3 py-1"
      style={{ color, border: `1px solid ${color}`, borderRadius: 4 }}
    >
      {icons[status]}
      {status.replace('_', ' ')}
    </span>
  );
}

function PasswordGate() {
  const [password, setPassword] = useState('');
  const utils = trpc.useUtils();
  const login = trpc.admin.login.useMutation({
    onSuccess: () => {
      setPassword('');
      void utils.admin.session.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif" style={{ color: '#E8DDD4', fontSize: 28, fontWeight: 600 }}>
            Admin Access
          </h1>
          <p className="font-script mt-2" style={{ color: '#F4A5AE', fontSize: 18 }}>
            sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-password" className="sr-only">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
              style={{ color: '#E8DDD4', borderBottom: `1px solid ${login.error ? '#D14A6E' : '#1A1A1A'}` }}
              autoFocus
              required
            />
          </div>
          {login.error && (
            <p role="alert" className="font-sans text-xs" style={{ color: '#D14A6E' }}>
              {login.error.message || 'Unable to sign in.'}
            </p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-3 border transition-all duration-300 hover:bg-[#D14A6E] hover:text-[#0A0A0A] hover:border-[#D14A6E] disabled:opacity-60"
            style={{ color: '#D14A6E', borderColor: '#D14A6E', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            {login.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link className="font-sans text-xs uppercase tracking-[0.15em]" to="/" style={{ color: '#E8DDD4', opacity: 0.65 }}>
            Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReferenceImages({ value }: { value: string | null | undefined }) {
  const images = parseReferenceImages(value);
  if (images.length === 0) {
    return <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.5 }}>No reference images.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((image, index) => (
        image.url ? (
          <a
            key={`${image.url}-${index}`}
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            aria-label={`Open reference image ${image.name || index + 1}`}
            style={{ textDecoration: 'none' }}
          >
            <img
              src={image.url}
              alt={image.name || 'Reference image'}
              width={96}
              height={96}
              className="object-cover"
              style={{ width: 96, height: 96, border: '1px solid #1A1A1A', borderRadius: 6 }}
            />
          </a>
        ) : (
          <span key={`${image.name}-${index}`} className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.7 }}>
            {image.name}
          </span>
        )
      ))}
    </div>
  );
}

function formatDate(date: Date | string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  usePageMetadata(routeMetadata.admin);

  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const utils = trpc.useUtils();

  const session = trpc.admin.session.useQuery();
  const authenticated = session.data?.authenticated === true;
  const messagesQuery = trpc.contact.list.useQuery(undefined, { enabled: authenticated });
  const bookingsQuery = trpc.booking.list.useQuery(undefined, { enabled: authenticated });
  const commissionsQuery = trpc.commission.list.useQuery(undefined, { enabled: authenticated });
  const monitoringQuery = trpc.admin.monitoring.useQuery(undefined, { enabled: authenticated && activeTab === 'monitoring' });

  const logout = trpc.admin.logout.useMutation({
    onSuccess: () => void utils.admin.session.invalidate(),
  });
  const markRead = trpc.contact.markRead.useMutation({ onSuccess: () => void utils.contact.list.invalidate() });
  const updateBooking = trpc.booking.updateStatus.useMutation({ onSuccess: () => void utils.booking.list.invalidate() });
  const addBookingNotes = trpc.booking.addNotes.useMutation({ onSuccess: () => void utils.booking.list.invalidate() });
  const updateCommission = trpc.commission.updateStatus.useMutation({ onSuccess: () => void utils.commission.list.invalidate() });
  const addCommissionNotes = trpc.commission.addNotes.useMutation({ onSuccess: () => void utils.commission.list.invalidate() });

  if (session.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A', color: '#E8DDD4' }}>
        <p className="font-sans text-xs uppercase tracking-[0.2em]">Checking Session</p>
      </div>
    );
  }

  if (!authenticated) return <PasswordGate />;

  const messages = messagesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const commissions = commissionsQuery.data ?? [];

  const tabs: { id: Tab; label: string; icon: ReactNode; count: number }[] = [
    { id: 'messages', label: 'Messages', icon: <Mail size={16} />, count: messages.length },
    { id: 'bookings', label: 'Tattoo Bookings', icon: <Calendar size={16} />, count: bookings.length },
    { id: 'commissions', label: 'Commissions', icon: <Palette size={16} />, count: commissions.length },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity size={16} />, count: monitoringQuery.data?.events.length || 0 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A1A' }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-lg transition-opacity duration-300 hover:opacity-70" style={{ color: '#F4A5AE' }}>
            TGC
          </Link>
          <h1 className="font-serif text-base hidden md:block" style={{ color: '#E8DDD4', letterSpacing: '0.1em' }}>
            Admin Dashboard
          </h1>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-opacity duration-300 hover:opacity-100"
            style={{ color: '#E8DDD4', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid #1A1A1A' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setExpandedRow(null); }}
              className="font-sans text-xs uppercase tracking-[0.15em] px-5 py-3 flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? '#D14A6E' : '#E8DDD4',
                opacity: activeTab === tab.id ? 1 : 0.65,
                borderBottom: activeTab === tab.id ? '2px solid #D14A6E' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
              <span className="font-sans text-xs px-2 py-0.5" style={{ backgroundColor: activeTab === tab.id ? 'rgba(209, 74, 110, 0.15)' : 'rgba(232, 221, 212, 0.08)', borderRadius: 4 }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-20">
        {activeTab === 'messages' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Contact Messages</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.55 }}>
                {messages.filter((m) => m.read === 'unread').length} unread
              </span>
            </div>

            {messagesQuery.isLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.65 }}>Loading...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <Inbox size={40} style={{ color: '#E8DDD4', opacity: 0.2, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.5 }}>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <article key={msg.id} style={{ border: `1px solid ${msg.read === 'unread' ? '#D14A6E45' : '#1A1A1A'}`, borderRadius: 8, backgroundColor: msg.read === 'unread' ? 'rgba(209, 74, 110, 0.03)' : '#141414', padding: '20px 24px' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>{msg.name}</span>
                          <StatusBadge status={msg.read} />
                        </div>
                        <p className="font-sans text-xs mb-1" style={{ color: '#E8DDD4', opacity: 0.6 }}>{msg.email}</p>
                        <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: '#D14A6E', opacity: 0.85 }}>{msg.subject}</p>
                        <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.85, lineHeight: 1.6 }}>{msg.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.5, whiteSpace: 'nowrap' }}>{formatDate(msg.createdAt)}</span>
                        {msg.read === 'unread' && (
                          <button
                            type="button"
                            aria-label={`Mark message from ${msg.name} as read`}
                            onClick={() => markRead.mutate({ id: msg.id })}
                            className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300 hover:bg-[#6B8F71] hover:text-[#0A0A0A] flex items-center gap-1"
                            style={{ color: '#6B8F71', borderColor: '#6B8F71', backgroundColor: 'transparent', cursor: 'pointer' }}
                          >
                            <Eye size={12} /> Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'bookings' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Tattoo Bookings</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.55 }}>
                {bookings.filter((b) => b.status === 'pending').length} pending
              </span>
            </div>

            {bookingsQuery.isLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.65 }}>Loading...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20">
                <Calendar size={40} style={{ color: '#E8DDD4', opacity: 0.2, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.5 }}>No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const isExpanded = expandedRow === booking.id;
                  return (
                    <article key={booking.id} style={{ border: `1px solid ${booking.status === 'pending' ? '#D14A6E45' : '#1A1A1A'}`, borderRadius: 8, backgroundColor: booking.status === 'pending' ? 'rgba(209, 74, 110, 0.03)' : '#141414', overflow: 'hidden' }}>
                      <button
                        type="button"
                        className="w-full flex items-start justify-between gap-4 text-left"
                        style={{ padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} booking from ${booking.name}`}
                        onClick={() => setExpandedRow(isExpanded ? null : booking.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>{booking.name}</span>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.6 }}>
                            {booking.email} {booking.phone && `- ${booking.phone}`}
                          </p>
                          <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                            {booking.description?.slice(0, 120)}{booking.description && booking.description.length > 120 ? '...' : ''}
                          </p>
                          {booking.preferredDates && (
                            <p className="font-sans text-xs mt-2" style={{ color: '#C4A265', opacity: 0.85 }}>
                              Preferred: {booking.preferredDates}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.5, whiteSpace: 'nowrap' }}>{formatDate(booking.createdAt)}</span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: '#E8DDD4', opacity: 0.65 }} /> : <ChevronDown size={16} style={{ color: '#E8DDD4', opacity: 0.65 }} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #1A1A1A', padding: '20px 24px', backgroundColor: '#0A0A0A' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Description</p>
                              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.85, lineHeight: 1.6 }}>{booking.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div><p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Size</p><p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.size || '-'}</p></div>
                              <div><p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Placement</p><p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.placement || '-'}</p></div>
                              <div><p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Preferred Dates</p><p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.preferredDates || '-'}</p></div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: '#E8DDD4', opacity: 0.55 }}>Reference Photos</p>
                            <ReferenceImages value={booking.referenceImages} />
                          </div>

                          <div className="mb-6" style={{ backgroundColor: '#141414', borderRadius: 6, padding: 16 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <StickyNote size={14} style={{ color: '#C4A265' }} />
                              <p className="font-sans text-xs uppercase tracking-wider" style={{ color: '#C4A265' }}>Notes</p>
                            </div>
                            <p className="font-sans text-sm mb-3 whitespace-pre-wrap" style={{ color: '#E8DDD4', opacity: 0.85 }}>{booking.notes || 'No notes yet.'}</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                aria-label={`Add note for booking from ${booking.name}`}
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 px-3 py-2 font-sans text-xs bg-transparent outline-none"
                                style={{ color: '#E8DDD4', border: '1px solid #1A1A1A', borderRadius: 4 }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!noteText.trim()) return;
                                  addBookingNotes.mutate({ id: booking.id, notes: (booking.notes ? `${booking.notes}\n` : '') + noteText.trim() });
                                  setNoteText('');
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-300 hover:bg-[#C4A265] hover:text-[#0A0A0A]"
                                style={{ color: '#C4A265', borderColor: '#C4A265', backgroundColor: 'transparent', cursor: 'pointer' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.55 }}>Status:</span>
                            {(['pending', 'confirmed', 'cancelled'] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateBooking.mutate({ id: booking.id, status })}
                                className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300"
                                style={{ color: booking.status === status ? '#0A0A0A' : '#E8DDD4', borderColor: status === 'confirmed' ? '#6B8F71' : status === 'cancelled' ? '#777777' : '#D14A6E', backgroundColor: booking.status === status ? (status === 'confirmed' ? '#6B8F71' : status === 'cancelled' ? '#777777' : '#D14A6E') : 'transparent', cursor: 'pointer' }}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'commissions' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Commission Requests</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.55 }}>
                {commissions.filter((c) => c.status === 'pending').length} pending
              </span>
            </div>

            {commissionsQuery.isLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.65 }}>Loading...</p>
            ) : commissions.length === 0 ? (
              <div className="text-center py-20">
                <Palette size={40} style={{ color: '#E8DDD4', opacity: 0.2, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.5 }}>No commissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commissions.map((comm) => {
                  const isExpanded = expandedRow === comm.id;
                  return (
                    <article key={comm.id} style={{ border: `1px solid ${comm.status === 'pending' ? '#D14A6E45' : '#1A1A1A'}`, borderRadius: 8, backgroundColor: comm.status === 'pending' ? 'rgba(209, 74, 110, 0.03)' : '#141414', overflow: 'hidden' }}>
                      <button
                        type="button"
                        className="w-full flex items-start justify-between gap-4 text-left"
                        style={{ padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} commission from ${comm.name}`}
                        onClick={() => setExpandedRow(isExpanded ? null : comm.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>{comm.name}</span>
                            <StatusBadge status={comm.status} />
                            <span className="font-sans text-xs uppercase tracking-wider px-2 py-0.5" style={{ backgroundColor: 'rgba(196, 162, 101, 0.15)', color: '#C4A265', borderRadius: 4 }}>{comm.commissionType}</span>
                          </div>
                          <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.6 }}>{comm.email}</p>
                          <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>{comm.description?.slice(0, 120)}{comm.description && comm.description.length > 120 ? '...' : ''}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.5, whiteSpace: 'nowrap' }}>{formatDate(comm.createdAt)}</span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: '#E8DDD4', opacity: 0.65 }} /> : <ChevronDown size={16} style={{ color: '#E8DDD4', opacity: 0.65 }} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #1A1A1A', padding: '20px 24px', backgroundColor: '#0A0A0A' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Full Description</p>
                              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.85, lineHeight: 1.6 }}>{comm.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div><p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Size</p><p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{comm.size || '-'}</p></div>
                              <div><p className="font-sans text-xs uppercase tracking-wider mb-1" style={{ color: '#E8DDD4', opacity: 0.55 }}>Budget</p><p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{comm.budget || '-'}</p></div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: '#E8DDD4', opacity: 0.55 }}>Reference Images</p>
                            <ReferenceImages value={comm.referenceImages} />
                          </div>

                          <div className="mb-6" style={{ backgroundColor: '#141414', borderRadius: 6, padding: 16 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <StickyNote size={14} style={{ color: '#C4A265' }} />
                              <p className="font-sans text-xs uppercase tracking-wider" style={{ color: '#C4A265' }}>Notes</p>
                            </div>
                            <p className="font-sans text-sm mb-3 whitespace-pre-wrap" style={{ color: '#E8DDD4', opacity: 0.85 }}>{comm.notes || 'No notes yet.'}</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                aria-label={`Add note for commission from ${comm.name}`}
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 px-3 py-2 font-sans text-xs bg-transparent outline-none"
                                style={{ color: '#E8DDD4', border: '1px solid #1A1A1A', borderRadius: 4 }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!noteText.trim()) return;
                                  addCommissionNotes.mutate({ id: comm.id, notes: (comm.notes ? `${comm.notes}\n` : '') + noteText.trim() });
                                  setNoteText('');
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-300 hover:bg-[#C4A265] hover:text-[#0A0A0A]"
                                style={{ color: '#C4A265', borderColor: '#C4A265', backgroundColor: 'transparent', cursor: 'pointer' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.55 }}>Status:</span>
                            {(['pending', 'in_progress', 'completed', 'declined'] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateCommission.mutate({ id: comm.id, status })}
                                className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300"
                                style={{ color: comm.status === status ? '#0A0A0A' : '#E8DDD4', borderColor: status === 'completed' ? '#6B8F71' : status === 'declined' ? '#777777' : status === 'in_progress' ? '#C4A265' : '#D14A6E', backgroundColor: comm.status === status ? (status === 'completed' ? '#6B8F71' : status === 'declined' ? '#777777' : status === 'in_progress' ? '#C4A265' : '#D14A6E') : 'transparent', cursor: 'pointer' }}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'monitoring' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Monitoring</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#6B8F71' }}>
                {monitoringQuery.data?.health.status || 'checking'}
              </span>
            </div>

            <div className="mb-6" style={{ border: '1px solid #1A1A1A', borderRadius: 8, padding: 20, backgroundColor: '#141414' }}>
              <p className="font-sans text-xs uppercase tracking-wider mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>API Health</p>
              <p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>
                Last checked: {monitoringQuery.data?.health.checkedAt ? formatDate(monitoringQuery.data.health.checkedAt) : 'Loading...'}
              </p>
            </div>

            <div className="space-y-3">
              {(monitoringQuery.data?.events ?? []).length === 0 ? (
                <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.65 }}>No recent API, form, upload, auth, or uptime events.</p>
              ) : (
                monitoringQuery.data?.events.map((event, index) => (
                  <article key={`${event.createdAt}-${index}`} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <StatusBadge status={event.type.replace('_', ' ')} />
                      <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55 }}>{formatDate(event.createdAt)}</span>
                    </div>
                    <p className="font-sans text-sm" style={{ color: '#E8DDD4', lineHeight: 1.6 }}>{event.message}</p>
                    {event.path && <p className="font-sans text-xs mt-2" style={{ color: '#D14A6E', opacity: 0.85 }}>{event.path}</p>}
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
