import { Chart as ChartJS } from "chart.js";

function reducedMotion() {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hexToRgba(color, alpha) {
    if (typeof color !== "string") return `rgba(230,184,92,${alpha})`;
    const hex = color.trim();
    if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
        return hex.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
            const parts = inner.split(",").map((p) => p.trim());
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        });
    }
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(230,184,92,${alpha})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clipDataset(ctx, chart, meta, area) {
    const els = meta.data || [];
    if (!els.length) return false;
    ctx.beginPath();
    if (meta.type === "bar") {
        let drawn = 0;
        els.forEach((bar) => {
            const p = typeof bar.getProps === "function"
                ? bar.getProps(["x", "y", "base", "width", "height"], true)
                : bar;
            const width = Number(p.width);
            const x = Number(p.x);
            const y = Number(p.y);
            const base = Number.isFinite(Number(p.base)) ? Number(p.base) : area.bottom;
            if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || width <= 0) return;
            const top = Math.min(y, base);
            const h = Math.max(Math.abs(base - y), 0.5);
            ctx.roundRect?.(x - width / 2, top, width, h, 3);
            if (!ctx.roundRect) ctx.rect(x - width / 2, top, width, h);
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
        if (!clipDataset(ctx, chart, meta, area)) {
            ctx.restore();
            return;
        }
        const duration = opts.durationMs ?? 7200;
        const t = (performance.now() / duration) % 1;
        const span = area.right - area.left + 140;
        const x = area.left - 70 + t * span;
        const color = opts.color || "#e6b85c";
        const peak = meta.type === "bar" ? 0.42 : 0.28;
        const g = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, meta.type === "bar" ? `rgba(255,255,255,${peak})` : hexToRgba(color, peak));
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.clip();
        ctx.fillStyle = g;
        ctx.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
        ctx.restore();
    },
};

ChartJS.register(chartIdleSheen);
