import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail } from 'lucide-react';
import { prefersReducedMotion, revealImmediately, scrollBehavior } from '@/lib/motion';
import { getGalleryItemsByLocation, type GalleryItem } from '@/lib/gallery';

gsap.registerPlugin(ScrollTrigger);

type PublicationStatus = 'available' | 'coming_soon';

type FeaturedBook = {
  title: string;
  author: string;
  publication_status: PublicationStatus;
  button_url?: string;
  external_url?: string;
};

const featuredBook: FeaturedBook = {
  title: 'Reach For The Stars',
  author: 'Kimberlin Gaston',
  publication_status: 'available',
  button_url: '',
  external_url: '',
};

const bookCheckoutEnabled = import.meta.env.VITE_ENABLE_BOOK_CHECKOUT === 'true';
const requestCopyEmail = 'mailto:hello@gastoncollective.com?subject=Reach%20For%20The%20Stars%20Copy%20Request';

export default function WrittenBooks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const action = useMemo(() => getBookAction(), []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, contentRef.current]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadGalleryItems() {
      try {
        const items = await getGalleryItemsByLocation('written_word');
        if (active) setGalleryItems(items);
      } catch {
        if (active) setGalleryItems([]);
      }
    }

    void loadGalleryItems();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="books"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#F2EDE6' }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-32 md:py-40">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span
            className="font-sans text-xs uppercase tracking-[0.2em] block mb-4"
            style={{ color: '#A67B5B', opacity: 0.7 }}
          >
            Available Now
          </span>
          <h2
            className="font-serif"
            style={{
              color: '#3B2317',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            THE <span style={{ color: '#A67B5B' }}>BOOK</span>
          </h2>
        </div>

        {/* Single Book Showcase */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center opacity-0"
        >
          {/* Book Cover */}
          <div
            className="relative mx-auto md:mx-0 transition-all duration-500"
            style={{
              maxWidth: 380,
              boxShadow: isHovered
                ? '0 0 60px rgba(166, 123, 91, 0.2)'
                : '0 16px 48px rgba(59, 35, 23, 0.15)',
              transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
              <img
                src="/images/book_reach_for_the_stars.png"
                alt="Reach For The Stars - Intro To Mental Health Workbook by Kimberlin Gaston"
                width={441}
                height={628}
                decoding="async"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover overlay with book request button */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-400"
                style={{
                  backgroundColor: 'rgba(59, 35, 23, 0.5)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <BookAction action={action} compact />
              </div>
            </div>

            {/* Offset accent border */}
            <div
              className="absolute inset-0 pointer-events-none transition-transform duration-500"
              style={{
                border: '1px solid rgba(166, 123, 91, 0.25)',
                transform: isHovered
                  ? 'translate(6px, 6px)'
                  : 'translate(10px, 10px)',
              }}
            />
          </div>

          {/* Book Info */}
          <div className="flex flex-col gap-6">
            <span
              className="font-sans text-xs uppercase tracking-[0.15em]"
              style={{ color: '#A67B5B', opacity: 0.7 }}
            >
              Mental Health Workbook
            </span>

            <h3
              className="font-serif"
              style={{
                color: '#3B2317',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              {featuredBook.title}
            </h3>

            <p
              className="font-script"
              style={{
                color: '#8B7355',
                fontSize: 'clamp(20px, 2.5vw, 26px)',
                lineHeight: 1.3,
              }}
            >
              by {featuredBook.author}
            </p>

            <div
              className="origin-left"
              style={{
                width: 60,
                height: 1,
                backgroundColor: '#A67B5B',
                opacity: 0.4,
              }}
            />

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              Reach for the Stars is more than just a workbook—it's a guided journey through healing, creativity, and self-discovery. Designed to support mental wellness in a gentle, engaging way, this unique book combines powerful prompts, reflection exercises, and hand-drawn coloring pages to help you slow down, express yourself, and reconnect with your inner strength.
            </p>

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              Whether you're navigating anxiety, burnout, self-doubt, or simply seeking a moment of peace, Reach for the Stars offers a safe space to explore your thoughts and feelings. Each section is thoughtfully created to encourage mindfulness, build emotional resilience, and spark joy—while the whimsical, original artwork invites you to relax and color your way through the process.
            </p>

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              This book is perfect for anyone who wants to take care of their mind and soul in a creative, approachable way. Wherever you are in your journey, you deserve to reach for the stars—and this book is here to help you every step of the way.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <BookAction action={action} />
              {action.kind === 'request' && (
                <p className="font-sans text-sm" style={{ color: '#6B5B4E', lineHeight: 1.6 }}>
                  Online checkout is coming soon. Please reach out to request a copy.
                </p>
              )}
            </div>
          </div>
        </div>

        {galleryItems.length > 0 && (
          <div className="mt-20">
            <h3 className="font-serif text-center mb-8" style={{ color: '#3B2317', fontSize: 30, fontWeight: 600 }}>
              Written Word Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map((item) => (
                <article key={item.id} style={{ border: '1px solid rgba(166, 123, 91, 0.22)', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FAF8F4' }}>
                  <div style={{ aspectRatio: '4 / 3', backgroundColor: '#E4D8CC' }}>
                    <img
                      src={item.image_url ?? ''}
                      alt={item.alt_text || item.title || 'Written Word gallery image'}
                      className="w-full h-full object-cover"
                      decoding="async"
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: 16 }}>
                    <p className="font-serif text-lg" style={{ color: '#3B2317', fontWeight: 600 }}>{item.title || 'Gallery Item'}</p>
                    {item.description && (
                      <p className="font-sans text-sm mt-2" style={{ color: '#5A4D42', lineHeight: 1.55 }}>{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

    </section>
  );
}

type BookActionState =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'request'; label: string }
  | { kind: 'disabled'; label: string };

function getBookAction(): BookActionState {
  const href = featuredBook.button_url || featuredBook.external_url;
  if (href) return { kind: 'link', label: 'Purchase Now', href };
  if (featuredBook.publication_status === 'coming_soon') return { kind: 'disabled', label: 'Coming Soon' };
  if (bookCheckoutEnabled) return { kind: 'request', label: 'Request Copy' };
  return { kind: 'request', label: 'Request Copy' };
}

function BookAction({ action, compact = false }: { action: BookActionState; compact?: boolean }) {
  const className = compact
    ? 'font-sans text-xs uppercase tracking-[0.2em] px-8 py-4 border inline-flex items-center gap-3 transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FAF8F4] hover:border-[#A67B5B]'
    : 'inline-flex items-center gap-3 font-sans text-xs uppercase tracking-[0.2em] px-10 py-4 border transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FAF8F4] hover:border-[#A67B5B]';
  const style = compact
    ? { color: '#A67B5B', borderColor: '#A67B5B', backgroundColor: 'rgba(250, 248, 244, 0.94)' }
    : { color: '#A67B5B', borderColor: '#A67B5B', width: 'fit-content', backgroundColor: 'transparent' };

  if (action.kind === 'link') {
    return (
      <a href={action.href} className={className} style={{ ...style, textDecoration: 'none' }} data-cursor-hover>
        {action.label}
      </a>
    );
  }

  if (action.kind === 'disabled') {
    return (
      <button type="button" disabled className={className} style={{ ...style, cursor: 'not-allowed', opacity: 0.62 }} data-cursor-hover>
        {action.label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={requestCopy}
      className={className}
      style={{ ...style, cursor: 'pointer' }}
      data-cursor-hover
    >
      {action.label}
      <Mail size={14} />
    </button>
  );
}

function requestCopy() {
  const contactSection = document.querySelector('#contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: scrollBehavior() });
    return;
  }

  window.location.href = requestCopyEmail;
}
