# Arman Ebadi — Webdesign & Automatisierung

Minimaler Onepager plus Projekt-Wizard für Webdesign, interne Tools und Automatisierung mit Fokus auf White-Space, große Typo und dezente Animationen.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS für Utility-Styles
- shadcn/ui (Button & Card Foundation)
- Framer Motion für Sektionen/Progress Animationen
- Supabase (DB + Edge Function)
- Resend API für E-Mail-Benachrichtigungen (via Edge Function)
- Validation mit zod (Client + Server) und react-hook-form für Wizard-UX

## Aufbau
- **Landing (`/`)** – Apple-ähnliche Struktur: Hero, Leistungen, Warum, Ablauf, Über mich, finale CTA, Footer
- **Projekt-Wizard (`/anfrage`)** – 4 Schritte: Basics, Ziele & Features, Rahmen, Kontakt; Fortschritt, Validation und LocalStorage
- **Danke (`/danke`)** – Bestätigung nach Absenden
- **API (`/api/project-request`)** – Validiert, speichert in Supabase, triggert Edge Function
- **API Lite (`/api/project-request-lite`)** – Für den statischen HTML-Wizard (`html-export/anfrage.html`) mit vereinfachtem Datenmodell
- **Admin (`/admin?token=...`)** – Geschützte Übersicht der letzten Anfragen aus `project_requests`
- **HTML Admin (`html-export/admin.html`)** – Login-Seite, lädt Anfragen direkt über Supabase (`assets/admin-config.js`)

## Installation & Entwicklung
1. Node.js (empfohlen 20.x oder neuer) installieren, dann im Projekt `npm install` ausführen.
2. Kopiere `.env.example` nach `.env.local` und fülle die Werte (siehe nächste Sektion).
3. `npm run dev` startet den lokalen Server (App Router + Tailwind laufen automatisch).
4. `npm run lint` prüft TypeScript/ESLint, `npm run build` für Produktion.

## Environment-Variablen (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_EMBEDDED_FUNCTION_URL=https://<project>.supabase.co/functions/v1/notify-project
RESEND_API_KEY=key-xxx
NOTIFY_EMAIL_TO=arman@example.com
NOTIFY_EMAIL_FROM=info@example.com
ADMIN_DASHBOARD_TOKEN=change-me
ADMIN_HTML_PASSWORD=Ar280602
```
- Die public keys werden im Client (Landing + Wizard) gebraucht.
- Die Service-Role wird nur im API-Route und beim Aufruf der Edge Function benötigt.
- Die Edge Function braucht Zugriff auf `RESEND_API_KEY` sowie Absender/Empfänger für die Benachrichtigung.
- Für das statische Admin-Panel editierst du `html-export/assets/admin-config.js` und trägst dort `supabaseUrl`, `supabaseAnonKey` und (optional) `adminPassword` ein.

## Supabase & Datenbank
- Schema in `supabase.sql` (inkl. `project_requests` Tabelle, RLS-Policy).
- INSERT erfolgt über `SUPABASE_SERVICE_ROLE_KEY`; keine direkte Client-Schreibberechtigung nötig.
- Der Wizard sendet seine Daten an `/api/project-request`, dort wird zuerst validiert (zod), dann in Supabase geschrieben.
- Der HTML-Wizard (`html-export/anfrage.html`) sendet an `/api/project-request-lite`.
- Die HTML-Adminseite (`html-export/admin.html`) fragt nach Login Anfragen direkt über Supabase an (siehe `html-export/assets/admin-config.js` für `supabaseUrl`/`supabaseAnonKey` und das Passwort).
- RLS (Row Level Security) ist aktiviert, aber die Policy erlaubt Inserte via Service Role.

## Supabase Edge Function `notify-project`
- Datei: `supabase/functions/notify-project/index.ts` (Deno + zod).
- Wird vom Next.js-API-Handler nach dem DB-Insert per `fetch` aufgerufen.
- Sendet zwei E-Mails über Resend: 1) an dich mit Projekt-Details, 2) Auto-Reply an die Kontaktperson.
- Deployment: Mit Supabase CLI `supabase functions deploy notify-project --no-verify-jwt --project-ref <ref>` (Deno braucht `--allow-net --allow-env`).
- Lokales Testen: `supabase functions serve notify-project --project-ref <ref>` (auch hier die nötigen Env-Vars setzen).

## Wizard-Details
- Mehrschritt-Formular (4 Schritte) aufgebaut mit `react-hook-form` + `zod`.
- Fortschritt dank `StepIndicator` mit Framer-Motion (1/4 + Progress Bar).
- LocalStorage (`project-request-form`) schützt vor Datenverlust.
- Pflichtfelder steuern den „Weiter“-Button (`disabled` solange Inputs fehlen).
- Honeypotfeld `website` + serverseitiger Check + Rate-Limiting-Map schützen vor Bots.
- Hinweise/Errors erscheinen inline bei invaliden Eingaben.

## Notification Flow
1. `/api/project-request` validiert die Daten, inseriert in `project_requests`, ruft die Edge Function auf.
2. Die Edge Function verwendet `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM/TO`, versendet Benachrichtigung + Dankes-Auto-Reply.
3. Der Benutzer wird zur `/danke`-Seite weitergeleitet; localStorage wird geleert.
4. Errors werden dem Nutzer als Toast angezeigt (Fehlermeldung unter dem Formular).

## Design & UX
- Maximale Breite ~1200px, großzügige `py-20`, große Typo für Headline/Text.
- Cards mit dezentem Border, `shadow-soft` und Hover-Lift.
- Buttons: Primary dunkel (#0f172a), Secondary light, Ghost für Rückwärts.
- Animierte Sektionen mit Framer Motion (`fade`/`slide`).
- 1 Akzentfarbe (kühles Blau) sparsam eingesetzt bei Badges/Borders.
- Footer mit Kontaktlinks, CTA-Botton im Hero + Final Section.

## Deployment Hinweise
- `npm run build` + `npm run start` für Produktion.
- Setze alle `.env`-Variablen in deiner Hosting-Umgebung (Vercel, Supabase, etc.).
- Die Supabase Edge Function braucht dieselben Env Vars wie lokal (besonders `RESEND_API_KEY`).
- Edge Function muss über Supabase CLI deployed werden, damit der API-Route sie erreichen kann.

## Nächste Schritte
1. `npm install` ausführen und `npm run dev` testen.
2. Supabase-Tabelle einrichten via `supabase sql patch` oder manuell mit `supabase.sql`.
3. Edge Function deployen und die URL in `.env.local` eintragen.
4. Optional: Tailwind-Konfiguration erweitern (Farben, dark mode) oder shadcn/ui erweitern.

Bei Fragen zur Einrichtung der Supabase-Funktion oder der Resend-Anbindung einfach Bescheid geben.
