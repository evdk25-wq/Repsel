import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBar from "./StatusBar";

describe("StatusBar Component", () => {
  it("renders with 0 words and 0 characters initially", () => {
    render(<StatusBar wordCount={0} charCount={0} />);
    expect(screen.getByText("0 mots")).toBeInTheDocument();
    expect(screen.getByText("0 caractères")).toBeInTheDocument();
  });

  it("renders correct counts for non-zero values", () => {
    render(<StatusBar wordCount={42} charCount={256} />);
    expect(screen.getByText("42 mots")).toBeInTheDocument();
    expect(screen.getByText("256 caractères")).toBeInTheDocument();
  });

  it("handles singular word count correctly", () => {
    render(<StatusBar wordCount={1} charCount={5} />);
    expect(screen.getByText("1 mot")).toBeInTheDocument();
    expect(screen.getByText("5 caractères")).toBeInTheDocument();
  });
});
