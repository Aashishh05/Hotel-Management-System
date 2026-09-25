import { useEffect, useState } from "react";

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
};

export { useTheme, getInitialTheme, applyTheme };