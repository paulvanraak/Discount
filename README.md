# BespaarCheck

Persoonlijke bespaar-check + vergelijker voor financiële diensten in Nederland.

## Twee flows

1. **BespaarCheck** — `/check` — 6-stappen flow met persoonlijk resultaat
2. **Vergelijkers** — `/vergelijk/:category` — directe categorie-vergelijking

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (check-flow state)
- Supabase (database, users, tracking)
- Material Symbols Rounded

## Setup

```bash
npm install
cp .env.local.example .env.local  # vul Supabase keys in
npm run dev
```

## Database

Migraties in `supabase/migrations/`. Voer `001_initial_schema.sql` uit in Supabase SQL editor.

## Folder structure

- `src/components/` — UI componenten
- `src/pages/` — route-level pages
- `src/data/` — categorieën, aanbieders, check-vragen
- `src/services/` — Supabase, affiliate, analytics, savings
- `src/store/` — Zustand stores
- `Discount/` — oude React Native code (niet aanraken)

## User identificatie

Anoniem UUID in localStorage (`bc_user_id`). Email optioneel ná check, gekoppeld aan zelfde anon_id.

## Tracking events

Via `actions` tabel in Supabase:
- `affiliate_click` — klik naar aanbieder
- `marked_done` — gebruiker markeert "ik ben overgestapt"
- `email_optin` — email gegeven voor reminder
