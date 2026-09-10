"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(true); // dark by default
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const stored = localStorage.getItem("theme");
        const prefersDark = stored ? stored === "dark" : true; // default to dark
        setIsDark(prefersDark);
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [mounted, isDark]);

    const toggleDark = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return { isDark: false, toggleDark: () => {} };
    }
    return context;
}