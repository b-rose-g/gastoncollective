import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Feather, ShoppingBag } from 'lucide-react';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const VENTURES = [
  {
    title: 'VELVET INK',
    subtitle: 'Tattoo artistry that lives in your skin',
    accent: '#7B3B4F',
    previewBg: '#0A0A0A',
    previewText: '#D14A6E',
    icon: Sparkles,
    href: '/velvet-ink',
    image: '/images/tattoo_2.jpg',
    width: 780,
    height: 1210,
  },
  {
    title: 'THE WRITTEN WORD',
    subtitle: 'Stories worth getting lost in',
    accent: '#BFA76A',
    previewBg: '#FAF8F4',
    previewText: '#3B2317',
    icon: Feather,
    href: '/written-word',
    image: '/images/book_reach_for_the_stars.png',
    width: 441,
    height: 628,
  },
  {
    title: 'THE SHOP',
    subtitle: 'Stickers, bookmarks & more',
    accent: '#C9A9A6',
    previewBg: '#FFF8E7',
    previewText: '#D4B8E0',
    icon: ShoppingBag,
    href: '/shop',
    image: '/images/sticker_pdf_page_3.jpg',
    width: 851,
    height: 851,
  },
];

export default function VenturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, ...(panelsRef.current ? Array.from(panelsRef.current.querySelectorAll('.venture-panel')) : [])]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      );

      const panels = panelsRef.current!.querySelectorAll('.venture-panel');
      gsap.fromTo(
        panels,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: panelsRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* Section heading */}
      <div ref={headingRef} className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-12 opacity-0">
        <div className="text-center">
          <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#BFA76A', opacity: 0.7 }}>
            Three Creative Worlds
          </span>
          <h2
            className="font-serif mt-4"
            style={{ color: '#2D2D2D', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1, fontWeight: 600 }}
          >
            CHOOSE YOUR <span style={{ color: '#7B3B4F' }}>DOORWAY</span>
          </h2>
          <p className="font-script mt-3" style={{ color: '#A89B8C', fontSize: 'clamp(20px, 2.5vw, 28px)' }}>
            each one leads somewhere different
          </p>
        </div>
      </div>

      <div
        ref={panelsRef}
        className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-24 md:pb-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENTURES.map((venture, i) => (
            <VenturePanel
              key={i}
              venture={venture}
              onNavigate={() => navigate(venture.href)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VenturePanel({
  venture,
  onNavigate,
}: {
  venture: typeof VENTURES[0];
  onNavigate: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = venture.icon;

  return (
    <div
      className="venture-panel relative overflow-hidden cursor-pointer opacity-0"
      style={{
        borderRadius: 16,
        border: `1px solid ${isHovered ? venture.accent + '40' : '#E0D5C5'}`,
        backgroundColor: isHovered ? '#FDFCF8' : '#FAF7F0',
        transition: 'all 0.5s ease',
        boxShadow: isHovered ? `0 8px 40px ${venture.accent}12` : '0 2px 12px rgba(45,45,45,0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onNavigate}
      data-cursor-hover
      role="link"
      aria-label={`Explore ${venture.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
    >
      {/* Preview image area */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 240,
          backgroundColor: venture.previewBg,
          borderRadius: '16px 16px 0 0',
        }}
      >
        <img
          src={venture.image}
          alt={venture.title}
          width={venture.width}
          height={venture.height}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          loading="lazy"
        />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to top, #FDFCF8 0%, transparent 40%)`,
          }}
        />
        {/* Venture color swatch indicator */}
        <div
          className="absolute top-4 right-4 w-3 h-3 rounded-full transition-transform duration-500"
          style={{
            backgroundColor: venture.accent,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          }}
        />
      </div>

      {/* Content area */}
      <div className="px-6 pb-6 -mt-6 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <Icon
            size={20}
            strokeWidth={1.5}
            style={{ color: venture.accent }}
          />
          <span
            className="font-sans text-xs uppercase tracking-[0.2em]"
            style={{ color: venture.accent, opacity: 0.8 }}
          >
            {venture.title}
          </span>
        </div>

        <p
          className="font-script"
          style={{ color: '#6B6560', fontSize: 20, lineHeight: 1.3 }}
        >
          {venture.subtitle}
        </p>

        {/* Explore link */}
        <div
          className="mt-5 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2"
          style={{
            color: venture.accent,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Explore <span style={{ fontSize: 14 }}>→</span>
        </div>
      </div>
    </div>
  );
}
