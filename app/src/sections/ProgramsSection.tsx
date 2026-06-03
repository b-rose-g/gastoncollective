import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// Use real tattoo photos for the 3 program cards
const PROGRAMS = [
  {
    image: '/images/tattoo_1.jpg',
    title: 'THE EXPERIENCE',
    description: 'Immersive storytelling that transcends the page.',
    link: '/velvet-ink',
  },
  {
    image: '/images/tattoo_4.jpg',
    title: 'THE GAME',
    description: 'Interactive creative workshops and events.',
    link: '/written-word',
  },
  {
    image: '/images/tattoo_7.jpg',
    title: 'THE SYSTEM',
    description: 'Structured creative frameworks for artists.',
    link: '/shop',
  },
];

export default function ProgramsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      );

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.program-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' } }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="programs"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32"
      style={{ backgroundColor: '#F2F1ED', minHeight: 600 }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <h2
          ref={titleRef}
          className="font-serif text-center mb-16 opacity-0"
          style={{
            color: '#4C1F13',
            fontSize: 'clamp(14px, 1.2vw, 16px)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Our Programs
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {PROGRAMS.map((program, i) => (
            <div
              key={i}
              className="program-card flex flex-col items-center gap-6 opacity-0 cursor-pointer"
              onClick={() => navigate(program.link)}
              data-cursor-hover
            >
              {/* Image Container with Circle Morph */}
              <div
                className="program-image-container relative w-full overflow-hidden group"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 20,
                  transition: 'box-shadow 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) {
                    img.style.clipPath = 'circle(45%)';
                    img.style.transform = 'scale(1.1)';
                    img.style.filter = 'hue-rotate(15deg) saturate(1.2)';
                  }
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(236, 165, 137, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) {
                    img.style.clipPath = 'inset(0% round 20px)';
                    img.style.transform = 'scale(1)';
                    img.style.filter = 'none';
                  }
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                  style={{
                    clipPath: 'inset(0% round 20px)',
                    transition: 'clip-path 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.8s ease',
                    willChange: 'clip-path, transform',
                  }}
                  loading="lazy"
                />
              </div>

              {/* Title */}
              <div className="text-center">
                <h3
                  className="font-serif"
                  style={{ color: '#4C1F13', fontSize: 24, fontWeight: 600, letterSpacing: '0.02em' }}
                >
                  {program.title}
                </h3>
                <p className="font-sans mt-2" style={{ color: '#4E4A48', fontSize: 15, lineHeight: 1.5 }}>
                  {program.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
