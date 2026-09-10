import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

const NOAA_HEADERS = {
    "User-Agent": "Remote GUI Dashboard (msalla@jantaus.com)",
    Accept: "application/geo+json",
};

async function fetchNoaaJson(url, { attempts = 3, timeoutMs = 8000 } = {}) {
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: NOAA_HEADERS,
                signal: AbortSignal.timeout(timeoutMs),
            });

            // Retry on transient upstream errors/rate-limits.
            if ([429, 502, 503, 504].includes(response.status)) {
                if (attempt < attempts) {
                    await new Promise((resolve) => setTimeout(resolve, attempt * 300));
                    continue;
                }
                return { ok: false, status: response.status, data: null };
            }

            if (!response.ok) {
                return { ok: false, status: response.status, data: null };
            }

            const data = await response.json();
            return { ok: true, status: response.status, data };
        } catch (error) {
            lastError = error;
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 300));
                continue;
            }
        }
    }

    return {
        ok: false,
        status: 503,
        data: null,
        error: lastError,
    };
}

export async function GET(request) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
        
        // Require a valid session — no role check needed, any authenticated user can access weather
        const token = request.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        jwt.verify(token, JWT_SECRET);
        
        const { searchParams } = new URL(request.url);
        // Parse latitude and longitude as floats
        const lat = parseFloat(searchParams.get("lat"));
        const lon = parseFloat(searchParams.get("lon"));

        console.log("API called with Lat:", lat, "Lon:", lon);

        if (isNaN(lat) || isNaN(lon)) {
            return NextResponse.json(
                { error: "Latitude and longitude must be valid numbers" },
                { status: 400 }
            );
        }

        // Get NOAA grid point
        const pointRes = await fetchNoaaJson(`https://api.weather.gov/points/${lat},${lon}`);
        if (!pointRes.ok) {
            return NextResponse.json(
                { error: "NOAA weather service is temporarily unavailable" },
                { status: pointRes.status >= 500 ? 503 : pointRes.status }
            );
        }

        const pointData = pointRes.data;
        const hourlyUrl = pointData.properties.forecastHourly;


        // Fetch hourly forecast
        const forecastRes = await fetchNoaaJson(hourlyUrl);
        if (!forecastRes.ok) {
            return NextResponse.json(
                { error: "NOAA hourly forecast is temporarily unavailable" },
                { status: forecastRes.status >= 500 ? 503 : forecastRes.status }
            );
        }

        const forecastData = forecastRes.data;
        const periods = forecastData?.properties?.periods ?? [];
        if (!periods.length) {
            return NextResponse.json(
                { error: "NOAA hourly forecast returned no periods" },
                { status: 503 }
            );
        }
        const currentPeriod = periods[0];

        // Map hourly data
        const hourly = periods.map((p) => ({
            time: p.startTime,
            temp: Math.round(((p.temperature - 32) * 5) / 9), // F → C
            wind_speed: parseFloat(p.windSpeed), // e.g. "10 mph"
            humidity: p.relativeHumidity?.value ?? null,
            clouds: null, // NOAA does not provide cloud cover %
        }));

        const currentHour = hourly[0];

        //Format response
        const formatted = {
            location: { lat, lon },
            current: {
                temp: currentHour?.temp ?? null,
                wind_speed: currentHour?.wind_speed ?? null,
                humidity: currentHour?.humidity ?? null,
                condition: currentPeriod?.shortForecast ?? 'Unknown',
            },
            hourly,
        };

        return NextResponse.json(formatted);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

