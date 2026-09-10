/**
 * FIFA World Cup 26 · Dallas host-city palette.
 * Teal foundation with spring-green accents — lime reserved for highlights only.
 */

export const FIFA_LIME = "#BFFF00";
export const FIFA_DEEP_TEAL = "#004B4D";
export const FIFA_WHITE = "#FFFFFF";
export const FIFA_ORANGE = "#F04E23";

/** Cool mint page base — light blue-green wash */
export const FIFA_MINT = "#eaf6f8";
/** Lighter turquoise — flows with mint bg, still FIFA */
export const FIFA_SEAFOAM = "#6ec8bc";
/** Lighter spring green — pairs with seafoam */
export const FIFA_SPRING = "#92d078";
/** UI turquoise between deep teal and seafoam */
export const FIFA_TURQUOISE = "#52b8ac";
/** Rich dark-teal base — darker than mint, not black */
export const FIFA_DARK_BASE = "#0c3436";
export const FIFA_DARK_MID = "#124a4d";
export const FIFA_DARK_DEEP = "#083032";

/** @deprecated use FIFA_ORANGE */
export const FIFA_GOLD = FIFA_ORANGE;
/** @deprecated use FIFA_DEEP_TEAL */
export const FIFA_TEAL = FIFA_DEEP_TEAL;
/** @deprecated use FIFA_SPRING */
export const FIFA_GREEN = "#7ec8a8";

const T = "0, 75, 77";
const O = "240, 78, 35";
const L = "191, 255, 0";
const G = "74, 143, 0";
/** Lighter chrome only — top bar & sidebar (light mode) */
const S = "110, 200, 188"; // #6ec8bc
const M = "146, 208, 120"; // #92d078
const Q = "82, 184, 172";   // #52b8ac

export function getFifaDashboardTheme(isDark) {
    if (isDark) {
        return {
            pageBg:      FIFA_DARK_BASE,
            sectionBg:   "transparent",
            section2Bg:  "transparent",
            cardBg:      `linear-gradient(165deg, rgba(14, 82, 84, 0.96) 0%, rgba(8, 54, 56, 0.94) 100%)`,
            cardBorder:  `0.5px solid rgba(255, 255, 255, 0.12)`,
            cardShadow:  "0 4px 6px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.12)",
            cardRadius:  20,
            text1:       FIFA_WHITE,
            text2:       "rgba(255, 255, 255, 0.84)",
            text3:       "#d8f0ec",
            label:       "#d8f0ec",
            border:      "rgba(255, 255, 255, 0.16)",
            border2:     `rgba(${L}, 0.45)`,
            divider:     "rgba(255, 255, 255, 0.14)",
            amber:       FIFA_ORANGE,
            amberDim:    `rgba(${O}, 0.26)`,
            green:       FIFA_LIME,
            accent:      FIFA_LIME,
            teal:        FIFA_SEAFOAM,
            gaugeTrack:  `rgba(${Q}, 0.40)`,
            gaugeRing:   FIFA_ORANGE,
            chartBg:     `rgba(6, 52, 54, 0.72)`,
            chartGrid:   "rgba(255, 255, 255, 0.11)",
            heroSize:    52,
            heroWeight:  200,
            statSize:    28,
            statWeight:  200,
            surface:     `rgba(10, 72, 74, 0.90)`,
        };
    }

    return {
        pageBg:      FIFA_MINT,
        sectionBg:   "transparent",
        section2Bg:  "transparent",
        cardBg:      "#f8fcfb",
        cardBorder:  `1px solid rgba(${T}, 0.14)`,
        cardShadow:  "0 4px 6px rgba(0,75,77,0.06), 0 8px 24px rgba(0,75,77,0.10), 0 1px 2px rgba(0,75,77,0.06)",
        cardRadius:  20,
        text1:       FIFA_DEEP_TEAL,
        text2:       "#2a6b6d",
        text3:       "#4d8284",
        label:       FIFA_DEEP_TEAL,
        border:      `rgba(${T}, 0.12)`,
        border2:     `rgba(${G}, 0.36)`,
        divider:     `rgba(${G}, 0.14)`,
        amber:       FIFA_ORANGE,
        amberDim:    `rgba(${O}, 0.12)`,
        green:       "#4a8f00",
        teal:        FIFA_DEEP_TEAL,
        gaugeTrack:  `rgba(${T}, 0.10)`,
        gaugeRing:   FIFA_ORANGE,
        chartBg:     `rgba(${T}, 0.05)`,
        chartGrid:   `rgba(${T}, 0.08)`,
        heroSize:    52,
        heroWeight:  200,
        statSize:    28,
        statWeight:  200,
        surface:     "#f8fcfb",
    };
}

export function getFifaPageBackground(isDark, baseColor) {
    if (isDark) {
        return [
            `linear-gradient(160deg, ${FIFA_DARK_DEEP} 0%, ${baseColor} 45%, #0e3e40 100%)`,
            `radial-gradient(ellipse 90% 60% at 95% 8%, rgba(${O}, 0.24) 0%, transparent 58%)`,
            `radial-gradient(ellipse 70% 55% at 82% 42%, rgba(${O}, 0.10) 0%, transparent 62%)`,
            `radial-gradient(ellipse 75% 55% at 4% 92%, rgba(${T}, 0.50) 0%, transparent 58%)`,
            `radial-gradient(ellipse 60% 45% at 12% 18%, rgba(${L}, 0.07) 0%, transparent 52%)`,
            `radial-gradient(ellipse 85% 70% at 50% 110%, rgba(${Q}, 0.22) 0%, transparent 56%)`,
        ].join(", ");
    }
    return [
        `linear-gradient(168deg, #f4fafb 0%, ${baseColor} 48%, #e2f2f0 100%)`,
        `radial-gradient(ellipse 75% 48% at 92% 10%, rgba(${O}, 0.08) 0%, transparent 54%)`,
        `radial-gradient(ellipse 70% 50% at 88% 18%, rgba(${S}, 0.16) 0%, transparent 58%)`,
        `radial-gradient(ellipse 60% 45% at 6% 88%, rgba(${Q}, 0.10) 0%, transparent 52%)`,
        `radial-gradient(ellipse 55% 40% at 4% 12%, rgba(${M}, 0.10) 0%, transparent 50%)`,
    ].join(", ");
}

export function getFifaEnergyPanelTheme(isDark) {
    if (isDark) {
        return {
            bg: [
                `linear-gradient(180deg, ${FIFA_DARK_MID} 0%, ${FIFA_DARK_BASE} 55%, ${FIFA_DARK_DEEP} 100%)`,
                `radial-gradient(ellipse 100% 80% at 50% 108%, rgba(${T}, 0.48) 0%, transparent 58%)`,
                `radial-gradient(ellipse 55% 45% at 94% 6%, rgba(${O}, 0.22) 0%, transparent 54%)`,
                `radial-gradient(ellipse 50% 40% at 6% 94%, rgba(${L}, 0.08) 0%, transparent 50%)`,
            ].join(", "),
            surface:  `rgba(12, 78, 80, 0.92)`,
            surface2: `rgba(8, 58, 60, 0.88)`,
            border:   "rgba(255, 255, 255, 0.16)",
            border2:  `rgba(${L}, 0.45)`,
            text1:    FIFA_WHITE,
            text2:    "rgba(255, 255, 255, 0.84)",
            text3:    "#d8f0ec",
            amber:    FIFA_ORANGE,
            amberDim: `rgba(${O}, 0.16)`,
            green:    FIFA_LIME,
            red:      "#ef4444",
            orange:   FIFA_ORANGE,
            purple:   "#c084fc",
            teal:     FIFA_SEAFOAM,
        };
    }
    return {
        bg: [
            `linear-gradient(180deg, #f6faf9 0%, ${FIFA_MINT} 100%)`,
            `radial-gradient(ellipse 65% 48% at 92% 8%, rgba(${S}, 0.06) 0%, transparent 54%)`,
            `radial-gradient(ellipse 50% 40% at 8% 92%, rgba(${T}, 0.04) 0%, transparent 50%)`,
        ].join(", "),
        surface:  "#f8fcfb",
        surface2: "#f0f7f5",
        border:   `rgba(${T}, 0.12)`,
        border2:  `rgba(${G}, 0.32)`,
        text1:    FIFA_DEEP_TEAL,
        text2:    "#357578",
        text3:    "#5a8f92",
        amber:    FIFA_ORANGE,
        amberDim: `rgba(${O}, 0.10)`,
        green:    "#2A9D8F",
        red:      "#dc2626",
        orange:   FIFA_ORANGE,
        purple:   "#7c3aed",
        teal:     "#0d9488",
    };
}

export function getFifaHeaderStyle(isDark) {
    if (isDark) {
        return {
            background: [
                `linear-gradient(90deg, ${FIFA_DEEP_TEAL} 0%, #005a5e 28%, #00686c 52%, #007478 72%, #3a9e96 92%, rgba(${M}, 0.35) 100%)`,
                `radial-gradient(ellipse 120% 180% at 100% 50%, rgba(${O}, 0.18) 0%, transparent 55%)`,
                `radial-gradient(ellipse 80% 160% at 0% 0%, rgba(${L}, 0.08) 0%, transparent 50%)`,
            ].join(", "),
            borderBottom: `0.5px solid rgba(${T}, 0.50)`,
            boxShadow: `0 1px 0 rgba(${O}, 0.22), 0 4px 28px rgba(0,45,48,0.38)`,
            iconColor: FIFA_WHITE,
        };
    }
    return {
        background: `linear-gradient(90deg, #006d70 0%, #008a8c 22%, ${FIFA_TURQUOISE} 46%, ${FIFA_SEAFOAM} 68%, ${FIFA_SPRING} 88%, #c5ef9a 100%)`,
        borderBottom: `1px solid rgba(${S}, 0.45)`,
        iconColor: "#2F3E4D",
    };
}

export function getFifaSidebarColors(isDark) {
    if (isDark) {
        return {
            bg: [
                `linear-gradient(180deg, ${FIFA_DEEP_TEAL} 0%, #005458 32%, #006064 58%, #007074 82%, ${FIFA_TURQUOISE} 100%)`,
                `radial-gradient(ellipse 140% 60% at 50% 0%, rgba(${O}, 0.14) 0%, transparent 55%)`,
            ].join(", "),
            border:   `rgba(${T}, 0.45)`,
            text1:    FIFA_WHITE,
            text2:    "rgba(255, 255, 255, 0.84)",
            text3:    "#d8f0ec",
            accent:   FIFA_ORANGE,
            accentDim:`rgba(${O}, 0.22)`,
            activeGlow: `0 0 22px rgba(${O}, 0.30)`,
            navHoverBg: `rgba(${O}, 0.08)`,
            iconActive: FIFA_ORANGE,
            iconIdle:   "rgba(255, 255, 255, 0.78)",
        };
    }
    return {
        bg:       `linear-gradient(180deg, #006568 0%, #007a7c 26%, #3aada4 54%, ${FIFA_SEAFOAM} 80%, #7ed4c8 100%)`,
        border:   `rgba(${S}, 0.48)`,
        text1:    FIFA_WHITE,
        text2:    "rgba(255, 255, 255, 0.74)",
        text3:    "rgba(255, 255, 255, 0.50)",
        accent:   FIFA_ORANGE,
        accentDim:`rgba(${O}, 0.18)`,
        activeGlow: `rgba(${O}, 0.17)`,
        navHoverBg: "rgba(255, 255, 255, 0.06)",
        iconActive: FIFA_ORANGE,
        iconIdle:   "rgba(255, 255, 255, 0.45)",
    };
}
