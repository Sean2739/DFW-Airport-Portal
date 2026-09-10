import { directionFromAngle, stateTone } from "@/lib/dfwAirportSystem";

export { directionFromAngle, stateTone };

const STATE_RANK = { TRACKING: 0, ACTIVE: 1, IDLE: 2, MAINTENANCE: 3, FAULT: 4 };

export function hasInverterSplit(towers = []) {
    return towers.some((t) => t?.inverter);
}

export function splitTowerPower(towers = [], totalPvKw = 0) {
    const weights = towers.map((t) => {
        const s = String(t.state ?? "ACTIVE").toUpperCase();
        if (s === "FAULT") return 0;
        if (s === "MAINTENANCE") return 0.08;
        if (s === "IDLE") return 0.22;
        if (s === "TRACKING") return 1;
        return 0.85;
    });
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    return towers.map((t, i) => ({
        ...t,
        powerKw: Number(((Number(totalPvKw) || 0) * weights[i]) / sum),
        towerAngle: Number(t.tower_angle ?? t.towerAngle ?? 0),
        errorTicks: Number(t.error_ticks ?? t.errorTicks ?? 0),
        originalIndex: i,
    }));
}

export function groupTowersByInverter(poweredTowers = [], maxPvKw = 0) {
    const byInv = new Map();
    for (const t of poweredTowers) {
        const id = t.inverter || "Site";
        if (!byInv.has(id)) byInv.set(id, []);
        byInv.get(id).push(t);
    }
    const groups = [...byInv.entries()];
    const ratedEach = groups.length ? (Number(maxPvKw) || 0) / groups.length : 0;

    return groups.map(([id, rows]) => {
        const states = rows.map((t) => String(t.state ?? "ACTIVE").toUpperCase());
        const worst = states.reduce((w, s) => (STATE_RANK[s] > STATE_RANK[w] ? s : w), "TRACKING");
        const areas = [...new Set(rows.map((r) => r.area).filter(Boolean))];
        return {
            id,
            name: id.replace(/^INV-?/i, "Inverter "),
            type: rows[0]?.inverter_type || rows[0]?.inverterType || "",
            area: areas.join(" · ") || "—",
            towers: rows,
            online: rows.filter((t) => {
                const s = String(t.state ?? "ACTIVE").toUpperCase();
                return s !== "FAULT" && s !== "MAINTENANCE";
            }).length,
            powerKw: rows.reduce((s, t) => s + (Number(t.powerKw) || 0), 0),
            ratedKw: ratedEach,
            worstState: worst,
            tone: stateTone(worst),
        };
    });
}
