import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Moon,
  BookMarked,
  HandHeart,
  CalendarDays,
  Info,
  Settings,
} from "lucide-react";
import "./Sidebar.css";

const links = [
  { to: "/", label: "Prayer Times", icon: Moon, section: "prayer" },
  { to: "/quran", label: "Quran", icon: BookOpen, section: "quran" },
  { to: "/hadith", label: "Hadith", icon: BookMarked, section: "hadith" },
  { to: "/dua-dhikr", label: "Dua & Dhikr", icon: HandHeart, section: "dua" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, section: "calendar" },
  { to: "/how-to-pray", label: "How to Pray", icon: Info, section: "pray" },
];

const bottomLinks = [
  { to: "/settings", label: "Settings", icon: Settings, section: "settings" },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-arabic">Islamiyyah</span>
      </div>
      <div className="sidebar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-section={link.section}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-bottom">
        {bottomLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-section={link.section}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
