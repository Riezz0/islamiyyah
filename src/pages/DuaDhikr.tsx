import { useState } from "react";
import { ChevronDown, ExternalLink, BookOpen } from "lucide-react";
import duaDhikrData from "../data/dua_dhikr.json";
import "./DuaDhikr.css";
import "./Page.css";

interface Evidence {
  title: string;
  source: string;
  sourceLabel: string;
  arabicChain: string;
  arabicHadith: string;
  translation: string;
  grading: string;
}

interface DuaItem {
  id: number;
  category: string;
  title: string;
  arabic: string;
  translation: string;
  repetition: string | null;
  evidence: Evidence | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

function DuaCard({ item }: { item: DuaItem }) {
  const [duaOpen, setDuaOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <div className={`dua-card ${duaOpen ? "dua-card--open" : ""}`}>
      <button
        className="dua-header"
        onClick={() => setDuaOpen(!duaOpen)}
      >
        <div className="dua-header-left">
          <span className="dua-number">{item.id}</span>
          <span className="dua-title">{item.title}</span>
        </div>
        <ChevronDown
          size={20}
          className={`dua-chevron ${duaOpen ? "dua-chevron--open" : ""}`}
        />
      </button>

      {duaOpen && (
        <div className="dua-body">
          <div className="dua-arabic" lang="ar" dir="rtl">{item.arabic}</div>
          <div className="dua-translation">{item.translation}</div>

          {item.evidence && (
            <div className="evidence-section">
              <button
                className="evidence-header"
                onClick={(e) => {
                  e.stopPropagation();
                  setEvidenceOpen(!evidenceOpen);
                }}
              >
                <div className="evidence-header-left">
                  <BookOpen size={16} />
                  <span>{item.evidence!.title}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`dua-chevron ${evidenceOpen ? "dua-chevron--open" : ""}`}
                />
              </button>

              {evidenceOpen && (
                <div className="evidence-body">
                  <button
                    className="evidence-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.electronAPI?.openUrl(item.evidence!.source);
                    }}
                  >
                    <ExternalLink size={14} />
                    {item.evidence!.sourceLabel}
                  </button>

                  <div className="evidence-chain" lang="ar" dir="rtl">{item.evidence!.arabicChain}</div>
                  <div className="evidence-hadith-arabic" lang="ar" dir="rtl">{item.evidence!.arabicHadith}</div>
                  <div className="evidence-translation">{item.evidence!.translation}</div>

                  {item.evidence!.grading && (
                    <div className="evidence-grading" lang="ar" dir="rtl">{item.evidence!.grading}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DuaDhikr() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categories: Category[] = duaDhikrData.categories;

  const activeCat = categories.find((c) => c.id === activeCategory);
  const filteredItems =
    activeCategory === "all"
      ? duaDhikrData.items
      : duaDhikrData.items.filter((item) => item.category === activeCategory);

  return (
    <div className="page page-dua">
      <h1 className="page-title">Dua & Dhikr</h1>

      <div className="dua-categories">
        <button
          className={`dua-cat-tab ${activeCategory === "all" ? "dua-cat-tab--active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`dua-cat-tab ${activeCategory === cat.id ? "dua-cat-tab--active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {activeCat && activeCategory !== "all" && (
        <div className="dua-intro">
          <h2 className="dua-section-title">{activeCat.name}</h2>
          <p className="dua-section-desc">{activeCat.description}</p>
        </div>
      )}

      <div className="dua-list">
        {filteredItems.map((item) => (
          <DuaCard key={item.id} item={item} />
        ))}
        {filteredItems.length === 0 && (
          <div className="page-card">
            <p className="muted">No duas in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
