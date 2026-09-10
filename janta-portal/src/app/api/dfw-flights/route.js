import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { FALLBACK_ROUTES, inMap } from "@/lib/dfwFlightMap";

export const dynamic = "force-dynamic";

const DFW_LAT = 32.8998;
const DFW_LON = -97.0403;
const RANGE_NM = 250;
const UA = "Janta DFW Portal (dfw-departures)";
const ADSB_URL = `https://api.adsb.lol/v2/lat/${DFW_LAT}/lon/${DFW_LON}/dist/${RANGE_NM}`;
const LIGHT_OR_ROTOR = new Set(["A1", "A7"]);

const FRESH_MS = 25000;
const STALE_MS = 12 * 60 * 1000;
const RATE_LIMIT_MS = 60 * 1000;

let snapshot = { at: 0, live: false, routes: [] };
let backoffUntil = 0;
const destCache = new Map();

const NEARBY_FIELDS = [
    { lat: 32.8471, lon: -96.8518 }, // DAL
    { lat: 32.9876, lon: -97.3188 }, // AFW
    { lat: 32.9686, lon: -96.8364 }, // ADS
    { lat: 32.8198, lon: -97.3624 }, // FTW
];

function normCallsign(value) {
    return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function isDfwAirport(code) {
    const value = String(code || "").toUpperCase();
    return value === "DFW" || value === "KDFW";
}

function headingDelta(a, b) {
    let d = Math.abs(Number(a) - Number(b)) % 360;
    if (d > 180) d = 360 - d;
    return d;
}

function nmBetween(lat1, lon1, lat2, lon2) {
    const dy = (lat1 - lat2) * 60;
    const dx = (lon1 - lon2) * 60 * Math.cos((lat2 * Math.PI) / 180);
    return Math.hypot(dx, dy);
}

function closerToDfw(lat, lon, dst) {
    if (dst > 16) return true;
    const dfwNm = nmBetween(lat, lon, DFW_LAT, DFW_LON);
    return NEARBY_FIELDS.every((field) => dfwNm + 4 < nmBetween(lat, lon, field.lat, field.lon));
}

async function fetchJson(url, timeoutMs = 8000) {
    const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status === 420 || res.status === 429) {
        const err = new Error(`${url} ${res.status}`);
        err.rateLimited = true;
        throw err;
    }
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return res.json();
}

async function fetchNearbyAircraft() {
    const data = await fetchJson(ADSB_URL, 10000);
    return Array.isArray(data?.ac) ? data.ac : [];
}

async function lookupRoute(callsign) {
    const key = normCallsign(callsign);
    const cached = destCache.get(key);
    if (cached && Date.now() - cached.at < cached.ttl) return cached.route;

    try {
        const json = await fetchJson(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(key)}`, 4500);
        const dest = json?.response?.flightroute?.destination;
        const iata = String(dest?.iata_code || "").toUpperCase();
        const destLat = Number(dest?.latitude);
        const destLon = Number(dest?.longitude);
        const route = iata && !isDfwAirport(iata) && Number.isFinite(destLat) && Number.isFinite(destLon)
            ? {
                dest: iata,
                destLat,
                destLon,
                city: dest.municipality || dest.name || "",
            }
            : null;
        destCache.set(key, { at: Date.now(), ttl: route ? 2 * 60 * 60 * 1000 : 20 * 60 * 1000, route });
        return route;
    } catch {
        destCache.set(key, { at: Date.now(), ttl: 90 * 1000, route: null });
        return null;
    }
}

function dfwDepartures(aircraft) {
    const flights = [];
    const seen = new Set();
    for (const plane of aircraft) {
        const callsign = normCallsign(plane.flight);
        const lat = Number(plane.lat);
        const lon = Number(plane.lon);
        const alt = plane.alt_baro;
        const dst = Number(plane.dst);
        const track = Number(plane.track);
        const dir = Number(plane.dir);
        const verticalRate = Number(plane.baro_rate);
        if (!callsign || seen.has(callsign)) continue;
        if (alt === "ground" || !(Number(alt) > 400)) continue;
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(track) || !Number.isFinite(dir)) continue;
        if (LIGHT_OR_ROTOR.has(String(plane.category || "").toUpperCase())) continue;
        if (!(dst > 1) || dst > RANGE_NM) continue;
        if (verticalRate < -200 && dst < 25) continue;
        if (headingDelta(track, dir) >= 70) continue;
        if (!closerToDfw(lat, lon, dst)) continue;
        seen.add(callsign);
        flights.push({
            callsign,
            lat,
            lon,
            nm: dst,
            climbing: verticalRate > 200,
        });
    }
    flights.sort((a, b) => {
        if (a.climbing !== b.climbing) return a.climbing ? -1 : 1;
        return a.nm - b.nm;
    });
    return flights.slice(0, 60);
}

async function mapPool(items, limit, mapper) {
    const out = new Array(items.length);
    let next = 0;
    async function worker() {
        while (next < items.length) {
            const i = next;
            next += 1;
            out[i] = await mapper(items[i]);
        }
    }
    const n = Math.min(limit, items.length);
    await Promise.all(Array.from({ length: n }, worker));
    return out;
}

async function loadLiveFlights() {
    const nearby = dfwDepartures(await fetchNearbyAircraft());
    const withDest = await mapPool(nearby, 8, async (flight) => {
        const route = await lookupRoute(flight.callsign);
        if (!route || !inMap(route.destLat, route.destLon)) return null;
        return { ...flight, ...route, id: flight.callsign };
    });
    return withDest.filter(Boolean);
}

function cachedPayload() {
    if (snapshot.routes.length) return snapshot;
    return { at: snapshot.at, live: false, routes: FALLBACK_ROUTES };
}

function uniqueDestinations(flights) {
    const seen = new Map();
    for (const flight of flights) {
        if (!flight?.dest || seen.has(flight.dest)) continue;
        seen.set(flight.dest, {
            id: flight.dest,
            dest: flight.dest,
            destLat: flight.destLat,
            destLon: flight.destLon,
            city: flight.city || "",
        });
    }
    return [...seen.values()];
}

export async function GET(request) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
        const token = request.cookies.get("session")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        try {
            jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = Date.now();
        if (now < backoffUntil) {
            return NextResponse.json(cachedPayload());
        }
        if (snapshot.routes.length && now - snapshot.at < FRESH_MS) {
            return NextResponse.json(snapshot);
        }

        const routes = uniqueDestinations(await loadLiveFlights());
        if (routes.length) {
            snapshot = { at: now, live: true, routes };
        } else if (!snapshot.routes.length || now - snapshot.at > STALE_MS) {
            snapshot = { at: now, live: false, routes: [] };
        }
        return NextResponse.json(cachedPayload());
    } catch (error) {
        if (error?.rateLimited) backoffUntil = Date.now() + RATE_LIMIT_MS;
        console.error("DFW live flights failed", error);
        return NextResponse.json(cachedPayload());
    }
}
