"use client";

import {
    Battery,
    BatteryCharging,
    BatteryFull,
    BatteryLow,
    BatteryMedium,
    Home,
    Sun,
    UtilityPole,
} from "lucide-react";
import { iconProps } from "@/lib/icons";

const FALLBACK = {
    amber: "#E8A020",
    orange: "#ea580c",
    purple: "#7c3aed",
    teal: "#0d9488",
    green: "#2A9D8F",
    text3: "#9AABB8",
};

function idleColor(isDark, theme) {
    return isDark ? "rgba(255,255,255,0.38)" : (theme.text3 || FALLBACK.text3);
}

function pickBatteryGlyph(soc, charging) {
    if (charging) return BatteryCharging;
    const pct = Math.max(0, Math.min(100, Number(soc) || 0));
    if (pct >= 85) return BatteryFull;
    if (pct >= 45) return BatteryMedium;
    if (pct >= 15) return BatteryLow;
    return Battery;
}

export function SunIcon({ active, size = 56, theme = FALLBACK, isDark = true, elevated = false }) {
    const c = active ? (theme.amber || FALLBACK.amber) : idleColor(isDark, theme);
    return (
        <Sun
            {...iconProps(size)}
            color={c}
            style={elevated ? { filter: `drop-shadow(0 -6px 10px ${c}55)` } : undefined}
        />
    );
}

export function GridIcon({ active, importing, size = 52, theme = FALLBACK, isDark = true }) {
    const on = importing ? (theme.orange || FALLBACK.orange) : (theme.teal || FALLBACK.teal);
    const c = active ? on : idleColor(isDark, theme);
    return <UtilityPole {...iconProps(size)} color={c} />;
}

export function HouseIcon({ active, size = 58, theme = FALLBACK, isDark = true }) {
    const c = active ? (theme.purple || FALLBACK.purple) : idleColor(isDark, theme);
    return <Home {...iconProps(size)} color={c} />;
}

export function BatteryIcon({ soc, active, size = 52, theme = FALLBACK, isDark = true }) {
    const c = active ? (theme.green || FALLBACK.green) : idleColor(isDark, theme);
    const Glyph = pickBatteryGlyph(soc, false);
    return <Glyph {...iconProps(size)} color={c} />;
}
