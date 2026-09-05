import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Calendar.css";
import "./Page.css";

const API_BASE = "https://ummahapi.com/api";
const API_KEY = "umh_11659067db985b9d39d4ad88da306f8eb6e12909";

// Gregorian to Hijri conversion (Kuwaiti algorithm)
function gregorianToHijri(gy: number, gm: number, gd: number): { hy: number; hm: number; hd: number } {
  const jd = Math.floor((1461 * (gy + 4800 + Math.floor((gm - 14) / 12))) / 4) +
    Math.floor((367 * (gm - 2 - 12 * Math.floor((gm - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gy + 4900 + Math.floor((gm - 14) / 12)) / 100)) / 4) +
    gd - 32075;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const remainderJ = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hm = Math.floor((24 * remainderJ) / 709);
  const hd = remainderJ - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;

  return { hy, hm, hd };
}

function hijriToGregorian(hy: number, hm: number, hd: number): { gy: number; gm: number; gd: number } {
  const jd = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm -
    Math.floor((hm - 1) / 2) + hd + 1948440 - 385;

  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const remainder = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (remainder + 1)) / 1461001);
  const r = remainder - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * r) / 2447);
  const gd = r - Math.floor((2447 * j) / 80);
  const r2 = Math.floor(j / 11);
  const gm = j + 2 - 12 * r2;
  const gy = 100 * (n - 49) + i + r2;

  return { gy, gm, gd };
}

const HIJRI_MONTH_NAMES = ["", "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhul Qi'dah", "Dhul Hijjah"];

const HIJRI_MONTHS = [
  { num: 1, name: "Muharram", arabic: "مُحَرَّم", desc: "The Sacred Month. Beginning of the Islamic year." },
  { num: 2, name: "Safar", arabic: "صَفَر", desc: "The month of migration after the Prophet's ﷺ Hijra." },
  { num: 3, name: "Rabi' al-Awwal", arabic: "رَبِيع الأَوَّل", desc: "Month of the Prophet's ﷺ birth and passing (12 Rabi' al-Awwal)." },
  { num: 4, name: "Rabi' al-Thani", arabic: "رَبِيع الثَّانِي", desc: "Also known as Rabi' al-Akhir." },
  { num: 5, name: "Jumada al-Ula", arabic: "جُمَادَى الأُولَى", desc: "First month of dry season (Jumada = dried land)." },
  { num: 6, name: "Jumada al-Thani", arabic: "جُمَادَى الثَّانِيَة", desc: "Also known as Jumada al-Akhirah." },
  { num: 7, name: "Rajab", arabic: "رَجَب", desc: "Sacred Month. Month of Isra and Mi'raj (27 Rajab)." },
  { num: 8, name: "Sha'ban", arabic: "شَعْبَان", desc: "Month of preparation for Ramadan. The Prophet ﷺ would fast most of this month." },
  { num: 9, name: "Ramadan", arabic: "رَمَضَان", desc: "Month of fasting. The Quran was revealed in this month." },
  { num: 10, name: "Shawwal", arabic: "شَوَّال", desc: "Month of Eid al-Fitr. Fasting six days is recommended." },
  { num: 11, name: "Dhul Qi'dah", arabic: "ذُو الْقِعْدَة", desc: "Sacred Month. The month of Hajj preparations." },
  { num: 12, name: "Dhul Hijjah", arabic: "ذُو الْحِجَّة", desc: "Sacred Month. Month of Hajj and Eid al-Adha (10 Dhul Hijjah)." },
];

const PHASE_EMOJI: Record<string, string> = {
  "New Moon": "🌑",
  "Waxing Crescent": "🌒",
  "First Quarter": "🌓",
  "Waxing Gibbous": "🌔",
  "Full Moon": "🌕",
  "Waning Gibbous": "🌖",
  "Last Quarter": "🌗",
  "Waning Crescent": "🌘",
};

interface HijriData {
  gregorian: { formatted: string; day: number; month_name: string; year: number };
  hijri: { formatted: string; day: number; month_name: string; month_name_arabic: string; year: number };
}

interface MoonData {
  moon: { phase: string; illumination_pct: string; crescent_visibility: string; crescent_note: string; last_new_moon: string; next_new_moon: string };
  hijri: { month_arabic: string; month_note: string };
}

export default function Calendar() {
  const [hijri, setHijri] = useState<HijriData | null>(null);
  const [moon, setMoon] = useState<MoonData | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [hijriMonth, setHijriMonth] = useState(todayHijri.hm);
  const [hijriYear, setHijriYear] = useState(todayHijri.hy);

  useEffect(() => {
    const load = async () => {
      try {
        const [hijriRes, moonRes] = await Promise.all([
          fetch(`${API_BASE}/today-hijri?apikey=${API_KEY}`).then((r) => r.json()),
          fetch(`${API_BASE}/moon?apikey=${API_KEY}`).then((r) => r.json()),
        ]);
        if (hijriRes.success) setHijri(hijriRes.data);
        if (moonRes.success) setMoon(moonRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const DAY_NAMES = ["Mo","Tu","We","Th","Fr","Sa","Su"];

  const getHijriDaysInMonth = (_hy: number, hm: number) => {
    const lengths = [0,30,29,30,29,30,29,30,29,30,29,30,29];
    return lengths[hm];
  };

  const getHijriDays = (hy: number, hm: number) => {
    const daysInMonth = getHijriDaysInMonth(hy, hm);
    // First day of this Hijri month as Gregorian
    const first = hijriToGregorian(hy, hm, 1);
    const firstDate = new Date(first.gy, first.gm - 1, first.gd);
    let startDay = firstDate.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const days: { hijri: number; gregorian: string }[] = [];
    for (let i = 0; i < startDay; i++) {
      const prevHd = getHijriDaysInMonth(hy, hm - 1 || 12) - (startDay - 1 - i);
      const prevHm = hm === 1 ? 12 : hm - 1;
      const prevHy = hm === 1 ? hy - 1 : hy;
      const g = hijriToGregorian(prevHy, prevHm, prevHd);
      days.push({ hijri: prevHd, gregorian: `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const g = hijriToGregorian(hy, hm, d);
      days.push({ hijri: d, gregorian: `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}` });
    }
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextHm = hm === 12 ? 1 : hm + 1;
        const nextHy = hm === 12 ? hy + 1 : hy;
        const g = hijriToGregorian(nextHy, nextHm, i);
        days.push({ hijri: i, gregorian: `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}` });
      }
    }
    return days;
  };

  const calDays = getHijriDays(hijriYear, hijriMonth);

  const isToday = (gregStr: string) => {
    const g = today.toISOString().slice(0, 10);
    return g === gregStr;
  };

  const goToToday = () => {
    setHijriMonth(todayHijri.hm);
    setHijriYear(todayHijri.hy);
  };

  const prevMonth = () => {
    if (hijriMonth === 1) { setHijriMonth(12); setHijriYear(hijriYear - 1); }
    else setHijriMonth(hijriMonth - 1);
  };

  const nextMonth = () => {
    if (hijriMonth === 12) { setHijriMonth(1); setHijriYear(hijriYear + 1); }
    else setHijriMonth(hijriMonth + 1);
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Islamic Calendar</h1>
        <div className="calendar-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page page-calendar">
      <h1 className="page-title">Islamic Calendar</h1>

      {/* Top row: Calendar + Moon */}
      <div className="calendar-grid">
        {/* Hijri Monthly Calendar Card */}
        <div className="calendar-card">
          <div className="calendar-card-body">
            <div className="cal-header">
              <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <span className="cal-title">{HIJRI_MONTH_NAMES[hijriMonth]} {hijriYear} AH</span>
              <button className="cal-nav" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
            <button className="cal-today-btn" onClick={goToToday}>Today</button>
            <div className="cal-weekdays">
              {DAY_NAMES.map((d) => <span key={d} className="cal-weekday">{d}</span>)}
            </div>
            <div className="cal-days">
              {calDays.map((d, i) => (
                <span key={i} className={`cal-day ${isToday(d.gregorian) ? "today" : ""}`}>
                  {d.hijri}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Moon Phase Card */}
        <div className="calendar-card">
          <div className="calendar-card-header">
            <span className="calendar-card-title">Moon Phase</span>
          </div>
          <div className="calendar-card-divider" />
          <div className="calendar-card-body">
            <div className="calendar-moon">
              <span className="calendar-moon-emoji">{PHASE_EMOJI[moon?.moon.phase || ""] || "🌑"}</span>
              <span className="calendar-moon-phase">{moon?.moon.phase}</span>
              <span className="calendar-moon-illum">{moon?.moon.illumination_pct}% illuminated</span>
              <span className="calendar-moon-visibility">{moon?.moon.crescent_note}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moon Sighting Info */}
      <div className="calendar-card calendar-card-full">
        <div className="calendar-card-header">
          <span className="calendar-card-title">Moon Sighting</span>
        </div>
        <div className="calendar-card-divider" />
        <div className="calendar-card-body">
          <div className="calendar-moon-details">
            <div className="calendar-moon-detail">
              <span className="calendar-moon-detail-label">Today</span>
              <span className="calendar-moon-detail-value">{hijri?.hijri.formatted}</span>
            </div>
            <div className="calendar-moon-detail">
              <span className="calendar-moon-detail-label">Crescent Visibility</span>
              <span className="calendar-moon-detail-value">{moon?.moon.crescent_visibility}</span>
            </div>
            <div className="calendar-moon-detail">
              <span className="calendar-moon-detail-label">Last New Moon</span>
              <span className="calendar-moon-detail-value">{moon?.moon.last_new_moon}</span>
            </div>
            <div className="calendar-moon-detail">
              <span className="calendar-moon-detail-label">Next New Moon</span>
              <span className="calendar-moon-detail-value">{moon?.moon.next_new_moon}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hijri Months */}
      <div className="calendar-card calendar-card-full">
        <div className="calendar-card-header">
          <span className="calendar-card-title">Hijri Months</span>
        </div>
        <div className="calendar-card-divider" />
        <div className="calendar-card-body">
          <div className="calendar-months-grid">
            {HIJRI_MONTHS.map((m) => (
              <div
                key={m.num}
                className={`calendar-month-item ${m.num === hijriMonth ? "current" : ""}`}
              >
                <div className="calendar-month-header">
                  <span className="calendar-month-num">{m.num}</span>
                  <span className="calendar-month-arabic">{m.arabic}</span>
                </div>
                <span className="calendar-month-name">{m.name}</span>
                <span className="calendar-month-desc">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
