import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

// Use 3 real tattoo photos for the scattered Polaroid effect
const PHOTOS = [
  { src: '/images/tattoo_3.jpg', width: 1080, height: 1440, rotation: -3, offset: { x: -20, y: 0 } },
  { src: '/images/tattoo_5.jpg', width: 529, height: 1197, rotation: 2, offset: { x: 30, y: 40 } },
  { src: '/images/tattoo_9.jpg', width: 277, height: 774, rotation: -2, offset: { x: 10, y: -30 } },
];

export default function EthosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (prefersReducedMotion()) {
      revealImmediately([quoteRef.current, bodyRef.current, ...(photosRef.current ? Array.from(photosRef.current.querySelectorAll('.ethos-photo')) : [])]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      );

      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
      );

      if (photosRef.current) {
        const photos = photosRef.current.querySelectorAll('.ethos-photo');
        gsap.fromTo(
          photos,
          { opacity: 0, scale: 0.9, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ethos"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32"
      style={{ backgroundColor: '#EBE9E4', minHeight: '80vh' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <div className="flex flex-col gap-8">
            <h2
              ref={quoteRef}
              className="font-serif italic opacity-0"
              style={{
                color: '#4C1F13',
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.3,
                fontWeight: 500,
              }}
            >
              "An ethical gray space where desire meets intention and structure bends to the human experience."
            </h2>

            <p
              ref={bodyRef}
              className="font-sans opacity-0"
              style={{ color: '#4E4A48', fontSize: 18, lineHeight: 1.6 }}
            >
              The Gaston Collective exists at the intersection of ink and intention. Founded as a creative umbrella, it houses ventures that refuse to live in black-and-white. From the written word to permanent art on skin, every endeavor carries the same ethos: authenticity over perfection, expression over convention.
            </p>
          </div>

          {/* Right: Scattered Photos with real tattoo work */}
          <div ref={photosRef} className="relative h-[400px] md:h-[500px] lg:h-[600px]">
            {PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="ethos-photo absolute opacity-0"
                style={{
                  width: 'clamp(160px, 45%, 240px)',
                  aspectRatio: '3/4',
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 20}%`,
                  transform: `rotate(${photo.rotation}deg) translate(${photo.offset.x}px, ${photo.offset.y}px)`,
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
                  zIndex: i,
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = `rotate(0deg) translate(${photo.offset.x}px, ${photo.offset.y}px) scale(1.05)`;
                  el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                  el.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = `rotate(${photo.rotation}deg) translate(${photo.offset.x}px, ${photo.offset.y}px)`;
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  el.style.zIndex = `${i}`;
                }}
              >
                <img
                  src={photo.src}
                  alt="Tattoo artwork"
                  width={photo.width}
                  height={photo.height}
                  decoding="async"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
