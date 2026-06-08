# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js on port 3000)
npm run build        # prisma db push → next build (requires live Postgres)
npm run lint         # next lint
```

There are no tests. `npm run build` is the primary correctness check — it runs `prisma db push` to sync the schema and then builds all routes.

## Environment variables

Required in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `PRISMA_DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | HMAC-SHA256 signing key for session tokens (falls back to `ADMIN_PASSWORD` if unset) |
| `GOOGLE_PLACES_API_KEY` | Google Places API key for fetching reviews |
| `GOOGLE_PLACE_ID` | Google Place ID for the business |

Telegram config (token, chat ID, webhook secret) is stored in the `Setting` DB table, not in `.env`, and is managed via the admin panel.

## Architecture

### Tech stack
Next.js 15 (App Router), React 19, TypeScript, Prisma 7 with `@prisma/adapter-pg` (raw pg driver — not the default Prisma connection), Tailwind CSS.

### Data layer
`app/lib/prisma.ts` — singleton PrismaClient cached on `globalThis` to survive hot-reload. The connection uses `PRISMA_DATABASE_URL`. All server actions and route handlers import from here.

Schema models: `Setting` (key/value config store), `Booking`, `SpecialTrip`, `Member` + `MemberPackage` + `VisitLog` (membership system), `GalleryPhoto`.

### Auth
`app/lib/auth.ts` implements a custom, password-based admin session using HMAC-SHA256 signed cookies (Web Crypto API — works in both Node and Edge runtimes). No OAuth, no NextAuth for admin. The cookie is `admin_auth`; middleware at `middleware.ts` guards all `/admin/*` routes except `/admin/login`.

`assertAdmin()` is called at the top of every admin-only server action and route handler.

### i18n
The site is bilingual (Thai/English). `app/_components/lang-context.tsx` provides a `LangContext` with `"th" | "en"`. All UI strings live in `app/_components/translations.ts` as a typed `T: Record<Lang, Translations>` object — no external i18n library. Components read translations via `const t = T[lang]`.

### Public pages
- `/` — single-page landing with sections: Hero, Services, BookingWidget, UpcomingTrips, Gallery, Reviews, About, Footer. Assembled in `app/_components/HomeClient.tsx`.
- `/routes` — full route catalogue rendered by `app/routes/RoutesClient.tsx`.
- `/gallery` — full gallery page with category filtering and lightbox.

### Booking flow
`app/_components/BookingWidget.tsx` — multi-step booking form (Date → Time → Route → Boards → Contact → Summary). Calls the `createBooking` server action in `app/actions/booking.ts`.

`createBooking` enforces three guards before writing to DB:
1. No duplicate booking (same phone + date + time)
2. Date/hour not in the `closedSlots` setting
3. No time-overlap with existing bookings (uses route `duration` from `trips-data.ts` to block overlapping hours)

Route and time-slot definitions live in `app/_components/trips-data.ts` (also imported by server-side code — keep it free of browser-only APIs).

Special trips (admin-created one-off events) bypass guard 3 and use their own `maxBoards` capacity.

### Telegram integration
Two separate uses:

1. **Booking notifications** — `app/lib/telegram-notify.ts` fires a one-way message to the owner's chat whenever a booking is created. Config is read from the `Setting` table via `app/lib/telegram-config.ts`.

2. **Membership check bot** — `app/api/telegram/route.ts` is a full webhook handler. The owner types a member's phone number; the bot looks up the member and presents inline-keyboard buttons to record a visit against their package.

### Admin panel
All pages under `app/admin/(panel)/`. Server actions in `app/actions/` handle mutations; each asserts admin before touching the DB. Key managers:

- **Bookings** — view/confirm/cancel bookings
- **Gallery** — upload photos (stored in `public/uploads/`), set order/category/big flag; API routes at `app/api/admin/gallery/`
- **Members** — manage membership packages and view visit history
- **Settings** — `maxBoards` capacity, closed slots, Telegram config
- **Special trips** — admin-created one-off trip events

### Google Places
`app/lib/google-places.ts` — fetched at render time with a 6-hour Next.js cache (`next: { revalidate: 21600 }`). Falls back to hardcoded values if env vars are missing.

## Deployment

Two options documented in `DEPLOY.md`:
- **Docker + Traefik** — `Dockerfile` + `docker-compose.yml`; entrypoint runs `prisma db push` then `next start`.
- **Native PM2 + Nginx** — `deploy/setup-vps.sh` for first-time setup; `deploy/update.sh` for updates.

`npm run build` calls `prisma db push` before building, so the DB must be reachable at build time.
