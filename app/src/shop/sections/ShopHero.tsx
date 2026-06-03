import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LINE1 = 'THE SHOP';

export default function ShopHero() {
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

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#FFF8E7' }}
    >
      {/* Playful floating dots */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-4 h-4 rounded-full" style={{ backgroundColor: '#D4B8E0', opacity: 0.3 }} />
        <div className="absolute top-[30%] right-[15%] w-6 h-6 rounded-full" style={{ backgroundColor: '#A8D8C8', opacity: 0.25 }} />
        <div className="absolute top-[60%] left-[8%] w-3 h-3 rounded-full" style={{ backgroundColor: '#F4A5AE', opacity: 0.35 }} />
        <div className="absolute top-[70%] right-[12%] w-5 h-5 rounded-full" style={{ backgroundColor: '#A8C8E8', opacity: 0.25 }} />
        <div className="absolute top-[45%] left-[20%] w-2 h-2 rounded-full" style={{ backgroundColor: '#F4E4A0', opacity: 0.4 }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1
          className="font-serif tracking-tight"
          style={{ color: '#6BC4A8', fontSize: 'clamp(56px, 12vw, 140px)', lineHeight: 1.0, fontWeight: 700, perspective: 400 }}
        >
          {LINE1.split('').map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) charsRef.current[i] = el; }}
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
          style={{ width: 80, height: 1, backgroundColor: '#6BC4A8', opacity: 0.4, transform: 'scaleX(0)' }}
        />

        <p
          ref={taglineRef}
          className="font-script opacity-0"
          style={{ color: '#5A8A7A', fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.3 }}
        >
          stickers, bookmarks & little things made with love
        </p>
      </div>
    </section>
  );
}
