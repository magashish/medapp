# MedSathi

A medicine reminder app for Indian families: an Expo (React Native) app backed by a
Laravel API, so a family member's medicine schedule and adherence history are shared
in real time between everyone caring for them — not stuck on one phone.

- Real accounts. Create a family member profile (e.g. Amma, Papa) and invite other
  people by email as caregivers — they see the same medicines, schedule, and history.
  Inviting someone who doesn't have an account yet auto-links them the moment they sign up.
- Add medicines with strength, instructions, quantity remaining, and multiple reminder
  times/days.
- Local notifications fire on-device with **Taken** / **Skip** actions right on the
  notification, so reminders still work offline. Server-side, a scheduled job also
  pushes every caregiver a notification if a dose goes unlogged past a grace window —
  so family elsewhere knows even if the primary phone's local reminder was missed.
- Today's doses, 30-day adherence %, low-stock/refill warnings (computed server-side,
  adherence and "missed" status use each family member's own timezone).
- Share an adherence report via the native share sheet (WhatsApp/SMS/etc.).
- English and Hindi, switchable from Settings.

## Architecture

- `/` — the Expo app (this is the root of the repo)
- `backend/` — the Laravel API (accounts, family/caregiver sharing, medicines,
  schedules, dose logs, missed-dose push notifications)

The app talks to the API over HTTP; nothing is stored locally except the auth token,
the active family member selection, and a lightweight map of scheduled local
notification IDs (so they can be cancelled/rescheduled on edit).

## Running it

**Backend** (needs PHP 8.2+ and Composer):

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

This runs on `http://localhost:8000` with a zero-config SQLite database
(`backend/database/database.sqlite`, gitignored). Run `php artisan test` to run the
feature test suite (26 tests covering auth, ownership/authorization boundaries, invite
auto-accept, dose logging, and the missed-dose job).

For missed-dose push notifications to actually fire, something needs to run
`php artisan schedule:run` every minute (a cron entry in production; `php artisan
schedule:work` for a simple local dev loop).

**App:**

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (Android/iOS) to run it on your phone.
By default the app points at `http://localhost:8000/api`, which only works from a
simulator on the same machine as the backend. To use it from Expo Go on a physical
phone, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (or a hosted URL) before
starting, e.g.:

```bash
EXPO_PUBLIC_API_URL="http://192.168.1.20:8000/api" npx expo start
```

`npm run web` also works for a quick browser preview.

Push notifications to caregivers' devices require an EAS project linked for
`expo-notifications` to mint a push token; without one, the app still works — it just
skips registering that device for server-sent pushes, and local reminders are
unaffected.

## Project structure (app)

- `app/` — screens, using Expo Router (file-based navigation)
- `src/api/` — the HTTP client (auth token storage, fetch wrapper)
- `src/db/` — typed API-backed data access (`queries.ts`) and shared types
- `src/lib/` — dates, local notification scheduling, low-stock helpers
- `src/i18n/` — English/Hindi dictionary + language context
- `src/state/` — auth context and active family-member profile context
- `src/components/`, `src/theme.ts` — shared UI kit and design tokens

## Project structure (backend)

- `app/Models/` — `User`, `FamilyMember`, `Medicine`, `Schedule`, `DoseLog`,
  `FamilyMemberInvite`, `DeviceToken`
- `app/Http/Controllers/Api/` — REST controllers (auth, family members, invites,
  medicines, doses, device tokens)
- `app/Policies/` — authorization (only users linked to a family member can see or
  edit it; only the owner can delete it or manage caregivers)
- `app/Services/DoseScheduleService.php` — computes "today's doses" per family
  member's timezone
- `app/Console/Commands/CheckMissedDoses.php` — the scheduled missed-dose push job
- `tests/Feature/` — the test suite
