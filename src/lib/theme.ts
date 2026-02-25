export const THEME_STORAGE_KEY = "anotai-theme";

export type ThemeMode = "light" | "dark";

export const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = stored === "dark" || stored === "light"
      ? stored
      : (systemPrefersDark ? "dark" : "light");

    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
  } catch {}
})();
`;
