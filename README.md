# Islamiyyah

A desktop Islamic companion app built with Electron, React, and TypeScript.

## Features

- **Prayer Times** — GPS-based prayer times with multiple calculation methods, saved locations, and city search
- **Quran Reader** — Full Quran with Arabic text, verse-by-verse audio playback (Mishari Rashid al-Afasy), multiple translations, and page navigation
- **Dua & Dhikr** — Collection of authentic duas with Arabic text, translations, and hadith evidence
- **Calendar** — Islamic (Hijri) and Gregorian calendar with moon phases
- **How to Pray** — Step-by-step prayer guide
- **Settings** — Theme selection (Pywal, Islamic, Light, Midnight), font choice (Lateef, Uthmanic HAFS, Al Majeed), and adjustable font size

## Tech Stack

- **Electron** — Desktop shell
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Plain CSS** — Styling with CSS custom properties

## APIs Used

- [Quran.com API v4](https://api.quran.com) — Quran text, translations, verse audio
- [UmmahAPI](https://ummahapi.com) — Prayer times, surah audio, Hijri dates
- [Open-Meteo](https://open-meteo.com) — Geocoding for city search

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start Electron app
npm run electron
```

## Project Structure

```
src/
├── components/     # Shared UI components (Layout, Sidebar, TitleBar)
├── pages/          # Feature pages (Quran, PrayerTimes, DuaDhikr, etc.)
├── hooks/          # Custom hooks (useSettings, usePywal)
├── data/           # Static data (themes, dua/dhikr content)
└── index.css       # Global styles, fonts, CSS variables
electron/
├── main.js         # Electron main process
└── preload.cjs     # Context bridge
public/
└── fonts/          # Arabic/Islamic fonts
```

## License

ISC
