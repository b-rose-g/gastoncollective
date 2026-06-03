import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SHOP_ITEMS = [
  { image: '/images/sticker_pdf_page_1.jpg', title: 'roll first, talk later', price: '$5' },
  { image: '/images/sticker_pdf_page_2.jpg', title: 'Smoke, Reflect, Reset.', price: '$5' },
  { image: '/images/sticker_pdf_page_3.jpg', title: 'Pretty Girls Smoke Too', price: '$5' },
  { image: '/images/sticker_pdf_page_4.jpg', title: 'High & Avoiding People', price: '$5' },
  { image: '/images/sticker_pdf_page_5.jpg', title: 'Pretty & Lifted', price: '$5' },
];

export default function ShopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.querySelectorAll('.shop-item'), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="shop" ref={sectionRef} className="relative w-full py-24 md:py-32" style={{ backgroundColor: '#F5F0E8', minHeight: '80vh' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#C9A9A6', opacity: 0.7 }}>
            From the Shop
          </span>
          <h2
            ref={titleRef}
            className="font-serif mt-4 opacity-0"
            style={{ color: '#2D2D2D', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1 }}
          >
            PICK UP <span style={{ color: '#7B3B4F' }}>SOMETHING</span> NICE
          </h2>
          <p className="font-script mt-3" style={{ color: '#A89B8C', fontSize: 'clamp(18px, 2vw, 24px)' }}>
            stickers, bookmarks, and little joys
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-8 font-sans text-xs uppercase tracking-[0.2em] px-6 py-3 border transition-all duration-300 hover:bg-[#C9A9A6] hover:text-[#2D2D2D] hover:border-[#C9A9A6]"
            style={{ color: '#C9A9A6', borderColor: '#C9A9A660', backgroundColor: 'transparent', cursor: 'pointer' }}
            data-cursor-hover
          >
            Visit the Shop →
          </button>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {SHOP_ITEMS.map((item, i) => {
            const isActive = activeIndex === i;
            const dim = activeIndex !== null && !isActive;
            const d = activeIndex !== null ? Math.abs(i - activeIndex) : 0;
            return (
              <div
                key={i}
                className="shop-item relative overflow-hidden opacity-0 cursor-pointer"
                style={{
                  borderRadius: 16,
                  aspectRatio: '1 / 1',
                  opacity: dim ? Math.max(0.4, 1 - d * 0.25) : 1,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  zIndex: isActive ? 10 : 1,
                  boxShadow: isActive ? '0 8px 32px rgba(45,45,45,0.12)' : '0 2px 8px rgba(45,45,45,0.06)',
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-end p-4 transition-opacity duration-400"
                  style={{
                    background: isActive
                      ? 'linear-gradient(transparent 40%, rgba(45, 45, 45, 0.75) 100%)'
                      : 'linear-gradient(transparent 60%, rgba(45, 45, 45, 0.4) 100%)',
                    opacity: isActive ? 1 : 0,
                  }}
                >
                  <h3 className="font-serif text-center" style={{ color: '#F5F0E8', fontSize: 15, fontWeight: 600 }}>{item.title}</h3>
                  <p className="font-sans mt-1" style={{ color: '#C9A9A6', fontSize: 13 }}>{item.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
