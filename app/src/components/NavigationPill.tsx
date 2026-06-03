import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, scrollBehavior } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface NavigationPillProps {
  lenisRef: React.RefObject<{ scrollTo: (target: string) => void } | null>;
}

const NAV_ITEMS = [
  { label: 'Home', target: '#hero' },
  { label: 'About', target: '#ethos' },
  { label: 'Programs', target: '#programs' },
  { label: 'Shop', target: '#shop' },
];

export default function NavigationPill({ lenisRef }: NavigationPillProps) {
  const [activeSection, setActiveSection] = useState('hero');
  const pillRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const sections = ['hero', 'ethos', 'programs', 'shop'];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (sections.includes(st.vars.trigger as string)) {
          st.kill();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!pillRef.current) return;
    if (prefersReducedMotion()) {
      pillRef.current.style.opacity = '1';
      return;
    }
    gsap.fromTo(
      pillRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
    );
  }, []);

  const handleNavClick = (target: string) => {
    if (lenisRef.current && !prefersReducedMotion()) {
      lenisRef.current.scrollTo(target);
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: scrollBehavior() });
    }
  };

  return (
    <nav
      ref={pillRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-8 py-3 opacity-0"
      style={{
        backgroundColor: '#4C1F13',
        borderRadius: 40,
        boxShadow: '0 4px 20px rgba(76, 31, 19, 0.3)',
      }}
    >
      <span
        className="font-serif text-lg font-bold tracking-wide"
        style={{ color: '#F2F1ED' }}
      >
        TGC
      </span>

      <div className="hidden md:flex items-center gap-6">
        {NAV_ITEMS.map((item) => {
          const sectionId = item.target.replace('#', '');
          const isActive = activeSection === sectionId;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.target)}
              className="relative font-sans text-sm uppercase tracking-[0.1em] transition-colors duration-300 hover:opacity-100"
              style={{
                color: '#FBB8A5',
                opacity: isActive ? 1 : 0.7,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {item.label}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-0 w-full h-[1px]"
                  style={{ backgroundColor: '#FBB8A5' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Go to shop section"
        onClick={() => handleNavClick('#shop')}
        className="flex items-center justify-center transition-opacity duration-300 hover:opacity-100"
        style={{
          color: '#F2F1ED',
          opacity: 0.8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ShoppingBag size={18} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
