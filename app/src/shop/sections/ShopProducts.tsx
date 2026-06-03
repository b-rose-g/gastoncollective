import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingCart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const COLLECTIONS = [
  { id: 'all', label: 'Shop All' },
  { id: '420', label: '4/20' },
];

const PRODUCTS = [
  { name: 'roll first, talk later', description: 'Circle vinyl sticker. Bold and unapologetic.', price: '$5.00', image: '/images/sticker_pdf_page_1.jpg', collection: '420', accent: '#A8D8C8' },
  { name: 'Smoke, Reflect, Reset.', description: 'Circle vinyl sticker. For the mindful moment.', price: '$5.00', image: '/images/sticker_pdf_page_2.jpg', collection: '420', accent: '#A8C8E8' },
  { name: 'Pretty Girls Smoke Too', description: 'Circle vinyl sticker with glossy lips. Feminine and fierce.', price: '$5.00', image: '/images/sticker_pdf_page_3.jpg', collection: '420', accent: '#F4A5AE' },
  { name: 'High & Avoiding People', description: 'Circle vinyl sticker. Your status, sticker form.', price: '$5.00', image: '/images/sticker_pdf_page_4.jpg', collection: '420', accent: '#F4E4A0' },
  { name: 'Pretty & Lifted', description: 'Circle vinyl sticker with heart bong. Elegant and elevated.', price: '$5.00', image: '/images/sticker_pdf_page_5.jpg', collection: '420', accent: '#D4B8E0' },
];

export default function ShopProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCollection, setActiveCollection] = useState('all');

  const filteredProducts = activeCollection === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.collection === activeCollection);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.querySelectorAll('.product-card'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [activeCollection]);

  return (
    <section id="products" ref={sectionRef} className="relative" style={{ backgroundColor: '#FFF8E7' }}>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-32 md:py-40">
        <div ref={headingRef} className="text-center mb-12 opacity-0">
          <span className="font-sans text-xs uppercase tracking-[0.2em] block mb-4" style={{ color: '#D4B8E0', opacity: 0.8 }}>Merch</span>
          <h2 className="font-serif" style={{ color: '#5A4A6E', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, fontWeight: 600 }}>
            PICK UP <span style={{ color: '#6BC4A8' }}>SOMETHING</span> NICE
          </h2>
        </div>

        {/* Collection Tabs */}
        <div className="flex items-center justify-center gap-6 mb-12">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className="font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-2"
              style={{
                color: activeCollection === col.id ? '#D4B8E0' : '#7A6B8A',
                opacity: activeCollection === col.id ? 1 : 0.5,
                borderBottom: activeCollection === col.id ? '2px solid #D4B8E0' : '2px solid transparent',
                background: 'none',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: activeCollection === col.id ? '#D4B8E0' : 'transparent',
                cursor: 'pointer',
              }}
              data-cursor-hover
            >
              {col.label}
            </button>
          ))}
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div key={`${activeCollection}-${i}`} className="product-card opacity-0 group" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                <div
                  className="relative overflow-hidden mb-5"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 16,
                    boxShadow: isHovered ? `0 8px 40px ${product.accent}30` : '0 4px 20px rgba(90,74,110,0.08)',
                    transition: 'box-shadow 0.5s ease',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }} loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-400" style={{ backgroundColor: 'rgba(90, 74, 110, 0.5)', opacity: isHovered ? 1 : 0 }}>
                    <button className="font-sans text-xs uppercase tracking-[0.2em] px-6 py-3 border flex items-center gap-2 transition-all duration-300" style={{ color: '#FFF8E7', borderColor: '#FFF8E7', backgroundColor: 'transparent', cursor: 'pointer' }} data-cursor-hover>
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
                <h3 className="font-serif mt-1 mb-2" style={{ color: '#5A4A6E', fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{product.name}</h3>
                <p className="font-sans mb-3" style={{ color: '#7A6B8A', fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>{product.description}</p>
                <span className="font-sans text-sm" style={{ color: product.accent, letterSpacing: '0.05em', fontWeight: 600 }}>{product.price}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
