import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, X } from 'lucide-react';
import DateTimePicker from '../components/DateTimePicker';
import { submitBookingInquiry } from '@/lib/inquiries';
import { prefersReducedMotion, revealImmediately } from '@/lib/motion';
import { REFERENCE_IMAGE_ACCEPT, getReferenceImageValidationError, uploadReferenceImages } from '@/lib/uploads';

gsap.registerPlugin(ScrollTrigger);

interface TimeSelection {
  date: string;
  time: string;
  label: string;
}

function toDatabaseTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return value.trim();

  const [, rawHour, minutes, meridiem] = match;
  let hour = Number(rawHour);

  if (meridiem.toUpperCase() === 'PM' && hour < 12) hour += 12;
  if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minutes}:00`;
}

function formatPreferredSelections(selections: TimeSelection[]) {
  return selections.map((selection) => selection.label).join('\n');
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
    budget: '',
    message: '',
  });
  const [dateSelections, setDateSelections] = useState<TimeSelection[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      revealImmediately([headingRef.current, formRef.current]);
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

  const addReferenceFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;

    const nextFiles = [...files, ...incoming];
    const validationError = getReferenceImageValidationError(nextFiles);

    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);
    setFiles(nextFiles);
  }, [files]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addReferenceFiles(Array.from(e.dataTransfer.files));
  }, [addReferenceFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addReferenceFiles(Array.from(e.currentTarget.files || []));
    e.currentTarget.value = '';
  };

  const removeFile = (index: number) => {
    setFileError(null);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setFormError(null);

    const validationError = getReferenceImageValidationError(files);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);

    if (dateSelections.length === 0) {
      setFormError('Please choose at least one preferred date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaded = await uploadReferenceImages(files);
      const [primarySelection] = dateSelections;
      const preferredSelections = formatPreferredSelections(dateSelections);
      const messageWithPreferredTimes = [
        formData.message.trim(),
        preferredSelections ? `Preferred dates and times:\n${preferredSelections}` : '',
      ].filter(Boolean).join('\n\n');

      await submitBookingInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        tattooIdea: formData.description,
        placement: formData.placement,
        sizeEstimate: formData.size,
        preferredDate: primarySelection.date,
        preferredTime: toDatabaseTime(primarySelection.time),
        budget: formData.budget,
        referenceLinks: uploaded,
        message: messageWithPreferredTimes,
      });
      setSubmitted(true);
      setFormError(null);
      setFileError(null);
      setFormData({ name: '', email: '', phone: '', description: '', size: '', placement: '', budget: '', message: '' });
      setDateSelections([]);
      setFiles([]);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitted(false);
      setFormError(error instanceof Error ? error.message : 'Your booking request could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <label htmlFor="velvet-booking-name" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                Name *
              </label>
              <input
                id="velvet-booking-name"
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
              <label htmlFor="velvet-booking-email" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                Email *
              </label>
              <input
                id="velvet-booking-email"
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
            <label htmlFor="velvet-booking-phone" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
              Phone
            </label>
            <input
              id="velvet-booking-phone"
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
            <label htmlFor="velvet-booking-description" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
              Describe what you want *
            </label>
            <textarea
              id="velvet-booking-description"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div>
              <label htmlFor="velvet-booking-size" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                Approximate Size
              </label>
              <input
                id="velvet-booking-size"
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
              <label htmlFor="velvet-booking-placement" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                Placement
              </label>
              <input
                id="velvet-booking-placement"
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
            <div>
              <label htmlFor="velvet-booking-budget" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
                Budget
              </label>
              <input
                id="velvet-booking-budget"
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $150-$300"
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
            <p id="velvet-date-picker-label" className="font-sans text-xs uppercase tracking-[0.15em] block mb-6" style={{ color: '#E8DDD4', opacity: 0.75 }}>
              Preferred Dates & Times (pick up to 3) *
            </p>
            <DateTimePicker
              selections={dateSelections}
              onChange={setDateSelections}
            />
          </div>

          <div className="mb-10">
            <label htmlFor="velvet-booking-message" className="font-sans text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: '#E8DDD4', opacity: 0.75 }}>
              Anything else I should know?
            </label>
            <textarea
              id="velvet-booking-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Timing notes, accessibility needs, questions, or extra context..."
              className="w-full px-0 py-3 font-sans text-base bg-transparent border-b outline-none transition-colors duration-300 focus:border-[#D14A6E] resize-none"
              style={{
                color: '#E8DDD4',
                borderColor: '#1A1A1A',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
              }}
            />
          </div>

          {/* File Upload */}
          <div className="mb-10">
            <label htmlFor="file-input" className="font-sans text-xs uppercase tracking-[0.15em] block mb-3" style={{ color: '#E8DDD4', opacity: 0.75 }}>
              Reference Photos (optional, max 5)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('file-input')?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-controls="file-input"
              className="relative flex flex-col items-center justify-center py-10 px-6 cursor-pointer transition-all duration-300"
              style={{
                border: dragOver ? '1px dashed #D14A6E' : '1px dashed #1A1A1A',
                backgroundColor: dragOver ? 'rgba(209, 74, 110, 0.05)' : 'transparent',
              }}
              data-cursor-hover
            >
              <Upload size={24} style={{ color: '#D14A6E', opacity: 0.6 }} />
              <p className="font-sans text-sm mt-3" style={{ color: '#E8DDD4', opacity: 0.5 }}>
                JPG, PNG, or WebP. Up to 5 files, 5 MB each.
              </p>
              <input
                id="file-input"
                type="file"
                accept={REFERENCE_IMAGE_ACCEPT}
                multiple
                onChange={handleFileSelect}
                aria-label="Upload tattoo reference photos"
                className="hidden"
              />
            </div>
            {fileError && (
              <p role="alert" className="font-sans text-sm mt-3" style={{ color: '#F4A5AE' }}>
                {fileError}
              </p>
            )}

            {/* File previews */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group" style={{ width: 80, height: 80 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={80}
                      height={80}
                      decoding="async"
                      className="w-full h-full object-cover"
                      style={{ border: '1px solid #1A1A1A' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove reference photo ${file.name}`}
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
              disabled={isSubmitting}
              className="font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 hover:bg-[#D14A6E] hover:text-[#0A0A0A] hover:border-[#D14A6E] disabled:opacity-50"
              style={{
                color: '#D14A6E',
                borderColor: '#D14A6E',
                backgroundColor: 'transparent',
              }}
              data-cursor-hover
            >
              {isSubmitting ? 'Sending...' : submitted ? 'Sent! We will be in touch.' : 'Submit Request'}
            </button>

            {submitted && (
              <p className="font-script" style={{ color: '#F4A5AE', fontSize: 20 }}>
                Your request is in. I'll reach out within 48 hours.
              </p>
            )}
            {formError && (
              <p role="alert" className="font-sans text-sm text-center" style={{ color: '#F4A5AE' }}>
                {formError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
