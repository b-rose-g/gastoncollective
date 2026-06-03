import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Feather } from 'lucide-react';
import { scrollBehavior } from '@/lib/motion';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', target: '#journey' },
  { label: 'Books', target: '#books' },
  { label: 'Contact', target: '#contact' },
];

export default function WrittenNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (target: string) => {
    setMobileOpen(false);
    if (target.startsWith('#')) {
      document.querySelector(target)?.scrollIntoView({ behavior: scrollBehavior() });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[100] transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(250, 248, 244, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #E8E2D9' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link
          to="/"
          className="font-serif text-lg tracking-tight transition-opacity duration-300 hover:opacity-70"
          style={{ color: '#A67B5B' }}
          data-cursor-hover
        >
          ← TGC
        </Link>

        <span
          className="font-serif text-base absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2"
          style={{ color: '#3B2317', letterSpacing: '0.1em' }}
        >
          <Feather size={16} /> THE WRITTEN WORD
        </span>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                className="font-sans text-xs uppercase tracking-[0.15em] relative group"
                style={{ color: '#3B2317', opacity: 0.7 }}
                data-cursor-hover
              >
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-400 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.target!)}
                className="font-sans text-xs uppercase tracking-[0.15em] relative group"
                style={{ color: '#3B2317', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}
                data-cursor-hover
              >
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-400 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
              </button>
            )
          )}
        </div>

        <button
          className="md:hidden"
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: '#3B2317', background: 'none', border: 'none' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(250, 248, 244, 0.98)' }}>
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className="font-sans text-sm uppercase tracking-[0.15em] py-2" style={{ color: '#3B2317' }}>
                {item.label}
              </Link>
            ) : (
              <button key={item.label} type="button" onClick={() => handleNavClick(item.target!)} className="font-sans text-sm uppercase tracking-[0.15em] py-2 text-left" style={{ color: '#3B2317', background: 'none', border: 'none' }}>
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </nav>
  );
}
