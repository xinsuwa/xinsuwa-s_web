class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 11;
        this.speed = 180;
        this.baseSpeed = 180;

        this.maxHearts = 6;
        this.hearts = 6;
        this.bonusMaxHearts = 0;

        this.tearsDelay = 0.5;
        this.baseTearsDelay = 0.5;
        this.fireCooldown = 0;
        this.tearDamage = 3.5;
        this.tearSpeed = 380;
        this.tearRange = 280;
        this.tearSize = 1;
        this.tearCount = 1;
        this.spread = 0.12;
        this.tearPierce = 0;

        this.luck = 0;
        this.pickupRange = 40;

        this.invulnTime = 0;
        this.flashTime = 0;
        this.dead = false;
        this.glowPulse = 0;

        this.gold = 0;
        this.bombs = 0;
        this.keys = 0;

        this.ownedUpgrades = new Set();
        this.flight = false;
        this.speedModifier = 1;
        this.tearHoming = 0;
        this.tearSpectral = false;
        this.shieldCooldown = 0;
    }

    get maxHp() { return this.maxHearts; }
    set maxHp(v) { this.maxHearts = v; }
    get hp() { return this.hearts; }
    set hp(v) { this.hearts = v; }

    takeDamage(dmg) {
        if (this.invulnerable) return;
        if (this.invulnTime > 0 || this.dead) return;
        this.hearts -= dmg;
        this.invulnTime = 1.2;
        this.flashTime = 0.25;
        if (this.hearts <= 0) {
            this.hearts = 0;
            this.dead = true;
        }
    }

    heal(amount) {
        this.hearts = Math.min(this.maxHearts, this.hearts + amount);
    }

    addMaxHearts(amount, fill = true) {
        this.maxHearts += amount;
        if (fill) this.hearts = Math.min(this.maxHearts, this.hearts + amount);
    }

    update(dt, input, room, game) {
        if (this.dead) return;

        const ax = input.getMoveAxis();
        const moveSpeed = this.baseSpeed * this.speedModifier;
        const newX = this.x + ax.x * moveSpeed * dt;
        const newY = this.y + ax.y * moveSpeed * dt;

        // 检查墙壁和障碍物碰撞
        if (room) {
            const canMoveX = !room.collidesWithWall(newX, this.y, this.r) && 
                            (this.flight || !room.collidesWithObstacle(newX, this.y, this.r));
            if (canMoveX) this.x = newX;
            
            const canMoveY = !room.collidesWithWall(this.x, newY, this.r) && 
                            (this.flight || !room.collidesWithObstacle(this.x, newY, this.r));
            if (canMoveY) this.y = newY;

            this.x = Utils.clamp(this.x, room.innerX + this.r, room.innerX + room.innerW - this.r);
            this.y = Utils.clamp(this.y, room.innerY + this.r, room.innerY + room.innerH - this.r);
        }

        this.fireCooldown -= dt;
        if (input.isShooting() && this.fireCooldown <= 0) {
            const aimX = input.mouse.x;
            const aimY = input.mouse.y;
            const a = Utils.angle(this.x, this.y, aimX, aimY);
            this.shoot(a, game);
            this.fireCooldown = this.tearsDelay;
        }

        if (this.invulnTime > 0) this.invulnTime -= dt;
        if (this.flashTime > 0) this.flashTime -= dt;
        if (this.shieldCooldown > 0) this.shieldCooldown -= dt;
        this.glowPulse += dt;
    }

    shoot(angle, game) {
        if (!game) return;
        for (let i = 0; i < this.tearCount; i++) {
            let a = angle;
            if (this.tearCount > 1) {
                const total = (this.tearCount - 1) * this.spread;
                a = angle - total / 2 + i * this.spread;
            }
            game.bullets.push(new Bullet(this.x, this.y, a, {
                speed: this.tearSpeed,
                damage: this.tearDamage,
                r: 4 + this.tearSize * 2,
                color: '#fff4a3',
                fromPlayer: true,
                pierce: this.tearPierce,
                life: this.tearRange / this.tearSpeed
            }));
        }
    }

    render(ctx) {
        const pulse = 1 + Math.sin(this.glowPulse * 4) * 0.08;
        const glowR = this.r * 3.2 * pulse;

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
        grad.addColorStop(0.4, 'rgba(255, 180, 80, 0.15)');
        grad.addColorStop(1, 'rgba(255, 180, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        let bodyColor = '#fff4a3';
        if (this.invulnTime > 0 && Math.floor(this.invulnTime * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        if (this.flashTime > 0) bodyColor = '#ff6b6b';

        ctx.fillStyle = bodyColor;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}
