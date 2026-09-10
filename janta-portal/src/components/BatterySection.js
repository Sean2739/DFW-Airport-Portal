"use client";

import { useId } from "react";

function fillTone(pct, T) {
    if (pct < 15) return T.red || "#e53e3e";
    if (pct < 30) return T.amber;
    return T.green;
}

function SocBattery({ pct, charging, T }) {
    const clipId = useId();
    const fillPct = Math.max(0, Math.min(100, Number(pct) || 0));
    const well = { x: 10, y: 16, w: 28, h: 64 };
    const fillH = (fillPct / 100) * well.h;
    const fillY = well.y + (well.h - fillH);
    const color = fillTone(fillPct, T);
    const track = T.amberDim || T.border;
    const outline = T.text3;

    return (
        <svg
            viewBox="0 0 48 88"
            className="h-[88px] w-[48px] shrink-0"
            aria-hidden
        >
            <defs>
                <clipPath id={clipId}>
                    <rect x={well.x} y={well.y} width={well.w} height={well.h} rx="4" />
                </clipPath>
            </defs>
            <rect x="16" y="2" width="16" height="7" rx="2" fill={outline} />
            <rect
                x="6"
                y="10"
                width="36"
                height="74"
                rx="8"
                fill="none"
                stroke={outline}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <rect x={well.x} y={well.y} width={well.w} height={well.h} rx="4" fill={track} />
            {fillH > 0 ? (
                <rect
                    className="janta-batt-fill"
                    x={well.x}
                    y={fillY}
                    width={well.w}
                    height={fillH}
                    fill={color}
                    clipPath={`url(#${clipId})`}
                />
            ) : null}
            {charging ? (
                <path
                    d="M26.5 30 L20 46 h6.5 L21.5 62 L30 44 h-6.2 Z"
                    fill={T.cardBg}
                    stroke={T.text1}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            ) : null}
        </svg>
    );
}

export default function BatterySection({
    T,
    battSoc,
    battChargePower,
    loadPower,
    pvPowerKw,
    embedded = false,
}) {
    const soc = battSoc != null ? Math.round(battSoc) : null;
    const battKw = (Number(battChargePower) || 0) / 1000;
    const charging = battKw > 0.05;
    const discharging = battKw < -0.05;
    const state = charging ? "Charging" : discharging ? "Discharging" : "Standby";
    const loadKw = (Number(loadPower) || 0) / 1000;
    const loadCover = discharging && loadKw > 0.01
        ? Math.round(Math.min(100, (Math.abs(battKw) / loadKw) * 100))
        : null;
    const source = charging
        ? (pvPowerKw > 0.05 ? "From solar" : "From grid")
        : discharging
            ? "To load"
            : "Idle";

    const stats = [
        { label: "Power", value: Math.abs(battKw).toFixed(2), unit: "kW" },
        { label: "State", value: state, unit: "" },
        { label: "Path", value: source, unit: "" },
        {
            label: "Load cover",
            value: loadCover != null ? String(loadCover) : "—",
            unit: loadCover != null ? "%" : "",
        },
    ];

    const card = (
            <div
                className="rounded-xl overflow-hidden h-full flex flex-col janta-card-shimmer"
                style={{
                    background: T.cardBg,
                    border: T.cardBorder,
                    boxShadow: T.cardShadow,
                    borderRadius: T.cardRadius,
                    "--card-shimmer": T.amber,
                }}
            >
                <div className="px-5 h-12 flex items-center shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                    <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>Battery</p>
                </div>
                <div className="px-5 py-3 flex items-center gap-5" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                    <SocBattery pct={soc ?? 0} charging={charging} T={T} />
                    <div className="min-w-0">
                        <p className="text-[13px] tracking-[0.10em] mb-1.5" style={{ color: T.text3 }}>State of charge</p>
                        <p className="text-[30px] font-[200] leading-none tabular-nums" style={{ color: T.text1 }}>
                            {soc != null ? soc : "—"}
                            {soc != null ? <span className="text-sm font-light ml-1" style={{ color: T.text2 }}>%</span> : null}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className="px-5 py-2.5"
                            style={{
                                borderLeft: i > 0 ? `0.5px solid ${T.border}` : undefined,
                            }}
                        >
                            <p className="text-[13px] tracking-[0.10em] mb-1.5" style={{ color: T.text3 }}>{s.label}</p>
                            <p className="text-[20px] font-[200] leading-none tabular-nums" style={{ color: T.text1 }}>
                                {s.value}
                                {s.unit ? <span className="text-sm font-light ml-1" style={{ color: T.text2 }}>{s.unit}</span> : null}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
    );

    return (
        <div id="battery" className={embedded ? "h-full scroll-mt-24" : "scroll-mt-24 mb-12"}>
            {card}
        </div>
    );
}
