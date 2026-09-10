"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ICON_SM, ICON_STROKE } from "@/lib/icons";
import { directionFromAngle, stateTone } from "@/lib/inverterGroups";
import PulseDot from "@/components/PulseDot";

function StatusDot({ tone, T }) {
    const color = tone === "fault" ? (T.red || "#e57373") : tone === "watch" ? T.amber : T.green;
    return (
        <PulseDot color={color} />
    );
}

export default function TowersProduction({
    T,
    groups = [],
    selectedInverterId,
    onInverterSelect,
    compact = false,
}) {
    const [openId, setOpenId] = useState(selectedInverterId || groups[0]?.id || null);
    if (!groups.length) return null;
    const towerTotal = groups.reduce((s, g) => s + g.towers.length, 0);
    const towersOnline = groups.reduce((s, g) => s + g.online, 0);

    const toggleGroup = (id) => {
        onInverterSelect?.(id);
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div
            className="rounded-xl overflow-hidden flex flex-col h-full min-h-0 janta-card-shimmer"
            style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow,
                borderRadius: T.cardRadius,
                "--card-shimmer": T.amber,
            }}
        >
            <div className={`px-5 flex items-center justify-between gap-4 shrink-0 ${compact ? "h-9" : "h-12"}`} style={{ borderBottom: `0.5px solid ${T.border}` }}>
                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>
                    Towers & Production
                </p>
                <p className="text-[13px] tabular-nums shrink-0" style={{ color: T.text1 }}>
                    <span className="uppercase tracking-[0.10em] mr-2" style={{ color: T.text3 }}>Online</span>
                    {towersOnline}/{towerTotal}
                </p>
            </div>

            <ul className="flex-1 min-h-0 overflow-y-auto">
                {groups.map((inv, idx) => {
                    const pct = inv.ratedKw > 0 ? Math.round((inv.powerKw / inv.ratedKw) * 100) : 0;
                    const active = inv.id === selectedInverterId;
                    const open = inv.id === openId;
                    return (
                        <li key={inv.id} style={idx > 0 ? { borderTop: `0.5px solid ${T.border}` } : undefined}>
                            <button
                                type="button"
                                className={`w-full text-left cursor-pointer ${compact ? "px-3 py-2" : "px-5 py-4"}`}
                                style={{ background: active ? T.amberDim : "transparent", border: "none" }}
                                aria-expanded={open}
                                onClick={() => toggleGroup(inv.id)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex items-center gap-2.5">
                                        <ChevronRight
                                            size={ICON_SM}
                                            strokeWidth={ICON_STROKE}
                                            className="shrink-0"
                                            style={{
                                                color: T.text3,
                                                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                                                transition: "transform 150ms ease",
                                            }}
                                        />
                                        <StatusDot tone={inv.tone} T={T} />
                                        <div className="min-w-0">
                                            <p className="text-[13px] truncate" style={{ color: T.text1 }}>
                                                {inv.name}
                                                {inv.type ? (
                                                    <span className="ml-2" style={{ color: T.text3 }}>{inv.type}</span>
                                                ) : null}
                                            </p>
                                            {!compact && (
                                                <p className="text-[13px] tracking-[0.08em] mt-0.5 truncate" style={{ color: T.text3 }}>
                                                    {inv.online}/{inv.towers.length} towers · {pct}% of {inv.ratedKw ? Number(inv.ratedKw).toFixed(1) : "—"} kW
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`font-[200] leading-none tabular-nums shrink-0 ${compact ? "text-[16px]" : "text-[22px]"}`} style={{ color: T.text1 }}>
                                        {inv.powerKw.toFixed(2)}
                                        <span className="text-sm font-light ml-1" style={{ color: T.text2 }}>kW</span>
                                    </p>
                                </div>
                            </button>

                            {open && inv.towers.map((t, tIdx) => {
                                const tone = stateTone(t.state);
                                const angle = Number(t.towerAngle);
                                return (
                                    <div
                                        key={t.id}
                                        className={`flex items-center gap-3 ${compact ? "px-3 py-1.5" : "px-5 py-3"}`}
                                        style={{
                                            borderTop: `0.5px solid ${T.border}`,
                                            paddingLeft: compact ? 28 : 36,
                                        }}
                                    >
                                        <StatusDot tone={tone} T={T} />
                                        <span className="text-[13px] tabular-nums w-8 shrink-0" style={{ color: T.text1 }}>
                                            #{t.order_id ?? tIdx + 1}
                                        </span>
                                        {!compact && (
                                            <span className="text-[13px] capitalize min-w-0 truncate" style={{ color: T.text3 }}>
                                                {String(t.state ?? "active").toLowerCase()}
                                            </span>
                                        )}
                                        <span className="ml-auto text-[13px] tabular-nums shrink-0" style={{ color: T.text3 }}>
                                            {Number.isFinite(angle) ? `${Math.round(angle)}° ${directionFromAngle(angle)}` : "—"}
                                        </span>
                                        {Number(t.errorTicks) > 0 && (
                                            <span className="text-[13px] tabular-nums shrink-0" style={{ color: T.red || "#e57373" }}>
                                                {t.errorTicks}
                                            </span>
                                        )}
                                        <span className="text-[13px] font-light tabular-nums w-[4.5rem] text-right shrink-0" style={{ color: T.text1 }}>
                                            {Number(t.powerKw || 0).toFixed(2)}
                                            <span className="ml-1" style={{ color: T.text3 }}>kW</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
