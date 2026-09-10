import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { decryptSystemId } from "@/lib/froniusCrypto";

export const dynamic = 'force-dynamic';

const EG4_USERNAME = process.env.EG4_USERNAME;
const EG4_PASSWORD = process.env.EG4_PASSWORD;

let cachedSession = null;
let sessionExpiry = 0;

async function getSession({ forceRefresh = false } = {}) {
    if (!forceRefresh && cachedSession && Date.now() < sessionExpiry) {
        return cachedSession;
    }
    const res = await fetch("https://api.eg4electronics.com/web/eg4ui/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: EG4_USERNAME, password: EG4_PASSWORD }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const data = await res.json();
    const token = data.session_token || data.token || data.sessionToken;
    if (!token) throw new Error("No session token returned from login");
    cachedSession = token;
    sessionExpiry = Date.now() + 5 * 60 * 1000;
    return token;
}

async function eg4Fetch(path, session) {
    const res = await fetch(`https://api.eg4electronics.com${path}`, {
        headers: { session_token: session, Accept: "application/json" },
        cache: "no-store",
    });
    if (res.status === 401) { cachedSession = null; throw new Error("Session expired (401)"); }
    if (!res.ok) throw new Error(`EG4 history API error: ${res.status}`);
    return res.json();
}

async function eg4FetchWithRetry(path, session) {
    try {
        return await eg4Fetch(path, session);
    } catch (error) {
        if (error.message !== "Session expired (401)") throw error;
        const freshSession = await getSession({ forceRefresh: true });
        return eg4Fetch(path, freshSession);
    }
}

function normalizeInverterHistory(data, systemTZ) {
    // Handle multiple possible response shapes from EG4
    const entries = Array.isArray(data)
        ? data
        : (data?.data ?? data?.list ?? data?.records ?? []);

    if (!Array.isArray(entries) || !entries.length) return { labels: [], values: [] };

    const points = entries
        .map(entry => {
            const ts = entry.time ?? entry.timestamp ?? entry.ts ?? entry.t;
            if (ts == null) return null;

            // Sum all PV string powers (Watts)
            const power = ((entry.ppv1 ?? 0) + (entry.ppv2 ?? 0) + (entry.ppv3 ?? 0))
                || (entry.ppv ?? entry.pPV ?? entry.pvPower ?? 0);

            const dt = DateTime.fromMillis(Number(ts), { zone: systemTZ });
            return { dt, power: Math.max(0, Number(power)) };
        })
        .filter(Boolean)
        .sort((a, b) => a.dt.toMillis() - b.dt.toMillis());

    return {
        // Labels as UTC HH:mm — matches how Fronius labels are consumed in the dashboard
        labels: points.map(p => p.dt.toUTC().toFormat("HH:mm")),
        values: points.map(p => Math.round(p.power)),
    };
}

export async function GET(request) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

        const token = request.cookies.get("session")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET);
        const customerId = Number(decoded.sub);
        const userRole = String(decoded.role).toUpperCase();
        const activeSystemId = Number(decoded.activeSystemId) || null;

        if (!EG4_USERNAME || !EG4_PASSWORD) throw new Error("Missing EG4 API credentials");

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
            select: { system_cipher: true, system_iv: true, system_tag: true, timezone: true },
        });

        if (!system) return NextResponse.json({ error: "No EG4 system found" }, { status: 404 });

        const serial = decryptSystemId(system);
        const systemTZ = system.timezone || "America/Chicago";

        const nowSystem = DateTime.now().setZone(systemTZ);
        const t1 = nowSystem.startOf("day").toMillis();
        const t2 = nowSystem.startOf("day").plus({ days: 1 }).toMillis();

        const session = await getSession();
        const raw = await eg4FetchWithRetry(
            `/api/history/v2/getInverterHistory/${serial}?t1=${t1}&t2=${t2}`,
            session,
        );

        const hourlyproduction = normalizeInverterHistory(raw, systemTZ);

        return NextResponse.json({ data: { hourlyproduction } });
    } catch (error) {
        console.error("EG4 history error:", error);
        return NextResponse.json({ error: "Failed to fetch EG4 history" }, { status: 500 });
    }
}
