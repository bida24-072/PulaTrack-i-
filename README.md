# PulaTrack 🇧🇼

A mobile-first personal finance tracker for Botswana — track income, expenses,
budgets, and savings goals in Pula (P). Built with Vite + React 18 + Tailwind
CSS + Firebase (Auth + Firestore) + Recharts.

## Features

- Email/password and Google sign-in (Firebase Auth)
- Optional 4-digit App Lock PIN (+ WebAuthn biometric unlock)
- 15-minute inactivity auto-logout, 5-minute idle re-lock
- Dashboard with monthly totals, 6-month income vs expense bar chart, and
  expense-by-category pie chart
- Add / edit / delete transactions, search, filter by month, CSV export
- Per-category monthly budgets with progress bars and 80%+ alerts
- Savings goals with progress bars and "add money" flow
- Terms & Conditions / Privacy Policy pages (Botswana-oriented placeholder text)
- Dummy data auto-generated on first signup so the app isn't empty on first look

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and
   create a new project.
2. Add a **Web App** to the project (</> icon) and copy the config object.
3. Enable **Authentication** → Sign-in method → turn on **Email/Password**
   and **Google**.
4. Enable **Firestore Database** → Create database (start in production
   mode, then apply the rules below).
5. Copy `.env.example` to `.env` and fill in your Firebase config values:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Alternatively, edit `src/firebase.js` directly and replace the
   `// TODO: Replace with your Firebase config` placeholders.

6. Deploy the included Firestore security rules (`firestore.rules`) via the
   Firebase Console → Firestore → Rules tab, or with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules
   ```

## 3. Run locally

```bash
npm run dev
```

Visit the printed local URL (default `http://localhost:5173`). Sign up with
a new account — PulaTrack will automatically seed 6 months of demo
transactions, budgets, and savings goals so you can see the app populated
immediately.

## 4. Build for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

## 5. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com/), click **New Project** → import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output
   directory: `dist`.
4. Add the same environment variables from your `.env` file under
   **Project Settings → Environment Variables**.
5. Deploy. Vercel will give you a live URL.

## Firestore data structure

```
users/{userId}
  name, email, photoURL, phone, country,
  twoFAEnabled, acceptedTOS, acceptedTOSDate, createdAt

users/{userId}/transactions/{transactionId}
  type, amount, category, date, note, createdAt

users/{userId}/budgets/{budgetId}
  category, amount, month, year, monthKey

users/{userId}/goals/{goalId}
  title, targetAmount, currentAmount, deadline, icon, createdAt
```

## PWA (installable app)

PulaTrack is now a installable Progressive Web App:

- `public/manifest.webmanifest` — app name, theme colors, and a full icon
  set generated from your uploaded logo (`public/icons/icon-*.png`,
  including a `-maskable` variant with safe-zone padding for Android's
  adaptive icon mask).
- `public/sw.js` — a minimal service worker that caches the app shell for
  fast reloads and basic offline support. It deliberately never caches
  Firebase/Firestore requests, so your data is always live.
- `src/registerSW.js` — registers the service worker on load.
- `index.html` — has the manifest link, apple-touch-icon, and the
  standard Android/iOS "add to home screen" meta tags.

Once deployed to Vercel (PWAs require HTTPS, which Vercel gives you by
default), Android Chrome will offer an automatic "Install app" prompt, and
iOS users can add it via Safari → Share → Add to Home Screen.

## Android & Apple app store guidelines — where this stands

**As a PWA (what's built now):** meets the bar for browser installability
(manifest + icons + service worker + HTTPS). This is *not* the same as
being accepted into the Google Play Store or Apple App Store — those are
separate submission processes with their own review requirements:

- **Google Play**: A PWA can be published via **Trusted Web Activity (TWA)**
  using [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or
  [PWABuilder](https://www.pwabuilder.com/), which wraps this exact web app
  in a thin native shell — no rewrite needed. Play additionally requires,
  for finance apps specifically: a completed Data Safety form, a privacy
  policy URL (you have the page, it just needs review + a public URL), and
  in-app account deletion (not yet built — see below).
- **Apple App Store**: Apple does not support TWA-style wrapping the same
  way; you'd use **Capacitor** to wrap this React app in a native iOS
  shell, or submit as a true PWA (Apple does allow "add to home screen"
  web apps, but won't list them in the App Store). If you do submit
  natively via Capacitor, Apple's guideline 4.2 ("don't just wrap a
  website") means you'd want the app to feel sufficiently native, Sign in
  with Apple would need to be added alongside Google sign-in (guideline
  4.8), and you'd need the App Privacy "nutrition label" filled in
  accurately.
- **Still missing for either store**: ~~an in-app account deletion flow~~
  **Done** — see `src/pages/Security.jsx` "Danger Zone" section and
  `src/lib/deleteUserData.js`. It reauthenticates the user (password
  re-entry or a fresh Google popup), wipes all Firestore data, deletes the
  Firebase Auth account, and clears local PIN/session state.

## Notes & things to finish before going to production

- **2-Step Verification (TOTP)**: The Security page includes a toggle that
  saves `twoFAEnabled` on the user's profile, but full TOTP secret
  generation/verification (QR code, Google Authenticator enrollment) needs a
  backend (e.g. a Firebase Cloud Function) to securely generate and check
  codes — this is stubbed with a note in `src/pages/Security.jsx`.
- **App Lock PIN**: hashed with SHA-256 and stored in `localStorage` purely
  to avoid storing it in plain text on-device. This is a UX convenience
  lock, not a substitute for Firebase Auth security.
- **Biometric unlock**: uses the WebAuthn `navigator.credentials` API to
  trigger the platform authenticator (Face ID / Touch ID / Windows Hello).
  A production app should register and verify a real credential
  server-side rather than just checking that the prompt succeeded.
- **Terms & Privacy pages** contain placeholder legal text — have them
  reviewed by a lawyer licensed in Botswana, referencing the Data
  Protection Act, 2018, before public launch.
- No logo file was attached to the original request, so a simple "P" badge
  (`public/pula-icon.svg`) is used as a placeholder logo/favicon — swap in
  your real logo whenever you have one.

## Tech stack

- Vite + React 18
- Tailwind CSS (custom PulaTrack teal `#0D4C5C` / gold `#D4AF37` theme)
- Lightweight shadcn/ui-style components (Button, Card, Input, Select,
  Dialog, Progress, Sheet, Avatar, Switch, Label) — no extra Radix
  dependency required
- react-router-dom v6
- Firebase v9 modular SDK (Auth + Firestore)
- Recharts (bar + pie charts)
- lucide-react (icons)
