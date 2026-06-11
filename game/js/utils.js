const Utils = {
    rand(min, max) {
        return Math.random() * (max - min) + min;
    },

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    dist(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    distSq(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },

    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    aabbCollide(a, b) {
        return (
            a.x - a.r < b.x + b.r &&
            a.x + a.r > b.x - b.r &&
            a.y - a.r < b.y + b.r &&
            a.y + a.r > b.y - b.r
        );
    },

    rectCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    rgba(hex, alpha) {
        const c = Utils.hexToRgb(hex);
        if (!c) return hex;
        return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
    }
};
