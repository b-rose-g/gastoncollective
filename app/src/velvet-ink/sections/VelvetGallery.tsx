import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

type GalleryImage = {
  src: string;
  title: string;
  category: 'tattoo' | 'piercing';
  width: number;
  height: number;
  previewCrop?: {
    aspectRatio: string;
    scale: number;
    origin: string;
  };
};

const TATTOO_IMAGES: GalleryImage[] = [
  { src: '/images/tattoo_1.jpg', title: 'Piece #1', category: 'tattoo', width: 556, height: 660 },
  { src: '/images/tattoo_2.jpg', title: 'Piece #2', category: 'tattoo', width: 780, height: 1210 },
  {
    src: '/images/tattoo_3.jpg',
    title: 'Piece #3',
    category: 'tattoo',
    width: 1080,
    height: 1440,
    previewCrop: {
      aspectRatio: '3 / 4',
      scale: 1.75,
      origin: '58% 66%',
    },
  },
  { src: '/images/tattoo_4.jpg', title: 'Piece #4', category: 'tattoo', width: 957, height: 1643 },
  { src: '/images/tattoo_5.jpg', title: 'Piece #5', category: 'tattoo', width: 529, height: 1197 },
  { src: '/images/tattoo_6.jpg', title: 'Piece #6', category: 'tattoo', width: 670, height: 1126 },
  { src: '/images/tattoo_7.jpg', title: 'Piece #7', category: 'tattoo', width: 366, height: 628 },
  { src: '/images/tattoo_8.jpg', title: 'Piece #8', category: 'tattoo', width: 471, height: 938 },
  { src: '/images/tattoo_9.jpg', title: 'Piece #9', category: 'tattoo', width: 277, height: 774 },
  { src: '/images/tattoo_10.jpg', title: 'Piece #10', category: 'tattoo', width: 659, height: 623 },
];

const PIERCING_IMAGES: GalleryImage[] = [
  { src: '/images/piercing_1.jpg', title: 'Piece #11', category: 'piercing', width: 1206, height: 2208 },
  { src: '/images/piercing_2.jpg', title: 'Piece #12', category: 'piercing', width: 1242, height: 2208 },
];

const ALL_IMAGES = [...TATTOO_IMAGES, ...PIERCING_IMAGES];

export default function VelvetGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'tattoo' | 'piercing'>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filteredImages = filter === 'all' ? ALL_IMAGES : ALL_IMAGES.filter((img) => img.category === filter);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, ...(gridRef.current ? Array.from(gridRef.current.querySelectorAll('.gallery-item')) : [])]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll('.gallery-item');
        gsap.fromTo(
          items,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [filter]);

  useEffect(() => {
    if (lightbox === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowLeft') setLightbox((current) => current === null ? current : Math.max(0, current - 1));
      if (event.key === 'ArrowRight') setLightbox((current) => current === null ? current : Math.min(ALL_IMAGES.length - 1, current + 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="noise-overlay relative"
      style={{ backgroundColor: '#141414' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-32 md:py-40">
        {/* Header */}
        <div ref={headingRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 opacity-0">
          <div>
            <span
              className="font-sans text-xs uppercase tracking-[0.2em] block mb-4"
              style={{ color: '#D14A6E', opacity: 0.7 }}
            >
              Portfolio
            </span>
            <h2
              className="font-serif"
              style={{
                color: '#E8DDD4',
                fontSize: 'clamp(36px, 6vw, 64px)',
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              THE <span style={{ color: '#D14A6E' }}>GALLERY</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-4">
            {(['all', 'tattoo', 'piercing'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-sans text-xs uppercase tracking-[0.15em] transition-all duration-300"
                style={{
                  color: filter === f ? '#D14A6E' : '#E8DDD4',
                  opacity: filter === f ? 1 : 0.5,
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === f ? '1px solid #D14A6E' : '1px solid transparent',
                  paddingBottom: 4,
                  cursor: 'pointer',
                }}
                data-cursor-hover
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid - Masonry style */}
        <div
          ref={gridRef}
          className="columns-2 md:columns-3 lg:columns-4 gap-3"
        >
          {filteredImages.map((img, i) => (
            <div
              key={`${filter}-${i}`}
              className="gallery-item relative overflow-hidden group cursor-pointer mb-3 opacity-0 break-inside-avoid"
              style={img.previewCrop ? { aspectRatio: img.previewCrop.aspectRatio } : undefined}
              onClick={() => setLightbox(ALL_IMAGES.indexOf(img))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightbox(ALL_IMAGES.indexOf(img));
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${img.title} ${img.category} image`}
              data-cursor-hover
            >
              <img
                src={img.src}
                alt={img.title}
                width={img.width}
                height={img.height}
                decoding="async"
                className={`${img.previewCrop ? 'h-full' : ''} w-full object-cover transition-all duration-700 ${img.previewCrop ? '' : 'group-hover:scale-105'}`}
                style={{
                  filter: 'brightness(0.85)',
                  ...(img.previewCrop
                    ? {
                        transform: `scale(${img.previewCrop.scale})`,
                        transformOrigin: img.previewCrop.origin,
                      }
                    : {}),
                }}
                loading="lazy"
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-end p-4 transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(transparent 50%, rgba(10,10,10,0.85) 100%)',
                }}
              >
                <span
                  className="font-sans text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: '#D14A6E', opacity: 0.7 }}
                >
                  {img.category}
                </span>
                <span
                  className="font-serif text-sm mt-1"
                  style={{ color: '#E8DDD4' }}
                >
                  {img.title}
                </span>
              </div>

              {/* Border glow on hover */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                style={{ boxShadow: 'inset 0 0 0 1px #D14A6E40' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)' }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${ALL_IMAGES[lightbox].title} image preview`}
        >
          <button
            type="button"
            aria-label="Close gallery preview"
            className="absolute top-6 right-6"
            onClick={() => setLightbox(null)}
            style={{ color: '#E8DDD4', background: 'none', border: 'none', cursor: 'pointer' }}
            data-cursor-hover
          >
            <X size={28} />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={ALL_IMAGES[lightbox].src}
              alt={ALL_IMAGES[lightbox].title}
              width={ALL_IMAGES[lightbox].width}
              height={ALL_IMAGES[lightbox].height}
              decoding="async"
              className="max-h-[75vh] w-auto object-contain"
              style={{ boxShadow: '0 0 60px rgba(209, 74, 110, 0.15)' }}
            />
            <div className="mt-4 text-center">
              <span className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#D14A6E' }}>
                {ALL_IMAGES[lightbox].category}
              </span>
              <h3 className="font-serif text-lg mt-1" style={{ color: '#E8DDD4' }}>
                {ALL_IMAGES[lightbox].title}
              </h3>
            </div>
          </div>

          {/* Navigation arrows */}
          {lightbox > 0 && (
            <button
              type="button"
              aria-label="Show previous gallery image"
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 font-serif text-3xl transition-opacity duration-300 hover:opacity-100"
              style={{ color: '#E8DDD4', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              data-cursor-hover
            >
              ←
            </button>
          )}
          {lightbox < ALL_IMAGES.length - 1 && (
            <button
              type="button"
              aria-label="Show next gallery image"
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 font-serif text-3xl transition-opacity duration-300 hover:opacity-100"
              style={{ color: '#E8DDD4', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              data-cursor-hover
            >
              →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
