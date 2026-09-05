import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Bookmark, Crosshair, Loader, ChevronDown } from "lucide-react";
import "./PrayerTimes.css";
import "./Page.css";

const API_KEY = "umh_11659067db985b9d39d4ad88da306f8eb6e12909";
const API_BASE = "https://ummahapi.com/api";

const PRAYER_ARABIC: Record<string, string> = {
  Fajr: "\u{0627}\u{0644}\u{0641}\u{062C}\u{0631}",
  Sunrise: "\u{0627}\u{0644}\u{0634}\u{0631}\u{0648}\u{0642}",
  Dhuhr: "\u{0627}\u{0644}\u{0638}\u{0647}\u{0631}",
  Asr: "\u{0627}\u{0644}\u{0639}\u{0635}\u{0631}",
  Maghrib: "\u{0627}\u{0644}\u{0645}\u{063A}\u{0631}\u{0628}",
  Isha: "\u{0627}\u{0644}\u{0639}\u{0634}\u{0627}\u{0621}",
};

const METHOD_OPTIONS = [
  { value: "MuslimWorldLeague", label: "Muslim World League" },
  { value: "Egyptian", label: "Egyptian General Authority" },
  { value: "Karachi", label: "University of Islamic Sciences, Karachi" },
  { value: "UmmAlQura", label: "Umm Al-Qura, Makkah" },
  { value: "Dubai", label: "Dubai" },
  { value: "MoonsightingCommittee", label: "Moon Sighting Committee" },
  { value: "NorthAmerica", label: "ISNA (North America)" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Qatar", label: "Qatar" },
  { value: "Singapore", label: "Singapore" },
  { value: "Tehran", label: "Tehran" },
  { value: "Turkey", label: "Turkey" },
  { value: "Diyanet", label: "Diyanet" },
  { value: "JAKIM", label: "JAKIM (Malaysia)" },
  { value: "Gulf", label: "Gulf Region" },
];

interface SavedLocation {
  name: string;
  lat: number;
  lng: number;
  method: string;
}

interface CityResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    date: string;
    timezone: string;
    calculation_method: string;
    madhab: string;
    prayer_times: {
      imsak: string;
      fajr: string;
      sunrise: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
    };
    prayer_datetimes: {
      imsak: string;
      fajr: string;
      sunrise: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
    };
    islamic_info?: {
      hijri_date?: string;
    };
  };
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
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

export default function PrayerTimesPage() {
  const [locationTab, setLocationTab] = useState<
    "gps" | "coordinates" | "city" | "saved"
  >("gps");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [method, setMethod] = useState<string>("MuslimWorldLeague");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string>("");
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [saveName, setSaveName] = useState("");
  const [today] = useState(new Date());
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("savedLocations");
    if (saved) setSavedLocations(JSON.parse(saved));
    const lastLoc = localStorage.getItem("lastLocation");
    if (lastLoc) {
      const loc = JSON.parse(lastLoc);
      setLat(loc.lat);
      setLng(loc.lng);
      setLocationName(
        loc.name || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`
      );
    }
    const lastMethod = localStorage.getItem("lastMethod");
    if (lastMethod) setMethod(lastMethod);
  }, []);

  useEffect(() => {
    if (lat !== null && lng !== null) {
      fetchPrayerTimesApi(lat, lng);
    }
  }, [lat, lng, method]);

  const fetchPrayerTimesApi = async (latitude: number, longitude: number) => {
    setApiLoading(true);
    setApiError("");
    try {
      const dateStr = today.toISOString().split("T")[0];
      const url = `${API_BASE}/prayer-times?lat=${latitude}&lng=${longitude}&date=${dateStr}&method=${method}&madhab=Hanafi&apikey=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data?.prayer_times) {
        throw new Error("Invalid API response");
      }
      setApiData(json);
      localStorage.setItem(
        "lastLocation",
        JSON.stringify({ lat: latitude, lng: longitude, name: locationName })
      );
      localStorage.setItem("lastMethod", method);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to fetch prayer times"
      );
      setApiData(null);
    }
    setApiLoading(false);
  };

  const handleGps = async () => {
    setGpsLoading(true);
    setGpsError("");
    try {
      // Try browser geolocation first
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000,
          });
        });
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
        setLocationTab("gps");
        setGpsLoading(false);
        return;
      } catch {
        // Browser geolocation failed, fall through to IP-based
      }

      // Fallback: IP-based geolocation via ip-api.com
      const res = await fetch("http://ip-api.com/json/?fields=status,country,city,lat,lon");
      const data = await res.json();
      if (data.status === "success") {
        setLat(data.lat);
        setLng(data.lon);
        setLocationName(`${data.city}, ${data.country}`);
        setLocationTab("gps");
      } else {
        setGpsError("Could not determine location. Use the City or Coordinates tab.");
      }
    } catch {
      setGpsError("Could not determine location. Use the City or Coordinates tab.");
    }
    setGpsLoading(false);
  };

  const handleCoordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(coordLat);
    const longitude = parseFloat(coordLng);
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return;
    }
    setLat(latitude);
    setLng(longitude);
    setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
  };

  const handleCitySearch = (value: string) => {
    setCityInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setCityResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setCityLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`
        );
        const data = await res.json();
        setCityResults(data.results || []);
      } catch {
        setCityResults([]);
      }
      setCityLoading(false);
    }, 400);
  };

  const handleCitySelect = (city: CityResult) => {
    setLat(city.latitude);
    setLng(city.longitude);
    setLocationName(`${city.name}, ${city.country}`);
    setCityResults([]);
    setCityInput(city.name);
  };

  const handleSavedSelect = (loc: SavedLocation) => {
    setLat(loc.lat);
    setLng(loc.lng);
    setLocationName(loc.name);
    setMethod(loc.method);
  };

  const handleSaveLocation = () => {
    if (lat === null || lng === null || !saveName.trim()) return;
    const newLoc: SavedLocation = {
      name: saveName.trim(),
      lat,
      lng,
      method,
    };
    const updated = [...savedLocations, newLoc];
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
    setSaveName("");
  };

  const handleDeleteSaved = (index: number) => {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  };

  const prayers = apiData?.data
    ? [
        { name: "Fajr", time: apiData.data.prayer_times.fajr, datetime: apiData.data.prayer_datetimes.fajr },
        { name: "Sunrise", time: apiData.data.prayer_times.sunrise, datetime: apiData.data.prayer_datetimes.sunrise },
        { name: "Dhuhr", time: apiData.data.prayer_times.dhuhr, datetime: apiData.data.prayer_datetimes.dhuhr },
        { name: "Asr", time: apiData.data.prayer_times.asr, datetime: apiData.data.prayer_datetimes.asr },
        { name: "Maghrib", time: apiData.data.prayer_times.maghrib, datetime: apiData.data.prayer_datetimes.maghrib },
        { name: "Isha", time: apiData.data.prayer_times.isha, datetime: apiData.data.prayer_datetimes.isha },
      ]
    : [];

  const now = new Date();
  const nextPrayerIdx = apiData?.data
    ? (() => {
        const dts = apiData.data.prayer_datetimes;
        const times = [dts.fajr, dts.sunrise, dts.dhuhr, dts.asr, dts.maghrib, dts.isha];
        for (let i = 0; i < times.length; i++) {
          if (now < new Date(times[i])) return i;
        }
        return -1;
      })()
    : -1;

  return (
    <div className="page page-prayer">
      <h1 className="page-title">Prayer Times</h1>

      <div className="prayer-times-header">
        <div className="prayer-date">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {apiData?.data?.islamic_info?.hijri_date && (
            <span className="prayer-hijri-date"> | {apiData.data.islamic_info.hijri_date}</span>
          )}
        </div>
        <div className="prayer-method">
          <CustomSelect
            value={method}
            onChange={setMethod}
            options={METHOD_OPTIONS}
          />
        </div>
      </div>

      {locationName && (
        <div className="location-status">
          <MapPin size={14} />
          <span>{locationName}</span>
        </div>
      )}

      <div className="location-tabs">
        <button
          className={`location-tab ${locationTab === "gps" ? "active" : ""}`}
          onClick={() => setLocationTab("gps")}
        >
          <Crosshair size={14} />
          GPS
        </button>
        <button
          className={`location-tab ${locationTab === "coordinates" ? "active" : ""}`}
          onClick={() => setLocationTab("coordinates")}
        >
          <MapPin size={14} />
          Coordinates
        </button>
        <button
          className={`location-tab ${locationTab === "city" ? "active" : ""}`}
          onClick={() => setLocationTab("city")}
        >
          <Search size={14} />
          City
        </button>
        <button
          className={`location-tab ${locationTab === "saved" ? "active" : ""}`}
          onClick={() => setLocationTab("saved")}
        >
          <Bookmark size={14} />
          Saved
        </button>
      </div>

      <div className="location-panel">
        {locationTab === "gps" && (
          <div className="gps-panel">
            <button
              className="gps-button"
              onClick={handleGps}
              disabled={gpsLoading}
            >
              {gpsLoading ? (
                <>
                  <Loader size={16} className="spin" />
                  Locating...
                </>
              ) : (
                <>
                  <Crosshair size={16} />
                  Use GPS Location
                </>
              )}
            </button>
            {gpsError && <div className="gps-error">{gpsError}</div>}
          </div>
        )}

        {locationTab === "coordinates" && (
          <form className="coord-form" onSubmit={handleCoordSubmit}>
            <div className="coord-fields">
              <div className="coord-field">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="e.g. 21.4225"
                  value={coordLat}
                  onChange={(e) => setCoordLat(e.target.value)}
                />
              </div>
              <div className="coord-field">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="e.g. -39.8262"
                  value={coordLng}
                  onChange={(e) => setCoordLng(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="coord-submit">
              Get Prayer Times
            </button>
          </form>
        )}

        {locationTab === "city" && (
          <div className="city-search-panel">
            <div className="city-input-wrapper">
              <Search size={16} className="city-search-icon" />
              <input
                type="text"
                placeholder="Search city name..."
                value={cityInput}
                onChange={(e) => handleCitySearch(e.target.value)}
                className="city-input"
              />
              {cityLoading && (
                <Loader size={16} className="city-loading spin" />
              )}
            </div>
            {cityResults.length > 0 && (
              <div className="city-results">
                {cityResults.map((city, i) => (
                  <button
                    key={i}
                    className="city-result"
                    onClick={() => handleCitySelect(city)}
                  >
                    <span className="city-result-name">{city.name}</span>
                    <span className="city-result-detail">
                      {city.admin1 ? `${city.admin1}, ` : ""}
                      {city.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {locationTab === "saved" && (
          <div className="saved-panel">
            {lat !== null && lng !== null && (
              <div className="save-form">
                <input
                  type="text"
                  placeholder="Location name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="save-input"
                />
                <button
                  className="save-button"
                  onClick={handleSaveLocation}
                  disabled={!saveName.trim()}
                >
                  Save Current
                </button>
              </div>
            )}
            {savedLocations.length > 0 ? (
              <div className="saved-list">
                {savedLocations.map((loc, i) => (
                  <div key={i} className="saved-item">
                    <button
                      className="saved-item-main"
                      onClick={() => handleSavedSelect(loc)}
                    >
                      <Bookmark size={14} />
                      <span className="saved-item-name">{loc.name}</span>
                      <span className="saved-item-coords">
                        {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                      </span>
                    </button>
                    <button
                      className="saved-item-delete"
                      onClick={() => handleDeleteSaved(i)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: "15px" }}>
                No saved locations yet. Set a location first, then save it here.
              </p>
            )}
          </div>
        )}
      </div>

      {apiLoading && (
        <div className="prayer-times-loading">
          <Loader size={24} className="spin" />
          <span>Fetching prayer times...</span>
        </div>
      )}

      {apiError && !apiLoading && (
        <div className="prayer-times-error page-card">
          <p style={{ color: "var(--danger)" }}>{apiError}</p>
        </div>
      )}

      {prayers.length > 0 && !apiLoading && (
        <div className="prayer-card">
          <div className="prayer-card-header">
            <span className="prayer-card-title">PRAYER TIMES</span>
            <span className="prayer-card-location">{locationName}</span>
          </div>
          <div className="prayer-card-divider" />
          <div className="prayer-times-list">
            {prayers.map((prayer, i) => (
              <div
                key={prayer.name}
                className={`prayer-item ${i === nextPrayerIdx ? "next-prayer" : ""}`}
              >
                <span className="prayer-item-name">{prayer.name}</span>
                <span className="prayer-item-arabic" lang="ar">{PRAYER_ARABIC[prayer.name]}</span>
                <span className="prayer-item-time">{prayer.time}</span>
              </div>
            ))}
          </div>
          <div className="prayer-card-divider" />
          <div className="prayer-card-footer">Powered by UmmahAPI</div>
        </div>
      )}

      {prayers.length === 0 && !apiLoading && !apiError && (
        <div className="prayer-times-empty page-card">
          <p className="muted">
            Use one of the location methods above to view prayer times.
          </p>
        </div>
      )}
    </div>
  );
}
