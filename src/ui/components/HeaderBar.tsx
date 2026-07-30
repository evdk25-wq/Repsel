import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import MenuBar from "./MenuBar";
import repselLogo from "../../assets/RepselLogoUI.png";
import { useI18n } from "../i18n";

interface HeaderBarProps {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onClear: () => void;
  onClose: () => void;
  title?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onOpen, onSave, onSaveAs, onExport, onClear, onClose, title = "Repsel" }) => {
  const appWindow = getCurrentWindow();
  const { t } = useI18n();

  return (
    <header className="app-header" data-tauri-drag-region>
      <div className="header-leading">
        <div className="brand-mark" aria-label="Repsel">
          <img src={repselLogo} alt="" />
        </div>
        <MenuBar onOpen={onOpen} onSave={onSave} onSaveAs={onSaveAs} onExport={onExport} onClear={onClear} />
      </div>

      <div className="document-title">
        {title}
      </div>

      <div className="header-actions">
        <button onClick={onOpen} className="header-tool" title={t("openDocument")}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3.5 5.5h4l1.5 2h7.5v7.25a1.75 1.75 0 0 1-1.75 1.75H5.25a1.75 1.75 0 0 1-1.75-1.75V5.5Z" />
            <path d="M3.5 8h13" />
          </svg>
        </button>
        <button onClick={onSave} className="header-tool header-tool-primary" title={t("save")}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 3.5h10.25L16.5 5.75V16.5h-13v-13Z" />
            <path d="M6.5 3.5v5h7v-5M6.5 16.5v-5h7v5" />
          </svg>
        </button>
        <div className="header-separator" />
        <button
          onClick={() => appWindow.minimize()}
          className="window-control"
          title={t("minimize")}
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="7" width="10" height="2" />
          </svg>
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="window-control"
          title={t("maximize")}
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M3 3h10v10H3V3zm2 2v6h6V5H5z" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="window-control window-control-close"
          title={t("close")}
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
