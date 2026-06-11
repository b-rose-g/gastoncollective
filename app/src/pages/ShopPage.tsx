import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShopNav from '../shop/components/ShopNav';
import ShopHero from '../shop/sections/ShopHero';
import ShopProducts from '../shop/sections/ShopProducts';
import ShopCommission from '../shop/sections/ShopCommission';
import ShopContact from '../shop/sections/ShopContact';
import ShopFooter from '../shop/sections/ShopFooter';
import SiteContentBand from '../sections/SiteContentBand';
import { prefersReducedMotion } from '@/lib/motion';
import { routeMetadata, usePageMetadata } from '@/lib/seo';

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  usePageMetadata(routeMetadata.shop);

  useEffect(() => {
    if (!prefersReducedMotion()) ScrollTrigger.refresh();
  }, []);

  return (
    <div className="shop-page">
      <ShopNav />
      <main>
        <SiteContentBand location="shop" limit={3} tone="shop" topPlacement />
        <ShopHero />
        <ShopProducts />
        <ShopCommission />
        <ShopContact />
        <ShopFooter />
      </main>
    </div>
  );
}
