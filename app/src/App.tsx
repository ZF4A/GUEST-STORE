import { useState, useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ProductDetail } from '@/components/ProductDetail';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchOverlay } from '@/components/SearchOverlay';
import { HeroSection } from '@/sections/HeroSection';
import { AboutSection } from '@/sections/AboutSection';
import { CategoriesSection } from '@/sections/CategoriesSection';
import { ProductGridSection } from '@/sections/ProductGridSection';
import { PremiumSection } from '@/sections/PremiumSection';
import { LocationSection } from '@/sections/LocationSection';
import { FAQSection } from '@/sections/FAQSection';
import { AdminPage } from '@/pages/AdminPage';
import { SoldPage } from '@/pages/SoldPage';
import { SalesPage } from '@/pages/SalesPage';
import { useAppStore } from '@/stores/appStore';
import { useProductStore } from '@/stores/productStore';
import { useSectionStore } from '@/stores/sectionStore';
import { translations, categories } from '@/lib/data';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const STATIC_BESTSELLER_IDS = ['luxe-crossbody', 'classic-shoes', 'gold-cap', 'eternite-watch'];

function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { lang } = useAppStore();
  const t = translations[lang];
  const { products: allProducts, seed } = useProductStore();
  const { overrides: sectionOverrides } = useSectionStore();

  const sec = (id: string, def: { caption: string; headline: string }) =>
    sectionOverrides[id as keyof typeof sectionOverrides] ?? def;

  // Seed static products on first visit
  useEffect(() => { seed(); }, [seed]);

  const trendingProducts = useMemo(
    () => allProducts.filter((p) => p.badges.includes('trending')),
    [allProducts]
  );
  const bestSellers = useMemo(
    () => allProducts.filter(
      (p) => p.isBestSeller === true || STATIC_BESTSELLER_IDS.includes(p.id)
    ),
    [allProducts]
  );
  const newArrivals = useMemo(
    () => allProducts.filter((p) => p.badges.includes('new')),
    [allProducts]
  );
  const soldProducts = useMemo(
    () => allProducts.filter((p) => p.badges.includes('sold')),
    [allProducts]
  );
  const categoryProducts = useMemo(
    () => selectedCategory ? allProducts.filter((p) => p.category === selectedCategory) : [],
    [allProducts, selectedCategory]
  );

  const handleOpenProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  useEffect(() => {
    if (loaded) ScrollTrigger.refresh();
  }, [loaded]);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <CategoriesSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {selectedCategory && categoryProducts.length >= 0 && (() => {
          const cat = categories.find(c => c.id === selectedCategory);
          return (
            <div id="category-browse">
              <ProductGridSection
                id="category-browse-grid"
                caption={lang === 'fr' ? 'CATÉGORIE' : 'CATEGORY'}
                headline={cat?.name[lang] ?? selectedCategory}
                products={categoryProducts}
                onOpenProduct={handleOpenProduct}
                bgClass="bg-pale-linen dark:bg-espresso-muted"
                pauseScroll={selectedProduct !== null}
              />
            </div>
          );
        })()}

        <ProductGridSection
          id="trending"
          caption={sec('trending', { caption: t.trending.caption, headline: t.trending.headline }).caption}
          headline={sec('trending', { caption: t.trending.caption, headline: t.trending.headline }).headline}
          products={trendingProducts}
          onOpenProduct={handleOpenProduct}
          seeAll={{ label: t.trending.seeAll, onClick: () => {} }}
          pauseScroll={selectedProduct !== null}
        />

        <ProductGridSection
          id="bestsellers"
          caption={sec('bestsellers', { caption: t.bestSellers.caption, headline: t.bestSellers.headline }).caption}
          headline={sec('bestsellers', { caption: t.bestSellers.caption, headline: t.bestSellers.headline }).headline}
          products={bestSellers}
          onOpenProduct={handleOpenProduct}
          bgClass="bg-warm-cream dark:bg-dark-cocoa"
          pauseScroll={selectedProduct !== null}
        />

        <ProductGridSection
          id="newarrivals"
          caption={sec('newarrivals', { caption: t.newArrivals.caption, headline: t.newArrivals.headline }).caption}
          headline={sec('newarrivals', { caption: t.newArrivals.caption, headline: t.newArrivals.headline }).headline}
          products={newArrivals}
          onOpenProduct={handleOpenProduct}
          pauseScroll={selectedProduct !== null}
        />

        <ProductGridSection
          id="sold"
          caption={sec('sold', { caption: t.soldProducts.caption, headline: t.soldProducts.headline }).caption}
          headline={sec('sold', { caption: t.soldProducts.caption, headline: t.soldProducts.headline }).headline}
          products={soldProducts}
          onOpenProduct={handleOpenProduct}
          bgClass="bg-warm-cream dark:bg-dark-cocoa"
          pauseScroll={selectedProduct !== null}
        />

        <PremiumSection products={allProducts} onOpenProduct={handleOpenProduct} />

        <LocationSection />
        <FAQSection />
      </main>

      <Footer />

      <ProductDetail
        product={selectedProduct}
        allProducts={allProducts}
        onClose={handleCloseProduct}
        onOpenProduct={handleOpenProduct}
      />

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/sold" element={<SoldPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <CartDrawer />
      <SearchOverlay onSelectProduct={() => {}} />
    </BrowserRouter>
  );
}

export default App;
