import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

const TITLE_LINE_1 = 'THE GASTON';
const TITLE_LINE_2 = 'COLLECTIVE';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement[]>([]);
  const line2Ref = useRef<HTMLSpanElement[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([
        ...line1Ref.current,
        ...line2Ref.current,
        taglineRef.current,
        lineRef.current,
        badgesRef.current,
        chevronRef.current,
      ]);
      if (lineRef.current) lineRef.current.style.transform = 'scaleX(1)';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        line1Ref.current.filter(Boolean),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }
      );

      tl.fromTo(
        line2Ref.current.filter(Boolean),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' },
        '-=0.3'
      );

      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
        '-=0.2'
      );

      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      );

      if (badgesRef.current) {
        const badges = badgesRef.current.querySelectorAll('.venture-tag');
        tl.fromTo(
          badges,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.3'
        );
      }

      tl.fromTo(
        chevronRef.current,
        { opacity: 0 },
        { opacity: 0.5, duration: 0.6 },
        '-=0.1'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#F5F0E8' }}
    >
      {/* Subtle decorative corner accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 w-px h-32" style={{ background: 'linear-gradient(to bottom, #C9A9A6, transparent)', opacity: 0.3 }} />
        <div className="absolute top-20 left-12 h-px w-24" style={{ background: 'linear-gradient(to right, #C9A9A6, transparent)', opacity: 0.3 }} />
        <div className="absolute bottom-32 right-12 w-px h-32" style={{ background: 'linear-gradient(to top, #BFA76A, transparent)', opacity: 0.3 }} />
        <div className="absolute bottom-32 right-12 h-px w-24" style={{ background: 'linear-gradient(to left, #BFA76A, transparent)', opacity: 0.3 }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          className="font-serif tracking-tight"
          style={{
            color: '#2D2D2D',
            fontSize: 'clamp(48px, 11vw, 130px)',
            lineHeight: 1.0,
            fontWeight: 700,
          }}
        >
          {/* Line 1 */}
          {TITLE_LINE_1.split('').map((char, i) => (
            <span
              key={`l1-${i}`}
              ref={(el) => { if (el) line1Ref.current[i] = el; }}
              className="inline-block opacity-0"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </span>
          ))}
          <br />
          {/* Line 2 */}
          {TITLE_LINE_2.split('').map((char, i) => (
            <span
              key={`l2-${i}`}
              ref={(el) => { if (el) line2Ref.current[i] = el; }}
              className="inline-block opacity-0"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </span>
          ))}
        </h1>

        <div
          ref={lineRef}
          className="mt-8 mb-6 origin-center"
          style={{
            width: 120,
            height: 1,
            backgroundColor: '#BFA76A',
            opacity: 0.6,
            transform: 'scaleX(0)',
          }}
        />

        <p
          ref={taglineRef}
          className="font-script opacity-0"
          style={{
            color: '#7B3B4F',
            fontSize: 'clamp(28px, 4vw, 44px)',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
          }}
        >
          where ink meets intention
        </p>

        <div
          ref={badgesRef}
          className="flex flex-wrap items-center justify-center gap-4 mt-14"
        >
          {[
            { label: 'Velvet Ink', accent: '#7B3B4F', href: '/velvet-ink' },
            { label: 'Books', accent: '#BFA76A', href: '/written-word' },
            { label: 'Shop', accent: '#C9A9A6', href: '/shop' },
          ].map((tag, i) => (
            <Link
              key={i}
              to={tag.href}
              className="venture-tag opacity-0 px-7 py-2.5 font-sans text-xs uppercase tracking-[0.25em] border transition-all duration-300 hover:scale-105"
              style={{
                color: tag.accent,
                borderColor: `${tag.accent}40`,
                borderWidth: 1,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tag.accent;
                e.currentTarget.style.boxShadow = `0 0 20px ${tag.accent}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${tag.accent}40`;
                e.currentTarget.style.boxShadow = 'none';
              }}
              data-cursor-hover
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        ref={chevronRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 opacity-0"
        style={{ color: '#2D2D2D' }}
      >
        <ChevronDown size={24} className="animate-bounce-down" aria-hidden="true" />
      </div>
    </section>
  );
}
