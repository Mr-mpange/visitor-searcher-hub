# Find Place

> Discover and book accommodations, rides, and event venues across Africa — online or offline.

**Live site:** [https://mr-mpange.github.io/visitor-searcher-hub/](https://mr-mpange.github.io/visitor-searcher-hub/)

---

## The Problem

Travelers and locals across Africa struggle to find and book quality accommodations, transport, and event venues in one place. Existing platforms are either too expensive, require stable internet, or simply don't cover the region well. Millions of potential customers are locked out because they don't have smartphones or reliable data.

## The Solution

Find Place is a unified booking platform built for Africa. It connects visitors with local service providers across three categories — stays, rides, and events — and makes booking accessible to everyone through both a modern web app and a USSD interface that works on any phone, no internet required.

---

## Features

**For Visitors**
- Search and book accommodations, rides, and event venues
- Filter by location, date, guests, and price
- Secure payments via M-Pesa, credit card, or USSD
- Booking history and confirmation via SMS and voice call
- Save favorites and manage your profile
- Multi-language support

**For Service Providers (Owners)**
- Dashboard to manage listings, bookings, and availability
- Add and edit accommodations, rides, and event venues
- Image uploads for listings
- Booking notifications

**For Everyone — USSD Booking**
- Dial `*384*123#` from any mobile phone
- No internet or smartphone required
- Browse listings, select dates, and confirm bookings via M-Pesa prompt
- Works on basic feature phones across all networks

**Admin**
- User and listing management
- Platform-wide oversight dashboard

---

## How It Works

1. **Search** — Enter your location, dates, and number of guests
2. **Select** — Browse listings with photos, ratings, and pricing
3. **Book** — Choose your payment method and confirm
4. **Enjoy** — Receive SMS and voice confirmation, then show up

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Snippe (M-Pesa, card, QR) |
| USSD | Africa's Talking / custom Supabase Edge Function |
| Notifications | Edge Functions (SMS + voice call) |
| Deployment | GitHub Pages |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev
```

---

## Deployment

```bash
npm run build
npx gh-pages -d dist
```

---

## Project Structure

```
src/
├── pages/          # Route-level page components
│   ├── admin/      # Admin dashboard
│   ├── owner/      # Provider/owner portal
│   └── ...         # Public pages
├── components/     # Reusable UI components
│   ├── home/       # Landing page sections
│   ├── layout/     # Navbar, Footer
│   └── ui/         # shadcn/ui primitives
├── contexts/       # Language context
├── hooks/          # Auth, favorites, mobile detection
└── integrations/   # Supabase client + types

supabase/
├── functions/      # Edge functions
│   ├── create-payment-session/   # Snippe payment integration
│   ├── ussd-handler/             # USSD booking flow
│   ├── send-booking-notification/
│   └── post-booking-call/
└── migrations/     # Database schema
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the Edge Functions, set these in your Supabase project secrets:
- `SNIPPE_API_KEY` — payment provider key
