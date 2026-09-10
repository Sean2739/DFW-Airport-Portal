"use client";

const LEAVES = [
    { left: "10%", delay: "0s", dur: "16s", size: 10, color: 0, variant: 0, drift: 12 },
    { left: "28%", delay: "3.4s", dur: "18s", size: 8, color: 1, variant: 1, drift: -10 },
    { left: "46%", delay: "1.6s", dur: "15s", size: 11, color: 2, variant: 0, drift: 14 },
    { left: "62%", delay: "6.2s", dur: "19s", size: 9, color: 3, variant: 1, drift: -8 },
    { left: "78%", delay: "4.1s", dur: "17s", size: 10, color: 4, variant: 0, drift: 11 },
    { left: "18%", delay: "8.8s", dur: "20s", size: 8, color: 0, variant: 1, drift: -9 },
    { left: "88%", delay: "7.5s", dur: "16.5s", size: 9, color: 2, variant: 0, drift: 8 },
];

function LeafSvg({ variant }) {
    if (variant === 1) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2.2c5.2 3.2 8.4 8.1 7.6 13.2-.6 3.6-3.2 5.8-7.6 6.6-4.4-.8-7-3-7.6-6.6C3.6 10.3 6.8 5.4 12 2.2Z" opacity="0.92" />
                <path d="M12 6.2v13.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2.4 13.7 8l5.8-.6-3.8 4.6 4.2 4.4-5.6-1.8L12 21.6l-2.3-7-5.6 1.8 4.2-4.4L4.5 7.4l5.8.6Z" opacity="0.92" />
        </svg>
    );
}

export default function FallingLeaves({ T, isDark = false }) {
    const colors = [
        T.amber,
        isDark ? "#d97706" : "#c45c26",
        isDark ? "#a3b56a" : "#7a9448",
        isDark ? "#e8a020" : "#b45309",
        isDark ? "#c4a574" : "#8b6914",
    ];

    return (
        <div className="janta-leaves pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
            {LEAVES.map((leaf, i) => (
                <span
                    key={i}
                    className="janta-leaf"
                    style={{
                        left: leaf.left,
                        width: leaf.size,
                        height: leaf.size,
                        color: colors[leaf.color],
                        animationDelay: leaf.delay,
                        animationDuration: leaf.dur,
                        "--leaf-drift": `${leaf.drift}px`,
                    }}
                >
                    <LeafSvg variant={leaf.variant} />
                </span>
            ))}
        </div>
    );
}
