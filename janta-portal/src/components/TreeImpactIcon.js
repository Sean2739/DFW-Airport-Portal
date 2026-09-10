"use client";

import { useId } from "react";

const TREE_SRC = "/images/deciduous-tree.png";
const VB_W = 200;
const VB_H = 240;

export default function TreeImpactIcon({
    percent = 0,
    fillColor,
    trackColor,
    isDark = false,
    className = "",
}) {
    const fill = Math.min(Math.max(percent, 0), 1);
    const clipId = useId();
    const maskId = useId();
    const invertId = useId();
    const fillY = VB_H * (1 - fill);
    const trackFill = trackColor ?? (isDark ? "rgba(230,184,92,0.26)" : "rgba(26,37,53,0.12)");

    return (
        <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className={`block max-h-full max-w-full min-h-0 ${className}`}
            preserveAspectRatio="xMidYMax meet"
            aria-hidden
        >
            <defs>
                <filter id={invertId} colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
                    />
                </filter>
                <clipPath id={clipId}>
                    <rect x="0" y={fillY} width={VB_W} height={VB_H - fillY} />
                </clipPath>
                <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width={VB_W} height={VB_H} fill="black" />
                    <image
                        href={TREE_SRC}
                        x="0"
                        y="0"
                        width={VB_W}
                        height={VB_H}
                        preserveAspectRatio="xMidYMax meet"
                        filter={`url(#${invertId})`}
                    />
                </mask>
            </defs>

            {/* Unfilled silhouette — masked tint, visible in dark mode */}
            <rect
                x="0"
                y="0"
                width={VB_W}
                height={VB_H}
                fill={trackFill}
                mask={`url(#${maskId})`}
            />

            {/* Filled portion */}
            <rect
                x="0"
                y="0"
                width={VB_W}
                height={VB_H}
                fill={fillColor}
                mask={`url(#${maskId})`}
                clipPath={`url(#${clipId})`}
                className="janta-esg-fill-breathe"
            />
        </svg>
    );
}
