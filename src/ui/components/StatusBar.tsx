import React from "react";

interface StatusBarProps {
  wordCount: number;
  charCount: number;
  isDirty?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount, isDirty = false }) => {
  return (
    <footer className="status-bar">
      <div className="save-state">
        <span className={`save-state-dot ${isDirty ? "is-dirty" : ""}`} />
        {isDirty ? "Modifications non enregistrées" : "Document à jour"}
      </div>
      <div className="status-metrics">
        <span>{wordCount} {wordCount === 1 ? "mot" : "mots"}</span>
        <span className="status-separator" />
        <span>{charCount} {charCount === 1 ? "caractère" : "caractères"}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
