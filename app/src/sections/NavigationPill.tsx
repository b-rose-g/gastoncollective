import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShoppingBag } from 'lucide-react';

export default function NavigationPill() {
  const pillRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pillRef.current) return;
    gsap.fromTo(pillRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' });
  }, []);

  const scrollTo = (target: string) => {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav ref={pillRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-8 py-3 opacity-0" style={{ backgroundColor: 'rgba(45, 45, 45, 0.9)', borderRadius: 40, backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(45, 45, 45, 0.15)' }}>
      <span className="font-serif text-lg font-bold tracking-wide" style={{ color: '#F5F0E8' }}>TGC</span>
      <div className="hidden md:flex items-center gap-6">
        {[
          { label: 'Home', target: '#hero' },
          { label: 'About', target: '#about' },
          { label: 'Programs', target: '#programs' },
          { label: 'Shop', target: '#shop' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => scrollTo(item.target)}
            className="font-sans text-sm uppercase tracking-[0.1em] transition-opacity duration-300 hover:opacity-100"
            style={{ color: '#BFA76A', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button style={{ color: '#F5F0E8', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer' }}>
        <ShoppingBag size={18} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
