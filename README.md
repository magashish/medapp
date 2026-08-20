# MedSathi

A medicine reminder app for Indian families, built with Expo (React Native).

- Add family members as local profiles (e.g. Amma, Papa, yourself) — one phone can manage everyone's medicines.
- Add medicines with strength, instructions, quantity remaining, and multiple reminder times/days.
- Real local notifications fire even without internet, with **Taken** / **Skip** actions right on the notification.
- Today's doses, 30-day adherence %, and low-stock/refill warnings.
- Share an adherence report with family via WhatsApp/SMS/etc. (native share sheet).
- English and Hindi, switchable from Settings.

All data is stored on-device (SQLite via `expo-sqlite`) — no account or backend required.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (Android/iOS) to run it on your phone. Metrics/notifications require a real device or a simulator — Expo Go on your own phone is the easiest way to try it.

`npm run web` also works for a quick preview in a browser (uses an in-memory data store instead of SQLite, since browser SQLite storage isn't set up — native is the real target).

## Project structure

- `app/` — screens, using Expo Router (file-based navigation)
- `src/db/` — SQLite schema + queries (native) and an in-memory fallback (web preview)
- `src/lib/` — dates, notifications scheduling, dose computation, i18n-adjacent helpers
- `src/i18n/` — English/Hindi dictionary + language context
- `src/state/` — active family-member profile context
- `src/components/`, `src/theme.ts` — shared UI kit and design tokens
