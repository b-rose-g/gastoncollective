import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';
import { submitContactMessage } from '@/lib/contactMessages';

gsap.registerPlugin(ScrollTrigger);

export default function ShopContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({ name: '', email: '', order: '', message: '' });
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

  useEffect(() => {
    const handleProductInquiry = (event: Event) => {
      const productName = (event as CustomEvent<string>).detail;
      if (!productName) return;
      setFormData((prev) => ({
        ...prev,
        order: productName,
        message: prev.message || `I would like to ask about ${productName}.`,
      }));
    };

    window.addEventListener('shop-product-inquiry', handleProductInquiry);
    return () => window.removeEventListener('shop-product-inquiry', handleProductInquiry);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        subject: formData.order ? `Shop inquiry: ${formData.order}` : 'Shop Inquiry',
        message: formData.message,
        source: 'shop',
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', order: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitted(false);
      setFormError(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="relative" style={{ backgroundColor: '#E8F4F0' }}>
      <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 py-32 md:py-40">
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span className="font-sans text-xs uppercase tracking-[0.2em] block mb-4" style={{ color: '#5A8A7A', opacity: 0.7 }}>
            Questions?
          </span>
          <h2 className="font-serif" style={{ color: '#5A4A6E', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, fontWeight: 600 }}>
            GET IN <span style={{ color: '#5A8A7A' }}>TOUCH</span>
          </h2>
          <p className="font-script mt-4" style={{ color: '#7A6B8A', fontSize: 'clamp(20px, 2.5vw, 28px)' }}>
            custom orders, questions, or just to say hi
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { title: 'Ordering', body: 'Use this form to inquire or preorder. I will confirm availability, payment, and pickup or shipping before anything is charged.' },
              { title: 'Fulfillment', body: 'In-stock stickers usually ship or become ready for pickup within 3-5 business days after payment confirmation.' },
              { title: 'Returns', body: 'Unused physical goods can be returned within 14 days. Custom commissions are final after approval and production begins.' },
            ].map((item) => (
              <div key={item.title} style={{ borderTop: '1px solid #B7D6CB', paddingTop: 16 }}>
                <h3 className="font-serif" style={{ color: '#5A4A6E', fontSize: 20, fontWeight: 600 }}>{item.title}</h3>
                <p className="font-sans mt-2" style={{ color: '#5A4A6E', fontSize: 13, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="shop-contact-name" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Name *</label>
              <input id="shop-contact-name" type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
                style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
            <div>
              <label htmlFor="shop-contact-email" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Email *</label>
              <input id="shop-contact-email" type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
                style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="shop-contact-order" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Product or Order Number</label>
            <input id="shop-contact-order" type="text" name="order" value={formData.order} onChange={handleChange}
              placeholder="For questions about an existing order"
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
              style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
          </div>

          <div className="mb-10">
            <label htmlFor="shop-contact-message" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Message *</label>
            <textarea id="shop-contact-message" name="message" value={formData.message} onChange={handleChange} required rows={5}
              placeholder="Custom order request, shipping question, or anything else..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A] resize-none"
              style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <button type="submit" disabled={isSubmitting}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#5A8A7A] hover:text-[#FFF8E7] hover:border-[#5A8A7A] disabled:opacity-50"
              style={{ color: '#5A8A7A', borderColor: '#5A8A7A', backgroundColor: 'transparent' }} data-cursor-hover>
              {isSubmitting ? 'Sending...' : submitted ? 'Message sent!' : 'Send Message'}
            </button>
            {submitted && (
              <p className="font-script" style={{ color: '#D4B8E0', fontSize: 20 }}>
                Thanks! We'll get back to you soon.
              </p>
            )}
            {formError && (
              <p role="alert" className="font-sans text-sm text-center" style={{ color: '#7A2F4B' }}>
                {formError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
