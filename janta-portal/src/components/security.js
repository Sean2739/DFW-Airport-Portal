"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { ArrowLeft, Pencil, Moon, Sun } from "lucide-react";
import { ICON_LG, ICON_SM, iconProps } from "@/lib/icons";
import { useTheme } from "@/context/ThemeContext";

function getTheme(isDark) {
    if (isDark) return {
        pageBg:     "#0c0c0d",
        cardBg:     "#161618",
        cardBorder: "0.5px solid rgba(255,255,255,0.08)",
        cardShadow: "none",
        cardRadius: 12,
        text1:      "#f4f4f5",
        text2:      "rgba(244,244,245,0.6)",
        text3:      "rgba(244,244,245,0.38)",
        border:     "rgba(255,255,255,0.08)",
        border2:    "rgba(255,255,255,0.14)",
        amber:      "#e6b85c",
        amberDim:   "rgba(230,184,92,0.14)",
        green:      "rgba(74,222,128,0.75)",
        red:        "#ef4444",
        inputBg:    "rgba(255,255,255,0.05)",
        inputBorder:"rgba(255,255,255,0.14)",
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
        border2:    "rgba(26,37,53,0.14)",
        amber:      "#E8A020",
        amberDim:   "rgba(232,160,32,0.12)",
        green:      "#4A9E78",
        red:        "#e53e3e",
        inputBg:    "#FFFFFF",
        inputBorder:"rgba(26,37,53,0.20)",
    };
}

export default function Security() {
    const router = useRouter();
    const { isDark, toggleDark } = useTheme();
    const T = getTheme(isDark);

    const [userId, setUserId] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [showError, setShowError] = useState(false);
    const [userSettings, setUserSettings] = useState({
        last_login_device: '',
        last_login: '',
        email_recovery: '',
        phone_recovery: '',
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messagesuccess, setmessagesuccess] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [newEmail, setnewEmail] = useState("");
    const [showPhoneInput, setShowPhoneInput] = useState(false);
    const [newPhone, setNewPhone] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/'); return; }
        try {
            const decoded = jwtDecode(token);
            setUserId(decoded.id);
        } catch {
            localStorage.removeItem('token');
            router.push('/');
        }
    }, []);

    useEffect(() => {
        if (!userId) return;
        async function fetchUserSettings() {
            try {
                const res = await fetch(`/api/settings/${userId}`);
                const data = await res.json();
                setUserSettings(data);
            } catch (e) { console.log("Fetch error:", e); }
        }
        fetchUserSettings();
    }, [userId]);

    const handleUpdate = async (updatedData) => {
        if (!userId) { setShowError(true); setTimeout(() => setShowError(false), 4000); return; }
        const res = await fetch(`/api/settings/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (res.ok) { setShowMessage(true); setTimeout(() => setShowMessage(false), 4000); }
        else { setShowError(true); setTimeout(() => setShowError(false), 4000); }
    };

    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const isValidUSPhone = (p) => { const c = p.replace(/[^\d]/g, ''); return c.length === 10 || (c.length === 11 && c.startsWith('1')); };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) { setMessage('Please fill in all fields.'); setTimeout(() => setMessage(''), 3000); return; }
        if (newPassword !== confirmPassword) { setMessage('New passwords do not match.'); setTimeout(() => setMessage(''), 3000); return; }
        if (currentPassword === newPassword) { setMessage('New password is the same as old password.'); setTimeout(() => setMessage(''), 3000); return; }
        const res = await fetch(`/api/user/${userId}/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
            setmessagesuccess('Password updated successfully.');
            setTimeout(() => setmessagesuccess(''), 3000);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } else {
            setMessage(data.error || 'Password update failed.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const inputStyle = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: `1px solid ${T.inputBorder}`, background: T.inputBg,
        color: T.text1, fontSize: 14, outline: "none", boxSizing: "border-box",
    };
    const labelStyle = { fontSize: 12, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.text3, marginBottom: 6, display: "block" };
    const sectionHeader = { fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.text3, marginBottom: 20 };
    const saveBtn = { padding: "8px 20px", borderRadius: 8, background: T.amber, color: isDark ? "#000" : "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" };

    if (!userId) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.pageBg, color: T.text2, fontSize: 16 }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: T.pageBg, color: T.text1 }}>

            {/* ── Header ── */}
            <header style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 24px",
                background: isDark
                    ? "rgba(20,17,15,0.95)"
                    : "linear-gradient(to right, rgba(26,37,53,0.96) 0%, rgba(26,37,53,0.80) 30%, rgba(26,37,53,0.45) 60%, rgba(244,246,249,0.0) 100%)",
                borderBottom: isDark ? "0.5px solid rgba(255,255,255,0.08)" : "1px solid rgba(26,37,53,0.15)",
                backdropFilter: "blur(8px)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/settings" style={{ color: "rgba(245,235,220,0.9)", display: "flex", alignItems: "center" }}>
                        <ArrowLeft {...iconProps(ICON_LG)} />
                    </Link>
                    <img src="/images/Janta_Power_Business_Card_Logo.jpeg" alt="Janta Power"
                        style={{ height: 40, width: "auto", objectFit: "contain" }} />
                </div>
                <button type="button" onClick={toggleDark} aria-label={isDark ? "Light mode" : "Dark mode"}
                    style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "rgba(245,235,220,0.9)", cursor: "pointer" }}>
                    {isDark ? <Sun {...iconProps(ICON_LG)} /> : <Moon {...iconProps(ICON_LG)} />}
                </button>
            </header>

            {/* ── Content ── */}
            <div style={{ paddingTop: 88, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 720, margin: "0 auto" }}>

                {showMessage && (
                    <div style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: T.green, padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
                        ✓ Settings updated successfully.
                    </div>
                )}
                {showError && (
                    <div style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.3)", color: T.red, padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
                        Failed to update. Please try again.
                    </div>
                )}

                {/* Change Password */}
                <p style={sectionHeader}>Sign In & Security</p>
                <div style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow, borderRadius: T.cardRadius, padding: 24, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Update your password below.</p>
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
                            {[["Current Password", "password", currentPassword, setCurrentPassword], ["New Password", "password", newPassword, setNewPassword], ["Confirm New Password", "password", confirmPassword, setConfirmPassword]].map(([lbl, type, val, setter]) => (
                                <div key={lbl}>
                                    <label style={labelStyle}>{lbl}</label>
                                    <input type={type} value={val} onChange={e => setter(e.target.value)} style={inputStyle} />
                                </div>
                            ))}
                        </div>
                        {message && <p style={{ fontSize: 13, color: T.red, marginBottom: 12 }}>{message}</p>}
                        {messagesuccess && <p style={{ fontSize: 13, color: T.green, marginBottom: 12 }}>{messagesuccess}</p>}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" style={saveBtn}>Update Password</button>
                        </div>
                    </form>
                </div>

                {/* Trusted Devices */}
                <p style={{ ...sectionHeader, marginTop: 32 }}>Trusted Devices</p>
                <div style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow, borderRadius: T.cardRadius, overflow: "hidden", marginBottom: 20 }}>
                    {[["Last Device", userSettings.last_login_device || "—"], ["Last Sign In", userSettings.last_login ? new Date(userSettings.last_login).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true }) : "No login yet"]].map(([lbl, val], i, arr) => (
                        <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < arr.length - 1 ? `0.5px solid ${T.border}` : "none" }}>
                            <span style={{ fontSize: 13, color: T.text3, textTransform: "uppercase", letterSpacing: "0.10em" }}>{lbl}</span>
                            <span style={{ fontSize: 13, color: T.text1, fontWeight: 300 }}>{val}</span>
                        </div>
                    ))}
                </div>

                {/* Account Recovery */}
                <p style={{ ...sectionHeader, marginTop: 32 }}>Account Recovery</p>
                <div style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow, borderRadius: T.cardRadius, overflow: "hidden" }}>

                    {/* Recovery Email */}
                    <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${T.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: T.text3, textTransform: "uppercase", letterSpacing: "0.10em" }}>Recovery Email</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {!showEmailInput && <span style={{ fontSize: 13, color: T.text1, fontWeight: 300 }}>{userSettings?.email_recovery || "Not set"}</span>}
                                {!showEmailInput && (
                                    <button onClick={() => { setShowEmailInput(true); setnewEmail(userSettings.email_recovery || ''); }}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", color: T.text3, display: "flex", alignItems: "center" }}>
                                        <Pencil {...iconProps(ICON_SM)} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {showEmailInput && (
                            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <input type="email" placeholder="Enter new recovery email" value={newEmail} onChange={e => setnewEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                <button onClick={async () => {
                                    if (!isValidEmail(newEmail)) { alert("Please enter a valid email address."); return; }
                                    const updated = { ...userSettings, email_recovery: newEmail };
                                    setUserSettings(updated);
                                    await handleUpdate(updated);
                                    setShowEmailInput(false); setnewEmail("");
                                }} style={saveBtn}>Save</button>
                                <button onClick={() => setShowEmailInput(false)}
                                    style={{ ...saveBtn, background: "transparent", color: T.text2, border: `1px solid ${T.border2}` }}>Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Recovery Phone */}
                    <div style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: T.text3, textTransform: "uppercase", letterSpacing: "0.10em" }}>Recovery Phone</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {!showPhoneInput && <span style={{ fontSize: 13, color: T.text1, fontWeight: 300 }}>{userSettings?.phone_recovery || "Not set"}</span>}
                                {!showPhoneInput && (
                                    <button onClick={() => { setShowPhoneInput(true); setNewPhone(userSettings?.phone_recovery || ''); }}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", color: T.text3, display: "flex", alignItems: "center" }}>
                                        <Pencil {...iconProps(ICON_SM)} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {showPhoneInput && (
                            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <input type="tel" placeholder="Enter new recovery phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                <button onClick={async () => {
                                    if (!isValidUSPhone(newPhone)) { alert("Please enter a valid U.S. phone number (e.g. 123-456-7890)."); return; }
                                    const updated = { ...userSettings, phone_recovery: newPhone };
                                    setUserSettings(updated);
                                    await handleUpdate(updated);
                                    setShowPhoneInput(false); setNewPhone("");
                                }} style={saveBtn}>Save</button>
                                <button onClick={() => setShowPhoneInput(false)}
                                    style={{ ...saveBtn, background: "transparent", color: T.text2, border: `1px solid ${T.border2}` }}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}