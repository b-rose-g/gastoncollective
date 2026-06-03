import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VelvetNav from '../velvet-ink/components/VelvetNav';
import VelvetHero from '../velvet-ink/sections/VelvetHero';
import VelvetAbout from '../velvet-ink/sections/VelvetAbout';
import VelvetGallery from '../velvet-ink/sections/VelvetGallery';
import VelvetContact from '../velvet-ink/sections/VelvetContact';
import VelvetFooter from '../velvet-ink/sections/VelvetFooter';

gsap.registerPlugin(ScrollTrigger);

export default function VelvetInkPage() {
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="velvet-ink-page">
      <VelvetNav />
      <main>
        <VelvetHero />
        <VelvetAbout />
        <VelvetGallery />
        <VelvetContact />
        <VelvetFooter />
      </main>
    </div>
  );
}
