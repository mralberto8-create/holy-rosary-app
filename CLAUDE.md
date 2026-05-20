# Holy Rosary App — Project Guide

## Rules

- Before pushing any changes to GitHub, always start the local dev server and confirm the user has reviewed the changes at http://localhost:3000. Do not push until the user gives the go-ahead.
- At the start of every session, read this file to level-set on current features. If anything looks outdated vs. the actual code, update this file before proceeding.
- Whenever a feature is added, changed, or removed during a session, update this file before ending the session.

Start the dev server with:
```
cd /Users/markalberto/Downloads/holy-rosary-app/holy-rosary-app && npm start
```

---

## Project Setup

- **Framework:** React (Create React App)
- **App location:** `/Users/markalberto/Downloads/holy-rosary-app/holy-rosary-app`
- **GitHub repo:** https://github.com/mralberto8-create/holy-rosary-app
- **Live URL:** https://holy-rosary-app-one.vercel.app
- **Deploy workflow:** Edit → test locally → git add/commit/push → Vercel auto-deploys

---

## Screens

| Screen | Trigger |
|---|---|
| Dedication | App first load (personal message to wife Judith, cancer acknowledgment) |
| Splash | 2-second animation overlay on first view |
| Home | After dedication dismissed |
| Praying | After Begin / Resume |
| Completion | After final step |

---

## Home Screen Features

- **Mystery selection** — 4 buttons (Joyful, Sorrowful, Glorious, Luminous); auto-suggests by day of week with ✦ Suggested label
- **Progress resume card** — appears if localStorage has an in-progress rosary; shows mystery set + % complete; Resume or Start Fresh
- **Mystery list** — shows all 5 mysteries for selected set with expandable meditations (title, scripture, fruit, short intention, full meditation)
- **4 top action buttons:** Guide · FAQ · MJK Novena · Pieta Prayers
- **Guide** — 8-section user guide modal
- **FAQ** — tabbed modal: "About the Rosary" (6 accordion sections) and "History" (9 accordion sections)
- **MJK Novena** — full-screen overlay showing `/mjk-novena.jpg`
- **Pieta Prayers** — "Judith's Pieta Prayer Book": splash screen (pieta-sky.png background), prayer list (7 categories, 28 public domain prayers), individual prayer view. Copyrighted prayers not yet added.

---

## Praying Screen Features

- **SVG rosary visualization** — 55 interactive beads; tap any bead to jump to that step
  - Bead states: idle (purple), done (blue), active (gold with glow)
  - Large Our Father beads, small Hail Mary beads (numbered in active decade), crucifix at pendant base
  - Decade Arc at top shows active decade's mysteries
- **262-step prayer sequence** — full Rosary from Sign of the Cross → Apostles' Creed → 5 decades → Hail Holy Queen → Final Prayer → Closing Sign of the Cross
- **Expandable prayer cards** — tap to expand/collapse; sticky state persists across navigation; "Expand All" button
- **Learn More modal** — deep mystery meditation, scripture, fruit, short intention; bottom sheet with drag handle
- **Back / Next navigation**
- **Top bar** — Home link · mystery set name · Sleep Mode toggle (moon icon)

---

## Sleep / Auto-Play Mode

- Moon button toggles auto-play
- Plays 28 ElevenLabs MP3 files from `public/audio/`; falls back to browser TTS if file missing
- Auto-advances after audio ends (2.5s pause after prayers, 5s after mysteries)
- Moon turns gold when active; "speaking…" / "pausing…" status shown

### Audio Files (28 total in `public/audio/`)
**Prayers (8):** prayer_sign_of_cross · prayer_apostles_creed · prayer_our_father · prayer_hail_mary · prayer_glory_be · prayer_fatima · prayer_hail_holy_queen · prayer_final

**Mysteries (20):** mystery_joyful_1–5 · mystery_sorrowful_1–5 · mystery_glorious_1–5 · mystery_luminous_1–5

---

## Community Features

- **Prayer Wall** (🙏) — read all submitted prayer intentions
- **Prayer Requests** (⚔️) — submit a prayer intention (name, location, text)
- **Feedback** (💬) — star rating (1–5), thumb reaction, name, location, comment
- **View Feedback** (📋) — PIN-protected viewer (PIN: 2680); shows all feedback with average rating
- Stored in `window.storage` (persists across sessions)

---

## Data Persistence

| Data | Storage | Key |
|---|---|---|
| Rosary progress | `localStorage` | `rosary_progress` |
| Feedback | `window.storage` | — |
| Prayer requests | `window.storage` | `rosary_prayers` |

---

## Mystery Sets & Day Assignments

| Set | Days |
|---|---|
| Joyful | Monday, Saturday |
| Sorrowful | Tuesday, Friday |
| Glorious | Wednesday, Sunday |
| Luminous | Thursday |

---

## Visual Design

- **Colors:** Dark purple bg (#1a0d2e), purple accents (#6b3fa0, #9b6dcc), gold highlights (#ffd700), light text (#f0e6ff)
- **Font:** Lora (serif, Google Fonts)
- **Layout:** Mobile-focused, max-width 390px, PWA meta tags, safe area insets
- **Animations:** fadeIn, splashFade, pulseBead, speakPulse

---

## Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Entire app (~2450 lines, single file) |
| `public/audio/` | 28 ElevenLabs MP3 files |
| `public/mjk-novena.jpg` | MJK Novena image |
| `public/index.html` | PWA meta tags, Google Fonts import |
