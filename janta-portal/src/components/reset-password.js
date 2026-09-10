"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useSession } from "@/hooks/useSession";

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

export function ResetPasswordPageShell({ children }) {
    const { isDark } = useTheme();
    const T = getTheme(isDark);
    return (
        <div
            style={{
                minHeight: "100vh",
                background: T.pageBg,
                padding: "40px 24px",
                boxSizing: "border-box",
                WebkitFontSmoothing: "antialiased",
            }}
        >
            {children}
        </div>
    );
}

export default function ResetPassword() {
    const { isDark } = useTheme();
    const router = useRouter();
    const { refetch } = useSession();
    const T = getTheme(isDark);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [showError, setShowError] = useState(false);

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
    const saveBtn = {
        padding: "8px 24px", borderRadius: 8,
        background: T.amber, color: isDark ? "#000" : "#fff",
        fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || currentPassword === newPassword) {
            setShowError(true); setTimeout(() => setShowError(false), 4000); return;
        }
        try {
            const res = await fetch("/api/user/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res.ok) {
                setShowMessage(true); setTimeout(() => setShowMessage(false), 4000);
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
                await refetch();
                router.replace("/systemselect");
            } else { setShowError(true); setTimeout(() => setShowError(false), 4000); }
        } catch { setShowError(true); setTimeout(() => setShowError(false), 4000); }
    };

    return (
        <div style={{ maxWidth: 640 }}>
            <p style={sectionLabel}>Reset Password</p>

            {showMessage && (
                <div style={{
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    color: T.green, padding: "10px 16px",
                    borderRadius: 8, marginBottom: 20, fontSize: 13, maxWidth: 640,
                }}>
                    ✓ Password updated successfully.
                </div>
            )}
            {showError && (
                <div style={{
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: T.red, padding: "10px 16px",
                    borderRadius: 8, marginBottom: 20, fontSize: 13, maxWidth: 640,
                }}>
                    Failed to update. Please try again.
                </div>
            )}

            <div style={{
                background: T.cardBg, border: T.cardBorder,
                boxShadow: T.cardShadow, borderRadius: T.cardRadius,
                overflow: "hidden",
            }}>
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
    );
}
