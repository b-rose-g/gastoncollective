import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WrittenNav from '../written-word/components/WrittenNav';
import WrittenHero from '../written-word/sections/WrittenHero';
import WrittenAbout from '../written-word/sections/WrittenAbout';
import WrittenBooks from '../written-word/sections/WrittenBooks';
import WrittenContact from '../written-word/sections/WrittenContact';
import WrittenFooter from '../written-word/sections/WrittenFooter';
import SiteContentBand from '../sections/SiteContentBand';
import { prefersReducedMotion } from '@/lib/motion';
import { routeMetadata, usePageMetadata } from '@/lib/seo';

gsap.registerPlugin(ScrollTrigger);

export default function WrittenWordPage() {
  usePageMetadata(routeMetadata.writtenWord);

  useEffect(() => {
    if (!prefersReducedMotion()) ScrollTrigger.refresh();
  }, []);

  return (
    <div className="written-word-page">
      <WrittenNav />
      <main>
        <SiteContentBand location="written_word" limit={3} tone="written" topPlacement />
        <WrittenHero />
        <WrittenAbout />
        <WrittenBooks />
        <WrittenContact />
        <WrittenFooter />
      </main>
    </div>
  );
}
