import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scriptRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([titleRef.current, scriptRef.current, linksRef.current]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo(scriptRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo(linksRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: '#2D2D2D', minHeight: 450, borderTop: '1px solid #E0D5C5' }}
    >
      {/* Decorative accent */}
      <svg className="absolute bottom-0 left-0 pointer-events-none" style={{ width: 250, height: 250, opacity: 0.06 }} viewBox="0 0 100 100" fill="none">
        <path d="M50 95 C50 95 20 80 20 50 C20 30 35 15 50 10 C65 15 80 30 80 50 C80 80 50 95 50 95Z" stroke="#BFA76A" strokeWidth="0.5" fill="none" />
        <circle cx="80" cy="25" r="6" fill="#BFA76A" opacity="0.4" />
        <circle cx="75" cy="40" r="3" fill="#BFA76A" opacity="0.25" />
        <circle cx="85" cy="50" r="2.5" fill="#BFA76A" opacity="0.2" />
      </svg>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col items-center gap-10 py-24 md:py-28">
        <h2
          ref={titleRef}
          className="font-serif text-center opacity-0"
          style={{
            color: '#F5F0E8',
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.1,
            fontWeight: 600,
          }}
        >
          JOIN ME IN THE <span style={{ color: '#BFA76A' }}>GRAY</span>.
        </h2>

        <p
          ref={scriptRef}
          className="font-script opacity-0"
          style={{
            color: '#C9A9A6',
            fontSize: 'clamp(24px, 3vw, 36px)',
            lineHeight: 1,
          }}
        >
          together
        </p>

        <div ref={linksRef} className="flex flex-col items-center gap-6 opacity-0">
          <div className="flex items-center gap-8">
            {[
              { label: 'Email', href: 'mailto:hello@gastoncollective.com' },
              { label: 'Contact', href: '/written-word#contact' },
              { label: 'Events', href: '/events' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-sm transition-opacity duration-300 hover:opacity-100"
                style={{ color: '#F5F0E8', opacity: 0.65, textDecoration: 'none' }}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/privacy"
              className="font-sans text-sm transition-opacity duration-300 hover:opacity-100"
              style={{ color: '#F5F0E8', opacity: 0.65, textDecoration: 'none' }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="font-sans text-sm transition-opacity duration-300 hover:opacity-100"
              style={{ color: '#F5F0E8', opacity: 0.65, textDecoration: 'none' }}
            >
              Terms
            </Link>
            <Link
              to="/admin"
              className="font-sans text-sm transition-opacity duration-300 hover:opacity-100"
              style={{ color: '#F5F0E8', opacity: 0.35, textDecoration: 'none' }}
            >
              Admin
            </Link>
          </div>
          <p className="font-sans text-xs" style={{ color: '#F5F0E8', opacity: 0.55 }}>
            2026 The Gaston Collective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
