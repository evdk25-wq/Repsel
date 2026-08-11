import React from "react";
import { useI18n } from "../i18n";

interface StatusBarProps {
  wordCount: number;
  charCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount }) => {
  const { t } = useI18n();
  return (
    <footer className="status-bar">
      <div className="status-metrics">
        <span>{wordCount} {wordCount === 1 ? t("word") : t("words")}</span>
        <span className="status-separator" />
        <span>{charCount} {charCount === 1 ? t("character") : t("characters")}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
