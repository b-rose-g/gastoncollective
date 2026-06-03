import NavigationPill from '../sections/NavigationPill';
import HeroSection from '../sections/HeroSection';
import AboutStrip from '../sections/AboutStrip';
import VenturesGrid from '../sections/VenturesGrid';
import FeaturedShowcase from '../sections/FeaturedShowcase';
import ShopSection from '../sections/ShopSection';
import FooterSection from '../sections/FooterSection';
import { routeMetadata, usePageMetadata } from '@/lib/seo';

export default function HomePage() {
  usePageMetadata(routeMetadata.home);

  return (
    <main style={{ backgroundColor: '#F5F0E8' }}>
      <NavigationPill />
      <HeroSection />
      <AboutStrip />
      <VenturesGrid />
      <FeaturedShowcase />
      <ShopSection />
      <FooterSection />
    </main>
  );
}
