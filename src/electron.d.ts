interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  getPywalColors: () => Promise<{
    special: { background: string; foreground: string; cursor: string };
    colors: Record<string, string>;
  } | null>;
  getPywalMtime: () => Promise<number>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
