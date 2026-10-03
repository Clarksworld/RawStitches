# Raw Stitches

Next.js App Router + React 19 + Tailwind CSS v4 project.

## Development & Build

- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`

## Project Structure

- `src/app/layout.tsx` - Root layout with brand metadata, Google fonts, StoreProvider, and Toast notifications
- `src/app/globals.css` - Global CSS entrypoint with Tailwind CSS v4 and brand theme tokens
- `src/app/(store)/` - Customer storefront route group with `layout.tsx` (navigation header, announcement bar, footer)
  - `page.tsx` - Homepage with hero, collections, new arrivals, bestsellers, and testimonials
  - `shop/` - Catalog page with real-time filtering, search, sorting
  - `shop/[slug]/` - Dynamic product detail page with SSG pre-rendering (`generateStaticParams`) and rich OpenGraph SEO metadata
  - `cart/` - Shopping bag with fee calculation and state persistence
  - `checkout/` - 3-step checkout flow (Contact, Delivery, Payment)
  - `confirmation/[orderNumber]/` - Post-purchase order confirmation
  - `track/[orderNumber]/` - Real-time order tracker
  - `account/` - Customer profile, order history, addresses, and wishlist
  - `sign-in/`, `create-account/`, `account-access/` - Customer auth flows
  - `about/`, `contact/` - Brand story and contact page
- `src/app/admin/` - Admin backoffice
  - `page.tsx` - Admin login portal
  - `(dashboard)/layout.tsx` - Authenticated admin layout with collapsible sidebar and navigation
  - `(dashboard)/dashboard/` - Analytics charts, sales metrics, recent orders
  - `(dashboard)/products/` - Product management with search, filter, and pagination
  - `(dashboard)/products/new/`, `(dashboard)/products/[id]/edit/` - Add/edit product forms
  - `(dashboard)/inventory/`, `orders/`, `customers/`, `payments/`, `discounts/`, `catalog/`, `reviews/`, `delivery/`, `analytics/`, `content/`, `settings/`
- `src/app/api/` - Next.js Serverless API endpoints
  - `api/health/route.ts` - API status and health check
  - `api/products/route.ts` - Filterable products API endpoint
- `src/views/` - Reusable view screen components
- `src/components/` - Shared UI elements (`ui.tsx`, `ProductCard.tsx`, `AdminLayout.tsx`, `CustomerLayout.tsx`, `router-adapter.tsx`)
- `src/store.tsx` - Global shopping cart, wishlist, and admin auth state management

## Dependencies

- Runtime: Next.js 16+, React 19, React DOM 19
- Styling: Tailwind CSS v4 with `@tailwindcss/postcss` and PostCSS
- Charts: Recharts
- TypeScript: 5.7+
