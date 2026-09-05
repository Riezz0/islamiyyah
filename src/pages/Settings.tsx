import { useState, useEffect } from "react";
import { Settings as SettingsType } from "../hooks/useSettings";
import { themes, FONTS } from "../data/themes";
import "./Settings.css";
import "./Page.css";

interface Props {
  settings: SettingsType;
  onUpdate: (partial: Partial<SettingsType>) => void;
}

interface PywalColors {
  special: { background: string; foreground: string; cursor: string };
  colors: Record<string, string>;
}

function usePywalPreview() {
  const [colors, setColors] = useState<PywalColors | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      window.electronAPI?.getPywalColors()
        .then((data) => { if (active && data) setColors(data); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 2000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return colors;
}

export default function SettingsPage({ settings, onUpdate }: Props) {
  const pywal = usePywalPreview();

  return (
    <div className="page page-settings">
      <h1 className="page-title">Settings</h1>

      {/* Theme */}
      <section className="settings-section">
        <h2 className="settings-heading">Theme</h2>
        <p className="settings-desc">
          Choose a color theme. Pywal follows your system colors.
        </p>
        <div className="settings-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`settings-theme-card ${settings.themeId === theme.id ? "settings-theme-card--active" : ""}`}
              onClick={() => onUpdate({ themeId: theme.id })}
            >
              <div className="theme-preview">
                {theme.isPywal && pywal ? (
                  <>
                    <div className="theme-swatch" style={{ background: pywal.special.background, border: `2px solid ${pywal.colors.color8}` }} />
                    <div className="theme-swatch" style={{ background: pywal.colors.color4 }} />
                    <div className="theme-swatch" style={{ background: pywal.colors.color5 }} />
                    <div className="theme-swatch" style={{ background: pywal.colors.color2 }} />
                    <div className="theme-swatch" style={{ background: pywal.special.foreground }} />
                  </>
                ) : !theme.isPywal ? (
                  <>
                    <div className="theme-swatch" style={{ background: theme.colors.bg, border: `2px solid ${theme.colors["border-strong"]}` }} />
                    <div className="theme-swatch" style={{ background: theme.colors["section-prayer"] }} />
                    <div className="theme-swatch" style={{ background: theme.colors["section-quran"] }} />
                    <div className="theme-swatch" style={{ background: theme.colors["section-dua"] }} />
                    <div className="theme-swatch" style={{ background: theme.colors.surface }} />
                  </>
                ) : (
                  <>
                    <div className="theme-swatch theme-swatch--pywal" />
                    <div className="theme-swatch theme-swatch--pywal" />
                    <div className="theme-swatch theme-swatch--pywal" />
                    <div className="theme-swatch theme-swatch--pywal" />
                    <div className="theme-swatch theme-swatch--pywal" />
                  </>
                )}
              </div>
              <span className="theme-name">{theme.name}</span>
              <span className="theme-desc">{theme.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Font */}
      <section className="settings-section">
        <h2 className="settings-heading">Font Family</h2>
        <div className="settings-font-grid">
          {FONTS.map((font) => (
            <button
              key={font.id}
              className={`settings-font-card ${settings.fontId === font.id ? "settings-font-card--active" : ""}`}
              style={{ fontFamily: font.family }}
              onClick={() => onUpdate({ fontId: font.id })}
            >
              <span className="settings-font-ar" lang="ar">بِسْمِ ٱللَّٰهِ</span>
              <span className="settings-font-name">{font.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Font Size */}
      <section className="settings-section">
        <h2 className="settings-heading">Font Size</h2>
        <div className="settings-slider-group">
          <span className="settings-slider-label">A</span>
          <input
            type="range"
            min="14"
            max="30"
            step="1"
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="settings-slider"
          />
          <span className="settings-slider-label settings-slider-label--large">A</span>
          <span className="settings-slider-value">{settings.fontSize}px</span>
        </div>
        <p className="settings-preview-text" style={{ fontSize: settings.fontSize }} lang="ar">
          Preview: بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ — In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </section>
    </div>
  );
}
