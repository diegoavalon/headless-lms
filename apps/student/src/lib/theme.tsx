"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark" | "system";

const storageKey = "theme";
const themeChange = "student-theme-change";
const colorScheme = "(prefers-color-scheme: dark)";

const initialThemeScript = `
  (() => {
    let theme;
    try { theme = localStorage.getItem(${JSON.stringify(storageKey)}); } catch {}
    const dark = theme === "dark" ||
      (theme !== "light" && matchMedia(${JSON.stringify(colorScheme)}).matches);
    document.documentElement.classList.toggle("dark", dark);
  })();
`;

let inMemoryTheme: Theme | undefined;

function getTheme(): Theme {
  if (inMemoryTheme) return inMemoryTheme;
  try {
    const theme = localStorage.getItem(storageKey);
    if (theme === "light" || theme === "dark") return theme;
  } catch {}
  return "system";
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
    inMemoryTheme = undefined;
  } catch {
    inMemoryTheme = theme;
  }
  window.dispatchEvent(new Event(themeChange));
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
      inMemoryTheme = undefined;
      onChange();
    }
  }

  window.addEventListener(themeChange, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(themeChange, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerTheme(): Theme {
  return "system";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  return { theme, setTheme };
}

export function StudentTheme() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script id="student-theme" dangerouslySetInnerHTML={{ __html: initialThemeScript }} />;
  });

  useEffect(() => {
    const media = window.matchMedia(colorScheme);
    const root = document.documentElement;
    let frame = 0;

    function applyTheme() {
      const theme = getTheme();
      const dark = theme === "system" ? media.matches : theme === "dark";
      if (root.classList.contains("dark") === dark) return;
      root.classList.add("theme-changing");
      root.classList.toggle("dark", dark);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => root.classList.remove("theme-changing"));
      });
    }

    applyTheme();
    const unsubscribe = subscribe(applyTheme);
    media.addEventListener("change", applyTheme);
    return () => {
      unsubscribe();
      media.removeEventListener("change", applyTheme);
      cancelAnimationFrame(frame);
      root.classList.remove("theme-changing");
    };
  }, []);

  return null;
}
