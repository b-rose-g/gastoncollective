import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
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

type ProfileStatus = 'idle' | 'loading' | 'authorized' | 'unauthorized' | 'error';

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
          <label htmlFor="admin-email" className="font-sans text-xs uppercase tracking-[0.16em]" style={{ color: '#E8DDD4', opacity: 0.75 }}>
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
          <label htmlFor="admin-password" className="font-sans text-xs uppercase tracking-[0.16em]" style={{ color: '#E8DDD4', opacity: 0.75 }}>
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
          className="font-sans text-xs uppercase tracking-[0.16em] px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#0A0A0A',
            backgroundColor: '#F4A5AE',
            border: '1px solid #F4A5AE',
            borderRadius: 6,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={15} /> : <LogIn size={15} />}
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-7">
        <Link className="font-sans text-xs uppercase tracking-[0.15em]" to="/" style={{ color: '#E8DDD4', opacity: 0.65 }}>
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
          className="font-sans text-xs uppercase tracking-[0.16em] px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
          style={{
            color: '#E8DDD4',
            backgroundColor: 'transparent',
            border: '1px solid #D14A6E',
            borderRadius: 6,
            cursor: logoutLoading ? 'wait' : 'pointer',
          }}
        >
          {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
          Log out
        </button>
      </div>
    </AuthFrame>
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
  const adminName = userDisplayName(session.user, profile);
  const adminEmail = userEmail(session.user, profile);
  const adminRole = roleLabel(profile);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A', color: '#E8DDD4' }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A1A' }}
      >
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 flex items-center justify-between gap-4 min-h-16 py-3">
          <Link to="/" className="font-serif text-lg transition-opacity duration-300 hover:opacity-70" style={{ color: '#F4A5AE' }}>
            TGC
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={logoutLoading}
            className="font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-opacity duration-300 hover:opacity-100 disabled:opacity-50"
            style={{ color: '#E8DDD4', opacity: 0.78, background: 'none', border: 'none', cursor: logoutLoading ? 'wait' : 'pointer' }}
          >
            {logoutLoading ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
            Log out
          </button>
        </div>
      </header>

      <section className="max-w-[1120px] mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: '#6B8F71' }}>
                Access confirmed
              </p>
              <h1 className="font-serif mt-3" style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 600 }}>
                Admin Portal
              </h1>
            </div>

            <div className="w-full md:max-w-sm" style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
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
                  <p className="font-sans text-xs uppercase tracking-[0.16em] mt-3" style={{ color: '#F4A5AE' }}>
                    {adminRole}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {logoutError && <StatusMessage tone="error">{logoutError}</StatusMessage>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
              <ShieldCheck size={22} style={{ color: '#6B8F71' }} />
              <h2 className="font-serif text-lg mt-4" style={{ fontWeight: 600 }}>
                Secure Login
              </h2>
              <p className="font-sans text-sm mt-2" style={{ opacity: 0.68, lineHeight: 1.6 }}>
                Supabase Auth email and password are active for this route.
              </p>
            </div>

            <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
              <CheckCircle2 size={22} style={{ color: '#6B8F71' }} />
              <h2 className="font-serif text-lg mt-4" style={{ fontWeight: 600 }}>
                Admin Check
              </h2>
              <p className="font-sans text-sm mt-2" style={{ opacity: 0.68, lineHeight: 1.6 }}>
                Your active profile in admin_profiles is verified through RLS.
              </p>
            </div>

            <div style={{ border: '1px solid #1A1A1A', borderRadius: 8, backgroundColor: '#141414', padding: 20 }}>
              <UserRound size={22} style={{ color: '#F4A5AE' }} />
              <h2 className="font-serif text-lg mt-4" style={{ fontWeight: 600 }}>
                Phase 1
              </h2>
              <p className="font-sans text-sm mt-2" style={{ opacity: 0.68, lineHeight: 1.6 }}>
                Access control is ready for the next admin tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
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
            className="font-sans text-xs uppercase tracking-[0.16em] px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
            style={{
              color: '#E8DDD4',
              backgroundColor: 'transparent',
              border: '1px solid #D14A6E',
              borderRadius: 6,
              cursor: logoutLoading ? 'wait' : 'pointer',
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
