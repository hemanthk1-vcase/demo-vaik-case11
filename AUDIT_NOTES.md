# VakilCase — India site readiness audit

Repo: `hemanthk1-vcase/demo-vaik-case11` (branch `main`, commit `6f05013`)
Scope: the live marketing + app site served from `src/` (confirmed via `index.html` → `/src/main.jsx`). Build tested with `npm install && npm run build` — **compiles clean**.

## Short answer: not quite — three real gaps, one cosmetic one

### 1. Every "Book a demo" lead gets tagged as United States, even from India
`base44/functions/captureLead/entry.ts` line 32 hardcodes:
```ts
country: 'united_states',
```
regardless of where the visitor actually is. Since this is meant to be presented as the India site, every lead captured through `/demo` will show up in the CRM as a US lead. This should read from the form (or default to `india`) so India demo requests aren't misfiled.

### 2. The demo form's default firm size isn't a valid value
`src/pages/marketing/Demo.jsx` line 48 initializes:
```js
firm_size: "1-9",
```
but the `Lead` entity only accepts `"1" | "2-9" | "10-49" | "50+"`, and the `<select>` options use those same four values — none of them is `"1-9"`. If a visitor submits without touching the dropdown, `captureLead` silently falls back to `"1"` (solo), so the real firm size gets lost. Small fix: change the default to `"1"`.

### 3. Marketing-vs-data mismatch on currency
The account model is genuinely India-first — `Fee.currency` is locked to `INR` only (`base44/entities/Fee.jsonc`), and `Pricing.jsx` defaults the region toggle to `🇮🇳 India`. Good. But `User.jsonc` defaults `country` to `united_states` and `currency` to `USD` while `phone_country_code` defaults to `+91` — three related defaults pointing three different ways. Worth aligning if this is going out as the India-facing build.

### Cosmetic: unused imports
`npm run lint` reports 12 errors, all `no-unused-imports`, in `Mockups.jsx`, `ClientPortal.jsx`, and `marketing/Landing.jsx`. Doesn't break anything, `eslint --fix` clears it in one command.

## What's already solid
- Build is clean, no compile errors, routes in `src/App.jsx` all resolve (checked every `Navbar`/`Footer`/`Sidebar` link against the route table — no dead links).
- `Pricing.jsx` already does real India pricing: ₹100/₹350/Custom monthly tiers, INR-formatted (`en-IN` locale), India/US region toggle, separate FAQ copy per region.
- No leftover "Lorem ipsum," "TODO," or "replace before launch" markers anywhere in the actual served code (`src/`).
- Sidebar nav intentionally routes 8 modules (Documents, Trust Accounting, Time Tracking, Tasks, E-Signature, Email Log, Document Templates, Messages) to a `SectionPlaceholder` labelled "part of the Vakil Case demo" — this looks deliberate (repo is literally named `demo-vaik-case11`), not broken, but worth confirming that's the intended demo scope before you show it to anyone.

## Heads-up: there's a second, dead copy of the whole app in the repo
The repo root also has its own `App.jsx`, `main.jsx`, `pages/`, `components/`, `lib/` — a **separate, unused** app tree with its own version of the Landing and Pricing pages. It was added in a single "Add files via upload" commit and index.html doesn't load it (`jsconfig.json` maps `@/*` to `./src/*`, and `index.html` points at `/src/main.jsx`). This is where the actual "Placeholder testimonials — replace with real quotes before launch" text and "[Lawyer name] / [Firm name]" testimonials live — **not** in the live site, but it's easy for someone to open the wrong `Landing.jsx` and think the live site has placeholder testimonials (or edit the wrong file entirely). Recommend deleting the root-level duplicate tree to avoid confusion, unless it's there intentionally for a reason I'm not seeing.

## Demo data
Added `base44/functions/seedIndiaDemoData/entry.ts`, following the same pattern as your existing functions (`createClientFromRequest`, `asServiceRole` writes, admin-only gate). One call populates:
- 3 `LawyerProfile` records (Mumbai, Delhi, Bengaluru — India bar councils)
- 6 `Client` records (Mumbai, Bengaluru, Chennai, Delhi, Hyderabad, Pune) across prospect/onboarded/active/archived statuses
- 8 `Case` records across civil litigation, employment/POSH, real estate/RERA, IP, tax, and estate planning, with Indian courts, case numbers, and hearing dates
- 8 `Fee` invoices in INR across paid/partial/overdue/draft statuses
- 6 `Task` records with due dates spread around today
- 5 `TimeEntry` records with billable hours
- 1 published `IntakeForm` ("New Client Intake — India")

To run it: sign in as an admin, then either trigger it from the Base44 dashboard's function runner, or call `base44.functions.invoke('seedIndiaDemoData')` from the browser console while logged in. Because it writes with `asServiceRole` (bypassing each entity's `create` RLS rule) and read access is admin-or-own-records, you'll want to view the seeded data as an admin account.

Re-running it adds another full batch rather than replacing the first — there's no dedupe check, by design (kept it simple; happy to add one if you'll run it repeatedly).

These two files (`AUDIT_NOTES.md`, `base44/functions/seedIndiaDemoData/entry.ts`) are sitting in the cloned repo in my workspace but not pushed anywhere — I don't have write access to your GitHub. Let me know if you'd like me to open a PR (if you grant repo access) or if you'll pull these in yourself.

## Not checked
- Nothing that requires a live Base44 backend/auth (login, registration, client portal, AI assistant, e-signature flows) — the build has no `VITE_BASE44_APP_ID` configured here, so those can't be exercised end-to-end from this environment.
- Visual/responsive QA — this was a code-level review, not a rendered screenshot pass.
