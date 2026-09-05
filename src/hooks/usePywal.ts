import { useEffect, useRef } from "react";

interface PywalColors {
  special: {
    background: string;
    foreground: string;
    cursor: string;
  };
  colors: {
    color0: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    color6: string;
    color7: string;
    color8: string;
    color9: string;
    color10: string;
    color11: string;
    color12: string;
    color13: string;
    color14: string;
    color15: string;
  };
}

export function usePywal() {
  const lastMtime = useRef(0);

  useEffect(() => {
    loadColors();

    const retry = setTimeout(() => loadColors(), 100);

    const interval = setInterval(async () => {
      try {
        const mtime = await window.electronAPI?.getPywalMtime();
        if (mtime !== undefined && mtime !== lastMtime.current) {
          lastMtime.current = mtime;
          loadColors();
        }
      } catch {}
    }, 2000);

    const onReapply = () => loadColors();
    window.addEventListener("pywal-reapply", onReapply);

    return () => {
      clearTimeout(retry);
      clearInterval(interval);
      window.removeEventListener("pywal-reapply", onReapply);
    };
  }, []);
}

function loadColors() {
  window.electronAPI?.getPywalColors()
    .then((data) => {
      if (data) applyColors(data as PywalColors);
      else applyDefaults();
    })
    .catch(() => {
      applyDefaults();
    });
}

function applyColors(data: PywalColors) {
  // Skip if a non-pywal theme is active
  if (document.documentElement.hasAttribute("data-theme")) return;

  const root = document.documentElement;
  const c = data.colors;
  const s = data.special;

  root.style.setProperty("--bg", s.background);
  root.style.setProperty("--fg", s.foreground);
  root.style.setProperty("--cursor", s.cursor);

  root.style.setProperty("--color0", c.color0);
  root.style.setProperty("--color1", c.color1);
  root.style.setProperty("--color2", c.color2);
  root.style.setProperty("--color3", c.color3);
  root.style.setProperty("--color4", c.color4);
  root.style.setProperty("--color5", c.color5);
  root.style.setProperty("--color6", c.color6);
  root.style.setProperty("--color7", c.color7);
  root.style.setProperty("--color8", c.color8);
  root.style.setProperty("--color9", c.color9);
  root.style.setProperty("--color10", c.color10);
  root.style.setProperty("--color11", c.color11);
  root.style.setProperty("--color12", c.color12);
  root.style.setProperty("--color13", c.color13);
  root.style.setProperty("--color14", c.color14);
  root.style.setProperty("--color15", c.color15);

  root.style.setProperty("--accent", c.color4);
  root.style.setProperty("--accent2", c.color5);
  root.style.setProperty("--success", c.color2);
  root.style.setProperty("--warning", c.color3);
  root.style.setProperty("--danger", c.color1);
  root.style.setProperty("--info", c.color6);
  root.style.setProperty("--muted", c.color8);
  root.style.setProperty("--border", c.color8);
  root.style.setProperty("--border-strong", lighten(s.background, 0.22));
  root.style.setProperty("--text-muted", c.color7);

  root.style.setProperty("--surface", lighten(s.background, 0.06));
  root.style.setProperty("--surface-hover", lighten(s.background, 0.12));
  root.style.setProperty("--surface-active", lighten(s.background, 0.18));

  root.style.setProperty("--section-prayer", c.color4);
  root.style.setProperty("--section-quran", c.color5);
  root.style.setProperty("--section-hadith", c.color6);
  root.style.setProperty("--section-dua", c.color2);
  root.style.setProperty("--section-calendar", c.color3);
  root.style.setProperty("--section-pray", c.color1);

  root.style.setProperty("--sidebar-prayer", c.color4);
  root.style.setProperty("--sidebar-quran", c.color5);
  root.style.setProperty("--sidebar-hadith", c.color6);
  root.style.setProperty("--sidebar-dua", c.color2);
  root.style.setProperty("--sidebar-calendar", c.color3);
  root.style.setProperty("--sidebar-pray", c.color1);
}

function applyDefaults() {
  const root = document.documentElement;
  root.style.setProperty("--bg", "#1a1b26");
  root.style.setProperty("--fg", "#c0caf5");
  root.style.setProperty("--cursor", "#c0caf5");

  root.style.setProperty("--color0", "#15161e");
  root.style.setProperty("--color1", "#f7768e");
  root.style.setProperty("--color2", "#9ece6a");
  root.style.setProperty("--color3", "#e0af68");
  root.style.setProperty("--color4", "#7aa2f7");
  root.style.setProperty("--color5", "#bb9af7");
  root.style.setProperty("--color6", "#7dcfff");
  root.style.setProperty("--color7", "#a9b1d6");
  root.style.setProperty("--color8", "#414868");
  root.style.setProperty("--color9", "#f7768e");
  root.style.setProperty("--color10", "#9ece6a");
  root.style.setProperty("--color11", "#e0af68");
  root.style.setProperty("--color12", "#7aa2f7");
  root.style.setProperty("--color13", "#bb9af7");
  root.style.setProperty("--color14", "#7dcfff");
  root.style.setProperty("--color15", "#c0caf5");

  root.style.setProperty("--accent", "#7aa2f7");
  root.style.setProperty("--accent2", "#bb9af7");
  root.style.setProperty("--success", "#9ece6a");
  root.style.setProperty("--warning", "#e0af68");
  root.style.setProperty("--danger", "#f7768e");
  root.style.setProperty("--info", "#7dcfff");
  root.style.setProperty("--muted", "#414868");
  root.style.setProperty("--border", "#414868");
  root.style.setProperty("--border-strong", "#565f89");
  root.style.setProperty("--text-muted", "#a9b1d6");

  root.style.setProperty("--surface", "#1e2030");
  root.style.setProperty("--surface-hover", "#252837");
  root.style.setProperty("--surface-active", "#2e3142");

  root.style.setProperty("--section-prayer", "#7aa2f7");
  root.style.setProperty("--section-quran", "#bb9af7");
  root.style.setProperty("--section-hadith", "#7dcfff");
  root.style.setProperty("--section-dua", "#9ece6a");
  root.style.setProperty("--section-calendar", "#e0af68");
  root.style.setProperty("--section-pray", "#f7768e");

  root.style.setProperty("--sidebar-prayer", "#7aa2f7");
  root.style.setProperty("--sidebar-quran", "#bb9af7");
  root.style.setProperty("--sidebar-hadith", "#7dcfff");
  root.style.setProperty("--sidebar-dua", "#9ece6a");
  root.style.setProperty("--sidebar-calendar", "#e0af68");
  root.style.setProperty("--sidebar-pray", "#f7768e");
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
