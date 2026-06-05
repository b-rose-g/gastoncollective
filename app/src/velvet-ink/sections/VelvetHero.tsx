import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, revealImmediately, scrollBehavior } from '@/lib/motion';

const TITLE_CHARS = 'VELVET INK'.split('');

export default function VelvetHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([...charsRef.current, taglineRef.current, lineRef.current, ctaRef.current]);
      if (lineRef.current) lineRef.current.style.transform = 'scaleX(1)';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        charsRef.current,
        { opacity: 0, y: 40, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.04,
          ease: 'power3.out',
        }
      );

      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
        '-=0.3'
      );

      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToBook = () => {
    const el = document.querySelector('#book');
    if (el) el.scrollIntoView({ behavior: scrollBehavior() });
  };

  return (
    <section
      id="velvet-hero"
      ref={sectionRef}
      className="noise-overlay relative flex flex-col items-center justify-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
      }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          className="font-serif tracking-tight"
          style={{
            color: '#D14A6E',
            fontSize: 'clamp(56px, 12vw, 140px)',
            lineHeight: 1.0,
            fontWeight: 700,
            perspective: 400,
          }}
        >
          {TITLE_CHARS.map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) charsRef.current[i] = el; }}
              className="inline-block opacity-0"
              style={{
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                transformStyle: 'preserve-3d',
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        <div
          ref={lineRef}
          className="mt-6 mb-6 origin-left"
          style={{
            width: 80,
            height: 1,
            backgroundColor: '#D14A6E',
            opacity: 0.4,
            transform: 'scaleX(0)',
          }}
        />

        <p
          ref={taglineRef}
          className="font-script opacity-0"
          style={{
            color: '#E8DDD4',
            fontSize: 'clamp(22px, 3vw, 32px)',
            lineHeight: 1.3,
          }}
        >
          tattoo & piercing studio
        </p>

        <div ref={ctaRef} className="mt-10 opacity-0">
          <button
            onClick={scrollToBook}
            className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-3 border transition-all duration-300 hover:bg-[#D14A6E] hover:text-[#0A0A0A]"
            style={{
              color: '#D14A6E',
              borderColor: '#D14A6E',
              backgroundColor: 'transparent',
            }}
            data-cursor-hover
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Decorative tattoo machine SVG */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none opacity-[0.16]"
        style={{ width: 'clamp(220px, 32vw, 420px)', height: 'auto' }}
        viewBox="-4 0 138 132"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M31 55 87 23c7-4 15-1 18 6l3 7c3 7 0 14-7 18L45 86c-7 4-15 1-18-6l-3-7c-3-7 0-14 7-18Z"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 78 98 38"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M97 24 110 17 119 33"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M66 75 82 66 110 113c2 4 1 8-3 10l-11 6c-4 2-8 1-10-3L66 75Z"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M85 78l15-8M92 91l15-8M100 104l12-7"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27 80 17 86c-5 3-11 1-14-4M18 86 6 93M50 83c-10 8-15 18-14 31M64 78c8 23 23 36 44 38 8 1 15-2 20-9"
          stroke="#D14A6E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </section>
  );
}
