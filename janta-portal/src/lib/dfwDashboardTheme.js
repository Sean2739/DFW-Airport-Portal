/**
 * DFW International Airport brand palette (published guidelines):
 * Orange #FF5000, Dark Gray #585858, Yellow #F2A900,
 * Blue #3EB1C8, Purple #41395F, Light Gray #E6E6E6.
 */

export const DFW_ORANGE = "#FF5000";
export const DFW_ORANGE_DEEP = "#E04600";
export const DFW_BLUE = "#3EB1C8";
export const DFW_YELLOW = "#F2A900";
export const DFW_PURPLE = "#41395F";
export const DFW_GRAY = "#585858";
export const DFW_LIGHT_GRAY = "#E6E6E6";
export const DFW_DARK = "#111111";
export const DFW_SURFACE = "#1B1B1B";
export const DFW_RAISED = "#262626";

const O = "255, 80, 0";
const B = "62, 177, 200";
const Y = "242, 169, 0";
const P = "65, 57, 95";
const G = "88, 88, 88";

export function getDfwDashboardTheme(isDark) {
    if (isDark) {
        return {
            pageBg:      DFW_DARK,
            sectionBg:   "transparent",
            section2Bg:  "transparent",
            cardBg:      DFW_SURFACE,
            cardBorder:  "0.5px solid rgba(255, 255, 255, 0.10)",
            cardShadow:  "0 1px 2px rgba(0,0,0,0.35), 0 18px 40px -24px rgba(0,0,0,0.80)",
            cardRadius:  14,
            text1:       "#f6f6f6",
            text2:       "rgba(246, 246, 246, 0.78)",
            text3:       "#a8a8a8",
            label:       "#a8a8a8",
            border:      "#3a3a3a",
            border2:     `rgba(${O}, 0.45)`,
            divider:     "rgba(255, 255, 255, 0.10)",
            amber:       DFW_ORANGE,
            amberDim:    `rgba(${O}, 0.22)`,
            green:       DFW_BLUE,
            accent:      DFW_BLUE,
            teal:        DFW_BLUE,
            orange:      DFW_ORANGE,
            red:         "#e4322b",
            purple:      DFW_PURPLE,
            gaugeTrack:  "rgba(255, 255, 255, 0.10)",
            gaugeRing:   DFW_ORANGE,
            chartBg:     "rgba(255, 255, 255, 0.03)",
            chartGrid:   "rgba(255, 255, 255, 0.08)",
            heroSize:    52,
            heroWeight:  200,
            statSize:    28,
            statWeight:  200,
            surface:     DFW_SURFACE,
        };
    }

    return {
        pageBg:      "#f4f4f4",
        sectionBg:   "transparent",
        section2Bg:  "transparent",
        cardBg:      "#ffffff",
        cardBorder:  `1px solid ${DFW_LIGHT_GRAY}`,
        cardShadow:  "0 1px 2px rgba(0,0,0,0.05), 0 18px 40px -24px rgba(0,0,0,0.22)",
        cardRadius:  14,
        text1:       "#222222",
        text2:       DFW_GRAY,
        text3:       "#6e6e6e",
        label:       DFW_GRAY,
        border:      "#d6d6d6",
        border2:     `rgba(${O}, 0.36)`,
        divider:     "#d6d6d6",
        amber:       DFW_ORANGE_DEEP,
        amberDim:    `rgba(${O}, 0.12)`,
        green:       "#2b8fa4",
        accent:      "#2b8fa4",
        teal:        "#2b8fa4",
        orange:      DFW_ORANGE,
        red:         "#c0271f",
        purple:      DFW_PURPLE,
        gaugeTrack:  "rgba(88, 88, 88, 0.14)",
        gaugeRing:   DFW_ORANGE_DEEP,
        chartBg:     "rgba(88, 88, 88, 0.04)",
        chartGrid:   "rgba(88, 88, 88, 0.10)",
        heroSize:    52,
        heroWeight:  200,
        statSize:    28,
        statWeight:  200,
        surface:     "#ffffff",
    };
}

export function getDfwPageBackground(isDark, baseColor) {
    if (isDark) {
        return [
            `linear-gradient(160deg, #0a0a0a 0%, ${baseColor} 48%, #161616 100%)`,
            `radial-gradient(ellipse 90% 60% at 95% 8%, rgba(${O}, 0.22) 0%, transparent 58%)`,
            `radial-gradient(ellipse 70% 55% at 82% 42%, rgba(${O}, 0.08) 0%, transparent 62%)`,
            `radial-gradient(ellipse 75% 55% at 4% 92%, rgba(${B}, 0.14) 0%, transparent 58%)`,
            `radial-gradient(ellipse 60% 45% at 12% 18%, rgba(${Y}, 0.08) 0%, transparent 52%)`,
        ].join(", ");
    }
    return [
        `linear-gradient(168deg, #fafafa 0%, ${baseColor} 48%, #ececec 100%)`,
        `radial-gradient(ellipse 75% 48% at 92% 10%, rgba(${O}, 0.08) 0%, transparent 54%)`,
        `radial-gradient(ellipse 70% 50% at 88% 18%, rgba(${B}, 0.10) 0%, transparent 58%)`,
        `radial-gradient(ellipse 60% 45% at 6% 88%, rgba(${P}, 0.06) 0%, transparent 52%)`,
        `radial-gradient(ellipse 55% 40% at 4% 12%, rgba(${Y}, 0.08) 0%, transparent 50%)`,
    ].join(", ");
}

export function getDfwEnergyPanelTheme(isDark) {
    if (isDark) {
        return {
            bg: [
                `linear-gradient(180deg, ${DFW_SURFACE} 0%, ${DFW_DARK} 55%, #0a0a0a 100%)`,
                `radial-gradient(ellipse 100% 80% at 50% 108%, rgba(${B}, 0.16) 0%, transparent 58%)`,
                `radial-gradient(ellipse 55% 45% at 94% 6%, rgba(${O}, 0.20) 0%, transparent 54%)`,
            ].join(", "),
            surface:  DFW_SURFACE,
            surface2: DFW_RAISED,
            border:   "#3a3a3a",
            border2:  `rgba(${O}, 0.45)`,
            text1:    "#f6f6f6",
            text2:    "rgba(246, 246, 246, 0.78)",
            text3:    "#a8a8a8",
            amber:    DFW_ORANGE,
            amberDim: `rgba(${O}, 0.16)`,
            green:    DFW_BLUE,
            red:      "#e4322b",
            orange:   DFW_ORANGE,
            purple:   DFW_PURPLE,
            teal:     DFW_BLUE,
        };
    }
    return {
        bg: [
            `linear-gradient(180deg, #ffffff 0%, #f4f4f4 100%)`,
            `radial-gradient(ellipse 65% 48% at 92% 8%, rgba(${O}, 0.06) 0%, transparent 54%)`,
            `radial-gradient(ellipse 50% 40% at 8% 92%, rgba(${B}, 0.06) 0%, transparent 50%)`,
        ].join(", "),
        surface:  "#ffffff",
        surface2: DFW_LIGHT_GRAY,
        border:   "#d6d6d6",
        border2:  `rgba(${O}, 0.32)`,
        text1:    "#222222",
        text2:    DFW_GRAY,
        text3:    "#6e6e6e",
        amber:    DFW_ORANGE_DEEP,
        amberDim: `rgba(${O}, 0.10)`,
        green:    "#2b8fa4",
        red:      "#c0271f",
        orange:   DFW_ORANGE,
        purple:   DFW_PURPLE,
        teal:     "#2b8fa4",
    };
}

export function getDfwHeaderStyle(isDark) {
    if (isDark) {
        return {
            background: [
                `linear-gradient(90deg, ${DFW_DARK} 0%, ${DFW_SURFACE} 42%, ${DFW_RAISED} 78%, #2a1a14 100%)`,
                `radial-gradient(ellipse 120% 180% at 100% 50%, rgba(${O}, 0.22) 0%, transparent 55%)`,
            ].join(", "),
            borderBottom: "0.5px solid #3a3a3a",
            boxShadow: `0 1px 0 rgba(${O}, 0.28), 0 4px 28px rgba(0,0,0,0.38)`,
            iconColor: "#f6f6f6",
        };
    }
    return {
        background: `linear-gradient(90deg, #ffffff 0%, #f4f4f4 55%, rgba(${O}, 0.10) 100%)`,
        borderBottom: `1px solid ${DFW_LIGHT_GRAY}`,
        iconColor: DFW_GRAY,
    };
}

export function getDfwSidebarColors(isDark) {
    if (isDark) {
        return {
            bg: [
                `linear-gradient(180deg, ${DFW_DARK} 0%, ${DFW_SURFACE} 48%, ${DFW_RAISED} 100%)`,
                `radial-gradient(ellipse 140% 60% at 50% 0%, rgba(${O}, 0.16) 0%, transparent 55%)`,
            ].join(", "),
            border:   "#3a3a3a",
            text1:    "#f6f6f6",
            text2:    "rgba(246, 246, 246, 0.78)",
            text3:    "#a8a8a8",
            accent:   DFW_ORANGE,
            accentDim:`rgba(${O}, 0.22)`,
            activeGlow: `0 0 22px rgba(${O}, 0.30)`,
            navHoverBg: `rgba(${O}, 0.10)`,
            iconActive: DFW_ORANGE,
            iconIdle:   "rgba(255, 255, 255, 0.72)",
        };
    }
    return {
        bg:       `linear-gradient(180deg, ${DFW_GRAY} 0%, #4a4a4a 40%, #3d3d3d 100%)`,
        border:   `rgba(${G}, 0.48)`,
        text1:    "#ffffff",
        text2:    "rgba(255, 255, 255, 0.74)",
        text3:    "rgba(255, 255, 255, 0.50)",
        accent:   DFW_ORANGE,
        accentDim:`rgba(${O}, 0.18)`,
        activeGlow: `rgba(${O}, 0.17)`,
        navHoverBg: "rgba(255, 255, 255, 0.06)",
        iconActive: DFW_ORANGE,
        iconIdle:   "rgba(255, 255, 255, 0.50)",
    };
}
