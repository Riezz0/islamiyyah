import { useCallback } from "react";
import { Minus, Square, X } from "lucide-react";
import "./TitleBar.css";

export default function TitleBar() {
  const handleMinimize = useCallback(() => {
    window.electronAPI?.minimize();
  }, []);

  const handleMaximize = useCallback(() => {
    window.electronAPI?.maximize();
  }, []);

  const handleClose = useCallback(() => {
    window.electronAPI?.close();
  }, []);

  return (
    <div className="titlebar" style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
      <div className="titlebar-title" style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        Islamiyyah
      </div>
      <div className="titlebar-controls" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <button className="titlebar-btn titlebar-minimize" onClick={handleMinimize}>
          <Minus size={14} />
        </button>
        <button className="titlebar-btn titlebar-maximize" onClick={handleMaximize}>
          <Square size={12} />
        </button>
        <button className="titlebar-btn titlebar-close" onClick={handleClose}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
