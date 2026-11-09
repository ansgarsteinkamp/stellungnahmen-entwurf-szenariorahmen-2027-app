# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was die App macht

Eine clientseitige React-App zur Auswertung der öffentlichen Stellungnahmen zum Entwurf des Szenariorahmens Gas/Wasserstoff 2027–2040/2045 (Konsultation der Bundesnetzagentur, September 2026). Nutzer laden eine `quelldaten.json`-Datei per Drag-and-Drop im Browser — alle Daten werden lokal verarbeitet, kein Upload. Die App bietet sechs Hauptansichten: Übersicht (Dashboard), Themen, Organisationen, Bereiche, Akteursgruppen und Suche.

Die Datei `quelldaten.json` wird im Schwester-Repository `stellungnahmen-entwurf-szenariorahmen-2027` von `skripte/master.py` erzeugt. Die App ist eine Weiterentwicklung der App `stellungnahmen-entwurf-nep-2025-app`.

## Befehle

- `pnpm dev` — Entwicklungsserver starten (öffnet Browser automatisch)
- `pnpm build` — Produktions-Build nach `dist/`
- `pnpm preview` — Produktions-Build lokal ausliefern

Kein Test-Runner oder Linter konfiguriert.

## Tech-Stack

- **React 19** mit JSX (kein TypeScript)
- **Vite 7** mit `@vitejs/plugin-react`
- **Tailwind CSS v4** über `@tailwindcss/vite`-Plugin (Konfiguration in `src/index.css`, nicht `tailwind.config.js`)
- **shadcn/ui** (new-york-Stil, JSX-Variante) — konfiguriert in `components.json`, UI-Primitives in `src/components/ui/`.
- **react-markdown** + **remark-gfm** zum Rendern der Stellungnahmen (Styling über die Klasse `.markdown` in `src/index.css`)
- **d3** für den Netzwerkgraphen
- **pnpm** als Paketmanager
- Pfad-Alias: `@/` → `src/`

## Architektur

**App-Ablauf:** `main.jsx` → `App.jsx` → entweder `Dropzone` (ohne Daten) oder `MainView` (nach JSON-Laden).

- `src/App.jsx` — Root-Komponente. Hält das geparste JSON im State.
- `src/components/Dropzone.jsx` — Datei-Dropzone mit `react-dropzone`. Validiert die Top-Level-Struktur (`organisationen`, `themen`, `bereiche`).
- `src/components/MainView.jsx` — Tab-Navigation, Navigations-State und Browser-History.
- `src/components/Dashboard.jsx` — Kennzahlen, Top-10-Listen, Resonanz pro Bereich, Akteursgruppen, Netzwerkgraph.
- `src/components/ThemenView.jsx` — Master-Detail-Ansicht der thematischen Cluster.
- `src/components/OrgView.jsx` — Organisationen mit Zusammenfassung, Bereichen, Themen und ungekürzter Stellungnahme (Markdown).
- `src/components/BereicheView.jsx` — die 12 Bereiche (11 Fragenkomplexe Gas/H₂ des BNetzA-Begleitdokuments + "Übergreifende Anmerkungen") mit Leitfragen und Zusammenfassung, optional nach H₂/CH₄ getrennt.
- `src/components/AkteursgruppenView.jsx` — Organisationen gruppiert nach der BNetzA-Klassifizierung.
- `src/components/SucheView.jsx` — Volltextsuche über die ungekürzten Stellungnahmen.
- `src/components/viz/NetworkGraph.jsx` — Force-Graph der thematischen Überlappung zwischen Organisationen.
- `src/components/custom/` — Projektspezifische Komponenten (`SearchInput`, `Markdown`, `OrgSummaryList`).
- `src/lib/helpers.js` — OrgMap, Bereichs-Label, Gruppierung nach Akteursgruppe, Highlighting.
- `src/lib/similarity.js` — Jaccard-Ähnlichkeit für den NetworkGraph.

## Datenmodell (quelldaten.json)

```
quelldaten.json
├── organisationen[]   nr (String), organisation, abkürzung, klassifizierung, aktennummer,
│                      eingangsdatum, sprache ("de"|"en"), zusammenfassung, dokument (Markdown)
├── themen[]           thema, beschreibung, organisationen[] (Integer)
└── bereiche[]         bereich, nummer ("2.1"…"2.11" oder null), fragen[], organisationen[] (Integer),
                       zusammenfassung, zusammenfassung_H2, zusammenfassung_CH4 (beide null oder beide gesetzt)
```

Implementierungs-Fallstricke:

- `themen[].organisationen` und `bereiche[].organisationen` enthalten Integer-IDs, `organisationen[].nr` ist ein String — Konvertierung beim Verknüpfen nötig.
- Jede Organisation hat genau eine Stellungnahme (`dokument`). Bei zwei identischen Doppeleinreichungen enthält `aktennummer` beide Nummern ("500020 | 500021").
- `bereiche[]` hat genau 12 Einträge in fester Reihenfolge; Bereichsnamen per Gleichheit vergleichen.
- Feldnamen enthalten Umlaute (`abkürzung`, `zusammenfassung`).

## Styling-Konventionen

- Nur Dark Theme (kein Light Mode), definiert über CSS Custom Properties in `src/index.css`
- Primärfarbe: `#d97757` (warmes Orange)
- Schriftart: DM Mono (Monospace), geladen aus `src/fonts/`
- Eigene Breakpoints: `3xs` (411px), `2xs` (480px), `xs` (540px) sowie Standard-Tailwind `sm`–`2xl`
- Eigene Textgrößen: `2xs`, `3xs`, `4xs` unterhalb der Standard-Tailwind-Skala
- UI-Sprache ist Deutsch
- Primär für Desktop-Browser optimieren. Auf Mobilgeräten grundlegend nutzbar, aber kein optimiertes Mobile-Erlebnis nötig.
- Kein linksbündiges Layout: Container mit `max-w-*` immer mit `mx-auto` zentrieren.

## Git-Commits

Nur committen, wenn der User es ausdrücklich wünscht. Commit-Message auf Englisch, kurz und prägnant (Imperative Mood). Nur die vom User genannten Dateien stagen — kein `git add -A`.

## Deployment

Gebaut für GitHub Pages mit Base-Pfad `/stellungnahmen-entwurf-szenariorahmen-2027-app/` (gesetzt in `vite.config.js`), Workflow in `.github/workflows/deploy.yml`.
