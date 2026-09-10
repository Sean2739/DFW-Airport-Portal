"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { DFW_BLUE, DFW_ORANGE } from "@/lib/dfwDashboardTheme";
import { DFW, MAP, project, routeArc, US_LAND_PATH } from "@/lib/dfwFlightMap";

function PlaneMark() {
    return (
        <path
            fill={DFW_ORANGE}
            stroke={DFW_ORANGE}
            strokeWidth="0.3"
            strokeLinejoin="round"
            d="M6 0 L3.7-0.58 L1.6-0.68 L0.55-3.7 L-0.8-3.7 L-0.1-0.7 L-3.1-0.63 L-4.3-1.85 L-5.2-1.85 L-4.65-0.58 L-6 0 L-4.65 0.58 L-5.2 1.85 L-4.3 1.85 L-3.1 0.63 L-0.1 0.7 L-0.8 3.7 L0.55 3.7 L1.6 0.68 L3.7 0.58 Z"
        />
    );
}

function canLabel(pt, hub, placed) {
    if (Math.hypot(pt.x - hub.x, pt.y - hub.y) < 28) return false;
    return placed.every((p) => Math.hypot(p.x - pt.x, p.y - pt.y) > 18);
}

function routeDelay(dest) {
    let hash = 0;
    for (let i = 0; i < dest.length; i += 1) hash = (hash * 33 + dest.charCodeAt(i)) >>> 0;
    return `${(hash % 80) / 10}s`;
}

export default function DfwDepartureMap({ T }) {
    const [routes, setRoutes] = useState([]);
    const mapId = useId().replace(/:/g, "");

    useEffect(() => {
        let timer;
        const load = async () => {
            try {
                const res = await fetch("/api/dfw-flights", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.routes)) {
                    setRoutes((prev) => {
                        const next = data.routes;
                        if (!next.length && prev.length) return prev;
                        if (prev.length === next.length && next.every((route) => prev.some((p) => p.dest === route.dest))) {
                            return prev;
                        }
                        return next;
                    });
                }
            } catch {
                /* keep last live snapshot */
            }
        };
        load();
        timer = setInterval(load, 30000);
        return () => clearInterval(timer);
    }, []);

    const hub = project(DFW.lat, DFW.lon);
    const drawn = useMemo(() => {
        const placed = [];
        return routes.map((route) => {
            const arc = routeArc(route.destLat, route.destLon);
            if (!Number.isFinite(arc.from.x) || !Number.isFinite(arc.to.x) || !arc.d || arc.d.includes("NaN")) return null;
            const showLabel = canLabel(arc.to, hub, placed);
            if (showLabel) placed.push(arc.to);
            return {
                ...route,
                arc,
                showLabel,
                dur: `${10 + Math.min(10, arc.dist / 28)}s`,
                delay: routeDelay(route.dest),
                pathId: `dfw-live-${mapId}-${route.dest}`,
            };
        }).filter(Boolean);
    }, [routes, mapId]);

    return (
        <svg
            className="dfw-flight-map absolute inset-0 h-full w-full"
            viewBox={`0 0 ${MAP.w} ${MAP.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
        >
            <path
                d={US_LAND_PATH}
                fill={T.text3}
                fillOpacity="0.14"
                stroke={T.text3}
                strokeOpacity="0.45"
                strokeWidth="0.8"
                strokeLinejoin="round"
            />

            {drawn.map((route) => (
                <g key={route.dest}>
                    <path
                        d={route.arc.d}
                        fill="none"
                        stroke={DFW_BLUE}
                        strokeWidth="0.9"
                        opacity="0.22"
                    />
                    <path
                        className="dfw-route-trail"
                        d={route.arc.d}
                        pathLength="1000"
                        fill="none"
                        stroke={DFW_BLUE}
                        strokeWidth="1.45"
                        strokeLinecap="round"
                        style={{ animationDuration: route.dur, animationDelay: route.delay }}
                    />
                    <circle cx={route.arc.to.x} cy={route.arc.to.y} r="1.6" fill={DFW_BLUE} opacity="0.9" />
                    {route.showLabel ? (
                        <text
                            x={route.arc.to.x}
                            y={route.arc.to.y - 5}
                            textAnchor="middle"
                            fill={T.text3}
                            fontSize="7"
                            fontWeight="600"
                            letterSpacing="0.04em"
                        >
                            {route.dest}
                        </text>
                    ) : null}
                    <path id={route.pathId} d={route.arc.d} fill="none" />
                    <g className="dfw-map-plane">
                        <animateMotion
                            dur={route.dur}
                            begin={route.delay}
                            rotate="auto"
                            repeatCount="indefinite"
                            calcMode="linear"
                        >
                            <mpath href={`#${route.pathId}`} xlinkHref={`#${route.pathId}`} />
                        </animateMotion>
                        <PlaneMark />
                    </g>
                </g>
            ))}

            <g transform={`translate(${hub.x} ${hub.y})`}>
                <circle className="dfw-hub-pulse" r="4" fill={DFW_ORANGE} />
                <circle r="3.1" fill={DFW_ORANGE} />
                <text
                    y="13"
                    textAnchor="middle"
                    fill={DFW_ORANGE}
                    fontSize="8"
                    fontWeight="700"
                    letterSpacing="0.12em"
                >
                    DFW
                </text>
            </g>
        </svg>
    );
}
