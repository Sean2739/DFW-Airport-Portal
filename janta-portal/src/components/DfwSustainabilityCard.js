"use client";

import { DFW_ORANGE } from "@/lib/dfwDashboardTheme";
import DfwDepartureMap from "@/components/DfwDepartureMap";

const CO2_KG_PER_KWH = 0.37;
const JET_A_KG_CO2_PER_GAL = 9.75;

export default function DfwSustainabilityCard({ T, ytdKwh = 0 }) {
    const gallons = Math.max(0, ((Number(ytdKwh) || 0) * CO2_KG_PER_KWH) / JET_A_KG_CO2_PER_GAL);

    return (
        <div
            className="rounded-xl overflow-hidden flex flex-col h-full janta-card-shimmer"
            style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow,
                borderRadius: T.cardRadius,
                "--card-shimmer": T.amber,
            }}
        >
            <div className="px-5 h-12 flex items-center shrink-0" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>
                    Trusted With Tomorrow
                </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex min-h-0">
                    <div className="px-5 pt-3 pb-2 flex flex-col justify-start sm:w-[40%] shrink-0">
                        <p className="text-[36px] font-[200] leading-none tracking-[-0.02em] tabular-nums whitespace-nowrap" style={{ color: DFW_ORANGE }}>
                            {Math.round(gallons).toLocaleString()}
                            <span className="text-lg font-light ml-1" style={{ color: T.text2 }}>gal Jet A</span>
                        </p>
                        <p className="text-sm mt-1.5" style={{ color: T.text2 }}>
                            Fuel this array displaced this year
                        </p>
                    </div>

                    <div className="relative min-h-0 flex-1 sm:w-[60%] px-1 py-1">
                        <div className="absolute inset-1">
                            <DfwDepartureMap T={T} />
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-2 pt-0 -translate-y-3">
                    <p className="text-[21px] font-medium leading-none tracking-[-0.02em]" style={{ color: T.text1 }}>
                        <span style={{ color: DFW_ORANGE }}>2050</span> by 2030
                    </p>
                    <p className="text-[13px] leading-none mt-1.5 whitespace-nowrap" style={{ color: T.text2 }}>
                        Net-zero carbon, two decades ahead of the global goal.
                    </p>
                </div>
            </div>
        </div>
    );
}
