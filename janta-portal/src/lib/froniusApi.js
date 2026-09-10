import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { decryptSystemId } from "@/lib/froniusCrypto";

export const SOLARWEB_BASE_URL = "https://api.solarweb.com/swqapi/pvsystems";

/**
 * Generic SolarWeb fetch helper
 */
export async function fetchSolar(url, label) {
    const headers = {
        accept: "application/json",
        AccessKeyId: process.env.SOLAR_KEY_ID,
        AccessKeyValue: process.env.SOLAR_KEY_VALUE,
    };
    const res = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`${label} failed (${res.status})`);
    }

    return res.json();
}

/**
 * Authenticates the request and resolves the caller's active Fronius system.
 * Returns either { systemId, systemTZ } or { error: { message, status } }.
 */
export async function resolveFroniusSystem(request) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return { error: { message: "JWT_SECRET is not set", status: 500 } };
    }

    if (!process.env.SOLAR_KEY_ID || !process.env.SOLAR_KEY_VALUE) {
        return { error: { message: "Missing SolarWeb API credentials", status: 503 } };
    }

    const token = request.cookies.get("session")?.value;
    if (!token) {
        return { error: { message: "Unauthorized", status: 401 } };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const customerId = Number(decoded.sub);
    const userRole = String(decoded.role).toUpperCase();
    const activeSystemId = Number(decoded.activeSystemId) || null;

    // Admins can access any system; users must be linked via customer_system
    const systemRecord = await prisma.systems.findFirst({
        where: {
            id: activeSystemId,
            ...(userRole !== "ADMIN" && {
                customer_system: { some: { customer_id: customerId } },
            }),
        },
        select: { timezone: true },
    });

    if (!systemRecord) {
        return { error: { message: "System not found for this customer", status: 404 } };
    }

    const encryptedSystem = await prisma.systems.findFirst({
        where: {
            id: activeSystemId,
            has_fronius_system: true,
            system_cipher: { not: null },
            system_iv:     { not: null },
            system_tag:    { not: null },
            ...(userRole !== "ADMIN" && {
                customer_system: { some: { customer_id: customerId } },
            }),
        },
        select: { system_cipher: true, system_iv: true, system_tag: true },
    });

    if (!encryptedSystem) {
        return { error: { message: "No Fronius system found", status: 404 } };
    }

    const systemId = decryptSystemId({
        system_cipher: encryptedSystem.system_cipher,
        system_iv:     encryptedSystem.system_iv,
        system_tag:    encryptedSystem.system_tag,
    });

    return { systemId, systemTZ: systemRecord.timezone ?? "America/Chicago" };
}

/**
 * Normalize real-time LiveData power flow
 * (structure may vary slightly per system)
 */
export function normalizeLiveData(data) {
    if (!data?.systemChannels) {
        return { pvPower: 0 };
    }

    const channels = Object.fromEntries(
        data.systemChannels.map(ch => [
            ch.channelName,
            ch.value ?? 0,
        ])
    );

    return {
        timestamp: new Date().toISOString(),
        pvPower: channels.PowerPV ?? 0,
        online: data.status?.isOnline ?? false,
    };
}

/**
 * Normalize FlowData — grid, load, battery, self-consumption rates
 * Channel names confirmed from live API probe:
 *   PowerFeedIn    — power exported TO the grid (W), positive = exporting
 *   PowerLoad      — house consumption (W)
 *   PowerBattCharge — battery charge power (W), positive = charging, negative = discharging
 *   PowerPV        — solar production (W)
 *   PowerOutput    — total inverter output (W)
 *   BattSOC        — battery state of charge (%), null if no battery
 *   RateSelfConsumption  — % of solar used on-site
 *   RateSelfSufficiency  — % of load covered by solar
 */
export function normalizeFlowData(data) {
    if (!data?.data?.channels) {
        return {
            pvPower: 0,
            gridPower: 0,
            gridImport: false,
            loadPower: 0,
            battChargePower: 0,
            battSoc: null,
            hasBattery: false,
            selfConsumptionRate: null,
            selfSufficiencyRate: null,
            timestamp: new Date().toISOString(),
        };
    }

    // Build a lookup map from the channels array
    const ch = Object.fromEntries(
        data.data.channels.map(c => [c.channelName, c.value])
    );

    const pvPower        = ch.PowerPV         ?? 0;
    const feedIn         = ch.PowerFeedIn     ?? null; // positive = exporting
    const loadPower      = ch.PowerLoad       ?? 0;
    const battCharge     = ch.PowerBattCharge ?? null;
    const battSoc        = ch.BattSOC         ?? null;  // null = no battery
    const selfConsump    = ch.RateSelfConsumption ?? null;
    const selfSuffic     = ch.RateSelfSufficiency ?? null;

    // Derive grid power and direction:
    // - If PowerFeedIn > 0  → exporting to grid, gridPower = feedIn
    // - If PowerFeedIn <= 0 → likely importing; derive from load - pv
    // - If feedIn is null   → use load - pv as best estimate
    let gridPower  = 0;
    let gridImport = false;

    if (feedIn !== null && feedIn > 0) {
        // Actively exporting
        gridPower  = feedIn;
        gridImport = false;
    } else {
        // Importing or zero — derive: what load needs beyond what PV covers
        const netDemand = loadPower - pvPower;
        gridPower  = Math.max(0, netDemand);
        gridImport = gridPower > 0;
    }

    return {
        pvPower,
        gridPower:           Math.round(gridPower),
        gridImport,
        loadPower:           Math.round(loadPower),
        battChargePower:     battCharge !== null ? Math.round(battCharge) : null,
        battSoc,
        hasBattery:          battSoc !== null,
        selfConsumptionRate: selfConsump,
        selfSufficiencyRate: selfSuffic,
        timestamp:           data.data.logDateTime ?? new Date().toISOString(),
    };
}
