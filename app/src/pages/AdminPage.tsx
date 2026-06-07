import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  MessageSquareText,
  Palette,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { routeMetadata, usePageMetadata } from '@/lib/seo';
import { supabase } from '@/lib/supabase';

type AdminProfile = {
  id: string;
  is_active: boolean;
  role?: string | null;
  email?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  [key: string]: unknown;
};

type ContactMessage = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type BookingInquiry = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tattoo_idea: string | null;
  placement: string | null;
  size_estimate: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  budget: string | null;
  reference_links: string | null;
  message: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type CommissionInquiry = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  commission_type: string | null;
  description: string | null;
  size_request: string | null;
  budget: string | null;
  deadline: string | null;
  reference_links: string | null;
  status: string | null;
  admin_notes?: string | null;
  created_at: string | null;
};

type DashboardData = {
  messages: ContactMessage[];
  bookings: BookingInquiry[];
  commissions: CommissionInquiry[];
};

type DashboardErrors = Partial<Record<keyof DashboardData, string>>;
type AdminTab = 'overview' | 'messages' | 'bookings' | 'commissions';
type SubmissionKind = keyof DashboardData;
type FilterValue = 'all' | 'pending' | 'contacted' | 'approved' | 'archived';
type ProfileStatus = 'idle' | 'loading' | 'authorized' | 'unauthorized' | 'error';

type ReferenceLink = {
  name: string;
  url: string;
  type?: string;
};

type RecentSubmission = {
  id: string;
  type: 'Message' | 'Tattoo Booking' | 'Commission';
  title: string;
  detail: string;
  status: string | null;
  createdAt: string | null;
};

const emptyDashboardData: DashboardData = {
  messages: [],
  bookings: [],
  commissions: [],
};

const messageStatusOptions = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
];

const inquiryStatusOptions = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const filterOptions = [
  { value: 'all', label: 'Show all' },
  { value: 'pending', label: 'New/pending only' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
] satisfies { value: FilterValue; label: string }[];

function profileTextValue(profile: AdminProfile | null, keys: Array<keyof AdminProfile>) {
  for (const key of keys) {
    const value = profile?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function userDisplayName(user: User | undefined, profile: AdminProfile | null) {
  const profileName = profileTextValue(profile, ['full_name', 'display_name', 'name']);
  if (profileName) return profileName;

  const metadataName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();

  return user?.email || 'Admin';
}

function userEmail(user: User | undefined, profile: AdminProfile | null) {
  return profileTextValue(profile, ['email']) || user?.email || 'No email on file';
}

function roleLabel(profile: AdminProfile | null) {
  return profileTextValue(profile, ['role']) || 'admin';
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '-';
  const text = String(value).trim();
  return text || '-';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normalizeStatus(status: string | null | undefined) {
  return status?.trim().toLowerCase() || '';
}

function isNewMessage(message: ContactMessage) {
  return ['new', 'unread'].includes(normalizeStatus(message.status));
}

function isPending(status: string | null | undefined) {
  return ['new', 'unread', 'pending', 'pending_review'].includes(normalizeStatus(status));
}

function statusLabel(value: string | null | undefined) {
  const normalized = normalizeStatus(value);
  if (!normalized) return '-';
  return normalized
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function matchesFilter(status: string | null | undefined, filter: FilterValue) {
  const normalized = normalizeStatus(status);

  if (filter === 'all') return true;
  if (filter === 'pending') return ['new', 'unread', 'pending', 'pending_review'].includes(normalized);
  if (filter === 'contacted') return ['contacted', 'responded'].includes(normalized);
  if (filter === 'approved') return normalized === 'approved';
  return normalized === 'archived';
}

function editableStatusValue(status: string | null | undefined, options: { value: string }[]) {
  const normalized = normalizeStatus(status);
  const values = new Set(options.map((option) => option.value));

  if (values.has(normalized)) return normalized;
  if (normalized === 'unread' && values.has('new')) return 'new';
  if (normalized === 'pending' && values.has('pending_review')) return 'pending_review';

  return options[0]?.value ?? '';
}

function phoneHref(phone: string | null | undefined) {
  const cleaned = phone?.replace(/[^\d+]/g, '') ?? '';
  return cleaned ? `tel:${cleaned}` : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function referenceFromUnknown(value: unknown, index: number): ReferenceLink | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return { name: `Reference ${index + 1}`, url: trimmed };
  }

  if (!isRecord(value)) return null;

  const rawUrl = value.url ?? value.href ?? value.publicUrl;
  const rawName = value.name ?? value.fileName ?? value.filename;
  const rawType = value.type ?? value.contentType;
  const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!url) return null;

  return {
    name: typeof rawName === 'string' && rawName.trim() ? rawName.trim() : `Reference ${index + 1}`,
    url,
    type: typeof rawType === 'string' ? rawType : undefined,
  };
}

function parseReferenceLinks(value: string | null | undefined): ReferenceLink[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => referenceFromUnknown(item, index))
        .filter((item): item is ReferenceLink => Boolean(item));
    }

    const single = referenceFromUnknown(parsed, 0);
    return single ? [single] : [];
  } catch {
    return value
      .split(',')
      .map((item, index) => referenceFromUnknown(item, index))
      .filter((item): item is ReferenceLink => Boolean(item));
  }
}

function isImageReference(reference: ReferenceLink) {
  const type = reference.type?.toLowerCase() ?? '';
  const url = reference.url.toLowerCase();
  return type.startsWith('image/') || /\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(url);
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-md" style={{ color: '#E8DDD4' }}>
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="font-serif text-lg transition-opacity duration-300 hover:opacity-70"
            style={{ color: '#F4A5AE' }}
          >
            The Gaston Collective
          </Link>
          <h1 className="font-serif mt-6" style={{ fontSize: 30, fontWeight: 600 }}>
            Admin Portal
          </h1>
        </div>
        <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 28 }}>
          {children}
        </div>
      </div>
    </main>
  );
}

function StatusMessage({
  tone,
  children,
}: {
  tone: 'success' | 'error' | 'neutral';
  children: ReactNode;
}) {
  const color = tone === 'success' ? '#6B8F71' : tone === 'error' ? '#D14A6E' : '#E8DDD4';
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : ShieldCheck;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className="font-sans text-sm flex items-start gap-2"
      style={{ color, lineHeight: 1.5 }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <AuthFrame>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="animate-spin" size={26} style={{ color: '#F4A5AE' }} />
        <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#E8DDD4', opacity: 0.78 }}>
          {label}
        </p>
      </div>
    </AuthFrame>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.72 }}>
      <Loader2 className="animate-spin" size={18} style={{ color: '#F4A5AE' }} />
      {label}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div style={{ border: '1px solid #D14A6E55', borderRadius: 8, padding: 18, backgroundColor: 'rgba(209, 74, 110, 0.06)' }}>
      <StatusMessage tone="error">{message}</StatusMessage>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="text-center py-14" style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414' }}>
      <Inbox size={34} style={{ color: '#E8DDD4', opacity: 0.24, margin: '0 auto' }} />
      <p className="font-sans text-sm mt-4" style={{ color: '#E8DDD4', opacity: 0.58 }}>
        {children}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeStatus(status);
  const color =
    normalized === 'unread' || normalized === 'new' || normalized === 'pending' || normalized === 'pending_review'
      ? '#D14A6E'
      : normalized === 'completed' || normalized === 'confirmed' || normalized === 'read' || normalized === 'approved'
        ? '#6B8F71'
        : '#C4A265';

  return (
    <span
      className="inline-flex items-center font-sans text-xs uppercase px-2.5 py-1"
      style={{ color, border: `1px solid ${color}`, borderRadius: 4, letterSpacing: '0.08em' }}
    >
      {statusLabel(status)}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-sans text-xs uppercase mb-1" style={{ color: '#E8DDD4', opacity: 0.52, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <div className="font-sans text-sm break-words whitespace-pre-wrap" style={{ color: '#E8DDD4', lineHeight: 1.55 }}>
        {children || '-'}
      </div>
    </div>
  );
}

function FilterControls({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="font-sans text-xs uppercase px-3 py-2 transition-all duration-300"
          style={{
            color: value === option.value ? '#0A0A0A' : '#E8DDD4',
            backgroundColor: value === option.value ? '#F4A5AE' : 'transparent',
            border: `1px solid ${value === option.value ? '#F4A5AE' : '#2A2A2A'}`,
            borderRadius: 6,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function AdminEditFields({
  status,
  adminNotes,
  statusOptions,
  onSave,
}: {
  status: string | null | undefined;
  adminNotes: string | null | undefined;
  statusOptions: { value: string; label: string }[];
  onSave: (input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const selectedStatusValue = editableStatusValue(status, statusOptions);
  const [selectedStatus, setSelectedStatus] = useState(selectedStatusValue);
  const [notes, setNotes] = useState(adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setSelectedStatus(selectedStatusValue);
    setNotes(adminNotes ?? '');
  }, [adminNotes, selectedStatusValue]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      await onSave({ status: selectedStatus, adminNotes: notes });
      setSaveSuccess('Saved.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 pt-5" style={{ borderTop: '1px solid #1A1A1A' }}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_1fr] gap-4">
        <div>
          <label className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.62, letterSpacing: '0.1em' }}>
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full font-sans text-sm px-3 py-3 outline-none"
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6 }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-sans text-xs uppercase mb-2 block" style={{ color: '#E8DDD4', opacity: 0.62, letterSpacing: '0.1em' }}>
            Admin notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full font-sans text-sm px-3 py-3 resize-y outline-none"
            placeholder="Add a private note..."
            style={{ color: '#E8DDD4', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 6, lineHeight: 1.55 }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="font-sans text-xs uppercase px-4 py-2.5 flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#0A0A0A',
            backgroundColor: '#F4A5AE',
            border: '1px solid #F4A5AE',
            borderRadius: 6,
            cursor: saving ? 'wait' : 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
          {saving ? 'Saving' : 'Save'}
        </button>
        {saveSuccess && <StatusMessage tone="success">{saveSuccess}</StatusMessage>}
        {saveError && <StatusMessage tone="error">{saveError}</StatusMessage>}
      </div>
    </div>
  );
}

function ContactLinks({ email, phone }: { email: string | null | undefined; phone?: string | null }) {
  const cleanEmail = email?.trim();
  const cleanPhone = phone?.trim();
  const tel = phoneHref(cleanPhone);

  return (
    <div className="flex flex-wrap gap-2">
      {cleanEmail && (
        <a
          href={`mailto:${cleanEmail}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs"
          style={{ color: '#F4A5AE', textDecoration: 'none' }}
        >
          <Mail size={13} />
          {cleanEmail}
        </a>
      )}
      {cleanPhone && tel && (
        <a
          href={tel}
          className="inline-flex items-center gap-1.5 font-sans text-xs"
          style={{ color: '#C4A265', textDecoration: 'none' }}
        >
          <Phone size={13} />
          {cleanPhone}
        </a>
      )}
    </div>
  );
}

function ReferenceLinks({ value }: { value: string | null | undefined }) {
  const references = parseReferenceLinks(value);

  if (references.length === 0) {
    return (
      <p className="font-sans text-sm" style={{ color: '#E8DDD4', opacity: 0.58 }}>
        No reference links.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {references.map((reference, index) => (
        <a
          key={`${reference.url}-${index}`}
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
          style={{ color: '#E8DDD4', textDecoration: 'none' }}
        >
          {isImageReference(reference) ? (
            <span className="block" style={{ width: 92 }}>
              <img
                src={reference.url}
                alt={reference.name}
                loading="lazy"
                className="object-cover"
                style={{ width: 92, height: 92, border: '1px solid #2A2A2A', borderRadius: 6, backgroundColor: '#0A0A0A' }}
              />
              <span className="font-sans text-xs mt-2 flex items-center gap-1 break-words" style={{ color: '#F4A5AE' }}>
                {reference.name}
                <ExternalLink size={11} />
              </span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-2 font-sans text-xs px-3 py-2"
              style={{ border: '1px solid #2A2A2A', borderRadius: 6, color: '#F4A5AE' }}
            >
              {reference.name}
              <ExternalLink size={12} />
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Unable to sign in. Please check the email and password.');
      setLoading(false);
      return;
    }

    setPassword('');
    setSuccess('Signed in. Checking admin access...');
  };

  return (
    <AuthFrame>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="admin-email" className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.75, letterSpacing: '0.12em' }}>
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
            style={{ color: '#E8DDD4', border: '1px solid #2A2A2A', borderRadius: 6 }}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.75, letterSpacing: '0.12em' }}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full px-4 py-3 font-sans text-sm bg-transparent outline-none"
            style={{ color: '#E8DDD4', border: '1px solid #2A2A2A', borderRadius: 6 }}
            required
          />
        </div>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {success && <StatusMessage tone="success">{success}</StatusMessage>}

        <button
          type="submit"
          disabled={loading}
          className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#0A0A0A',
            backgroundColor: '#F4A5AE',
            border: '1px solid #F4A5AE',
            borderRadius: 6,
            cursor: loading ? 'wait' : 'pointer',
            letterSpacing: '0.12em',
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={15} /> : <LogIn size={15} />}
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-7">
        <Link className="font-sans text-xs uppercase" to="/" style={{ color: '#E8DDD4', opacity: 0.65, letterSpacing: '0.12em' }}>
          Back to site
        </Link>
      </div>
    </AuthFrame>
  );
}

function UnauthorizedState({
  session,
  profile,
  onLogout,
  logoutLoading,
  logoutError,
}: {
  session: Session;
  profile: AdminProfile | null;
  onLogout: () => void;
  logoutLoading: boolean;
  logoutError: string;
}) {
  return (
    <AuthFrame>
      <div className="flex flex-col gap-6">
        <StatusMessage tone="error">
          This account is signed in, but it is not an active admin account.
        </StatusMessage>

        <div className="grid gap-2 font-sans text-sm" style={{ color: '#E8DDD4' }}>
          <p>
            <span style={{ opacity: 0.62 }}>Email:</span> {userEmail(session.user, profile)}
          </p>
          <p>
            <span style={{ opacity: 0.62 }}>Status:</span> Not authorized
          </p>
        </div>

        {logoutError && <StatusMessage tone="error">{logoutError}</StatusMessage>}

        <button
          type="button"
          onClick={onLogout}
          disabled={logoutLoading}
          className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#E8DDD4',
            backgroundColor: 'transparent',
            border: '1px solid #D14A6E',
            borderRadius: 6,
            cursor: logoutLoading ? 'wait' : 'pointer',
            letterSpacing: '0.12em',
          }}
        >
          {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
          Log out
        </button>
      </div>
    </AuthFrame>
  );
}

function OverviewSection({ data, loading, errors }: { data: DashboardData; loading: boolean; errors: DashboardErrors }) {
  const recentSubmissions = useMemo<RecentSubmission[]>(() => {
    const messages = data.messages.map((message) => ({
      id: `message-${message.id}`,
      type: 'Message' as const,
      title: displayValue(message.name),
      detail: displayValue(message.subject || message.message),
      status: message.status,
      createdAt: message.created_at,
    }));

    const bookings = data.bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      type: 'Tattoo Booking' as const,
      title: displayValue(booking.name),
      detail: displayValue(booking.tattoo_idea),
      status: booking.status,
      createdAt: booking.created_at,
    }));

    const commissions = data.commissions.map((commission) => ({
      id: `commission-${commission.id}`,
      type: 'Commission' as const,
      title: displayValue(commission.name),
      detail: displayValue(commission.commission_type || commission.description),
      status: commission.status,
      createdAt: commission.created_at,
    }));

    return [...messages, ...bookings, ...commissions]
      .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
      .slice(0, 5);
  }, [data]);

  const summaryCards = [
    {
      label: 'New messages',
      value: data.messages.filter(isNewMessage).length,
      icon: <Mail size={20} />,
      color: '#F4A5AE',
    },
    {
      label: 'Pending tattoo bookings',
      value: data.bookings.filter((booking) => isPending(booking.status)).length,
      icon: <Calendar size={20} />,
      color: '#C4A265',
    },
    {
      label: 'Pending commissions',
      value: data.commissions.filter((commission) => isPending(commission.status)).length,
      icon: <Palette size={20} />,
      color: '#6B8F71',
    },
  ];

  if (loading) return <InlineLoading label="Loading dashboard overview" />;

  return (
    <div className="flex flex-col gap-8">
      {Object.keys(errors).length > 0 && (
        <ErrorPanel message="Some dashboard data could not be loaded. Check the section tabs for details, then try Refresh." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <article key={card.label} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs uppercase" style={{ color: '#E8DDD4', opacity: 0.58, letterSpacing: '0.1em' }}>
                  {card.label}
                </p>
                <p className="font-serif mt-3" style={{ color: '#E8DDD4', fontSize: 32, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 6, color: card.color, backgroundColor: `${card.color}18` }}>
                {card.icon}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} style={{ color: '#F4A5AE' }} />
          <h2 className="font-serif text-xl" style={{ color: '#E8DDD4', fontWeight: 600 }}>
            Recent Submissions
          </h2>
        </div>

        {recentSubmissions.length === 0 ? (
          <EmptyState>No submissions yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <article
                key={submission.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.1em' }}>
                      {submission.type}
                    </span>
                    <StatusBadge status={submission.status} />
                  </div>
                  <p className="font-serif text-base" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                    {submission.title}
                  </p>
                  <p className="font-sans text-sm mt-1 break-words" style={{ color: '#E8DDD4', opacity: 0.68 }}>
                    {submission.detail}
                  </p>
                </div>
                <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
                  {formatDate(submission.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MessagesSection({
  messages,
  loading,
  error,
  onSave,
}: {
  messages: ContactMessage[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredMessages = messages.filter((message) => matchesFilter(message.status, filter));

  if (loading) return <InlineLoading label="Loading contact messages" />;
  if (error) return <ErrorPanel message={error} />;
  if (messages.length === 0) return <EmptyState>No messages yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredMessages.length === 0 && <EmptyState>No messages match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredMessages.map((message) => (
        <article key={message.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(message.name)}
                </h2>
                <StatusBadge status={message.status} />
              </div>
              <ContactLinks email={message.email} phone={message.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(message.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {message.subject && <Field label="Subject">{message.subject}</Field>}
            <Field label="Message">{displayValue(message.message)}</Field>
          </div>
          <AdminEditFields
            status={message.status}
            adminNotes={message.admin_notes}
            statusOptions={messageStatusOptions}
            onSave={(input) => onSave(message.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function BookingSection({
  bookings,
  loading,
  error,
  onSave,
}: {
  bookings: BookingInquiry[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredBookings = bookings.filter((booking) => matchesFilter(booking.status, filter));

  if (loading) return <InlineLoading label="Loading tattoo booking inquiries" />;
  if (error) return <ErrorPanel message={error} />;
  if (bookings.length === 0) return <EmptyState>No tattoo booking inquiries yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredBookings.length === 0 && <EmptyState>No tattoo booking inquiries match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredBookings.map((booking) => (
        <article key={booking.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(booking.name)}
                </h2>
                <StatusBadge status={booking.status} />
              </div>
              <ContactLinks email={booking.email} phone={booking.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(booking.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Tattoo idea">{displayValue(booking.tattoo_idea)}</Field>
            <Field label="Placement">{displayValue(booking.placement)}</Field>
            <Field label="Size estimate">{displayValue(booking.size_estimate)}</Field>
            <Field label="Preferred date">{displayValue(booking.preferred_date)}</Field>
            <Field label="Preferred time">{displayValue(booking.preferred_time)}</Field>
            <Field label="Budget">{displayValue(booking.budget)}</Field>
            <Field label="Message">{displayValue(booking.message)}</Field>
            <Field label="Reference links">
              <ReferenceLinks value={booking.reference_links} />
            </Field>
          </div>
          <AdminEditFields
            status={booking.status}
            adminNotes={booking.admin_notes}
            statusOptions={inquiryStatusOptions}
            onSave={(input) => onSave(booking.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function CommissionsSection({
  commissions,
  loading,
  error,
  onSave,
}: {
  commissions: CommissionInquiry[];
  loading: boolean;
  error?: string;
  onSave: (id: number | string, input: { status: string; adminNotes: string }) => Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const filteredCommissions = commissions.filter((commission) => matchesFilter(commission.status, filter));

  if (loading) return <InlineLoading label="Loading commission requests" />;
  if (error) return <ErrorPanel message={error} />;
  if (commissions.length === 0) return <EmptyState>No commission requests yet.</EmptyState>;

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {filteredCommissions.length === 0 && <EmptyState>No commission requests match this filter.</EmptyState>}
      <div className="space-y-4">
      {filteredCommissions.map((commission) => (
        <article key={commission.id} style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-serif text-lg" style={{ color: '#E8DDD4', fontWeight: 600 }}>
                  {displayValue(commission.name)}
                </h2>
                <StatusBadge status={commission.status} />
              </div>
              <ContactLinks email={commission.email} phone={commission.phone} />
            </div>
            <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.55, whiteSpace: 'nowrap' }}>
              {formatDate(commission.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Commission type">{displayValue(commission.commission_type)}</Field>
            <Field label="Description">{displayValue(commission.description)}</Field>
            <Field label="Size request">{displayValue(commission.size_request)}</Field>
            <Field label="Budget">{displayValue(commission.budget)}</Field>
            <Field label="Deadline">{displayValue(commission.deadline)}</Field>
            <Field label="Reference links">
              <ReferenceLinks value={commission.reference_links} />
            </Field>
          </div>
          <AdminEditFields
            status={commission.status}
            adminNotes={commission.admin_notes}
            statusOptions={inquiryStatusOptions}
            onSave={(input) => onSave(commission.id, input)}
          />
        </article>
      ))}
      </div>
    </div>
  );
}

function AdminPortal({
  session,
  profile,
  onLogout,
  logoutLoading,
  logoutError,
}: {
  session: Session;
  profile: AdminProfile;
  onLogout: () => void;
  logoutLoading: boolean;
  logoutError: string;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  const [dashboardErrors, setDashboardErrors] = useState<DashboardErrors>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const adminName = userDisplayName(session.user, profile);
  const adminEmail = userEmail(session.user, profile);
  const adminRole = roleLabel(profile);

  const loadDashboardData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
      setRefreshNotice('');
    } else {
      setDashboardLoading(true);
    }

    const [messagesResult, bookingsResult, commissionsResult] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('booking_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('commission_inquiries').select('*').order('created_at', { ascending: false }),
    ]);

    const nextErrors: DashboardErrors = {};
    if (messagesResult.error) nextErrors.messages = `Unable to load messages: ${messagesResult.error.message}`;
    if (bookingsResult.error) nextErrors.bookings = `Unable to load tattoo bookings: ${bookingsResult.error.message}`;
    if (commissionsResult.error) nextErrors.commissions = `Unable to load commission requests: ${commissionsResult.error.message}`;

    setDashboardData((current) => ({
      messages: messagesResult.error ? current.messages : ((messagesResult.data ?? []) as ContactMessage[]),
      bookings: bookingsResult.error ? current.bookings : ((bookingsResult.data ?? []) as BookingInquiry[]),
      commissions: commissionsResult.error ? current.commissions : ((commissionsResult.data ?? []) as CommissionInquiry[]),
    }));
    setDashboardErrors(nextErrors);
    setDashboardLoading(false);
    setRefreshing(false);

    if (Object.keys(nextErrors).length === 0) {
      setLastUpdated(new Date());
      setRefreshNotice(refresh ? 'Dashboard refreshed.' : '');
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const updateSubmission = useCallback(
    async (kind: SubmissionKind, id: number | string, input: { status: string; adminNotes: string }) => {
      const tableByKind: Record<SubmissionKind, string> = {
        messages: 'contact_messages',
        bookings: 'booking_inquiries',
        commissions: 'commission_inquiries',
      };

      const { data, error } = await supabase
        .from(tableByKind[kind])
        .update({
          status: input.status,
          admin_notes: input.adminNotes.trim() || null,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message || 'Could not save changes.');
      }

      if (!data) {
        throw new Error('Could not save changes for this submission.');
      }

      setDashboardData((current) => ({
        ...current,
        [kind]: current[kind].map((item) => (item.id === id ? data : item)),
      }) as DashboardData);
    },
    [],
  );

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: <MessageSquareText size={16} />,
      count: dataCount(dashboardData),
    },
    {
      id: 'messages' as const,
      label: 'Messages',
      icon: <Mail size={16} />,
      count: dashboardData.messages.length,
    },
    {
      id: 'bookings' as const,
      label: 'Tattoo Bookings',
      icon: <Calendar size={16} />,
      count: dashboardData.bookings.length,
    },
    {
      id: 'commissions' as const,
      label: 'Commission Requests',
      icon: <Palette size={16} />,
      count: dashboardData.commissions.length,
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A', color: '#E8DDD4' }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A1A' }}
      >
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-serif text-lg transition-opacity duration-300 hover:opacity-70" style={{ color: '#F4A5AE' }}>
              TGC
            </Link>
            <button
              type="button"
              onClick={onLogout}
              disabled={logoutLoading}
              className="font-sans text-xs uppercase flex items-center gap-2 transition-opacity duration-300 hover:opacity-100 disabled:opacity-50"
              style={{ color: '#E8DDD4', opacity: 0.78, background: 'none', border: 'none', cursor: logoutLoading ? 'wait' : 'pointer', letterSpacing: '0.12em' }}
            >
              {logoutLoading ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-[1180px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <p className="font-sans text-xs uppercase" style={{ color: '#6B8F71', letterSpacing: '0.14em' }}>
                Access confirmed
              </p>
              <h1 className="font-serif mt-3" style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 600 }}>
                Admin Dashboard
              </h1>
              <p className="font-sans text-sm mt-3" style={{ color: '#E8DDD4', opacity: 0.64, lineHeight: 1.6 }}>
                View incoming messages, tattoo booking inquiries, and commission requests.
              </p>
            </div>

            <div className="w-full lg:max-w-md" style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 18 }}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 6, backgroundColor: 'rgba(244, 165, 174, 0.12)', color: '#F4A5AE' }}>
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg" style={{ lineHeight: 1.2 }}>
                    {adminName}
                  </p>
                  <p className="font-sans text-sm mt-1 break-words" style={{ opacity: 0.68 }}>
                    {adminEmail}
                  </p>
                  <p className="font-sans text-xs uppercase mt-3" style={{ color: '#F4A5AE', letterSpacing: '0.12em' }}>
                    {adminRole}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {logoutError && <StatusMessage tone="error">{logoutError}</StatusMessage>}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ borderBottom: '1px solid #1A1A1A' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="font-sans text-xs uppercase px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-all duration-300"
                    style={{
                      color: activeTab === tab.id ? '#F4A5AE' : '#E8DDD4',
                      opacity: activeTab === tab.id ? 1 : 0.68,
                      borderBottom: activeTab === tab.id ? '2px solid #F4A5AE' : '2px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer',
                      marginBottom: -1,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                    <span style={{ color: '#E8DDD4', opacity: 0.62 }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {refreshNotice && <StatusMessage tone="success">{refreshNotice}</StatusMessage>}
                {lastUpdated && (
                  <p className="font-sans text-xs" style={{ color: '#E8DDD4', opacity: 0.52 }}>
                    Updated {formatDate(lastUpdated.toISOString())}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => void loadDashboardData(true)}
                  disabled={dashboardLoading || refreshing}
                  className="font-sans text-xs uppercase px-4 py-2.5 flex items-center gap-2 transition-all duration-300 disabled:opacity-60"
                  style={{
                    color: '#E8DDD4',
                    backgroundColor: 'transparent',
                    border: '1px solid #2A2A2A',
                    borderRadius: 6,
                    cursor: dashboardLoading || refreshing ? 'wait' : 'pointer',
                    letterSpacing: '0.1em',
                  }}
                >
                  <RefreshCw className={refreshing ? 'animate-spin' : ''} size={14} />
                  Refresh
                </button>
              </div>
            </div>

            <div>
              {activeTab === 'overview' && (
                <OverviewSection data={dashboardData} loading={dashboardLoading} errors={dashboardErrors} />
              )}
              {activeTab === 'messages' && (
                <MessagesSection
                  messages={dashboardData.messages}
                  loading={dashboardLoading}
                  error={dashboardErrors.messages}
                  onSave={(id, input) => updateSubmission('messages', id, input)}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingSection
                  bookings={dashboardData.bookings}
                  loading={dashboardLoading}
                  error={dashboardErrors.bookings}
                  onSave={(id, input) => updateSubmission('bookings', id, input)}
                />
              )}
              {activeTab === 'commissions' && (
                <CommissionsSection
                  commissions={dashboardData.commissions}
                  loading={dashboardLoading}
                  error={dashboardErrors.commissions}
                  onSave={(id, input) => updateSubmission('commissions', id, input)}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function dataCount(data: DashboardData) {
  return data.messages.length + data.bookings.length + data.commissions.length;
}

export default function AdminPage() {
  usePageMetadata(routeMetadata.admin);

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle');
  const [profileError, setProfileError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(null);
      setProfileError('');
      setProfileStatus(nextSession ? 'loading' : 'idle');
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      setProfileStatus('idle');
      setProfileError('');
      return;
    }

    let active = true;
    const userId = session.user.id;

    async function loadAdminProfile() {
      setProfileStatus('loading');
      setProfileError('');

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setProfile(null);
        setProfileError(error.message || 'Unable to check admin access.');
        setProfileStatus('error');
        return;
      }

      const nextProfile = data as AdminProfile | null;
      const activeAdmin = nextProfile?.id === userId && nextProfile.is_active === true;

      setProfile(nextProfile);
      setProfileStatus(activeAdmin ? 'authorized' : 'unauthorized');
    }

    void loadAdminProfile();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const handleLogout = async () => {
    setLogoutError('');
    setLogoutLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError(error.message || 'Unable to log out. Please try again.');
      setLogoutLoading(false);
      return;
    }

    setProfile(null);
    setSession(null);
    setProfileStatus('idle');
    setLogoutLoading(false);
  };

  const profileErrorMessage = useMemo(() => {
    if (!profileError) return '';
    return `Unable to check admin access: ${profileError}`;
  }, [profileError]);

  if (authLoading) return <LoadingState label="Checking session" />;
  if (!session) return <AdminLoginForm />;
  if (profileStatus === 'loading' || profileStatus === 'idle') return <LoadingState label="Checking admin access" />;

  if (profileStatus === 'error') {
    return (
      <AuthFrame>
        <div className="flex flex-col gap-6">
          <StatusMessage tone="error">{profileErrorMessage || 'Unable to check admin access.'}</StatusMessage>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="font-sans text-xs uppercase px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{
              color: '#E8DDD4',
              backgroundColor: 'transparent',
              border: '1px solid #D14A6E',
              borderRadius: 6,
              cursor: logoutLoading ? 'wait' : 'pointer',
              letterSpacing: '0.12em',
            }}
          >
            {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
            Log out
          </button>
        </div>
      </AuthFrame>
    );
  }

  if (profileStatus === 'unauthorized' || !profile) {
    return (
      <UnauthorizedState
        session={session}
        profile={profile}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        logoutError={logoutError}
      />
    );
  }

  return (
    <AdminPortal
      session={session}
      profile={profile}
      onLogout={handleLogout}
      logoutLoading={logoutLoading}
      logoutError={logoutError}
    />
  );
}
