import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { decryptSystemId } from "@/lib/froniusCrypto";

export const dynamic = 'force-dynamic';

const EG4_USERNAME = process.env.EG4_USERNAME;
const EG4_PASSWORD = process.env.EG4_PASSWORD;

let cachedSession = null;
let sessionExpiry = 0;

async function getSession({ forceRefresh = false } = {}) {
    // Reuse cached session for 5 minutes
    if (!forceRefresh && cachedSession && Date.now() < sessionExpiry) {
        return cachedSession;
    }

    const res = await fetch("https://api.eg4electronics.com/web/eg4ui/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: EG4_USERNAME, password: EG4_PASSWORD }),
    });

    if (!res.ok) {
        throw new Error(`Login failed: ${res.status}`);
    }

    const data = await res.json();
    const token = data.session_token || data.token || data.sessionToken;

    if (!token) {
        throw new Error("No session token returned from login");
    }

    cachedSession = token;
    sessionExpiry = Date.now() + 5 * 60 * 1000; // 5 min cache

    return token;
}

async function eg4Fetch(path, session) {
    const res = await fetch(`https://api.eg4electronics.com${path}`, {
        headers: {
            session_token: session,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (res.status === 401) {
        // Session expired — clear cache so the caller can re-log in
        cachedSession = null;
        throw new Error("Session expired (401)");
    }

    if (!res.ok) {
        throw new Error(`EG4 API error: ${res.status}`);
    }

    return res.json();
}

async function eg4FetchWithRetry(path, session) {
    try {
        return await eg4Fetch(path, session);
    } catch (error) {
        if (error.message !== "Session expired (401)") throw error;

        // Re-login once and retry
        const freshSession = await getSession({ forceRefresh: true });
        return eg4Fetch(path, freshSession);
    }
}

export async function GET(request) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

        const token = request.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const customerId = Number(decoded.sub);
        const userRole = String(decoded.role).toUpperCase();
        const activeSystemId = Number(decoded.activeSystemId) || null;

        if (!EG4_USERNAME || !EG4_PASSWORD) {
            throw new Error("Missing EG4 API credentials");
        }

        // Admins can access any system; users must be linked via customer_system
        const system = await prisma.systems.findFirst({
            where: {
                id: activeSystemId,
                inverter_type: { equals: "EG4", mode: "insensitive" },
                system_cipher: { not: null },
                system_iv: { not: null },
                system_tag: { not: null },
                ...(userRole !== "ADMIN" && {
                    customer_system: { some: { customer_id: customerId } },
                }),
            },
            select: { system_cipher: true, system_iv: true, system_tag: true },
        });

        if (!system) {
            return NextResponse.json({ error: "No EG4 system found for this customer" }, { status: 404 });
        }

        const serial = decryptSystemId(system);

        const session = await getSession();

        const [currentState, energyInfo] = await Promise.all([
            eg4FetchWithRetry(`/api/device/v5/summary/currentState/${serial}`, session),
            eg4FetchWithRetry(`/api/device/v2/summary/energyInfo/${serial}`, session),
        ]);

        const result = {
            timestamp: currentState.calendar,
            status: currentState.statusText,
            solar: {
                pv1_w: currentState.ppv1,
                pv2_w: currentState.ppv2,
                pv3_w: currentState.ppv3,
                total_w: (currentState.ppv1 || 0) + (currentState.ppv2 || 0) + (currentState.ppv3 || 0),
                today_kwh: ((energyInfo.eTodayPV1 || 0) + (energyInfo.eTodayPV2 || 0)) / 10,
                total_kwh: energyInfo.eTotalPV1 / 10,
            },
            battery: {
                soc: currentState.soc,
                voltage_v: currentState.vBat / 10,
                charge_w: currentState.pCharge,
                discharge_w: currentState.pDisCharge,
                charged_today_kwh: energyInfo.eTodayCharge / 10,
                discharged_today_kwh: energyInfo.eTodayDischarge / 10,
            },
            eps: {
                total_w: currentState.peps,
                l1_w: currentState.pEpsL1N,
                l2_w: currentState.pEpsL2N,
                today_kwh: energyInfo.eTodayEPS / 10,
            },
            grid: {
                connected: currentState.gridConnected,
                voltage_v: currentState.gridVoltage,
                frequency_hz: currentState.gridFrequency,
                to_grid_w: currentState.pToGrid,
                to_user_w: currentState.pToUser,
                import_today_kwh: energyInfo.eTodayImport,
                export_today_kwh: energyInfo.eTodayExport,
            },
            consumption: {
                power_w: currentState.consumptionPower,
                today_kwh: energyInfo.eTodayConsumption,
            },
            generator: {
                power_w: currentState.genPower,
                today_kwh: energyInfo.eTodayGenerator,
            },
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("EG4 API error:", error);

        return NextResponse.json({ error: "Failed to fetch EG4 data" }, { status: 500 });
    }
}
