import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function VelvetAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const body1Ref = useRef<HTMLParagraphElement>(null);
  const body2Ref = useRef<HTMLParagraphElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, body1Ref.current, body2Ref.current, quoteRef.current]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        body1Ref.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      gsap.fromTo(
        body2Ref.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="noise-overlay relative"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 py-32 md:py-40">
        {/* Section label */}
        <span
          className="font-sans text-xs uppercase tracking-[0.2em] block mb-8"
          style={{ color: '#D14A6E', opacity: 0.7 }}
        >
          About the Artist
        </span>

        <h2
          ref={headingRef}
          className="font-serif opacity-0"
          style={{
            color: '#E8DDD4',
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.1,
            fontWeight: 600,
          }}
        >
          THE STORY BEHIND
          <br />
          <span style={{ color: '#D14A6E' }}>THE NEEDLE</span>
        </h2>

        <div
          className="mt-10 origin-left"
          style={{ width: 60, height: 1, backgroundColor: '#D14A6E', opacity: 0.4 }}
        />

        <p
          ref={body1Ref}
          className="font-sans mt-10 opacity-0"
          style={{ color: '#E8DDD4', fontSize: 17, lineHeight: 1.8, opacity: 0.85 }}
        >
          Velvet Ink didn't start in a fancy studio with polished floors and perfect lighting. It started in a cramped apartment kitchen, sketching designs on napkins while the coffee went cold. I picked up my first machine at nineteen, terrified and obsessed in equal measure, and spent the next five years apprenticing under some of the most demanding artists in the city — learning that tattooing isn't just about putting ink in skin, it's about reading people, understanding their stories, and translating something intangible into something permanent.
        </p>

        <p
          ref={body2Ref}
          className="font-sans mt-6 opacity-0"
          style={{ color: '#E8DDD4', fontSize: 17, lineHeight: 1.8, opacity: 0.85 }}
        >
          Today, Velvet Ink is more than a tattoo and piercing studio — it's a space where you come exactly as you are. Whether you're getting your first tiny dot or a full sleeve, whether you know exactly what you want or just have a feeling you can't name, we'll figure it out together. I specialize in fine line florals, script work, and black-and-grey realism, but the truth is, the best pieces I've ever done were the ones where the client trusted me to take their idea somewhere unexpected. Piercings, too — from simple lobes to more adventurous placements, every single one is done with the same precision and care. This isn't a factory. This is where art meets skin, and every piece is a collaboration.
        </p>

        <blockquote
          ref={quoteRef}
          className="font-script mt-12 pl-6 opacity-0"
          style={{
            color: '#F4A5AE',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            lineHeight: 1.3,
            borderLeft: '2px solid #D14A6E',
          }}
        >
          "Every mark I make is someone's forever. I don't take that lightly."
        </blockquote>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {[
            { title: 'Service Area', body: 'By appointment in the Baton Rouge area, with exact studio details confirmed after booking.' },
            { title: 'Availability', body: 'Weekday evenings and select weekends. Requests are reviewed before a final appointment is confirmed.' },
            { title: 'Age Policy', body: 'Tattoos are 18+ with valid photo ID. Piercing requests follow local law and may require a parent or guardian.' },
            { title: 'Deposits', body: 'A non-refundable deposit may be required to hold your time. Give at least 48 hours notice for reschedules.' },
            { title: 'Pricing', body: 'Quotes depend on size, placement, detail, and prep time. Small simple pieces start with a studio minimum.' },
            { title: 'Safety', body: 'Single-use needles, sterile setup, barrier protection, and licensing/safety information are available on request.' },
            { title: 'Aftercare', body: 'Keep fresh work clean, lightly moisturized, and out of sun, pools, and soaking water while it heals.' },
            { title: 'Consults', body: 'Share references, placement, size, and timing in the form so I can respond with next steps and a realistic quote.' },
          ].map((item) => (
            <div key={item.title} style={{ borderTop: '1px solid rgba(209, 74, 110, 0.35)', paddingTop: 18 }}>
              <h3 className="font-serif" style={{ color: '#F4A5AE', fontSize: 22, fontWeight: 600 }}>
                {item.title}
              </h3>
              <p className="font-sans mt-2" style={{ color: '#E8DDD4', opacity: 0.85, fontSize: 14, lineHeight: 1.75 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
