import { useEffect, useState } from "react";


const KEY = "agni-vision-theme";

export function readTheme() {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(KEY);
  return saved === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset["theme"] = theme;
  window.localStorage.setItem(KEY, theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const current = readTheme();
    setThemeState(current);
    applyTheme(current);
  }, []);

  const setTheme = (value) => {
    setThemeState(value);
    applyTheme(value);
  };

  return { theme, setTheme };
}