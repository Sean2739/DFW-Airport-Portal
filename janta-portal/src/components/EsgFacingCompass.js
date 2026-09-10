"use client";

export function azimuthToCardinal(az) {
    const d = ((Number(az) % 360) + 360) % 360;
    if (d >= 337.5 || d < 22.5) return "N";
    if (d < 67.5) return "NE";
    if (d < 112.5) return "E";
    if (d < 157.5) return "SE";
    if (d < 202.5) return "S";
    if (d < 247.5) return "SW";
    if (d < 292.5) return "W";
    return "NW";
}

export default function EsgFacingCompass({ degrees, T, isDark = false }) {
    const valid = Number.isFinite(Number(degrees));
    const az = valid ? ((Number(degrees) % 360) + 360) % 360 : 0;
    const rad = ((az - 90) * Math.PI) / 180;
    const cx = 100;
    const cy = 100;
    const r = 78;
    const circ = 2 * Math.PI * r;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const x0 = cx + ux * r * 0.36;
    const y0 = cy + uy * r * 0.36;
    const x1 = cx + ux * r * 0.86;
    const y1 = cy + uy * r * 0.86;
    const ax = cx + ux * r;
    const ay = cy + uy * r;
    const ring = isDark ? T.border2 : T.border;
    const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
    const degLabel = valid ? az.toFixed(0) : "—";

    return (
        <div className="relative h-full w-full max-h-full max-w-full">
            <svg viewBox="0 0 200 200" className="h-full w-full max-h-full max-w-full" aria-hidden>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring} strokeWidth="1.4" />
                <circle
                    className="janta-compass-ring"
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={T.amber}
                    strokeWidth="1.6"
                    strokeDasharray={`${circ * 0.08} ${circ * 0.92}`}
                    strokeLinecap="round"
                    opacity="0.55"
                />
                <circle
                    className="janta-compass-sweep"
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={T.amber}
                    strokeWidth="2.4"
                    strokeDasharray={`${circ * 0.14} ${circ * 0.86}`}
                    strokeLinecap="round"
                    opacity="0.72"
                />
                {ticks.map((deg) => {
                    const a = ((deg - 90) * Math.PI) / 180;
                    const major = deg % 30 === 0;
                    const inner = r * (major ? 0.86 : 0.92);
                    return (
                        <line
                            key={deg}
                            x1={cx + Math.cos(a) * inner}
                            y1={cy + Math.sin(a) * inner}
                            x2={cx + Math.cos(a) * r}
                            y2={cy + Math.sin(a) * r}
                            stroke={ring}
                            strokeWidth={major ? 1.6 : 0.8}
                            opacity={major ? 0.9 : 0.45}
                        />
                    );
                })}
                {[
                    { label: "N", x: 100, y: 12 },
                    { label: "E", x: 188, y: 104 },
                    { label: "S", x: 100, y: 192 },
                    { label: "W", x: 12, y: 104 },
                ].map((p) => (
                    <text
                        key={p.label}
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={T.text2}
                        fontSize="13"
                        fontWeight="700"
                        letterSpacing="0.14em"
                    >
                        {p.label}
                    </text>
                ))}
                <line
                    x1={x0}
                    y1={y0}
                    x2={x1}
                    y2={y1}
                    stroke={T.amber}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <circle className="janta-compass-aim-ping" cx={ax} cy={ay} r="7" fill={T.amber} />
                <circle cx={ax} cy={ay} r="3.4" fill={T.amber} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[21px] font-medium leading-none tracking-[-0.02em] tabular-nums" style={{ color: T.text1 }}>
                    <span style={{ color: T.amber }}>{degLabel}</span>
                    °
                </p>
            </div>
        </div>
    );
}
