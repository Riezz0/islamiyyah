export interface ThemeColors {
  bg: string;
  fg: string;
  cursor: string;
  surface: string;
  "surface-hover": string;
  "surface-active": string;
  border: string;
  "border-strong": string;
  muted: string;
  "text-muted": string;
  accent: string;
  accent2: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  "section-prayer": string;
  "section-quran": string;
  "section-hadith": string;
  "section-dua": string;
  "section-calendar": string;
  "section-pray": string;
  "sidebar-prayer": string;
  "sidebar-quran": string;
  "sidebar-hadith": string;
  "sidebar-dua": string;
  "sidebar-calendar": string;
  "sidebar-pray": string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isPywal?: boolean;
}

export const themes: Theme[] = [
  {
    id: "pywal",
    name: "Pywal (System)",
    description: "Follows your system pywal colors",
    isPywal: true,
    colors: {} as ThemeColors,
  },
  {
    id: "islamic",
    name: "Islamic",
    description: "Deep emerald green with gold accents",
    colors: {
      bg: "#0d1f15",
      fg: "#e8f5e9",
      cursor: "#a5d6a7",
      surface: "#132e1c",
      "surface-hover": "#1a3d26",
      "surface-active": "#204d30",
      border: "#2e5e3f",
      "border-strong": "#3a7a52",
      muted: "#2e5e3f",
      "text-muted": "#a5d6a7",
      accent: "#c9a84c",
      accent2: "#d4af37",
      success: "#66bb6a",
      warning: "#e6c654",
      danger: "#ef5350",
      info: "#4db6ac",
      "section-prayer": "#c9a84c",
      "section-quran": "#4db6ac",
      "section-hadith": "#81c784",
      "section-dua": "#d4af37",
      "section-calendar": "#e6c654",
      "section-pray": "#ef5350",
      "sidebar-prayer": "#c9a84c",
      "sidebar-quran": "#4db6ac",
      "sidebar-hadith": "#81c784",
      "sidebar-dua": "#d4af37",
      "sidebar-calendar": "#e6c654",
      "sidebar-pray": "#ef5350",
    },
  },
  {
    id: "light",
    name: "Light",
    description: "Clean light theme",
    colors: {
      bg: "#f5f5f5",
      fg: "#1a1a2e",
      cursor: "#1a1a2e",
      surface: "#ffffff",
      "surface-hover": "#f0f0f0",
      "surface-active": "#e8e8e8",
      border: "#d0d0d0",
      "border-strong": "#b0b0b0",
      muted: "#c0c0c0",
      "text-muted": "#555555",
      accent: "#3b82f6",
      accent2: "#8b5cf6",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#06b6d4",
      "section-prayer": "#3b82f6",
      "section-quran": "#8b5cf6",
      "section-hadith": "#06b6d4",
      "section-dua": "#22c55e",
      "section-calendar": "#f59e0b",
      "section-pray": "#ef4444",
      "sidebar-prayer": "#3b82f6",
      "sidebar-quran": "#8b5cf6",
      "sidebar-hadith": "#06b6d4",
      "sidebar-dua": "#22c55e",
      "sidebar-calendar": "#f59e0b",
      "sidebar-pray": "#ef4444",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue night sky",
    colors: {
      bg: "#0f172a",
      fg: "#e2e8f0",
      cursor: "#94a3b8",
      surface: "#1e293b",
      "surface-hover": "#273548",
      "surface-active": "#334155",
      border: "#334155",
      "border-strong": "#475569",
      muted: "#334155",
      "text-muted": "#94a3b8",
      accent: "#60a5fa",
      accent2: "#a78bfa",
      success: "#34d399",
      warning: "#fbbf24",
      danger: "#f87171",
      info: "#22d3ee",
      "section-prayer": "#60a5fa",
      "section-quran": "#a78bfa",
      "section-hadith": "#22d3ee",
      "section-dua": "#34d399",
      "section-calendar": "#fbbf24",
      "section-pray": "#f87171",
      "sidebar-prayer": "#60a5fa",
      "sidebar-quran": "#a78bfa",
      "sidebar-hadith": "#22d3ee",
      "sidebar-dua": "#34d399",
      "sidebar-calendar": "#fbbf24",
      "sidebar-pray": "#f87171",
    },
  },
];

export const FONTS = [
  { id: "lateef", name: "Lateef", family: "'Lateef', serif" },
  { id: "uthmanic", name: "Uthmanic HAFS", family: "'UthmanicHAFS', serif" },
  { id: "almajeed", name: "Al Majeed Quranic Font", family: "'AlMajeed', serif" },
];
