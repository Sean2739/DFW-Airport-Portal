import jwt from "jsonwebtoken";

/**
 * Local-development auth bypass.
 *
 * Enabled only when BOTH are true:
 *   - NODE_ENV === "development"
 *   - DEV_AUTH_BYPASS === "true"
 *
 * Production always ignores this, even if DEV_AUTH_BYPASS is set.
 * Before deploy you can also delete this file and every `isDevAuthBypass()` call.
 */

export const DEV_BYPASS_USER = {
  id: 999001,
  name: "Local Developer",
  email: "dev@local.test",
  phone_number: null,
  role: "ADMIN",
};

export const DEV_BYPASS_PASSWORD = "localdev";

/** Set `has_battery: true` on a system to show battery SOC and flow. Off by default. */
export const DEV_BYPASS_SYSTEMS = [
  {
    id: 999005,
    system_name: "DFW Airport",
    location_label: "DFW Airport · Dallas/Fort Worth, TX",
    inverter_type: "FRONIUS",
    timezone: "America/Chicago",
    status: "ACTIVE",
    total_towers: 10,
    max_pv_kw: 150,
    latitude: 32.8998,
    longitude: -97.0403,
    installation_date: "2025-03-18",
    has_fronius_system: true,
    has_battery: true,
    towers: [
      { id: 9101, model: "JP-T4 Dual-Axis", order_id: 1, state: "TRACKING", tower_angle: 168, area: "Terminal A garage", inverter: "INV-1", inverter_type: "Fronius Symo", error_ticks: 0 },
      { id: 9102, model: "JP-T4 Dual-Axis", order_id: 2, state: "TRACKING", tower_angle: 172, area: "Terminal A garage", inverter: "INV-1", inverter_type: "Fronius Symo", error_ticks: 0 },
      { id: 9103, model: "JP-T4 Dual-Axis", order_id: 3, state: "ACTIVE", tower_angle: 176, area: "Terminal A garage", inverter: "INV-1", inverter_type: "Fronius Symo", error_ticks: 0 },
      { id: 9104, model: "JP-T4 Dual-Axis", order_id: 4, state: "TRACKING", tower_angle: 180, area: "Terminal B garage", inverter: "INV-1", inverter_type: "Fronius Symo", error_ticks: 0 },
      { id: 9105, model: "JP-T4 Dual-Axis", order_id: 5, state: "ACTIVE", tower_angle: 184, area: "Terminal B garage", inverter: "INV-1", inverter_type: "Fronius Symo", error_ticks: 0 },
      { id: 9106, model: "JP-T4 Dual-Axis", order_id: 6, state: "TRACKING", tower_angle: 178, area: "Express South lot", inverter: "INV-2", inverter_type: "EG4 18kPV", error_ticks: 0 },
      { id: 9107, model: "JP-T4 Dual-Axis", order_id: 7, state: "ACTIVE", tower_angle: 165, area: "Express South lot", inverter: "INV-2", inverter_type: "EG4 18kPV", error_ticks: 0 },
      { id: 9108, model: "JP-T4 Dual-Axis", order_id: 8, state: "MAINTENANCE", tower_angle: 188, area: "Express South lot", inverter: "INV-2", inverter_type: "EG4 18kPV", error_ticks: 0 },
      { id: 9109, model: "JP-T4 Dual-Axis", order_id: 9, state: "IDLE", tower_angle: 174, area: "Terminal E garage", inverter: "INV-2", inverter_type: "EG4 18kPV", error_ticks: 2 },
      { id: 9110, model: "JP-T4 Dual-Axis", order_id: 10, state: "TRACKING", tower_angle: 182, area: "Terminal E garage", inverter: "INV-2", inverter_type: "EG4 18kPV", error_ticks: 0 },
    ],
  },
  {
    id: 999001,
    system_name: "FIFA Dallas",
    inverter_type: "FRONIUS",
    timezone: "America/Chicago",
    status: "ACTIVE",
    total_towers: 3,
    max_pv_kw: 48,
    latitude: 32.7787,
    longitude: -96.7601,
    installation_date: null,
    has_fronius_system: true,
    towers: [
      { id: 9001, model: "Janta Tower", order_id: 1, state: "ACTIVE", tower_angle: 180 },
      { id: 9002, model: "Janta Tower", order_id: 2, state: "ACTIVE", tower_angle: 175 },
      { id: 9003, model: "Janta Tower", order_id: 3, state: "ACTIVE", tower_angle: 185 },
    ],
  },
  {
    id: 999002,
    system_name: "Fair Park East",
    inverter_type: "FRONIUS",
    timezone: "America/Chicago",
    status: "ACTIVE",
    total_towers: 2,
    max_pv_kw: 24,
    latitude: 32.7812,
    longitude: -96.7548,
    installation_date: null,
    has_fronius_system: true,
    towers: [
      { id: 9004, model: "Janta Tower", order_id: 1, state: "ACTIVE", tower_angle: 170 },
      { id: 9005, model: "Janta Tower", order_id: 2, state: "ACTIVE", tower_angle: 190 },
    ],
  },
  {
    id: 999003,
    system_name: "Residential Demo",
    inverter_type: "FRONIUS",
    timezone: "America/Chicago",
    status: "ACTIVE",
    total_towers: 1,
    max_pv_kw: 8.5,
    latitude: 32.8201,
    longitude: -96.8712,
    installation_date: null,
    has_fronius_system: true,
    towers: [
      { id: 9006, model: "Janta Tower", order_id: 1, state: "ACTIVE", tower_angle: 180 },
    ],
  },
  {
    id: 999004,
    system_name: "Commercial Yard",
    inverter_type: "EG4",
    timezone: "America/Chicago",
    status: "ACTIVE",
    total_towers: 4,
    max_pv_kw: 62,
    latitude: 32.7355,
    longitude: -96.9103,
    installation_date: null,
    has_fronius_system: false,
    towers: [
      { id: 9007, model: "Janta Tower", order_id: 1, state: "ACTIVE", tower_angle: 160 },
      { id: 9008, model: "Janta Tower", order_id: 2, state: "ACTIVE", tower_angle: 165 },
      { id: 9009, model: "Janta Tower", order_id: 3, state: "ACTIVE", tower_angle: 172 },
      { id: 9010, model: "Janta Tower", order_id: 4, state: "ACTIVE", tower_angle: 178 },
    ],
  },
];

export function getDevBypassSystem(id) {
  return DEV_BYPASS_SYSTEMS.find((system) => system.id === Number(id)) ?? null;
}

export function getActiveDevSystem(request) {
  if (!isDevAuthBypass()) return null;
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return getDevBypassSystem(decoded.activeSystemId);
  } catch {
    return null;
  }
}

export function isDevAuthBypass() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isDevAuthBypass()) return "local-dev-only-jwt-secret-not-for-production";
  throw new Error("JWT_SECRET is not set");
}

export function signDevSessionPayload(overrides = {}) {
  return {
    sub: DEV_BYPASS_USER.id,
    role: DEV_BYPASS_USER.role,
    planTier: null,
    activeSystemId: null,
    forcePasswordReset: false,
    ...overrides,
  };
}
