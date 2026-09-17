# web

Next.js App Router package for Smart Pantry. This is the product app: dashboard, client state, and i18n.

The app is a client-side pantry tracker (no API). Inventory and locale are persisted in `localStorage` via Zustand.

## Layout

- `app/` — routes (RSC by default) and client islands under `app/components/`
- `store/` — Zustand stores (`usePantryStore`, `useLocaleStore`)
- `i18n/` — `en-US` / `pt-BR` dictionaries and `useTranslation`
- `lib/` — domain helpers (expiry status, inventory filters)

Shared UI is imported from [`@smart-pantry/ui`](../ui).

## Scripts

Prefer root commands (`npm run dev`, `npm test`, `npm run typecheck`). From this package:

```bash
npm run dev        # next dev
npm run build      # next build
npm run start      # next start
npm run lint       # eslint
npm test           # jest
npm run typecheck  # tsc --noEmit
```

See the [repository README](../../README.md) for setup and product overview.
