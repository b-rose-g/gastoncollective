import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WrittenNav from '../written-word/components/WrittenNav';
import WrittenHero from '../written-word/sections/WrittenHero';
import WrittenAbout from '../written-word/sections/WrittenAbout';
import WrittenBooks from '../written-word/sections/WrittenBooks';
import WrittenContact from '../written-word/sections/WrittenContact';
import WrittenFooter from '../written-word/sections/WrittenFooter';

gsap.registerPlugin(ScrollTrigger);

export default function WrittenWordPage() {
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="written-word-page">
      <WrittenNav />
      <main>
        <WrittenHero />
        <WrittenAbout />
        <WrittenBooks />
        <WrittenContact />
        <WrittenFooter />
      </main>
    </div>
  );
}
