# Order Tracking

A mobile-first order tracking screen for an e-commerce app, built with React + TypeScript. The same order
(#ORD-48213) is shown in every delivery state, so you can see how one layout adapts to each situation.

The demo is localised for Bangladesh: prices in taka (৳, BDT, with lakh grouping), times in Asia/Dhaka, a Dhaka
delivery address and a Chattogram → Dhaka courier route.

No backend is needed: a mock API with simulated latency, failures and in-memory writes stands in for the real
services.

## Quick start

```bash
npm install          # .npmrc sets legacy-peer-deps for the test tooling
npm run dev          # http://localhost:5173
npm test             # unit + integration tests (Vitest, Testing Library)
npm run typecheck
npm run build        # production build + pre-rendered pages, sitemap.xml, robots.txt → dist/
npm run preview      # serve dist/ with the same clean URLs as GitHub Pages
npm run build:single # one self-contained index.html (hash URLs) → dist-single/
```

## Scenarios

The start screen lists every state. Each one opens `/track/:scenarioId` (`/#/track/:scenarioId` in the single-file build).

| Scenario           | What it shows                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- |
| `out-for-delivery` | Happy path, used as the baseline layout                                            |
| `slow-network`     | Skeleton that matches the real layout, shown for about 3 seconds                   |
| `network-error`    | First request fails (NET-504); **Try again** recovers it                           |
| `no-active-orders` | Empty state with **Continue shopping**                                             |
| `delayed`          | Coral delay hero, original date struck through, stalled step, refund / cancel flow |
| `delayed-no-eta`   | Same as `delayed`, but "New estimate pending"                                      |
| `delivered`        | Proof of delivery → "Didn't receive it?" → guided checks → case opened             |
| `awaiting-carrier` | Order confirmed, carrier hasn't picked it up yet, "Notify me when it ships"        |

What persists: actions such as reporting a missing package, requesting a refund or toggling notifications are
stored in the mock API for the session. **Reset demo data** on the start screen clears them.

## Project structure

```
src/
  api/trackingApi.ts          Mock client: latency, abort, failures, writes to an in-memory store
  data/                       Fixtures (mockOrders.ts), scenarios (scenarios.ts), policies (credit, hotline)
  types/                      Domain types (Order, Tracking, …) and the semantic Tone type
  lib/format.ts               Date/time (Asia/Dhaka) and money (BDT ৳) formatting
  hooks/                      useOrderTracking (load / retry / replace), useCopyToClipboard
  styles/                     Design tokens (tokens.css) and global styles
  seo/                        Page titles and descriptions (meta.ts), head tags (headTags.ts), useDocumentMeta
  entry-server.tsx            Renders a route to HTML at build time (used by scripts/prerender.mjs)
  components/
    layout/Screen.tsx         Top bar, scrolling content, sticky action bar
    icons/Icon.tsx            House icon set (24px grid, 1.75 stroke)
    ui/                       Button, Card, IconBadge, Pill, Sheet, Toast, Skeleton, SwitchRow
  features/
    tracking/
      model.ts                Pure view-model builders: buildHeroModel, buildTimeline
      TrackOrderPage.tsx      Route: loading / error / empty / ready
      OrderTrackingView.tsx   The single layout used for every loaded state
      components/             StatusHero, DeliveryTimeline, CarrierInfo, OrderSummary, …
      sheets/                 MissingPackageSheet, RefundSheet, CaseDetailsSheet
      states/                 Skeleton, error card, empty state
    support/                  SupportProvider, SupportSheet (menu / chat / call), HelpCard
    scenarios/                Demo start screen
```

### Key decisions

- **Status rules live in one pure module.** `features/tracking/model.ts` turns an `Order` into exactly what the hero
  and the timeline render. Components stay presentational, and the rules are unit-tested.
- **One layout, many states.** `OrderTrackingView` always renders the same blocks in the same order. Only three
  things change: the hero treatment, the contextual card under the hero, and the sticky actions.
- **Support is global.** `SupportProvider` wraps each screen, so the top-bar headset, the help card and the case
  sheet can all open the same support sheet. That includes the loading, error and empty states.
- **Server time comes from the API.** "Today" and relative copy use the time the API returns, not the device
  clock, so every demo scenario always tells the same story.
- **Semantic tones inside a red palette.** Rose means in progress, coral-orange means delay, deep red is used only
  for real errors, and green is kept for "Delivered". `data-tone` drives the CSS variables. Status is never shown by colour alone: there's always an
  icon and text too.
- **Real URLs, pre-rendered.** `BrowserRouter` in the browser, `StaticRouter` at build time. Every page ships as
  HTML and hydrates on load, so search engines and link previews see content without running JavaScript.

## SEO

- `npm run build` pre-renders `/` and every `/track/:scenarioId` page (`scripts/prerender.mjs`). Each page gets its
  own title, description, canonical URL, Open Graph and Twitter tags, from `src/seo/meta.ts`.
- `useDocumentMeta` keeps those tags in sync on client-side navigation.
- The build also writes `sitemap.xml`, `robots.txt` and a `noindex` `404.html`.
- `index.html` has WebApplication JSON-LD, favicons, a web manifest and a 1200×630 social image (`public/og-image.png`).
- Fonts are self-hosted (`@fontsource-variable`), and the body font is preloaded.
- **Site URL:** canonical URLs, the sitemap and the social image URLs come from `VITE_SITE_URL`. The deploy
  workflow sets it; locally it is `http://localhost:4173`. For a custom domain, set it in `.env`.
- `src/seo/__tests__/prerender.test.tsx` checks that every page hydrates without a mismatch and that titles and
  descriptions are unique and a sensible length.

## Deployment

Live at **https://dilrubakter.github.io/Order_Tracking_Screen/**. Every push to `main` runs
`.github/workflows/deploy.yml`, which tests, builds with the repo sub-path as `BASE_PATH`, and publishes `dist/` to
GitHub Pages. GitHub Pages serves `dist/track/delayed.html` at `/track/delayed`.

## Accessibility

- Tap targets are at least 44px, and colour pairs meet WCAG AA contrast.
- Everything uses real `<button>`, `<a>`, `<input>` and `<label>` elements.
- Sheets are modal dialogs. They trap focus, close on Escape, and return focus when they close.
- Loading, toasts, the "Copied" confirmation and the chat log are announced through live regions.
- The current timeline step has `aria-current="step"`. Completed and upcoming steps get hidden text for screen
  readers.
- `prefers-reduced-motion` turns off the pulse, skeleton and slide animations.
- The layout works from 360px to 430px wide, and is centred in a phone-width column on larger screens.

## Stack

React 19 · TypeScript · Vite · React Router · CSS Modules · Vitest + Testing Library.
Icons: a house set drawn for this app (`src/components/icons/Icon.tsx`) — no third-party icon library.
Fonts: Fraunces (display) and Plus Jakarta Sans (text) self-hosted via Fontsource (variable fonts), with serif and system sans-serif fallbacks.
Palette: all-red rosewood — blush ground, raspberry brand. Status tones stay distinct inside the red family
(rose = in progress, coral-orange = delay, deep red = error), with green kept only for "Delivered"; every status also
carries its own icon and label.
