"use client";

function commissionedIso(value) {
    if (!value) return "—";
    if (typeof value === "string") return value.slice(0, 10);
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
}

function coordLabel(lat, lon) {
    const a = Number(lat);
    const b = Number(lon);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return "—";
    return `${a.toFixed(4)}, ${b.toFixed(4)}`;
}

function inverterLabel(system, groups = []) {
    const types = [...new Set(groups.map((g) => g.type).filter(Boolean))];
    if (types.length) return types.join(" + ");
    return system?.inverter_type || "—";
}

export default function SystemOfRecord({
    T,
    system,
    inverterGroups = [],
    lifetimeMwh,
    recordYears = 0,
}) {
    const nameplate = system?.max_pv_kw != null
        ? `${Number(system.max_pv_kw).toFixed(1)} kW`
        : "—";
    const lifetime = lifetimeMwh != null
        ? `${Number(lifetimeMwh).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh`
        : "—";

    const rows = [
        ["System", system?.system_name || "—"],
        ["Inverter", inverterLabel(system, inverterGroups)],
        ["Nameplate PV", nameplate],
        ["Lifetime energy", recordYears > 0 ? `${lifetime} · ${recordYears} yr` : lifetime],
        ["Commissioned", commissionedIso(system?.installation_date)],
        ["System Status", system?.status || "—"],
        ["Timezone", system?.timezone || "—"],
        ["Coordinates", coordLabel(system?.latitude, system?.longitude)],
    ];

    return (
        <div
            className="rounded-xl overflow-hidden h-full janta-card-shimmer"
            style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow,
                borderRadius: T.cardRadius,
                "--card-shimmer": T.amber,
            }}
        >
            <div className="px-5 h-12 flex items-center" style={{ borderBottom: `0.5px solid ${T.border}` }}>
                <p className="text-[13px] font-bold tracking-[0.15em] uppercase leading-none" style={{ color: T.text3 }}>
                    System of Record
                </p>
            </div>
            <dl>
                {rows.map(([label, value], idx) => (
                    <div
                        key={label}
                        className="px-5 py-3 flex items-baseline justify-between gap-4"
                        style={idx > 0 ? { borderTop: `0.5px solid ${T.border}` } : undefined}
                    >
                        <dt className="text-[13px] shrink-0" style={{ color: T.text3 }}>{label}</dt>
                        <dd className="text-[13px] font-medium tabular-nums text-right truncate" style={{ color: T.text1 }}>
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
