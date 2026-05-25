# Guest Store — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| react-router-dom | ^7.0.0 | Client-side routing (4 routes) |
| gsap | ^3.12.0 | Animation engine, timelines, ScrollTrigger, SplitText, Flip |
| lenis | ^1.2.0 | Smooth scroll with inertia |
| zustand | ^5.0.0 | Lightweight state management |
| react-hook-form | ^7.54.0 | Admin product forms |
| @hookform/resolvers | ^4.0.0 | Zod validation for forms |
| zod | ^3.24.0 | Schema validation |
| @fontsource/playfair-display | ^5.0.0 | Self-hosted display font (weights 400-700) |
| @fontsource/inter | ^5.0.0 | Self-hosted body font (weights 300-500) |
| @fontsource/montserrat | ^5.0.0 | Self-hosted accent font (weights 600-700) |
| lucide-react | ^0.469.0 | Icon library (most UI icons) |

**No additional UI component libraries.** All components built from scratch on top of Tailwind CSS + shadcn/ui base. Lucide covers all icons except WhatsApp and TikTok, which are inline custom SVGs.

---

## Component Inventory

### shadcn/ui Components (Base Layer)

| Component | Installation | Usage |
|-----------|-------------|-------|
| Dialog | `npx shadui add dialog` | Admin delete confirmation modals |
| Input | `npx shadui add input` | Admin form fields, search bar |
| Textarea | `npx shadui add textarea` | Admin product descriptions |
| Select | `npx shadui add select` | Admin category dropdown, store selector |
| Label | `npx shadui add label` | Admin form labels |
| RadioGroup | `npx shadui add radio-group` | Product detail store selector |
| Badge | `npx shadui add badge` | Product status badges (stock, trending, new) |
| Separator | `npx shadui add separator` | Admin sidebar, footer dividers |
| Sheet | `npx shadui add sheet` | Mobile navigation drawer, cart drawer |
| ScrollArea | `npx shadui add scroll-area` | Cart drawer item list, admin tables |
| Table | `npx shadui add table` | Admin products table, orders table |

### Custom Components

**Layout & Navigation:**

| Component | Props | Description |
|-----------|-------|-------------|
| `GlassNavbar` | — | Sticky glassmorphic nav with blur, theme toggle, lang switcher, cart badge |
| `MobileMenu` | `isOpen, onClose` | Slide-out drawer for mobile nav links |
| `CustomCursor` | — | Gold blended cursor, 3 states (default, hover, product), disabled on touch |
| `Footer` | — | 4-column dark footer with social links, admin mode link |
| `LoadingScreen` | `onComplete` | Full-screen overlay with SVG gold line draw animation, min 1.5s display |

**Reusable Components:**

| Component | Props | Description |
|-----------|-------|-------------|
| `GoldButton` | `variant: 'primary' \| 'secondary' \| 'ghost', children, onClick, ...` | Pill-shaped buttons with gold/outline/ghost variants |
| `ProductCard` | `product: Product, badges?: string[]` | 3D floating card with tilt, hover actions (heart/eye), badge display |
| `GoldBadge` | `variant: 'trending' \| 'new' \| 'premium' \| 'sold'` | Champagne gold pill badge, color adapts by variant |
| `StockBadge` | `inStock: boolean` | Green dot + text or muted red "sold out" |
| `SectionHeader` | `caption, headline, align?: 'left' \| 'center', link?` | Caption + Playfair headline with optional "See all" link |
| `FloatingParticles` | `count?: number, color?: 'gold' \| 'rose' \| 'mixed'` | CSS-animated drifting circles, count varies by breakpoint |
| `GoldLeaf` | `position: 'top' \| 'bottom' \| 'left' \| 'right'` | Decorative gold accent shapes with floating GSAP animation |
| `ImageToVideo` | `imageSrc, videoSrc?, alt` | Desktop-only hover-triggered video swap with crossfade |
| `WhatsAppButton` | `store: 'yaounde' \| 'kribi', productName?` | Green WhatsApp CTA that opens correct store number |
| `StoreSelector` | `selected, onChange` | Radio group for Yaoundé/Kribi store selection |
| `LangSwitch` | — | FR/EN toggle with fade transition, persisted to localStorage |
| `ThemeToggle` | — | Sun/moon toggle with 500ms color transition, persisted |

**Section Components:**

| Component | Key Features |
|-----------|-------------|
| `HeroSection` | 3-column asymmetric layout, SplitText line-by-line reveal, floating product image, mouse parallax |
| `AboutSection` | 60/40 split, left image with scroll parallax (0.8x speed) |
| `CategoriesSection` | Horizontal scroll mobile / 4-col desktop, image scale on hover with overlay |
| `TrendingSection` | 4-col grid, "Trending" badge on each card |
| `BestSellersSection` | 4-col grid, "Best seller" badge |
| `NewArrivalsSection` | 4-col grid, pulsing "Nouveau" badge |
| `SoldProductsSection` | 4-col grid, grayscale cards at 0.6 opacity, "VENDU" diagonal stamp overlay |
| `PremiumStylesSection` | Dark background section, 1 featured landscape card + 3 smaller cards, gold glow shadow |
| `SearchSection` | Large centered search bar, voice search pulse animation, tag chips, results overlay |
| `LocationSection` | 2-col (text/map), store cards with WhatsApp buttons, bouncing map pin animation |
| `FAQSection` | Accordion with auto-close, chevron rotate, height animation, staggered entrance |

**Overlay Components:**

| Component | Description |
|-----------|-------------|
| `ProductDetailOverlay` | Full-screen glassmorphic overlay, 2-col card (image gallery + details), similar products horizontal scroll, GSAP open/close |
| `CartDrawer` | Right slide-out drawer, backdrop blur, item list with quantity steppers, sticky checkout footer, empty state |
| `QuickViewModal` | Lightweight product preview (lighter than full overlay) |

**Admin Components:**

| Component | Description |
|-----------|-------------|
| `AdminLayout` | Sidebar (200px dark) + main content layout, route-based content swap |
| `AdminSidebar` | Navigation items with icons, active state |
| `StatCard` | Dashboard metric card with count-up animation on mount |
| `ProductsTable` | Sortable/filterable table with image thumbnails, action buttons |
| `ProductForm` | Create/edit form with drag-drop image upload, FR+EN fields, video toggle |
| `ImageUploader` | Drag-drop zone with gold border feedback, progress bar, thumbnail preview |
| `Toast` | Bottom-right notification, auto-dismiss 3s, slide-in from right |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| **Page loading sequence** | GSAP timeline | Timeline: gold line stroke-dashoffset draw → shimmer repeat → overlay fade 400ms on complete. Min duration enforced via `gsap.delayedCall`. | Medium |
| **Hero text line-by-line reveal** | GSAP + SplitText | SplitText splits headline into lines, each wrapped in overflow-hidden. GSAP staggered translateY(100%→0), 500ms, power3.out, 150ms stagger. Caption → headline → subtitle → CTAs sequenced. | Medium |
| **Hero product image entrance** | GSAP | translateX(60px→0), opacity 0→1, 800ms, power3.out. Continuous floating: gsap.to translateY ±10px, 6s yoyo infinite. | Low |
| **Gold leaf floating accents** | GSAP | Fade in 400ms, then gsap.to translateY ±6px, 4s yoyo infinite. Positioned absolutely at section boundaries. | Low |
| **Scroll-triggered fade-up entrance** | GSAP ScrollTrigger | Batch utility: opacity 0→1, translateY(30px→0), 600ms, power3.out. Trigger: top 85% viewport. 80ms stagger siblings. Applied globally via reusable hook. | Medium |
| **Card 3D flip-up entrance** | GSAP ScrollTrigger | Cards: opacity 0→1, translateY(40px→0), rotateX(-8°→0), 700ms, power2.out. 100ms stagger. Triggered on grid containers. | Medium |
| **3D card hover tilt** | Vanilla JS + CSS | mousemove calculates rotationX/Y (max ±8°) relative to card center. CSS transition with spring-like cubic-bezier. translateZ(12px), shadow deepens. Disabled on touch. | High |
| **Mouse parallax (hero)** | Vanilla JS | mousemove listener on hero container. Inner elements shift proportionally (image ±12px, text ±6px). requestAnimationFrame with lerp (0.1 factor) for smooth interpolation. | Medium |
| **Scroll parallax (about image)** | GSAP ScrollTrigger | Image translateY tied to scroll progress at 0.8x rate. scrub: true for smooth linkage. | Low |
| **Floating particles** | CSS @keyframes | 20-30 absolutely positioned divs (2-4px). CSS animation: drift upward 15-40s, random horizontal translate ±20px. Opacity 0.15-0.3. Count reduced to 10 on mobile via JS breakpoint. | Low |
| **Custom cursor** | Vanilla JS | `cursor: none` on body. Positioned div follows mouse via rAF + lerp (0.15). State changes (default 10px filled → hover 40px ring → product "Voir" pill) via CSS transitions 200ms. Disabled on touch detection. | High |
| **Product detail overlay open/close** | GSAP | Open: backdrop opacity 0→1 (300ms), card scale 0.9→1 + opacity (400ms, power3.out). Close: reverse. Escape/outside-click/X trigger close. | Medium |
| **Cart drawer slide** | GSAP | Drawer: translateX(100%→0), 400ms, power3.out. Backdrop: opacity 0→1, 200ms. Close: reverse. | Low |
| **Mobile menu drawer** | CSS transitions | Sheet component from shadcn handles slide animation. | Low |
| **FAQ accordion** | GSAP | Chevron rotate 180° (300ms). Height 0→auto via gsap.to on wrapper (400ms, power2.out). Auto-close others via state. | Medium |
| **Category card hover** | CSS | Image scale 1.08x (400ms ease-out). Overlay opacity 0→0.2. Category name text-shadow glow. | Low |
| **Navigation link underline** | CSS | Pseudo-element width 0%→100%, 250ms, Champagne Gold. | Low |
| **Button hover states** | CSS | Scale 1.03x, background brighten, box-shadow appear. 300ms ease-out. | Low |
| **Theme transition** | CSS | `transition: background-color 500ms ease, color 500ms ease` on themed elements. | Low |
| **Language text swap** | GSAP | Fade out 150ms → swap text → fade in 150ms. Triggered by context change. | Low |
| **Route transitions** | GSAP | Fade + translateY(20px→0), 400ms, on outlet wrapper. | Low |
| **Sold "VENDU" stamp** | CSS | Absolute positioned rotated text, Soft Rose at 20% opacity. Static, no animation. | Low |
| **Cart badge pulse** | CSS | scale(1→1.3→1), 400ms, triggered on add-to-cart. | Low |
| **"Nouveau" badge pulse** | CSS | scale(1→1.05→1), 2s infinite. | Low |
| **Search bar focus** | CSS | Border color → Champagne Gold, box-shadow, scale 1.01x. | Low |
| **Voice search wave** | CSS | 3 bars with oscillating height via CSS animation when active. | Low |
| **Admin stat count-up** | GSAP | gsap.to with snap plugin, 0→value over 800ms. Triggered on mount. | Low |
| **Admin image upload feedback** | CSS | Border color → gold on dragover. Progress bar width animation. | Low |
| **Toast notification** | GSAP | translateX(100%→0), 300ms, power3.out. Auto-dismiss 3s. | Low |

**Total animations: 28 | Low: 18 | Medium: 8 | High: 2**

---

## State & Logic Plan

### Global Stores (Zustand)

**Cart Store**
```
items: CartItem[] (id, name, price, qty, image, store)
addItem(product, store) → checks duplicates, increments qty
removeItem(id) → filters out
updateQty(id, qty) → qty <= 0 triggers remove
isOpen: boolean (drawer visibility)
totalItems: derived (sum qty)
subtotal: derived (sum price * qty)
```
Persisted to `localStorage`. Cart drawer opens automatically on add.

**App Store (UI preferences)**
```
lang: 'fr' | 'en' (default 'fr', persisted localStorage)
theme: 'light' | 'dark' (default from prefers-color-scheme, persisted localStorage)
activeStore: 'yaounde' | 'kribi' | null (null triggers store selector modal)
setLang(lang) → triggers text fade transition
setTheme(theme) → triggers 500ms CSS transition
setActiveStore(store)
```

**Product Store**
```
products: Product[] (fetched from API, cached with SWR pattern)
categories: Category[]
filter: { category, search, sort, status }
setFilter(filter) → triggers client-side filtering
filteredProducts: derived
selectedProduct: Product | null (for detail overlay)
```

**Admin Store**
```
isAuthenticated: boolean (JWT check)
adminUser: { name, role } | null
login(credentials) → API call, sets JWT cookie
logout() → clears auth
products: Product[] (admin view, full CRUD)
orders: Order[]
stats: { totalProducts, ordersToday, revenue, lowStock }
```

### Data Layer

- **Products**: RESTful API endpoints (`/api/products`, `/api/products/:id`). Products served as JSON with image URLs. Admin CRUD operations via same API with auth headers.
- **Orders**: Stored server-side. Admin dashboard reads order data. Customer orders created via WhatsApp (not stored).
- **Images**: Cloud storage (S3-compatible) with CDN delivery. Admin uploads go through presigned URL flow.
- **Videos**: Optional product hover videos, uploaded via same system. Lazy-loaded, desktop-only.

### Routing Logic

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | Home (all sections) | No |
| `/produit/:id` | ProductDetailOverlay rendered in outlet | No |
| `/admin` | AdminLayout with nested routes | Yes (JWT) |
| `/admin/dashboard` | Dashboard overview | Yes |
| `/admin/products` | Product management table | Yes |
| `/admin/products/new` | Add product form | Yes |
| `/admin/products/:id/edit` | Edit product form | Yes |

### Form Handling

- Admin product forms use `react-hook-form` + Zod schema validation
- Image upload: Client-side drag-drop → direct-to-cloud upload with progress → URL returned → saved to form state
- Multi-step form not needed; single comprehensive form with sections

### WhatsApp Integration

- Store numbers hardcoded: Yaoundé and Kribi each have dedicated WhatsApp Business numbers
- `WhatsAppButton` constructs `https://wa.me/{number}?text={encodedMessage}` with product name, price, and store pre-filled
- Opens in new tab

---

## Other Key Decisions

### Image Strategy
- **28 product/category images** generated at build time and stored as static assets in `/public/images/`
- Responsive images: `srcSet` with 400w/800w variants, lazy-loaded via `loading="lazy"` + Intersection Observer for below-fold
- Format: WebP primary with JPEG fallback via `<picture>` element
- Hero product image preloaded with `fetchpriority="high"`

### Video Strategy
- Hover-to-video feature: MP4/WebM only, max 5 seconds, 3 videos max in DOM at once
- Mobile: Feature disabled (performance), shows static image only
- Videos loaded on hover intent (mouseenter triggers fetch, mouseleave cancels)

### Performance Architecture
- Code splitting: Admin routes lazy-loaded (`React.lazy` + `Suspense`)
- GSAP plugins registered once in app entry point
- Fonts self-hosted via @fontsource for zero FOUT, loaded with `font-display: swap`
- Floating particles: CSS-only (no Canvas/WebGL) for battery and performance
- 3D card tilt: CSS `transform: perspective() rotateX() rotateY()` — pure GPU, no library overhead

### Accessibility
- `prefers-reduced-motion`: Disables floating particles, smooth scroll, hero floating, gold leaf oscillation. Keeps fade-up entrances.
- All product cards are `<a>` elements for keyboard/screen-reader
- Focus trapping in ProductDetail overlay and Cart drawer
- ARIA labels on all icon-only buttons
- WCAG AA contrast: 4.5:1 body, 3:1 large text verified against both themes

### Security
- Admin auth: JWT in httpOnly cookie, protected API routes return 401 if invalid
- Product image upload: File type validation (jpg/png/webp), size limit (5MB), server-side sanitization
- Rate limiting on login endpoint
