import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, X } from 'lucide-react';
import DateTimePicker from '../components/DateTimePicker';
import { trpc } from '@/providers/trpc';

gsap.registerPlugin(ScrollTrigger);

interface TimeSelection {
  date: string;
  time: string;
  label: string;
}

export default function VelvetContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    size: '',
    placement: '',
  });
  const [dateSelections, setDateSelections] = useState<TimeSelection[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', description: '', size: '', placement: '' });
      setDateSelections([]);
      setFiles([]);
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  useEffect(() => {
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
        formRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...dropped].slice(0, 5));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preferredDates = dateSelections.map((d) => `${d.date} ${d.time}`).join('; ');
    createBooking.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      description: formData.description,
      size: formData.size || undefined,
      placement: formData.placement || undefined,
      preferredDates: preferredDates || undefined,
      referenceImages: files.length > 0 ? files.map((f) => f.name).join(', ') : undefined,
    });
  };

  return (
    <section
      id="book"
      ref={sectionRef}
      className="noise-overlay relative"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 py-32 md:py-40">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <span
            className="font-sans text-xs uppercase tracking-[0.2em] block mb-4"
            style={{ color: '#D14A6E', opacity: 0.7 }}
          >
            Booking
          </span>
          <h2
            className="font-serif"
            style={{
              color: '#E8DDD4',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            BOOK YOUR <span style={{ color: '#D14A6E' }}>SESSION</span>
          </h2>
          <p
            className="font-script mt-4"
            style={{ color: '#F4A5AE', fontSize: 'clamp(20px, 2.5vw, 28px)' }}
          >
            tell me what you're dreaming of
          </p>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="opacity-0">
          {/* Name + Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E]"
                style={{
                  color: '#E8DDD4',
                  borderColor: '#1A1A1A',
                  borderBottomWidth: 1,
                  borderBottomStyle: 'solid',
                }}
              />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E]"
                style={{
                  color: '#E8DDD4',
                  borderColor: '#1A1A1A',
                  borderBottomWidth: 1,
                  borderBottomStyle: 'solid',
                }}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E]"
              style={{
                color: '#E8DDD4',
                borderColor: '#1A1A1A',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
              }}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
              Describe what you want *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Style, subject matter, any specific details or meaning behind the piece..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E] resize-none"
              style={{
                color: '#E8DDD4',
                borderColor: '#1A1A1A',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
              }}
            />
          </div>

          {/* Size + Placement Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
                Approximate Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., 4x3 inches, palm-sized"
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E]"
                style={{
                  color: '#E8DDD4',
                  borderColor: '#1A1A1A',
                  borderBottomWidth: 1,
                  borderBottomStyle: 'solid',
                }}
              />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.6 }}>
                Placement
              </label>
              <input
                type="text"
                name="placement"
                value={formData.placement}
                onChange={handleChange}
                placeholder="e.g., forearm, ribcage, back"
                className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E]"
                style={{
                  color: '#E8DDD4',
                  borderColor: '#1A1A1A',
                  borderBottomWidth: 1,
                  borderBottomStyle: 'solid',
                }}
              />
            </div>
          </div>

          {/* Date & Time Calendar Picker */}
          <div className="mb-10 p-6 md:p-8" style={{ border: '1px solid #1A1A1A' }}>
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-6" style={{ color: '#E8DDD4', opacity: 0.6 }}>
              Preferred Dates & Times (pick up to 3) *
            </label>
            <DateTimePicker
              selections={dateSelections}
              onChange={setDateSelections}
            />
          </div>

          {/* File Upload */}
          <div className="mb-10">
            <label className="font-sans text-xs uppercase tracking-[0.15em] block mb-3" style={{ color: '#E8DDD4', opacity: 0.6 }}>
              Reference Photos (optional, max 5)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className="relative flex flex-col items-center justify-center py-10 px-6 cursor-pointer transition-all duration-300"
              style={{
                border: dragOver ? '1px dashed #D14A6E' : '1px dashed #1A1A1A',
                backgroundColor: dragOver ? 'rgba(209, 74, 110, 0.05)' : 'transparent',
              }}
              data-cursor-hover
            >
              <Upload size={24} style={{ color: '#D14A6E', opacity: 0.6 }} />
              <p className="font-sans text-sm mt-3" style={{ color: '#E8DDD4', opacity: 0.5 }}>
                Drag & drop images here or click to browse
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group" style={{ width: 80, height: 80 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      style={{ border: '1px solid #1A1A1A' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: '#D14A6E', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={createBooking.isPending}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#D14A6E] hover:text-[#0A0A0A] hover:border-[#D14A6E] disabled:opacity-50"
              style={{
                color: '#D14A6E',
                borderColor: '#D14A6E',
                backgroundColor: 'transparent',
              }}
              data-cursor-hover
            >
              {createBooking.isPending ? 'Sending...' : submitted ? 'Sent! We will be in touch.' : 'Submit Request'}
            </button>

            {submitted && (
              <p className="font-script" style={{ color: '#F4A5AE', fontSize: 20 }}>
                Your request is in. I'll reach out within 48 hours.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
