import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {ThemeContext, type ResolvedTheme, type ThemeContextValue, type ThemePreference} from "./themeContext";
import {
    STORAGE_KEY,
    applyTheme,
    getServerSnapshot,
    getSystemSnapshot,
    readStoredPreference,
    subscribeToSystem,
} from "./themeRuntime";

export function ThemeProvider({children}: {children: ReactNode}) {
    const [preference, setPreferenceState] = useState<ThemePreference>(() => readStoredPreference());
    const systemTheme = useSyncExternalStore(subscribeToSystem, getSystemSnapshot, getServerSnapshot);

    const resolved: ResolvedTheme = preference === "system" ? systemTheme : preference;

    useEffect(() => {
        applyTheme(resolved);
    }, [resolved]);

    const setPreference = useCallback((next: ThemePreference) => {
        if (next === "system") {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, next);
        }
        setPreferenceState(next);
    }, []);

    const toggle = useCallback(() => {
        setPreferenceState(prev => {
            const currentResolved = prev === "system" ? getSystemSnapshot() : prev;
            const next: ThemePreference = currentResolved === "dark" ? "light" : "dark";
            window.localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({preference, resolved, setPreference, toggle}),
        [preference, resolved, setPreference, toggle],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
