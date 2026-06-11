import NavigationPill from '../sections/NavigationPill';
import HeroSection from '../sections/HeroSection';
import AboutStrip from '../sections/AboutStrip';
import VenturesGrid from '../sections/VenturesGrid';
import FeaturedShowcase from '../sections/FeaturedShowcase';
import UpcomingEventsSection from '../sections/UpcomingEventsSection';
import ShopSection from '../sections/ShopSection';
import FooterSection from '../sections/FooterSection';
import SiteContentBand from '../sections/SiteContentBand';
import { routeMetadata, usePageMetadata } from '@/lib/seo';

export default function HomePage() {
  usePageMetadata(routeMetadata.home);

  return (
    <main style={{ backgroundColor: '#F5F0E8' }}>
      <NavigationPill />
      <SiteContentBand location="homepage" includeGlobal featuredOnly={false} limit={4} tone="light" topPlacement />
      <HeroSection />
      <AboutStrip />
      <VenturesGrid />
      <FeaturedShowcase />
      <UpcomingEventsSection />
      <ShopSection />
      <FooterSection />
    </main>
  );
}
