import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function WrittenBooks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, contentRef.current]);
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

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="books"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#F2EDE6' }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-32 md:py-40">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span
            className="font-sans text-xs uppercase tracking-[0.2em] block mb-4"
            style={{ color: '#A67B5B', opacity: 0.7 }}
          >
            Available Now
          </span>
          <h2
            className="font-serif"
            style={{
              color: '#3B2317',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            THE <span style={{ color: '#A67B5B' }}>BOOK</span>
          </h2>
        </div>

        {/* Single Book Showcase */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center opacity-0"
        >
          {/* Book Cover */}
          <div
            className="relative mx-auto md:mx-0 transition-all duration-500"
            style={{
              maxWidth: 380,
              boxShadow: isHovered
                ? '0 0 60px rgba(166, 123, 91, 0.2)'
                : '0 16px 48px rgba(59, 35, 23, 0.15)',
              transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
              <img
                src="/images/book_reach_for_the_stars.png"
                alt="Reach For The Stars - Intro To Mental Health Workbook by Kimberlin Gaston"
                width={441}
                height={628}
                decoding="async"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover overlay with purchase button */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-400"
                style={{
                  backgroundColor: 'rgba(59, 35, 23, 0.5)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <a
                  href="https://www.lulu.com/shop/kimberlin-gaston/reach-for-the-stars/paperback/product-956dw44.html?page=1&pageSize=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-4 border flex items-center gap-3 transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FAF8F4] hover:border-[#A67B5B]"
                  style={{ color: '#A67B5B', borderColor: '#A67B5B', textDecoration: 'none' }}
                  data-cursor-hover
                >
                  Purchase <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Offset accent border */}
            <div
              className="absolute inset-0 pointer-events-none transition-transform duration-500"
              style={{
                border: '1px solid rgba(166, 123, 91, 0.25)',
                transform: isHovered
                  ? 'translate(6px, 6px)'
                  : 'translate(10px, 10px)',
              }}
            />
          </div>

          {/* Book Info */}
          <div className="flex flex-col gap-6">
            <span
              className="font-sans text-xs uppercase tracking-[0.15em]"
              style={{ color: '#A67B5B', opacity: 0.7 }}
            >
              Mental Health Workbook
            </span>

            <h3
              className="font-serif"
              style={{
                color: '#3B2317',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              Reach For The Stars
            </h3>

            <p
              className="font-script"
              style={{
                color: '#8B7355',
                fontSize: 'clamp(20px, 2.5vw, 26px)',
                lineHeight: 1.3,
              }}
            >
              by Kimberlin Gaston
            </p>

            <div
              className="origin-left"
              style={{
                width: 60,
                height: 1,
                backgroundColor: '#A67B5B',
                opacity: 0.4,
              }}
            />

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              Reach for the Stars is more than just a workbook—it's a guided journey through healing, creativity, and self-discovery. Designed to support mental wellness in a gentle, engaging way, this unique book combines powerful prompts, reflection exercises, and hand-drawn coloring pages to help you slow down, express yourself, and reconnect with your inner strength.
            </p>

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              Whether you're navigating anxiety, burnout, self-doubt, or simply seeking a moment of peace, Reach for the Stars offers a safe space to explore your thoughts and feelings. Each section is thoughtfully created to encourage mindfulness, build emotional resilience, and spark joy—while the whimsical, original artwork invites you to relax and color your way through the process.
            </p>

            <p
              className="font-sans"
              style={{
                color: '#5A4D42',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              This book is perfect for anyone who wants to take care of their mind and soul in a creative, approachable way. Wherever you are in your journey, you deserve to reach for the stars—and this book is here to help you every step of the way.
            </p>

            <a
              href="https://www.lulu.com/shop/kimberlin-gaston/reach-for-the-stars/paperback/product-956dw44.html?page=1&pageSize=4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-4 font-sans text-xs uppercase tracking-[0.2em] px-10 py-4 border transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FAF8F4] hover:border-[#A67B5B]"
              style={{
                color: '#A67B5B',
                borderColor: '#A67B5B',
                textDecoration: 'none',
                width: 'fit-content',
              }}
              data-cursor-hover
            >
              Buy on Lulu <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
