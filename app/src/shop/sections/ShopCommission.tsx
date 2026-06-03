import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, X } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';
import { uploadReferenceImages } from '@/lib/uploads';

gsap.registerPlugin(ScrollTrigger);

export default function ShopCommission() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    commissionType: '',
    description: '',
    size: '',
    budget: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createCommission = trpc.commission.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormError(null);
      setFormData({ name: '', email: '', commissionType: '', description: '', size: '', budget: '' });
      setFiles([]);
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...dropped].slice(0, 3));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setFormError(null);
    setUploading(true);

    try {
      const uploaded = await uploadReferenceImages(files);
      await createCommission.mutateAsync({
        name: formData.name,
        email: formData.email,
        commissionType: formData.commissionType,
        description: formData.description,
        size: formData.size || undefined,
        budget: formData.budget || undefined,
        referenceImages: uploaded.length > 0 ? JSON.stringify(uploaded) : undefined,
      });
    } catch (error) {
      setSubmitted(false);
      setFormError(error instanceof Error ? error.message : 'Your commission request could not be sent. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="commission" ref={sectionRef} className="relative" style={{ backgroundColor: '#F8F0FF' }}>
      <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 py-32 md:py-40">
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span className="font-sans text-xs uppercase tracking-[0.2em] block mb-4" style={{ color: '#A67B5B', opacity: 0.7 }}>Custom Work</span>
          <h2 className="font-serif" style={{ color: '#5A4A6E', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, fontWeight: 600 }}>
            COMMISSION <span style={{ color: '#A67B5B' }}>ART</span>
          </h2>
          <p className="font-script mt-4" style={{ color: '#7A6B8A', fontSize: 'clamp(20px, 2.5vw, 28px)' }}>
            want something one-of-a-kind? let's talk.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="commission-name" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Name *</label>
              <input id="commission-name" type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0]"
                style={{ color: '#5A4A6E', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
            <div>
              <label htmlFor="commission-email" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Email *</label>
              <input id="commission-email" type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0]"
                style={{ color: '#5A4A6E', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="commission-type" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>What are you looking for? *</label>
            <select id="commission-type" name="commissionType" value={formData.commissionType} onChange={handleChange} required
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0] appearance-none"
              style={{ color: formData.commissionType ? '#5A4A6E' : '#A89B8C', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
              <option value="" disabled style={{ backgroundColor: '#F8F0FF' }}>Select a type...</option>
              <option value="sticker-design" style={{ backgroundColor: '#F8F0FF', color: '#5A4A6E' }}>Custom Sticker Design</option>
              <option value="bookmark-art" style={{ backgroundColor: '#F8F0FF', color: '#5A4A6E' }}>Bookmark Art</option>
              <option value="tattoo-design" style={{ backgroundColor: '#F8F0FF', color: '#5A4A6E' }}>Tattoo Design</option>
              <option value="illustration" style={{ backgroundColor: '#F8F0FF', color: '#5A4A6E' }}>Custom Illustration</option>
              <option value="other" style={{ backgroundColor: '#F8F0FF', color: '#5A4A6E' }}>Something Else</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="commission-description" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Tell me about your vision *</label>
            <textarea id="commission-description" name="description" value={formData.description} onChange={handleChange} required rows={4}
              placeholder="Style, colors, subject matter, mood, any specific details..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0] resize-none"
              style={{ color: '#5A4A6E', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="commission-size" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Size / Format</label>
              <input id="commission-size" type="text" name="size" value={formData.size} onChange={handleChange}
                placeholder="e.g., 3-inch circle, 5x7 print"
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0]"
                style={{ color: '#5A4A6E', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
            <div>
              <label htmlFor="commission-budget" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#5A4A6E', opacity: 0.75 }}>Budget</label>
              <input id="commission-budget" type="text" name="budget" value={formData.budget} onChange={handleChange}
                placeholder="e.g., $50-$100"
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D4B8E0]"
                style={{ color: '#5A4A6E', borderColor: '#E8DDD0', borderBottomWidth: 1, borderBottomStyle: 'solid' }} />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-10">
            <label htmlFor="commission-file-input" className="font-sans text-xs uppercase tracking-[0.15em] block mb-3" style={{ color: '#5A4A6E', opacity: 0.75 }}>Reference Images (optional, max 3)</label>
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop}
              onClick={() => document.getElementById('commission-file-input')?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('commission-file-input')?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-controls="commission-file-input"
              className="relative flex flex-col items-center justify-center py-10 px-6 cursor-pointer transition-all duration-300"
              style={{ border: dragOver ? '1px dashed #D4B8E0' : '1px dashed #E8DDD0', backgroundColor: dragOver ? 'rgba(212, 184, 224, 0.08)' : 'transparent', borderRadius: 12 }}
              data-cursor-hover>
              <Upload size={24} style={{ color: '#D4B8E0', opacity: 0.6 }} />
              <p className="font-sans text-sm mt-3" style={{ color: '#7A6B8A', opacity: 0.6 }}>Drag & drop images here or click to browse</p>
              <input id="commission-file-input" type="file" accept="image/*" multiple onChange={handleFileSelect} aria-label="Upload commission reference images" className="hidden" />
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group" style={{ width: 80, height: 80 }}>
                    <img src={URL.createObjectURL(file)} alt={file.name} width={80} height={80} decoding="async" className="w-full h-full object-cover" style={{ border: '1px solid #E8DDD0', borderRadius: 8 }} />
                    <button type="button" onClick={() => removeFile(i)}
                      aria-label={`Remove reference image ${file.name}`}
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: '#D4B8E0', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button type="submit" disabled={createCommission.isPending || uploading}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#A67B5B] hover:text-[#FFF8E7] hover:border-[#A67B5B] disabled:opacity-50"
              style={{ color: '#A67B5B', borderColor: '#A67B5B', backgroundColor: 'transparent' }} data-cursor-hover>
              {createCommission.isPending || uploading ? 'Sending...' : submitted ? 'Request Sent!' : 'Submit Request'}
            </button>
            {submitted && (
              <p className="font-script" style={{ color: '#D4B8E0', fontSize: 20 }}>Thank you! I'll review your request and get back to you soon.</p>
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
