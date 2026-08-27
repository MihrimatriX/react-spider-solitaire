import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Seo from "../../src/ui/Seo";
import { SEO } from "../../src/seo";

const renderSeo = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Seo />
    </MemoryRouter>,
  );

describe("Seo", () => {
  it("sets the home title and description", () => {
    document.head.innerHTML = `<meta name="description" content="">`;
    renderSeo("/");
    expect(document.title).toBe(SEO.home.title);
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute("content"),
    ).toBe(SEO.home.description);
  });

  it("sets the game title on /game", () => {
    document.head.innerHTML = `<meta name="description" content="">`;
    renderSeo("/game");
    expect(document.title).toBe(SEO.game.title);
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute("content"),
    ).toBe(SEO.game.description);
  });
});
