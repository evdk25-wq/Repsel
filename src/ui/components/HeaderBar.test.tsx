import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeaderBar from "./HeaderBar";

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    close: vi.fn(),
  }),
}));

describe("HeaderBar Component", () => {
  it("renders the default title when none is provided", () => {
    render(<HeaderBar onOpen={() => {}} onSave={() => {}} onSaveAs={() => {}} onExport={() => {}} onClear={() => {}} />);
    expect(screen.getByText("Repsel")).toBeInTheDocument();
  });

  it("renders the provided document title", () => {
    render(<HeaderBar title="My Document.md" onOpen={() => {}} onSave={() => {}} onSaveAs={() => {}} onExport={() => {}} onClear={() => {}} />);
    expect(screen.getByText("My Document.md")).toBeInTheDocument();
  });

  it("calls callback functions when buttons are clicked", () => {
    const handleOpen = vi.fn();
    const handleSave = vi.fn();
    const handleExport = vi.fn();
    const handleClear = vi.fn();
    const handleSaveAs = vi.fn();

    render(<HeaderBar onOpen={handleOpen} onSave={handleSave} onSaveAs={handleSaveAs} onExport={handleExport} onClear={handleClear} />);

    fireEvent.click(screen.getByText("Fichier"));
    fireEvent.click(screen.getByText("Ouvrir…"));
    expect(handleOpen).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Fichier"));
    fireEvent.click(screen.getByText("Sauvegarder"));
    expect(handleSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Fichier"));
    fireEvent.click(screen.getByText("Enregistrer sous…"));
    expect(handleSaveAs).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Fichier"));
    fireEvent.click(screen.getByText("Exporter en PDF"));
    expect(handleExport).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText("Édition"));
    fireEvent.click(screen.getByText("Nouveau"));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
