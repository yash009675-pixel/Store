# Apna Store

A premium, cinematic storefront — editorial typography, liquid-glass surfaces,
purposeful motion and a mobile-first responsive system, built on one shared
design language.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm run preview  # serve the production build
```

---

## ⚠️ Read this first: the repository was empty

When this work started, `yash009675-pixel/Store` contained exactly one file —
a `README.md` with the text `# Store`. There was no prior Apna Store codebase,
no backend, no product catalogue and no hero video asset in the repository.

Everything here is therefore a **new foundation**, built to the brief, under
one non-negotiable rule taken from that brief:

> **No fabricated commerce data.** No invented products, prices, stock levels,
> reviews, ratings, orders, customers, payments, couriers or tracking numbers.

Where real data would normally appear and no backend is connected, the UI
renders an **honest empty, loading or not-connected state** instead of filler.
If you have the original Apna Store project, this design system is structured
to be ported onto it rather than to replace it.

---

## Connecting the real catalogue

```bash
cp .env.example .env
```

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

The whole app switches from "not connected" to live data automatically.

**Security:** only the *publishable anon* key belongs in a `VITE_*` variable —
anything with that prefix is compiled into the browser bundle and is readable
by anyone. A service-role key must never go here. Access control must be
enforced server-side (RLS / row policies), never by hiding a React component.

### Expected shape

`src/lib/catalog.ts` maps rows defensively, so several common column namings
work out of the box.

| Concept | Columns it will accept |
| --- | --- |
| id | `id`, `product_id` |
| name | `name`, `title`, `product_name` |
| price | `price`, `selling_price`, `amount` |
| was-price | `compare_at_price`, `mrp`, `original_price` |
| images | `images[]`, `image_urls[]`, `gallery[]`, or `image_url` / `image` / `thumbnail` |
| category | `category_slug`, `category` |
| sizes | `sizes[]`, `available_sizes[]` (strings or `{value, available}`) |
| colors | `colors[]` (strings or `{name, swatch, available}`) |
| stock | `in_stock`, `available`, `stock`, `quantity` |
| rating | `rating_average` / `rating`, `rating_count` / `review_count` |

A category only becomes shoppable when products genuinely exist in it;
otherwise it shows **Coming soon**, never "no products match".

---

## Architecture

```
src/
├── styles/index.css      Design tokens, motion system, liquid glass, reduced motion
├── lib/                  types · catalog (data access) · supabase · categories · format · meta
├── hooks/                scroll reveal · motion prefs · scroll lock · focus trap · magnetic
├── context/              CatalogProvider · StoreProvider (bag/wishlist) · ToastProvider
├── components/
│   ├── ui/               Button · Field · Reveal · SmartImage · Overlay · Accordion
│   │                     EmptyState · Skeleton · StateViews · Marquee
│   ├── layout/           Header · MorphingNav · MobileMenu · SearchOverlay · Footer · Chrome
│   ├── commerce/         ProductCard · ProductGallery · CategoryTile · WishlistButton · BagDrawer
│   └── home/             Hero · Sections
└── pages/                Home Shop Category Product Bag Checkout Account About Support Legal Admin 404
```

### The motion system

One token set drives every animation, so nothing feels bolted on:

| Token | Duration | Used for |
| --- | --- | --- |
| `--motion-fast` | 180ms | microinteractions, hover, press |
| `--motion-normal` | 340ms | UI transitions, dropdowns, accordions |
| `--motion-slow` | 760ms | editorial reveals |
| `--motion-cinematic` | 1150ms | image reveals, hero text |
| `--motion-scene` | 1400ms | hero scene changes |

Scroll reveals use **one** `IntersectionObserver` for the whole document
(`useScrollReveal`), elements opt in with `data-reveal`, and each is released
after firing so `will-change` is never left on.

### Reduced motion

`prefers-reduced-motion: reduce` is handled centrally in `index.css`. Critically,
scroll-revealed content is forced back to `opacity: 1` — content is never left
invisible because an animation was skipped. Parallax, drift, marquee, grain and
the custom cursor all switch off.

---

## Honest-state inventory

| Surface | Without a backend |
| --- | --- |
| Featured / Shop / Category | "Products aren't connected yet" + how to connect |
| Product detail | 404 (the product genuinely doesn't exist) |
| Reviews | "No reviews yet" — never an invented count |
| Orders / Wallet / Notifications / Membership | Explicit "not connected", no sample rows |
| **Checkout payment step** | **Stops and says payment isn't connected. Never shows success.** |
| Contact + account support forms | Validate properly, then state the message was *not* delivered |
| Admin | Locked; shows module names only, zero business figures |
| Legal pages | Neutral policy structure with no invented windows, fees or delivery promises |

Bag and wishlist *are* fully functional — they're the shopper's own choices,
persisted to `localStorage`, never pre-seeded.

---

## Accessibility & responsive

- Skip link, semantic landmarks, one `<h1>` per page, visible focus rings
- Focus trap + Escape + restore-focus on every modal, drawer and sheet
- iOS-safe body scroll lock; `--app-vh` keeps `100vh` honest on mobile Safari
- 44px minimum touch targets; no interaction depends on hover
- Keyboard support for the hero carousel, product gallery, morphing nav and filters
- `overflow-x: hidden` guards plus fluid `clamp()` type — verified from 320px up

## Imagery

`public/media/` holds **10 generated editorial brand images** (hero, lookbook,
craft, and 4 category tiles). These are atmosphere/art direction placeholders,
**not product photography** — swap them for real Apna Store assets.

Four categories (Footwear, Accessories, Ethnic, Western Wear) deliberately fall
back to a typographic tile rather than borrowing an unrelated photo.

### Hero video

`src/components/home/Hero.tsx` is video-ready. Drop an MP4 into `public/media/`
and set `HERO_VIDEO` to its path — it becomes the first scene, with the current
stills as poster and fallback. Left `null` because no video asset exists here.
