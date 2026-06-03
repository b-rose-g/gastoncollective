import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LINE1 = 'THE WRITTEN';
const LINE2 = 'WORD';

export default function WrittenHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        charsRef.current.filter(Boolean),
        { opacity: 0, y: 40, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out' }
      );

      tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, '-=0.3');

      tl.fromTo(taglineRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  let charIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#FAF8F4' }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          className="font-serif tracking-tight"
          style={{ color: '#A67B5B', fontSize: 'clamp(48px, 11vw, 130px)', lineHeight: 1.0, fontWeight: 700, perspective: 400 }}
        >
          {LINE1.split('').map((char, i) => (
            <span
              key={`l1-${i}`}
              ref={(el) => { if (el) charsRef.current[charIndex++] = el; }}
              className="inline-block opacity-0"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal', transformStyle: 'preserve-3d' }}
            >
              {char}
            </span>
          ))}
          <br />
          {LINE2.split('').map((char, i) => (
            <span
              key={`l2-${i}`}
              ref={(el) => { if (el) charsRef.current[charIndex++] = el; }}
              className="inline-block opacity-0"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal', transformStyle: 'preserve-3d' }}
            >
              {char}
            </span>
          ))}
        </h1>

        <div
          ref={lineRef}
          className="mt-6 mb-6 origin-left"
          style={{ width: 80, height: 1, backgroundColor: '#A67B5B', opacity: 0.4, transform: 'scaleX(0)' }}
        />

        <p
          ref={taglineRef}
          className="font-script opacity-0"
          style={{ color: '#6B5B4E', fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.3 }}
        >
          stories that stay with you
        </p>
      </div>

      {/* Decorative feather SVG */}
      <svg className="absolute bottom-0 right-0 pointer-events-none opacity-[0.06]" style={{ width: 280, height: 280 }} viewBox="0 0 100 100" fill="none">
        <path d="M50 95 Q50 70 35 55 Q20 40 25 25 Q30 10 50 5 Q70 10 75 25 Q80 40 65 55 Q50 70 50 95Z" stroke="#A67B5B" strokeWidth="0.5" fill="none" />
        <path d="M50 95 L50 20" stroke="#A67B5B" strokeWidth="0.3" opacity="0.5" />
        <path d="M50 40 L35 30 M50 50 L65 38 M50 60 L30 48 M50 70 L70 55" stroke="#A67B5B" strokeWidth="0.3" opacity="0.3" />
      </svg>

      {/* Subtle corner accent */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-12 w-px h-24" style={{ background: 'linear-gradient(to bottom, #A67B5B, transparent)', opacity: 0.2 }} />
        <div className="absolute top-24 left-12 h-px w-20" style={{ background: 'linear-gradient(to right, #A67B5B, transparent)', opacity: 0.2 }} />
      </div>
    </section>
  );
}
