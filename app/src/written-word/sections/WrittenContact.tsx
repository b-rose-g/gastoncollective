import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';
import { submitContactMessage } from '@/lib/contactMessages';

gsap.registerPlugin(ScrollTrigger);

export default function WrittenContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, formRef.current]);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo(formRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setFormError(null);
    setIsSubmitting(true);

    try {
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: null,
        subject: formData.subject || formData.message.slice(0, 50),
        message: formData.message,
        source: 'written-word',
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitted(false);
      setFormError(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: '#FAF8F4' }}
    >
      <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 py-32 md:py-40">
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span className="font-sans text-xs uppercase tracking-[0.2em] block mb-4" style={{ color: '#A67B5B', opacity: 0.7 }}>
            Get In Touch
          </span>
          <h2
            className="font-serif"
            style={{ color: '#3B2317', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, fontWeight: 600 }}
          >
            SAY <span style={{ color: '#A67B5B' }}>HELLO</span>
          </h2>
          <p className="font-script mt-4" style={{ color: '#8B7355', fontSize: 'clamp(20px, 2.5vw, 28px)' }}>
            I'd love to hear from you
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="written-contact-name" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#3B2317', opacity: 0.75 }}>Name *</label>
              <input
                id="written-contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#A67B5B]"
                style={{ color: '#3B2317', borderColor: '#E8E2D9', borderBottomWidth: 1, borderBottomStyle: 'solid' }}
              />
            </div>
            <div>
              <label htmlFor="written-contact-email" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#3B2317', opacity: 0.75 }}>Email *</label>
              <input
                id="written-contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#A67B5B]"
                style={{ color: '#3B2317', borderColor: '#E8E2D9', borderBottomWidth: 1, borderBottomStyle: 'solid' }}
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="written-contact-subject" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#3B2317', opacity: 0.75 }}>Subject *</label>
            <select
              id="written-contact-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#A67B5B] appearance-none"
              style={{ color: formData.subject ? '#3B2317' : '#A89B8C', borderColor: '#E8E2D9', borderBottomWidth: 1, borderBottomStyle: 'solid' }}
            >
              <option value="" disabled style={{ backgroundColor: '#FAF8F4' }}>What is this about?</option>
              <option value="book-question" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Question about a book</option>
              <option value="review" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Share a review or testimonial</option>
              <option value="event" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Book signing / event inquiry</option>
              <option value="collab" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Collaboration opportunity</option>
              <option value="fan" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Just wanted to say hi</option>
              <option value="other" style={{ backgroundColor: '#FAF8F4', color: '#3B2317' }}>Something else</option>
            </select>
          </div>

          <div className="mb-10">
            <label htmlFor="written-contact-message" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#3B2317', opacity: 0.75 }}>Message *</label>
            <textarea
              id="written-contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Your thoughts, questions, or just a friendly note..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#A67B5B] resize-none"
              style={{ color: '#3B2317', borderColor: '#E8E2D9', borderBottomWidth: 1, borderBottomStyle: 'solid' }}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
              <button
              type="submit"
              disabled={isSubmitting}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FAF8F4] hover:border-[#A67B5B] disabled:opacity-50"
              style={{ color: '#A67B5B', borderColor: '#A67B5B', backgroundColor: 'transparent' }}
              data-cursor-hover
            >
              {isSubmitting ? 'Sending...' : submitted ? 'Message sent!' : 'Send Message'}
            </button>
            {submitted && (
              <p className="font-script" style={{ color: '#8B7355', fontSize: 20 }}>
                Thank you for reaching out. I'll write back soon.
              </p>
            )}
            {formError && (
              <p role="alert" className="font-sans text-sm text-center" style={{ color: '#8A2F2F' }}>
                {formError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
