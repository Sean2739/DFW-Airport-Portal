import { Chart as ChartJS } from "chart.js";

function reducedMotion() {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseRgb(color) {
    if (typeof color !== "string") return [230, 184, 92];
    const hex = color.trim();
    if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
        const parts = hex.replace(/rgba?\(([^)]+)\)/, "$1").split(",").map((p) => Number(p.trim()));
        if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
            return parts.slice(0, 3);
        }
        return [230, 184, 92];
    }
    const h = hex.replace("#", "");
    if (h.length !== 6) return [230, 184, 92];
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

function rgba(color, alpha) {
    const [r, g, b] = parseRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Mix series color toward white so the wave reads on solid bars. */
function rgbaShift(color, alpha, whiteMix = 0.55) {
    const [r, g, b] = parseRgb(color);
    const mix = (c) => Math.round(c + (255 - c) * whiteMix);
    return `rgba(${mix(r)}, ${mix(g)}, ${mix(b)}, ${alpha})`;
}

function barBox(bar, area) {
    if (!bar || bar.skip) return null;
    let x, y, base, width;
    try {
        const p = typeof bar.getProps === "function"
            ? bar.getProps(["x", "y", "base", "width", "height"], true)
            : {};
        x = Number(p.x ?? bar.x);
        y = Number(p.y ?? bar.y);
        base = Number(p.base ?? bar.base);
        width = Number(p.width ?? bar.width);
    } catch {
        x = Number(bar.x);
        y = Number(bar.y);
        base = Number(bar.base);
        width = Number(bar.width);
    }
    if (!Number.isFinite(base)) base = area.bottom;
    if (![x, y, width].every(Number.isFinite) || width <= 0.5) return null;
    const top = Math.min(y, base);
    const height = Math.max(Math.abs(base - y), 0.5);
    return { left: x - width / 2, top, width, height };
}

function clipDataset(ctx, meta, area) {
    const els = meta.data || [];
    if (!els.length) return false;
    ctx.beginPath();
    if (meta.type === "bar") {
        let drawn = 0;
        els.forEach((bar) => {
            const box = barBox(bar, area);
            if (!box) return;
            ctx.rect(box.left, box.top, box.width, box.height);
            drawn += 1;
        });
        return drawn > 0;
    }
    const pts = els.filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y));
    if (pts.length < 2) return false;
    ctx.moveTo(pts[0].x, area.bottom);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, area.bottom);
    ctx.closePath();
    return true;
}

const chartIdleSheen = {
    id: "idleSheen",
    afterInit(chart) {
        if (reducedMotion()) return;
        let last = 0;
        const tick = (now) => {
            if (!chart.canvas?.isConnected) {
                chart.$idleRaf = undefined;
                return;
            }
            chart.$idleRaf = requestAnimationFrame(tick);
            if (now - last < 48) return;
            last = now;
            try {
                chart.draw();
            } catch {
                /* chart torn down mid-frame */
            }
        };
        chart.$idleRaf = requestAnimationFrame(tick);
    },
    beforeDestroy(chart) {
        if (chart.$idleRaf) cancelAnimationFrame(chart.$idleRaf);
    },
    afterDatasetsDraw(chart) {
        if (reducedMotion()) return;
        const area = chart.chartArea;
        if (!area) return;
        const opts = chart.options?.plugins?.idleSheen || chart.options?.plugins?.idleTrace || {};
        const idx = opts.datasetIndex ?? 0;
        const meta = chart.getDatasetMeta(idx);
        if (!meta || meta.hidden) return;
        const ctx = chart.ctx;
        ctx.save();
        try {
            if (!clipDataset(ctx, meta, area)) {
                ctx.restore();
                return;
            }
            const duration = opts.durationMs ?? 7200;
            const t = (performance.now() / duration) % 1;
            const band = meta.type === "bar" ? 110 : 80;
            const span = area.right - area.left + band * 2;
            const x = area.left - band + t * span;
            const color = opts.color || "#e6b85c";
            const g = ctx.createLinearGradient(x - band, 0, x + band, 0);
            g.addColorStop(0, "rgba(255,255,255,0)");
            if (meta.type === "bar") {
                g.addColorStop(0.35, rgba(color, 0.12));
                g.addColorStop(0.5, rgbaShift(color, 0.55, 0.62));
                g.addColorStop(0.65, rgba(color, 0.12));
            } else {
                g.addColorStop(0.5, rgba(color, 0.28));
            }
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.clip();
            ctx.fillStyle = g;
            ctx.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
        } catch {
            /* skip a bad frame */
        }
        ctx.restore();
    },
};

ChartJS.register(chartIdleSheen);
