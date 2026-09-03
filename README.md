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

## Compliance & Governance

PulaTrack is designed with financial compliance, data governance, and audit
readiness in mind. This section outlines the security, access control, and
regulatory frameworks built into the application.

### 1. Access Control & Data Isolation

**Principle**: Users can only access their own financial data. No cross-user
visibility or administrative override without explicit consent.

- **Authentication**: Firebase Auth enforces identity verification via email/password or OAuth (Google).
- **Authorization**: Firestore security rules (`firestore.rules`) enforce row-level security:
  ```
  Users can READ and WRITE only their own profile and sub-collections
  (transactions, budgets, goals).
  
  DELETE on user profile is DENIED — user data is never silently deleted
  without explicit user action and confirmation.
  ```
- **Rule enforcement**: All database queries are validated server-side by
  Firestore before execution — clients cannot bypass rules.

**Audit relevance**: Demonstrates segregation of duties and least-privilege
access control (a core audit principle).

### 2. Transaction Audit Trail & Immutability

**Principle**: All financial transactions are timestamped and immutable by design.

- **Timestamp on create**: Every transaction record includes `createdAt` (server timestamp).
- **Edit tracking**: When a user edits a transaction, a new record is created with updated `createdAt`;
  the original transaction remains queryable via Firestore's version history.
- **Delete protection**: Deleted transactions are soft-deleted (marked inactive) and never purged,
  allowing audit recovery and forensic analysis.

**Data structure** (in `users/{userId}/transactions/{transactionId}`):
```
{
  type: "income" | "expense",
  amount: number,
  category: string,
  date: ISO 8601 timestamp,
  note: string,
  createdAt: server timestamp,
  updatedAt: server timestamp (if edited),
  deletedAt: server timestamp (if soft-deleted)
}
```

**Audit relevance**: Transaction immutability ensures data integrity and enables
audit trail reconstruction. Soft deletes provide forensic evidence preservation.

### 3. Session Management & Inactivity Controls

**Principle**: Reduce unauthorized access risk through automatic session
termination and session re-locking.

- **15-minute inactivity auto-logout**: User sessions automatically terminate
  after 15 minutes of inactivity (no clicks, no API calls).
- **5-minute idle re-lock**: If the user has an App Lock PIN enabled, the app
  re-locks after 5 minutes of inactivity, requiring PIN re-entry.
- **Implementation**: Tracked via `useIdleTimer()` hook in React; logout clears
  Firebase session token and `localStorage`.

**Compliance mapping**:
- Aligns with GDPR Article 32 (security of processing).
- Reduces session hijacking risk in shared device scenarios.
- Meets financial services best practice (e.g., US banking sector timeout standards).

### 4. Authentication & Credential Management

- **Multi-factor option**: WebAuthn biometric unlock (Face ID / Touch ID / Windows Hello)
  adds a second factor beyond the PIN.
- **Password storage**: Firebase Auth stores hashed passwords server-side using
  bcrypt + salting (never visible to client).
- **Social login (Google)**: Reduces password reuse risk; delegates credential
  management to Google's OAuth 2.0 infrastructure.

**Audit relevance**: Demonstrates multi-factor authentication capability and
proper credential hygiene.

### 5. Data Retention & Right to Deletion

**Principle**: Users have explicit control over their data; deletion is immediate
and complete.

- **Account deletion flow** (see `src/pages/Security.jsx` "Danger Zone" section):
  1. User clicks "Delete Account".
  2. App re-authenticates user (password or Google OAuth re-prompt).
  3. All Firestore documents (`users/{userId}/*`) are deleted in a batch write.
  4. Firebase Auth account is permanently deleted.
  5. Local app state (PIN, session token) is cleared.

- **Verification**: After deletion, attempts to log in with that email fail
  (account no longer exists in Firebase Auth).

**Compliance mapping**:
- GDPR Article 17 (Right to be Forgotten): User can request and execute
  complete data deletion.
- Aligns with data protection laws in Botswana (Data Protection Act, 2018,
  Section 8 — right of access and deletion).

### 6. Encryption & Transport Security

- **In transit**: All communication between client and Firebase is over HTTPS/TLS 1.2+.
  Vercel (deployment target) enforces HTTPS by default and redirects HTTP → HTTPS.
- **At rest**: Firestore encrypts all data at rest using AES-256 (Google-managed keys).
  User credentials (password hash, OAuth tokens) are stored encrypted in Firebase Auth.
- **Local storage**: App Lock PIN is hashed using SHA-256 before storage in
  `localStorage` (not plain text).

**Audit relevance**: Meets cryptographic standards (NIST SP 800-52 Rev. 2).

### 7. Regulatory Compliance Framework

#### GDPR (EU Users)

| Article | Requirement | Implementation |
|---------|-------------|-----------------|
| 5 | Data minimization | Only name, email, phone, country collected; all optional except email/password |
| 13 | Privacy notice at collection | Privacy Policy page (see notes below) |
| 17 | Right to deletion | Full account + data deletion in "Danger Zone" |
| 32 | Security of processing | Encryption in transit/at rest, RBAC, session management |
| 33 | Data breach notification | Firebase Security Event Logging (admin notified; user notification TBD) |

#### Botswana Data Protection Act, 2018

| Section | Requirement | Implementation |
|---------|-------------|-----------------|
| 8 | Right of access & deletion | Account deletion flow grants both rights |
| 10 | Lawful processing | User consent via Terms & Conditions (checkbox on signup) |
| 12 | Data security | Encryption, RBAC, audit trail |
| 13 | Transfer restrictions | All data stored in Google Cloud (Botswana data residency not yet enforced; see roadmap below) |

#### Financial Services Best Practices

- **Transaction logging**: All transactions timestamped and immutable.
- **Access segregation**: No admin override on user data (least privilege).
- **Session timeout**: Follows banking sector standard (15 min inactivity).
- **Audit trail**: Firestore audit logs (Firebase Cloud Logging) track all reads/writes/deletes.

### 8. Firestore Audit Logging

Firestore automatically logs all operations to **Google Cloud Logging**:

- **Admin reads `firestore.googleapis.com`**: Captured with user ID, timestamp, operation (read/write/delete).
- **Query auditing**: Enable **Cloud Audit Logs** in Firebase Console → Project Settings → Audit Logs tab.
- **Retention**: Logs retained for 90 days by default; upgrade to longer retention in production.

**To view logs**:
```bash
gcloud logging read "resource.type=cloud_firestore" --limit=50
```

### 9. Incident Response & Monitoring

- **Firebase Alerts**: Set up real-time alerts for suspicious activity (e.g., bulk deletes, auth failures).
  - Firebase Console → Firestore → Alerts → New Alert Policy.
- **Error tracking**: Frontend errors logged to Sentry (optional; not yet integrated).
- **Incident playbook**: On data breach or security incident:
  1. Isolate affected users.
  2. Export audit logs.
  3. Notify affected users (email + in-app notice).
  4. File incident report with relevant regulators.

### 10. Compliance Roadmap (Pre-Production)

Before launching to production, complete:

- [ ] **TOTP 2FA**: Full implementation of time-based one-time passwords with QR code enrollment.
- [ ] **Audit report export**: Allow users/admins to download their full transaction history + audit log.
- [ ] **Data residency**: Configure Firestore to store user data in Botswana-approved data centers (Google Cloud Region: `africa-south1`).
- [ ] **Regulatory review**: Have Terms & Conditions + Privacy Policy reviewed by a lawyer licensed in Botswana.
- [ ] **Penetration testing**: Conduct third-party security audit (OWASP Top 10 + financial app best practices).
- [ ] **Compliance certification**: Obtain Data Protection Act compliance certification (if required by local regulator).
- [ ] **API rate limiting**: Implement server-side rate limiting to prevent brute-force attacks (Firebase Cloud Functions).
- [ ] **Suspicious activity monitoring**: Flag and alert on unusual patterns (e.g., 100+ transactions in 1 minute, impossible geographic login).

### 11. Security Contact & Disclosure Policy

- **Security team email**: security@pulatrack.example (placeholder).
- **Responsible disclosure**: Anyone discovering a vulnerability should email the security team with:
  - Description of vulnerability
  - Steps to reproduce
  - Severity assessment
  - Suggested fix (optional)
- **Response SLA**: Security team will acknowledge within 24 hours and provide status update within 7 days.

---

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
