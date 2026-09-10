"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { ICON_LG, iconProps } from "@/lib/icons";
import { SunIcon, GridIcon, HouseIcon, BatteryIcon } from "@/components/EnergyFlowIcons";
import PulseDot from "@/components/PulseDot";

const VB = { w: 1100, h: 520 };
const HUB = { x: 550, y: 250 };

export default function DfwLiveFlow({
    T,
    isDark,
    pvPowerKw,
    loadPower,
    gridPower,
    gridImport,
    battSoc,
    hasBattery,
    battChargePower,
    hubLabel = "SITE",
    embedded = false,
    compact = false,
}) {
    const loadKw = (Number(loadPower) || 0) / 1000;
    const gridKw = (Number(gridPower) || 0) / 1000;
    const battKw = (Number(battChargePower) || 0) / 1000;
    const autonomyPct = loadKw > 0 ? Math.round(Math.min(100, (pvPowerKw / loadKw) * 100)) : 100;
    const [reduce, setReduce] = useState(true);
    useEffect(() => {
        setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, []);

    const iconTheme = {
        ...T,
        orange: T.orange || "#ea580c",
        purple: T.purple || "#7c3aed",
        teal: T.teal || "#0d9488",
    };

    const battState = battKw > 0.05 ? "Charging" : battKw < -0.05 ? "Discharging" : "Standby";
    const cardFill = typeof T.cardBg === "string" && !T.cardBg.includes("gradient")
        ? T.cardBg
        : (T.surface || (isDark ? "#161618" : "#FFFFFF"));

    const iconSize = compact ? 26 : 44;
    const cardW = compact ? 128 : 228;
    const nodes = [
        {
            id: "solar", x: 160, y: 110, title: "Solar",
            value: `${pvPowerKw.toFixed(2)} kW`, sub: "Production",
            color: T.amber, dir: "in", active: pvPowerKw > 0.01,
            Icon: () => <SunIcon active={pvPowerKw > 0.01} size={iconSize} theme={iconTheme} isDark={isDark} />,
        },
        {
            id: "grid", x: 160, y: 390, title: "Grid",
            value: `${gridKw.toFixed(2)} kW`, sub: gridImport ? "Importing" : "Exporting",
            color: gridImport ? (iconTheme.orange) : (iconTheme.teal), dir: gridImport ? "in" : "out",
            active: gridKw > 0.01,
            Icon: () => <GridIcon active={gridKw > 0.01} importing={gridImport} size={iconSize} theme={iconTheme} isDark={isDark} />,
        },
        {
            id: "battery", x: 550, y: 455, title: "Battery",
            value: hasBattery && battSoc != null ? `${Math.round(battSoc)}%` : "—",
            sub: hasBattery ? `${battState} · ${Math.abs(battKw).toFixed(1)} kW` : "No battery",
            color: T.green, dir: battKw >= 0 ? "out" : "in", active: Boolean(hasBattery),
            Icon: () => <BatteryIcon soc={battSoc} active={Boolean(hasBattery)} size={iconSize} theme={iconTheme} isDark={isDark} />,
        },
        {
            id: "load", x: 940, y: 110, title: "Load",
            value: `${loadKw.toFixed(2)} kW`, sub: "Consumption",
            color: iconTheme.purple, dir: "out", active: loadKw > 0.01,
            Icon: () => <HouseIcon active={loadKw > 0.01} size={iconSize} theme={iconTheme} isDark={isDark} />,
        },
        {
            id: "autonomy", x: 940, y: 390, title: "Autonomy",
            value: `${autonomyPct}%`, sub: "Self-supplied",
            color: T.green, dir: "out", active: true,
            Icon: () => (
                <span
                    className="flex items-center justify-center rounded-full"
                    style={{
                        width: iconSize, height: iconSize,
                        background: isDark ? "rgba(74,222,128,0.12)" : "rgba(42,157,143,0.12)",
                        color: T.green,
                    }}
                >
                    <Check {...iconProps(compact ? 14 : ICON_LG)} />
                </span>
            ),
        },
    ].filter((n) => n.id !== "battery" || hasBattery);

    const pathFor = (n) => {
        const a = n.dir === "in" ? n : HUB;
        const b = n.dir === "in" ? HUB : n;
        return `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;
    };

    const body = (
        <>
            <div className={compact ? "h-full min-h-0 px-2 py-1.5" : "px-4 pb-5 pt-4"}>
                <div className={compact ? "relative w-full h-full min-h-0" : "relative w-full"}>
                <svg
                    viewBox={`0 0 ${VB.w} ${VB.h}`}
                    className={compact ? "w-full h-full block max-h-full" : "w-full h-auto block"}
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <style>{`
                            @keyframes dfwFlowDash {
                                from { stroke-dashoffset: 200; }
                                to { stroke-dashoffset: 0; }
                            }
                        `}</style>
                    </defs>
                    <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r="58"
                        fill={isDark ? "rgba(255,255,255,0.04)" : "#EEF1F5"}
                        stroke={T.amber}
                        strokeWidth="2"
                    />
                    <text x={HUB.x} y={HUB.y - 8} textAnchor="middle" fontSize="12" letterSpacing="2.4" fill={T.text3}>{hubLabel}</text>
                    <text x={HUB.x} y={HUB.y + 18} textAnchor="middle" fontSize="20" fill={T.text1}>{autonomyPct}%</text>
                    {nodes.map((n) => {
                        const d = pathFor(n);
                        const pathId = `dfw-flow-${n.id}`;
                        return (
                            <g key={`link-${n.id}`}>
                                <path id={pathId} d={d} fill="none" stroke={T.border} strokeWidth="2" />
                                {n.active && !reduce && (
                                    <>
                                        <path
                                            d={d}
                                            fill="none"
                                            stroke={n.color}
                                            strokeWidth="2.2"
                                            strokeDasharray="9 5"
                                            strokeLinecap="round"
                                            opacity="0.9"
                                            style={{ animation: "dfwFlowDash 12s linear infinite" }}
                                        />
                                        {[0, 1, 2].map((i) => (
                                            <g key={`${n.id}-dot-${i}`}>
                                                <circle r="7" fill={n.color} opacity="0.22">
                                                    <animateMotion
                                                        dur="2.6s"
                                                        begin={`${i * 0.87}s`}
                                                        repeatCount="indefinite"
                                                        calcMode="linear"
                                                    >
                                                        <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
                                                    </animateMotion>
                                                </circle>
                                                <circle r="4.2" fill={n.color}>
                                                    <animateMotion
                                                        dur="2.6s"
                                                        begin={`${i * 0.87}s`}
                                                        repeatCount="indefinite"
                                                        calcMode="linear"
                                                    >
                                                        <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
                                                    </animateMotion>
                                                </circle>
                                            </g>
                                        ))}
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>
                {nodes.map((n) => (
                    <div
                        key={n.id}
                        className={`absolute flex items-center overflow-hidden ${compact ? "gap-1.5 px-2 py-1.5" : "gap-3 px-3.5 py-2.5"}`}
                        style={{
                            left: `${(n.x / VB.w) * 100}%`,
                            top: `${(n.y / VB.h) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            width: cardW,
                            background: cardFill,
                            border: T.cardBorder || `0.5px solid ${T.border}`,
                            boxShadow: T.cardShadow,
                            borderRadius: compact ? 10 : (T.cardRadius ?? 12),
                            opacity: n.active ? 1 : 0.5,
                        }}
                    >
                        <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: n.color }} />
                        <div className={`shrink-0 flex items-center justify-center ${compact ? "w-7" : "w-11"}`}>
                            <n.Icon />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`font-bold tracking-[0.14em] uppercase leading-none ${compact ? "text-[8px] mb-0.5" : "text-[10px] mb-1.5"}`} style={{ color: T.text3 }}>
                                {n.title}
                            </p>
                            <p className={`font-[200] leading-none tabular-nums ${compact ? "text-[12px]" : "text-[18px]"}`} style={{ color: T.text1 }}>
                                {n.value}
                            </p>
                            {!compact && (
                                <p className="text-[11px] mt-1 truncate" style={{ color: T.text3 }}>{n.sub}</p>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </>
    );

    if (embedded) return body;

    return (
        <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow, borderRadius: T.cardRadius }}
        >
            <div className="px-5 h-12 flex items-center justify-between" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>
                    Live Energy Flow
                </p>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.08em]" style={{ color: T.green }}>
                    <PulseDot color={T.green} />
                    Live
                </span>
            </div>
            {body}
        </div>
    );
}
