import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function WrittenAbout() {
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
      gsap.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo(body1Ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo(body2Ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      gsap.fromTo(quoteRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#FAF8F4' }}
    >
      <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 py-32 md:py-40">
        <span className="font-sans text-xs uppercase tracking-[0.2em] block mb-8" style={{ color: '#A67B5B', opacity: 0.7 }}>
          The Author's Journey
        </span>

        <h2
          ref={headingRef}
          className="font-serif opacity-0"
          style={{ color: '#3B2317', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, fontWeight: 600 }}
        >
          FROM THE FIRST
          <br />
          <span style={{ color: '#A67B5B' }}>SCRATCH OF INK</span>
        </h2>

        <div className="mt-10 origin-left" style={{ width: 60, height: 1, backgroundColor: '#A67B5B', opacity: 0.4 }} />

        <p
          ref={body1Ref}
          className="font-sans mt-10 opacity-0"
          style={{ color: '#5A4D42', fontSize: 17, lineHeight: 1.8 }}
        >
          I started writing the way most people start breathing — without really deciding to. As a kid, I filled spiral notebooks with stories about worlds that didn't exist and people who felt more real than the ones around me. I'd stay up past midnight with a flashlight under the covers, not reading someone else's words, but scribbling my own. By the time I was sixteen, I had three unfinished novels and a certainty that this was the only thing I ever wanted to do. The certainty was naive. The desire wasn't.
        </p>

        <p
          ref={body2Ref}
          className="font-sans mt-6 opacity-0"
          style={{ color: '#5A4D42', fontSize: 17, lineHeight: 1.8 }}
        >
          The Gaston Collective was born from a simple belief: that stories matter, that poetry can wound and heal in the same breath, and that there's always someone out there who needs to read exactly the thing you're afraid to write. Under this umbrella, I publish fiction that pulls no punches, poetry that finds the beauty in the broken, and essays about the messy, complicated work of being human. Every book is a piece of my heart I decided was worth sharing. Whether you're here for a story to get lost in or words that feel like they were written just for you — welcome. I'm glad you found your way here.
        </p>

        <blockquote
          ref={quoteRef}
          className="font-script mt-12 pl-6 opacity-0"
          style={{ color: '#8B7355', fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.3, borderLeft: '2px solid #A67B5B' }}
        >
          "I write the things I wish someone had written for me."
        </blockquote>
      </div>
    </section>
  );
}
