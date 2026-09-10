"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Moon, Sun } from "lucide-react";
import { ICON_LG, ICON_SM, iconProps } from "@/lib/icons";
import { useTheme } from "@/context/ThemeContext";
import { isFifaDallasSystem } from "@/lib/fifaDallasSystem";

const FIFA_ACCENT = "#87A9C4";
const FIFA_ACCENT_DIM = "rgba(135, 169, 196, 0.15)";

function getTheme(isDark) {
    if (isDark) return {
        pageBg:     "#0c0c0d",
        cardBg:     "#161618",
        cardBorder: "0.5px solid rgba(255,255,255,0.08)",
        cardShadow: "none",
        cardRadius: 12,
        text1:      "#f4f4f5",
        text2:      "rgba(244,244,245,0.80)",
        text3:      "rgba(244,244,245,0.58)",
        border:     "rgba(255,255,255,0.08)",
        amber:      "#e6b85c",
        amberDim:   "rgba(230,184,92,0.14)",
        green:      "rgba(74,222,128,0.75)",
        trackBg:    "rgba(255,255,255,0.08)",
        headerBg:   "rgba(12,12,13,0.95)",
        iconColor:  "#e6b85c",
    };
    return {
        pageBg:     "#F4F6F9",
        cardBg:     "#FFFFFF",
        cardBorder: "1px solid rgba(26,37,53,0.07)",
        cardShadow: "0 4px 6px rgba(26,37,53,0.04), 0 8px 24px rgba(26,37,53,0.08), 0 1px 2px rgba(26,37,53,0.06)",
        cardRadius: 20,
        text1:      "#1A2535",
        text2:      "#3D5068",
        text3:      "#7A90A8",
        border:     "rgba(26,37,53,0.08)",
        amber:      "#E8A020",
        amberDim:   "rgba(232,160,32,0.12)",
        green:      "#4A9E78",
        trackBg:    "#E8ECF0",
        headerBg:   "#FFFFFF",
        iconColor:  "#1A2535",
    };
}

export default function SystemSelect() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isDark, toggleDark } = useTheme();
    const T = getTheme(isDark);

    useEffect(() => {
        async function fetchSystems() {
            try {
                const res = await fetch("/api/my-systems", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch systems");

                const data = await res.json();
                setSystems(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchSystems();
    }, []);

    async function selectSystem(systemId) {
        try {
            const res = await fetch("/api/select-system", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ systemId }),
            });

            if (!res.ok) throw new Error("Failed to select system");
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.pageBg, color: T.text2 }}>
                Loading systems...
            </div>
        );
    }

    if (systems.length === 0) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.pageBg, color: T.text2 }}>
                No systems available
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.pageBg, color: T.text1 }}>

            {/* Header */}
            <header style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 72,
                padding: "0 24px",
                background: T.headerBg,
                borderBottom: `1px solid ${T.border}`,
                backdropFilter: "blur(8px)",
            }}>
                <img
                    src="/images/Janta%20Power%20Business%20Card%20Logo%202.svg"
                    alt="Janta Power"
                    style={{ height: 52, width: "auto", objectFit: "contain" }}
                />

                <button
                    type="button"
                    onClick={toggleDark}
                    aria-label={isDark ? "Light mode" : "Dark mode"}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 8,
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: T.iconColor,
                        cursor: "pointer",
                    }}
                >
                    {isDark ? <Sun {...iconProps(ICON_LG)} /> : <Moon {...iconProps(ICON_LG)} />}
                </button>
            </header>

            {/* Main content */}
            <main style={{ flex: 1, padding: "32px clamp(20px, 4vw, 48px)", width: "100%" }}>
                <p style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: T.text3, marginBottom: 20,
                }}>
                    Select a System
                </p>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                    gap: 20,
                    width: "100%",
                }}>
                    {systems.map((system) => {
                        const capacityKw = system.max_pv_kw != null ? Number(system.max_pv_kw) : 0;
                        const currentOutputKw = 0;
                        const percent = capacityKw > 0 ? Math.min(100, (currentOutputKw / capacityKw) * 100) : 0;
                        const isFifaDallas = isFifaDallasSystem(system);

                        return (
                            <button
                                key={system.id}
                                type="button"
                                onClick={() => selectSystem(system.id)}
                                style={{
                                    display: "flex",
                                    textAlign: "left",
                                    background: T.cardBg,
                                    border: T.cardBorder,
                                    boxShadow: T.cardShadow,
                                    borderRadius: T.cardRadius,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    padding: 0,
                                    width: "100%",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    if (!isDark) e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,37,53,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = T.cardShadow;
                                }}
                            >
                                <span style={{ width: 5, flexShrink: 0, background: T.green }} />
                                <div style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text1 }}>
                                            {system.system_name || "Unnamed System"}
                                        </h3>
                                        {isFifaDallas && (
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: FIFA_ACCENT,
                                                background: FIFA_ACCENT_DIM,
                                                padding: "3px 8px",
                                                borderRadius: 6,
                                                flexShrink: 0,
                                            }}>
                                                Custom
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.text2, marginBottom: 16 }}>
                                        <MapPin {...iconProps(ICON_SM)} style={{ flexShrink: 0 }} />
                                        <span>
                                            {system.location_label
                                                ? system.location_label
                                                : isFifaDallas
                                                ? "Fair Park · Dallas, TX"
                                                : system.latitude != null && system.longitude != null &&
                                                  Number(system.latitude) !== 0 && Number(system.longitude) !== 0
                                                    ? `${Number(system.latitude).toFixed(2)}°, ${Number(system.longitude).toFixed(2)}°`
                                                    : "—"}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.text3, marginBottom: 4 }}>
                                        Current Output
                                    </p>
                                    <p style={{ fontSize: 28, fontWeight: 700, color: T.text1, marginBottom: 16, lineHeight: 1.1 }}>
                                        {currentOutputKw.toFixed(1)} kW
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ flex: 1, height: 6, background: T.trackBg, borderRadius: 999, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                borderRadius: 999,
                                                width: `${percent}%`,
                                                background: percent > 0 ? T.amber : T.text3,
                                                transition: "width 0.4s ease",
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: T.text3, flexShrink: 0, whiteSpace: "nowrap" }}>
                                            {capacityKw.toFixed(1)} kW Capacity
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
