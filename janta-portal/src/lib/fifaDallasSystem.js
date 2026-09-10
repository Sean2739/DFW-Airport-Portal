/** Helpers for identifying the FIFA Dallas system (Fair Park). */

export function isFifaDallasName(name) {
    return String(name ?? "").trim().toLowerCase() === "fifa dallas";
}

export function isFifaDallasSystem(system) {
    return isFifaDallasName(system?.system_name);
}
