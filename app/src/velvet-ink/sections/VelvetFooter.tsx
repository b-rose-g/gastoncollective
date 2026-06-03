import { Link } from 'react-router-dom';

export default function VelvetFooter() {
  return (
    <footer
      className="noise-overlay relative"
      style={{
        backgroundColor: '#141414',
        borderTop: '1px solid #1A1A1A',
      }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            to="/"
            className="font-serif text-lg tracking-tight transition-opacity duration-300 hover:opacity-70"
            style={{ color: '#D14A6E' }}
            data-cursor-hover
          >
            ← Back to The Gaston Collective
          </Link>
          <span className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#E8DDD4', opacity: 0.65 }}>
            Velvet Ink — Tattoo & Piercing Studio
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {[
            { label: '@velvetink.br', href: 'https://www.instagram.com/velvetink.br/' },
            { label: 'Email', href: 'mailto:hello@gastoncollective.com' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('https://') ? '_blank' : undefined}
              rel={link.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
              className="font-sans text-xs uppercase tracking-[0.15em] relative group"
              style={{ color: '#E8DDD4', opacity: 0.7 }}
              data-cursor-hover
            >
              <span>{link.label}</span>
              <span
                className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: '#D14A6E' }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 text-center pb-8">
        <p className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: '#E8DDD4', opacity: 0.55 }}>
          The Gaston Collective 2025 — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
