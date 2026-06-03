import { Link } from 'react-router-dom';

export default function WrittenFooter() {
  return (
    <footer
      className="relative"
      style={{ backgroundColor: '#3B2317', borderTop: '1px solid #E8E2D9' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            to="/"
            className="font-serif text-lg tracking-tight transition-opacity duration-300 hover:opacity-70"
            style={{ color: '#A67B5B' }}
            data-cursor-hover
          >
            ← Back to The Gaston Collective
          </Link>
          <span className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FAF8F4', opacity: 0.65 }}>
            The Written Word — Stories That Stay With You
          </span>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: 'Email', href: 'mailto:hello@gastoncollective.com' },
            { label: 'Goodreads', href: 'https://www.goodreads.com/search?q=Kimberlin%20Gaston' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('https://') ? '_blank' : undefined}
              rel={link.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
              className="font-sans text-xs uppercase tracking-[0.15em] relative group"
              style={{ color: '#FAF8F4', opacity: 0.7 }}
              data-cursor-hover
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
            </a>
          ))}
          <Link
            to="/privacy"
            className="font-sans text-xs uppercase tracking-[0.15em] relative group"
            style={{ color: '#FAF8F4', opacity: 0.7 }}
            data-cursor-hover
          >
            <span>Privacy</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
          </Link>
          <Link
            to="/terms"
            className="font-sans text-xs uppercase tracking-[0.15em] relative group"
            style={{ color: '#FAF8F4', opacity: 0.7 }}
            data-cursor-hover
          >
            <span>Terms</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
          </Link>
        </div>
      </div>

      <div className="relative z-10 text-center pb-8">
        <p className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FAF8F4', opacity: 0.55 }}>
          The Gaston Collective 2025 — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
