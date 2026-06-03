const MARQUEE_TEXT = 'Tattoos. Stories. Stickers. Bookmarks. All living under one roof because creativity doesn\'t fit in boxes.';

export default function AboutStrip() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#EDE6D9', padding: '60px 0' }}>
      <div className="absolute top-0 left-0 w-full" style={{ height: 1, background: 'linear-gradient(to right, transparent, #BFA76A40, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-full" style={{ height: 1, background: 'linear-gradient(to right, transparent, #BFA76A40, transparent)' }} />
      <div className="relative z-10 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {[0, 1].map((j) => (
            <span key={j} className="font-script inline-block" style={{ color: '#7B3B4F', opacity: 0.5, fontSize: 'clamp(24px, 3vw, 36px)' }}>
              {MARQUEE_TEXT}&nbsp;&nbsp;—&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
