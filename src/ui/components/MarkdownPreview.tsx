import React, { useEffect, useState } from "react";
import { renderMarkdownHtml } from "../../application/markdown/renderHtml";
import { useI18n } from "../i18n";

interface MarkdownPreviewProps {
  content: string;
  paneRef?: React.RefObject<HTMLElement | null>;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, paneRef }) => {
  const { t } = useI18n();
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void renderMarkdownHtml(content).then((rendered) => {
        if (!cancelled) setHtml(rendered);
      });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [content]);

  return (
    <section ref={paneRef} className="markdown-preview-pane" aria-label={t("preview")}>
      <article className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
};

export default MarkdownPreview;
