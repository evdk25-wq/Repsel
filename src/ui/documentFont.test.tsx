import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DocumentFontProvider, useDocumentFont } from "./documentFont";

const FontProbe = () => {
  const { typography, saveTypography } = useDocumentFont();
  return (
    <>
      <span>{typography.family}</span>
      <span>{typography.size}</span>
      <button onClick={() => saveTypography({ family: "IBM Plex Mono", size: 18, lineHeight: "comfortable" })}>Apply</button>
    </>
  );
};

describe("document typography", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty("--font-document");
    document.documentElement.style.removeProperty("--font-document-size");
  });

  it("persists and applies the selected typography", () => {
    render(
      <DocumentFontProvider>
        <FontProbe />
      </DocumentFontProvider>,
    );

    expect(screen.getByText("Source Serif 4 Variable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("IBM Plex Mono")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(localStorage.getItem("repsel-document-typography")).toContain("IBM Plex Mono");
    expect(document.documentElement.style.getPropertyValue("--font-document-size")).toBe("18px");
  });
});
