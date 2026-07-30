import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "./i18n";

const LanguageProbe = () => {
  const { locale, setLocale, t } = useI18n();
  return (
    <>
      <span>{locale}</span>
      <strong>{t("welcome")}</strong>
      <button onClick={() => setLocale("en")}>EN</button>
    </>
  );
};

describe("i18n", () => {
  beforeEach(() => localStorage.clear());

  it("changes language immediately and persists the choice", () => {
    localStorage.setItem("repsel-locale", "fr");
    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("Bienvenue dans Repsel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("Welcome to Repsel")).toBeInTheDocument();
    expect(localStorage.getItem("repsel-locale")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });
});
