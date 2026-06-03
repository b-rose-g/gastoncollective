# Tech Spec — The Gaston Collective

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM renderer |
| `gsap` | ^3.12.0 | Core animation engine + ScrollTrigger plugin |
| `lenis` | ^1.0.0 | Smooth scroll with inertia |
| `lucide-react` | ^0.400.0 | Icons (ChevronDown, Instagram, Mail, etc.) |
| `tailwindcss` | ^3.4.0 | Utility CSS |

## Component Inventory

### Layout

| Component | Source | Reuse |
|-----------|--------|-------|
| `CustomCursor` | Custom | Global — fixed position, z-index 9999 |
| `NoiseOverlay` | Custom | Wrapped around every dark section via a shared layout component |

### Sections (single-page)

| Component | Source | Notes |
|-----------|--------|-------|
| `HeroSection` | Custom | Character-by-character text reveal, venture badges |
| `AboutStrip` | Custom | CSS marquee text with torn-paper edges |
| `VenturesGrid` | Custom | Three panels with clip-path wipe reveal, hover glow effects |
| `FeaturedShowcase` | Custom | Alternating image/text rows with offset border effect |
| `FooterSection` | Custom | Display CTA, social links, ink splatter SVG |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| `CharReveal` | Custom | HeroSection — wraps text and splits into character spans for GSAP stagger |
| `OffsetBorderImage` | Custom | FeaturedShowcase — image with offset accent border that aligns on hover |

### Hooks

| Hook | Purpose |
|------|---------|
| `useLenis` | Initializes Lenis, connects to ScrollTrigger, returns instance ref for scrollTo |

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Text Character Reveal | GSAP | Split text into `<span>` per char, stagger opacity+y animation | Medium |
| Venture Panel Wipe | GSAP ScrollTrigger | `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)`, stagger 0.2s | Medium |
| Marquee Text | CSS `@keyframes` | Duplicate text, translateX(-50%) over 30s linear infinite | Low |
| Offset Border Hover | CSS `::after` + `transition` | Pseudo-element offset by 8px, animates to 0px on hover | Low |
| Panel Hover Glow | CSS `transition` | `box-shadow` in accent color appears on hover | Low |
| Scroll-Triggered Section Reveals | GSAP ScrollTrigger | Standard fade-up pattern, start: "top 85%" | Low |
| Custom Cursor | Vanilla JS + RAF | 4px dot → 24px circle on hover, lerp 0.15 | Medium |
| Torn Paper Edges | CSS `clip-path` | Polygon clip-path creating jagged top/bottom edges on about strip | Low |
| Venture Badge Entrance | GSAP | Scale from 0.8 + opacity fade, stagger after title completes | Low |

## State & Logic

### Cursor ↔ Interactive Element Coordination
Event delegation on `document.body` for `mouseenter`/`mouseleave` on `a`, `button`, `[data-cursor-hover]`. Single boolean state toggles cursor size and blend mode. No per-component hover tracking needed.

### Lenis Instance Access
The Lenis instance is created in `App.tsx` and stored in a ref. Exposed via a custom hook (`useLenis`) that returns the ref. Navigation and any scroll-to actions call `lenisRef.current.scrollTo(target)`.

### Venture Panel Hover State
Each panel manages its own hover state locally via React `useState`. No shared state needed — panels are independent. The hover effect is purely visual (CSS transitions on box-shadow and transform).

## Other Key Decisions

### No shadcn/ui
This is a fully bespoke artistic site with no standard UI patterns. Every element is custom-styled. Tailwind is used for utility CSS only.

### Noise Overlay via CSS
Rather than generating an external noise image asset, use an inline SVG data URI in CSS. This avoids an additional network request and ensures the noise is always available. Applied as a `::before` pseudo-element on a shared `.noise-overlay` class.

### Font Loading
Google Fonts loaded via `<link>` in `index.html`: Playfair Display (400, 600, 700), Caveat (400, 500, 600), Inter (400, 500, 600).

### Image Assets
All images generated via AI image generation. 5 images total: 3 venture panel backgrounds, 2 featured showcase images. Kept minimal to match the asset limit.

### Single Page Architecture
All content lives on one page with smooth-scroll navigation. Sections identified by `id` attributes for anchor linking. No client-side routing needed.
