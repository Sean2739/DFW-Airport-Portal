import { NextResponse } from "next/server";
import { DateTime } from 'luxon';
import { SOLARWEB_BASE_URL, fetchSolar, resolveFroniusSystem } from "@/lib/froniusApi";
import { isDevAuthBypass } from "@/lib/devAuth";
import { buildDevFroniusHistory } from "@/lib/devDemoData";

export const dynamic = 'force-dynamic';

const BASE_URL = SOLARWEB_BASE_URL;

export async function GET(request) {
    if (isDevAuthBypass()) {
        const demo = buildDevFroniusHistory(request);
        if (demo) return NextResponse.json(demo);
    }

    try {
        const resolved = await resolveFroniusSystem(request);
        if (resolved.error) {
            return NextResponse.json({ error: resolved.error.message }, { status: resolved.error.status });
        }
        const { systemId, systemTZ } = resolved;

        // Get current time based on system timezone
        const nowSystem = DateTime.now().setZone(systemTZ);

        // Get year, month, and day for current timezone
        const y = nowSystem.year;// 2026
        const m = nowSystem.month;// 1–12
        const d = nowSystem.day;// 1–31

        // Apply the same 30-minute delay
        const delayedSystemTime = nowSystem.minus({ minutes: 30 });

        // Start of today in system timezone
        const fromSystem = nowSystem.startOf("day");

        const fromUTC = fromSystem.toUTC();
        const toUTC   = delayedSystemTime.toUTC();

        //Fronius formatting
        const fromISO = fromUTC.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        const toISO   = toUTC.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

        const endpoints = {
            dailyProduction: `${BASE_URL}/${systemId}/aggdata/years/${y}/months/${m}/days`,
            monthlyProduction: `${BASE_URL}/${systemId}/aggdata/years/${y}/months/`,
            yearlyProduction: `${BASE_URL}/${systemId}/aggdata/years/`,
            hourlyProduction:`${BASE_URL}/${systemId}/histdata` +
                `?From=${encodeURIComponent(fromISO)}` +
                `&To=${encodeURIComponent(toISO)}` +
                `&Channel=EnergyProductionTotal&Limit=10000&Offset=0`,
            total: `${BASE_URL}/${systemId}/aggdata`,
        };

        const results = await Promise.allSettled(
            Object.entries(endpoints).map(([key, url]) =>
                fetchSolar(url, key).then(data => [key, data])
            )
        );

        const response = {
            systemId,
            period: { year: y, month: m, day: d },
            data: {},
            errors: [],
        };


        for (const result of results) {
            if (result.status === "fulfilled") {
                const [key, data] = result.value;

                if (key === "hourlyProduction") {
                    response.data.hourlyproduction = normalizeHourlyProduction(data, systemTZ);
                }
                else if (key === "dailyProduction") {
                    response.data.dailyproduction = normalizeDailyProduction(data, systemTZ);
                }
                else if (key === "monthlyProduction") {
                    response.data.monthlyproduction = normalizeMonthlyProduction(data);
                }
                else if (key === "yearlyProduction") {
                    response.data.yearlyproduction = normalizeYearlyProduction(data);
                }
                else if (key === "total") {
                    response.data.total = normalizetotalData(data);
                }
            } else {
                response.errors.push(result.reason.message);
            }
        }

        return NextResponse.json(response);

    } catch (error){
        console.error("SolarWeb API error:", error);

        return NextResponse.json(
            { error: "Failed to fetch solar data" },
            { status: 500 }
        );   
    }
}
/**
 * Normalize hourly aggregated energy values (kWh)
 */
function normalizeHourlyProduction(data, systemTZ = 'America/Chicago') {
    const entries = data?.data;

    if (!Array.isArray(entries)) {
        return { labels: [], values: [] };
    }

    const sortedEntries = entries
        .map(entry => {
            const channel = entry.channels?.find(
                c => c.channelName === "EnergyProductionTotal"
            );

            if (!channel || typeof channel.value !== "number") {
                return null;
            }

            const energyWh = channel.value;

            // Convert from energy to power
            const duration = 300/3600; // 5 minutes in an hour
            const powerW = energyWh / duration;

            // Convert UTC string to Luxon DateTime in system timezone
            const utcDate = DateTime.fromISO(entry.logDateTime, { zone: 'utc' });
            const ctDate = utcDate.setZone(systemTZ);

            return {
                deviceTime: ctDate.toJSDate(), 
                powerW,
            };
        })
        .filter(Boolean)
        .sort(
            (a, b) => a.deviceTime - b.deviceTime
        );

    return {
        labels: sortedEntries.map(e =>
            e.deviceTime.toISOString().slice(11, 16)// HH:mm
        ), 
        values: sortedEntries.map(e =>
            Math.round(Number(e.powerW))
        )
    };
}

/**
 * Normalize daily aggregated energy values for the month (kWh)
 */
function normalizeDailyProduction(data, systemTZ) {
    const channels = data?.data?.channels;

    if (!Array.isArray(channels)) {
        return { labels: [], values: [] };
    }

    const channel = channels.find(
        c => c.channelName === "EnergyProductionTotal"
    );

    if (!channel?.values) {
        return { labels: [], values: [] };
    }

    // Convert channel.values to a Map for easy lookup
    const dayMap = new Map(
        Object.entries(channel.values).map(([day, value]) => [Number(day), value])
    );

    // Determine month and number of days based on system timezone
    const nowSystem = DateTime.now().setZone(systemTZ);
    const daysInMonth = nowSystem.daysInMonth;

    const labels = [];
    const values = [];

    for (let day = 1; day <= daysInMonth; day++) {
        labels.push(day);
        values.push((dayMap.get(day) ?? 0) / 1000); // Wh → kWh
    }

    return { labels, values };
}

//Normalized total data
function normalizetotalData(data){
    if (!data?.data?.channels){
        return 0;
    }

    const channel = data.data.channels.find(
        ch => ch.channelName === "EnergyProductionTotal"
    );

    if (!channel?.values?.total) return 0;
    
    return channel.values.total / 1000; // convert Wh -> kWh
}

/**
 * Normalize daily aggregated energy values for the month (kWh)
 */
function normalizeMonthlyProduction(data) {
    const channels = data?.data?.channels;

    if (!Array.isArray(channels)) {
        return { labels: [], values: [] };
    }

    const channel = channels.find(
        c => c.channelName === "EnergyProductionTotal"
    );

    if (!channel?.values) {
        return { labels: [], values: [] };
    }

    const monthMap = channel.values;
    const labels = [];
    const values = [];

    for (let month = 1; month <= 12; month++) {
        labels.push(month); // keep numeric months for consistency

        const raw = monthMap[String(month)] ?? 0;  // fill missing months
        values.push(raw / 1000);                   // Wh → kWh
    }

    return { labels, values };
}

/**
 * Normalize yearly aggregated energy values for the month (kWh)
 */
function normalizeYearlyProduction(data) {
    const channels = data?.data?.channels;

    if (!Array.isArray(channels)) {
        return { labels: [], values: [] };
    }

    const channel = channels.find(
        c => c.channelName === "EnergyProductionTotal"
    );

    if (!channel?.values) {
        return { labels: [], values: [] };
    }

    const entries = Object.entries(channel.values)
        .sort(([a], [b]) => Number(a) - Number(b));

    return {
        labels: entries.map(([year]) => Number(year)),
        values: entries.map(([, value]) => Number((value / 1000000).toFixed(2))), // Wh → MWh
    };
}