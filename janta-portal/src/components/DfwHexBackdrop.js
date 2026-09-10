"use client";

/** Honeycomb motif from the DFW dashboard hex graphics. */
export default function DfwHexBackdrop({ isDark }) {
    const stroke = isDark ? "rgba(255, 80, 0, 0.10)" : "rgba(255, 80, 0, 0.08)";
    const veil = isDark ? "rgba(255, 80, 0, 0.10)" : "rgba(255, 80, 0, 0.06)";
    const veilBlue = isDark ? "rgba(62, 177, 200, 0.08)" : "rgba(62, 177, 200, 0.05)";

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(120% 80% at 78% -10%, ${veil} 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, ${veilBlue} 0%, transparent 55%)`,
                }}
            />
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" style={{ opacity: isDark ? 0.7 : 0.5 }}>
                <defs>
                    <pattern id="dfw-hexcomb" width="56" height="97" patternUnits="userSpaceOnUse">
                        <path
                            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 M28 64 L0 80"
                            fill="none"
                            stroke={stroke}
                            strokeWidth="1.2"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dfw-hexcomb)" />
            </svg>
        </div>
    );
}
