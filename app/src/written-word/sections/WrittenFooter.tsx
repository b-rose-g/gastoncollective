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
          <span className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FAF8F4', opacity: 0.4 }}>
            The Written Word — Stories That Stay With You
          </span>
        </div>

        <div className="flex items-center gap-6">
          {['Instagram', 'Email', 'Goodreads'].map((link) => (
            <a
              key={link}
              href="#"
              className="font-sans text-xs uppercase tracking-[0.15em] relative group"
              style={{ color: '#FAF8F4', opacity: 0.5 }}
              data-cursor-hover
            >
              <span>{link}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full" style={{ backgroundColor: '#A67B5B' }} />
            </a>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center pb-8">
        <p className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#FAF8F4', opacity: 0.25 }}>
          The Gaston Collective 2025 — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
