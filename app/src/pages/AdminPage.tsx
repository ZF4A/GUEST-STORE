import { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff,
  Trash2, Package, Plus, LogOut, Check, Pencil, Search,
  ChevronDown, ImageIcon, X,
} from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useAppStore } from '@/stores/appStore';
import { useSectionStore, SECTION_IDS, type SectionId } from '@/stores/sectionStore';
import { cn } from '@/lib/utils';
import { storeImage, isIdb } from '@/lib/imageDb';
import { IdbImage } from '@/components/IdbImage';
import type { Product } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_PIN = 'guesF0rrmik@';

const CATEGORIES = [
  { value: 'bags',       label: { fr: 'Sacs',                    en: 'Bags' } },
  { value: 'shoes',      label: { fr: 'Chaussures',              en: 'Shoes' } },
  { value: 'watches',    label: { fr: 'Montres',                 en: 'Watches' } },
  { value: 'jewelry',    label: { fr: 'Bijoux',                  en: 'Jewelry' } },
  { value: 'bracelets',  label: { fr: 'Bracelets',               en: 'Bracelets' } },
  { value: 'belts',      label: { fr: 'Ceintures',               en: 'Belts' } },
  { value: 'hats',       label: { fr: 'Chapeaux & Bonnets',      en: 'Hats & Beanies' } },
  { value: 'sunglasses', label: { fr: 'Lunettes de Soleil',      en: 'Sunglasses' } },
  { value: 'scarves',    label: { fr: 'Écharpes & Foulards',     en: 'Scarves' } },
  { value: 'wallets',    label: { fr: 'Portefeuilles',           en: 'Wallets' } },
  { value: 'perfumes',   label: { fr: 'Parfums',                 en: 'Perfumes' } },
  { value: 'clothing',   label: { fr: 'Vêtements',               en: 'Clothing' } },
  { value: 'keychains',  label: { fr: 'Porte-clés & Bijoux de Sac', en: 'Keychains & Bag Charms' } },
  { value: 'hair',       label: { fr: 'Accessoires Cheveux',     en: 'Hair Accessories' } },
  { value: 'luggage',    label: { fr: 'Valises & Bagages',       en: 'Luggage & Travel' } },
] as const;

const BADGE_OPTIONS = ['trending', 'new', 'premium', 'sold'] as const;

// ─── Admin UI Translations ─────────────────────────────────────────────────────

const ADMIN_UI = {
  fr: {
    tabs: { add: 'Ajouter', manage: 'Gérer', edit: 'Éditer', ventes: '🏷️ Ventes' },
    logout: 'Déconnexion',
    header: 'Admin',
    steps: [
      { label: 'Identité',  desc: 'Nom & prix' },
      { label: 'Statut',    desc: 'Badges & boutique' },
      { label: 'Contenu',   desc: 'Description & photos' },
      { label: 'Aperçu',    desc: 'Vérification finale' },
    ],
    name: 'Nom du produit *',
    namePh: 'ex: Sac à main Venice',
    price: 'Prix (FCFA) *',
    pricePh: 'ex: 45000',
    category: 'Catégorie *',
    categorySel: '— Sélectionner —',
    sizes: 'Tailles disponibles',
    colors: 'Couleurs disponibles',
    badges: 'Badges',
    store: 'Boutique disponible *',
    storeOpts: { both: 'Yaoundé & Kribi', yaounde: 'Yaoundé uniquement', kribi: 'Kribi uniquement' },
    inStock: 'En stock',
    outStock: 'Épuisé / Sur commande',
    bestSeller: 'Meilleure vente — section Meilleures Ventes',
    promo: 'En promotion — affiche le prix barré',
    promoPrice: 'Prix promotionnel (FCFA) *',
    promoPh: 'Prix après réduction',
    promoHint: 'L\'ancien prix restera affiché barré.',
    desc: 'Description *',
    descPh: 'Décrivez le produit...',
    gallery: 'Galerie d\'images * (jusqu\'à 500)',
    addImg: 'Ajouter',
    addAll: 'Ajouter tout',
    cancel: 'Annuler',
    imgMain: 'Principale',
    imgHint: (n: number) => `${n} / 500 photos · La première est l'image principale`,
    preview: 'Vérifiez les informations avant de publier. Le produit sera visible immédiatement.',
    publish: 'Publier',
    update: 'Mettre à jour',
    next: 'Suivant',
    prev: 'Retour',
    search: 'Rechercher un produit...',
    allCats: 'Toutes catégories',
    allStatus: 'Tous les statuts',
    inStockF: 'En stock',
    soldOut: 'Épuisé',
    onSale: 'En promo',
    newItem: 'Nouveauté',
    nProducts: (n: number) => `${n} produit(s)`,
    noProducts: 'Aucun produit trouvé.',
    editBtn: 'Éditer',
    deleteBtn: 'Supprimer',
    markSoldOut: 'Marquer épuisé',
    markInStock: 'Marquer en stock',
    markSold: 'Marquer vendu',
    unmarkSold: 'Retirer "Vendu"',
    setPrmo: 'Mettre en promo',
    rmPromo: 'Retirer promo',
    addNew: '+ Nouveau',
    rmNew: 'Retirer "Nouveau"',
    confirmDelete: 'Confirmer la suppression',
    clickStatus: 'Cliquez sur un article pour gérer son statut',
    currentPrice: 'Prix actuel :',
    newPromoPrice: 'Nouveau prix (FCFA)',
    applyPromo: 'Appliquer',
    successAdd: 'Produit publié avec succès !',
    successEdit: 'Produit mis à jour !',
    nameSummary: 'Nom',
    priceSummary: 'Prix affiché',
    catSummary: 'Catégorie',
    badgesSummary: 'Badges',
    storeSummary: 'Boutique',
    stockSummary: 'Stock',
    bsSummary: 'Meilleure vente',
    imgsSummary: 'Images',
    sizesSummary: 'Tailles',
    colorsSummary: 'Couleurs',
    yes: 'Oui', no: 'Non', none: 'Aucun',
  },
  en: {
    tabs: { add: 'Add', manage: 'Manage', edit: 'Edit', ventes: '🏷️ Sales' },
    logout: 'Sign out',
    header: 'Admin',
    steps: [
      { label: 'Identity',  desc: 'Name & price' },
      { label: 'Status',    desc: 'Badges & store' },
      { label: 'Content',   desc: 'Description & photos' },
      { label: 'Preview',   desc: 'Final check' },
    ],
    name: 'Product name *',
    namePh: 'e.g. Venice Handbag',
    price: 'Price (FCFA) *',
    pricePh: 'e.g. 45000',
    category: 'Category *',
    categorySel: '— Select —',
    sizes: 'Available sizes',
    colors: 'Available colors',
    badges: 'Badges',
    store: 'Available store *',
    storeOpts: { both: 'Yaoundé & Kribi', yaounde: 'Yaoundé only', kribi: 'Kribi only' },
    inStock: 'In stock',
    outStock: 'Sold out / On order',
    bestSeller: 'Best seller — appears in Best Sellers section',
    promo: 'On sale — shows strikethrough price',
    promoPrice: 'Sale price (FCFA) *',
    promoPh: 'Price after discount',
    promoHint: 'The original price will remain shown crossed out.',
    desc: 'Description *',
    descPh: 'Describe the product...',
    gallery: 'Image gallery * (up to 500)',
    addImg: 'Add',
    addAll: 'Add all',
    cancel: 'Cancel',
    imgMain: 'Main',
    imgHint: (n: number) => `${n} / 500 photos · First is the main image`,
    preview: 'Check the details before publishing. The product will be visible immediately.',
    publish: 'Publish',
    update: 'Update',
    next: 'Next',
    prev: 'Back',
    search: 'Search a product...',
    allCats: 'All categories',
    allStatus: 'All statuses',
    inStockF: 'In stock',
    soldOut: 'Sold out',
    onSale: 'On sale',
    newItem: 'New arrival',
    nProducts: (n: number) => `${n} product(s)`,
    noProducts: 'No products found.',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
    markSoldOut: 'Mark as sold out',
    markInStock: 'Mark in stock',
    markSold: 'Mark as sold',
    unmarkSold: 'Remove "Sold"',
    setPrmo: 'Put on sale',
    rmPromo: 'Remove sale',
    addNew: '+ New',
    rmNew: 'Remove "New"',
    confirmDelete: 'Confirm deletion',
    clickStatus: 'Click a product to manage its status',
    currentPrice: 'Current price:',
    newPromoPrice: 'New price (FCFA)',
    applyPromo: 'Apply',
    successAdd: 'Product published successfully!',
    successEdit: 'Product updated!',
    nameSummary: 'Name',
    priceSummary: 'Displayed price',
    catSummary: 'Category',
    badgesSummary: 'Badges',
    storeSummary: 'Store',
    stockSummary: 'Stock',
    bsSummary: 'Best seller',
    imgsSummary: 'Images',
    sizesSummary: 'Sizes',
    colorsSummary: 'Colors',
    yes: 'Yes', no: 'No', none: 'None',
  },
} as const;

// ─── Category-specific Sizes ───────────────────────────────────────────────────

const SIZES_BY_CATEGORY: Record<string, string[]> = {
  shoes: Array.from({ length: 31 }, (_, i) => String(20 + i)), // 20–50
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  hats: ['Unique', 'S/M', 'L/XL'],
  belts: ['70', '75', '80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130'],
  bracelets: ['Unique', 'XS', 'S', 'M', 'L', 'XL'],
  jewelry: ['Unique', 'XS', 'S', 'M', 'L', 'XL'],
};

// ─── Color Palette ─────────────────────────────────────────────────────────────

const COLORS = [
  { name: { fr: 'Noir',         en: 'Black' },       hex: '#1a1a1a' },
  { name: { fr: 'Blanc',        en: 'White' },       hex: '#f5f5f5' },
  { name: { fr: 'Marron',       en: 'Brown' },       hex: '#7B4A2D' },
  { name: { fr: 'Beige',        en: 'Beige' },       hex: '#D4B896' },
  { name: { fr: 'Camel',        en: 'Camel' },       hex: '#C19A6B' },
  { name: { fr: 'Or',           en: 'Gold' },        hex: '#C9A96E' },
  { name: { fr: 'Argent',       en: 'Silver' },      hex: '#C0C0C0' },
  { name: { fr: 'Rouge',        en: 'Red' },         hex: '#C0392B' },
  { name: { fr: 'Rose',         en: 'Pink' },        hex: '#D4A5A5' },
  { name: { fr: 'Bordeaux',     en: 'Burgundy' },    hex: '#722F37' },
  { name: { fr: 'Bleu',         en: 'Blue' },        hex: '#2471A3' },
  { name: { fr: 'Bleu Marine',  en: 'Navy' },        hex: '#1B2A4A' },
  { name: { fr: 'Vert',         en: 'Green' },       hex: '#1E8449' },
  { name: { fr: 'Kaki',         en: 'Khaki' },       hex: '#7D6608' },
  { name: { fr: 'Gris',         en: 'Grey' },        hex: '#717D7E' },
  { name: { fr: 'Violet',       en: 'Purple' },      hex: '#7D3C98' },
  { name: { fr: 'Orange',       en: 'Orange' },      hex: '#E67E22' },
  { name: { fr: 'Jaune',        en: 'Yellow' },      hex: '#F4D03F' },
  { name: { fr: 'Multicolore',  en: 'Multicolor' },  hex: 'linear-gradient(135deg,#C0392B,#F4D03F,#1E8449,#2471A3,#7D3C98)' },
];

// ─── Zod schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  name:         z.string().min(2),
  price:        z.coerce.number().min(1),
  promoPrice:   z.coerce.number().optional(),
  category:     z.enum(['bags','shoes','watches','jewelry','bracelets','belts','hats','sunglasses','scarves','wallets','perfumes','clothing','keychains','hair','luggage']),
  badges:       z.array(z.enum(['trending','new','premium','sold'])).default([]),
  store:        z.enum(['yaounde','kribi','both']),
  inStock:      z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  isPromo:      z.boolean().default(false),
  desc:         z.string().min(5),
  images:       z.array(z.string()).min(1),
  sizes:        z.array(z.string()).default([]),
  colors:       z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

// ─── PIN Gate ─────────────────────────────────────────────────────────────────

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { lang } = useAppStore();

  const ui = lang === 'fr'
    ? { title: 'Administration', subtitle: 'Guest Store — Espace privé', placeholder: "Code d'accès", enter: 'Entrer', wrong: 'Code incorrect. Réessayez.' }
    : { title: 'Administration', subtitle: 'Guest Store — Private area', placeholder: 'Access code', enter: 'Enter', wrong: 'Wrong code. Please try again.' };

  const submit = () => {
    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setError(ui.wrong);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-dark-cocoa flex items-center justify-center px-4">
      <div className={cn(
        'w-full max-w-sm bg-warm-brown rounded-2xl p-8 border border-champagne-gold/20',
        shake && 'animate-[shake_0.5s_ease-in-out]'
      )}>
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-full bg-champagne-gold/10 items-center justify-center mb-4">
            <Package className="w-7 h-7 text-champagne-gold" />
          </div>
          <h1 className="font-display text-2xl text-light-cream tracking-tight">{ui.title}</h1>
          <p className="text-sm text-muted-taupe mt-1 font-body">{ui.subtitle}</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={ui.placeholder}
              className={cn(
                'w-full bg-dark-cocoa border rounded-xl px-4 py-3 pr-10 font-body text-light-cream placeholder:text-muted-taupe/50 outline-none transition-colors',
                error ? 'border-red-400/50' : 'border-champagne-gold/20 focus:border-champagne-gold/50'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-taupe hover:text-light-cream transition-colors"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}
          <button
            onClick={submit}
            className="w-full py-3 bg-champagne-gold text-deep-espresso font-accent font-semibold text-sm rounded-xl hover:bg-champagne-gold/90 transition-colors"
          >
            {ui.enter}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  return (
    <div className="flex items-center gap-0">
      {ui.steps.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-accent font-semibold transition-all',
              current === i + 1
                ? 'bg-champagne-gold text-deep-espresso scale-110'
                : current > i + 1
                  ? 'bg-champagne-gold/20 text-champagne-gold'
                  : 'bg-warm-brown text-muted-taupe border border-muted-taupe/20'
            )}>
              {current > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              'text-[10px] font-accent uppercase tracking-wider mt-1 whitespace-nowrap',
              current === i + 1 ? 'text-champagne-gold' : 'text-muted-taupe'
            )}>
              {s.label}
            </span>
          </div>
          {i < ui.steps.length - 1 && (
            <div className={cn(
              'h-[1px] w-12 md:w-20 mx-1 mb-4 transition-colors',
              current > i + 1 ? 'bg-champagne-gold/40' : 'bg-muted-taupe/20'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-accent text-[11px] uppercase tracking-wider text-muted-taupe mb-1.5">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1 font-body">{message}</p>;
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        className={cn(
          'w-full bg-dark-cocoa border rounded-xl px-4 py-3 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors',
          error ? 'border-red-400/50' : 'border-champagne-gold/15 focus:border-champagne-gold/50'
        )}
      />
      <FieldError message={error} />
    </>
  );
}

function TextArea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <>
      <textarea
        {...props}
        rows={3}
        className={cn(
          'w-full bg-dark-cocoa border rounded-xl px-4 py-3 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors resize-none',
          error ? 'border-red-400/50' : 'border-champagne-gold/15 focus:border-champagne-gold/50'
        )}
      />
      <FieldError message={error} />
    </>
  );
}

function Toggle({
  value, onChange, label,
}: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          value ? 'bg-champagne-gold' : 'bg-muted-taupe/30'
        )}
      >
        <span className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          value ? 'translate-x-6' : 'translate-x-1'
        )} />
      </button>
      <span className="text-sm font-body text-light-cream/70">{label}</span>
    </div>
  );
}

// ─── Image Gallery Manager ────────────────────────────────────────────────────

function ImageGalleryManager({
  images,
  onChange,
  error,
  lang,
  ui,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  error?: string;
  lang?: 'fr' | 'en';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ui?: any;
}) {
  const _lang = lang ?? 'fr';
  const _ui = ui ?? ADMIN_UI[_lang];
  const [inputUrl, setInputUrl] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addSingle = () => {
    const url = inputUrl.trim();
    if (!url || images.includes(url)) return;
    if (images.length >= 500) return;
    onChange([...images, url]);
    setInputUrl('');
  };

  const addBulk = () => {
    const urls = bulkText
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 3 && !images.includes(u));
    onChange([...images, ...urls].slice(0, 500));
    setBulkText('');
    setBulkMode(false);
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArr.length) return;
    setUploading(true);
    try {
      const refs: string[] = [];
      for (const file of fileArr) {
        // Store the original blob — full HD/4K resolution, no compression
        const ref = await storeImage(file);
        refs.push(ref);
      }
      onChange([...images, ...refs].slice(0, 500));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">

      {/* ── Upload zone (drag-and-drop + file picker) ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer',
          dragOver
            ? 'border-champagne-gold bg-champagne-gold/10'
            : 'border-champagne-gold/25 hover:border-champagne-gold/50 hover:bg-champagne-gold/5'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-champagne-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-champagne-gold font-accent">
              {_lang === 'fr' ? 'Importation en cours...' : 'Uploading...'}
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-champagne-gold/15 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-champagne-gold" />
            </div>
            <div className="text-center">
              <p className="font-accent text-sm text-light-cream font-semibold">
                {_lang === 'fr' ? 'Glisser-déposer ou cliquer pour importer' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-[11px] text-muted-taupe mt-1 font-body">
                {_lang === 'fr'
                  ? 'PNG, JPG, WEBP — qualité originale HD/4K conservée'
                  : 'PNG, JPG, WEBP — original HD/4K quality preserved'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── URL input (alternative) ── */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-champagne-gold/10" />
        <span className="text-[10px] font-accent text-muted-taupe uppercase tracking-wider">
          {_lang === 'fr' ? 'ou URL' : 'or URL'}
        </span>
        <div className="h-px flex-1 bg-champagne-gold/10" />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSingle())}
          placeholder="/images/prod.jpg  ou  https://..."
          className="flex-1 bg-dark-cocoa border border-champagne-gold/15 focus:border-champagne-gold/50 rounded-xl px-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={addSingle}
          className="px-4 py-2.5 bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30 rounded-xl text-sm font-accent font-semibold hover:bg-champagne-gold/30 transition-colors"
        >
          {_ui.addImg}
        </button>
        <button
          type="button"
          onClick={() => setBulkMode(!bulkMode)}
          className="px-3 py-2.5 border border-champagne-gold/20 text-muted-taupe rounded-xl text-sm font-accent hover:border-champagne-gold/40 hover:text-light-cream transition-colors"
          title={_lang === 'fr' ? 'Coller plusieurs URLs' : 'Paste multiple URLs'}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {bulkMode && (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={_lang === 'fr'
              ? 'Collez plusieurs URLs, une par ligne:\nhttps://exemple.com/photo1.jpg\nhttps://exemple.com/photo2.jpg'
              : 'Paste multiple URLs, one per line:\nhttps://example.com/photo1.jpg'}
            rows={4}
            className="w-full bg-dark-cocoa border border-champagne-gold/15 focus:border-champagne-gold/50 rounded-xl px-4 py-3 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={addBulk}
              className="px-4 py-2 bg-champagne-gold text-deep-espresso rounded-lg text-sm font-accent font-semibold hover:bg-champagne-gold/90 transition-colors">
              {_ui.addAll}
            </button>
            <button type="button" onClick={() => { setBulkMode(false); setBulkText(''); }}
              className="px-4 py-2 border border-muted-taupe/20 text-muted-taupe rounded-lg text-sm font-accent hover:border-champagne-gold/30 transition-colors">
              {_ui.cancel}
            </button>
          </div>
        </div>
      )}

      {/* ── Thumbnail grid ── */}
      {images.length > 0 && (
        <>
          <p className="text-xs text-muted-taupe font-accent">{_ui.imgHint(images.length)}</p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden bg-dark-cocoa border border-champagne-gold/10">
                {i === 0 && (
                  <span className="absolute top-1 left-1 z-10 text-[8px] bg-champagne-gold text-deep-espresso font-accent font-semibold px-1 rounded">
                    {_ui.imgMain}
                  </span>
                )}
                {isIdb(src) ? (
                  <IdbImage src={src} alt={`img ${i + 1}`} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                ) : (
                  <img src={src} alt={`img ${i + 1}`} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                )}
                {/* Upload badge */}
                {isIdb(src) && (
                  <span className="absolute bottom-1 left-1 z-10 text-[7px] bg-green-500/80 text-white font-accent px-1 rounded">
                    {_lang === 'fr' ? 'importé' : 'uploaded'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-red-400 text-xs font-body">{error}</p>}
    </div>
  );
}

// ─── Form Steps ───────────────────────────────────────────────────────────────

function SizePicker({ category, selected, onChange }: { category: string; selected: string[]; onChange: (s: string[]) => void }) {
  const sizes = SIZES_BY_CATEGORY[category];
  if (!sizes) return null;
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const toggle = (s: string) => onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);
  return (
    <div>
      <Label>{ui.sizes}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {sizes.map(s => (
          <button
            key={s} type="button" onClick={() => toggle(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-accent font-semibold border transition-all',
              selected.includes(s)
                ? 'bg-champagne-gold text-deep-espresso border-champagne-gold'
                : 'bg-transparent text-muted-taupe border-muted-taupe/30 hover:border-champagne-gold/40 hover:text-light-cream'
            )}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ selected, onChange }: { selected: string[]; onChange: (c: string[]) => void }) {
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name]);
  return (
    <div>
      <Label>{ui.colors}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {COLORS.map(c => {
          const name = c.name[lang];
          const isSelected = selected.includes(name);
          return (
            <button
              key={name} type="button" onClick={() => toggle(name)}
              title={name}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body border transition-all',
                isSelected
                  ? 'border-champagne-gold text-light-cream bg-champagne-gold/10'
                  : 'border-muted-taupe/20 text-muted-taupe hover:border-champagne-gold/30 hover:text-light-cream'
              )}
            >
              <span
                className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: c.hex.startsWith('linear') ? c.hex : c.hex }}
              />
              {name}
              {isSelected && <Check className="w-3 h-3 text-champagne-gold" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step1({ form }: { form: any }) {
  const { register, formState: { errors }, watch, setValue } = form;
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const category = watch('category');
  const sizes = watch('sizes') ?? [];
  const colors = watch('colors') ?? [];
  const hasSizes = !!SIZES_BY_CATEGORY[category];
  const hasColors = ['shoes','bags','clothing','hats','belts','bracelets','jewelry','wallets','scarves','luggage'].includes(category);

  return (
    <div className="space-y-5">
      <div>
        <Label>{ui.name}</Label>
        <TextInput {...register('name')} placeholder={ui.namePh} error={errors.name?.message} />
      </div>
      <div>
        <Label>{ui.price}</Label>
        <TextInput {...register('price')} type="number" placeholder={ui.pricePh} error={errors.price?.message} />
      </div>
      <div>
        <Label>{ui.category}</Label>
        <select
          {...register('category')}
          className={cn(
            'w-full bg-dark-cocoa border rounded-xl px-4 py-3 font-body text-sm text-light-cream outline-none transition-colors',
            errors.category ? 'border-red-400/50' : 'border-champagne-gold/15 focus:border-champagne-gold/50'
          )}
        >
          <option value="">{ui.categorySel}</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label[lang]}</option>
          ))}
        </select>
        <FieldError message={errors.category?.message} />
      </div>
      {category && hasSizes && (
        <SizePicker category={category} selected={sizes} onChange={v => setValue('sizes', v)} />
      )}
      {category && hasColors && (
        <ColorPicker selected={colors} onChange={v => setValue('colors', v)} />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step2({ form }: { form: any }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const badges   = watch('badges') ?? [];
  const inStock  = watch('inStock');
  const isPromo  = watch('isPromo');
  const isBestSeller = watch('isBestSeller');

  const toggleBadge = (b: typeof BADGE_OPTIONS[number]) => {
    setValue('badges', badges.includes(b) ? badges.filter((x: string) => x !== b) : [...badges, b]);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>{ui.badges}</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {BADGE_OPTIONS.map(b => (
            <button
              key={b} type="button" onClick={() => toggleBadge(b)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-accent font-semibold uppercase tracking-wider border transition-all',
                badges.includes(b)
                  ? 'bg-champagne-gold text-deep-espresso border-champagne-gold'
                  : 'bg-transparent text-muted-taupe border-muted-taupe/30 hover:border-champagne-gold/40'
              )}
            >{b}</button>
          ))}
        </div>
      </div>

      <div>
        <Label>{ui.store}</Label>
        <div className="flex flex-col gap-2 mt-2">
          {(['both', 'yaounde', 'kribi'] as const).map(opt => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input {...register('store')} type="radio" value={opt} className="accent-champagne-gold" />
              <span className="font-body text-sm text-light-cream/80 group-hover:text-light-cream transition-colors">
                {ui.storeOpts[opt]}
              </span>
            </label>
          ))}
        </div>
        <FieldError message={errors.store?.message} />
      </div>

      <Toggle value={inStock} onChange={v => setValue('inStock', v)} label={inStock ? ui.inStock : ui.outStock} />
      <Toggle value={isBestSeller} onChange={v => setValue('isBestSeller', v)} label={ui.bestSeller} />

      <div className="space-y-3">
        <Toggle value={isPromo} onChange={v => setValue('isPromo', v)} label={ui.promo} />
        {isPromo && (
          <div>
            <Label>{ui.promoPrice}</Label>
            <TextInput {...register('promoPrice')} type="number" placeholder={ui.promoPh} error={errors.promoPrice?.message} />
            <p className="text-xs text-muted-taupe mt-1 font-body">{ui.promoHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step3({ form }: { form: any }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const images = watch('images') ?? [];

  return (
    <div className="space-y-5">
      <div>
        <Label>{ui.desc}</Label>
        <TextArea {...register('desc')} placeholder={ui.descPh} error={errors.desc?.message} />
      </div>
      <div>
        <Label>{ui.gallery}</Label>
        <ImageGalleryManager
          images={images}
          onChange={(imgs) => setValue('images', imgs)}
          error={errors.images?.message as string | undefined}
          lang={lang}
          ui={ui}
        />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step4({ form }: { form: any }) {
  const data = form.watch();
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const cat = CATEGORIES.find(c => c.value === data.category);
  const firstImage = data.images?.[0];

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-muted-taupe">{ui.preview}</p>

      <div className="flex justify-center">
        <div className="bg-warm-brown rounded-2xl overflow-hidden border border-champagne-gold/20 max-w-xs w-full">
          <div className="aspect-square bg-dark-cocoa relative overflow-hidden">
            {firstImage ? (
              <img src={firstImage} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-taupe/30">
                <Package className="w-16 h-16" />
              </div>
            )}
            {(data.images?.length ?? 0) > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-accent px-2 py-0.5 rounded-full">
                +{data.images.length - 1} photos
              </span>
            )}
            {(data.badges ?? []).length > 0 && (
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {(data.badges ?? []).map((b: string) => (
                  <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-accent font-semibold uppercase bg-champagne-gold text-deep-espresso">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mb-1">{cat?.label[lang] ?? '—'}</p>
            <h3 className="font-display text-lg text-light-cream leading-tight">{data.name || (lang === 'fr' ? 'Nom du produit' : 'Product name')}</h3>
            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              <p className="font-body font-medium text-champagne-gold">
                {data.isPromo && data.promoPrice
                  ? `${Number(data.promoPrice).toLocaleString()} FCFA`
                  : data.price ? `${Number(data.price).toLocaleString()} FCFA` : '— FCFA'}
              </p>
              {data.isPromo && data.promoPrice && (
                <span className="font-body text-muted-taupe line-through text-sm">
                  {Number(data.price).toLocaleString()} FCFA
                </span>
              )}
            </div>
            {(data.colors ?? []).length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {(data.colors ?? []).map((c: string) => {
                  const found = COLORS.find(col => col.name.fr === c || col.name.en === c);
                  return (
                    <span key={c} title={c} className="w-4 h-4 rounded-full border border-white/20 inline-block"
                      style={{ background: found?.hex ?? '#888' }} />
                  );
                })}
              </div>
            )}
            {(data.sizes ?? []).length > 0 && (
              <p className="text-[10px] text-muted-taupe mt-1 font-body">{(data.sizes ?? []).join(' · ')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-dark-cocoa rounded-xl p-4 space-y-2 text-sm font-body">
        {[
          [ui.nameSummary, data.name],
          [ui.priceSummary, data.isPromo && data.promoPrice ? `${Number(data.promoPrice).toLocaleString()} FCFA (promo)` : data.price ? `${Number(data.price).toLocaleString()} FCFA` : '—'],
          [ui.catSummary, cat?.label[lang]],
          [ui.badgesSummary, (data.badges ?? []).join(', ') || ui.none],
          [ui.storeSummary, data.store],
          [ui.stockSummary, data.inStock ? ui.inStock : ui.outStock],
          [ui.bsSummary, data.isBestSeller ? ui.yes : ui.no],
          [ui.imgsSummary, `${data.images?.length ?? 0} photo(s)`],
          ...(data.sizes?.length ? [[ui.sizesSummary, data.sizes.join(', ')]] : []),
          ...(data.colors?.length ? [[ui.colorsSummary, data.colors.join(', ')]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <span className="text-muted-taupe w-32 shrink-0 font-accent text-[11px] uppercase tracking-wider">{label}</span>
            <span className="text-light-cream/80 break-all">{value ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gérer Tab (unified product manager) ─────────────────────────────────────

interface ManageTabProps {
  onEdit: (product: Product) => void;
}

function ManageTab({ onEdit }: ManageTabProps) {
  const { products, removeProduct, updateProduct } = useProductStore();
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlinePromoId, setInlinePromoId] = useState<string | null>(null);
  const [inlinePromoPrice, setInlinePromoPrice] = useState('');

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.fr.toLowerCase().includes(search.toLowerCase()) ||
        p.name.en.toLowerCase().includes(search.toLowerCase()) ||
        (p.name[lang] && p.name[lang].toLowerCase().includes(search.toLowerCase()));
      const matchCat = catFilter === 'all' || p.category === catFilter;
      const matchStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'instock' ? p.inStock :
        statusFilter === 'soldout' ? !p.inStock :
        statusFilter === 'promo' ? !!p.isPromo :
        statusFilter === 'new' ? p.badges.includes('new') : true;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      removeProduct(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const saveInlinePrice = (p: Product) => {
    const val = Number(inlinePrice);
    if (val > 0) updateProduct(p.id, { price: val });
    setInlinePriceId(null);
    setInlinePrice('');
  };

  const saveInlinePromo = (p: Product) => {
    const val = Number(inlinePromoPrice);
    if (val > 0 && val < p.price) {
      updateProduct(p.id, { isPromo: true, originalPrice: p.price, price: val });
    }
    setInlinePromoId(null);
    setInlinePromoPrice('');
  };

  const togglePromoOff = (p: Product) => {
    if (p.originalPrice) {
      updateProduct(p.id, { isPromo: false, price: p.originalPrice, originalPrice: undefined });
    } else {
      updateProduct(p.id, { isPromo: false });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-taupe" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ui.search}
            className="w-full bg-warm-brown border border-champagne-gold/15 focus:border-champagne-gold/40 rounded-xl pl-9 pr-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="appearance-none bg-warm-brown border border-champagne-gold/15 rounded-xl px-4 py-2.5 pr-8 font-body text-sm text-light-cream outline-none cursor-pointer"
          >
            <option value="all">{ui.allCats}</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label[lang]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-taupe pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none bg-warm-brown border border-champagne-gold/15 rounded-xl px-4 py-2.5 pr-8 font-body text-sm text-light-cream outline-none cursor-pointer"
          >
            <option value="all">{ui.allStatus}</option>
            <option value="instock">{ui.inStockF}</option>
            <option value="soldout">{ui.soldOut}</option>
            <option value="promo">{ui.onSale}</option>
            <option value="new">{ui.newItem}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-taupe pointer-events-none" />
        </div>
      </div>

      <p className="text-xs text-muted-taupe font-body">{ui.nProducts(filtered.length)}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-taupe font-body">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{ui.noProducts}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-warm-brown rounded-xl border border-champagne-gold/10 overflow-hidden"
            >
              {/* Main row */}
              <div className="flex items-center gap-3 p-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-dark-cocoa shrink-0">
                  <img src={p.image} alt={p.name[lang] || p.name.fr} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-light-cream truncate text-sm">{p.name[lang] || p.name.fr}</p>
                  <p className="text-xs text-muted-taupe font-body mt-0.5">
                    {CATEGORIES.find(c => c.value === p.category)?.label[lang] ?? p.category} · {p.store}
                  </p>

                  {/* Quick badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.badges.map(b => (
                      <span key={b} className="text-[9px] font-accent uppercase tracking-wider bg-champagne-gold/15 text-champagne-gold px-1.5 py-0.5 rounded-full">
                        {b}
                      </span>
                    ))}
                    <span className={cn(
                      'text-[9px] font-accent uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                      p.inStock ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                    )}>
                      {p.inStock ? ui.inStockF : ui.soldOut}
                    </span>
                    {p.isPromo && (
                      <span className="text-[9px] font-accent uppercase tracking-wider bg-soft-rose/15 text-soft-rose px-1.5 py-0.5 rounded-full">
                        Promo
                      </span>
                    )}
                  </div>
                </div>

                {/* Price — click to edit inline */}
                <div className="shrink-0">
                  {inlinePriceId === p.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={inlinePrice}
                        onChange={e => setInlinePrice(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveInlinePrice(p); if (e.key === 'Escape') setInlinePriceId(null); }}
                        autoFocus
                        className="w-24 bg-dark-cocoa border border-champagne-gold/40 rounded-lg px-2 py-1 font-body text-xs text-light-cream outline-none"
                      />
                      <button type="button" onClick={() => saveInlinePrice(p)} className="text-champagne-gold hover:text-champagne-gold/80">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setInlinePriceId(p.id); setInlinePrice(String(p.price)); }}
                      className="font-body text-sm text-champagne-gold hover:text-champagne-gold/70 transition-colors"
                      title="Cliquer pour modifier le prix"
                    >
                      {p.price.toLocaleString()} FCFA
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="p-2 text-muted-taupe hover:text-champagne-gold transition-colors rounded-lg hover:bg-champagne-gold/10"
                    title={ui.editBtn}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className={cn(
                      'p-2 transition-colors rounded-lg',
                      confirmDeleteId === p.id
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-muted-taupe hover:text-red-400 hover:bg-red-400/10'
                    )}
                    title={confirmDeleteId === p.id ? ui.confirmDelete : ui.deleteBtn}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick-edit strip */}
              <div className="flex flex-wrap gap-2 px-3 pb-3">
                {/* Stock toggle */}
                <button
                  type="button"
                  onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                  className={cn(
                    'text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all',
                    p.inStock
                      ? 'border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400'
                      : 'border-red-400/30 text-red-400 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                  )}
                >
                  {p.inStock ? ui.markSoldOut : ui.markInStock}
                </button>

                {/* Sold toggle — marks as sold with timestamp */}
                {p.badges.includes('sold') ? (
                  <button
                    type="button"
                    onClick={() => updateProduct(p.id, {
                      badges: p.badges.filter(b => b !== 'sold'),
                      inStock: true,
                      soldAt: undefined,
                    })}
                    className="text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-soft-rose/40 text-soft-rose hover:bg-soft-rose/10 transition-all"
                  >
                    {ui.unmarkSold}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateProduct(p.id, {
                      badges: [...p.badges.filter(b => b !== 'sold'), 'sold' as const],
                      inStock: false,
                      soldAt: new Date().toISOString(),
                    })}
                    className="text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-muted-taupe/20 text-muted-taupe hover:border-soft-rose/40 hover:text-soft-rose transition-all"
                  >
                    {ui.markSold}
                  </button>
                )}

                {/* Promo toggle */}
                {p.isPromo ? (
                  <button
                    type="button"
                    onClick={() => togglePromoOff(p)}
                    className="text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-soft-rose/30 text-soft-rose hover:bg-soft-rose/10 transition-all"
                  >
                    {ui.rmPromo}
                  </button>
                ) : (
                  <>
                    {inlinePromoId === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={inlinePromoPrice}
                          onChange={e => setInlinePromoPrice(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveInlinePromo(p); if (e.key === 'Escape') setInlinePromoId(null); }}
                          autoFocus
                          placeholder="Prix promo"
                          className="w-24 bg-dark-cocoa border border-champagne-gold/40 rounded-lg px-2 py-1 font-body text-xs text-light-cream outline-none"
                        />
                        <button type="button" onClick={() => saveInlinePromo(p)} className="text-champagne-gold">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setInlinePromoId(null)} className="text-muted-taupe">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInlinePromoId(p.id)}
                        className="text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-muted-taupe/20 text-muted-taupe hover:border-soft-rose/30 hover:text-soft-rose transition-all"
                      >
                        {ui.setPrmo}
                      </button>
                    )}
                  </>
                )}

                {/* New badge toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const hasNew = p.badges.includes('new');
                    const next = hasNew
                      ? p.badges.filter(b => b !== 'new')
                      : [...p.badges, 'new' as const];
                    updateProduct(p.id, { badges: next });
                  }}
                  className={cn(
                    'text-[10px] font-accent font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all',
                    p.badges.includes('new')
                      ? 'border-champagne-gold/40 text-champagne-gold hover:opacity-60'
                      : 'border-muted-taupe/20 text-muted-taupe hover:border-champagne-gold/30 hover:text-champagne-gold'
                  )}
                >
                  {p.badges.includes('new') ? ui.rmNew : ui.addNew}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ventes Tab (click-to-select status manager) ──────────────────────────────

function VentesTab() {
  const { products, updateProduct } = useProductStore();
  const { lang } = useAppStore();
  const ui = ADMIN_UI[lang];
  const [selected, setSelected] = useState<Product | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.fr.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q) || (p.name[lang] && p.name[lang].toLowerCase().includes(q));
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  }), [products, search, catFilter, lang]);

  const select = (p: Product) => {
    setSelected(prev => prev?.id === p.id ? null : p);
    setShowPromoInput(false);
    setPromoInput('');
  };

  // Refresh selected from store after update
  const refreshSelected = (id: string) => {
    const updated = products.find(p => p.id === id);
    if (updated) setSelected(updated);
  };

  const markSold = () => {
    if (!selected) return;
    updateProduct(selected.id, {
      badges: [...selected.badges.filter(b => b !== 'sold'), 'sold' as const],
      inStock: false,
      soldAt: new Date().toISOString(),
    });
    refreshSelected(selected.id);
  };

  const unmarkSold = () => {
    if (!selected) return;
    updateProduct(selected.id, { badges: selected.badges.filter(b => b !== 'sold'), inStock: true, soldAt: undefined });
    refreshSelected(selected.id);
  };

  const applyPromo = () => {
    if (!selected) return;
    const newPrice = Number(promoInput);
    if (newPrice > 0 && newPrice < (selected.originalPrice ?? selected.price)) {
      updateProduct(selected.id, {
        isPromo: true,
        originalPrice: selected.originalPrice ?? selected.price,
        price: newPrice,
      });
      setShowPromoInput(false);
      setPromoInput('');
      refreshSelected(selected.id);
    }
  };

  const removePromo = () => {
    if (!selected) return;
    updateProduct(selected.id, {
      isPromo: false,
      price: selected.originalPrice ?? selected.price,
      originalPrice: undefined,
    });
    refreshSelected(selected.id);
  };

  const toggleBadge = (badge: 'new' | 'premium' | 'trending') => {
    if (!selected) return;
    const has = selected.badges.includes(badge);
    const next = has ? selected.badges.filter(b => b !== badge) : [...selected.badges, badge];
    updateProduct(selected.id, { badges: next as Product['badges'] });
    refreshSelected(selected.id);
  };

  const toggleStock = () => {
    if (!selected) return;
    updateProduct(selected.id, { inStock: !selected.inStock });
    refreshSelected(selected.id);
  };

  // Keep selected in sync
  const liveSelected = selected ? products.find(p => p.id === selected.id) ?? selected : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-taupe" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ui.search}
            className="w-full bg-warm-brown border border-champagne-gold/15 focus:border-champagne-gold/40 rounded-xl pl-9 pr-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="appearance-none bg-warm-brown border border-champagne-gold/15 rounded-xl px-4 py-2.5 pr-8 font-body text-sm text-light-cream outline-none cursor-pointer"
          >
            <option value="all">{ui.allCats}</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label[lang]}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-taupe pointer-events-none" />
        </div>
      </div>

      <p className="text-xs text-muted-taupe font-body">{ui.clickStatus}</p>

      {/* Status panel for selected product */}
      {liveSelected && (
        <div className="bg-dark-cocoa border border-champagne-gold/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <img src={liveSelected.image} alt={liveSelected.name[lang] || liveSelected.name.fr} className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h3 className="font-display text-light-cream text-base">{liveSelected.name[lang] || liveSelected.name.fr}</h3>
              <p className="text-xs text-muted-taupe font-body mt-0.5">{liveSelected.price.toLocaleString()} FCFA · {CATEGORIES.find(c => c.value === liveSelected.category)?.label[lang]}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {liveSelected.badges.map(b => (
                  <span key={b} className="text-[9px] font-accent uppercase tracking-wider bg-champagne-gold/15 text-champagne-gold px-1.5 py-0.5 rounded-full">{b}</span>
                ))}
                <span className={cn('text-[9px] font-accent uppercase px-1.5 py-0.5 rounded-full', liveSelected.inStock ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                  {liveSelected.inStock ? ui.inStockF : ui.soldOut}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-champagne-gold/10" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Stock */}
            <button type="button" onClick={toggleStock} className={cn('py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border transition-all', liveSelected.inStock ? 'border-red-400/30 text-red-400 hover:bg-red-400/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10')}>
              {liveSelected.inStock ? `📦 ${ui.markSoldOut}` : `✅ ${ui.markInStock}`}
            </button>

            {/* Sold */}
            {liveSelected.badges.includes('sold') ? (
              <button type="button" onClick={unmarkSold} className="py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border border-soft-rose/30 text-soft-rose hover:bg-soft-rose/10 transition-all">
                🔄 {ui.unmarkSold}
              </button>
            ) : (
              <button type="button" onClick={markSold} className="py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border border-muted-taupe/20 text-muted-taupe hover:border-soft-rose/40 hover:text-soft-rose transition-all">
                🔴 {ui.markSold}
              </button>
            )}

            {/* Promo / Sales */}
            {liveSelected.isPromo ? (
              <button type="button" onClick={removePromo} className="py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border border-soft-rose/30 text-soft-rose hover:bg-soft-rose/10 transition-all">
                ❌ {ui.rmPromo}
              </button>
            ) : (
              <button type="button" onClick={() => setShowPromoInput(v => !v)} className="py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border border-champagne-gold/20 text-champagne-gold hover:bg-champagne-gold/10 transition-all">
                🏷️ {ui.setPrmo}
              </button>
            )}

            {/* New */}
            <button type="button" onClick={() => toggleBadge('new')} className={cn('py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border transition-all', liveSelected.badges.includes('new') ? 'border-champagne-gold/40 text-champagne-gold bg-champagne-gold/10' : 'border-muted-taupe/20 text-muted-taupe hover:border-champagne-gold/30 hover:text-champagne-gold')}>
              ✨ {liveSelected.badges.includes('new') ? ui.rmNew : ui.addNew}
            </button>

            {/* Premium */}
            <button type="button" onClick={() => toggleBadge('premium')} className={cn('py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border transition-all', liveSelected.badges.includes('premium') ? 'border-champagne-gold/40 text-champagne-gold bg-champagne-gold/10' : 'border-muted-taupe/20 text-muted-taupe hover:border-champagne-gold/30 hover:text-champagne-gold')}>
              👑 {liveSelected.badges.includes('premium') ? 'Retirer premium' : '+ Premium'}
            </button>

            {/* Trending */}
            <button type="button" onClick={() => toggleBadge('trending')} className={cn('py-2.5 px-3 rounded-xl text-xs font-accent font-semibold uppercase tracking-wider border transition-all', liveSelected.badges.includes('trending') ? 'border-champagne-gold/40 text-champagne-gold bg-champagne-gold/10' : 'border-muted-taupe/20 text-muted-taupe hover:border-champagne-gold/30 hover:text-champagne-gold')}>
              🔥 {liveSelected.badges.includes('trending') ? 'Retirer trending' : '+ Trending'}
            </button>
          </div>

          {/* Promo price input */}
          {showPromoInput && !liveSelected.isPromo && (
            <div className="bg-warm-brown rounded-xl p-4 space-y-3">
              <p className="text-xs text-muted-taupe font-body">{ui.currentPrice} <span className="text-champagne-gold font-semibold">{liveSelected.price.toLocaleString()} FCFA</span></p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  placeholder={ui.newPromoPrice}
                  autoFocus
                  className="flex-1 bg-dark-cocoa border border-champagne-gold/30 rounded-xl px-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none"
                />
                <button type="button" onClick={applyPromo} className="px-4 py-2.5 bg-champagne-gold text-deep-espresso rounded-xl text-sm font-accent font-semibold hover:bg-champagne-gold/90 transition-colors">
                  {ui.applyPromo}
                </button>
                <button type="button" onClick={() => setShowPromoInput(false)} className="px-3 py-2.5 border border-muted-taupe/20 text-muted-taupe rounded-xl text-sm hover:border-champagne-gold/30 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => select(p)}
            className={cn(
              'relative cursor-pointer rounded-xl overflow-hidden border transition-all duration-200',
              liveSelected?.id === p.id
                ? 'border-champagne-gold shadow-[0_0_0_2px_rgba(201,169,110,0.3)] scale-[0.98]'
                : 'border-champagne-gold/10 hover:border-champagne-gold/30'
            )}
          >
            <div className="aspect-square bg-dark-cocoa">
              <img src={p.image} alt={p.name[lang] || p.name.fr} className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {p.isPromo && <span className="text-[8px] bg-soft-rose text-white font-accent uppercase px-1.5 py-0.5 rounded-full">Promo</span>}
              {p.badges.includes('sold') && <span className="text-[8px] bg-red-500/80 text-white font-accent uppercase px-1.5 py-0.5 rounded-full">Vendu</span>}
            </div>
            <div className="p-2 bg-warm-brown">
              <p className="font-body text-light-cream/90 text-[11px] truncate">{p.name[lang] || p.name.fr}</p>
              <p className="font-accent text-champagne-gold text-[10px] mt-0.5">{p.price.toLocaleString()} FCFA</p>
            </div>
            {liveSelected?.id === p.id && (
              <div className="absolute inset-0 border-2 border-champagne-gold rounded-xl pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab (section titles + product admin) ────────────────────────────

const SECTION_DEFAULTS: Record<SectionId, { fr: { caption: string; headline: string }; en: { caption: string; headline: string } }> = {
  trending:    { fr: { caption: 'SÉLECTIONNÉS POUR VOUS', headline: 'Tendances du moment' },  en: { caption: 'SELECTED FOR YOU',  headline: 'Trending now' } },
  bestsellers: { fr: { caption: 'LES PLUS AIMÉS',         headline: 'Meilleures ventes' },     en: { caption: 'MOST LOVED',         headline: 'Best sellers' } },
  newarrivals: { fr: { caption: 'FRAÎCHEMENT ARRIVÉS',    headline: 'Nouveaux arrivages' },    en: { caption: 'FRESH ARRIVALS',     headline: 'New arrivals' } },
  sold:        { fr: { caption: 'ÉDITIONS LIMITÉES',       headline: 'Produits vendus' },       en: { caption: 'LIMITED EDITIONS',   headline: 'Sold products' } },
  premium:     { fr: { caption: 'COLLECTION PREMIUM',     headline: 'Styles premium' },         en: { caption: 'PREMIUM COLLECTION', headline: 'Premium styles' } },
};

function SettingsTab() {
  const { lang } = useAppStore();
  const { overrides, setTitle, resetTitle, resetAll } = useSectionStore();
  const [localValues, setLocalValues] = useState<Record<SectionId, { caption: string; headline: string }>>(() => {
    const result = {} as Record<SectionId, { caption: string; headline: string }>;
    for (const id of SECTION_IDS) {
      result[id] = overrides[id] ?? SECTION_DEFAULTS[id][lang];
    }
    return result;
  });
  const [saved, setSaved] = useState<string | null>(null);

  const sectionLabels: Record<SectionId, string> = {
    trending:    lang === 'fr' ? 'Section Tendances'       : 'Trending section',
    bestsellers: lang === 'fr' ? 'Section Meilleures Ventes' : 'Best sellers section',
    newarrivals: lang === 'fr' ? 'Section Nouveautés'     : 'New arrivals section',
    sold:        lang === 'fr' ? 'Section Produits Vendus' : 'Sold products section',
    premium:     lang === 'fr' ? 'Section Premium'        : 'Premium section',
  };

  const saveSection = (id: SectionId) => {
    setTitle(id, localValues[id]);
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  const resetSection = (id: SectionId) => {
    resetTitle(id);
    setLocalValues(prev => ({ ...prev, [id]: SECTION_DEFAULTS[id][lang] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-light-cream">
            {lang === 'fr' ? 'Titres des sections' : 'Section titles'}
          </h3>
          <p className="text-sm text-muted-taupe font-body mt-1">
            {lang === 'fr'
              ? 'Personnalisez les titres affichés sur la boutique.'
              : 'Customize the titles shown on the storefront.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { resetAll(); setLocalValues(Object.fromEntries(SECTION_IDS.map(id => [id, SECTION_DEFAULTS[id][lang]])) as Record<SectionId, { caption: string; headline: string }>); }}
          className="text-xs font-accent text-muted-taupe hover:text-soft-rose transition-colors uppercase tracking-wider"
        >
          {lang === 'fr' ? 'Tout réinitialiser' : 'Reset all'}
        </button>
      </div>

      <div className="space-y-4">
        {SECTION_IDS.map((id) => (
          <div key={id} className="bg-warm-brown rounded-2xl p-5 border border-champagne-gold/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-accent text-xs uppercase tracking-wider text-champagne-gold">{sectionLabels[id]}</p>
              <button
                type="button"
                onClick={() => resetSection(id)}
                className="text-[10px] font-accent text-muted-taupe hover:text-soft-rose transition-colors uppercase tracking-wider"
              >
                {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block font-accent text-[10px] uppercase tracking-wider text-muted-taupe mb-1">
                  {lang === 'fr' ? 'Caption (petite étiquette)' : 'Caption (small label)'}
                </label>
                <input
                  type="text"
                  value={localValues[id].caption}
                  onChange={e => setLocalValues(prev => ({ ...prev, [id]: { ...prev[id], caption: e.target.value } }))}
                  className="w-full bg-dark-cocoa border border-champagne-gold/15 focus:border-champagne-gold/50 rounded-xl px-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-accent text-[10px] uppercase tracking-wider text-muted-taupe mb-1">
                  {lang === 'fr' ? 'Titre principal' : 'Main headline'}
                </label>
                <input
                  type="text"
                  value={localValues[id].headline}
                  onChange={e => setLocalValues(prev => ({ ...prev, [id]: { ...prev[id], headline: e.target.value } }))}
                  className="w-full bg-dark-cocoa border border-champagne-gold/15 focus:border-champagne-gold/50 rounded-xl px-4 py-2.5 font-body text-sm text-light-cream placeholder:text-muted-taupe/40 outline-none transition-colors"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => saveSection(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-accent font-semibold transition-all',
                saved === id
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-champagne-gold text-deep-espresso hover:bg-champagne-gold/90'
              )}
            >
              {saved === id ? <><Check className="w-4 h-4" /> {lang === 'fr' ? 'Sauvegardé !' : 'Saved!'}</> : (lang === 'fr' ? 'Sauvegarder' : 'Save')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step field keys ──────────────────────────────────────────────────────────

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['name', 'price', 'category'],
  2: ['store'],
  3: ['desc', 'images'],
  4: [],
};

// ─── Main Admin Component ─────────────────────────────────────────────────────

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('quest-admin') === 'true'
  );
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState<'add' | 'manage' | 'edit' | 'ventes' | 'settings'>('add');
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { lang } = useAppStore();
  const { addProduct, updateProduct } = useProductStore();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { badges: [], inStock: true, store: 'both', isBestSeller: false, isPromo: false, images: [] } });

  const handleAuth = () => {
    sessionStorage.setItem('quest-admin', 'true');
    setAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('quest-admin');
    setAuthenticated(false);
  };

  const startEdit = (product: Product) => {
    const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
    form.reset({
      name: product.name[lang] || product.name.fr,
      price: product.originalPrice ?? product.price,
      promoPrice: product.isPromo ? product.price : undefined,
      category: product.category as FormData['category'],
      badges: product.badges as FormData['badges'],
      store: product.store as FormData['store'],
      inStock: product.inStock,
      isBestSeller: product.isBestSeller ?? false,
      isPromo: product.isPromo ?? false,
      desc: product.description[lang] || product.description.fr,
      images: imgs,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
    });
    setEditingId(product.id);
    setStep(1);
    setTab('edit');
  };

  const resetToAdd = () => {
    form.reset({ badges: [], inStock: true, store: 'both', isBestSeller: false, isPromo: false, images: [] });
    setEditingId(null);
    setStep(1);
    setTab('add');
  };

  const nextStep = async () => {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields);
    if (valid) setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = form.handleSubmit((data) => {
    const finalPrice = data.isPromo && data.promoPrice ? data.promoPrice : data.price;
    const originalPrice = data.isPromo && data.promoPrice ? data.price : undefined;

    const product: Product = {
      id: editingId ?? `admin-${Date.now()}`,
      name: { fr: data.name, en: data.name },
      description: { fr: data.desc, en: data.desc },
      price: finalPrice,
      originalPrice,
      image: data.images[0],
      images: data.images,
      category: data.category,
      badges: data.badges as Product['badges'],
      inStock: data.inStock,
      isPromo: data.isPromo,
      isBestSeller: data.isBestSeller,
      store: data.store,
      sizes: data.sizes?.length ? data.sizes : undefined,
      colors: data.colors?.length ? data.colors : undefined,
    };

    if (editingId) {
      updateProduct(editingId, product);
    } else {
      addProduct(product);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetToAdd();
      setTab('manage');
    }, 2000);
  });

  if (!authenticated) return <PinGate onSuccess={handleAuth} />;

  return (
    <div className="min-h-screen bg-dark-cocoa">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-cocoa/95 backdrop-blur-md border-b border-champagne-gold/12">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-muted-taupe hover:text-light-cream transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display text-light-cream text-lg tracking-tight">
              Guest <span className="text-champagne-gold">Admin</span>
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-muted-taupe hover:text-light-cream transition-colors font-accent uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            {ADMIN_UI[lang].logout}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-warm-brown rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={resetToAdd}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-accent transition-all',
              tab === 'add' ? 'bg-champagne-gold text-deep-espresso font-semibold' : 'text-muted-taupe hover:text-light-cream'
            )}
          >
            <Plus className="w-4 h-4" />
            {ADMIN_UI[lang].tabs.add}
          </button>
          <button
            onClick={() => setTab('manage')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-accent transition-all',
              tab === 'manage' ? 'bg-champagne-gold text-deep-espresso font-semibold' : 'text-muted-taupe hover:text-light-cream'
            )}
          >
            <Package className="w-4 h-4" />
            {ADMIN_UI[lang].tabs.manage}
          </button>
          <button
            onClick={() => setTab('ventes')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-accent transition-all',
              tab === 'ventes' ? 'bg-champagne-gold text-deep-espresso font-semibold' : 'text-muted-taupe hover:text-light-cream'
            )}
          >
            {ADMIN_UI[lang].tabs.ventes}
          </button>
          <button
            onClick={() => setTab('settings')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-accent transition-all',
              tab === 'settings' ? 'bg-champagne-gold text-deep-espresso font-semibold' : 'text-muted-taupe hover:text-light-cream'
            )}
          >
            ⚙️ {lang === 'fr' ? 'Titres' : 'Titles'}
          </button>
          {tab === 'edit' && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-accent bg-champagne-gold text-deep-espresso font-semibold"
            >
              <Pencil className="w-4 h-4" />
              {ADMIN_UI[lang].tabs.edit}
            </button>
          )}
        </div>

        {tab === 'manage' ? (
          <ManageTab onEdit={startEdit} />
        ) : tab === 'ventes' ? (
          <VentesTab />
        ) : tab === 'settings' ? (
          <SettingsTab />
        ) : success ? (
          <div className="text-center py-24">
            <CheckCircle2 className="w-16 h-16 text-champagne-gold mx-auto mb-4" />
            <h2 className="font-display text-2xl text-light-cream mb-2">
              {editingId ? ADMIN_UI[lang].successEdit : ADMIN_UI[lang].successAdd}
            </h2>
            <p className="text-muted-taupe font-body text-sm">Visible immédiatement dans la boutique.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {tab === 'edit' && (
              <div className="flex items-center gap-2 text-sm text-champagne-gold font-body">
                <Pencil className="w-4 h-4" />
                Mode édition — modifications sauvegardées sur le produit existant
              </div>
            )}

            <div className="flex justify-center overflow-x-auto pb-2">
              <StepBar current={step} />
            </div>

            <div>
              <h2 className="font-display text-2xl text-light-cream">
                {ADMIN_UI[lang].steps[step - 1].label}
              </h2>
              <p className="text-sm text-muted-taupe font-body mt-1">{ADMIN_UI[lang].steps[step - 1].desc}</p>
            </div>

            <div className="bg-warm-brown rounded-2xl p-6 border border-champagne-gold/10">
              <form onSubmit={onSubmit}>
                {step === 1 && <Step1 form={form} />}
                {step === 2 && <Step2 form={form} />}
                {step === 3 && <Step3 form={form} />}
                {step === 4 && <Step4 form={form} />}

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-champagne-gold/10">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-accent font-semibold transition-all',
                      step === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'text-muted-taupe hover:text-light-cream border border-muted-taupe/20 hover:border-champagne-gold/30'
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {ADMIN_UI[lang].prev}
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 bg-champagne-gold text-deep-espresso rounded-xl text-sm font-accent font-semibold hover:bg-champagne-gold/90 transition-colors"
                    >
                      {ADMIN_UI[lang].next}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-champagne-gold text-deep-espresso rounded-xl text-sm font-accent font-semibold hover:bg-champagne-gold/90 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {editingId ? ADMIN_UI[lang].update : ADMIN_UI[lang].publish}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-muted-taupe font-body">
              {step} / {ADMIN_UI[lang].steps.length}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
