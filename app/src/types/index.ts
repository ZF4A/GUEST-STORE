export interface Product {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  price: number;
  originalPrice?: number;  // set when isPromo — UI shows strikethrough
  image: string;           // always = images[0] (primary)
  images?: string[];       // full gallery, up to 500
  category: string;
  badges: ('trending' | 'new' | 'premium' | 'sold')[];
  inStock: boolean;
  isPromo?: boolean;       // shows PROMO badge + strikethrough originalPrice
  isBestSeller?: boolean;  // appears in bestsellers section
  soldAt?: string;         // ISO date — when marked sold, for duration display
  store: 'yaounde' | 'kribi' | 'both';
  sizes?: string[];
  colors?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  store: 'yaounde' | 'kribi';
}

export interface Category {
  id: string;
  name: { fr: string; en: string };
  image: string;
}

export interface FAQItem {
  question: { fr: string; en: string };
  answer: { fr: string; en: string };
}

export interface StoreLocation {
  id: 'yaounde' | 'kribi';
  name: { fr: string; en: string };
  address: { fr: string; en: string };
  whatsapp: string;
}

export type Lang = 'fr' | 'en';
export type Theme = 'light' | 'dark';
export type DeliveryZone = 'yaounde' | 'kribi' | 'autre_ville' | 'international';
