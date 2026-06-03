import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trpc } from '@/providers/trpc';
import {
  Mail,
  Calendar,
  Palette,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  StickyNote,
  Eye,
} from 'lucide-react';

type Tab = 'messages' | 'bookings' | 'commissions';

const ADMIN_PASSWORD = 'gaston2026';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unread: '#D14A6E',
    read: '#6B8F71',
    pending: '#D14A6E',
    confirmed: '#6B8F71',
    cancelled: '#666666',
    in_progress: '#C4A265',
    completed: '#6B8F71',
    declined: '#666666',
  };
  const color = colors[status] || '#E8DDD4';
  const icons: Record<string, React.ReactNode> = {
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
      style={{
        color,
        border: `1px solid ${color}`,
        borderRadius: 4,
        opacity: 0.9,
      }}
    >
      {icons[status]}
      {status}
    </span>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('tgc_admin_auth', 'true');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1
            className="font-serif"
            style={{ color: '#E8DDD4', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            Admin Access
          </h1>
          <p className="font-script mt-2" style={{ color: '#F4A5AE', fontSize: 18 }}>
            enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
            style={{
              color: '#E8DDD4',
              borderBottom: `1px solid ${error ? '#D14A6E' : '#1A1A1A'}`,
            }}
            autoFocus
          />
          {error && (
            <p className="font-sans text-xs" style={{ color: '#D14A6E' }}>
              Incorrect password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-3 border transition-all duration-300 hover:bg-[#D14A6E] hover:text-[#0A0A0A] hover:border-[#D14A6E]"
            style={{ color: '#D14A6E', borderColor: '#D14A6E', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            Unlock
          </button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-100"
            style={{ color: '#E8DDD4', opacity: 0.4 }}
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [auth, setAuth] = useState(() => localStorage.getItem('tgc_admin_auth') === 'true');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const utils = trpc.useUtils();

  const { data: messages, isLoading: messagesLoading } = trpc.contact.list.useQuery(undefined, { enabled: auth });
  const { data: bookings, isLoading: bookingsLoading } = trpc.booking.list.useQuery(undefined, { enabled: auth });
  const { data: commissions, isLoading: commissionsLoading } = trpc.commission.list.useQuery(undefined, { enabled: auth });

  const markRead = trpc.contact.markRead.useMutation({ onSuccess: () => utils.contact.list.invalidate() });
  const updateBooking = trpc.booking.updateStatus.useMutation({ onSuccess: () => utils.booking.list.invalidate() });
  const addBookingNotes = trpc.booking.addNotes.useMutation({ onSuccess: () => utils.booking.list.invalidate() });
  const updateCommission = trpc.commission.updateStatus.useMutation({ onSuccess: () => utils.commission.list.invalidate() });
  const addCommissionNotes = trpc.commission.addNotes.useMutation({ onSuccess: () => utils.commission.list.invalidate() });

  useEffect(() => {
    if (auth) {
      document.title = 'Admin — The Gaston Collective';
    }
    return () => { document.title = 'The Gaston Collective'; };
  }, [auth]);

  if (!auth) {
    return <PasswordGate onUnlock={() => setAuth(true)} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'messages', label: 'Messages', icon: <Mail size={16} />, count: messages?.length || 0 },
    { id: 'bookings', label: 'Tattoo Bookings', icon: <Calendar size={16} />, count: bookings?.length || 0 },
    { id: 'commissions', label: 'Commissions', icon: <Palette size={16} />, count: commissions?.length || 0 },
  ];

  const formatDate = (date: Date | string | null) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1A1A1A',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-lg transition-opacity duration-300 hover:opacity-70" style={{ color: '#F4A5AE' }}>
            ← TGC
          </Link>
          <h1 className="font-serif text-base hidden md:block" style={{ color: '#E8DDD4', letterSpacing: '0.1em' }}>
            Admin Dashboard
          </h1>
          <button
            onClick={() => { localStorage.removeItem('tgc_admin_auth'); setAuth(false); }}
            className="font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-opacity duration-300 hover:opacity-100"
            style={{ color: '#E8DDD4', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8">
        <div className="flex items-center gap-2 mb-8" style={{ borderBottom: '1px solid #1A1A1A' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedRow(null); }}
              className="font-sans text-xs uppercase tracking-[0.15em] px-5 py-3 flex items-center gap-2 transition-all duration-300"
              style={{
                color: activeTab === tab.id ? '#D14A6E' : '#E8DDD4',
                opacity: activeTab === tab.id ? 1 : 0.5,
                borderBottom: activeTab === tab.id ? '2px solid #D14A6E' : '2px solid transparent',
                background: 'none',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab.id ? '#D14A6E' : 'transparent',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
              <span
                className="font-sans text-xs px-2 py-0.5"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(209, 74, 110, 0.15)' : 'rgba(232, 221, 212, 0.05)',
                  color: activeTab === tab.id ? '#D14A6E' : '#E8DDD4',
                  borderRadius: 4,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-20">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Contact Messages</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                {messages?.filter((m) => m.read === 'unread').length || 0} unread
              </span>
            </div>

            {messagesLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.5 }}>Loading...</p>
            ) : messages?.length === 0 ? (
              <div className="text-center py-20">
                <Inbox size={40} style={{ color: '#E8DDD4', opacity: 0.15, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.3 }}>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className="transition-all duration-300"
                    style={{
                      border: `1px solid ${msg.read === 'unread' ? '#D14A6E30' : '#1A1A1A'}`,
                      borderRadius: 8,
                      backgroundColor: msg.read === 'unread' ? 'rgba(209, 74, 110, 0.03)' : '#141414',
                      padding: '20px 24px',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                            {msg.name}
                          </span>
                          <StatusBadge status={msg.read} />
                        </div>
                        <p className="font-sans text-xs mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                          {msg.email}
                        </p>
                        <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: '#D14A6E', opacity: 0.7 }}>
                          {msg.subject}
                        </p>
                        <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.8, lineHeight: 1.6 }}>
                          {msg.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.3, whiteSpace: 'nowrap' }}>
                          {formatDate(msg.createdAt)}
                        </span>
                        {msg.read === 'unread' && (
                          <button
                            onClick={() => markRead.mutate({ id: msg.id })}
                            className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300 hover:bg-[#6B8F71] hover:text-[#0A0A0A] hover:border-[#6B8F71] flex items-center gap-1"
                            style={{ color: '#6B8F71', borderColor: '#6B8F71', backgroundColor: 'transparent', cursor: 'pointer' }}
                          >
                            <Eye size={12} /> Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Tattoo Bookings</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                {bookings?.filter((b) => b.status === 'pending').length || 0} pending
              </span>
            </div>

            {bookingsLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.5 }}>Loading...</p>
            ) : bookings?.length === 0 ? (
              <div className="text-center py-20">
                <Calendar size={40} style={{ color: '#E8DDD4', opacity: 0.15, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.3 }}>No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings?.map((booking) => {
                  const isExpanded = expandedRow === booking.id;
                  return (
                    <div
                      key={booking.id}
                      style={{
                        border: `1px solid ${booking.status === 'pending' ? '#D14A6E30' : '#1A1A1A'}`,
                        borderRadius: 8,
                        backgroundColor: booking.status === 'pending' ? 'rgba(209, 74, 110, 0.03)' : '#141414',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="flex items-start justify-between gap-4 cursor-pointer"
                        style={{ padding: '20px 24px' }}
                        onClick={() => setExpandedRow(isExpanded ? null : booking.id!)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                              {booking.name}
                            </span>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                            {booking.email} {booking.phone && `· ${booking.phone}`}
                          </p>
                          <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.7 }}>
                            {booking.description?.slice(0, 120)}{booking.description && booking.description.length > 120 ? '...' : ''}
                          </p>
                          {booking.preferredDates && (
                            <p className="font-sans text-xs mt-2" style={{ color: '#C4A265', opacity: 0.7 }}>
                              Preferred: {booking.preferredDates}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.3, whiteSpace: 'nowrap' }}>
                            {formatDate(booking.createdAt)}
                          </span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: '#E8DDD4', opacity: 0.5 }} /> : <ChevronDown size={16} style={{ color: '#E8DDD4', opacity: 0.5 }} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #1A1A1A', padding: '20px 24px', backgroundColor: '#0A0A0A' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <label className="font-sans text-xs uppercase tracking-wider block mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>Description</label>
                              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.8, lineHeight: 1.6 }}>{booking.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-sans text-xs uppercase tracking-wider block mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>Size</label>
                                <p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.size || '—'}</p>
                              </div>
                              <div>
                                <label className="font-sans text-xs uppercase tracking-wider block mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>Placement</label>
                                <p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.placement || '—'}</p>
                              </div>
                              <div>
                                <label className="font-sans text-xs uppercase tracking-wider block mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>Preferred Dates</label>
                                <p className="font-sans text-sm" style={{ color: '#E8DDD4' }}>{booking.preferredDates || '—'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="mb-6" style={{ backgroundColor: '#141414', borderRadius: 6, padding: 16 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <StickyNote size={14} style={{ color: '#C4A265', opacity: 0.7 }} />
                              <label className="font-sans text-xs uppercase tracking-wider" style={{ color: '#C4A265', opacity: 0.7 }}>Notes</label>
                            </div>
                            <p className="font-sans text-sm mb-3" style={{ color: '#E8DDD4', opacity: 0.8 }}>
                              {booking.notes || 'No notes yet.'}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-3 py-2 font-sans text-xs bg-transparent outline-none"
                                style={{ color: '#E8DDD4', border: '1px solid #1A1A1A', borderRadius: 4 }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!noteText.trim()) return;
                                  addBookingNotes.mutate({ id: booking.id!, notes: (booking.notes ? booking.notes + '\n' : '') + noteText.trim() });
                                  setNoteText('');
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-300 hover:bg-[#C4A265] hover:text-[#0A0A0A] hover:border-[#C4A265]"
                                style={{ color: '#C4A265', borderColor: '#C4A265', backgroundColor: 'transparent', cursor: 'pointer' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Status Actions */}
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.4 }}>Status:</span>
                            {(['pending', 'confirmed', 'cancelled'] as const).map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBooking.mutate({ id: booking.id!, status: s });
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300"
                                style={{
                                  color: booking.status === s ? '#0A0A0A' : '#E8DDD4',
                                  borderColor: s === 'confirmed' ? '#6B8F71' : s === 'cancelled' ? '#666666' : '#D14A6E',
                                  backgroundColor: booking.status === s ? (s === 'confirmed' ? '#6B8F71' : s === 'cancelled' ? '#666666' : '#D14A6E') : 'transparent',
                                  opacity: booking.status === s ? 1 : 0.5,
                                  cursor: 'pointer',
                                }}
                              >
                                {booking.status === s && <Check size={10} className="inline mr-1" />}
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>Commission Requests</h2>
              <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                {commissions?.filter((c) => c.status === 'pending').length || 0} pending
              </span>
            </div>

            {commissionsLoading ? (
              <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.5 }}>Loading...</p>
            ) : commissions?.length === 0 ? (
              <div className="text-center py-20">
                <Palette size={40} style={{ color: '#E8DDD4', opacity: 0.15, margin: '0 auto' }} />
                <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.3 }}>No commissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commissions?.map((comm) => {
                  const isExpanded = expandedRow === comm.id;
                  return (
                    <div
                      key={comm.id}
                      style={{
                        border: `1px solid ${comm.status === 'pending' ? '#D14A6E30' : '#1A1A1A'}`,
                        borderRadius: 8,
                        backgroundColor: comm.status === 'pending' ? 'rgba(209, 74, 110, 0.03)' : '#141414',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="flex items-start justify-between gap-4 cursor-pointer"
                        style={{ padding: '20px 24px' }}
                        onClick={() => setExpandedRow(isExpanded ? null : comm.id!)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                              {comm.name}
                            </span>
                            <StatusBadge status={comm.status} />
                            <span
                              className="font-sans text-xs uppercase tracking-wider px-2 py-0.5"
                              style={{ backgroundColor: 'rgba(196, 162, 101, 0.15)', color: '#C4A265', borderRadius: 4 }}
                            >
                              {comm.commissionType}
                            </span>
                          </div>
                          <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.4 }}>
                            {comm.email}
                          </p>
                          <p className="font-sans text-sm mt-2" style={{ color: '#E8DDD4', opacity: 0.7 }}>
                            {comm.description?.slice(0, 120)}{comm.description && comm.description.length > 120 ? '...' : ''}
                          </p>
                          <div className="flex gap-6 mt-2">
                            {comm.size && (
                              <p className="font-sans text-xs" style={{ color: '#C4A265', opacity: 0.7 }}>
                                Size: {comm.size}
                              </p>
                            )}
                            {comm.budget && (
                              <p className="font-sans text-xs" style={{ color: '#C4A265', opacity: 0.7 }}>
                                Budget: {comm.budget}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.3, whiteSpace: 'nowrap' }}>
                            {formatDate(comm.createdAt)}
                          </span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: '#E8DDD4', opacity: 0.5 }} /> : <ChevronDown size={16} style={{ color: '#E8DDD4', opacity: 0.5 }} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #1A1A1A', padding: '20px 24px', backgroundColor: '#0A0A0A' }}>
                          <div className="mb-6">
                            <label className="font-sans text-xs uppercase tracking-wider block mb-1" style={{ color: '#E8DDD4', opacity: 0.4 }}>Full Description</label>
                            <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.8, lineHeight: 1.6 }}>{comm.description}</p>
                          </div>

                          {/* Notes */}
                          <div className="mb-6" style={{ backgroundColor: '#141414', borderRadius: 6, padding: 16 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <StickyNote size={14} style={{ color: '#C4A265', opacity: 0.7 }} />
                              <label className="font-sans text-xs uppercase tracking-wider" style={{ color: '#C4A265', opacity: 0.7 }}>Notes</label>
                            </div>
                            <p className="font-sans text-sm mb-3" style={{ color: '#E8DDD4', opacity: 0.8 }}>
                              {comm.notes || 'No notes yet.'}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-3 py-2 font-sans text-xs bg-transparent outline-none"
                                style={{ color: '#E8DDD4', border: '1px solid #1A1A1A', borderRadius: 4 }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!noteText.trim()) return;
                                  addCommissionNotes.mutate({ id: comm.id!, notes: (comm.notes ? comm.notes + '\n' : '') + noteText.trim() });
                                  setNoteText('');
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-300 hover:bg-[#C4A265] hover:text-[#0A0A0A] hover:border-[#C4A265]"
                                style={{ color: '#C4A265', borderColor: '#C4A265', backgroundColor: 'transparent', cursor: 'pointer' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Status Actions */}
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-xs uppercase tracking-wider" style={{ color: '#E8DDD4', opacity: 0.4 }}>Status:</span>
                            {(['pending', 'in_progress', 'completed', 'declined'] as const).map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCommission.mutate({ id: comm.id!, status: s });
                                }}
                                className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border transition-all duration-300"
                                style={{
                                  color: comm.status === s ? '#0A0A0A' : '#E8DDD4',
                                  borderColor: s === 'completed' ? '#6B8F71' : s === 'declined' ? '#666666' : s === 'in_progress' ? '#C4A265' : '#D14A6E',
                                  backgroundColor: comm.status === s ? (s === 'completed' ? '#6B8F71' : s === 'declined' ? '#666666' : s === 'in_progress' ? '#C4A265' : '#D14A6E') : 'transparent',
                                  opacity: comm.status === s ? 1 : 0.5,
                                  cursor: 'pointer',
                                }}
                              >
                                {comm.status === s && <Check size={10} className="inline mr-1" />}
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
