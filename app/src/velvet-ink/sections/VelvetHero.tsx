import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TITLE_CHARS = 'VELVET INK'.split('');

export default function VelvetHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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

      {/* Decorative rose SVG */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none opacity-[0.06]"
        style={{ width: 'clamp(200px, 30vw, 400px)', height: 'auto' }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 95 C50 95 20 80 20 50 C20 30 35 15 50 10 C65 15 80 30 80 50 C80 80 50 95 50 95Z"
          stroke="#D14A6E"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M50 80 C50 80 35 70 35 50 C35 38 42 28 50 24 C58 28 65 38 65 50 C65 70 50 80 50 80Z"
          stroke="#D14A6E"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M50 10 Q55 5 60 15 Q55 20 50 10"
          stroke="#D14A6E"
          strokeWidth="0.5"
          fill="#D14A6E"
          opacity="0.3"
        />
        <path
          d="M30 40 Q20 35 25 50"
          stroke="#D14A6E"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M70 40 Q80 35 75 50"
          stroke="#D14A6E"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>
    </section>
  );
}
