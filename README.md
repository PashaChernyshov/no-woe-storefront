# NO WOE Storefront

Modern fashion storefront for the `NO WOE` brand, built with `Next.js 16`, `React 19`, and `TypeScript`.

This project is a ready-to-adapt ecommerce frontend for a clothing brand or capsule drop. It includes a product catalog, product detail pages, favorites, cart flow, and informational pages for delivery, payment, FAQ, contacts, and brand context.

## Highlights

- responsive storefront built with the Next.js App Router
- searchable catalog with filters and sorting
- dynamic product pages at `/catalog/[slug]`
- favorites and cart stored on the client
- product gallery with color switching
- static product source for quick content management
- supporting brand pages: delivery, payment, FAQ, contacts, about

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Project Structure

```text
src/
  app/                     routes and page-level composition
  components/              storefront UI components
  data/products.ts         catalog data and filter definitions
  lib/products.ts          catalog helpers, filtering and formatting
  providers/ShopProvider.tsx
                           cart and favorites state
public/products/           product images and brand assets
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Content Updates

To update the catalog:

1. Edit or add product entries in `src/data/products.ts`.
2. Add product images to `public/products`.
3. Keep each `slug` unique because it is used in the product URL.
4. Verify the product card and the product detail page locally.

## Deployment

This storefront can be deployed to platforms such as:

- Vercel
- Railway
- any Node.js hosting with Next.js support

## Use Cases

- fashion brand landing storefront
- capsule collection launch
- visual ecommerce prototype
- frontend base for a custom headless commerce setup

## Status

Active product frontend. The current version focuses on the storefront experience and local client-side shopping flow.
