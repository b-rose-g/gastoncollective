import { useEffect, useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import {
  getSiteContent,
  type SiteContentDisplayLocation,
  type SiteContentItem,
} from '@/lib/siteContent';

type SiteContentBandTone = 'light' | 'dark' | 'rose' | 'shop' | 'written';

type SiteContentBandProps = {
  location: SiteContentDisplayLocation;
  includeGlobal?: boolean;
  featuredOnly?: boolean;
  limit?: number;
  tone?: SiteContentBandTone;
  topPlacement?: boolean;
};

const toneStyles: Record<SiteContentBandTone, {
  section: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
}> = {
  light: {
    section: '#F5F0E8',
    card: '#FAF7F0',
    text: '#2D2D2D',
    muted: '#5F5650',
    accent: '#7B3B4F',
    border: '#E0D5C5',
  },
  dark: {
    section: '#141414',
    card: '#0A0A0A',
    text: '#E8DDD4',
    muted: 'rgba(232,221,212,0.68)',
    accent: '#D14A6E',
    border: '#2A2A2A',
  },
  rose: {
    section: '#F5F0E8',
    card: '#FFF8F7',
    text: '#2D2D2D',
    muted: '#5F5650',
    accent: '#D14A6E',
    border: '#F0D0D6',
  },
  shop: {
    section: '#F5F0E8',
    card: '#FAF7F0',
    text: '#2D2D2D',
    muted: '#5F5650',
    accent: '#A67B5B',
    border: '#E0D5C5',
  },
  written: {
    section: '#F8F3EC',
    card: '#FFFDF8',
    text: '#2D2D2D',
    muted: '#6A5C50',
    accent: '#7B3B4F',
    border: '#E5D8C8',
  },
};

export default function SiteContentBand({
  location,
  includeGlobal = false,
  featuredOnly = false,
  limit = 3,
  tone = 'light',
  topPlacement = false,
}: SiteContentBandProps) {
  const [items, setItems] = useState<SiteContentItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const content = await getSiteContent({
          locations: includeGlobal ? [location, 'global'] : [location],
          featuredOnly,
          limit,
        });
        if (active) setItems(content);
      } catch {
        if (active) setItems([]);
      }
    }

    void loadContent();

    return () => {
      active = false;
    };
  }, [featuredOnly, includeGlobal, limit, location]);

  if (items.length === 0) return null;

  const styles = toneStyles[tone];

  const sectionPadding = topPlacement ? 'px-6 md:px-12 pt-28 md:pt-[7.5rem] pb-8 md:pb-10' : 'px-6 md:px-12 py-8 md:py-10';

  return (
    <section className={sectionPadding} style={{ backgroundColor: styles.section }}>
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:items-center"
            style={{ border: `1px solid ${styles.border}`, borderRadius: 8, backgroundColor: styles.card, padding: 20 }}
          >
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="hidden sm:flex items-center justify-center shrink-0"
                style={{ width: 42, height: 42, borderRadius: 6, backgroundColor: `${styles.accent}18`, color: styles.accent }}
              >
                <Megaphone size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs uppercase" style={{ color: styles.accent, letterSpacing: '0.14em' }}>
                  {contentTypeLabel(item.content_type)}
                </p>
                {item.title && (
                  <h2 className="font-serif mt-2" style={{ color: styles.text, fontSize: 28, lineHeight: 1.15, fontWeight: 600 }}>
                    {item.title}
                  </h2>
                )}
                {item.subtitle && (
                  <p className="font-sans text-sm mt-2" style={{ color: styles.muted, lineHeight: 1.6 }}>
                    {item.subtitle}
                  </p>
                )}
                {item.body && (
                  <p className="font-sans text-sm mt-3 whitespace-pre-wrap" style={{ color: styles.muted, lineHeight: 1.7 }}>
                    {item.body}
                  </p>
                )}
              </div>
            </div>

            {item.button_url && (
              <a
                href={item.button_url}
                target={isExternalUrl(item.button_url) ? '_blank' : undefined}
                rel={isExternalUrl(item.button_url) ? 'noreferrer' : undefined}
                className="font-sans text-xs uppercase inline-flex items-center justify-center gap-2 px-4 py-3"
                style={{ color: styles.accent, border: `1px solid ${styles.border}`, borderRadius: 6, textDecoration: 'none', letterSpacing: '0.12em' }}
              >
                {item.button_label || 'Learn more'}
                <ExternalLink size={14} />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function contentTypeLabel(value: string | null | undefined) {
  return value
    ? value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : 'Announcement';
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}
