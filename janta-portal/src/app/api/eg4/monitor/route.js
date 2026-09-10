import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { decryptSystemId } from "@/lib/froniusCrypto";

export const dynamic = 'force-dynamic';

const EG4_USERNAME = process.env.EG4_USERNAME;
const EG4_PASSWORD = process.env.EG4_PASSWORD;
const MONITOR_BASE = "https://monitor.eg4electronics.com";

let cachedCookies = null;
let cookieExpiry = 0;

function parseCookies(setCookieHeaders) {
    return setCookieHeaders
        .map(h => h.split(";")[0].trim())
        .join("; ");
}

async function getMonitorCookies({ forceRefresh = false } = {}) {
    if (!forceRefresh && cachedCookies && Date.now() < cookieExpiry) {
        return cachedCookies;
    }

    const body = new URLSearchParams();
    body.append("account", EG4_USERNAME);
    body.append("password", EG4_PASSWORD);

    // redirect: 'manual' keeps the 302 response so Set-Cookie headers aren't lost
    const res = await fetch(`${MONITOR_BASE}/WManage/web/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        redirect: "manual",
    });

    // 200 = direct login, 302/301 = redirect-after-login — both are valid
    if (res.status !== 200 && res.status !== 302 && res.status !== 301) {
        throw new Error(`Monitor login failed: ${res.status}`);
    }

    // getSetCookie() (Node 18.14+) returns all Set-Cookie values; fall back to get()
    let setCookieHeaders = [];
    if (typeof res.headers.getSetCookie === "function") {
        setCookieHeaders = res.headers.getSetCookie();
    } else {
        const raw = res.headers.get("set-cookie");
        if (raw) setCookieHeaders = [raw];
    }

    if (!setCookieHeaders.length) {
        // Log all headers to help diagnose what the monitor portal actually returns
        console.error("Monitor login headers:", Object.fromEntries(res.headers.entries()));
        throw new Error("No cookies returned from monitor login");
    }

    cachedCookies = parseCookies(setCookieHeaders);
    cookieExpiry = Date.now() + 30 * 60 * 1000; // 30-min cache
    return cachedCookies;
}

async function monitorPost(path, cookies, params) {
    const body = new URLSearchParams(params);
    const res = await fetch(`${MONITOR_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Referer": `${MONITOR_BASE}/WManage/web/monitor/inverter`,
            "Cookie": cookies,
        },
        body: body.toString(),
        cache: "no-store",
    });

    if (res.status === 401 || res.status === 302) {
        cachedCookies = null;
        throw new Error("Monitor session expired");
    }
    if (!res.ok) throw new Error(`Monitor API error: ${res.status}`);
    return res.json();
}

async function monitorPostWithRetry(path, params) {
    let cookies = await getMonitorCookies();
    try {
        return await monitorPost(path, cookies, params);
    } catch (error) {
        if (!error.message.includes("session expired")) throw error;
        cookies = await getMonitorCookies({ forceRefresh: true });
        return monitorPost(path, cookies, params);
    }
}

function normalizeYearColumn(data) {
    const list = Array.isArray(data) ? data : (data?.data ?? []);

    const labels = [];
    const values = [];

    for (let month = 1; month <= 12; month++) {
        labels.push(month);
        const entry = list.find(e => Number(e.month) === month);
        // ePv1Day + ePv2Day + ePv3Day are in 0.1 kWh units
        const kwh = entry
            ? ((entry.ePv1Day ?? 0) + (entry.ePv2Day ?? 0) + (entry.ePv3Day ?? 0)) / 10
            : 0;
        values.push(Math.round(kwh * 10) / 10);
    }

    return { labels, values };
}

function normalizeTotalColumn(data) {
    const list = Array.isArray(data) ? data : (data?.data ?? []);

    const sorted = [...list].sort((a, b) => Number(a.year ?? a.y) - Number(b.year ?? b.y));

    const labels = sorted.map(e => Number(e.year ?? e.y));
    const values = sorted.map(e => {
        // same 0.1 kWh units → divide by 10 for kWh, then by 1000 for MWh
        const kwh = ((e.ePv1Day ?? 0) + (e.ePv2Day ?? 0) + (e.ePv3Day ?? 0)) / 10;
        return parseFloat((kwh / 1000).toFixed(2));
    });

    return { labels, values };
}

function normalizeMonthColumn(data, daysInMonth) {
    const list = Array.isArray(data) ? data : (data?.data ?? []);

    const labels = [];
    const values = [];

    for (let day = 1; day <= daysInMonth; day++) {
        labels.push(day);
        const entry = list.find(e => Number(e.day) === day);
        // same 0.1 kWh unit convention as yearColumn
        const kwh = entry
            ? ((entry.ePv1Day ?? 0) + (entry.ePv2Day ?? 0) + (entry.ePv3Day ?? 0)) / 10
            : 0;
        values.push(Math.round(kwh * 10) / 10);
    }

    return { labels, values };
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

        if (!EG4_USERNAME || !EG4_PASSWORD) throw new Error("Missing EG4 credentials");

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

        if (!system) return NextResponse.json({ error: "No EG4 system found" }, { status: 404 });

        const serial = decryptSystemId(system);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed
        const daysInMonth = new Date(year, month, 0).getDate();

        const [yearRaw, monthRaw, totalRaw] = await Promise.all([
            monitorPostWithRetry("/WManage/api/inverterChart/yearColumn", {
                serialNum: serial,
                year: String(year),
            }),
            monitorPostWithRetry("/WManage/api/inverterChart/monthColumn", {
                serialNum: serial,
                year: String(year),
                month: String(month),
            }),
            monitorPostWithRetry("/WManage/api/inverterChart/totalColumn", {
                serialNum: serial,
            }),
        ]);

        // console.log("EG4 totalColumn raw:", JSON.stringify(totalRaw, null, 2));

        const yearlyproduction = normalizeTotalColumn(totalRaw);
        const lifetimeMwh = (yearlyproduction.values || []).reduce((s, v) => s + (Number(v) || 0), 0);

        return NextResponse.json({
            data: {
                monthlyproduction: normalizeYearColumn(yearRaw),
                dailyproduction: normalizeMonthColumn(monthRaw, daysInMonth),
                yearlyproduction,
                total: Math.round(lifetimeMwh * 1000),
            },
        });
    } catch (error) {
        console.error("EG4 monitor error:", error);
        return NextResponse.json({ error: "Failed to fetch EG4 monitor data" }, { status: 500 });
    }
}
