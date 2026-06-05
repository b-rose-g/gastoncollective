import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    image: '/images/tattoo_6.jpg',
    width: 670,
    height: 1126,
    title: 'VELVET INK',
    accent: '#7B3B4F',
    heading: 'Art that stays with you',
    scriptLine: 'every mark has a meaning',
    body: 'Every tattoo tells a story. At Velvet Ink, we craft permanent art that resonates with who you are — floral designs, script work, and custom pieces that blur the line between body and canvas.',
    ctaLabel: 'Explore Velvet Ink',
    link: '/velvet-ink',
    imagePosition: 'left',
  },
  {
    image: '/images/book_reach_for_the_stars.png',
    width: 441,
    height: 628,
    title: 'THE WRITTEN WORD',
    accent: '#BFA76A',
    heading: 'Words that linger',
    scriptLine: 'stories worth getting lost in',
    body: 'From fiction that pulls you into other worlds to poetry that finds the raw nerve, The Gaston Collective publishes work that refuses to be forgotten. Stories, essays, and the occasional manifesto.',
    ctaLabel: 'Explore The Written Word',
    link: '/written-word',
    imagePosition: 'right',
  },
];

export default function FeaturedShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately(Array.from(sectionRef.current?.querySelectorAll('.feature-image, .feature-text') ?? []));
      return;
    }

    const ctx = gsap.context(() => {
      document.querySelectorAll('.feature-row').forEach((row) => {
        gsap.fromTo(
          row.querySelector('.feature-image'),
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 85%' } }
        );
        gsap.fromTo(
          row.querySelector('.feature-text'),
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="programs"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#EDE6D9' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#BFA76A', opacity: 0.7 }}>
            Featured Work
          </span>
          <h2
            className="font-serif mt-4"
            style={{ color: '#2D2D2D', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, lineHeight: 1.1 }}
          >
            A GLIMPSE <span style={{ color: '#7B3B4F' }}>INSIDE</span>
          </h2>
        </div>

        {FEATURES.map((f, i) => (
          <div
            key={i}
            className={`feature-row grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${i > 0 ? 'mt-24 md:mt-32' : ''}`}
          >
            <div className={`feature-image relative opacity-0 ${f.imagePosition === 'right' ? 'md:order-2' : ''}`}>
              <OffsetBorderImage src={f.image} width={f.width} height={f.height} accent={f.accent} />
            </div>
            <div className={`feature-text opacity-0 ${f.imagePosition === 'right' ? 'md:order-1' : ''}`}>
              <span
                className="font-sans text-xs uppercase tracking-[0.2em]"
                style={{ color: f.accent, opacity: 0.7, letterSpacing: '0.2em' }}
              >
                {f.title}
              </span>

              <h3
                className="font-serif mt-4"
                style={{
                  color: '#2D2D2D',
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {f.heading}
              </h3>

              <p
                className="font-script mt-3"
                style={{
                  color: f.accent,
                  fontSize: 'clamp(22px, 3vw, 30px)',
                  opacity: 0.7,
                  lineHeight: 1.3,
                }}
              >
                {f.scriptLine}
              </p>

              <p
                className="font-sans mt-6"
                style={{
                  color: '#5A5450',
                  fontSize: 16,
                  lineHeight: 1.8,
                  letterSpacing: '0.02em',
                }}
              >
                {f.body}
              </p>

              <button
                onClick={() => navigate(f.link)}
                className="inline-block mt-8 font-sans text-xs uppercase tracking-[0.2em] relative group px-6 py-3 border transition-all duration-300 hover:bg-[var(--accent)] hover:text-white"
                style={{ color: f.accent, borderColor: `${f.accent}40`, backgroundColor: 'transparent', cursor: 'pointer' }}
                data-cursor-hover
              >
                <span>{f.ctaLabel}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OffsetBorderImage({ src, width, height, accent }: { src: string; width: number; height: number; accent: string }) {
  return (
    <div className="relative group cursor-pointer" data-cursor-hover>
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
        style={{
          backgroundColor: accent,
          opacity: 0.2,
          transform: 'translate(8px, 8px)',
          borderRadius: 12,
        }}
      />
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', borderRadius: 12 }}>
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
