import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from './components/CustomCursor';
import { prefersReducedMotion } from './lib/motion';
import {
  getUnderDevelopmentContent,
  UNDER_DEVELOPMENT_DEFAULT_CONTENT,
  type SiteContentItem,
} from './lib/siteContent';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

const HomePage = lazy(() => import('./pages/HomePage'));
const VelvetInkPage = lazy(() => import('./pages/VelvetInkPage'));
const WrittenWordPage = lazy(() => import('./pages/WrittenWordPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnderDevelopmentPage = lazy(() => import('./pages/UnderDevelopmentPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!prefersReducedMotion()) ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

function RouteLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
      <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#7B3B4F' }}>
        Loading
      </span>
    </main>
  );
}

function PublicSiteGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const [checking, setChecking] = useState(true);
  const [underDevelopmentContent, setUnderDevelopmentContent] = useState<SiteContentItem | null>(null);
  const [statusLoadFailed, setStatusLoadFailed] = useState(false);

  useEffect(() => {
    if (isAdminRoute) {
      setChecking(false);
      setUnderDevelopmentContent(null);
      setStatusLoadFailed(false);
      return;
    }

    let active = true;
    setChecking(true);
    setStatusLoadFailed(false);

    getUnderDevelopmentContent()
      .then((content) => {
        if (!active) return;
        setUnderDevelopmentContent(content);
      })
      .catch(() => {
        if (!active) return;
        setUnderDevelopmentContent(null);
        setStatusLoadFailed(true);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [isAdminRoute]);

  if (isAdminRoute) return children;
  if (checking) return <RouteLoading />;
  if (underDevelopmentContent || statusLoadFailed) {
    return <UnderDevelopmentPage content={underDevelopmentContent ?? UNDER_DEVELOPMENT_DEFAULT_CONTENT} />;
  }

  return children;
}

function App() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.08, duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => lenis.destroy();
  }, []);

  return (
    <>
      <CustomCursor />
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <PublicSiteGate>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/velvet-ink" element={<VelvetInkPage />} />
            <Route path="/written-word" element={<WrittenWordPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PublicSiteGate>
      </Suspense>
    </>
  );
}

export default App;
