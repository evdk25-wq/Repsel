import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n";

interface MenuBarProps {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onClear: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onOpen, onSave, onSaveAs, onExport, onClear }) => {
  const { locale, setLocale, t } = useI18n();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAction = (action: () => void) => {
    setActiveMenu(null);
    action();
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem("repsel-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    setActiveMenu(null);
  };


  return (
    <nav ref={menuRef} className="menu-bar" aria-label={t("mainMenu")}>
      
      <div className="relative h-full flex items-center">
        <button
          onClick={() => toggleMenu("fichier")}
          className={`menu-trigger ${activeMenu === "fichier" ? "is-active" : ""}`}
        >
          {t("file")}
        </button>
        {activeMenu === "fichier" && (
          <div className="menu-popover">
            <button onClick={() => handleAction(onOpen)} className="menu-item">
              <span>{t("open")}</span>
              <span className="opacity-50 text-xs">Ctrl+O</span>
            </button>
            <button onClick={() => handleAction(onSave)} className="menu-item">
              <span>{t("save")}</span>
              <span className="opacity-50 text-xs">Ctrl+S</span>
            </button>
            <button onClick={() => handleAction(onSaveAs)} className="menu-item">
              <span>{t("saveAs")}</span>
              <span className="opacity-50 text-xs">Ctrl+Maj+S</span>
            </button>
            <div className="menu-divider" />
            <button onClick={() => handleAction(onExport)} className="menu-item">
              {t("exportPdf")}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-full flex items-center">
        <button
          onClick={() => toggleMenu("edition")}
          className={`menu-trigger ${activeMenu === "edition" ? "is-active" : ""}`}
        >
          {t("edit")}
        </button>
        {activeMenu === "edition" && (
          <div className="menu-popover">
            <button onClick={() => handleAction(onClear)} className="menu-item menu-item-danger">
              {t("newDocument")}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-full flex items-center">
        <button
          onClick={() => toggleMenu("reglages")}
          className={`menu-trigger ${activeMenu === "reglages" ? "is-active" : ""}`}
        >
          {t("settings")}
        </button>
        {activeMenu === "reglages" && (
          <div className="menu-popover">
            <button onClick={toggleDarkMode} className="menu-item">
              {t("toggleTheme")}
            </button>
            <div className="menu-divider" />
            <div className="menu-section-label">{t("language")}</div>
            <button onClick={() => handleAction(() => setLocale("fr"))} className={`menu-item ${locale === "fr" ? "is-selected" : ""}`}>
              <span>{t("french")}</span>
              <span className="menu-language-code">FR</span>
            </button>
            <button onClick={() => handleAction(() => setLocale("en"))} className={`menu-item ${locale === "en" ? "is-selected" : ""}`}>
              <span>{t("english")}</span>
              <span className="menu-language-code">EN</span>
            </button>
          </div>
        )}
      </div>

    </nav>
  );
};

export default MenuBar;
