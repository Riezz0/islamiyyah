import { useState, useEffect, useCallback, useRef } from "react";
import { themes, FONTS, type ThemeColors } from "../data/themes";

export interface Settings {
  themeId: string;
  fontId: string;
  fontSize: number;
}

const STORAGE_KEY = "islamiyyah-settings";

const defaults: Settings = {
  themeId: "pywal",
  fontId: "lateef",
  fontSize: 19,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement;
  (Object.keys(colors) as Array<keyof ThemeColors>).forEach((key) => {
    root.style.setProperty(`--${key}`, colors[key]);
  });
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const prevThemeId = useRef(settings.themeId);

  const applySettings = useCallback((s: Settings) => {
    const root = document.documentElement;
    const theme = themes.find((t) => t.id === s.themeId);

    if (theme && !theme.isPywal) {
      root.setAttribute("data-theme", theme.id);
      applyThemeColors(theme.colors);
    } else {
      root.removeAttribute("data-theme");
      // Re-apply pywal colors after clearing previous theme
      requestAnimationFrame(() => window.dispatchEvent(new Event("pywal-reapply")));
    }

    // Font family via CSS variable
    const font = FONTS.find((f) => f.id === s.fontId);
    if (font) {
      root.style.setProperty("--app-font", font.family);
    }

    // Font size via CSS variable
    root.style.setProperty("--app-font-size", `${s.fontSize}px`);

    prevThemeId.current = s.themeId;
  }, []);

  useEffect(() => {
    applySettings(settings);
  }, [settings, applySettings]);

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  return { settings, updateSettings };
}
