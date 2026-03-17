# NO WOE Storefront

Modern storefront for the `NO WOE` clothing brand built with `Next.js 16`, `React 19`, and `TypeScript`.

The project includes a product catalog, product detail pages, favorites, cart state, and supporting content pages for delivery, payment, FAQ, and contacts. It is designed as a fast launch-ready fashion storefront with Telegram-based order flow.

## Features

- catalog with search, filters, and sorting
- dynamic product pages at `/catalog/[slug]`
- favorites and cart stored on the client
- responsive UI built with App Router
- reusable product data source in `src/data/products.ts`
- static assets for product visuals in `public/products`

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `ESLint`

## Project Structure

- `src/app` - routes and application layout
- `src/components` - storefront UI components
- `src/data/products.ts` - product catalog and filters
- `src/lib/products.ts` - product helpers
- `src/providers/ShopProvider.tsx` - shared shop state
- `public/products` - product images and graphics

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Available Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Updating the Catalog

1. Edit or add products in `src/data/products.ts`.
2. Add product images to `public/products`.
3. Keep each `slug` unique because it is used in the product URL.
4. Check the catalog page and product page after changes.

## Deployment

The project can be deployed to `Vercel`, `Railway`, or any Node.js hosting environment that supports `Next.js`.
