import type {ResolvedTheme, ThemePreference} from "./themeContext";

export const STORAGE_KEY = "clapp.theme";

export function readStoredPreference(): ThemePreference {
    if (typeof window === "undefined") return "system";
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
}

export function subscribeToSystem(callback: () => void): () => void {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
}

export function getSystemSnapshot(): ResolvedTheme {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getServerSnapshot(): ResolvedTheme {
    return "light";
}

export function applyTheme(resolved: ResolvedTheme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.dataset.theme = resolved;
}

export function applyInitialTheme() {
    const pref = readStoredPreference();
    const resolved: ResolvedTheme = pref === "system" ? getSystemSnapshot() : pref;
    applyTheme(resolved);
}
