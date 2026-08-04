# CLAUDE.md

This file describes the current SUP Space Maeklong codebase and the constraints to preserve when changing it.

## Commands

```bash
npm run dev          # Next.js development server on port 3000
npm run build        # prisma db push, then next build; requires reachable PostgreSQL
npx next build       # validate/build without changing the database schema
npx tsc --noEmit     # TypeScript validation only
npm run lint         # currently launches the interactive Next.js ESLint setup
```

There is no automated test suite. The current production build target is Next.js 15. `npm run lint` is not CI-ready until an ESLint configuration is added.

## Environment variables

See `.env.example` for native/local use and `.env.docker.example` for Docker.

| Variable | Required | Purpose |
|---|---:|---|
| `PRISMA_DATABASE_URL` | yes | PostgreSQL connection string used by Prisma CLI and runtime |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login` |
| `SESSION_SECRET` | recommended | HMAC-SHA256 admin-session signing key; falls back to `ADMIN_PASSWORD` |
| `GOOGLE_PLACES_API_KEY` | no | Google Places reviews and rating |
| `GOOGLE_PLACE_ID` | no | Business Place ID |
| `RESEND_API_KEY` | no | Sends booking-received email through Resend |
| `RESEND_FROM_EMAIL` | no | Verified sender; defaults to `booking@supspacemaeklong.com` |
| `BOOKING_API_KEY` | no | Bearer key for `POST /api/booking`; endpoint returns 503 when unset |

Telegram bot token, chat ID, and webhook secret live in the `Setting` table and are managed from Admin Settings.

The customer chat widget calls the separate public service at `https://bot.supspacemaeklong.com`; its URL is currently a constant in `app/_components/ChatWidget.tsx`.

The GoGreen registrant source is a public Google Sheet whose ID and column mapping are constants in `app/gogreen/lib/sheet.ts`.

## Architecture

### Stack and data layer

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma 7, `@prisma/adapter-pg`, and PostgreSQL.

`app/lib/prisma.ts` creates a raw `pg` pool and a singleton Prisma client cached on `globalThis`. `prisma.config.ts` supplies `PRISMA_DATABASE_URL` to Prisma CLI commands.

Current Prisma models:

- Core: `Setting`, `User`, `Booking`, `SpecialTrip`
- Membership: `Member`, `MemberPackage`, `VisitLog`
- Content/routes: `GalleryPhoto`, `PaddleRoute`, `RoutePhoto`
- Campaign/event: `DanceChallengeEntry`, `GoGreenRegistration`

Routes are database-driven. `app/_components/trips-data.ts` still contains time slots, categories, formatting helpers, and legacy fallback route data; keep it free of browser-only APIs because server code imports it.

### Authentication

`app/lib/auth.ts` implements password-based admin sessions using an HMAC-SHA256 signed `admin_auth` cookie. `middleware.ts` protects `/admin/*` except `/admin/login`. Admin server actions and admin API handlers call `assertAdmin()` or `isAdminRequest()`.

`POST /api/booking` does not use the admin cookie. It uses `Authorization: Bearer <BOOKING_API_KEY>`.

The `/gogreen/*` pages and their server actions are currently public and are not covered by admin middleware.

### Internationalization

The customer site is Thai/English. `app/_components/lang-context.tsx` provides `"th" | "en"`; typed strings are in `app/_components/translations.ts`. There is no external i18n library.

### Public pages

- `/` — landing page: campaign bar/ribbon, hero, services, booking, upcoming trips, gallery, reviews, about, footer
- `/routes` — DB-backed route catalogue
- `/gallery` — category filtering and lightbox
- `/dance-challenge` and `/dance-challenge/rules` — bilingual campaign page, countdown, rules, and clip submission
- `/gogreen`, `/gogreen/list`, `/gogreen/register`, `/gogreen/report`, `/gogreen/trash` — event check-in/reporting tools
- `/privacy` and `/data-deletion` — privacy disclosures

`app/layout.tsx` mounts the global customer ChatWidget on all non-admin routes.

### Booking

The browser form calls `createBooking()` in `app/actions/booking.ts`. The authenticated chatbot API calls `POST /api/booking`. Both delegate writes to `createBookingRecord()` in `app/lib/booking-core.ts`.

The shared writer currently enforces:

1. the target trip is not in the `closedTripKeys` setting (Admin can make an existing trip private);
2. no non-cancelled duplicate with the same stored phone, ISO date, and time;
3. the date/hour is not in the `closedSlots` setting;
4. regular trips do not overlap another route's occupied hours; joining the same route and start time is allowed.

Admin Bookings groups regular trips by date + time + route and special trips by special-trip ID. “ปิดรับจอง” stores a stable trip key in `Setting.closedTripKeys`; the public upcoming-trip payload returns `closed: true`, displays the trip as full, disables joining, and the shared writer rejects stale/direct requests. Admin can reopen the same trip.

Special trips bypass overlap guard 3. Capacity is displayed using `maxBoards`, but the shared writer does not currently reject bookings that exceed regular or special-trip capacity.

After a booking is written, Telegram and Resend notifications run best-effort. Uploads are stored under `public/uploads/`; Docker mounts that directory as a persistent volume and `/api/uploads/[...path]` serves uploaded images.

### Dance Challenge campaign

Campaign constants, deadline, quota, LINE link, and song URL are in `app/_components/campaign-config.ts`. Submissions are stored in `DanceChallengeEntry`; the first entry for a unique phone can decrement the campaign quota and create a complimentary one-visit membership package. Admin can view entries and manually adjust campaign counters.

The campaign deadline is currently `2026-08-15T23:59:00+07:00`. The quota counter update is read-then-upsert rather than atomic, and submission/quota/member creation are not one database transaction.

### GoGreen

`app/gogreen/lib/sheet.ts` fetches a public Google Sheet as CSV with `cache: "no-store"`. The sheet is read-only. Local check-in state, walk-ins, boat numbers, and trash weights are stored in `GoGreenRegistration`. Kayak 1-seat numbers start at 101 and 2-seat numbers at 201.

GoGreen data and mutation server actions are in `app/actions/gogreen.ts`. They are currently public and contain participant names and phone numbers; treat access-control changes as security-sensitive.

### Telegram and membership

- Booking and Dance Challenge notifications use `app/lib/telegram-notify.ts`.
- `app/api/telegram/route.ts` is the membership webhook. The owner searches by phone and records visits using inline keyboard callbacks.
- Count packages consume visits; monthly packages begin on first use and expire after one month.

### Admin panel

Pages under `app/admin/(panel)/` manage bookings, routes/photos, gallery, members/packages/visits, special trips, Dance Challenge entries, campaign counters, capacity, closed slots, and Telegram configuration.

## Public and admin APIs

The API contract is documented in `manual_api.md`; `public.md` is the shorter chatbot/integration reference. Important routes are:

- Public reads: `/api/routes`, `/api/upcoming-trips`, `/api/availability`, `/api/uploads/[...path]`
- Bearer-authenticated write: `POST /api/booking`
- Admin: `/api/admin/auth`, `/api/admin/gallery`, `/api/admin/gallery/[id]`, `/api/admin/route-photo`, `/api/admin/trip-photo`, `/api/debug-places`
- Telegram webhook: `/api/telegram`

## Deployment

See `DEPLOY.md`.

- Docker + Traefik: image build runs `npx next build`; `docker-entrypoint.sh` runs `prisma db push` at container start.
- Native PM2 + Nginx: `npm run build` syncs the schema and builds before PM2 restart.

Persist and back up both PostgreSQL and `public/uploads`. Database schema changes are applied with `prisma db push`; this repository does not currently use committed Prisma migrations.
