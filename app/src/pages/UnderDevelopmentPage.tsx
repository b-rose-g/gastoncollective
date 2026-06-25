import { ExternalLink } from 'lucide-react';
import { normalizeGastonContactMailto } from '@/lib/contact';
import { UNDER_DEVELOPMENT_DEFAULT_CONTENT, type SiteContentItem } from '@/lib/siteContent';
import { routeMetadata, usePageMetadata } from '@/lib/seo';

type UnderDevelopmentPageProps = {
  content?: Partial<SiteContentItem>;
};

export default function UnderDevelopmentPage({ content }: UnderDevelopmentPageProps) {
  usePageMetadata(routeMetadata.underDevelopment);

  const title = content?.title || UNDER_DEVELOPMENT_DEFAULT_CONTENT.title;
  const subtitle = content?.subtitle || UNDER_DEVELOPMENT_DEFAULT_CONTENT.subtitle;
  const body = content?.body || UNDER_DEVELOPMENT_DEFAULT_CONTENT.body;
  const buttonLabel = content?.button_label || UNDER_DEVELOPMENT_DEFAULT_CONTENT.button_label;
  const buttonUrl = normalizeGastonContactMailto(content?.button_url) || UNDER_DEVELOPMENT_DEFAULT_CONTENT.button_url;

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#F5F0E8', color: '#2D2D2D' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-12 w-px h-32" style={{ background: 'linear-gradient(to bottom, #C9A9A6, transparent)', opacity: 0.3 }} />
        <div className="absolute top-20 left-12 h-px w-24" style={{ background: 'linear-gradient(to right, #C9A9A6, transparent)', opacity: 0.3 }} />
        <div className="absolute bottom-32 right-12 w-px h-32" style={{ background: 'linear-gradient(to top, #BFA76A, transparent)', opacity: 0.3 }} />
        <div className="absolute bottom-32 right-12 h-px w-24" style={{ background: 'linear-gradient(to left, #BFA76A, transparent)', opacity: 0.3 }} />
      </div>

      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 py-16">
        <div className="max-w-[760px]">
          <p className="font-sans text-xs uppercase" style={{ color: '#7B3B4F', letterSpacing: '0.18em' }}>
            The Gaston Collective
          </p>
          <h1 className="font-serif mt-5" style={{ fontSize: 'clamp(42px, 7vw, 86px)', lineHeight: 0.98, fontWeight: 700 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="font-script mt-6" style={{ color: '#7B3B4F', fontSize: 'clamp(26px, 4vw, 42px)', lineHeight: 1.2 }}>
              {subtitle}
            </p>
          )}
          {body && (
            <p className="font-sans mt-6 max-w-2xl whitespace-pre-wrap" style={{ color: 'rgba(45,45,45,0.78)', fontSize: 17, lineHeight: 1.75 }}>
              {body}
            </p>
          )}
          {buttonUrl && (
            <a
              href={buttonUrl}
              target={isExternalUrl(buttonUrl) ? '_blank' : undefined}
              rel={isExternalUrl(buttonUrl) ? 'noreferrer' : undefined}
              className="font-sans text-xs uppercase inline-flex items-center gap-2 mt-9 px-5 py-3 transition-all duration-300"
              style={{ color: '#F5F0E8', backgroundColor: '#7B3B4F', border: '1px solid #7B3B4F', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.14em' }}
            >
              {buttonLabel || 'Contact us'}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}
