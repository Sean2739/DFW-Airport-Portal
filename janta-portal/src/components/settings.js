"use client";
import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun, User, Settings as SettingsIcon, Cpu, X, Menu } from "lucide-react";
import { ICON_LG, ICON_MD, ICON_STROKE, iconProps } from "@/lib/icons";
import { useSession } from "@/hooks/useSession";
import { useSystem } from "@/hooks/useSystem";
import { useTheme } from "@/context/ThemeContext";

// ── Exact same token system as dashboard.js ────────────────────────────
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
        border:      "rgba(255,255,255,0.07)",
        border2:     "rgba(255,255,255,0.12)",
        amber:       "#e6b85c",
        amberDim:    "rgba(230,184,92,0.14)",
        green:       "rgba(74,222,128,0.75)",
        red:         "#ef4444",
        inputBg:     "rgba(255,255,255,0.05)",
        inputBorder: "rgba(255,255,255,0.12)",
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

export default function Settings() {
    const { session, user, loading } = useSession();
    const { system } = useSystem();
    const userID = session?.sub ?? null;
    const { isDark, toggleDark } = useTheme();
    const T = getTheme(isDark);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [systemName, setSystemName] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [view, setView] = useState("profile");
    const [hoveredNav, setHoveredNav] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone_number || "");
        }
    }, [user]);

    useEffect(() => {
        if (system) setSystemName(system.system_name);
    }, [system]);

    const initial = (user?.name || "?").trim().charAt(0).toUpperCase();

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!userID) { setShowError(true); setTimeout(() => setShowError(false), 4000); return; }
        const res = await fetch(`/api/user`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone }),
        });
        if (res.ok) { setShowMessage(true); setTimeout(() => setShowMessage(false), 4000); setEditingProfile(false); }
        else { setShowError(true); setTimeout(() => setShowError(false), 4000); }
    };

    const showErr = (msg) => {
        setErrorMessage(msg);
        setShowError(true);
        setTimeout(() => { setShowError(false); setErrorMessage(""); }, 4000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) { showErr("Please fill in all fields."); return; }
        if (newPassword !== confirmPassword) { showErr("New passwords do not match."); return; }
        if (currentPassword === newPassword) { showErr("New password must differ from the current password."); return; }
        try {
            const res = await fetch("/api/user/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res.ok) {
                setShowMessage(true); setTimeout(() => setShowMessage(false), 4000);
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                const data = await res.json().catch(() => ({}));
                showErr(data.error || "Failed to update. Please try again.");
            }
        } catch { showErr("Failed to update. Please try again."); }
    };

    const handleSystemUpdate = async (e) => {
        e.preventDefault();
        if (!systemName) { setShowError(true); setTimeout(() => setShowError(false), 4000); return; }
        try {
            const res = await fetch("/api/system", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ system_name: systemName }),
                credentials: "include",
            });
            if (res.ok) { setShowMessage(true); setTimeout(() => setShowMessage(false), 4000); }
            else { setShowError(true); setTimeout(() => setShowError(false), 4000); }
        } catch { setShowError(true); setTimeout(() => setShowError(false), 4000); }
    };

    // ── Style helpers — exact dashboard tokens ─────────────────────────
    const inputStyle = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: `1px solid ${T.inputBorder}`, background: T.inputBg,
        color: T.text1, fontSize: 14, outline: "none", boxSizing: "border-box",
    };
    const labelStyle = {
        fontSize: 12, fontWeight: 700, letterSpacing: "0.10em",
        textTransform: "uppercase", color: T.text3, marginBottom: 6, display: "block",
    };
    // Identical to the inline sectionLabel style in dashboard.js
    const sectionLabel = {
        fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
        textTransform: "uppercase", color: T.text3, marginBottom: 20,
    };
    const saveBtn = {
        padding: "8px 24px", borderRadius: 8,
        background: T.amber, color: isDark ? "#000" : "#fff",
        fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
    };
    const cancelBtn = {
        padding: "10px 20px", borderRadius: 8,
        background: "transparent", color: T.text2,
        fontWeight: 500, fontSize: 13,
        border: `1px solid ${T.border2}`, cursor: "pointer",
    };

    const navItems = [
        { id: "profile",  label: "Profile",  icon: User },
        { id: "settings", label: "Security", icon: SettingsIcon },
        { id: "system",   label: "System",   icon: Cpu },
    ];

    const viewLabel = navItems.find(n => n.id === view)?.label || "Settings";

    if (loading || !session) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: T.pageBg,
                color: T.text2, fontSize: 16,
                WebkitFontSmoothing: "antialiased",
            }}>
                Loading...
            </div>
        );
    }

    return (
        // ── Outer shell — exact same as dashboard.js root div ───────────
        <div
            className="flex flex-col h-screen overflow-hidden w-full"
            style={{
                background: T.pageBg, color: T.text1,
                // Explicit bg on root prevents any white bleed showing through
                // semi-transparent children (header, cards) in dark mode
                backgroundColor: T.pageBg,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeLegibility",
            }}
        >
            <div className="flex flex-1 min-h-0">

                {/* ── SIDEBAR — mirrors Sidebar.js 1:1 ── */}
                <aside style={{
                    position: "fixed", top: 0, left: 0, bottom: 0, width: 256, zIndex: 30,
                    background: isDark ? "#0c0c0d" : "#1A2535",
                    borderRight: isDark
                        ? "0.5px solid rgba(255,255,255,0.07)"
                        : "none",
                    boxShadow: isDark ? "none" : "2px 0 16px rgba(0,0,0,0.25)",
                    display: "flex", flexDirection: "column", overflowY: "auto",
                }}>
                    {/* Logo — same size & spacing as Sidebar.js */}
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

                    {/* Nav — same structure as Sidebar.js nav */}
                    <nav className="flex flex-col p-3 pt-5 gap-1">
                        <span className="px-3 pb-3 text-xs font-bold uppercase tracking-widest"
                            style={{ color: "rgba(230,184,92,0.5)" }}>
                            Settings
                        </span>

                        {navItems.map(({ id, label, icon: Icon }) => {
                            const isActive  = view === id;
                            const isHovered = hoveredNav === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setView(id)}
                                    onMouseEnter={() => setHoveredNav(id)}
                                    onMouseLeave={() => setHoveredNav(null)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        width: "100%", textAlign: "left",
                                        padding: "10px 14px", borderRadius: 10,
                                        border: "none", cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: isActive ? 500 : 400,
                                        color: isActive
                                            ? "#f4f4f5"
                                            : isHovered ? "#f4f4f5" : "rgba(244,244,245,0.5)",
                                        background: isActive
                                            ? "rgba(230,184,92,0.12)"
                                            : isHovered ? "rgba(244,244,245,0.04)" : "transparent",
                                        boxShadow: isActive
                                            ? "0 0 16px rgba(230,184,92,0.08)"
                                            : isHovered ? "0 0 10px rgba(230,184,92,0.04)" : "none",
                                        transition: "all 0.22s ease",
                                        position: "relative",
                                    }}
                                >
                                    <Icon size={ICON_MD} strokeWidth={ICON_STROKE} style={{
                                        color: isActive
                                            ? "#e6b85c"
                                            : isHovered ? "#f4f4f5" : "rgba(244,244,245,0.28)",
                                        flexShrink: 0,
                                        transform: isActive ? "scale(1.1)" : isHovered ? "scale(1.05)" : "scale(1)",
                                        transition: "transform 0.2s ease, color 0.2s ease",
                                    }} />
                                    <span style={{ transition: "color 0.2s ease" }}>{label}</span>
                                    {isActive && (
                                        <span style={{
                                            position: "absolute", right: 12,
                                            width: 5, height: 5, borderRadius: "50%",
                                            background: "#e6b85c",
                                            boxShadow: "0 0 6px #e6b85c",
                                            opacity: 0.85,
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer — same as Sidebar.js footer */}
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
                    {/* ── HEADER — exact copy of dashboard.js header ── */}
                    <header
                        className="flex items-center justify-between px-6 py-4"
                        style={isDark
                            ? {
                                // Fully opaque warm brown — same hue as #0c0c0d page bg,
                                // slightly lifted so the header reads as a distinct surface
                                // without any cold-grey bleed from semi-transparency.
                                background: "#161618",
                                borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                            }
                            : {
                                // Exact same gradient as dashboard.js light mode header
                                background: "linear-gradient(to right, rgba(26,37,53,0.96) 0%, rgba(26,37,53,0.80) 25%, rgba(26,37,53,0.45) 55%, rgba(242,242,242,0.0) 100%)",
                                borderBottom: "1px solid rgba(26,37,53,0.15)",
                            }
                        }
                    >
                        {/* Same font/color as "system_name • time" in dashboard */}
                        <p className="text-sm font-medium" style={{ color: "rgba(245,235,220,0.9)" }}>
                            {system?.system_name
                                ? `${system.system_name} • ${viewLabel}`
                                : viewLabel}
                        </p>

                        {/* Buttons — exact copy from dashboard.js */}
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

                    {/* ── DROPDOWN — exact copy from dashboard.js ── */}
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
                            {session?.role === "ADMIN" && (
                                <Link href="/systemselect"
                                    className="block px-4 py-2 text-sm transition-colors"
                                    style={{ color: T.amber }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                    onClick={() => setMenuOpen(false)}>
                                    System Select
                                </Link>
                            )}
                            <Link href="/contact"
                                className="block px-4 py-2 text-sm transition-colors"
                                style={{ color: T.text2 }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.amberDim; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                onClick={() => setMenuOpen(false)}>
                                Contact us
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
                        {/* Section wrapper — py-10 px-8 matches dashboard sections exactly */}
                        <section className="py-10 px-8" style={{ background: T.sectionBg }}>

                            {/* Toast banners */}
                            {showMessage && (
                                <div style={{
                                    background: "rgba(74,222,128,0.12)",
                                    border: "1px solid rgba(74,222,128,0.3)",
                                    color: T.green, padding: "10px 16px",
                                    borderRadius: 8, marginBottom: 20, fontSize: 13, maxWidth: 640,
                                }}>
                                    ✓ Settings updated successfully.
                                </div>
                            )}
                            {showError && (
                                <div style={{
                                    background: "rgba(239,68,68,0.10)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: T.red, padding: "10px 16px",
                                    borderRadius: 8, marginBottom: 20, fontSize: 13, maxWidth: 640,
                                }}>
                                    {errorMessage || "Failed to update. Please try again."}
                                </div>
                            )}

                            {/* ── PROFILE ── */}
                            {view === "profile" && (
                                <div style={{ maxWidth: 640 }}>
                                    {/* Section label — "PROFILE" matches "TOWER STATUS" style */}
                                    <p style={sectionLabel}>Profile</p>

                                    <div style={{
                                        background: T.cardBg, border: T.cardBorder,
                                        boxShadow: T.cardShadow, borderRadius: T.cardRadius,
                                        overflow: "hidden",
                                    }}>
                                        {/* Avatar header — styled like a card header row */}
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 16,
                                            padding: "20px 24px",
                                            borderBottom: `0.5px solid ${T.border}`,
                                        }}>
                                            <div style={{
                                                width: 56, height: 56, borderRadius: "50%",
                                                background: T.amberDim,
                                                border: `1px solid ${T.amber}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0,
                                            }}>
                                                <span style={{ fontSize: 22, fontWeight: 300, color: T.amber }}>
                                                    {initial}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 16, fontWeight: 300, color: T.text1 }}>
                                                    {user?.name || "—"}
                                                </p>
                                                <p style={{ fontSize: 13, color: T.text3, marginTop: 2 }}>
                                                    {user?.email || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Field rows — same px-5 py-3 pattern as System Health rows */}
                                        {!editingProfile ? (
                                            <>
                                                {[
                                                    ["Name",  user?.name],
                                                    ["Email", user?.email],
                                                    ["Phone", user?.phone_number || "Not set"],
                                                ].map(([lbl, val], i, arr) => (
                                                    <div
                                                        key={lbl}
                                                        className="flex items-center justify-between"
                                                        style={{
                                                            padding: "14px 24px",
                                                            borderBottom: i < arr.length - 1
                                                                ? `0.5px solid ${T.border}`
                                                                : "none",
                                                        }}
                                                    >
                                                        <span style={{
                                                            fontSize: 13, color: T.text3,
                                                            textTransform: "uppercase", letterSpacing: "0.10em",
                                                        }}>
                                                            {lbl}
                                                        </span>
                                                        <span style={{ fontSize: 13, fontWeight: 300, color: T.text1 }}>
                                                            {val || "—"}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div style={{
                                                    padding: "14px 24px",
                                                    borderTop: `0.5px solid ${T.border}`,
                                                    display: "flex", justifyContent: "flex-end",
                                                }}>
                                                    <button onClick={() => setEditingProfile(true)} style={saveBtn}>
                                                        Edit Profile
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <form onSubmit={handleProfileUpdate}>
                                                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                                    {[
                                                        ["Name",  "text",  name,  setName],
                                                        ["Email", "email", email, setEmail],
                                                        ["Phone", "tel",   phone, setPhone],
                                                    ].map(([lbl, type, val, setter]) => (
                                                        <div key={lbl}>
                                                            <label style={labelStyle}>{lbl}</label>
                                                            <input
                                                                type={type} value={val}
                                                                onChange={e => setter(e.target.value)}
                                                                style={inputStyle}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{
                                                    padding: "14px 24px",
                                                    borderTop: `0.5px solid ${T.border}`,
                                                    display: "flex", justifyContent: "flex-end", gap: 10,
                                                }}>
                                                    <button type="button" onClick={() => setEditingProfile(false)} style={cancelBtn}>
                                                        Cancel
                                                    </button>
                                                    <button type="submit" style={saveBtn}>Save</button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── SECURITY ── */}
                            {view === "settings" && (
                                <div style={{ maxWidth: 640 }}>
                                    <p style={sectionLabel}>Security</p>

                                    <div style={{
                                        background: T.cardBg, border: T.cardBorder,
                                        boxShadow: T.cardShadow, borderRadius: T.cardRadius,
                                        overflow: "hidden",
                                    }}>
                                        {/* Card header row — mirrors System Health header */}
                                        <div className="flex items-center justify-between"
                                            style={{ padding: "14px 24px", borderBottom: `0.5px solid ${T.border}` }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: 700,
                                                letterSpacing: "0.15em", textTransform: "uppercase",
                                                color: T.text3,
                                            }}>
                                                Change Password
                                            </span>
                                        </div>

                                        <form onSubmit={handlePasswordChange}>
                                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                                {[
                                                    ["Current Password",     "password", currentPassword, setCurrentPassword],
                                                    ["New Password",         "password", newPassword,     setNewPassword],
                                                    ["Confirm New Password", "password", confirmPassword, setConfirmPassword],
                                                ].map(([lbl, type, val, setter]) => (
                                                    <div key={lbl}>
                                                        <label style={labelStyle}>{lbl}</label>
                                                        <input
                                                            type={type} value={val}
                                                            onChange={e => setter(e.target.value)}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{
                                                padding: "14px 24px",
                                                borderTop: `0.5px solid ${T.border}`,
                                                display: "flex", justifyContent: "flex-end",
                                            }}>
                                                <button type="submit" style={saveBtn}>Update Password</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* ── SYSTEM ── */}
                            {view === "system" && (
                                <div style={{ maxWidth: 640 }}>
                                    <p style={sectionLabel}>PV System</p>

                                    <div style={{
                                        background: T.cardBg, border: T.cardBorder,
                                        boxShadow: T.cardShadow, borderRadius: T.cardRadius,
                                        overflow: "hidden",
                                    }}>
                                        <div className="flex items-center"
                                            style={{ padding: "14px 24px", borderBottom: `0.5px solid ${T.border}` }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: 700,
                                                letterSpacing: "0.15em", textTransform: "uppercase",
                                                color: T.text3,
                                            }}>
                                                System Configuration
                                            </span>
                                        </div>

                                        <form onSubmit={handleSystemUpdate}>
                                            <div style={{ padding: "20px 24px" }}>
                                                <label style={labelStyle}>System Name</label>
                                                <input
                                                    type="text" value={systemName}
                                                    onChange={e => setSystemName(e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{
                                                padding: "14px 24px",
                                                borderTop: `0.5px solid ${T.border}`,
                                                display: "flex", justifyContent: "flex-end",
                                            }}>
                                                <button type="submit" style={saveBtn}>Save</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}