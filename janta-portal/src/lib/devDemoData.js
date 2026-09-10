import { DateTime } from "luxon";
import { getActiveDevSystem } from "@/lib/devAuth";

const SUNRISE = 6.6;
const SUNSET = 19.4;
const PEAK_HOUR = 13.0;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function solarFraction(hourDecimal) {
  if (hourDecimal < SUNRISE || hourDecimal > SUNSET) return 0;
  const span = SUNSET - SUNRISE;
  const x = (hourDecimal - SUNRISE) / span;
  const bell = Math.sin(Math.PI * x) ** 1.15;
  const peakBoost = 1 - Math.abs(hourDecimal - PEAK_HOUR) / span;
  return clamp(bell * (0.82 + 0.18 * peakBoost), 0, 1);
}

function hourDecimalFromDateTime(dt) {
  return dt.hour + dt.minute / 60 + dt.second / 3600;
}

function capacityWatts(system) {
  return Math.max(1, Number(system.max_pv_kw) || 10) * 1000;
}

function livePvWatts(system, now) {
  const frac = solarFraction(hourDecimalFromDateTime(now));
  const wobble = 0.97 + 0.03 * Math.sin(now.toMillis() / 45000);
  return Math.round(capacityWatts(system) * frac * wobble);
}

function seeded(systemId, salt) {
  const n = Number(systemId) + salt * 17;
  return ((n * 9301 + 49297) % 233280) / 233280;
}

export function buildDevFroniusLive(request) {
  const system = getActiveDevSystem(request);
  if (!system) return null;

  const now = DateTime.now().setZone(system.timezone || "America/Chicago");
  const pvPower = livePvWatts(system, now);
  const cap = capacityWatts(system);
  const loadPower = Math.round(cap * (0.38 + 0.08 * seeded(system.id, now.hour)));
  const net = pvPower - loadPower;
  const gridImport = net < 0;
  const gridPower = Math.round(Math.abs(net) * 0.92);
  const hasBattery = Boolean(system.has_battery);
  const battSoc = hasBattery
    ? clamp(58 + solarFraction(hourDecimalFromDateTime(now)) * 28, 20, 96)
    : null;
  const battChargePower = !hasBattery
    ? 0
    : pvPower > loadPower
      ? Math.round(Math.min(cap * 0.12, net * 0.35))
      : Math.round(-Math.min(cap * 0.08, loadPower * 0.15));

  return {
    systemId: system.id,
    data: {
      live: {
        timestamp: now.toISO(),
        pvPower,
        online: true,
      },
      flow: {
        pvPower,
        gridPower,
        gridImport,
        loadPower,
        battChargePower,
        battSoc: Math.round(battSoc),
        hasBattery,
        selfConsumptionRate: pvPower > 0 ? Math.round(clamp(loadPower / pvPower, 0, 1) * 100) : 0,
        selfSufficiencyRate: loadPower > 0 ? Math.round(clamp(pvPower / loadPower, 0, 1) * 100) : 0,
        timestamp: now.toISO(),
      },
    },
    errors: [],
  };
}

export function buildDevFroniusHistory(request) {
  const system = getActiveDevSystem(request);
  if (!system) return null;

  const tz = system.timezone || "America/Chicago";
  const now = DateTime.now().setZone(tz);
  const capKw = Math.max(1, Number(system.max_pv_kw) || 10);
  const capW = capKw * 1000;

  const hourlyLabels = [];
  const hourlyValues = [];
  const start = now.startOf("day");
  for (let dt = start; dt <= now; dt = dt.plus({ minutes: 5 })) {
    const utc = dt.toUTC();
    hourlyLabels.push(utc.toFormat("HH:mm"));
    const cloud = 0.88 + 0.12 * Math.sin((dt.hour + dt.minute / 60) * 0.9 + system.id);
    hourlyValues.push(Math.round(capW * solarFraction(hourDecimalFromDateTime(dt)) * cloud));
  }

  const daysInMonth = now.daysInMonth;
  const dailyLabels = [];
  const dailyValues = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dailyLabels.push(day);
    if (day > now.day) {
      dailyValues.push(0);
      continue;
    }
    const weather = 0.72 + 0.28 * seeded(system.id, day);
    dailyValues.push(Math.round(capKw * 5.1 * weather * 10) / 10);
  }

  const monthlyLabels = [];
  const monthlyValues = [];
  const monthFactors = [0.52, 0.61, 0.78, 0.9, 1.02, 1.08, 1.1, 1.05, 0.94, 0.8, 0.62, 0.5];
  for (let month = 1; month <= 12; month++) {
    monthlyLabels.push(month);
    if (month > now.month && now.year === DateTime.now().year) {
      monthlyValues.push(0);
      continue;
    }
    const days = month === now.month ? now.day : 28;
    monthlyValues.push(Math.round(capKw * 4.8 * monthFactors[month - 1] * days * 10) / 10);
  }

  const years = [now.year - 2, now.year - 1, now.year];
  const yearlyLabels = years;
  const yearlyValues = years.map((year, i) => {
    const annualMwh = (capKw * 1600 * (0.92 + i * 0.04)) / 1000;
    return Math.round(annualMwh * 100) / 100;
  });

  const total = Math.round(yearlyValues.reduce((sum, v) => sum + v, 0) * 1000);

  return {
    systemId: system.id,
    period: { year: now.year, month: now.month, day: now.day },
    data: {
      hourlyproduction: { labels: hourlyLabels, values: hourlyValues },
      dailyproduction: { labels: dailyLabels, values: dailyValues },
      monthlyproduction: { labels: monthlyLabels, values: monthlyValues },
      yearlyproduction: { labels: yearlyLabels, values: yearlyValues },
      total,
    },
    errors: [],
  };
}
