import { ExternalLink } from 'lucide-react';
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
  const buttonUrl = content?.button_url || UNDER_DEVELOPMENT_DEFAULT_CONTENT.button_url;
  const imageUrl = content?.image_url || UNDER_DEVELOPMENT_DEFAULT_CONTENT.image_url;

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0A0A0A', color: '#F5F0E8' }}>
      <div className="absolute inset-0">
        <img
          src={imageUrl || '/images/tattoo_2.jpg'}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.78) 46%, rgba(10,10,10,0.48) 100%)' }} />
      </div>

      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 py-16">
        <div className="max-w-[760px]">
          <p className="font-sans text-xs uppercase" style={{ color: '#F4A5AE', letterSpacing: '0.18em' }}>
            The Gaston Collective
          </p>
          <h1 className="font-serif mt-5" style={{ fontSize: 'clamp(42px, 7vw, 86px)', lineHeight: 0.98, fontWeight: 700 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="font-script mt-6" style={{ color: '#F4A5AE', fontSize: 'clamp(26px, 4vw, 42px)', lineHeight: 1.2 }}>
              {subtitle}
            </p>
          )}
          {body && (
            <p className="font-sans mt-6 max-w-2xl whitespace-pre-wrap" style={{ color: 'rgba(245,240,232,0.82)', fontSize: 17, lineHeight: 1.75 }}>
              {body}
            </p>
          )}
          {buttonUrl && (
            <a
              href={buttonUrl}
              target={isExternalUrl(buttonUrl) ? '_blank' : undefined}
              rel={isExternalUrl(buttonUrl) ? 'noreferrer' : undefined}
              className="font-sans text-xs uppercase inline-flex items-center gap-2 mt-9 px-5 py-3 transition-all duration-300"
              style={{ color: '#0A0A0A', backgroundColor: '#F4A5AE', border: '1px solid #F4A5AE', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.14em' }}
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
