"use client";

import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Sun } from "lucide-react";
import { iconProps } from "@/lib/icons";

function weatherGlyph(condition) {
    const c = String(condition || "");
    if (/thunder|storm/i.test(c)) return CloudLightning;
    if (/rain|shower|drizzle/i.test(c)) return CloudRain;
    if (/fog|mist/i.test(c)) return CloudFog;
    if (/cloud|overcast/i.test(c)) return /sun|partly|few|fair/i.test(c) ? CloudSun : Cloud;
    return Sun;
}

function SkyGlyph({ condition, T }) {
    const Glyph = weatherGlyph(condition);
    const spin = Glyph === Sun;
    return (
        <span className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center" aria-hidden>
            <span
                className="janta-sky-glow absolute inset-1 rounded-full"
                style={{ background: T.amber, opacity: 0.22, filter: "blur(8px)" }}
            />
            <Glyph
                {...iconProps(40)}
                color={T.amber}
                className={spin ? "janta-sky-spin relative" : "relative"}
            />
        </span>
    );
}

export default function FieldConditions({
    T,
    condition = "—",
    tempDisplay = "—",
    tempSymbol = "°F",
    humidity,
    windMph,
    loading = false,
    error = null,
    locationLabel = "NOAA forecast",
    showHeader = true,
}) {
    const wind = Number(windMph) || 0;
    const humid = Number(humidity) || 0;
    const gustDur = Math.max(1.6, 4.6 - wind * 0.08);

    return (
        <div className="px-5 pt-3 pb-2">
            {showHeader && (
                <>
                    <p className="text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: T.text3 }}>
                        Conditions at the field
                    </p>
                    <p className="text-xs mt-1" style={{ color: T.text3 }}>{locationLabel}</p>
                </>
            )}

            <div className={showHeader ? "mt-3 flex items-center gap-4" : "flex items-center gap-4"}>
                <SkyGlyph condition={String(condition || "")} T={T} />
                <div className="min-w-0">
                    <p className="text-lg font-light leading-snug" style={{ color: T.text1 }}>
                        {loading ? "Loading…" : error ? error : condition}
                    </p>
                    <p className="mt-1 text-[30px] font-[200] leading-none tabular-nums" style={{ color: T.text1 }}>
                        {loading ? "—" : tempDisplay}
                        <span className="text-base font-light ml-1" style={{ color: T.text2 }}>{tempSymbol}</span>
                    </p>
                </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[13px] tracking-[0.10em] mb-1.5" style={{ color: T.text3 }}>Humidity</p>
                    <p className="text-[20px] font-[200] leading-none tabular-nums" style={{ color: T.text1 }}>
                        {humidity ?? "—"}
                        {humidity != null ? <span className="text-sm font-light" style={{ color: T.text2 }}>%</span> : null}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: T.amberDim || T.border }}>
                        <div
                            className="h-full rounded-full janta-meter-fill"
                            style={{ width: `${Math.max(0, Math.min(100, humid))}%`, background: "#7BAFD4" }}
                        />
                    </div>
                </div>
                <div>
                    <p className="text-[13px] tracking-[0.10em] mb-1.5" style={{ color: T.text3 }}>Wind</p>
                    <p className="text-[20px] font-[200] leading-none tabular-nums" style={{ color: T.text1 }}>
                        {windMph ?? "—"}
                        {windMph != null ? <span className="text-sm font-light" style={{ color: T.text2 }}> mph</span> : null}
                    </p>
                    <div className="relative mt-3 h-5 overflow-hidden">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="janta-sky-gust absolute h-[2px] rounded-full"
                                style={{
                                    top: 3 + i * 6,
                                    width: `${28 + i * 14}%`,
                                    background: T.amber,
                                    animationDelay: `${i * 0.55}s`,
                                    animationDuration: `${gustDur + i * 0.35}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
