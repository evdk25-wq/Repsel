import React from "react";
import { useI18n } from "../i18n";

interface StatusBarProps {
  wordCount: number;
  charCount: number;
  isDirty?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount, isDirty = false }) => {
  const { t } = useI18n();
  return (
    <footer className="status-bar">
      <div className="save-state">
        <span className={`save-state-dot ${isDirty ? "is-dirty" : ""}`} />
        {isDirty ? t("unsaved") : t("upToDate")}
      </div>
      <div className="status-metrics">
        <span>{wordCount} {wordCount === 1 ? t("word") : t("words")}</span>
        <span className="status-separator" />
        <span>{charCount} {charCount === 1 ? t("character") : t("characters")}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
