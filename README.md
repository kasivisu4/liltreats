# liltreats 🎁

A premium, mobile-first booking app for **liltreats** ([@_liltreats_](https://www.instagram.com/_liltreats_/)) — a handcrafted **mystery scoop** brand. Each "scoop" is a curated surprise box of jewellery, accessories, trinkets, and lifestyle goodies. Limited weekly drops, reset every Monday.

Responsive for **desktop and mobile**, installable as a PWA.

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** — design tokens (blush / gold / lavender / sage palette)
- **TanStack Query** — data fetching & caching (`src/api/`)
- **TanStack Router** — type-safe routing (`src/router.tsx`)
- **TanStack Virtual** — virtualized inventory grid
- **Zustand** — cart / booking flow state (`src/store/`)
- **Framer Motion** — animations (sparkles, confetti, transitions)
- **vite-plugin-pwa** — installable on mobile

## Features

- 3 scoop tiers — Mini (₹499), Magic (₹899), Premium (₹1,099) + shipping, freebies included
- Optional video reel add-on (+₹99)
- Booking flow: tier → vibe/preferences (keeps the box a surprise) → cart → confirmation
- Live per-tier weekly slot counts
- "This week's scoops" — virtualized inventory pool with tier / new / limited / in-stock filters
- My Orders with live status tracking
- Customizable event banner (New drop / Diwali / Flash sale / Gift mode)
- Prepaid checkout (UPI / Card / Wallet) — no COD
- Referral codes, testimonials, Instagram integration

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Backend

The data layer is currently mocked in [`src/api/mockApi.ts`](src/api/mockApi.ts) (in-memory, simulated latency) — a drop-in swap point for **Supabase**. Not yet wired: Supabase tables + weekly reset, Razorpay payments, and WhatsApp order notifications.
