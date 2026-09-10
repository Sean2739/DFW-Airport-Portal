"use client";

/** Wikimedia Commons — Football (soccer ball).svg (free use) */
const SOCCER_BALL_SRC = "/images/fifa-soccer-ball.svg";

/** Two large balls — opposite corners only */
const BALLS = [
    { top: "-10%", right: "-10%", size: 520, rotate: -14 },
    { bottom: "-12%", left: "-12%", size: 560, rotate: 18 },
];

export default function FifaSoccerBackdrop({ isDark }) {
    const ballOpacity = isDark ? 0.06 : 0.18;
    const ballFilter = isDark
        ? "brightness(1.1) contrast(0.85) saturate(0.35)"
        : "brightness(1.05) contrast(0.95) saturate(0.85)";

    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            aria-hidden
        >
            {BALLS.map((ball, i) => {
                const { top, left, right, bottom, size, rotate } = ball;
                return (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            top,
                            left,
                            right,
                            bottom,
                            opacity: ballOpacity,
                            transform: `rotate(${rotate}deg)`,
                            filter: isDark
                                ? `${ballFilter} drop-shadow(0 0 60px rgba(0,75,77,0.25))`
                                : `${ballFilter} drop-shadow(0 4px 28px rgba(0,75,77,0.1))`,
                        }}
                    >
                        <img
                            src={SOCCER_BALL_SRC}
                            alt=""
                            width={size}
                            height={size}
                            draggable={false}
                            style={{ display: "block", width: size, height: size }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
