import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import "./CustomSelect.css";

export default function CustomSelect({ value, onChange, options, compact }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  compact?: boolean;
}) {
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
    <div ref={ref} className="custom-select">
      <button
        className={`custom-select-trigger ${compact ? "compact" : ""}`}
        onClick={() => setOpen(!open)}
      >
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
