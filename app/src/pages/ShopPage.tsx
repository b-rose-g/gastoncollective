import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShopNav from '../shop/components/ShopNav';
import ShopHero from '../shop/sections/ShopHero';
import ShopProducts from '../shop/sections/ShopProducts';
import ShopCommission from '../shop/sections/ShopCommission';
import ShopContact from '../shop/sections/ShopContact';
import ShopFooter from '../shop/sections/ShopFooter';

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="shop-page">
      <ShopNav />
      <main>
        <ShopHero />
        <ShopProducts />
        <ShopCommission />
        <ShopContact />
        <ShopFooter />
      </main>
    </div>
  );
}
