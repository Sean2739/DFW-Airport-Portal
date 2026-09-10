import { DateTime } from "luxon";

const RAD = Math.PI / 180;

/**
 * Solar azimuth & elevation (NOAA simplified).
 * Azimuth: 0° = North, 90° = East, 180° = South, 270° = West (clockwise).
 */
export function getSolarPosition(latitude, longitude, when = new Date()) {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return { azimuth: 90, elevation: 45, visible: true };
    }

    const d = when instanceof Date ? when : new Date(when);
    const jd = d.getTime() / 86400000 + 2440587.5;
    const jc = (jd - 2451545) / 36525;

    const geomMeanLong = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
    const geomMeanAnom = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
    const eccent = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

    const sunEqOfCtr =
        Math.sin(geomMeanAnom * RAD) * (1.914602 - jc * (0.004817 + 0.000014 * jc))
        + Math.sin(2 * geomMeanAnom * RAD) * (0.019993 - 0.000101 * jc)
        + Math.sin(3 * geomMeanAnom * RAD) * 0.000289;

    const sunTrueLong = geomMeanLong + sunEqOfCtr;
    const sunAppLong =
        sunTrueLong - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * jc) * RAD);

    const meanObliq =
        23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
    const obliqCorr = meanObliq + 0.00256 * Math.cos((125.04 - 1934.136 * jc) * RAD);

    const sinDec = Math.sin(obliqCorr * RAD) * Math.sin(sunAppLong * RAD);
    const decl = Math.asin(sinDec) / RAD;

    const varY = Math.tan((obliqCorr * RAD) / 2) ** 2;
    const eqTime =
        4 * (
            varY * Math.sin(2 * geomMeanLong * RAD)
            - 2 * eccent * Math.sin(geomMeanAnom * RAD)
            + 4 * eccent * varY * Math.sin(geomMeanAnom * RAD) * Math.cos(2 * geomMeanLong * RAD)
            - 0.5 * varY * varY * Math.sin(4 * geomMeanLong * RAD)
            - 1.25 * eccent * eccent * Math.sin(2 * geomMeanAnom * RAD)
        ) / RAD;

    const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
    const trueSolarMin = (utcMin + eqTime + 4 * lon) % 1440;
    const hourAngle = trueSolarMin / 4 - 180;

    const latR = lat * RAD;
    const decR = decl * RAD;
    const haR = hourAngle * RAD;

    const cosZen = Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(haR);
    const zenith = Math.acos(Math.max(-1, Math.min(1, cosZen))) / RAD;
    const elevation = 90 - zenith;

    const sinZen = Math.sin(zenith * RAD);
    let azimuth = 180;
    if (sinZen > 0.001) {
        const cosAz =
            (Math.sin(decR) - Math.sin(latR) * cosZen)
            / (Math.cos(latR) * sinZen);
        azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / RAD;
        if (hourAngle > 0) azimuth = 360 - azimuth;
    }

    return {
        azimuth,
        elevation,
        visible: elevation > -0.5,
    };
}

/** Diagram angle for top-down compass (0° = east, -90° = north). */
export function solarAzimuthToDiagramDeg(azimuth) {
    return azimuth - 90;
}

export function getSolarDateTime(timezone) {
    return timezone ? DateTime.now().setZone(timezone).toJSDate() : new Date();
}

/** Sun position from live azimuth on a circle (N=up, E=right). */
export function sunPositionOnDiagram(cx, cy, radius, azimuth) {
    const angle = solarAzimuthToDiagramDeg(azimuth);
    const rad = angle * RAD;
    return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
    };
}
