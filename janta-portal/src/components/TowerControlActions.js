"use client";

import { useState } from "react";
import { ICON_SM, ICON_STROKE } from "@/lib/icons";

const ACTION_ICON_COLORS = {
    start: "#4A9E78",
    restart: "#E8A020",
    stop: "#dc2626",
    reset: "#b91c1c",
    home: "#4a5568",
};

export default function TowerControlActions({ T, isDark, isFifa = false, actions = [] }) {
    const [hoveredId, setHoveredId] = useState(null);
    const hoverBg = isFifa ? (T.orange || T.amber) : T.amber;

    return (
        <div
            className="rounded-xl overflow-hidden janta-card-shimmer"
            style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow,
                borderRadius: T.cardRadius,
                "--card-shimmer": T.amber,
            }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                {actions.map((action) => {
                    const isHovered = hoveredId === action.id;
                    const iconColor = isHovered || (isDark && action.id === "home")
                        ? "#fff"
                        : (ACTION_ICON_COLORS[action.id] ?? T.text3);

                    return (
                        <button
                            key={action.id}
                            type="button"
                            className="w-full text-left flex items-center cursor-pointer"
                            style={{
                                padding: "18px 20px",
                                background: isHovered ? hoverBg : "transparent",
                                border: "none",
                                boxShadow: `inset -0.5px -0.5px 0 0 ${T.border}`,
                                transition: "background 0.18s ease, color 0.18s ease",
                            }}
                            onMouseEnter={() => setHoveredId(action.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <action.Icon
                                size={ICON_SM}
                                strokeWidth={ICON_STROKE}
                                style={{
                                marginRight: 14, flexShrink: 0,
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
        </div>
    );
}
