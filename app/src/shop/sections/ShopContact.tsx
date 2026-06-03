import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';

gsap.registerPlugin(ScrollTrigger);

export default function ShopContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({ name: '', email: '', order: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const createMessage = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: '', email: '', order: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo(formRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMessage.mutate({
      name: formData.name,
      email: formData.email,
      subject: formData.order ? `Order: ${formData.order}` : 'Shop Inquiry',
      message: formData.message,
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.6 }}>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
                style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.6 }}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
                style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.6 }}>Order Number (if applicable)</label>
            <input type="text" name="order" value={formData.order} onChange={handleChange}
              placeholder="For questions about an existing order"
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A]"
              style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
          </div>

          <div className="mb-10">
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.6 }}>Message *</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
              placeholder="Custom order request, shipping question, or anything else..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#5A8A7A] resize-none"
              style={{ color: '#5A4A6E', borderColor: '#D0E4DC', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <button type="submit" disabled={createMessage.isPending}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#5A8A7A] hover:text-[#FFF8E7] hover:border-[#5A8A7A] disabled:opacity-50"
              style={{ color: '#5A8A7A', borderColor: '#5A8A7A', backgroundColor: 'transparent' }} data-cursor-hover>
              {createMessage.isPending ? 'Sending...' : submitted ? 'Message sent!' : 'Send Message'}
            </button>
            {submitted && (
              <p className="font-script" style={{ color: '#D4B8E0', fontSize: 20 }}>
                Thanks! We'll get back to you soon.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
