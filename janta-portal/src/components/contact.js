"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";
import { ICON_LG, iconProps } from "@/lib/icons";
import { useSession } from "@/hooks/useSession";
import { useSystem } from "@/hooks/useSystem";
import { useTheme } from "@/context/ThemeContext";

// ── Exact same token system as dashboard.js / settings.js ─────────────
function getTheme(isDark) {
    if (isDark) return {
        pageBg:      "#0c0c0d",
        sectionBg:   "#0c0c0d",
        cardBg:      "#161618",
        cardBorder:  "0.5px solid rgba(255,255,255,0.08)",
        cardShadow:  "none",
        cardRadius:  12,
        text1:       "#f4f4f5",
        text2:       "rgba(244,244,245,0.6)",
        text3:       "rgba(244,244,245,0.38)",
        border:      "rgba(255,255,255,0.08)",
        border2:     "rgba(255,255,255,0.14)",
        amber:       "#e6b85c",
        amberDim:    "rgba(230,184,92,0.14)",
        green:       "rgba(74,222,128,0.75)",
        red:         "#ef4444",
        inputBg:     "rgba(255,255,255,0.05)",
        inputBorder: "rgba(255,255,255,0.14)",
    };
    return {
        pageBg:      "#F4F6F9",
        sectionBg:   "#F4F6F9",
        cardBg:      "#FFFFFF",
        cardBorder:  "1px solid rgba(26,37,53,0.07)",
        cardShadow:  "0 4px 6px rgba(26,37,53,0.04), 0 8px 24px rgba(26,37,53,0.08), 0 1px 2px rgba(26,37,53,0.06)",
        cardRadius:  20,
        text1:       "#1A2535",
        text2:       "#3D5068",
        text3:       "#7A90A8",
        border:      "rgba(26,37,53,0.08)",
        border2:     "rgba(26,37,53,0.14)",
        amber:       "#E8A020",
        amberDim:    "rgba(232,160,32,0.12)",
        green:       "#4A9E78",
        red:         "#e53e3e",
        inputBg:     "#FFFFFF",
        inputBorder: "rgba(26,37,53,0.20)",
    };
}

export default function Contact() {
    const { user } = useSession();
    const { system } = useSystem();
    const [menuOpen, setMenuOpen] = useState(false);
    const { isDark, toggleDark } = useTheme();
    const T = getTheme(isDark);

    const inputStyle = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: `1px solid ${T.inputBorder}`, background: T.inputBg,
        color: T.text1, fontSize: 14, outline: "none", boxSizing: "border-box",
    };
    const labelStyle = {
        fontSize: 12, fontWeight: 700, letterSpacing: "0.10em",
        textTransform: "uppercase", color: T.text3, marginBottom: 6, display: "block",
    };
    const sectionLabel = {
        fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
        textTransform: "uppercase", color: T.text3, marginBottom: 20,
    };

    return (
        // ── Outer shell — exact same as dashboard.js / settings.js ──────
        <div
            className="flex flex-col h-screen overflow-hidden w-full"
            style={{
                background: T.pageBg, color: T.text1,
                backgroundColor: T.pageBg,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeLegibility",
            }}
        >
            <div className="flex flex-1 min-h-0">

                {/* ── SIDEBAR — mirrors Sidebar.js / settings.js 1:1 ── */}
                <aside style={{
                    position: "fixed", top: 0, left: 0, bottom: 0, width: 256, zIndex: 30,
                    background: isDark ? "#0c0c0d" : "#1A2535",
                    borderRight: isDark
                        ? "0.5px solid rgba(255,255,255,0.07)"
                        : "none",
                    boxShadow: isDark ? "none" : "2px 0 16px rgba(0,0,0,0.25)",
                    display: "flex", flexDirection: "column", overflowY: "auto",
                }}>
                    {/* Logo */}
                    <Link href="/dashboard"
                        className="flex items-center justify-center px-4 shrink-0"
                        style={{
                            padding: "18px 16px",
                            borderBottom: isDark
                                ? "0.5px solid rgba(255,255,255,0.07)"
                                : "none",
                            textDecoration: "none",
                            transition: "background 0.2s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,184,92,0.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                        <img
                            src="/images/Janta_Power_Business_Card_Logo.jpeg"
                            alt="Janta Power"
                            style={{ width: "100%", maxWidth: 180, height: "auto", objectFit: "contain" }}
                        />
                    </Link>

                    {/* Nav */}
                    <nav className="flex flex-col p-3 pt-5 gap-1">
                        <span className="px-3 pb-3 text-xs font-bold uppercase tracking-widest"
                            style={{ color: "rgba(230,184,92,0.5)" }}>
                            Support
                        </span>
                        <Link
                            href="/dashboard"
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px", borderRadius: 10,
                                textDecoration: "none", fontSize: 13,
                                color: "rgba(244,244,245,0.5)",
                                transition: "all 0.22s ease",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(244,244,245,0.04)";
                                e.currentTarget.style.color = "#f4f4f5";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "rgba(244,244,245,0.5)";
                            }}
                        >
                            ← Dashboard
                        </Link>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 14px", borderRadius: 10,
                            fontSize: 13, fontWeight: 500,
                            color: "#f4f4f5",
                            background: "rgba(230,184,92,0.12)",
                            boxShadow: "0 0 16px rgba(230,184,92,0.08)",
                            position: "relative",
                        }}>
                            <span style={{ color: "#e6b85c", fontSize: 14 }}>✉</span>
                            <span>Contact Us</span>
                            <span style={{
                                position: "absolute", right: 12,
                                width: 5, height: 5, borderRadius: "50%",
                                background: "#e6b85c", boxShadow: "0 0 6px #e6b85c",
                                opacity: 0.85,
                            }} />
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="mt-auto p-4" style={{
                        borderTop: isDark
                            ? "0.5px solid rgba(255,255,255,0.07)"
                            : "1px solid rgba(255,255,255,0.1)",
                        background: isDark ? "transparent" : "rgba(255,255,255,0.05)",
                    }}>
                        <p className="text-xs font-medium truncate" style={{
                            color: isDark ? "rgba(244,244,245,0.28)" : "rgba(230,184,92,0.5)",
                        }}>
                            {system?.system_name || "System"}
                        </p>
                    </div>
                </aside>

                {/* ── RIGHT COLUMN ── */}
                <div
                    className="flex-1 flex flex-col min-w-0 min-h-0"
                    style={{ marginLeft: 256, background: T.pageBg, backgroundColor: T.pageBg }}
                >
                    {/* ── HEADER — matches dashboard.js / settings.js exactly ── */}
                    <header
                        className="flex items-center justify-between px-6 py-4"
                        style={isDark
                            ? {
                                background: "#161618",
                                borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                            }
                            : {
                                background: "linear-gradient(to right, rgba(26,37,53,0.96) 0%, rgba(26,37,53,0.80) 25%, rgba(26,37,53,0.45) 55%, rgba(242,242,242,0.0) 100%)",
                                borderBottom: "1px solid rgba(26,37,53,0.15)",
                            }
                        }
                    >
                        <p className="text-sm font-medium" style={{ color: "rgba(245,235,220,0.9)" }}>
                            {system?.system_name
                                ? `${system.system_name} • Contact Us`
                                : "Contact Us"}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label={isDark ? "Light mode" : "Dark mode"}
                                className="p-2 rounded-lg transition-colors cursor-pointer"
                                style={{ color: isDark ? "rgba(244,244,245,0.6)" : "#2F3E4D" }}
                                onClick={toggleDark}
                            >
                                {isDark ? <Sun {...iconProps(ICON_LG)} /> : <Moon {...iconProps(ICON_LG)} />}
                            </button>
                            <button
                                type="button"
                                aria-label="Menu"
                                className="p-2 rounded-lg transition-colors cursor-pointer"
                                style={{ color: isDark ? "rgba(244,244,245,0.6)" : "#2F3E4D" }}
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                {menuOpen ? <X {...iconProps(ICON_LG)} /> : <Menu {...iconProps(ICON_LG)} />}
                            </button>
                        </div>
                    </header>

                    {/* ── DROPDOWN — matches dashboard.js / settings.js ── */}
                    {menuOpen && (
                        <div
                            className="fixed top-[64px] right-6 w-56 rounded-lg shadow-lg py-2 z-50"
                            style={{ background: T.cardBg, border: T.cardBorder, borderRadius: 8 }}
                        >
                            <p className="px-4 py-2 text-base font-semibold" style={{ color: T.text1 }}>
                                {user?.name || "Guest"}
                            </p>
                            <div style={{ borderTop: `0.5px solid ${T.border}` }} aria-hidden />
                            <Link href="/dashboard"
                                className="block px-4 py-2 text-sm transition-colors"
                                style={{ color: T.text2 }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                onClick={() => setMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <Link href="/settings"
                                className="block px-4 py-2 text-sm transition-colors"
                                style={{ color: T.text2 }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                onClick={() => setMenuOpen(false)}>
                                Settings
                            </Link>
                            <button
                                onClick={async () => {
                                    try { await fetch("/api/logout", { method: "GET" }); window.location.href = "/?loggedout=true"; }
                                    catch (err) { console.error("Logout failed:", err); }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                                style={{ color: T.text2, background: "transparent", border: "none" }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                            >
                                Log Out
                            </button>
                        </div>
                    )}

                    {/* ── SCROLL AREA ── */}
                    <main
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                        style={{ background: T.sectionBg }}
                    >
                        <section className="py-10 px-8" style={{ background: T.sectionBg }}>
                            <div style={{ maxWidth: 640 }}>

                                {/* Section label — matches "PROFILE", "SECURITY" etc. */}
                                <p style={sectionLabel}>Contact Us</p>

                                <div style={{
                                    background: T.cardBg, border: T.cardBorder,
                                    boxShadow: T.cardShadow, borderRadius: T.cardRadius,
                                    overflow: "hidden",
                                }}>
                                    {/* Card header row */}
                                    <div className="flex items-center"
                                        style={{ padding: "14px 24px", borderBottom: `0.5px solid ${T.border}` }}>
                                        <span style={{
                                            fontSize: 13, fontWeight: 700,
                                            letterSpacing: "0.15em", textTransform: "uppercase",
                                            color: T.text3,
                                        }}>
                                            Send a Message
                                        </span>
                                    </div>

                                    {/* Form */}
                                    <form method="post">
                                        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                                            <div>
                                                <label htmlFor="fullname" style={labelStyle}>
                                                    Full Name <span style={{ color: T.red }}>*</span>
                                                </label>
                                                <input
                                                    type="text" id="fullname" name="fullname" required
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" style={labelStyle}>
                                                    Email <span style={{ color: T.red }}>*</span>
                                                </label>
                                                <input
                                                    type="email" id="email" name="email" required
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="message" style={labelStyle}>
                                                    Message <span style={{ color: T.red }}>*</span>
                                                </label>
                                                <textarea
                                                    id="message" name="message"
                                                    placeholder="Draft a message..."
                                                    required rows={5}
                                                    style={{
                                                        ...inputStyle,
                                                        resize: "vertical",
                                                        lineHeight: 1.6,
                                                    }}
                                                />
                                            </div>

                                            {/* Terms checkbox */}
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                <input
                                                    type="checkbox" id="privacy-policy"
                                                    name="privacy-policy" required
                                                    style={{ marginTop: 3, accentColor: T.amber, flexShrink: 0 }}
                                                />
                                                <label htmlFor="privacy-policy" style={{
                                                    fontSize: 13, color: T.text3, cursor: "pointer",
                                                }}>
                                                    I accept the terms <span style={{ color: T.red }}>*</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Footer row with submit */}
                                        <div style={{
                                            padding: "14px 24px",
                                            borderTop: `0.5px solid ${T.border}`,
                                            display: "flex", justifyContent: "flex-end",
                                        }}>
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: "8px 24px", borderRadius: 8,
                                                    background: T.amber,
                                                    color: isDark ? "#000" : "#fff",
                                                    fontWeight: 700, fontSize: 13,
                                                    border: "none", cursor: "pointer",
                                                }}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}