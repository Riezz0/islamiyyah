import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  StopCircle,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import "./Page.css";
import "./Quran.css";

const QURANHUB_BASE = "https://api.qurani.ai/gw/qh/v1";
const WARSH_EDITION = "quran-warsh";
const WARSH_AUDIO_BASE = "https://everyayah.com/data/warsh/warsh_Abdul_Basit_128kbps";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number | null;
  hizbQuarter: number;
  sajda: boolean;
  audio?: string;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface SurahMeta {
  id: number;
  name: string;
  english: string;
  trans: string;
  ayahs: number;
  type: "Meccan" | "Medinan";
}

const SURAH_META: SurahMeta[] = [
  { id: 1, name: "الفاتحة", english: "Al-Faatihah", trans: "The Opening", ayahs: 7, type: "Meccan" },
  { id: 2, name: "البقرة", english: "Al-Baqara", trans: "The Cow", ayahs: 286, type: "Medinan" },
  { id: 3, name: "آل عمران", english: "Aal-i-Imraan", trans: "The Family of Imraan", ayahs: 200, type: "Medinan" },
  { id: 4, name: "النساء", english: "An-Nisaa", trans: "The Women", ayahs: 176, type: "Medinan" },
  { id: 5, name: "المائدة", english: "Al-Maaida", trans: "The Table Spread", ayahs: 120, type: "Medinan" },
  { id: 6, name: "الأنعام", english: "Al-An'aam", trans: "The Cattle", ayahs: 165, type: "Meccan" },
  { id: 7, name: "الأعراف", english: "Al-A'raaf", trans: "The Heights", ayahs: 206, type: "Meccan" },
  { id: 8, name: "الأنفال", english: "Al-Anfaal", trans: "The Spoils of War", ayahs: 75, type: "Medinan" },
  { id: 9, name: "التوبة", english: "At-Tawba", trans: "The Repentance", ayahs: 129, type: "Medinan" },
  { id: 10, name: "يونس", english: "Yunus", trans: "Jonah", ayahs: 109, type: "Meccan" },
  { id: 11, name: "هود", english: "Hud", trans: "Hud", ayahs: 123, type: "Meccan" },
  { id: 12, name: "يوسف", english: "Yusuf", trans: "Joseph", ayahs: 111, type: "Meccan" },
  { id: 13, name: "الرعد", english: "Ar-Ra'd", trans: "The Thunder", ayahs: 43, type: "Medinan" },
  { id: 14, name: "إبراهيم", english: "Ibrahim", trans: "Abraham", ayahs: 52, type: "Meccan" },
  { id: 15, name: "الحجر", english: "Al-Hijr", trans: "The Rocky Tract", ayahs: 99, type: "Meccan" },
  { id: 16, name: "النحل", english: "An-Nahl", trans: "The Bee", ayahs: 128, type: "Meccan" },
  { id: 17, name: "الإسراء", english: "Al-Israa", trans: "The Night Journey", ayahs: 111, type: "Meccan" },
  { id: 18, name: "الكهف", english: "Al-Kahf", trans: "The Cave", ayahs: 110, type: "Meccan" },
  { id: 19, name: "مريم", english: "Maryam", trans: "Mary", ayahs: 98, type: "Meccan" },
  { id: 20, name: "طه", english: "Taa-Haa", trans: "Ta-Haa", ayahs: 135, type: "Meccan" },
  { id: 21, name: "الأنبياء", english: "Al-Anbiyaa", trans: "The Prophets", ayahs: 112, type: "Meccan" },
  { id: 22, name: "الحج", english: "Al-Hajj", trans: "The Pilgrimage", ayahs: 78, type: "Medinan" },
  { id: 23, name: "المؤمنون", english: "Al-Muminoon", trans: "The Believers", ayahs: 118, type: "Meccan" },
  { id: 24, name: "النور", english: "An-Noor", trans: "The Light", ayahs: 64, type: "Medinan" },
  { id: 25, name: "الفرقان", english: "Al-Furqaan", trans: "The Criterion", ayahs: 77, type: "Meccan" },
  { id: 26, name: "الشعراء", english: "Ash-Shu'araa", trans: "The Poets", ayahs: 227, type: "Meccan" },
  { id: 27, name: "النمل", english: "An-Naml", trans: "The Ant", ayahs: 93, type: "Meccan" },
  { id: 28, name: "القصص", english: "Al-Qasas", trans: "The Stories", ayahs: 88, type: "Meccan" },
  { id: 29, name: "العنكبوت", english: "Al-Ankaboot", trans: "The Spider", ayahs: 69, type: "Meccan" },
  { id: 30, name: "الروم", english: "Ar-Room", trans: "The Romans", ayahs: 60, type: "Meccan" },
  { id: 31, name: "لقمان", english: "Luqmaan", trans: "Luqman", ayahs: 34, type: "Meccan" },
  { id: 32, name: "السجدة", english: "As-Sajda", trans: "The Prostration", ayahs: 30, type: "Meccan" },
  { id: 33, name: "الأحزاب", english: "Al-Ahzab", trans: "The Combined Forces", ayahs: 73, type: "Medinan" },
  { id: 34, name: "سبأ", english: "Saba", trans: "Sheba", ayahs: 54, type: "Meccan" },
  { id: 35, name: "فاطر", english: "Faatir", trans: "Originator", ayahs: 45, type: "Meccan" },
  { id: 36, name: "يس", english: "Yaa-Seen", trans: "Ya-Sin", ayahs: 83, type: "Meccan" },
  { id: 37, name: "الصافات", english: "As-Saaffaat", trans: "Those Who Set The Ranks", ayahs: 182, type: "Meccan" },
  { id: 38, name: "ص", english: "Saad", trans: "Sad", ayahs: 88, type: "Meccan" },
  { id: 39, name: "الزمر", english: "Az-Zumar", trans: "The Troops", ayahs: 75, type: "Meccan" },
  { id: 40, name: "غافر", english: "Ghafir", trans: "The Forgiver", ayahs: 85, type: "Meccan" },
  { id: 41, name: "فصلت", english: "Fussilat", trans: "Explained in Detail", ayahs: 54, type: "Meccan" },
  { id: 42, name: "الشورى", english: "Ash-Shuraaa", trans: "The Consultation", ayahs: 53, type: "Meccan" },
  { id: 43, name: "الزخرف", english: "Az-Zukhruf", trans: "The Ornaments of Gold", ayahs: 89, type: "Meccan" },
  { id: 44, name: "الدخان", english: "Ad-Dukhaan", trans: "The Smoke", ayahs: 59, type: "Meccan" },
  { id: 45, name: "الجاثية", english: "Al-Jaathiya", trans: "The Crouching", ayahs: 37, type: "Meccan" },
  { id: 46, name: "الأحقاف", english: "Al-Ahqaf", trans: "The Wind-curved Sandhills", ayahs: 35, type: "Meccan" },
  { id: 47, name: "محمد", english: "Muhammad", trans: "Muhammad", ayahs: 38, type: "Medinan" },
  { id: 48, name: "الفتح", english: "Al-Fath", trans: "The Victory", ayahs: 29, type: "Medinan" },
  { id: 49, name: "الحجرات", english: "Al-Hujuraat", trans: "The Rooms", ayahs: 18, type: "Medinan" },
  { id: 50, name: "ق", english: "Qaaf", trans: "Qaf", ayahs: 45, type: "Meccan" },
  { id: 51, name: "الذاريات", english: "Adh-Dhaariyat", trans: "The Winnowing Winds", ayahs: 60, type: "Meccan" },
  { id: 52, name: "الطور", english: "At-Tur", trans: "The Mount", ayahs: 49, type: "Meccan" },
  { id: 53, name: "النجم", english: "An-Najm", trans: "The Star", ayahs: 62, type: "Meccan" },
  { id: 54, name: "القمر", english: "Al-Qamar", trans: "The Moon", ayahs: 55, type: "Meccan" },
  { id: 55, name: "الرحمن", english: "Ar-Rahmaan", trans: "The Beneficent", ayahs: 78, type: "Medinan" },
  { id: 56, name: "الواقعة", english: "Al-Waaqia", trans: "The Inevitable", ayahs: 96, type: "Meccan" },
  { id: 57, name: "الحديد", english: "Al-Hadid", trans: "The Iron", ayahs: 29, type: "Medinan" },
  { id: 58, name: "المجادلة", english: "Al-Mujadila", trans: "The Pleading Woman", ayahs: 22, type: "Medinan" },
  { id: 59, name: "الحشر", english: "Al-Hashr", trans: "The Exile", ayahs: 24, type: "Medinan" },
  { id: 60, name: "الممتحنة", english: "Al-Mumtahina", trans: "She That is Examined", ayahs: 13, type: "Medinan" },
  { id: 61, name: "الصف", english: "As-Saff", trans: "The Ranks", ayahs: 14, type: "Medinan" },
  { id: 62, name: "الجمعة", english: "Al-Jumu'aa", trans: "The Congregation", ayahs: 11, type: "Medinan" },
  { id: 63, name: "المنافقون", english: "Al-Munaafiqoon", trans: "The Hypocrites", ayahs: 11, type: "Medinan" },
  { id: 64, name: "التغابن", english: "At-Taghabun", trans: "The Mutual Disillusion", ayahs: 18, type: "Medinan" },
  { id: 65, name: "الطلاق", english: "At-Talaaq", trans: "The Divorce", ayahs: 12, type: "Medinan" },
  { id: 66, name: "التحريم", english: "At-Tahrim", trans: "The Prohibition", ayahs: 12, type: "Medinan" },
  { id: 67, name: "الملك", english: "Al-Mulk", trans: "The Sovereignty", ayahs: 30, type: "Meccan" },
  { id: 68, name: "القلم", english: "Al-Qalam", trans: "The Pen", ayahs: 52, type: "Meccan" },
  { id: 69, name: "الحاقة", english: "Al-Haaqqaa", trans: "The Reality", ayahs: 52, type: "Meccan" },
  { id: 70, name: "المعارج", english: "Al-Ma'aarij", trans: "The Ascending Stairways", ayahs: 44, type: "Meccan" },
  { id: 71, name: "نوح", english: "Nooh", trans: "Noah", ayahs: 28, type: "Meccan" },
  { id: 72, name: "الجن", english: "Al-Jinn", trans: "The Jinn", ayahs: 28, type: "Meccan" },
  { id: 73, name: "المزمل", english: "Al-Muzzammil", trans: "The Enshrouded One", ayahs: 20, type: "Meccan" },
  { id: 74, name: "المدثر", english: "Al-Muddaththir", trans: "The Cloaked One", ayahs: 56, type: "Meccan" },
  { id: 75, name: "القيامة", english: "Al-Qiyaama", trans: "The Resurrection", ayahs: 40, type: "Meccan" },
  { id: 76, name: "الإنسان", english: "Al-Insaan", trans: "The Man", ayahs: 31, type: "Medinan" },
  { id: 77, name: "المرسلات", english: "Al-Mursalaat", trans: "The Emissaries", ayahs: 50, type: "Meccan" },
  { id: 78, name: "النبأ", english: "An-Naba", trans: "The Tidings", ayahs: 40, type: "Meccan" },
  { id: 79, name: "النازعات", english: "An-Naziaat", trans: "Those Who Drag Forth", ayahs: 46, type: "Meccan" },
  { id: 80, name: "عبس", english: "Abasa", trans: "He Frowned", ayahs: 42, type: "Meccan" },
  { id: 81, name: "التكوير", english: "At-Takwir", trans: "The Overthrowing", ayahs: 29, type: "Meccan" },
  { id: 82, name: "الانفطار", english: "Al-Infitaar", trans: "The Cleaving", ayahs: 19, type: "Meccan" },
  { id: 83, name: "المطففين", english: "Al-Mutaffifin", trans: "The Defrauding", ayahs: 36, type: "Meccan" },
  { id: 84, name: "الانشقاق", english: "Al-Inshiqaaq", trans: "The Sundering", ayahs: 25, type: "Meccan" },
  { id: 85, name: "البروج", english: "Al-Burooj", trans: "The Mansions of the Stars", ayahs: 22, type: "Meccan" },
  { id: 86, name: "الطارق", english: "At-Taariq", trans: "The Morning Star", ayahs: 17, type: "Meccan" },
  { id: 87, name: "الأعلى", english: "Al-A'laa", trans: "The Most High", ayahs: 19, type: "Meccan" },
  { id: 88, name: "الغاشية", english: "Al-Ghaashiya", trans: "The Overwhelming", ayahs: 26, type: "Meccan" },
  { id: 89, name: "الفجر", english: "Al-Fajr", trans: "The Dawn", ayahs: 30, type: "Meccan" },
  { id: 90, name: "البلد", english: "Al-Balad", trans: "The City", ayahs: 20, type: "Meccan" },
  { id: 91, name: "الشمس", english: "Ash-Shams", trans: "The Sun", ayahs: 15, type: "Meccan" },
  { id: 92, name: "الليل", english: "Al-Lail", trans: "The Night", ayahs: 21, type: "Meccan" },
  { id: 93, name: "الضحى", english: "Ad-Dhuhaa", trans: "The Morning Hours", ayahs: 11, type: "Meccan" },
  { id: 94, name: "الشرح", english: "Ash-Sharh", trans: "The Relief", ayahs: 8, type: "Meccan" },
  { id: 95, name: "التين", english: "At-Tin", trans: "The Fig", ayahs: 8, type: "Meccan" },
  { id: 96, name: "العلق", english: "Al-Alaq", trans: "The Clot", ayahs: 19, type: "Meccan" },
  { id: 97, name: "القدر", english: "Al-Qadr", trans: "The Power", ayahs: 5, type: "Meccan" },
  { id: 98, name: "البينة", english: "Al-Bayyina", trans: "The Clear Proof", ayahs: 8, type: "Medinan" },
  { id: 99, name: "الزلزلة", english: "Az-Zalzala", trans: "The Earthquake", ayahs: 8, type: "Medinan" },
  { id: 100, name: "العاديات", english: "Al-Aadiyaat", trans: "The Courser", ayahs: 11, type: "Meccan" },
  { id: 101, name: "القارعة", english: "Al-Qaari'a", trans: "The Calamity", ayahs: 11, type: "Meccan" },
  { id: 102, name: "التكاثر", english: "At-Takaathur", trans: "The Rivalry in World Increase", ayahs: 8, type: "Meccan" },
  { id: 103, name: "العصر", english: "Al-Asr", trans: "The Declining Day", ayahs: 3, type: "Meccan" },
  { id: 104, name: "الهمزة", english: "Al-Humaza", trans: "The Traducer", ayahs: 9, type: "Meccan" },
  { id: 105, name: "الفيل", english: "Al-Fil", trans: "The Elephant", ayahs: 5, type: "Meccan" },
  { id: 106, name: "قريش", english: "Quraysh", trans: "Quraysh", ayahs: 4, type: "Meccan" },
  { id: 107, name: "الماعون", english: "Al-Maa'oon", trans: "The Small Kindnesses", ayahs: 7, type: "Meccan" },
  { id: 108, name: "الكوثر", english: "Al-Kawthar", trans: "The Abundance", ayahs: 3, type: "Meccan" },
  { id: 109, name: "الكافرون", english: "Al-Kaafiroon", trans: "The Disbelievers", ayahs: 6, type: "Meccan" },
  { id: 110, name: "النصر", english: "An-Nasr", trans: "The Divine Support", ayahs: 3, type: "Medinan" },
  { id: 111, name: "المسد", english: "Al-Masad", trans: "The Palm Fiber", ayahs: 5, type: "Meccan" },
  { id: 112, name: "الإخلاص", english: "Al-Ikhlaas", trans: "The Sincerity", ayahs: 4, type: "Meccan" },
  { id: 113, name: "الفلق", english: "Al-Falaq", trans: "The Daybreak", ayahs: 5, type: "Meccan" },
  { id: 114, name: "الناس", english: "An-Naas", trans: "Mankind", ayahs: 6, type: "Meccan" },
];

async function fetchSurahWarsh(surahNumber: number): Promise<SurahData> {
  const res = await fetch(`${QURANHUB_BASE}/surah/${surahNumber}/${WARSH_EDITION}`);
  const data = await res.json();
  if (data.code !== 200) throw new Error("Failed to fetch Warsh text");
  const surahData = data.data;
  surahData.ayahs = surahData.ayahs.map((ayah: Omit<Ayah, "surah"> & { surah?: number }) => ({
    ...ayah,
    surah: surahNumber,
  }));
  return surahData;
}

function getPageImageSrc(page: number, tajweed: boolean): string {
  if (tajweed) {
    return `./warsh-tajweed/${String(page).padStart(3, "0")}.jpg`;
  }
  return `./warsh-plain/${page}.jpg`;
}

function SurahGrid({ onSelect }: { onSelect: (surah: number) => void }) {
  const [search, setSearch] = useState("");

  const filtered = SURAH_META.filter(
    (s) =>
      s.english.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      String(s.id) === search
  );

  return (
    <>
      <div className="quran-search-bar">
        <Search size={18} className="quran-search-icon" />
        <input
          className="quran-search-input"
          placeholder="Search surahs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="quran-surah-grid">
        {filtered.map((s) => (
          <button key={s.id} className="quran-surah-card" onClick={() => onSelect(s.id)}>
            <div className="quran-surah-num">{s.id}</div>
            <div className="quran-surah-info">
              <div className="quran-surah-name-row">
                <span className="quran-surah-arabic">{s.name}</span>
                <span className={`quran-surah-type ${s.type === "Meccan" ? "meccan" : "medinan"}`}>
                  {s.type}
                </span>
              </div>
              <span className="quran-surah-english">{s.english}</span>
              <span className="quran-surah-detail">
                {s.trans} · {s.ayahs} ayahs
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

export default function Quran() {
  const [view, setView] = useState<"grid" | "mushaf">("grid");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSpreadIdx, setCurrentSpreadIdx] = useState(0);
  const [showTajweed, setShowTajweed] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pages = surahData
    ? [...new Set(surahData.ayahs.map((a) => a.page))].sort((a, b) => a - b)
    : [];
  const totalPages = pages.length;

  const spreads = (() => {
    if (totalPages === 0) return [];
    const result: { right: number; left: number | null }[] = [];
    const allPages = pages.length > 0 && pages[0] === 1
      ? pages
      : pages;
    let i = 0;
    if (allPages[i] === 1) {
      result.push({ right: 1, left: null });
      i = 1;
    }
    while (i < allPages.length) {
      const right = allPages[i];
      const left = i + 1 < allPages.length ? allPages[i + 1] : null;
      result.push({ right, left });
      i += left !== null ? 2 : 1;
    }
    return result;
  })();

  const totalSpreads = spreads.length;
  const currentSpread = spreads[currentSpreadIdx] || { right: 1, left: null };

  useEffect(() => {
    if (!selectedSurah) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCurrentSpreadIdx(0);
    setPlayingAyah(null);
    stopAudio();

    fetchSurahWarsh(selectedSurah)
      .then((data) => {
        if (!cancelled) {
          setSurahData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      stopAudio();
    };
  }, [selectedSurah]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingAyah(null);
  }, []);

  const getAyahAudioUrl = (surah: number, ayah: number): string => {
    const surahStr = String(surah).padStart(3, "0");
    const ayahStr = String(ayah).padStart(3, "0");
    return `${WARSH_AUDIO_BASE}/${surahStr}${ayahStr}.mp3`;
  };

  const playAyah = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      stopAudio();
      const audioUrl = getAyahAudioUrl(surahNumber, ayahNumber);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingAyah(ayahNumber);
      audio.onerror = () => setPlayingAyah(null);
      audio.onended = () => {
        setPlayingAyah(null);
        if (surahData) {
          const nextAyah = ayahNumber + 1;
          const maxAyah = surahData.numberOfAyahs;
          if (nextAyah <= maxAyah) {
            setTimeout(() => playAyah(surahNumber, nextAyah), 300);
          }
        }
      };
      audio.play().catch(() => setPlayingAyah(null));
    },
    [surahData, stopAudio]
  );

  const playSurah = useCallback(() => {
    if (!selectedSurah) return;
    playAyah(selectedSurah, 1);
  }, [selectedSurah, playAyah]);

  const handlePrevSurah = () => {
    if (selectedSurah && selectedSurah > 1) {
      stopAudio();
      setSelectedSurah(selectedSurah - 1);
    }
  };

  const handleNextSurah = () => {
    if (selectedSurah && selectedSurah < 114) {
      stopAudio();
      setSelectedSurah(selectedSurah + 1);
    }
  };

  return (
    <div className="page page-quran">
      <h1 className="page-title">The Quran</h1>

      {view === "grid" ? (
        <SurahGrid
          onSelect={(surah) => {
            setSelectedSurah(surah);
            setView("mushaf");
          }}
        />
      ) : (
        <div className="quran-reader">
          <div className="quran-reader-top">
            <button
              className="quran-back-btn"
              onClick={() => {
                stopAudio();
                setView("grid");
                setSelectedSurah(null);
                setSurahData(null);
                setCurrentSpreadIdx(0);
              }}
            >
              <ChevronRight size={16} /> Surahs
            </button>
          </div>

          {loading ? (
            <div className="quran-loading">
              <Loader2 size={32} className="quran-spinner" />
              <span>Loading Warsh mushaf...</span>
            </div>
          ) : error ? (
            <div className="quran-loading">
              <span style={{ color: "var(--danger)" }}>Error: {error}</span>
              <button className="quran-back-btn" onClick={() => { setView("grid"); setSelectedSurah(null); }}>
                Back to Surahs
              </button>
            </div>
          ) : surahData ? (
            <>
              <div className="quran-reader-header">
                <button className="quran-audio-btn" onClick={handlePrevSurah} disabled={!selectedSurah || selectedSurah <= 1}>
                  <ChevronLeft size={18} />
                </button>
                <div className="quran-reader-title">
                  <span className="quran-reader-title-arabic">{surahData.name}</span>
                  <span className="quran-reader-title-english">
                    {surahData.englishName} — {surahData.englishNameTranslation}
                  </span>
                  <span className="quran-reader-title-english">
                    Warsh · Page {currentSpread.right}{currentSpread.left ? `–${currentSpread.left}` : ""} / 604
                  </span>
                </div>
                <button className="quran-audio-btn" onClick={handleNextSurah} disabled={!selectedSurah || selectedSurah >= 114}>
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className={`quran-mushaf-spread ${currentSpread.left === null ? "single-page" : ""}`}>
                <div className="quran-mushaf-page">
                  <img
                    key={`right-${currentSpread.right}`}
                    src={getPageImageSrc(currentSpread.right, showTajweed)}
                    alt={`Page ${currentSpread.right}`}
                    className="quran-mushaf-image"
                    draggable={false}
                  />
                </div>
                {currentSpread.left !== null && (
                  <div className="quran-mushaf-page">
                    <img
                      key={`left-${currentSpread.left}`}
                      src={getPageImageSrc(currentSpread.left, showTajweed)}
                      alt={`Page ${currentSpread.left}`}
                      className="quran-mushaf-image"
                      draggable={false}
                    />
                  </div>
                )}
              </div>

              <div className="quran-audio-bar">
                <button className="quran-audio-btn" onClick={handlePrevSurah} disabled={!selectedSurah || selectedSurah <= 1}>
                  <SkipBack size={16} />
                </button>
                <button
                  className={`quran-audio-btn quran-audio-play`}
                  onClick={() => {
                    if (playingAyah) {
                      stopAudio();
                    } else {
                      playSurah();
                    }
                  }}
                >
                  {playingAyah ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className="quran-audio-btn" onClick={stopAudio}>
                  <StopCircle size={16} />
                </button>
                <button className="quran-audio-btn" onClick={handleNextSurah} disabled={!selectedSurah || selectedSurah >= 114}>
                  <SkipForward size={16} />
                </button>
                <button
                  className={`quran-toggle-trans ${showTajweed ? "active" : ""}`}
                  onClick={() => setShowTajweed(!showTajweed)}
                >
                  {showTajweed ? "Tajweed On" : "Tajweed Off"}
                </button>
              </div>

              <div className="quran-page-nav">
                <button
                  className="quran-page-btn"
                  disabled={currentSpreadIdx >= totalSpreads - 1}
                  onClick={() => { stopAudio(); setCurrentSpreadIdx(currentSpreadIdx + 1); }}
                >
                  <ChevronLeft size={16} /> Next Spread
                </button>
                <span className="quran-page-info">
                  Spread {currentSpreadIdx + 1} of {totalSpreads}
                  {currentSpread.right && <> · Pages {currentSpread.right}{currentSpread.left ? `–${currentSpread.left}` : ""}</>}
                </span>
                <button
                  className="quran-page-btn"
                  disabled={currentSpreadIdx <= 0}
                  onClick={() => { stopAudio(); setCurrentSpreadIdx(currentSpreadIdx - 1); }}
                >
                  Previous Spread <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
