/** Helpers for identifying the DFW Airport system. */

export function isDfwAirportName(name) {
    return String(name ?? "").trim().toLowerCase() === "dfw airport";
}

export function isDfwAirportSystem(system) {
    return isDfwAirportName(system?.system_name);
}

export function directionFromAngle(deg) {
    const d = parseFloat(deg);
    if (Number.isNaN(d)) return "—";
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round((((d % 360) + 360) % 360) / 22.5) % 16];
}

export function stateTone(state) {
    const s = String(state ?? "").toUpperCase();
    if (s === "FAULT") return "fault";
    if (s === "IDLE" || s === "MAINTENANCE") return "watch";
    return "nominal";
}
