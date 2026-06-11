class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.life = opts.life || 0.5;
        this.maxLife = this.life;
        this.r = opts.r || 3;
        this.color = opts.color || '#e8c098';
        this.gravity = opts.gravity || 0;
        this.shrink = opts.shrink !== undefined ? opts.shrink : true;
        this.friction = opts.friction || 1;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= Math.pow(this.friction, dt * 60);
        this.vy *= Math.pow(this.friction, dt * 60);
        this.vy += this.gravity * dt;
        this.life -= dt;
    }

    render(ctx) {
        const alpha = Utils.clamp(this.life / this.maxLife, 0, 1);
        const r = this.shrink ? this.r * alpha : this.r;
        if (r <= 0) return;
        ctx.fillStyle = Utils.rgba(this.color, alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    get dead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, opts = {}) {
        for (let i = 0; i < count; i++) {
            const angle = opts.angle !== undefined
                ? opts.angle + Utils.rand(-(opts.spread || Math.PI * 2), (opts.spread || Math.PI * 2))
                : Utils.rand(0, Math.PI * 2);
            const speed = Utils.rand(opts.speedMin || 30, opts.speedMax || 150);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Utils.rand(opts.lifeMin || 0.2, opts.lifeMax || 0.7),
                r: Utils.rand(opts.rMin || 1.5, opts.rMax || 4),
                color: opts.color || '#e8c098',
                gravity: opts.gravity || 0,
                shrink: opts.shrink !== undefined ? opts.shrink : true,
                friction: opts.friction || 0.92
            }));
        }
    }

    explosion(x, y, color = '#ff8c42') {
        this.emit(x, y, 20, {
            speedMin: 80, speedMax: 220, lifeMin: 0.3, lifeMax: 0.7,
            rMin: 2, rMax: 5, color
        });
    }

    hit(x, y, color = '#e8c098') {
        this.emit(x, y, 6, {
            speedMin: 40, speedMax: 120, lifeMin: 0.15, lifeMax: 0.35,
            rMin: 1, rMax: 3, color
        });
    }

    trail(x, y, color = '#ffd700') {
        this.particles.push(new Particle(x, y, {
            vx: Utils.rand(-10, 10), vy: Utils.rand(-10, 10),
            life: 0.4, r: Utils.rand(2, 4), color, friction: 0.9
        }));
    }

    update(dt) {
        for (const p of this.particles) p.update(dt);
        this.particles = this.particles.filter(p => !p.dead);
    }

    render(ctx) {
        for (const p of this.particles) p.render(ctx);
    }

    clear() {
        this.particles = [];
    }
}
