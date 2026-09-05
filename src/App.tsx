import { HashRouter, Routes, Route } from "react-router-dom";
import { usePywal } from "./hooks/usePywal";
import { useSettings } from "./hooks/useSettings";
import TitleBar from "./components/TitleBar";
import Layout from "./components/Layout";
import PrayerTimes from "./pages/PrayerTimes";
import Quran from "./pages/Quran";
import Hadith from "./pages/Hadith";
import DuaDhikr from "./pages/DuaDhikr";
import Calendar from "./pages/Calendar";
import HowToPray from "./pages/HowToPray";
import SettingsPage from "./pages/Settings";

export default function App() {
  const { settings, updateSettings } = useSettings();
  usePywal();

  return (
    <HashRouter>
      <TitleBar />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PrayerTimes />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/hadith" element={<Hadith />} />
          <Route path="/dua-dhikr" element={<DuaDhikr />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/how-to-pray" element={<HowToPray />} />
          <Route
            path="/settings"
            element={
              <SettingsPage settings={settings} onUpdate={updateSettings} />
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}
