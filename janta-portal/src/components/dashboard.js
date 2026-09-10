"use client";
import React from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import {
    Menu, X, Moon, Sun, LayoutDashboard, BarChart3, Sliders, History,
    RotateCcw, Power, Home, Plane,
} from "lucide-react";
import { ICON_LG, iconProps } from "@/lib/icons";
import Link from 'next/link';
import { useSystem } from '@/hooks/useSystem';
import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/context/ThemeContext';
import "@/lib/chart";
import "@/lib/line";
import "@/lib/chartIdleTrace";
import { Bar, Line } from "react-chartjs-2";
import TowerModelViewer from "@/components/TowerModelViewer";
import 'chartjs-adapter-date-fns';
import 'chartjs-adapter-luxon';
import { DateTime } from "luxon";
import Sidebar, { SIDEBAR_COLLAPSED_W } from '@/components/Sidebar';
import EnergyFlowPanel from '@/components/EnergyFlowPanel';
import DfwLiveFlow from '@/components/DfwLiveFlow';
import TowerControlActions from '@/components/TowerControlActions';
import TowersProduction from '@/components/TowersProduction';
import FieldConditions from '@/components/FieldConditions';
import SystemOfRecord from '@/components/SystemOfRecord';
import BatterySection from '@/components/BatterySection';
import DfwSustainabilityCard from '@/components/DfwSustainabilityCard';
import TreeImpactIcon from '@/components/TreeImpactIcon';
import TowerImpactIcon from '@/components/TowerImpactIcon';
import EsgFacingCompass from '@/components/EsgFacingCompass';
import PulseDot from '@/components/PulseDot';
import FallingLeaves from '@/components/FallingLeaves';
import { isFifaDallasSystem } from '@/lib/fifaDallasSystem';
import { isDfwAirportSystem } from '@/lib/dfwAirportSystem';
import { hasInverterSplit, splitTowerPower, groupTowersByInverter } from '@/lib/inverterGroups';
import {
    getFifaDashboardTheme,
    getFifaPageBackground,
    getFifaHeaderStyle,
    FIFA_ORANGE,
} from '@/lib/fifaDashboardTheme';
import {
    getDfwDashboardTheme,
    getDfwPageBackground,
    getDfwHeaderStyle,
    DFW_ORANGE,
    DFW_ORANGE_DEEP,
    DFW_BLUE,
} from '@/lib/dfwDashboardTheme';
import FifaSoccerBackdrop from '@/components/FifaSoccerBackdrop';
import DfwHexBackdrop from '@/components/DfwHexBackdrop';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CO2_KG_PER_KWH = 0.37;
const KG_PER_TREE = 21;
const TODAY_METRIC_INTERVAL_MS = 8000;
const TODAY_METRIC_FADE_MS = 340;

function withAlpha(color, alpha) {
    if (alpha <= 0) return "rgba(0,0,0,0)";
    if (alpha >= 1 || !color) return color;
    const c = String(color).trim();
    if (c.startsWith("rgba(")) {
        return c.replace(/rgba\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (c.startsWith("rgb(")) {
        return c.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
    }
    if (c[0] === "#") {
        let hex = c.slice(1);
        if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
        const n = parseInt(hex, 16);
        if (!Number.isFinite(n)) return c;
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    return c;
}

function niceAxisMax(v) {
    if (!Number.isFinite(v) || v <= 0) return 1;
    const exp = 10 ** Math.floor(Math.log10(v));
    return Math.ceil(v / exp) * exp;
}

/** Next power-of-10 milestone above current carbon (e.g. 6,284 → 10,000). */
function nextCarbonGoalKg(kg) {
    if (kg <= 0) return 100;
    const exp = Math.ceil(Math.log10(kg));
    const milestone = 10 ** exp;
    if (kg >= milestone) return 10 ** (exp + 1);
    return milestone;
}

// Light mode palette (unchanged)
const SIDEBAR_BG = "#374151";
const MAIN_BG = "#F7F5F2";
const CARD_BG = "#FFFFFF";
const ACCENT_GREEN = "#4A9E78";
const ORANGE = "#F3B664";
const TITLE_COLOR = "#3D2E1E";
const TEXT_MUTED = "#8B7A68";

// Warm energy system palette — light mode
const WM = {
    bg:         "#F7F5F2",   // warm cream atmosphere
    section1:   "#F7F5F2",   // tower status zone
    section2:   "#F2F0EC",   // today at a glance — slightly deeper
    section3:   "#F7F5F2",   // diagnostics
    label:      "#8B7355",   // warm brown-gray section labels
    title:      "#3D2E1E",   // warm dark brown page title
    body:       "#4A3728",   // warm body text
    muted:      "#A8978A",   // warm muted text
    amber:      "#E8A020",   // primary energy amber
    green:      "#4A9E78",   // soft warm green for sustainability
    blue:       "#7BAFD4",   // sky blue — warm-toned, not cold
    pill:       "#F2F0EC",   // pill / tag backgrounds
};

// SwiftUI-style card for light mode — pronounced directional shadow for depth
const LT_CARD = {
    background: "#FFFFFF",
    borderRadius: 20,
    boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
};

// Dark mode palette — Rivian-inspired
const DK = {
    bg:       "#0c0c0d",
    surface:  "#161618",
    surface2: "#1c1c1f",
    border:   "rgba(255,255,255,0.08)",
    border2:  "rgba(255,255,255,0.14)",
    text1:    "#f4f4f5",
    text2:    "rgba(244,244,245,0.62)",
    text3:    "rgba(244,244,245,0.40)",
    amber:    "#e6b85c",
    amberDim: "rgba(230,184,92,0.14)",
    green:    "rgba(74,222,128,0.75)",
    red:      "#ef4444",
    warmGray: "#a1a1aa",
    earth:    "#71717a",
};

// ── Theme token system ────────────────────────────────────────────────
// Single source of truth for both light and dark mode.
// All card UI should reference T.* instead of DK.* or WM.* directly.
function getTheme(isDark) {
    if (isDark) return {
        // Page backgrounds
        pageBg:      "#0c0c0d",
        sectionBg:   "#0c0c0d",
        section2Bg:  "#0c0c0d",
        // Cards
        cardBg:      "#161618",
        cardBorder:  "0.5px solid rgba(255,255,255,0.08)",
        cardShadow:  "none",
        cardRadius:  12,
        // Text hierarchy
        text1:       "#f4f4f5",
        text2:       "rgba(244,244,245,0.62)",
        text3:       "rgba(244,244,245,0.40)",
        label:       "rgba(244,244,245,0.40)",
        // Dividers
        border:      "rgba(255,255,255,0.08)",
        border2:     "rgba(255,255,255,0.14)",
        divider:     "rgba(255,255,255,0.08)",
        // Accents
        amber:       "#e6b85c",
        amberDim:    "rgba(230,184,92,0.14)",
        green:       "rgba(74,222,128,0.75)",
        // Gauge
        gaugeTrack:  "rgba(255,255,255,0.10)",
        gaugeRing:   "#e6b85c",
        // Charts
        chartBg:     "rgba(255,255,255,0.03)",
        chartGrid:   "rgba(255,255,255,0.06)",
        // Typography scale — identical in both modes, kept here for T.* access
        heroSize:    52,
        heroWeight:  200,
        statSize:    28,
        statWeight:  200,
        // Surface (alias for cardBg)
        surface:     "#161618",
    };
    return {
        // Page backgrounds
        pageBg:      "#F4F6F9",
        sectionBg:   "#F4F6F9",
        section2Bg:  "#EEF1F5",
        // Cards
        cardBg:      "#FFFFFF",
        cardBorder:  "1px solid rgba(26,37,53,0.07)",
        cardShadow:  "0 4px 6px rgba(26,37,53,0.04), 0 8px 24px rgba(26,37,53,0.08), 0 1px 2px rgba(26,37,53,0.06)",
        cardRadius:  20,
        // Text hierarchy — navy blue family matching #1A2535 sidebar
        text1:       "#1A2535",
        text2:       "#3D5068",
        text3:       "#7A90A8",
        label:       "#3D5068",
        // Dividers
        border:      "rgba(26,37,53,0.08)",
        border2:     "rgba(26,37,53,0.14)",
        divider:     "rgba(26,37,53,0.08)",
        // Accents
        amber:       "#E8A020",
        amberDim:    "rgba(232,160,32,0.12)",
        green:       "#4A9E78",
        // Gauge
        gaugeTrack:  "rgba(26,37,53,0.10)",
        gaugeRing:   "#F3B664",
        // Charts
        chartBg:     "#EEF1F5",
        chartGrid:   "rgba(26,37,53,0.08)",
        // Typography scale — identical in both modes, kept here for T.* access
        heroSize:    52,
        heroWeight:  200,
        statSize:    28,
        statWeight:  200,
        // Surface (alias for cardBg)
        surface:     "#FFFFFF",
    };
}

function cardSurface(theme, extra = {}) {
    return {
        background: theme.cardBg,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        borderRadius: theme.cardRadius,
        "--card-shimmer": theme.amber,
        ...extra,
    };
}

const TOOLBAR_BTN = "text-[13px] font-medium py-[5px] px-3 rounded cursor-pointer transition-all duration-[150ms]";

function toolbarBtnStyle(active, theme, isDark) {
    return {
        background: active ? theme.amber : "transparent",
        color: active ? (isDark ? "#000" : "#fff") : theme.text2,
        border: `0.5px solid ${active ? theme.amber : theme.border}`,
    };
}

function chartAxisGrid(theme) {
    return { color: theme.chartGrid ?? theme.border, lineWidth: 0.5, drawBorder: false };
}

/** Solid fill for canvas tooltips — gradients (FIFA cards) are not valid Chart.js colors. */
function tooltipSurface(theme, isDark) {
    const bg = theme?.cardBg;
    if (typeof bg === "string" && !bg.includes("gradient")) return bg;
    const surface = theme?.surface;
    if (typeof surface === "string" && !surface.includes("gradient")) return surface;
    return isDark ? "rgba(22,22,24,0.96)" : "#FFFFFF";
}

/** Shared hover card for chart data points — matches dashboard card chrome. */
function chartHoverCard(theme, isDark, { unit } = {}) {
    return {
        enabled: true,
        backgroundColor: tooltipSurface(theme, isDark),
        titleColor: theme.text3,
        bodyColor: theme.text1,
        borderColor: theme.border,
        borderWidth: 1,
        cornerRadius: 12,
        padding: { top: 10, right: 12, bottom: 10, left: 12 },
        displayColors: false,
        titleFont: { size: 11, weight: "600" },
        bodyFont: { size: 13, weight: "400" },
        titleMarginBottom: 4,
        caretSize: 5,
        caretPadding: 8,
        callbacks: {
            label: (item) => {
                const raw = item.parsed?.y ?? item.raw;
                const n = Number(raw);
                const value = Number.isFinite(n)
                    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : item.formattedValue;
                return unit ? `${value} ${unit}` : String(value);
            },
        },
    };
}

function historicalBarOptions(theme, isDark, unit) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 900, easing: "easeInOutQuad" },
        scales: {
            y: { beginAtZero: true, grid: chartAxisGrid(theme), border: { display: false }, ticks: { color: theme.text3, font: { size: 13 } } },
            x: { grid: { display: false }, border: { display: false }, ticks: { color: theme.text3, font: { size: 13 } } },
        },
        plugins: {
            legend: { display: false },
            tooltip: chartHoverCard(theme, isDark, { unit }),
            idleSheen: { datasetIndex: 0, color: theme.amber, durationMs: 7800 },
        },
    };
}

// Helper: returns className string for a dark-mode-aware card
function dkCard(isDark, extraLight = "", extraDark = "") {
    if (isDark) return `rounded-xl border ${extraDark}`;
    return `bg-white rounded-2xl ${extraLight}`;
}

// Tiny sparkline component (dark mode only)
function Sparkline({ values = [], color = DK.amber, unit = "", startHour = 0, T, isDark = true, height = 36 }) {
    const [hovered, setHovered] = React.useState(null);
    if (!values.length) return null;
    const cleanValues = values.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    });
    const w = 180, h = height;
    const max = Math.max(...cleanValues, 0.001);
    const min = Math.min(...cleanValues, 0);
    const range = max - min || 0.001;
    const pts = cleanValues.map((v, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return { x, y, v, i };
    });
    const ptsStr = pts.map(p => `${p.x},${p.y}`).join(" ");

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width * w;
        let closest = pts[0];
        pts.forEach(p => { if (Math.abs(p.x - relX) < Math.abs(closest.x - relX)) closest = p; });
        setHovered(closest);
    };

    const hour = hovered ? (startHour + hovered.i) % 24 : 0;
    const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
    const cardLeft = hovered ? Math.min(Math.max((hovered.x / w) * 100, 18), 82) : 0;

    return (
        <div className="relative">
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
                className="overflow-visible block cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(null)}
            >
                <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {hovered && <>
                    <line x1={hovered.x} y1={0} x2={hovered.x} y2={h}
                        stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                    <circle cx={hovered.x} cy={hovered.y} r="3" fill={color} opacity="0.9" />
                </>}
            </svg>
            {hovered && T && (
                <div
                    className="pointer-events-none absolute z-10 px-2.5 py-1.5 whitespace-nowrap"
                    style={{
                        left: `${cardLeft}%`,
                        top: Math.max(hovered.y - 8, 0),
                        transform: "translate(-50%, -100%)",
                        background: tooltipSurface(T, isDark),
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        boxShadow: T.cardShadow,
                    }}
                >
                    <p className="text-[11px] font-semibold leading-none" style={{ color: T.text3 }}>{label}</p>
                    <p className="text-[13px] font-normal tabular-nums leading-none mt-1" style={{ color: T.text1 }}>
                        {Math.round(hovered.v)}{unit}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { session, user, loading } = useSession();
    const { isDark, toggleDark } = useTheme();
    const { system, loading: systemloading } = useSystem();
    const router = useRouter();

    const MAX_PV_POWER = system?.max_pv_kw;
    const system_tz = system?.timezone;
    const chartDay = DateTime.now().setZone(system_tz).startOf("day");

    const lat = system?.latitude;
    const lon = system?.longitude;

    const [pvPower, setPvPower] = useState(0);
    const [eg4DailyTotal, setEg4DailyTotal] = useState(null);
    const [maxHourlyPower, setMaxHourlyPower] = useState(0);
    const [dailyProduction, setDailyProduction] = useState(null);
    const [hourlyProduction, setHourlyProduction] = useState(null);
    const [todayMetric, setTodayMetric] = useState("power");
    const [todayHovered, setTodayHovered] = useState(false);
    const [esgView, setEsgView] = useState("tree");
    const [esgHovered, setEsgHovered] = useState(false);
    const [monthlyProduction, setMonthlyProduction] = useState(null);
    const [yearlyProduction, setYearlyProduction] = useState(null);
    const [totalProduction, setTotalProduction] = useState(null);
    // Flow data — from /FlowData endpoint
    const [gridPower, setGridPower] = useState(0);
    const [gridImport, setGridImport] = useState(false);
    const [loadPower, setLoadPower] = useState(0);
    const [battSoc, setBattSoc] = useState(null);
    const [hasBattery, setHasBattery] = useState(false);
    const [battChargePower, setBattChargePower] = useState(null);
    const intervalRef = useRef(null);
    const intervalRef1 = useRef(null);
    const intervalRef2 = useRef(null);

    const isEG4 = String(system?.inverter_type).toUpperCase() === "EG4";

    // ── Live poll (every 10 s): live power + flow ──────────────────────────
    useEffect(() => {
        if (!system) return;
        async function fetchLive() {
            try {
                if (isEG4) {
                    const response = await fetch(`/api/eg4`, { cache: "no-store" });
                    if (!response.ok) return;
                    const json = await response.json();

                    if (json.solar?.total_w != null) setPvPower(json.solar.total_w);
                    if (json.solar?.today_kwh != null) setEg4DailyTotal(json.solar.today_kwh);
                    if (json.solar?.total_kwh != null) setTotalProduction(json.solar.total_kwh);

                    const toUser = json.grid?.to_user_w ?? 0;
                    const toGrid = json.grid?.to_grid_w ?? 0;
                    setGridImport(toUser > 0);
                    setGridPower(toUser > 0 ? toUser : toGrid);
                    setLoadPower(json.consumption?.power_w ?? 0);
                    setBattSoc(json.battery?.soc ?? null);
                    setHasBattery(json.battery?.soc != null);
                    const chargeW = json.battery?.charge_w ?? 0;
                    const dischargeW = json.battery?.discharge_w ?? 0;
                    setBattChargePower(chargeW > 0 ? chargeW : -dischargeW);
                    return;
                }

                const response = await fetch(`/api/fronius/live`, { cache: "no-store" });
                if (!response.ok) return;
                const json = await response.json();

                // Live power
                const live = json.data?.live;
                if (live?.pvPower != null) setPvPower(live.pvPower);

                // Flow data (grid, load, battery) — more up-to-date pvPower wins
                const flow = json.data?.flow;
                if (flow) {
                    setGridPower(flow.gridPower ?? 0);
                    setGridImport(flow.gridImport ?? false);
                    setLoadPower(flow.loadPower ?? 0);
                    setBattSoc(flow.battSoc ?? null);
                    setHasBattery(flow.hasBattery ?? false);
                    setBattChargePower(flow.battChargePower ?? null);
                    if (flow.pvPower != null) setPvPower(flow.pvPower);
                }
            } catch (error) { console.error('Live fetch error:', error); }
        }
        fetchLive();
        intervalRef.current = setInterval(fetchLive, 10000);
        return () => clearInterval(intervalRef.current);
    }, [system, isEG4]);

    const pvPowerKw = pvPower / 1000;
    const nameplateKw = Number(MAX_PV_POWER) || 0;
    const powerPercent = nameplateKw > 0
        ? Math.min(Math.max(pvPowerKw / nameplateKw, 0), 1)
        : 0;
    const safePowerPercent = Number.isFinite(powerPercent) ? powerPercent : 0;
    const dashOffset = CIRCUMFERENCE * (1 - safePowerPercent);

    const inverterGroups = useMemo(() => {
        if (!hasInverterSplit(system?.towers)) return [];
        return groupTowersByInverter(
            splitTowerPower(system.towers, pvPowerKw),
            Number(system?.max_pv_kw) || 0,
        );
    }, [system, pvPowerKw]);

    // Peak Today = max of today's historical hourly peak and the current live power
    const peakTodayKw = useMemo(() => {
        const histMaxKw = hourlyProduction?.values?.length
            ? Math.max(...hourlyProduction.values) / 1000
            : 0;
        return Math.round(Math.max(histMaxKw, pvPowerKw) * 100) / 100;
    }, [hourlyProduction, pvPowerKw]);

    // ── Fast poll (every 5 min): hourly chart data only ──
    useEffect(() => {
        if (!system) return;
        async function fetchHourly() {
            try {
                if (isEG4) {
                    const res = await fetch(`/api/eg4/history`, { cache: "no-store" });
                    if (!res.ok) return;
                    const json = await res.json();
                    const energyData = json.data?.hourlyproduction ?? null;
                    setHourlyProduction(energyData);
                    setMaxHourlyPower(
                        energyData?.values?.length
                            ? Math.round(Math.max(...energyData.values) / 1000)
                            : 0
                    );
                    return;
                }
                const res = await fetch(`/api/fronius`, { cache: "no-store" });
                if (!res.ok) return;
                const json = await res.json();
                const energyData = json.data?.hourlyproduction ?? null;
                setHourlyProduction(energyData);
                setMaxHourlyPower(
                    energyData?.values?.length
                        ? Math.round(Math.max(...energyData.values) / 1000)
                        : 0
                );
            } catch (error) { console.error('Hourly fetch error:', error); }
        }
        fetchHourly();
        intervalRef1.current = setInterval(fetchHourly, 300000);
        return () => clearInterval(intervalRef1.current);
    }, [system, isEG4]);

    // ── Slow poll (every 60 min): monthly / yearly / total historical data ──
    useEffect(() => {
        if (!system) return;
        async function fetchHistorical() {
            try {
                if (isEG4) {
                    const res = await fetch(`/api/eg4/monitor`, { cache: "no-store" });
                    if (!res.ok) return;
                    const json = await res.json();
                    setDailyProduction(json.data?.dailyproduction ?? null);
                    setMonthlyProduction(json.data?.monthlyproduction ?? null);
                    setYearlyProduction(json.data?.yearlyproduction ?? null);
                    if (json.data?.total != null) {
                        setTotalProduction(json.data.total);
                    } else if (json.data?.yearlyproduction?.values?.length) {
                        const mwh = json.data.yearlyproduction.values.reduce((s, v) => s + (Number(v) || 0), 0);
                        setTotalProduction(mwh * 1000);
                    }
                    return;
                }
                const res = await fetch(`/api/fronius`, { cache: "no-store" });
                if (!res.ok) return;
                const json = await res.json();
                setDailyProduction(json.data?.dailyproduction ?? null);
                setMonthlyProduction(json.data?.monthlyproduction ?? null);
                setYearlyProduction(json.data?.yearlyproduction ?? null);
                setTotalProduction(json.data?.total ?? null);
            } catch (error) { console.error('Historical fetch error:', error); }
        }
        fetchHistorical();
        intervalRef2.current = setInterval(fetchHistorical, 3600000);
        return () => clearInterval(intervalRef2.current);
    }, [system, isEG4]);

    const todaysProduction = useMemo(() => {
        if (!dailyProduction || !system_tz) return null;
        const systemDay = DateTime.now().setZone(system_tz).day;
        return dailyProduction.values[systemDay - 1] ?? null;
    }, [dailyProduction, system_tz]);

    const displayDailyTotal = isEG4 ? eg4DailyTotal : todaysProduction;

    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthLabels = monthlyProduction?.labels
        ? monthlyProduction.labels.map(m => MONTH_NAMES[m - 1])
        : MONTH_NAMES;

    const fullDayLabels = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
            fullDayLabels.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        }
    }

    const fullDayDates = fullDayLabels.map(label => {
        const [hh, mm] = label.split(":").map(Number);
        return chartDay.plus({ hours: hh, minutes: mm }).toUTC().toJSDate();
    });

    const datasetPoints = (hourlyProduction?.labels ?? []).map((utcLabel, i) => {
        const [hh, mm] = utcLabel.split(":").map(Number);
        const utcTime = chartDay.setZone("utc", { keepLocalTime: true }).set({ hour: hh, minute: mm, second: 0, millisecond: 0 });
        return { x: utcTime.setZone(system_tz).toJSDate(), y: hourlyProduction.values[i] };
    });

    const todayIsPower = todayMetric === "power";
    const todayPowerPoints = datasetPoints.map((p) => ({ x: p.x, y: (p.y || 0) / 1000 }));
    const hourlyEnergyKwh = Array.from({ length: 24 }, () => 0);
    datasetPoints.forEach((p, i, arr) => {
        const kw = (Number(p.y) || 0) / 1000;
        const prev = arr[i - 1];
        let dtHours = 5 / 60;
        if (prev?.x && p?.x) {
            const ms = new Date(p.x).getTime() - new Date(prev.x).getTime();
            if (Number.isFinite(ms) && ms > 0) dtHours = ms / 3.6e6;
        }
        const hour = DateTime.fromJSDate(new Date(p.x)).setZone(system_tz || "America/Chicago").hour;
        if (hour >= 0 && hour < 24) hourlyEnergyKwh[hour] += kw * dtHours;
    });
    const todayEnergyBars = hourlyEnergyKwh.map((v) => Math.round(v * 100) / 100);
    const todayEnergyPoints = todayEnergyBars.map((y, h) => ({
        x: chartDay.plus({ hours: h, minutes: 30 }).toJSDate(),
        y,
    }));
    const todayPowerMax = niceAxisMax(Math.max(...todayPowerPoints.map((p) => p.y), 0.01));
    const todayEnergyMax = niceAxisMax(Math.max(...todayEnergyBars, 0.01));
    const todayChartUnit = todayIsPower ? "kW" : "kWh";
    const powerAlpha = todayIsPower ? 1 : 0;
    const energyAlpha = todayIsPower ? 0 : 1;

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setweatherLoading] = useState(true);
    const [weatherError, SetweatherError] = useState(null);
    useEffect(() => {
        if (!lat || !lon) return;
        const controller = new AbortController();
        async function fetchWeather() {
            try {
                setweatherLoading(true);
                SetweatherError(null);
                const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal: controller.signal });
                if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to fetch weather data"); }
                const data = await res.json();
                if (!data || !data.current) throw new Error("Weather data missing current values");
                setWeather(data);
            } catch (err) {
                if (err.name !== "AbortError") { SetweatherError(err.message); }
            } finally { setweatherLoading(false); }
        }
        fetchWeather();
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);
        return () => { clearInterval(interval); controller.abort(); };
    }, [lat, lon]);

    const weatherUI = {
        Sunny: { icon: '☀️', title: 'Clear Sky', message: 'Perfect for solar generation' },
        'Mostly Sunny': { icon: '🌤️', title: 'Mostly Sunny', message: 'Great solar conditions' },
        'Partly Sunny': { icon: '🌤️', title: 'Partly Sunny', message: 'Moderate solar conditions' },
        'Partly Cloudy': { icon: '⛅', title: 'Partly Cloudy', message: 'Moderate solar output expected' },
        'Mostly Cloudy': { icon: '⛅', title: 'Mostly Cloudy', message: 'Reduced solar output expected' },
        Cloudy: { icon: '☁️', title: 'Cloudy', message: 'Reduced solar efficiency' },
        'Slight Chance Rain Showers': { icon: '☁️', title: 'Cloudy', message: 'Reduced solar efficiency' },
        Rain: { icon: '🌧️', title: 'Rainy', message: 'Low solar generation expected' },
        Thunderstorms: { icon: '⛈️', title: 'Stormy', message: 'Solar generation disrupted' },
        'Slight Chance Showers And Thunderstorms': { icon: '⛈️', title: 'Slight Chance Storms', message: 'Possible showers or storms; solar output may vary' },
        'Chance Showers And Thunderstorms': { icon: '⛈️', title: 'Chance Storms', message: 'Showers and thunderstorms likely; reduced solar output' },
        'Showers And Thunderstorms': { icon: '⛈️', title: 'Showers & Storms', message: 'Showers and thunderstorms expected; solar generation disrupted' },
        default: { icon: '🌡️', title: 'Weather Update', message: 'Conditions are changing' },
    };

    const condition = weather?.current?.condition;
    //console.log(condition); //WEATHER ICON TESTER
    const weatherDisplay = weatherUI[condition] || weatherUI.default;

    const [menuOpen, setMenuOpen] = useState(false);
    const [isNarrow, setIsNarrow] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(max-width: 1000px)');
        setIsNarrow(mq.matches);
        const handler = (e) => setIsNarrow(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    const [tempUnit, setTempUnit] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('tempUnit') || 'F';
        return 'F';
    });
    const toDisplayTemp = (celsius) => {
        if (celsius == null || celsius === '—') return '—';
        if (tempUnit === 'F') return Math.round(celsius * 9/5 + 32);
        return celsius;
    };
    const tempSymbol = tempUnit === 'F' ? '°F' : '°C';
    const toggleTempUnit = () => setTempUnit(prev => {
        const next = prev === 'F' ? 'C' : 'F';
        if (typeof window !== 'undefined') localStorage.setItem('tempUnit', next);
        return next;
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTowerIndex, setSelectedTowerIndex] = useState(0);
    const [selectedInverterId, setSelectedInverterId] = useState(null);
    useEffect(() => {
        if (!inverterGroups.length) {
            setSelectedInverterId(null);
            return;
        }
        setSelectedInverterId((prev) => (
            inverterGroups.some((g) => g.id === prev) ? prev : inverterGroups[0].id
        ));
    }, [inverterGroups]);
    const [historicalPeriod, setHistoricalPeriod] = useState("daily");
    const [isWide, setIsWide] = useState(false);
    const mainScrollRef = useRef(null);
    const section1Ref = useRef(null);
    const diagnosticsRef = useRef(null);
    const controlRef = useRef(null);
    const historicalRef = useRef(null);
    const [activeSection, setActiveSection] = useState("dashboard");

    const [currentTime, setCurrentTime] = useState(() =>
        DateTime.now().setZone(system_tz || "America/Chicago").toFormat("hh:mm:ss a")
    );

    useEffect(() => {
        const tz = system_tz || "America/Chicago";
        const tick = () => setCurrentTime(DateTime.now().setZone(tz).toFormat("hh:mm:ss a"));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [system_tz]);
    const [pageVisible, setPageVisible] = useState(
        () => (typeof document !== "undefined" ? !document.hidden : true),
    );

    useEffect(() => {
        const onVis = () => setPageVisible(!document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    useEffect(() => {
        if (!pageVisible || todayHovered) return undefined;
        const id = setInterval(() => {
            setTodayMetric((prev) => (prev === "power" ? "energy" : "power"));
        }, TODAY_METRIC_INTERVAL_MS);
        return () => clearInterval(id);
    }, [pageVisible, todayHovered]);

    const [fifaBrandingOn, setFifaBrandingOn] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("fifaBranding");
            if (stored !== null) return stored === "true";
        }
        return true;
    });

    const toggleFifaBranding = () => setFifaBrandingOn((prev) => {
        const next = !prev;
        if (typeof window !== "undefined") localStorage.setItem("fifaBranding", String(next));
        return next;
    });

    const [dfwBrandingOn, setDfwBrandingOn] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("dfwBranding");
            if (stored !== null) return stored === "true";
        }
        return false;
    });

    const toggleDfwBranding = () => setDfwBrandingOn((prev) => {
        const next = !prev;
        if (typeof window !== "undefined") localStorage.setItem("dfwBranding", String(next));
        return next;
    });

    useEffect(() => {
        const dfwActive = dfwBrandingOn && !(isFifaDallasSystem(system) && fifaBrandingOn);
        if (!dfwActive) {
            setEsgView("tree");
            return undefined;
        }
        if (!pageVisible || esgHovered) return undefined;
        const id = setInterval(() => {
            setEsgView((prev) => (prev === "tree" ? "tower" : "tree"));
        }, TODAY_METRIC_INTERVAL_MS);
        return () => clearInterval(id);
    }, [dfwBrandingOn, fifaBrandingOn, system, pageVisible, esgHovered]);

    const [liveCarbonKg, setLiveCarbonKg] = useState(0);
    const carbonApiKwhRef = useRef(0);
    const carbonLiveKwhRef = useRef(0);
    const carbonLastTickRef = useRef(Date.now());

    useEffect(() => {
        if (totalProduction == null) return;
        carbonApiKwhRef.current = totalProduction;
        carbonLiveKwhRef.current = 0;
        carbonLastTickRef.current = Date.now();
        setLiveCarbonKg(totalProduction * CO2_KG_PER_KWH);
    }, [totalProduction]);

    useEffect(() => {
        if (!pageVisible) return;
        const tick = () => {
            const now = Date.now();
            const deltaHours = (now - carbonLastTickRef.current) / 3600000;
            carbonLastTickRef.current = now;
            if (pvPower > 50) {
                carbonLiveKwhRef.current += (pvPower / 1000) * deltaHours;
            }
            setLiveCarbonKg(
                (carbonApiKwhRef.current + carbonLiveKwhRef.current) * CO2_KG_PER_KWH,
            );
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [pageVisible, pvPower]);

    const carbonGoalKg = nextCarbonGoalKg(liveCarbonKg);
    const treesPlanted = Math.floor(liveCarbonKg / KG_PER_TREE);
    const treeFillPercent = (liveCarbonKg % KG_PER_TREE) / KG_PER_TREE;

    useEffect(() => {
        const count = system?.towers?.length ?? 0;
        if (count > 0 && selectedTowerIndex >= count) setSelectedTowerIndex(count - 1);
    }, [system?.towers?.length, selectedTowerIndex]);

    const scrollToSection = (ref, pathWithHash) => {
        const mainEl = mainScrollRef.current;
        const sectionEl = ref?.current;
        if (mainEl && sectionEl) {
            const mainRect = mainEl.getBoundingClientRect();
            const sectionRect = sectionEl.getBoundingClientRect();
            mainEl.scrollTo({ top: mainEl.scrollTop + (sectionRect.top - mainRect.top), behavior: "smooth" });
        } else if (sectionEl) {
            sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (pathWithHash && typeof window !== "undefined") window.history.replaceState(null, "", pathWithHash);
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash;
        const id = setTimeout(() => {
            if (hash === "#diagnostics") scrollToSection(diagnosticsRef, "/dashboard#diagnostics");
            else if (hash === "#control") scrollToSection(controlRef, "/dashboard#control");
            else if (hash === "#historical") scrollToSection(historicalRef, "/dashboard#historical");
        }, 200);
        return () => clearTimeout(id);
    }, []);

    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash;
            if (hash === "#diagnostics") { scrollToSection(diagnosticsRef, "/dashboard#diagnostics"); setActiveSection("diagnostics"); }
            else if (hash === "#control") { scrollToSection(controlRef, "/dashboard#control"); setActiveSection("control"); }
            else if (hash === "#historical") { scrollToSection(historicalRef, "/dashboard#historical"); setActiveSection("historical"); }
            else setActiveSection("dashboard");
        };
        const h = window.location.hash;
        if (h === "#diagnostics") setActiveSection("diagnostics");
        else if (h === "#control") setActiveSection("control");
        else if (h === "#historical") setActiveSection("historical");
        else setActiveSection("dashboard");
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    const SECTIONS = useMemo(() => [
        { ref: section1Ref, id: "dashboard" },
        { ref: controlRef, id: "control" },
        { ref: diagnosticsRef, id: "diagnostics" },
        { ref: historicalRef, id: "historical" },
    ], []);

    const scrollSpyUpdateRef = useRef(null);
    const updateActiveFromScroll = useCallback(() => {
        const THRESHOLD = 160;
        let bestId = "dashboard", bestTop = -Infinity;
        let fallbackId = "dashboard", fallbackTop = -Infinity;
        for (const { ref: r, id } of SECTIONS) {
            const el = r?.current;
            if (!el) continue;
            const top = el.getBoundingClientRect().top;
            if (top <= THRESHOLD && top > bestTop) { bestTop = top; bestId = id; }
            if (top < window.innerHeight && top > fallbackTop) { fallbackTop = top; fallbackId = id; }
        }
        const next = bestTop > -Infinity ? bestId : fallbackId;
        setActiveSection((prev) => (next === prev ? prev : next));
    }, [SECTIONS]);
    scrollSpyUpdateRef.current = updateActiveFromScroll;

    const scrollSpyHandler = useCallback(() => { scrollSpyUpdateRef.current?.(); }, []);
    const setMainRef = useCallback((el) => {
        if (mainScrollRef.current && !el) mainScrollRef.current.removeEventListener("scroll", scrollSpyHandler);
        mainScrollRef.current = el;
        if (el) { el.addEventListener("scroll", scrollSpyHandler, { passive: true }); scrollSpyUpdateRef.current?.(); }
    }, [scrollSpyHandler]);

    useLayoutEffect(() => {
        if (!system?.id) return;
        updateActiveFromScroll();
    }, [system?.id, updateActiveFromScroll]);

    if (loading || systemloading) {
        return <p className="bg-[#dfe0e2] w-screen h-screen flex items-center justify-center text-black text-2xl">Loading...</p>;
    }
    if (!session) {
        return <p className="bg-[#dfe0e2] w-screen h-screen flex items-center justify-center text-black text-2xl">Unauthorized...</p>;
    }
    if (!system) {
        return <p className="bg-[#dfe0e2] w-screen h-screen flex items-center justify-center text-black text-2xl">No system data found...</p>;
    }
    if (!user) {
        return <p>User not found or not logged in</p>;
    }

    const towerCount = system?.towers?.length ?? 0;
    const selectedTower = system?.towers?.[selectedTowerIndex];
    const orientationAngle = selectedTower?.tower_angle ?? null;
    const orientationAngleNum = !isNaN(parseFloat(orientationAngle)) ? parseFloat(orientationAngle).toFixed(2) : "—";
    const towerRotationDeg = !isNaN(parseFloat(orientationAngle)) ? parseFloat(orientationAngle) : 0;
    const canAccessControlPanel = session?.role === "ADMIN" || session?.planTier === "COMMERCIAL";

    // Control actions
    const controlActions = [
        { id: "start",   label: "Start",   description: "Power on tower and start automated tracking", Icon: Power,     lightCls: "bg-[#4A9E78] hover:bg-[#238276] focus:ring-[#2A9D8F]" },
        { id: "restart", label: "Restart", description: "Reboot tower systems and all components",     Icon: RotateCcw, lightCls: "bg-[#F3B664] hover:bg-[#e0a04d] focus:ring-[#F3B664]" },
        { id: "stop",    label: "Stop",    description: "Emergency stop all operations",               Icon: X,         lightCls: "bg-[#e57373] hover:bg-[#ef5350] focus:ring-[#e57373]" },
        { id: "reset",   label: "Reset",   description: "Reset tower to default factory settings",     Icon: RotateCcw, lightCls: "bg-[#b91c1c] hover:bg-[#991b1b] focus:ring-[#b91c1c]" },
        { id: "home",    label: "Home",    description: "Return tower to home position",               Icon: Home,      lightCls: "bg-[#374151] hover:bg-[#4b5563] focus:ring-[#374151]" },
    ];

    // ─── Shared style helpers ───────────────────────────────────────────────
    // sectionLabel replaced by T.text3 inline — kept for safety
    const sectionLabel = { fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "inherit" };

    const isFifaPage = isFifaDallasSystem(system);
    const isFifa = isFifaPage && fifaBrandingOn;
    const isDfwPage = isDfwAirportSystem(system);
    const isDfw = dfwBrandingOn && !isFifa;
    const esgIsTower = isDfw && esgView === "tower";
    const showBattery = Boolean(system?.has_battery);
    const yearlyMwhSum = Array.isArray(yearlyProduction?.values) && yearlyProduction.values.length
        ? yearlyProduction.values.reduce((s, v) => s + (Number(v) || 0), 0)
        : null;
    const lifetimeMwh = yearlyMwhSum != null
        ? yearlyMwhSum
        : (totalProduction != null ? Number(totalProduction) / 1000 : null);
    const ytdKwh = Array.isArray(monthlyProduction?.values)
        ? monthlyProduction.values.reduce((s, v) => s + (Number(v) || 0), 0)
        : 0;
    const monthToDateKwh = Array.isArray(dailyProduction?.values)
        ? dailyProduction.values.reduce((s, v) => s + (Number(v) || 0), 0)
        : 0;
    const recordYears = yearlyProduction?.labels?.length || yearlyProduction?.values?.length || 0;
    const selectInverter = (id) => {
        setSelectedInverterId(id);
        const group = inverterGroups.find((g) => g.id === id);
        const first = group?.towers?.[0];
        if (first && Number.isInteger(first.originalIndex)) {
            setSelectedTowerIndex(first.originalIndex);
        }
    };
    const selectedInverter = inverterGroups.find((g) => g.id === selectedInverterId) || null;
    const flowShare = selectedInverter && pvPowerKw > 0.001
        ? Math.min(1, Math.max(0, selectedInverter.powerKw / pvPowerKw))
        : 1;
    const flowPvPower = Math.round(pvPower * flowShare);
    const flowGridPower = Math.round(gridPower * flowShare);
    const flowLoadPower = Math.round(loadPower * flowShare);
    const flowBattChargePower = battChargePower == null ? null : Math.round(battChargePower * flowShare);
    const flowPvKw = flowPvPower / 1000;
    const T = isFifa
        ? getFifaDashboardTheme(isDark)
        : isDfw
            ? getDfwDashboardTheme(isDark)
            : getTheme(isDark);
    const pageBackground = isFifa
        ? getFifaPageBackground(isDark, T.pageBg)
        : isDfw
            ? getDfwPageBackground(isDark, T.pageBg)
            : T.pageBg;
    const fifaHeaderRaw = isFifa ? getFifaHeaderStyle(isDark) : null;
    const dfwHeaderRaw = isDfw ? getDfwHeaderStyle(isDark) : null;
    const headerIconColor = fifaHeaderRaw?.iconColor || dfwHeaderRaw?.iconColor;
    const headerStyle = fifaHeaderRaw
        ? (({ iconColor, ...css }) => css)(fifaHeaderRaw)
        : dfwHeaderRaw
            ? (({ iconColor, ...css }) => css)(dfwHeaderRaw)
            : null;

    const GAUGE_R = 54;
    const GAUGE_CIRC = 2 * Math.PI * GAUGE_R;
    const gaugeDashOffset = GAUGE_CIRC * (1 - safePowerPercent);

    return (
        <div
            className="flex flex-col h-screen overflow-hidden w-full antialiased [text-rendering:optimizeLegibility]"
            style={{ background: pageBackground, color: T.text1 }}
        >
            <div className="flex flex-1 min-h-0">
                <Sidebar activeSection={activeSection} onSectionChange={(id) => {
                    setActiveSection(id);
                    if (id === "dashboard") {
                        const mainEl = mainScrollRef.current;
                        if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
                        if (typeof window !== "undefined") window.history.replaceState(null, "", "/dashboard");
                        return;
                    }
                    const refMap = { diagnostics: diagnosticsRef, control: controlRef, historical: historicalRef };
                    scrollToSection(refMap[id], `/dashboard#${id}`);
                }} systemName={system?.system_name} isNarrow={isNarrow} branding={isFifa ? 'fifa' : isDfw ? 'dfw' : 'default'} />

                <div
                    className="relative flex-1 flex flex-col min-w-0 min-h-0"
                    style={{
                        background: pageBackground,
                        marginLeft: isNarrow ? 0 : SIDEBAR_COLLAPSED_W,
                    }}
                >
                    {isFifa && <FifaSoccerBackdrop isDark={isDark} />}
                    {isDfw && <DfwHexBackdrop isDark={isDark} />}
                    <main ref={setMainRef} className="relative z-[1] flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-0 md:pb-0 [.mobile_&]:pb-16">
                        <div
                            ref={section1Ref}
                            id="section-1"
                            className="flex flex-col lg:h-full lg:max-h-full lg:overflow-hidden"
                            style={{ background: T.sectionBg }}
                        >
        {/* ── Header ── */}
                        <header
                            className="flex items-center justify-between px-6 h-14 shrink-0 overflow-hidden relative z-20"
                            style={headerStyle
                                ? headerStyle
                                : isDark
                                ? {
                                    background: "rgba(12,12,13,0.92)",
                                    borderBottom: `0.5px solid ${T.border}`,
                                  }
                                : {
                                    background: "linear-gradient(to right, rgba(26,37,53,0.96) 0%, rgba(26,37,53,0.80) 25%, rgba(26,37,53,0.45) 55%, rgba(242,242,242,0.0) 100%)",
                                    borderBottom: "1px solid rgba(26,37,53,0.15)",
                                  }
                            }
                        >

                            <div className="h-14 w-48 overflow-hidden flex items-center justify-start shrink-0">
                                <img
                                    src="/images/Janta_Power_Business_Card_Logo.jpeg"
                                    alt="Janta Power"
                                    className="w-auto max-w-none pointer-events-none select-none"
                                    style={{ height: 100, transform: "translateY(8px)" }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {isFifaPage && (
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={fifaBrandingOn}
                                        aria-label={fifaBrandingOn ? "Turn off FIFA branding" : "Turn on FIFA branding"}
                                        className="p-2 rounded-lg transition-opacity cursor-pointer"
                                        style={{ opacity: fifaBrandingOn ? 1 : 0.45 }}
                                        onClick={toggleFifaBranding}
                                    >
                                        <img
                                            src="/images/soccer-ball-icon.png"
                                            alt=""
                                            className="w-5 h-5 object-contain pointer-events-none select-none"
                                            draggable={false}
                                        />
                                    </button>
                                )}
                                <button
                                        type="button"
                                        role="switch"
                                        aria-checked={dfwBrandingOn}
                                        aria-label={dfwBrandingOn ? "Turn off DFW branding" : "Turn on DFW branding"}
                                        className="p-2 rounded-lg transition-opacity cursor-pointer"
                                        style={{
                                            opacity: dfwBrandingOn && !isFifa ? 1 : 0.45,
                                            color: headerIconColor || (isDark ? "rgba(244,244,245,0.62)" : "#2F3E4D"),
                                        }}
                                        onClick={toggleDfwBranding}
                                    >
                                        <Plane {...iconProps(ICON_LG)} />
                                    </button>
                                <button
                                    type="button"
                                    aria-label={isDark ? "Light mode" : "Dark mode"}
                                    className="p-2 rounded-lg transition-colors cursor-pointer"
                                    style={{ color: headerIconColor
                                        ? headerIconColor
                                        : isDark ? "rgba(244,244,245,0.62)" : "#2F3E4D" }}
                                    onClick={toggleDark}
                                >
                                    {isDark ? <Sun {...iconProps(ICON_LG)} /> : <Moon {...iconProps(ICON_LG)} />}
                                </button>
                                <button
                                    type="button"
                                    aria-label="Menu"
                                    className="p-2 rounded-lg transition-colors cursor-pointer"
                                    style={{ color: headerIconColor
                                        ? headerIconColor
                                        : isDark ? "rgba(244,244,245,0.62)" : "#2F3E4D" }}
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    {menuOpen ? <X {...iconProps(ICON_LG)} /> : <Menu {...iconProps(ICON_LG)} />}
                                </button>
                            </div>
                        </header>

                        {/* ════════════════════════════════════════
                            SECTION 1 — System Status + Today at a Glance
                        ════════════════════════════════════════ */}
                        <section
                            className={`px-8 flex-1 min-h-0 ${isDfw ? "pt-5 pb-3" : "py-10 pb-6"} lg:flex lg:flex-col lg:overflow-hidden`}
                        >
                            <div className={`flex items-end justify-between gap-4 shrink-0 ${isDfw ? "mb-2" : "mb-5"}`}>
                                <div className="flex flex-col gap-0.5">
                                    {isFifa && (
                                        <span
                                            className="text-[10px] font-bold tracking-[0.14em] uppercase"
                                            style={{ color: FIFA_ORANGE }}
                                        >
                                            Fair Park, TX
                                        </span>
                                    )}
                                    {isDfw && (
                                        <>
                                            <span
                                                className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.08em]"
                                                style={{ color: T.green }}
                                            >
                                                <PulseDot color={T.green} />
                                                Live
                                            </span>
                                            <p
                                                className="text-[13px] font-bold tracking-[0.15em] uppercase tabular-nums"
                                                style={{ color: T.text3 }}
                                            >
                                                DFW Airport, TX
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    {isFifa && (
                                        <span
                                            className="text-[10px] font-bold tracking-[0.14em] uppercase"
                                            style={{ color: FIFA_ORANGE }}
                                        >
                                            WORLD CUP 26
                                        </span>
                                    )}
                                    {isDfw && (
                                        <span
                                            className="text-[10px] font-bold tracking-[0.14em] uppercase"
                                            style={{ color: DFW_ORANGE }}
                                        >
                                            Innovation DFW
                                        </span>
                                    )}
                                    <p
                                        className="text-[13px] font-bold tracking-[0.15em] uppercase tabular-nums"
                                        style={{ color: T.text3 }}
                                        aria-live="polite"
                                    >
                                        {currentTime}
                                    </p>
                                </div>
                            </div>

                            {/* ── Hero: Power Output, Today's Data, Environmental Impact ── */}
                            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-4 items-stretch lg:flex-1 lg:min-h-0 ${isDfw ? "mb-4 lg:mb-3" : "mb-12 lg:mb-4"}`}>

                                {/* Power Output */}
                                <div
                                    className="lg:col-span-3 rounded-xl overflow-hidden flex flex-col h-full janta-card-shimmer"
                                    style={cardSurface(T)}
                                >
                                    <div className="px-5 h-12 flex items-center shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                                        <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Power Output</p>
                                    </div>
                                    <div className="flex flex-1 min-h-0 min-w-0 items-center justify-center overflow-hidden px-4 py-2 lg:[container-type:size]">
                                        <div className="relative size-[200px] lg:size-[min(200px,100cqmin)] lg:[container-type:size]">
                                            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet" aria-hidden>
                                                <circle cx="60" cy="60" r={GAUGE_R} fill="transparent" stroke={T.gaugeTrack} strokeWidth="6" />
                                                <circle
                                                    cx="60" cy="60" r={GAUGE_R}
                                                    fill="transparent"
                                                    stroke={T.gaugeRing}
                                                    strokeWidth="6"
                                                    strokeDasharray={GAUGE_CIRC}
                                                    strokeDashoffset={gaugeDashOffset}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 60 60)"
                                                    className="[transition:stroke-dashoffset_1s_ease-out]"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5 px-3">
                                                <span
                                                    className="font-[200] leading-none tracking-[-0.02em] tabular-nums"
                                                    style={{ color: T.text1, fontSize: "clamp(1.25rem, 22cqmin, 2.75rem)" }}
                                                >
                                                    {pvPowerKw.toFixed(2)}
                                                </span>
                                                <span
                                                    className="font-normal tracking-[0.15em] uppercase"
                                                    style={{ color: T.text3, fontSize: "clamp(0.5rem, 7cqmin, 0.875rem)" }}
                                                >
                                                    kilowatts
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full px-5 py-3 flex justify-around shrink-0" style={{ borderTop: `0.5px solid ${T.border}` }}>
                                        <div className="text-center">
                                            <p className="text-[13px] uppercase tracking-[0.10em] mb-1" style={{ color: T.text3 }}>Daily Total</p>
                                            <p className="text-[15px] font-light tabular-nums" style={{ color: T.text1 }}>{(displayDailyTotal ?? 0).toFixed(1)} kWh</p>
                                        </div>
                                        <div className="w-px self-stretch" style={{ background: T.border }} />
                                        <div className="text-center">
                                            <p className="text-[13px] uppercase tracking-[0.10em] mb-1" style={{ color: T.text3 }}>Peak Today</p>
                                            <p className="text-[15px] font-light tabular-nums" style={{ color: T.text1 }}>{peakTodayKw.toFixed(2)} kW</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Data — primary */}
                                <div
                                    className="lg:col-span-6 rounded-xl overflow-hidden flex flex-col h-full janta-card-shimmer"
                                    style={cardSurface(T)}
                                    onMouseEnter={() => setTodayHovered(true)}
                                    onMouseLeave={() => setTodayHovered(false)}
                                >
                                    <div className="px-5 h-12 flex items-center justify-between shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                                        <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Today&apos;s Data</p>
                                        <div className="relative h-[13px] w-[13.75rem]">
                                            <p
                                                className="absolute right-0 top-0 text-[13px] tracking-[0.08em] whitespace-nowrap"
                                                style={{
                                                    color: T.text3,
                                                    opacity: todayIsPower ? 1 : 0,
                                                    transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                                }}
                                            >
                                                Hourly Power Production
                                            </p>
                                            <p
                                                className="absolute right-0 top-0 text-[13px] tracking-[0.08em] whitespace-nowrap"
                                                style={{
                                                    color: T.text3,
                                                    opacity: todayIsPower ? 0 : 1,
                                                    transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                                }}
                                            >
                                                Hourly Energy Production
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 px-5 py-4">
                                        {hourlyProduction?.values?.length && fullDayDates?.length ? (
                                            <div className="h-full">
                                                <Line
                                                    data={{
                                                        datasets: [
                                                            {
                                                                type: "line",
                                                                label: "Power (kW)",
                                                                data: todayPowerPoints,
                                                                yAxisID: "y",
                                                                borderColor: withAlpha(T.amber, powerAlpha),
                                                                backgroundColor: withAlpha(T.amberDim, powerAlpha),
                                                                fill: "start",
                                                                borderWidth: 1.5,
                                                                pointRadius: 0,
                                                                pointHoverRadius: todayIsPower ? 3 : 0,
                                                                tension: 0.35,
                                                                order: 1,
                                                            },
                                                            {
                                                                type: "line",
                                                                label: "Energy (kWh)",
                                                                data: todayEnergyPoints,
                                                                yAxisID: "y",
                                                                borderColor: withAlpha(T.amber, energyAlpha),
                                                                backgroundColor: withAlpha(T.amberDim, energyAlpha),
                                                                fill: "start",
                                                                borderWidth: 1.5,
                                                                pointRadius: 0,
                                                                pointHoverRadius: todayIsPower ? 0 : 3,
                                                                tension: 0.35,
                                                                order: 2,
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        resizeDelay: 80,
                                                        animation: { duration: TODAY_METRIC_FADE_MS, easing: "easeInOutQuad" },
                                                        layout: { padding: { top: 8, right: 4, bottom: 0, left: 0 } },
                                                        interaction: { mode: "index", intersect: false },
                                                        scales: {
                                                            x: {
                                                                type: "time",
                                                                adapters: { date: { zone: system_tz } },
                                                                min: fullDayDates[0],
                                                                max: fullDayDates[fullDayDates.length - 1],
                                                                grid: { display: false },
                                                                border: { display: false },
                                                                ticks: { color: T.text3, font: { size: 12 }, maxTicksLimit: 6, padding: 8 },
                                                            },
                                                            y: {
                                                                position: "left",
                                                                min: 0,
                                                                max: todayIsPower ? todayPowerMax : todayEnergyMax,
                                                                grid: { color: T.chartGrid, drawBorder: false },
                                                                border: { display: false },
                                                                ticks: { color: T.text3, font: { size: 12 }, padding: 8 },
                                                            },
                                                        },
                                                        plugins: {
                                                            legend: { display: false },
                                                            tooltip: {
                                                                ...chartHoverCard(T, isDark, { unit: todayChartUnit }),
                                                                filter: (item) => (todayIsPower ? item.datasetIndex === 0 : item.datasetIndex === 1),
                                                            },
                                                            idleSheen: {
                                                                datasetIndex: todayIsPower ? 0 : 1,
                                                                color: T.amber,
                                                                durationMs: 6800,
                                                            },
                                                        },
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-sm" style={{ color: T.text3 }}>Loading chart data...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Environmental Impact */}
                                <div
                                    className="lg:col-span-3 rounded-xl overflow-hidden flex flex-col h-full min-h-0 relative janta-card-shimmer"
                                    style={cardSurface(T)}
                                    onMouseEnter={isDfw ? () => setEsgHovered(true) : undefined}
                                    onMouseLeave={isDfw ? () => setEsgHovered(false) : undefined}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
                                        style={{
                                            opacity: esgIsTower ? 0 : 1,
                                            transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                        }}
                                    >
                                        <FallingLeaves T={T} isDark={isDark} />
                                    </div>
                                    <div className="relative z-[2] px-5 h-12 shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                                        <div
                                            className="absolute inset-x-5 inset-y-0 flex items-center justify-between gap-3"
                                            style={{
                                                opacity: esgIsTower ? 0 : 1,
                                                transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                            }}
                                        >
                                            <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>ESG Impact</p>
                                            <p className="text-[13px] tabular-nums shrink-0" style={{ color: T.text3 }}>
                                                {Math.round(carbonGoalKg).toLocaleString()} kg goal
                                            </p>
                                        </div>
                                        {isDfw && (
                                            <div
                                                className="absolute inset-x-5 inset-y-0 flex items-center justify-between gap-3"
                                                style={{
                                                    opacity: esgIsTower ? 1 : 0,
                                                    transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                                }}
                                            >
                                                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Tower angle</p>
                                                <span
                                                    className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.08em] shrink-0"
                                                    style={{ color: DFW_BLUE }}
                                                >
                                                    <PulseDot color={DFW_BLUE} />
                                                    Azimuthal tracking
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-h-0 relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 p-5 flex flex-col"
                                            style={{
                                                opacity: esgIsTower ? 0 : 1,
                                                transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                            }}
                                        >
                                            <div className="absolute inset-x-0 top-10 bottom-0 flex items-end justify-center pointer-events-none z-0">
                                                <div className="h-full w-auto max-h-full max-w-[95%] origin-bottom translate-y-[6px]">
                                                    <div className="h-full w-auto origin-bottom janta-tree-sway">
                                                        <TreeImpactIcon
                                                            percent={treeFillPercent}
                                                            fillColor={T.amber}
                                                            trackColor={isDark ? T.amberDim : T.gaugeTrack}
                                                            isDark={isDark}
                                                            className="h-full w-full max-h-full min-h-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="relative z-[2] text-[36px] font-[200] leading-none tracking-[-0.02em] tabular-nums whitespace-nowrap" style={{ color: T.amber }}>
                                                {liveCarbonKg.toFixed(2)}<span className="text-lg font-light ml-1">kg CO₂</span>
                                            </p>
                                            <p className="relative z-[2] text-sm tabular-nums mt-2" style={{ color: T.text2 }}>
                                                ≈ {treesPlanted.toLocaleString()} trees planted
                                            </p>
                                        </div>
                                        {isDfw && (
                                            <div
                                                className="absolute inset-0 min-h-0"
                                                style={{
                                                    opacity: esgIsTower ? 1 : 0,
                                                    transition: `opacity ${TODAY_METRIC_FADE_MS}ms ease`,
                                                }}
                                            >
                                                <div className="absolute inset-x-0 top-8 bottom-0 flex items-end justify-center pointer-events-none z-0">
                                                    <div className="h-full w-auto max-h-full max-w-[95%] origin-bottom translate-x-20 translate-y-[2px]">
                                                        <TowerImpactIcon
                                                            fillColor={DFW_ORANGE_DEEP}
                                                            isDark={isDark}
                                                            className="h-full w-full max-h-full min-h-0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="absolute left-0 -translate-x-6 top-4 w-[64%] h-[54%] pointer-events-none z-[1]">
                                                    <EsgFacingCompass degrees={towerRotationDeg} T={T} isDark={isDark} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`grid grid-cols-1 gap-5 lg:gap-4 items-stretch lg:flex-1 lg:min-h-0 lg:mb-0 ${isDfw || showBattery ? "md:grid-cols-2 mb-12" : "mb-12"}`}>
                                <div className="rounded-xl overflow-hidden flex flex-col h-full janta-card-shimmer"
                                    style={cardSurface(T)}
                                >
                                    <div className="px-5 h-12 flex items-center justify-between shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                                        <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Climate</p>
                                        <button
                                            type="button"
                                            onClick={toggleTempUnit}
                                            className="flex items-center rounded-full overflow-hidden text-[11px] font-semibold"
                                            style={{ border: `0.5px solid ${T.border2}` }}
                                            aria-label="Toggle temperature unit"
                                        >
                                            <span className="py-[2px] px-[7px] transition-all duration-200" style={{ background: tempUnit === "F" ? T.amber : "transparent", color: tempUnit === "F" ? (isDark ? "#000" : "#fff") : T.text3 }}>°F</span>
                                            <span className="py-[2px] px-[7px] transition-all duration-200" style={{ background: tempUnit === "C" ? T.amber : "transparent", color: tempUnit === "C" ? (isDark ? "#000" : "#fff") : T.text3 }}>°C</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 min-h-0 flex flex-col">
                                        <FieldConditions
                                            T={T}
                                            condition={weather?.current?.condition || weatherDisplay.title}
                                            tempDisplay={toDisplayTemp(weather?.current?.temp)}
                                            tempSymbol={tempSymbol}
                                            humidity={weather?.current?.humidity}
                                            windMph={weather?.current?.wind_speed}
                                            loading={weatherLoading}
                                            error={weatherError}
                                            showHeader={false}
                                        />
                                        <div className={`px-5 ${isDfw ? "py-2 mt-auto" : "py-2.5 mt-auto"}`} style={{ borderTop: `0.5px solid ${T.border}` }}>
                                            <p className="text-[13px] tracking-[0.10em] mb-1.5" style={{ color: T.text3 }}>Today&apos;s Conditions</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Sparkline
                                                        values={weather?.hourly?.slice(0, 24).map(h => h.humidity ?? 0) ?? [weather?.current?.humidity ?? 0]}
                                                        color="#7BAFD4" unit="%" startHour={new Date().getHours()}
                                                        T={T} isDark={isDark}
                                                    />
                                                    <p className="text-[11px] mt-1" style={{ color: T.text3 }}>Updated {currentTime}</p>
                                                </div>
                                                <div>
                                                    <Sparkline
                                                        values={weather?.hourly?.slice(0, 24).map(h => toDisplayTemp(h.temp) ?? 0) ?? [toDisplayTemp(weather?.current?.temp) ?? 0]}
                                                        color="#f97316" unit={tempSymbol} startHour={new Date().getHours()}
                                                        T={T} isDark={isDark}
                                                    />
                                                    <p className="text-[11px] mt-1" style={{ color: T.text3 }}>Feels like {toDisplayTemp((weather?.current?.temp ?? 15) - 2)}{tempSymbol}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isDfw ? (
                                    <DfwSustainabilityCard T={T} ytdKwh={ytdKwh} />
                                ) : showBattery ? (
                                    <BatterySection
                                        T={T}
                                        battSoc={battSoc}
                                        battChargePower={battChargePower}
                                        loadPower={loadPower}
                                        pvPowerKw={pvPowerKw}
                                        embedded
                                    />
                                ) : null}
                            </div>

                        </section>
                        </div>

                        {/* ════════════════════════════════════════
                            SECTION 2 — Flow, Controls, Diagnostics, Record
                        ════════════════════════════════════════ */}
                        <section
                            className="py-10 px-8 pt-8"
                            style={{ background: T.section2Bg }}
                        >
                            {/* ── Live Energy Flow / System Controls ── */}
                            <div ref={controlRef} id="control" className="scroll-mt-24">
                                <div className={`grid grid-cols-1 gap-5 ${inverterGroups.length > 0 ? "lg:grid-cols-5 lg:items-stretch" : ""}`}>
                                    {inverterGroups.length > 0 && (
                                        <div className="lg:col-span-2 min-h-[420px] lg:min-h-0">
                                            <TowersProduction
                                                T={T}
                                                groups={inverterGroups}
                                                selectedInverterId={selectedInverterId}
                                                onInverterSelect={selectInverter}
                                            />
                                        </div>
                                    )}
                                    <div className={inverterGroups.length > 0 ? "lg:col-span-3 min-h-0" : ""}>
                                        <EnergyFlowPanel
                                            pvPower={flowPvPower}
                                            gridPower={flowGridPower}
                                            gridImport={gridImport}
                                            loadPower={flowLoadPower}
                                            battSoc={battSoc}
                                            hasBattery={showBattery}
                                            battChargePower={flowBattChargePower}
                                            todaysProduction={displayDailyTotal}
                                            maxHourlyPower={maxHourlyPower}
                                            towerCount={towerCount}
                                            selectedTowerIndex={selectedTowerIndex}
                                            onTowerSelect={setSelectedTowerIndex}
                                            towerRotationDeg={towerRotationDeg}
                                            orientationAngleNum={orientationAngleNum}
                                            latitude={lat}
                                            longitude={lon}
                                            canAccessControlPanel={canAccessControlPanel}
                                            showControlActions={false}
                                            inverterGroups={inverterGroups}
                                            selectedInverterId={selectedInverterId}
                                            onInverterSelect={selectInverter}
                                            showInverterTabs={inverterGroups.length === 0}
                                            hubFlow={isDfwPage ? (
                                                <DfwLiveFlow
                                                    T={T}
                                                    isDark={isDark}
                                                    pvPowerKw={flowPvKw}
                                                    loadPower={flowLoadPower}
                                                    gridPower={flowGridPower}
                                                    gridImport={gridImport}
                                                    battSoc={battSoc}
                                                    hasBattery={showBattery}
                                                    battChargePower={flowBattChargePower}
                                                    hubLabel={selectedInverter?.id || "SITE"}
                                                    embedded
                                                />
                                            ) : null}
                                            isDark={isDark}
                                            branding={isFifa ? "fifa" : isDfw ? "dfw" : "default"}
                                            systemTimezone={system_tz}
                                            isCommercial={session?.planTier === "COMMERCIAL"}
                                            cardBorder={T.cardBorder}
                                            cardRadius={T.cardRadius}
                                            cardShadow={T.cardShadow}
                                        />
                                    </div>
                                </div>
                                {canAccessControlPanel && (
                                    <div id="tower-controls" className="mt-5">
                                        <TowerControlActions
                                            T={T}
                                            isDark={isDark}
                                            isFifa={isFifa || isDfw}
                                            actions={controlActions}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ── Historical Data ── */}
                            <div ref={historicalRef} id="historical" className="scroll-mt-24 mt-12">
                                <div className="rounded-xl overflow-hidden mb-6 janta-card-shimmer"
                                    style={cardSurface(T)}
                                >
                                    <div className="px-5 h-12 flex items-center justify-between gap-4 shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                                        <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Historical Data</p>
                                        <div className="flex items-center gap-1">
                                            {[{ id: "daily", label: "Daily" }, { id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly" }].map(({ id, label }) => (
                                                <button key={id} type="button" onClick={() => setHistoricalPeriod(id)}
                                                    className={TOOLBAR_BTN}
                                                    style={toolbarBtnStyle(historicalPeriod === id, T, isDark)}
                                                >{label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-5 pt-3 flex items-baseline justify-between gap-3">
                                        <p className="text-[13px]" style={{ color: T.text3 }}>
                                            {historicalPeriod === "daily" && "Energy per day, this month"}
                                            {historicalPeriod === "monthly" && "Energy per month, this year"}
                                            {historicalPeriod === "yearly" && "Energy per year"}
                                        </p>
                                        <p className="text-[13px] tabular-nums shrink-0" style={{ color: T.text2 }}>
                                            {historicalPeriod === "daily" && (
                                                <>{monthToDateKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ color: T.text3 }}>kWh this month</span></>
                                            )}
                                            {historicalPeriod === "monthly" && (
                                                <>{ytdKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ color: T.text3 }}>kWh YTD</span></>
                                            )}
                                            {historicalPeriod === "yearly" && yearlyProduction?.values?.length > 0 && (
                                                <>{Number(yearlyProduction.values[yearlyProduction.values.length - 1] || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span style={{ color: T.text3 }}>MWh this year</span></>
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-5 min-h-[300px] pt-3">
                                        {historicalPeriod === "daily" && dailyProduction?.values?.length > 0 && (
                                            <div className="h-[260px]">
                                                <Bar data={{ labels: (dailyProduction.labels || dailyProduction.values.map((_, i) => i + 1)).slice(0, dailyProduction.values.length), datasets: [{ label: "Energy (kWh)", data: (dailyProduction.values || []).map(v => Math.round((v ?? 0) * 100) / 100), backgroundColor: T.amber, borderRadius: 3, barPercentage: 0.8, categoryPercentage: 0.9 }] }}
                                                    options={historicalBarOptions(T, isDark, "kWh")}
                                                />
                                            </div>
                                        )}
                                        {historicalPeriod === "monthly" && monthlyProduction?.values?.length > 0 && (
                                            <div className="h-[260px]">
                                                <Bar data={{ labels: monthLabels.slice(0, (monthlyProduction.values || []).length), datasets: [{ label: "Energy (kWh)", data: (monthlyProduction.values || []).map(v => Math.round((v ?? 0) * 100) / 100), backgroundColor: T.amber, borderRadius: 3, barPercentage: 0.8, categoryPercentage: 0.9 }] }}
                                                    options={historicalBarOptions(T, isDark, "kWh")}
                                                />
                                            </div>
                                        )}
                                        {historicalPeriod === "yearly" && yearlyProduction?.values?.length > 0 && (
                                            <div className="h-[260px]">
                                                <Bar data={{ labels: (yearlyProduction.labels || yearlyProduction.values.map((_, i) => `${i + 1}`)).slice(0, (yearlyProduction.values || []).length), datasets: [{ label: "Energy (MWh)", data: (yearlyProduction.values || []).map(v => Math.round((v ?? 0) * 100) / 100), backgroundColor: T.amber, borderRadius: 3, barPercentage: 0.4, categoryPercentage: 0.5 }] }}
                                                    options={historicalBarOptions(T, isDark, "MWh")}
                                                />
                                            </div>
                                        )}
                                        {((historicalPeriod === "daily" && !dailyProduction?.values?.length) || (historicalPeriod === "monthly" && !monthlyProduction?.values?.length) || (historicalPeriod === "yearly" && !yearlyProduction?.values?.length)) && (
                                            <div className="h-[260px] flex items-center justify-center">
                                                <p className="text-sm" style={{ color: T.text3 }}>Loading chart data...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`mb-6 mt-12 ${isDfw && showBattery ? "grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch" : ""}`}>
                                {isDfw && showBattery && (
                                    <BatterySection
                                        T={T}
                                        battSoc={battSoc}
                                        battChargePower={battChargePower}
                                        loadPower={loadPower}
                                        pvPowerKw={pvPowerKw}
                                        embedded
                                    />
                                )}
                                <SystemOfRecord
                                    T={T}
                                    system={system}
                                    inverterGroups={inverterGroups}
                                    lifetimeMwh={lifetimeMwh}
                                    recordYears={recordYears}
                                />
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            {/* Dropdown menu */}
            {menuOpen && (
                <div
                    className="fixed top-24 right-6 w-56 rounded-lg shadow-lg py-2 z-50"
                    style={{ background: T.cardBg, border: T.cardBorder }}
                >
                    <p className="px-4 py-2 text-base font-semibold" style={{ color: T.text1 }}>{user?.name || "Guest"}</p>
                    <div style={{ borderTop: `0.5px solid ${T.border}` }} aria-hidden />
                    <Link href="/settings" className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: T.text2 }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        onClick={() => setMenuOpen(false)}>Settings</Link>
                    <Link href="/contact" className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: T.text2 }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        onClick={() => setMenuOpen(false)}>Contact us</Link>
                    {session?.role === "ADMIN" && (
                        <Link href="/systemselect" className="block px-4 py-2 text-sm transition-colors"
                            style={{ color: T.text2 }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                            onClick={() => setMenuOpen(false)}>Systems</Link>
                    )}
                    <button
                        onClick={async () => {
                            try { await fetch("/api/logout", { method: "GET" }); window.location.href = "/?loggedout=true"; }
                            catch (err) { console.error("Logout failed:", err); }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer bg-transparent border-0"
                        style={{ color: T.text2 }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >Log Out</button>
                </div>
            )}
        </div>
    );
}
