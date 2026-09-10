"use client";
import React, { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { getSolarPosition, getSolarDateTime, sunPositionOnDiagram } from "@/lib/solarPosition";
import { getFifaEnergyPanelTheme } from "@/lib/fifaDashboardTheme";
import { getDfwEnergyPanelTheme } from "@/lib/dfwDashboardTheme";
import { SunIcon, GridIcon, HouseIcon, BatteryIcon } from "@/components/EnergyFlowIcons";
import PulseDot from "@/components/PulseDot";

function getFireflyCount(timezone) {
    const now = DateTime.now().setZone(timezone || "America/Chicago");
    const h = now.hour;
    const m = now.minute;
    const totalMinutes = h * 60 + m;
    const SUNSET = 19 * 60 + 30;
    if (h < 12) {
        const decreaseIntervals = Math.floor(totalMinutes / 30);
        return Math.max(0, 52 - decreaseIntervals * 4);
    }
    if (totalMinutes < SUNSET) return 0;
    const minutesSinceSunset = totalMinutes - SUNSET;
    const intervals = Math.floor(minutesSinceSunset / 30);
    return Math.min(52, 25 + intervals * 3);
}

function FireflyCanvas({ count = 0, palette = "amber" }) {
    const colors = palette === "orange"
        ? { core: "255,120,60", mid: "240,78,35", hot: "255,200,140" }
        : { core: "255,215,80", mid: "212,168,83", hot: "255,230,120" };
    const canvasRef  = useRef(null);
    const countRef   = useRef(count);
    const visibleRef = useRef(true);
    countRef.current = count;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const io = new IntersectionObserver(
            ([entry]) => { visibleRef.current = entry.isIntersecting; },
            { threshold: 0.05 },
        );
        io.observe(canvas);
        const ctx = canvas.getContext("2d");
        let animId, t = 0, lastDraw = 0;

        function resize() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        function spawnFly(w, h) {
            const inSides = Math.random() < 0.75;
            let x;
            if (inSides) {
                x = Math.random() < 0.5
                    ? Math.random() * w * 0.33
                    : w * 0.67 + Math.random() * w * 0.33;
            } else {
                x = w * 0.33 + Math.random() * w * 0.34;
            }
            return {
                x, y: Math.random() * (h + 20) - 10, baseX: x,
                vy: -(Math.random() * 0.35 + 0.08),
                sineFreq: Math.random() * 0.012 + 0.004,
                sineAmp: Math.random() * 18 + 6,
                sineOffset: Math.random() * Math.PI * 2,
                pulseFreq: Math.random() * 0.04 + 0.01,
                pulseOff: Math.random() * Math.PI * 2,
                radius: Math.random() * 1.8 + 0.5,
                baseAlpha: Math.random() * 0.55 + 0.2,
            };
        }

        const flies = [];
        const w = canvas.width || 800, h = canvas.height || 420;
        for (let i = 0; i < countRef.current; i++) flies.push(spawnFly(w, h));

        function draw(now = 0) {
            animId = requestAnimationFrame(draw);
            if (!visibleRef.current) return;
            if (now - lastDraw < 1000 / 30) return;
            lastDraw = now;
            t += 0.033;
            const cw = canvas.width, ch = canvas.height;
            if (flies.length < countRef.current) flies.push(spawnFly(cw, ch));
            else if (flies.length > countRef.current) flies.pop();
            ctx.clearRect(0, 0, cw, ch);
            for (const f of flies) {
                f.y += f.vy;
                f.x = f.baseX + Math.sin(t * f.sineFreq + f.sineOffset) * f.sineAmp;
                if (f.y < -10) {
                    f.y = ch + 5;
                    const nf = spawnFly(cw, ch);
                    f.baseX = nf.baseX; f.x = f.baseX;
                }
                const alpha = f.baseAlpha * (0.5 + 0.5 * Math.sin(t * f.pulseFreq + f.pulseOff));
                const radial = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 7);
                radial.addColorStop(0,   `rgba(${colors.core},${alpha})`);
                radial.addColorStop(0.3, `rgba(${colors.mid},${alpha * 0.7})`);
                radial.addColorStop(0.7, `rgba(${colors.mid},${alpha * 0.15})`);
                radial.addColorStop(1,   "rgba(0,0,0,0)");
                ctx.beginPath(); ctx.arc(f.x, f.y, f.radius * 7, 0, Math.PI * 2);
                ctx.fillStyle = radial; ctx.fill();
                ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colors.hot},${Math.min(1, alpha * 1.4)})`; ctx.fill();
            }
        }
        draw();
        return () => { cancelAnimationFrame(animId); ro.disconnect(); io.disconnect(); };
    }, []);

    if (count === 0) return null;
    return (
        <canvas ref={canvasRef} style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 1,
        }} />
    );
}

const DK = {
    bg:       "#0c0c0d",
    surface:  "#161618",
    surface2: "#1c1c1f",
    border:   "rgba(255,255,255,0.08)",
    border2:  "rgba(255,255,255,0.14)",
    text1:    "#f4f4f5",
    text2:    "rgba(244,244,245,0.80)",
    text3:    "rgba(244,244,245,0.58)",
    amber:    "#e6b85c",
    amberDim: "rgba(230,184,92,0.14)",
    green:    "rgba(74,222,128,0.75)",
    red:      "#ef4444",
    orange:   "#f97316",
    purple:   "#a78bfa",
    teal:     "#2dd4bf",
    cardRadius: 12,
    cardShadow: "none",
};

const LT = {
    bg:       "#FAFBFD",
    surface:  "#FFFFFF",
    surface2: "#F8F8F8",
    border:   "rgba(0,0,0,0.08)",
    border2:  "rgba(0,0,0,0.14)",
    text1:    "#2F3E4D",
    text2:    "#6A7B8F",
    text3:    "#9AABB8",
    amber:    "#E8A020",
    amberDim: "rgba(232,160,32,0.12)",
    green:    "#2A9D8F",
    red:      "#dc2626",
    orange:   "#ea580c",
    purple:   "#7c3aed",
    teal:     "#0d9488",
    cardRadius: 20,
    cardShadow: "0 4px 6px rgba(26,37,53,0.04), 0 8px 24px rgba(26,37,53,0.08), 0 1px 2px rgba(26,37,53,0.06)",
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
/** White PNG → #2F3E4D navy for light-mode default (non-FIFA) system controls */
const TOWER_ICON_FILTER_NAVY = "brightness(0) saturate(100%) invert(20%) sepia(28%) saturate(1100%) hue-rotate(186deg) brightness(88%) contrast(90%)";
/** White PNG → FIFA lime (dark mode system controls) */
const TOWER_ICON_FILTER_FIFA_LIME = "brightness(0) saturate(100%) invert(88%) sepia(47%) saturate(4260%) hue-rotate(22deg) brightness(104%) contrast(101%)";
/** White PNG → FIFA orange (light mode system controls) */
const TOWER_ICON_FILTER_FIFA_TEAL = "brightness(0) saturate(100%) invert(15%) sepia(42%) saturate(1800%) hue-rotate(142deg) brightness(92%) contrast(98%)";

function diagramBoxBackground(T, branded, isDark) {
    const gradientCount = (T.bg.match(/gradient\(/g) || []).length;
    if (gradientCount > 1) {
        // Grid + multi-layer gradients breaks background-size and tiles into a harsh checkerboard
        return { background: T.bg };
    }

    const gridLine = branded
        ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(88, 88, 88, 0.06)")
        : (isDark ? "rgba(255,255,255,0.03)" : "rgba(26, 37, 53, 0.025)");
    const grid = `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`;

    if (gradientCount === 1) {
        return {
            backgroundImage: `${grid}, ${T.bg}`,
            backgroundSize: "64px 64px, auto",
        };
    }

    return {
        backgroundColor: T.bg,
        backgroundImage: grid,
        backgroundSize: "64px 64px",
    };
}

function towerIconFilter(isFifa, isDark) {
    if (!isFifa) return isDark ? "none" : TOWER_ICON_FILTER_NAVY;
    return isDark ? TOWER_ICON_FILTER_FIFA_LIME : TOWER_ICON_FILTER_FIFA_TEAL;
}
const degToRad = (d) => (d * Math.PI) / 180;
const DIAGRAM_ASPECT_W = 520;
const DIAGRAM_ASPECT_H = 300;
const DIAGRAM_ASPECT_H_ADMIN = 285; // taller ratio so full-width layout doesn't look squished
const CENTER_BIAS_Y_FRAC = -0.06; // shift diagram up to center tower + compass

const ACTION_ICON_COLORS = {
    start:   "#4A9E78",
    restart: "#E8A020",
    stop:    "#dc2626",
    reset:   "#b91c1c",
    home:    "#4a5568",
};

function azimuthToCardinal(az) {
    const d = ((Number(az) % 360) + 360) % 360;
    if (d >= 337.5 || d < 22.5) return "N";
    if (d < 67.5) return "NE";
    if (d < 112.5) return "E";
    if (d < 157.5) return "SE";
    if (d < 202.5) return "S";
    if (d < 247.5) return "SW";
    if (d < 292.5) return "W";
    return "NW";
}

function Node({ left, top, children }) {
    return (
        <div style={{
            position: "absolute", left, top,
            transform: "translate(-50%, -50%)", zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 5, pointerEvents: "none",
        }}>
            {children}
        </div>
    );
}

function nodeCardFill(theme) {
    const bg = theme?.cardBg || theme?.surface;
    if (typeof bg === "string" && !bg.includes("gradient")) return bg;
    return theme?.surface || "#161618";
}

function NodeLabel({ value, unit, label, sub, color, theme = DK }) {
    return (
        <div style={{
            textAlign: "left",
            minWidth: 118,
            padding: "8px 12px 8px 14px",
            background: nodeCardFill(theme),
            border: `0.5px solid ${theme.border}`,
            borderRadius: theme.cardRadius || 12,
            boxShadow: theme.cardShadow || "none",
            position: "relative",
            overflow: "hidden",
            lineHeight: 1,
        }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color }} />
            {label && (
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.text3, marginBottom: 6 }}>
                    {label}
                </p>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 18, fontWeight: 200, color: theme.text1, letterSpacing: "-0.02em" }}>{value}</span>
                <span style={{ fontSize: 11, color: theme.text2 }}>{unit}</span>
            </div>
            {sub && <p style={{ fontSize: 11, color: theme.text3, marginTop: 4 }}>{sub}</p>}
        </div>
    );
}

const TOOLBAR_BTN = "text-[13px] font-medium py-[5px] px-3 rounded cursor-pointer transition-all duration-[150ms]";

function toolbarBtnStyle(active, theme, isDark) {
    return {
        background: active ? theme.amber : "transparent",
        color: active ? (isDark ? "#000" : "#fff") : theme.text2,
        border: `0.5px solid ${active ? theme.amber : theme.border}`,
    };
}

export default function EnergyFlowPanel({
    pvPower = 0, gridPower = 0, gridImport = false, loadPower = 0,
    battSoc = null, hasBattery = false, battChargePower = null,
    todaysProduction = null, maxHourlyPower = 0,
    towerCount = 1, selectedTowerIndex = 0, onTowerSelect,
    towerRotationDeg = 0, orientationAngleNum = "—",
    latitude, longitude,
    canAccessControlPanel = false,
    controlActions = [],
    showControlActions = true,
    hubFlow = null,
    inverterGroups = [],
    selectedInverterId = null,
    onInverterSelect,
    showInverterTabs = true,
    isDark = true,
    branding = "default",
    systemTimezone = "America/Chicago",
    isCommercial = false,
    cardBorder,
    cardRadius,
    cardShadow,
}) {
    const isFifa = branding === "fifa";
    const isDfw = branding === "dfw";
    const T = isFifa
        ? getFifaEnergyPanelTheme(isDark)
        : isDfw
            ? getDfwEnergyPanelTheme(isDark)
            : (isDark ? DK : LT);
    const [solar, setSolar] = useState({ azimuth: 90, elevation: 45, visible: true });
    const [fireflyCount, setFireflyCount] = useState(() => getFireflyCount(systemTimezone));
    const diagramRef = useRef(null);
    // Start with a stable fallback so SVG lines don't "snap" from (0,0) on first paint.
    const [diagramSize, setDiagramSize] = useState({ w: DIAGRAM_ASPECT_W, h: DIAGRAM_ASPECT_H });
    const [hoveredActionId, setHoveredActionId] = useState(null);

    useEffect(() => {
        if (!isDark) return;
        const tick = () => setFireflyCount(getFireflyCount(systemTimezone));
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [isDark, systemTimezone]);

    useEffect(() => {
        const lat = Number(latitude);
        const lon = Number(longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        const tick = () => setSolar(getSolarPosition(lat, lon, getSolarDateTime(systemTimezone)));
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, [latitude, longitude, systemTimezone]);

    const pvKw   = (pvPower   / 1000).toFixed(2);
    const gridKw = (gridPower / 1000).toFixed(2);
    const loadKw = (loadPower / 1000).toFixed(2);

    const solarActive  = pvPower   > 50;
    const gridActive   = gridPower > 50;
    const loadActive   = loadPower > 50;
    const battActive   = hasBattery && battChargePower !== null && Math.abs(battChargePower) > 50;
    const battCharging = (battChargePower ?? 0) > 0;
    const gridColor    = gridImport ? T.orange : T.teal;
    const TOWER_HALF   = 100;

    const showRightPanel = !isCommercial && (showControlActions || !canAccessControlPanel);
    const rightPanelStyle = showRightPanel ? {
        flex: "0 0 30%",
        minWidth: 260,
        maxWidth: 400,
    } : null;

    useEffect(() => {
        const el = diagramRef.current;
        if (!el) return;

        const update = () => {
            const r = el.getBoundingClientRect();
            const w = Math.max(0, Math.round(r.width));
            const h = Math.max(0, Math.round(r.height));
            setDiagramSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { w: W, h: H } = diagramSize;
    const cx = W / 2;
    const cy = H / 2 + H * CENTER_BIAS_Y_FRAC;

    // Below this width: strip to sun + line + tower only (phone / collapsed view)
    const isCompact = W < 1000;

    // Scale tower & halo to available space so the ring radius stays meaningful.
    const towerSize = clamp(Math.round(Math.min(W, H) * 0.58), 220, 320);
    const haloSize = clamp(Math.round(towerSize * 1.12), 260, 380);
    const nodeRadius = (() => {
        const pad = 18;
        const nodeSlot = 96; // icon + label footprint approximation
        const r = Math.min(W, H) / 2 - pad - nodeSlot / 2;
        return clamp(r, 120, 320);
    })();

    const hasCoords = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
    const sensorAzimuth = !isNaN(parseFloat(orientationAngleNum))
        ? parseFloat(orientationAngleNum)
        : null;
    const solarAzimuth = hasCoords ? solar.azimuth : towerRotationDeg;
    const towerFacingAzimuth = sensorAzimuth ?? towerRotationDeg;

    // Shared center — compass, tower, sun azimuth, and tracking line
    const diagramCx = cx;
    const diagramCy = cy;
    const compassR = haloSize * 0.4;
    const sunRadius = compassR + 58;

    const pos = (angleDeg) => ({
        x: cx + nodeRadius * Math.cos(degToRad(angleDeg)),
        y: cy + nodeRadius * Math.sin(degToRad(angleDeg)),
    });

    const sunAz = hasCoords ? solarAzimuth : towerRotationDeg;
    const P = {
        tower: { x: diagramCx, y: diagramCy },
        sun: sunPositionOnDiagram(diagramCx, diagramCy, sunRadius, sunAz),
        grid: pos(-21),
        house: pos(40),
        battery: pos(152),
    };

    const effectiveTowerCount = Math.max(towerCount, 1);

    const statsRows = [
        { label: "Solar",  value: pvKw,  unit: "kW",
          sub: `${(todaysProduction ?? 0).toFixed(1)} kWh today`,
          color: solarActive ? T.amber : T.text3 },
        ...(gridActive ? [{ label: gridImport ? "Importing" : "Exporting",
          value: gridKw, unit: "kW", sub: "Grid",
          color: gridActive ? gridColor : T.text3 }] : []),
        ...(loadActive ? [{ label: "Load",  value: loadKw, unit: "kW", sub: "Consumption",
          color: loadActive ? T.purple : T.text3 }] : []),
        { label: "Peak",  value: `${maxHourlyPower}`, unit: "kW",
          sub: "Today's max", color: T.text2 },
        ...(hasBattery ? [{
            label: "Battery", value: `${battSoc ?? 0}`, unit: "%",
            sub: battActive ? (battCharging ? "Charging" : "Discharging") : "Standby",
            color: T.green,
        }] : []),
    ];

    return (
        <div className="overflow-hidden w-full h-full janta-card-shimmer"
            style={{
                background: T.surface,
                border: cardBorder ?? `0.5px solid ${T.border}`,
                borderRadius: cardRadius ?? 12,
                boxShadow: cardShadow,
                "--card-shimmer": T.amber,
            }}>

            <div className="flex items-center justify-between gap-3 px-5 h-12 shrink-0"
                style={{ borderBottom: `0.5px solid ${T.border}` }}>
                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>
                    Live Energy Flow
                </p>
                <div className="flex items-center gap-2 min-w-0">
                    {showInverterTabs && inverterGroups.length > 0
                        ? inverterGroups.map((g) => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => onInverterSelect?.(g.id)}
                                className={TOOLBAR_BTN}
                                style={toolbarBtnStyle(selectedInverterId === g.id, T, isDark)}
                            >
                                {g.id}
                            </button>
                        ))
                        : showInverterTabs
                        ? Array.from({ length: effectiveTowerCount }, (_, i) => (
                            <button key={i} type="button" onClick={() => onTowerSelect?.(i)}
                                className={TOOLBAR_BTN}
                                style={{
                                    ...toolbarBtnStyle(selectedTowerIndex === i, T, isDark),
                                    cursor: effectiveTowerCount > 1 ? "pointer" : "default",
                                }}>Tower {i + 1}</button>
                        ))
                        : null}
                    {hubFlow && (
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.08em]" style={{ color: T.green }}>
                            <PulseDot color={T.green} />
                            Live
                        </span>
                    )}
                </div>
            </div>

            {hubFlow && (
                <div>
                    {hubFlow}
                </div>
            )}

            {/* Body — original sun/tower diagram. Hidden when a hub flow is embedded. */}
            {!hubFlow && (
            <div style={{ display: "flex", alignItems: "stretch" }}>

                {/* LEFT: Diagram — grows with window; aspect ratio keeps proportions */}
                <div style={{
                    flex: isCommercial || !showRightPanel ? "1 1 0" : "1 1 70%",
                    minWidth: 0,
                    position: "relative",
                    aspectRatio: `${DIAGRAM_ASPECT_W} / ${isCommercial ? DIAGRAM_ASPECT_H : DIAGRAM_ASPECT_H_ADMIN}`,
                    ...diagramBoxBackground(T, isFifa || isDfw, isDark),
                    overflow: "hidden",
                }} ref={diagramRef}>
                    {isDark && <FireflyCanvas count={fireflyCount} palette={isFifa || isDfw ? "orange" : "amber"} />}

                    <div style={{
                        position: "absolute",
                        bottom: 14,
                        left: 16,
                        zIndex: 5,
                        lineHeight: 1,
                        pointerEvents: "none",
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 200, color: T.text1, letterSpacing: "-0.02em" }}>
                            {orientationAngleNum}
                            <span style={{ fontSize: 13, fontWeight: 300, color: T.text2 }}>°</span>
                        </span>
                    </div>

                    <svg viewBox={`0 0 ${Math.max(1, W)} ${Math.max(1, H)}`} preserveAspectRatio="none"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                            pointerEvents: "none", zIndex: 2 }}>
                        <defs>
                            {[["amb",T.amber],["org",T.orange],["tel",T.teal],["pur",T.purple],["grn",T.green]].map(([id,color]) => (
                                <marker key={id} id={`ef-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <path d="M2 1L8 5L2 9" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
                                </marker>
                            ))}
                            <style>{`
                                @keyframes solarFlow {
                                    from { stroke-dashoffset: 280; }
                                    to   { stroke-dashoffset: 0; }
                                }
                                @keyframes lineFlow {
                                    from { stroke-dashoffset: 200; }
                                    to   { stroke-dashoffset: 0; }
                                }
                                @keyframes ghostPulse {
                                    0%, 100% { opacity: 0.06; }
                                    50%      { opacity: 0.14; }
                                }
                            `}</style>
                        </defs>
                        {/* Ghost traces */}
                        {solar.visible && <line x1={P.tower.x} y1={P.tower.y} x2={P.sun.x} y2={P.sun.y}
                            stroke={T.amberDim} strokeWidth="1.2" strokeDasharray="5 5" opacity={isDark ? 0.55 : 0.45} />}
                        {!isCompact && <>
                        <line x1={P.tower.x+TOWER_HALF} y1={P.tower.y-14} x2={P.grid.x-28} y2={P.grid.y+10}
                            stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)"} strokeWidth="1.2" strokeDasharray="5 5" />
                        <line x1={P.tower.x+TOWER_HALF} y1={P.tower.y+20} x2={P.house.x-30} y2={P.house.y-22}
                            stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)"} strokeWidth="1.2" strokeDasharray="5 5" />
                        {hasBattery && <line x1={P.battery.x+22} y1={P.battery.y-14} x2={P.tower.x-TOWER_HALF} y2={P.tower.y+22}
                            stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)"} strokeWidth="1.2" strokeDasharray="5 5" />}
                        </>}
                        {/* Active lines — tower to sun */}
                        {solar.visible && <line x1={P.tower.x} y1={P.tower.y} x2={P.sun.x} y2={P.sun.y}
                            stroke={T.amber} strokeWidth="2.2" strokeDasharray="9 5" strokeLinecap="round" markerEnd="url(#ef-amb)"
                            opacity={solarActive ? 1 : 0.45}
                            style={solarActive ? { animation: "solarFlow 12s linear infinite" } : undefined} />}
                        {gridActive && gridImport && <line x1={P.grid.x-26} y1={P.grid.y+8} x2={P.tower.x+TOWER_HALF} y2={P.tower.y-12}
                            stroke={T.orange} strokeWidth="2.2" strokeDasharray="9 5" strokeLinecap="round" markerEnd="url(#ef-org)"
                            style={{ animation: "lineFlow 18s linear infinite" }} />}
                        {gridActive && !gridImport && <line x1={P.tower.x+TOWER_HALF} y1={P.tower.y-12} x2={P.grid.x-26} y2={P.grid.y+8}
                            stroke={T.teal} strokeWidth="2.2" strokeDasharray="9 5" strokeLinecap="round" markerEnd="url(#ef-tel)"
                            style={{ animation: "lineFlow 18s linear infinite" }} />}
                        {loadActive && <line x1={P.tower.x+TOWER_HALF} y1={P.tower.y+18} x2={P.house.x-28} y2={P.house.y-20}
                            stroke={T.purple} strokeWidth="2.2" strokeDasharray="9 5" strokeLinecap="round" markerEnd="url(#ef-pur)"
                            style={{ animation: "lineFlow 18s linear infinite 0.5s" }} />}
                        {battActive && battCharging && <line x1={P.battery.x+20} y1={P.battery.y-12} x2={P.tower.x-TOWER_HALF} y2={P.tower.y+20}
                            stroke={T.green} strokeWidth="2" strokeDasharray="7 5" strokeLinecap="round" markerEnd="url(#ef-grn)"
                            style={{ animation: "lineFlow 22s linear infinite 1s" }} />}
                        {battActive && !battCharging && <line x1={P.tower.x-TOWER_HALF} y1={P.tower.y+20} x2={P.battery.x+20} y2={P.battery.y-12}
                            stroke={T.green} strokeWidth="2" strokeDasharray="7 5" strokeLinecap="round" markerEnd="url(#ef-grn)"
                            style={{ animation: "lineFlow 22s linear infinite 1s" }} />}
                    </svg>

                    {/* Sun — live position (independent of compass) */}
                    {solar.visible && (
                        <Node left={`${P.sun.x}px`} top={`${P.sun.y}px`}>
                            <SunIcon active={solarActive || solar.elevation > 5} size={72} theme={T} isDark={isDark} />
                            {!isCompact && (
                                <NodeLabel
                                    value={solar.elevation.toFixed(0)}
                                    unit="°"
                                    label="Solar"
                                    sub={`Azimuth ${solar.azimuth.toFixed(0)}°`}
                                    color={T.amber}
                                    theme={T}
                                />
                            )}
                        </Node>
                    )}

                    {/* Tower halo */}
                    <div style={{
                        position: "absolute", left: `${P.tower.x}px`, top: `${P.tower.y}px`,
                        transform: "translate(-50%, -50%)", width: haloSize, height: haloSize,
                        borderRadius: "50%",
                        background: isDark
                            ? `radial-gradient(circle, ${T.amberDim} 0%, transparent 70%)`
                            : `radial-gradient(circle, ${T.amberDim} 0%, transparent 70%)`,
                        pointerEvents: "none", zIndex: 2,
                    }} />

                    {/* Compass — tower facing direction only */}
                    {(() => {
                        const r = compassR;
                        const cx2 = diagramCx;
                        const cy2 = diagramCy;
                        const needleRad = ((towerFacingAzimuth - 90) * Math.PI) / 180;
                        const needleLen = r * 0.52;
                        const nx = cx2 + Math.cos(needleRad) * needleLen;
                        const ny = cy2 + Math.sin(needleRad) * needleLen;
                        const labelColor = T.text2;
                        const needleColor = T.amber;
                        const ringColor = isDark
                            ? (isFifa || isDfw ? T.green : T.amber)
                            : (isFifa || isDfw ? T.border2 : T.amber);
                        const labelPad = 20;
                        return (
                            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, overflow: "visible" }}
                                viewBox={`0 0 ${Math.max(1,W)} ${Math.max(1,H)}`} preserveAspectRatio="none">
                                {/* Compass ring */}
                                <circle cx={cx2} cy={cy2} r={r} fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="3 6" strokeLinecap="round" />
                                {/* Cardinal labels — N, E, S, W */}
                                {[{ label: "N", a: -90 }, { label: "E", a: 0 }, { label: "S", a: 90 }, { label: "W", a: 180 }].map(({ label, a }) => {
                                    const rad = (a * Math.PI) / 180;
                                    const lx = cx2 + Math.cos(rad) * (r + labelPad);
                                    const ly = cy2 + Math.sin(rad) * (r + labelPad);
                                    return <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                                        fontSize="17" fontWeight="700" letterSpacing="0.1em" fill={labelColor}>{label}</text>;
                                })}
                                {/* Rotating needle */}
                                <line x1={cx2} y1={cy2} x2={nx} y2={ny}
                                    stroke={needleColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                                <circle cx={cx2} cy={cy2} r="3" fill={needleColor} opacity="0.6" />
                                {/* Facing direction + azimuth — hidden when compact */}
                                {!isCompact && <>
                                    <text x={cx2} y={cy2 + towerSize * 0.46}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fontSize="17" fontWeight="700" letterSpacing="0.12em" fill={needleColor}>
                                        {azimuthToCardinal(towerFacingAzimuth)}
                                    </text>
                                    <text x={cx2} y={cy2 + towerSize * 0.54}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fontSize="13" fontWeight="500" fill={T.text2}>
                                        {towerFacingAzimuth.toFixed(0)}° facing
                                    </text>
                                </>}
                            </svg>
                        );
                    })()}

                    {/* Tower — top-down illustration (compass needle shows facing) */}
                    <Node left={`${P.tower.x}px`} top={`${P.tower.y}px`}>
                        <div style={{
                            width: towerSize,
                            height: towerSize,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            zIndex: 4,
                        }}>
                            <img
                                src="/images/tower_icon_silhouette.png"
                                alt="Tower"
                                style={{
                                    width: Math.round(towerSize * 0.58),
                                    height: Math.round(towerSize * 0.58),
                                    objectFit: "contain",
                                    filter: towerIconFilter(isFifa, isDark),
                                }}
                            />
                        </div>
                    </Node>

                    {/* Grid + House — hidden in compact mode */}
                    {!isCompact && <>
                    <Node left={`${P.grid.x}px`} top={`${P.grid.y}px`}>
                        <GridIcon active={gridActive} importing={gridImport} size={66} theme={T} isDark={isDark} />
                        {gridActive && <NodeLabel value={gridKw} unit="kW"
                            label="Grid"
                            sub={gridImport ? "Importing" : "Exporting"}
                            color={gridColor} theme={T} />}
                    </Node>
                    <Node left={`${P.house.x}px`} top={`${P.house.y}px`}>
                        <HouseIcon active={loadActive} size={72} theme={T} isDark={isDark} />
                        {loadActive && <NodeLabel value={loadKw} unit="kW" label="Load"
                            sub="Consumption"
                            color={T.purple} theme={T} />}
                    </Node>
                    </>}

                    {/* Battery — hidden in compact mode */}
                    {!isCompact && hasBattery && (
                        <Node left={`${P.battery.x}px`} top={`${P.battery.y}px`}>
                            <BatteryIcon soc={battSoc} active={battActive} size={64} theme={T} isDark={isDark} />
                            <NodeLabel value={`${battSoc ?? 0}`} unit="%"
                                label="Battery"
                                sub={battActive ? (battCharging ? "Charging" : "Discharging") : "Standby"}
                                color={T.green} theme={T} />
                        </Node>
                    )}
                </div>

                {/* RIGHT: Admin/Non-commercial only */}
                {showRightPanel && (
                    <div style={{
                        ...rightPanelStyle,
                        display: "flex", flexDirection: "column", background: T.surface,
                        borderLeft: `0.5px solid ${T.border}`,
                    }}>
                        {canAccessControlPanel && showControlActions ? (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                                {controlActions.map((action, i) => {
                                    const isHovered = hoveredActionId === action.id;
                                    const iconColor = isHovered || (isDark && action.id === "home")
                                        ? "#fff"
                                        : (ACTION_ICON_COLORS[action.id] ?? T.text3);
                                    const actionHoverBg = isFifa || isDfw ? (T.orange || T.amber) : T.amber;
                                    return (
                                        <button
                                            key={action.id}
                                            type="button"
                                            className="w-full text-left flex items-center cursor-pointer"
                                            style={{
                                                flex: 1,
                                                padding: "16px 20px",
                                                background: isHovered ? actionHoverBg : "transparent",
                                                borderTop: i > 0 ? `0.5px solid ${T.border}` : "none",
                                                borderRight: "none",
                                                borderBottom: "none",
                                                borderLeft: "none",
                                                transition: "background 0.18s ease, color 0.18s ease",
                                            }}
                                            onMouseEnter={() => setHoveredActionId(action.id)}
                                            onMouseLeave={() => setHoveredActionId(null)}
                                        >
                                            <action.Icon style={{
                                                width: 16, height: 16, marginRight: 14, flexShrink: 0,
                                                color: iconColor,
                                                transition: "color 0.18s ease",
                                            }} />
                                            <div>
                                                <p style={{
                                                    fontSize: 13, fontWeight: 600, lineHeight: 1.3,
                                                    color: isHovered ? "#fff" : T.text1,
                                                    transition: "color 0.18s ease",
                                                }}>{action.label}</p>
                                                <p style={{
                                                    fontSize: 10, marginTop: 2,
                                                    color: isHovered ? "rgba(255,255,255,0.88)" : T.text3,
                                                    transition: "color 0.18s ease",
                                                }}>{action.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${T.border}` }}>
                                    <p style={{ fontSize: 11, fontWeight: 500, color: T.text1 }}>System Status</p>
                                </div>
                                {statsRows.map((row, i) => (
                                    <div key={row.label} style={{
                                        padding: "14px 20px",
                                        borderBottom: i < statsRows.length - 1 ? `0.5px solid ${T.border}` : "none",
                                    }}>
                                        <p style={{ fontSize: 10, color: T.text3, textTransform: "uppercase",
                                            letterSpacing: "0.10em", marginBottom: 5 }}>{row.label}</p>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                            <span style={{ fontSize: 20, fontWeight: 200, color: row.color,
                                                lineHeight: 1, letterSpacing: "-0.01em" }}>{row.value}</span>
                                            <span style={{ fontSize: 10, color: T.text2 }}>{row.unit}</span>
                                        </div>
                                        <p style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{row.sub}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
            )}

            {/* Commercial floating personality card */}
            {!hubFlow && isCommercial && (() => {
                const h = new Date().getHours();
                const a = parseFloat(orientationAngleNum);
                const atHome    = !isNaN(a) && Math.abs(a - 90) < 3;
                const isNight   = h >= 20 || h < 6;
                const isMorning = h >= 6 && h < 9;
                const isPeak    = h >= 10 && h < 15;

                const states = [
                    { msg: "Sleeping soundly... enjoy the fireflies ✨",
                      desc: "Tower is parked at 90° until sunrise", since: "Since sunset · resting",
                      active: isNight && atHome },
                    { msg: "Almost home... 🌙",
                      desc: "Returning to home position", since: "Moving now",
                      active: isNight && !atHome },
                    { msg: "Waiting for the sun to come out 🌤️",
                      desc: "Parked and ready, watching for daylight", since: "Since sunrise",
                      active: h >= 6 && h < 10 && pvPower <= 50 },
                    { msg: "Good morning! Time to work 🌅",
                      desc: "Sun is rising, starting to track", since: "Just started",
                      active: isMorning && pvPower > 50 },
                    { msg: "Working hard today! ⚡",
                      desc: `Producing ${(pvPower/1000).toFixed(2)} kW at peak hours`, since: "Peak hours active",
                      active: isPeak && pvPower > 500 },
                    { msg: "Chasing every ray I can ☁️",
                      desc: "Partly cloudy — still tracking the sun", since: "Tracking",
                      active: pvPower > 50 && pvPower <= 500 },
                    { msg: "Chasing the sun ☀️",
                      desc: `Actively tracking at ${isNaN(a) ? "—" : a.toFixed(1)}°`, since: "Actively tracking",
                      active: pvPower > 500 && !isPeak },
                    { msg: "Resting at home position 🏠",
                      desc: "Parked at 90°, standby", since: "Standby",
                      active: !isNight && atHome && pvPower <= 50 },
                ];

                const activeState = states.find(s => s.active) ?? states[0];

                return (
                    <div style={{
                        margin: "0 24px 20px", borderRadius: 18,
                        background: T.surface, overflow: "hidden", position: "relative",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04)",
                    }}>
                        {/* Amber glow */}
                        <div style={{
                            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                            background: `radial-gradient(ellipse at 50% 0%, ${T.amberDim} 0%, transparent 70%)`,
                        }} />

                        {/* Centered message */}
                        <div style={{
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 6, padding: "24px 40px",
                            position: "relative", textAlign: "center",
                        }}>
                            <p style={{
                                fontFamily: "'Caveat', cursive",
                                fontSize: 24, fontWeight: 500,
                                color: T.amber, lineHeight: 1.2, marginBottom: 2,
                            }}>{activeState.msg}</p>
                            <p style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>{activeState.desc}</p>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "4px 10px", borderRadius: 99, marginTop: 4,
                                background: T.amberDim,
                                border: `0.5px solid ${T.border}`,
                            }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%",
                                    background: T.amber, boxShadow: `0 0 5px ${T.amber}` }} />
                                <span style={{ fontSize: 10, color: T.amber, letterSpacing: "0.06em" }}>
                                    {activeState.since}
                                </span>
                            </div>
                        </div>

                        {/* Page indicator dots */}
                        <div style={{ display: "flex", justifyContent: "center",
                            alignItems: "center", gap: 6, paddingBottom: 16 }}>
                            {states.map((s, i) => (
                                <span key={i} style={{
                                    width: s.active ? 16 : 5, height: 5, borderRadius: 99,
                                    background: s.active ? T.amber : "rgba(255,255,255,0.15)",
                                    boxShadow: s.active ? `0 0 6px ${T.amber}` : "none",
                                    transition: "all 0.4s ease",
                                }} />
                            ))}
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}
