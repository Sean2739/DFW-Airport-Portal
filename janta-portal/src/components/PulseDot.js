"use client";

export default function PulseDot({ color, className = "" }) {
    return (
        <span className={`relative w-1.5 h-1.5 inline-block shrink-0 ${className}`}>
            <span className="absolute inset-0 rounded-full janta-dot-ping" style={{ background: color }} />
            <span className="absolute inset-0 rounded-full" style={{ background: color }} />
        </span>
    );
}
