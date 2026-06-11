class Bullet {
    constructor(x, y, angle, opts = {}) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = opts.speed || 420;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.r = opts.r || 4;
        this.damage = opts.damage || 10;
        this.life = opts.life || 1.5;
        this.maxLife = this.life;
        this.color = opts.color || '#ffd700';
        this.fromPlayer = opts.fromPlayer !== false;
        this.dead = false;
        this.pierce = opts.pierce || 0;
        this.homing = opts.homing || 0;
        this.spectral = opts.spectral || false;
        this.targetEnemy = null;
    }

    update(dt, room, enemies) {
        // 追踪效果
        if (this.homing > 0 && this.fromPlayer && enemies && enemies.length > 0) {
            // 找最近的敌人
            let closest = null;
            let closestDist = 400;
            for (const e of enemies) {
                if (e.dead) continue;
                const d = Utils.dist(this.x, this.y, e.x, e.y);
                if (d < closestDist) {
                    closest = e;
                    closestDist = d;
                }
            }
            if (closest) {
                const targetAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
                const currentAngle = Math.atan2(this.vy, this.vx);
                const diff = targetAngle - currentAngle;
                // 平滑转向
                const turnAmount = Utils.clamp(diff, -this.homing * dt * 60, this.homing * dt * 60);
                const newAngle = currentAngle + turnAmount;
                this.vx = Math.cos(newAngle) * this.speed;
                this.vy = Math.sin(newAngle) * this.speed;
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.dead = true;
        
        // 检查墙壁碰撞
        if (room && room.collidesWithWall(this.x, this.y, this.r)) {
            this.dead = true;
        }
        
        // 检查障碍物碰撞（除非是幽灵泪）
        if (room && !this.spectral && room.collidesWithObstacle(this.x, this.y, this.r)) {
            this.dead = true;
        }
        
        if (this.x < 0 || this.y < 0 || this.x > 9600 || this.y > 9600) {
            this.dead = true;
        }
    }

    render(ctx) {
        const trailLen = 14;
        const tx = this.x - this.vx / this.speed * trailLen;
        const ty = this.y - this.vy / this.speed * trailLen;
        const grad = ctx.createLinearGradient(tx, ty, this.x, this.y);
        grad.addColorStop(0, Utils.rgba(this.color, 0));
        grad.addColorStop(1, Utils.rgba(this.color, 0.9));
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.r * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
