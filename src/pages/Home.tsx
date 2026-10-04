import { useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import {
  BrandBand,
  EditorialIntro,
  FeaturedProducts,
  Lookbook,
  ShopByCategory,
  SupportStrip,
} from '../components/home/Sections';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCatalog } from '../context/CatalogProvider';
import { setMeta } from '../lib/meta';

export default function Home() {
  const { status } = useCatalog();
  // Re-scan for reveal targets once products land and the grid grows.
  useScrollReveal([status]);

  useEffect(() => {
    setMeta({
      title: 'Apna Store — Style That Feels Like You',
      description:
        'A modern fashion destination. Discover new-season clothing, ethnic wear and accessories, chosen with care.',
    });
  }, []);

  return (
    <>
      <Hero />
      <EditorialIntro />
      <ShopByCategory />
      <Lookbook />
      <FeaturedProducts />
      <BrandBand />
      <SupportStrip />
    </>
  );
}
