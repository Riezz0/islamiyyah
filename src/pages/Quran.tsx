import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Play, Pause, StopCircle, ChevronLeft, ChevronRight, ChevronDown, SkipBack, SkipForward, BookOpen } from "lucide-react";
import "./Quran.css";
import "./Page.css";

const QURAN_API = "https://api.quran.com/api/v4";
const QURANI_API = "https://api.qurani.ai/gw/qh/v1";

interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  translated_name: { name: string };
  verses_count: number;
  revelation_place: string;
  pages: [number, number];
  bismillah_pre: boolean;
}

interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  audio_url?: string;
  translations?: { text: string }[];
}

const SPEED_OPTIONS = [
  { value: "0.75", label: "0.75x" },
  { value: "1", label: "1x" },
  { value: "1.25", label: "1.25x" },
  { value: "1.5", label: "1.5x" },
  { value: "2", label: "2x" },
];

const TRANSLATION_OPTIONS = [
  { value: "20", label: "Saheeh International" },
  { value: "19", label: "M. Pickthall" },
  { value: "22", label: "Yusuf Ali" },
  { value: "85", label: "M.A.S. Abdel Haleem" },
  { value: "149", label: "Bridges' Translation" },
  { value: "84", label: "T. Usmani" },
];

function CustomSelect({ value, onChange, options, openUp }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; openUp?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`custom-select ${openUp ? "open-up" : ""}`}>
      <button className="method-select" onClick={() => setOpen(!open)}>
        <span>{selected?.label || value}</span>
        <ChevronDown size={14} className={`custom-select-chevron ${open ? "open" : ""}`} />
      </button>
      {open && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? "active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getArabicNumber(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => arabicDigits[parseInt(d)]).join("");
}

function getJuzLabel(juz: number): string {
  const arabicJuz = ["الْجُزْءُ", "الجزء"];
  return `${arabicJuz[1]} ${getArabicNumber(juz)}`;
}

// Surah List View
function SurahList({ chapters, loading, onSelect }: { chapters: Chapter[]; loading: boolean; onSelect: (ch: Chapter) => void }) {
  const [search, setSearch] = useState("");

  const filtered = chapters.filter((c) =>
    c.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    c.name_arabic.includes(search) ||
    String(c.id) === search
  );

  return (
    <div className="quran-surah-list">
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
        {loading ? (
          <div className="quran-loading">Loading surahs...</div>
        ) : (
          filtered.map((c) => (
            <button key={c.id} className="quran-surah-card" onClick={() => onSelect(c)}>
              <div className="quran-surah-num">{c.id}</div>
              <div className="quran-surah-info">
                <div className="quran-surah-name-row">
                  <span className="quran-surah-arabic">{c.name_arabic}</span>
                  <span className="quran-surah-english">{c.name_simple}</span>
                </div>
                <span className="quran-surah-detail">{c.translated_name.name} · {c.verses_count} verses</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Reader View
function ReaderView({
  chapter,
  verses,
  translation,
  setTranslation,
  translationOn,
  setTranslationOn,
  qiraat,
  setQiraat,
  currentVerseIndex,
  setCurrentVerseIndex,
  playing,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onStop,
  onPrevVerse,
  onNextVerse,
  onSurahBack,
  onSurahNext,
  chapters,
  onChapterSelect,
}: {
  chapter: Chapter;
  verses: Verse[];
  translation: string;
  setTranslation: (v: string) => void;
  translationOn: boolean;
  setTranslationOn: (v: boolean) => void;
  qiraat: "hafs" | "warsh";
  setQiraat: (v: "hafs" | "warsh") => void;
  currentVerseIndex: number;
  setCurrentVerseIndex: (i: number) => void;
  playing: boolean;
  speed: string;
  setSpeed: (v: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevVerse: () => void;
  onNextVerse: () => void;
  onSurahBack: () => void;
  onSurahNext: () => void;
  chapters: Chapter[];
  onChapterSelect: (ch: Chapter) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [versePage, setVersePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tajweed, setTajweed] = useState(false);
  const [showWarshText, setShowWarshText] = useState(false);
  const [mushafRightPage, setMushafRightPage] = useState(1);
  const [mushafLeftPage, setMushafLeftPage] = useState(2);
  const pickerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const contentRef = useRef<HTMLDivElement>(null);
  const arabicContentRef = useRef<HTMLDivElement>(null);
  const transPanelRef = useRef<HTMLDivElement>(null);

  const VERSES_PER_PAGE = 15;
  const totalVersePages = Math.ceil(verses.length / VERSES_PER_PAGE);
  const versePageIndex = (versePage - 1) * VERSES_PER_PAGE;
  const pageVerses = verses.slice(versePageIndex, versePageIndex + VERSES_PER_PAGE);

  // Calculate mushaf page for current verse page (for Warsh images)
  const currentMushafPage = pageVerses.length > 0 ? pageVerses[0].page_number : 1;
  const WARSH_IMAGES_BASE = tajweed ? "./warsh-tajweed" : "./warsh-normal";

  // Sync mushaf pages when verse page changes
  useEffect(() => {
    if (qiraat === "warsh") {
      const rp = currentMushafPage;
      const lp = rp + 1;
      setMushafRightPage(rp);
      setMushafLeftPage(lp <= 604 ? lp : rp);
    }
  }, [currentMushafPage, qiraat]);

  // Set initial mushaf pages when chapter changes
  useEffect(() => {
    if (qiraat === "warsh" && chapter) {
      const startPage = chapter.pages[0];
      const lp = startPage + 1;
      setMushafRightPage(startPage);
      setMushafLeftPage(lp <= 604 ? lp : startPage);
    }
  }, [chapter, qiraat]);

  const hasBismillah = chapter.id !== 9 && chapter.id !== 1 && chapter.bismillah_pre;

  const filteredChapters = chapters.filter((c) =>
    c.name_simple.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    c.name_arabic.includes(pickerSearch) ||
    String(c.id) === pickerSearch
  );

  // Reset verse page when chapter changes
  useEffect(() => {
    setVersePage(1);
  }, [chapter.id]);

  // Auto-scroll to current verse
  useEffect(() => {
    const el = verseRefs.current.get(currentVerseIndex);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentVerseIndex]);

  // Sync translation panel height to Arabic content height
  useEffect(() => {
    if (!translationOn || !arabicContentRef.current || !transPanelRef.current) return;
    const syncHeight = () => {
      if (arabicContentRef.current && transPanelRef.current) {
        // Arabic panel padding: 32px top+bottom, Translation: 24px. Difference = 16px
        const h = arabicContentRef.current.scrollHeight + 16;
        transPanelRef.current.style.height = `${h}px`;
      }
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(arabicContentRef.current);
    return () => observer.disconnect();
  }, [translationOn, pageVerses, currentVerseIndex]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setPickerSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePickerSelect = (ch: Chapter) => {
    onChapterSelect(ch);
    setShowPicker(false);
    setPickerSearch("");
    setVersePage(1);
  };

  return (
    <div className="quran-reader">
      {/* Surah Header */}
      <div className="quran-reader-header">
        <button
          className="quran-nav-arrow"
          disabled={chapter.id >= 114}
          onClick={onSurahNext}
          aria-label="Next surah"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="quran-header-center" ref={pickerRef}>
          <button className="quran-surah-title-btn" onClick={() => setShowPicker(!showPicker)}>
            <span className="quran-surah-title-arabic">{chapter.name_arabic}</span>
            <ChevronDown size={14} className={`quran-picker-chevron ${showPicker ? "open" : ""}`} />
          </button>
          <div className="quran-header-meta">
            <span>الآية: {chapter.verses_count} — صفحة: {chapter.pages[0]}–{chapter.pages[1]}</span>
          </div>
          <span className="quran-juz-badge">{getJuzLabel(verses[0]?.juz_number || 1)}</span>

          {showPicker && (
            <div className="quran-surah-picker">
              <div className="quran-picker-search-wrap">
                <Search size={14} className="quran-picker-search-icon" />
                <input
                  className="quran-picker-search"
                  placeholder="Search surahs..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="quran-picker-list">
                {filteredChapters.map((c) => (
                  <button
                    key={c.id}
                    className={`quran-picker-item ${c.id === chapter.id ? "active" : ""}`}
                    onClick={() => handlePickerSelect(c)}
                  >
                    <span className="quran-picker-num">{c.id}</span>
                    <span className="quran-picker-arabic">{c.name_arabic}</span>
                    <span className="quran-picker-english">{c.name_simple}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="quran-nav-arrow"
          disabled={chapter.id <= 1}
          onClick={onSurahBack}
          aria-label="Previous surah"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Translation Toggle */}
      <div className="quran-translation-bar">
        <button
          className={`quran-trans-toggle ${(qiraat === "warsh" && !tajweed) || showWarshText ? "active" : ""}`}
          onClick={() => { setQiraat("warsh"); setTajweed(false); setShowWarshText(false); }}
        >
          Warsh
        </button>
        {qiraat === "warsh" && (
          <>
          <button
            className={`quran-trans-toggle ${tajweed ? "active" : ""}`}
            onClick={() => { setTajweed(true); setShowWarshText(false); }}
          >
            Warsh Tajweed
          </button>
          <button
            className={`quran-trans-toggle ${showWarshText ? "active" : ""}`}
            onClick={() => { setShowWarshText(true); setTajweed(false); }}
          >
            Text
          </button>
          </>
        )}
        <button
          className={`quran-trans-toggle ${qiraat === "hafs" ? "active" : ""}`}
          onClick={() => { setQiraat("hafs"); setTajweed(false); setShowWarshText(false); }}
        >
          Hafs
        </button>
        <button
          className={`quran-trans-toggle ${translationOn ? "active" : ""}`}
          onClick={() => setTranslationOn(!translationOn)}
        >
          <BookOpen size={14} />
          {translationOn ? "Translation On" : "Translation Off"}
        </button>
        {translationOn && (
          <CustomSelect value={translation} onChange={setTranslation} options={TRANSLATION_OPTIONS} />
        )}
        <div className="quran-zoom-controls">
          <button className="quran-zoom-btn" onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}>−</button>
          <span className="quran-zoom-label">{Math.round(zoomLevel * 100)}%</span>
          <button className="quran-zoom-btn" onClick={() => setZoomLevel((z) => Math.min(3, z + 0.1))}>+</button>
        </div>
      </div>

      {/* Verse Content */}
      <div className={`quran-content ${translationOn ? "quran-content-split" : ""}`} ref={contentRef}>
        {/* Arabic Text Panel */}
        <div className="quran-arabic-panel">
          <div className="quran-arabic-scroll" style={{ overflow: "auto", maxHeight: "65vh" }}>
          <div ref={arabicContentRef} style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
          {qiraat === "warsh" && showWarshText ? (
            /* Warsh text mode: display verses as text like Hafs */
            <>
          {hasBismillah && versePage === 1 && (
            <div className="quran-bismillah">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
          )}
        <div className="quran-verses-flow" dir="rtl" lang="ar">
          {pageVerses.map((v, i) => {
            const globalIndex = versePageIndex + i;
            return (
              <span
                key={v.verse_key}
                ref={(el) => { if (el) verseRefs.current.set(globalIndex, el); }}
                className={`quran-verse-span ${globalIndex === currentVerseIndex && playing ? "quran-verse-active" : ""}`}
                onClick={() => {
                  setCurrentVerseIndex(globalIndex);
                  if (!playing) onPlay();
                }}
              >
                {v.text_uthmani}
                <span className="quran-verse-marker"> ﴿{getArabicNumber(v.verse_number)}﴾ </span>
              </span>
            );
          })}
        </div>
            </>
          ) : qiraat === "warsh" ? (
            <>
            <div className={`quran-warsh-pages ${chapter.id === 1 ? "single-page" : ""}`}>
              {chapter.id !== 1 && mushafLeftPage <= 604 && (
                <img
                  key={`left-${mushafLeftPage}`}
                  src={`${WARSH_IMAGES_BASE}/${mushafLeftPage}.jpg`}
                  alt={`Page ${mushafLeftPage}`}
                  className="quran-warsh-page-img"
                />
              )}
              <img
                key={`right-${mushafRightPage}`}
                src={`${WARSH_IMAGES_BASE}/${mushafRightPage}.jpg`}
                alt={`Page ${mushafRightPage}`}
                className="quran-warsh-page-img"
              />
            </div>
            </>
          ) : (
            <>
          {hasBismillah && versePage === 1 && (
            <div className="quran-bismillah">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
          )}
        <div className="quran-verses-flow" dir="rtl" lang="ar">
          {pageVerses.map((v, i) => {
            const globalIndex = versePageIndex + i;
            return (
              <span
                key={v.verse_key}
                ref={(el) => { if (el) verseRefs.current.set(globalIndex, el); }}
                className={`quran-verse-span ${globalIndex === currentVerseIndex && playing ? "quran-verse-active" : ""}`}
                onClick={() => {
                  setCurrentVerseIndex(globalIndex);
                  if (!playing) onPlay();
                }}
              >
                {v.text_uthmani}
                <span className="quran-verse-marker"> ﴿{getArabicNumber(v.verse_number)}﴾ </span>
              </span>
            );
          })}
        </div>
            </>
          )}
          </div>
          </div>

        {(totalVersePages > 1 || qiraat === "warsh") && (
          <div className="quran-verse-pagination">
            <button
              className="quran-page-btn"
              disabled={qiraat === "warsh" && !showWarshText ? mushafLeftPage >= 604 : versePage >= totalVersePages}
              onClick={() => {
                if (qiraat === "warsh" && !showWarshText) {
                  setMushafRightPage((p) => Math.min(p + 2, 603));
                  setMushafLeftPage((p) => Math.min(p + 2, 604));
                } else {
                  setVersePage((p) => p + 1);
                }
              }}
            >
              <ChevronLeft size={16} /> Next Page
            </button>
            <span className="quran-page-info">
              {qiraat === "warsh" && !showWarshText
                ? `${mushafRightPage}–${mushafLeftPage} / 604`
                : `${versePage} / ${totalVersePages}`}
            </span>
            <button
              className="quran-page-btn"
              disabled={qiraat === "warsh" && !showWarshText ? mushafRightPage <= 1 : versePage <= 1}
              onClick={() => {
                if (qiraat === "warsh" && !showWarshText) {
                  setMushafRightPage((p) => Math.max(p - 2, 1));
                  setMushafLeftPage((p) => Math.max(p - 2, 2));
                } else {
                  setVersePage((p) => p - 1);
                }
              }}
            >
              Previous Page <ChevronRight size={16} />
            </button>
          </div>
        )}
        </div>

        {/* Translation Panel */}
        {translationOn && (
          <div className="quran-translation-panel" ref={transPanelRef}>
            <div className="quran-translations-list" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
              {pageVerses.map((v, i) => {
                const globalIndex = versePageIndex + i;
                const t = v.translations?.[0]?.text;
                if (!t) return null;
                return (
                  <div
                    key={v.verse_key}
                    className={`quran-trans-item ${globalIndex === currentVerseIndex && playing ? "quran-trans-active" : ""}`}
                  >
                    <span className="quran-trans-num">{v.verse_number}</span>
                    <span className="quran-trans-text" dangerouslySetInnerHTML={{ __html: t }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Audio Controls */}
      <div className="quran-audio-controls">
        <button
          className="quran-ctrl-btn"
          onClick={onPrevVerse}
          disabled={currentVerseIndex <= 0}
          aria-label="Previous verse"
        >
          <SkipBack size={16} />
        </button>

        <button
          className="quran-ctrl-btn"
          onClick={onStop}
          aria-label="Stop"
        >
          <StopCircle size={16} />
        </button>

        <button className="quran-ctrl-play" onClick={playing ? onPause : onPlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          className="quran-ctrl-btn"
          onClick={onNextVerse}
          disabled={currentVerseIndex >= verses.length - 1}
          aria-label="Next verse"
        >
          <SkipForward size={16} />
        </button>

        <div className="quran-speed-wrap">
          <CustomSelect value={speed} onChange={setSpeed} options={SPEED_OPTIONS} openUp />
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function Quran() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [versesLoading, setVersesLoading] = useState(false);

  const [translation, setTranslation] = useState("20");
  const [translationOn, setTranslationOn] = useState(false);
  const [qiraat, setQiraat] = useState<"hafs" | "warsh">("hafs");
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVerseIndexRef = useRef(0);
  const playingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { currentVerseIndexRef.current = currentVerseIndex; }, [currentVerseIndex]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Fetch chapters on mount
  useEffect(() => {
    fetch(`${QURAN_API}/chapters`)
      .then((r) => r.json())
      .then((d) => setChapters(d.chapters))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch verses when chapter, translation, or qira'at changes
  useEffect(() => {
    if (!selectedChapter) return;
    setVersesLoading(true);

    if (qiraat === "warsh") {
      // Fetch Warsh text + Husary audio from qurani.ai
      fetch(`${QURANI_API}/surah/${selectedChapter.id}/editions/quran-warsh,ar.husary.warsh`)
        .then((r) => r.json())
        .then((d) => {
          const warshData = d.data.find((e: any) => e.edition.identifier === "quran-warsh");
          const audioData = d.data.find((e: any) => e.edition.identifier === "ar.husary.warsh");
          const audioMap: Record<number, string> = {};
          if (audioData) {
            for (const a of audioData.ayahs) {
              audioMap[a.numberInSurah] = a.audio;
            }
          }
          const mapped: Verse[] = warshData.ayahs.map((a: any) => ({
            id: a.number,
            verse_number: a.numberInSurah,
            verse_key: `${selectedChapter.id}:${a.numberInSurah}`,
            text_uthmani: a.text.replace(/^\ufeff/, ""),
            page_number: a.page,
            juz_number: a.juz,
            audio_url: audioMap[a.numberInSurah] || "",
          }));
          setVerses(mapped);
        })
        .catch(() => {})
        .finally(() => setVersesLoading(false));
    } else {
      // Fetch Hafs text + audio from quran.com (Mishary Alafasy)
      const transParam = translationOn ? `&translations=${translation}` : "";
      fetch(`${QURAN_API}/verses/by_chapter/${selectedChapter.id}?fields=text_uthmani&audio=7${transParam}&per_page=50&page=1`)
        .then((r) => r.json())
        .then(async (d) => {
          const totalPages = d.pagination.total_pages;
          let allVerses = d.verses;
          if (totalPages > 1) {
            const pagePromises = Array.from({ length: totalPages }, (_, i) =>
              fetch(`${QURAN_API}/verses/by_chapter/${selectedChapter.id}?fields=text_uthmani&audio=7${transParam}&per_page=50&page=${i + 1}`)
                .then((r) => r.json())
            );
            const pages = await Promise.all(pagePromises);
            allVerses = pages.flatMap((p) => p.verses);
          }
          setVerses(allVerses.map((v: any) => ({
            ...v,
            audio_url: v.audio?.url ? `https://verses.quran.com/${v.audio.url}` : "",
          })));
        })
        .catch(() => {})
        .finally(() => setVersesLoading(false));
    }
  }, [selectedChapter, translation, translationOn, qiraat]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
  }, []);

  const playVerse = useCallback((index: number) => {
    if (!selectedChapter || index < 0 || index >= verses.length) {
      stopAudio();
      return;
    }
    stopAudio();
    setCurrentVerseIndex(index);

    // Play per-ayah audio
    const verse = verses[index];
    if (!verse.audio_url) {
      setPlaying(false);
      return;
    }
    stopAudio();
    setCurrentVerseIndex(index);

    const audio = new Audio(verse.audio_url);
    audio.playbackRate = parseFloat(speed);
    audioRef.current = audio;

    audio.onended = () => {
      if (index < verses.length - 1) {
        playVerse(index + 1);
      } else {
        setPlaying(false);
        audioRef.current = null;
      }
    };

    audio.onerror = () => {
      if (index < verses.length - 1) {
        playVerse(index + 1);
      } else {
        setPlaying(false);
        audioRef.current = null;
      }
    };

    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [selectedChapter, verses, speed, stopAudio, qiraat]);

  const handlePlay = useCallback(() => {
    if (playingRef.current) return;
    playVerse(currentVerseIndexRef.current);
  }, [playVerse]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const handlePrevVerse = useCallback(() => {
    if (currentVerseIndexRef.current > 0) {
      playVerse(currentVerseIndexRef.current - 1);
    }
  }, [playVerse]);

  const handleNextVerse = useCallback(() => {
    if (currentVerseIndexRef.current < verses.length - 1) {
      playVerse(currentVerseIndexRef.current + 1);
    }
  }, [playVerse, verses.length]);

  const handleSurahBack = useCallback(() => {
    if (!selectedChapter || selectedChapter.id <= 1) return;
    stopAudio();
    const prev = chapters.find((c) => c.id === selectedChapter.id - 1);
    if (prev) {
      setSelectedChapter(prev);
      setCurrentVerseIndex(0);
    }
  }, [selectedChapter, chapters, stopAudio]);

  const handleSurahNext = useCallback(() => {
    if (!selectedChapter || selectedChapter.id >= 114) return;
    stopAudio();
    const next = chapters.find((c) => c.id === selectedChapter.id + 1);
    if (next) {
      setSelectedChapter(next);
      setCurrentVerseIndex(0);
    }
  }, [selectedChapter, chapters, stopAudio]);

  const handleChapterSelect = useCallback((ch: Chapter) => {
    stopAudio();
    setSelectedChapter(ch);
    setCurrentVerseIndex(0);
  }, [stopAudio]);

  const handleBack = useCallback(() => {
    stopAudio();
    setSelectedChapter(null);
    setCurrentVerseIndex(0);
  }, [stopAudio]);

  // Update playback speed on the fly
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(speed);
    }
  }, [speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedChapter) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playingRef.current) handlePause();
        else handlePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedChapter, handlePlay, handlePause]);

  // Surah list view
  if (!selectedChapter) {
    return (
      <div className="page page-quran">
        <h1 className="page-title">The Quran</h1>
        <SurahList chapters={chapters} loading={loading} onSelect={handleChapterSelect} />
      </div>
    );
  }

  // Reader view
  return (
    <div className="page page-quran">
      <div className="quran-reader-top">
        <button className="quran-back" onClick={handleBack}>
          <ChevronLeft size={20} /> Surahs
        </button>
      </div>

      {versesLoading ? (
        <div className="quran-loading">Loading verses...</div>
      ) : (
        <ReaderView
          chapter={selectedChapter}
          verses={verses}
          translation={translation}
          setTranslation={setTranslation}
          translationOn={translationOn}
          setTranslationOn={setTranslationOn}
          qiraat={qiraat}
          setQiraat={setQiraat}
          currentVerseIndex={currentVerseIndex}
          setCurrentVerseIndex={setCurrentVerseIndex}
          playing={playing}
          speed={speed}
          setSpeed={setSpeed}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={stopAudio}
          onPrevVerse={handlePrevVerse}
          onNextVerse={handleNextVerse}
          onSurahBack={handleSurahBack}
          onSurahNext={handleSurahNext}
          chapters={chapters}
          onChapterSelect={handleChapterSelect}
        />
      )}
    </div>
  );
}
