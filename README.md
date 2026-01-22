# Custom Artwork Platform

A standalone web platform where customers commission custom artwork from a photo of a place they love, preview it live in different colour palettes, approve it, and have it automatically printed and shipped in the UK.

## Features

### Customer Flow
1. **Homepage** - Interactive demo with live palette switching
2. **Create Page** - Upload photo, select size/frame, choose palette, pay via Stripe
3. **Project Page** - View proof, adjust palette, approve or request revision
4. **Delivery** - Artwork printed and shipped via Prodigi (UK)

### Admin Features
- View all projects with status filters
- Upload artwork layers (background, ground, shading, highlight)
- Change project status
- Trigger emails manually
- View Stripe and Prodigi order IDs

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (admin only)
- **Payments**: Stripe Checkout
- **Print Fulfillment**: Prodigi API
- **Email**: Resend
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Supabase project
- Stripe account
- Prodigi account (optional for development)
- Resend account (optional for development)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `PRODIGI_API_KEY` - Prodigi API key
- `PRODIGI_API_URL` - Prodigi API URL (sandbox or production)
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - From email address
- `NEXT_PUBLIC_APP_URL` - Your app URL

### Database Setup

1. Create a new Supabase project
2. Run the schema SQL in `supabase/schema.sql`
3. Create a storage bucket called `artwork` (public)
4. Configure RLS policies as defined in the schema

### Installation

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

### Stripe Webhook Setup

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production, configure the webhook endpoint in Stripe Dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

### Prodigi Webhook Setup

Configure webhook in Prodigi Dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/prodigi`
- Events: Order status updates

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── create/page.tsx       # Create artwork flow
│   ├── project/[id]/page.tsx # Customer project view
│   ├── admin/                # Admin dashboard
│   └── api/                  # API routes
├── components/
│   ├── artwork/              # Canvas renderer, palette picker
│   ├── home/                 # Homepage sections
│   ├── create/               # Create page components
│   ├── project/              # Project view components
│   ├── admin/                # Admin components
│   ├── layout/               # Header, footer
│   └── ui/                   # Base UI components
├── lib/
│   ├── stripe.ts             # Stripe utilities
│   ├── prodigi.ts            # Prodigi API
│   ├── email.ts              # Email templates
│   └── supabase-admin.ts     # Admin Supabase client
├── types/                    # TypeScript types
└── constants/                # Pricing, palettes
```

## Artwork System

### Artist Workflow
1. Create artwork in Procreate on iPad
2. Export exactly 4 layers as transparent PNGs:
   - `layer_1.png` (background)
   - `layer_2.png` (ground)
   - `layer_3.png` (shading)
   - `layer_4.png` (highlight)
3. Optional: `paper_texture.png`

### Rendering
- Client-side canvas rendering
- Each layer is color-multiplied with palette colors
- Layers composited in order
- Palette switching is instant (<50ms)

## Pricing

| Size | Print Only | + Black/White Frame | + Natural Wood Frame |
|------|-----------|---------------------|---------------------|
| A4   | £45       | £80                 | £85                 |
| A3   | £65       | £100                | £105                |
| A2   | £85       | £120                | £125                |
| A1   | £120      | £155                | £160                |

## Project Statuses

1. **Paid – In Progress** - Order placed, awaiting artwork
2. **Proof Ready** - Artwork uploaded, customer can review
3. **Revision Requested** - Customer requested changes (one allowed)
4. **Approved** - Customer approved, ready for print
5. **Sent to Print** - Order placed with Prodigi
6. **Shipped** - Order shipped to customer

## License

MIT

## Author

Built with love for Holly's custom artwork business.
