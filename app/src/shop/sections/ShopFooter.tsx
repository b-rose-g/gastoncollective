import { Link } from 'react-router-dom';
import { GASTON_CONTACT_MAILTO } from '@/lib/contact';

export default function ShopFooter() {
  return (
    <footer
      className="relative"
      style={{ backgroundColor: '#5A4A6E', borderTop: '1px solid #E8DDD0' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            to="/"
            className="font-serif text-lg tracking-tight transition-opacity duration-300 hover:opacity-70"
            style={{ color: '#D4B8E0' }}
            data-cursor-hover
          >
            ← Back to The Gaston Collective
          </Link>
          <span className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FFF8E7', opacity: 0.65 }}>
            The Shop — Stickers, Bookmarks & More
          </span>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: 'Email', href: GASTON_CONTACT_MAILTO },
            { label: 'Support', href: '/shop#contact' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-xs uppercase tracking-[0.15em] relative group"
              style={{ color: '#FFF8E7', opacity: 0.7 }}
              data-cursor-hover
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#D4B8E0' }} />
            </a>
          ))}
          <Link
            to="/privacy"
            className="font-sans text-xs uppercase tracking-[0.15em] relative group"
            style={{ color: '#FFF8E7', opacity: 0.7 }}
            data-cursor-hover
          >
            <span>Privacy</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#D4B8E0' }} />
          </Link>
          <Link
            to="/terms"
            className="font-sans text-xs uppercase tracking-[0.15em] relative group"
            style={{ color: '#FFF8E7', opacity: 0.7 }}
            data-cursor-hover
          >
            <span>Terms</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#D4B8E0' }} />
          </Link>
        </div>
      </div>

      <div className="relative z-10 text-center pb-8">
        <p className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FFF8E7', opacity: 0.55 }}>
          The Gaston Collective 2025 — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
