"use client";

import { useId } from "react";

const TOWER_SRC = "/images/dfw-hex-tower.jpg";
const VB_W = 196;
const VB_H = 204;

export default function TowerImpactIcon({
    fillColor,
    isDark = false,
    className = "",
}) {
    const maskId = useId();
    const silId = useId();
    const glowId = useId();
    const auroraId = useId();
    const shineId = useId();

    return (
        <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className={`block max-h-full max-w-full min-h-0 ${className}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
        >
            <defs>
                <filter id={silId} colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 1 0"
                    />
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="3" intercept="-0.15" />
                        <feFuncG type="linear" slope="3" intercept="-0.15" />
                        <feFuncB type="linear" slope="3" intercept="-0.15" />
                    </feComponentTransfer>
                </filter>
                <filter id={glowId} x="-12%" y="-12%" width="124%" height="124%">
                    <feGaussianBlur stdDeviation="0.7" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id={auroraId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="22%" stopColor="#ffffff" stopOpacity={isDark ? 0.1 : 0.07} />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="72%" stopColor="#ffffff" stopOpacity={isDark ? 0.1 : 0.07} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0.22">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="48%" stopColor="#ffffff" stopOpacity={isDark ? 0.16 : 0.12} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width={VB_W} height={VB_H} fill="black" />
                    <g transform={`translate(${VB_W} 0) scale(-1 1)`}>
                        <image
                            href={TOWER_SRC}
                            x="0"
                            y="0"
                            width={VB_W}
                            height={VB_H}
                            preserveAspectRatio="xMidYMid meet"
                            filter={`url(#${silId})`}
                        />
                    </g>
                </mask>
            </defs>

            <g mask={`url(#${maskId})`} filter={`url(#${glowId})`}>
                <rect
                    x="0"
                    y="0"
                    width={VB_W}
                    height={VB_H}
                    fill={fillColor}
                    className="janta-esg-fill-breathe"
                />
                <rect
                    className="janta-tower-aurora"
                    x="0"
                    y={-VB_H}
                    width={VB_W}
                    height={VB_H * 2}
                    fill={`url(#${auroraId})`}
                />
                <g className="janta-tower-shine">
                    <rect
                        x="-36"
                        y="-28"
                        width="52"
                        height={VB_H + 56}
                        fill={`url(#${shineId})`}
                        transform="rotate(-18 26 102)"
                    />
                </g>
            </g>
        </svg>
    );
}
