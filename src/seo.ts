export const SITE_NAME = "Spider Solitaire";

export const DEFAULT_DESCRIPTION =
  "Play Spider Solitaire online for free. Classic card game with hints, undo, and a timer. Build eight King-to-Ace runs to win.";

export const SEO = {
  home: {
    title: "Spider Solitaire | Play Classic Solitaire",
    description: DEFAULT_DESCRIPTION,
  },
  game: {
    title: "Play Spider Solitaire",
    description:
      "Deal, sequence, and complete eight King-to-Ace runs. Hints, undo, and a timer included.",
  },
} as const;

export function seoForPath(pathname: string): (typeof SEO)[keyof typeof SEO] {
  return pathname === "/game" ? SEO.game : SEO.home;
}
