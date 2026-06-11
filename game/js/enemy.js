class Enemy {
    static bossAttacks = {
        'purple_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 5;
                for (let k = 0; k < count; k++) {
                    const ang = Math.atan2(dy, dx) + (k - 2) * 0.15;
                    const bullet = new Bullet(this.x, this.y, ang, {
                        speed: 150, damage: this.damage, r: 8, color: '#a855f7',
                        life: 4, fromPlayer: false, homing: 0.015
                    });
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 1.8;
            }
        },
        'purple_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 12;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer;
                    const bullet = new Bullet(this.x, this.y, ang, {
                        speed: 120, damage: this.damage, r: 6, color: '#c084fc',
                        life: 5, fromPlayer: false, homing: 0.01
                    });
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 1.2;
            }
        },
        'purple_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 16;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer * 2;
                    const bullet = new Bullet(this.x, this.y, ang, {
                        speed: 120, damage: this.damage, r: 7, color: '#e879f9',
                        life: 3, fromPlayer: false, homing: 0.01
                    });
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 0.8;
            }
        },
        'blue_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        game.bullets.push(new Bullet(this.x, this.y, tang, {
                            speed: 500, damage: this.damage + 1, r: 10, color: '#6bb3d9',
                            life: 0.8, fromPlayer: false
                        }));
                    }, i * 120);
                }
                this.fireCooldown = 1.5;
            }
        },
        'blue_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -2; k <= 2; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.12, {
                        speed: 300, damage: this.damage, r: 6, color: '#38bdf8',
                        life: 2, fromPlayer: false
                    }));
                }
                for (let k = -2; k <= 2; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + Math.PI + k * 0.15, {
                        speed: 250, damage: this.damage, r: 5, color: '#7dd3fc',
                        life: 2.5, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.0;
            }
        },
        'blue_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                // 预警：显示激光路径
                const tang = Math.atan2(dy, dx);
                const laserEnd = {
                    x: this.x + Math.cos(tang) * 500,
                    y: this.y + Math.sin(tang) * 500
                };
                this.showTelegraph(game, [{ x1: this.x, y1: this.y, x2: laserEnd.x, y2: laserEnd.y }], '#38bdf8', 1.0);
                
                setTimeout(() => {
                    // 连续激光弹幕
                    for (let i = 0; i < 5; i++) {
                        game.bullets.push(new Bullet(this.x, this.y, tang, {
                            speed: 450, damage: this.damage + 1, r: 8, color: '#0ea5e9',
                            life: 0.6, fromPlayer: false
                        }));
                    }
                    // 反方向弹幕
                    for (let i = 0; i < 5; i++) {
                        game.bullets.push(new Bullet(this.x, this.y, tang + Math.PI, {
                            speed: 450, damage: this.damage + 1, r: 8, color: '#0ea5e9',
                            life: 0.6, fromPlayer: false
                        }));
                    }
                }, 1000);
                this.fireCooldown = 2.5;
            }
        },
        'pink_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -1; k <= 1; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.2, {
                        speed: 350, damage: this.damage, r: 4, color: '#ff6b9d',
                        life: 1.5, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.8;
            }
        },
        'pink_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                for (let i = 0; i < 8; i++) {
                    const ang = Math.atan2(dy, dx) + Utils.rand(-0.5, 0.5);
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: Utils.rand(250, 350), damage: this.damage, r: 5, color: '#f472b6',
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.7;
            }
        },
        'pink_phase2': function(game, dx, dy, room) {
            if (this.fireCooldown <= 0) {
                // 减少瞬移频率，增加更大的冷却
                if (Math.random() < 0.35) {
                    const teleportAngle = Utils.rand(0, Math.PI * 2);
                    const teleportDist = 150;
                    const newX = this.x + Math.cos(teleportAngle) * teleportDist;
                    const newY = this.y + Math.sin(teleportAngle) * teleportDist;
                    if (!room.collidesWithWall(newX, newY, this.r)) {
                        this.x = newX;
                        this.y = newY;
                        game.particles.explosion(this.x, this.y, '#ff6b9d');
                    }
                }
                const tang = Math.atan2(dy, dx);
                for (let k = -2; k <= 2; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.15, {
                        speed: 320, damage: this.damage, r: 5, color: '#fb7185',
                        life: 1.8, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.0;
            }
        },
        'green_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -1; k <= 1; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.2, {
                        speed: 180, damage: this.damage, r: 10, color: '#7fd47f',
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.4;
            }
        },
        'green_phase1': function(game, dx, dy, room) {
            if (this.fireCooldown <= 0) {
                this.hp = Math.min(this.maxHp, this.hp + 5);
                game.particles.hit(this.x, this.y, '#4ade80');
                const count = 8;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer;
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 140, damage: this.damage, r: 7, color: '#86efac',
                        life: 3, fromPlayer: false
                    }));
                }
                this.fireCooldown = 2.0;
            }
        },
        'green_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -2; k <= 2; k++) {
                    const bullet = new Bullet(this.x, this.y, tang + k * 0.15, {
                        speed: 200, damage: this.damage, r: 12, color: '#22c55e',
                        life: 2.5, fromPlayer: false
                    });
                    bullet.splitOnHit = true;
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 1.2;
            }
        },
        'red_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 6;
                for (let k = 0; k < count; k++) {
                    const ang = Math.atan2(dy, dx) + (k - 2.5) * 0.25;
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 200, damage: this.damage + 1, r: 8, color: '#ef5350',
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.2;
            }
        },
        'red_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 10;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer * 2;
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 160, damage: this.damage + 1, r: 9, color: '#f87171',
                        life: 3, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.9;
            }
        },
        'red_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 16;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count);
                    const bullet = new Bullet(this.x, this.y, ang, {
                        speed: 80, damage: this.damage + 2, r: 14, color: '#dc2626',
                        life: 3, fromPlayer: false
                    });
                    bullet.delayExplode = true;
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 1.5;
            }
        },
        'orange_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                game.bullets.push(new Bullet(this.x, this.y, Math.atan2(dy, dx), {
                    speed: 150, damage: this.damage + 2, r: 16, color: '#d47d3a',
                    life: 2.5, fromPlayer: false
                }));
                this.fireCooldown = 2.0;
            }
        },
        'orange_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -3; k <= 3; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.2, {
                        speed: 180, damage: this.damage + 1, r: 10, color: '#f59e0b',
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.3;
            }
        },
        'orange_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                // 预警：显示多个落点
                const telegraphSpots = [];
                for (let i = 0; i < 8; i++) {
                    const impactX = this.x + Utils.rand(-200, 200);
                    const impactY = this.y + Utils.rand(-150, 150);
                    telegraphSpots.push({ x: impactX, y: impactY, r: 40 });
                }
                this.showTelegraph(game, telegraphSpots, '#fbbf24', 1.5);
                
                setTimeout(() => {
                    // 陨石雨
                    for (let i = 0; i < 8; i++) {
                        const impactX = this.x + Utils.rand(-200, 200);
                        const impactY = this.y + Utils.rand(-150, 150);
                        // 快速下落的陨石
                        game.bullets.push(new Bullet(impactX, impactY - 300, Math.PI / 2, {
                            speed: 400, damage: this.damage + 2, r: 18, color: '#f59e0b',
                            life: 1.0, fromPlayer: false
                        }));
                    }
                }, 1500);
                this.fireCooldown = 3.5;
            }
        },
        'fire_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -1; k <= 1; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.1, {
                        speed: 250, damage: this.damage, r: 7, color: '#ff8c42',
                        life: 1.8, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.6;
            }
        },
        'fire_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 15;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer * 3;
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 180, damage: this.damage, r: 6, color: '#fb923c',
                        life: 2.5, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.5;
            }
        },
        'fire_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -2; k <= 2; k++) {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.08, {
                                speed: 300 + i * 50, damage: this.damage + 1, r: 8, color: '#ea580c',
                                life: 1.5, fromPlayer: false
                            }));
                        }, i * 50);
                    }
                }
                this.fireCooldown = 0.4;
            }
        },
        'lightning_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const tang = Math.atan2(dy, dx);
                for (let k = -1; k <= 1; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.2, {
                        speed: 280, damage: this.damage, r: 5, color: '#fbbf24',
                        life: 1.8, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.0;
            }
        },
        'lightning_phase1': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        const ang = Utils.rand(0, Math.PI * 2);
                        const dist = Utils.rand(50, 150);
                        const px = this.x + Math.cos(ang) * dist;
                        const py = this.y + Math.sin(ang) * dist;
                        game.bullets.push(new Bullet(px, py, 0, {
                            speed: 0, damage: this.damage, r: 25, color: '#fcd34d',
                            life: 0.3, fromPlayer: false
                        }));
                    }, i * 100);
                }
                this.fireCooldown = 1.2;
            }
        },
        'lightning_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                if (!this.shieldActive && this.shieldCooldown <= 0) {
                    this.shieldActive = true;
                    this.shieldCooldown = 3;
                }
                const tang = Math.atan2(dy, dx);
                for (let k = -2; k <= 2; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, tang + k * 0.15, {
                        speed: 320, damage: this.damage + 1, r: 6, color: '#f59e0b',
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.5;
            }
        },
        'shadow_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 4;
                for (let k = 0; k < count; k++) {
                    const ang = Math.atan2(dy, dx) + (k - 1.5) * 0.3;
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 160, damage: this.damage, r: 10, color: '#6b21a8',
                        life: 3, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.3;
            }
        },
        'shadow_phase1': function(game, dx, dy, room) {
            if (this.fireCooldown <= 0) {
                const teleportAngle = Utils.rand(0, Math.PI * 2);
                const teleportDist = 180;
                const newX = this.x + Math.cos(teleportAngle) * teleportDist;
                const newY = this.y + Math.sin(teleportAngle) * teleportDist;
                if (!room.collidesWithWall(newX, newY, this.r)) {
                    this.x = newX;
                    this.y = newY;
                    game.particles.explosion(this.x, this.y, '#7c3aed');
                }
                const count = 8;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count);
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 140, damage: this.damage, r: 8, color: '#8b5cf6',
                        life: 2.5, fromPlayer: false
                    }));
                }
                this.fireCooldown = 1.5;
            }
        },
        'shadow_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                const count = 16;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count) + this.aiTimer * 2;
                    const bullet = new Bullet(this.x, this.y, ang, {
                        speed: 150, damage: this.damage, r: 9, color: '#a855f7',
                        life: 4, fromPlayer: false
                    });
                    bullet.spectral = true;
                    game.bullets.push(bullet);
                }
                this.fireCooldown = 0.7;
            }
        },
        'demon_phase0': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                game.bullets.push(new Bullet(this.x, this.y, Math.atan2(dy, dx), {
                    speed: 180, damage: this.damage + 2, r: 14, color: '#dc2626',
                    life: 2.5, fromPlayer: false
                }));
                this.fireCooldown = 1.5;
            }
        },
        'demon_phase1': function(game, dx, dy, room) {
            if (this.fireCooldown <= 0) {
                const types = ['fast_chaser', 'shooter', 'dasher'];
                const typeKey = Utils.choice(types);
                const base = { ...EnemyTypes[typeKey] };
                base.hp = Math.floor(base.hp * 0.5);
                base.color = '#7f1d1d';
                room.enemies.push(new Enemy(
                    this.x + Utils.rand(-60, 60),
                    this.y + Utils.rand(-60, 60),
                    base
                ));
                game.addMessage('⚠ 地狱魔王召唤了爪牙！');
                const count = 8;
                for (let k = 0; k < count; k++) {
                    const ang = (Math.PI * 2 * k / count);
                    game.bullets.push(new Bullet(this.x, this.y, ang, {
                        speed: 160, damage: this.damage, r: 8, color: '#b91c1c',
                        life: 2.5, fromPlayer: false
                    }));
                }
                this.fireCooldown = 2.0;
            }
        },
        'demon_phase2': function(game, dx, dy) {
            if (this.fireCooldown <= 0) {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const ang = Utils.rand(0, Math.PI * 2);
                        const dist = Utils.rand(100, 250);
                        const px = this.x + Math.cos(ang) * dist;
                        const py = this.y + Math.sin(ang) * dist;
                        game.bullets.push(new Bullet(px, py - 50, Math.PI / 2, {
                            speed: 200, damage: this.damage + 1, r: 12, color: '#f87171',
                            life: 1.5, fromPlayer: false
                        }));
                    }, i * 50);
                }
                this.fireCooldown = 2.5;
            }
        }
    };

    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.r = opts.r || 12;
        this.speed = opts.speed || 80;
        this.maxHp = opts.hp || 8;
        this.hp = this.maxHp;
        this.damage = opts.damage || 1;
        this.color = opts.color || '#c44545';
        this.goldDrop = opts.goldDrop || 1;
        this.type = opts.type || 'chaser';
        this.isBoss = opts.isBoss || false;
        this.bossType = opts.bossType || null;
        this.name = opts.name || '';
        this.bossType = opts.bossType || 'purple';
        this.dead = false;
        
        this.aiTimer = Math.random() * 2; // 随机起始，避免敌人"同步"
        this.fireCooldown = 0;
        this.contactDamageCooldown = 0;
        this.teleportCooldown = 0;
        this.shieldCooldown = 0;
        this.flashTime = 0;
        this.invisTime = 0;
        this.shieldActive = false;
        this.wanderAngle = Math.random() * Math.PI * 2; // 初始化 wanderer 角度
        this.invisPhase = 0; // 初始化 invisible 相位
        this.currentPhase = 0;
        this.phaseTimer = 0;
        
        // Boss专属属性
        this.isBoss = opts.isBoss || false;
        if (this.isBoss) {
            this.dodgeCooldown = 0;
            this.dodgeChance = 0.15; // 15%闪避几率
            this.enrageTimer = 0;
            this.enraged = false;
            this.enrageThreshold = 0.25; // 25%血量时狂暴
            this.telegraphTimer = 0;
            this.telegraphActive = false;
            this.telegraphColor = null;
            this.telegraphPositions = [];
            this.barrierHP = null; // 血量屏障
            this.barriersBroken = 0;
            this.invulnPhase = false;
        }
        
        this.splitCount = opts.splitCount || 0;
        this.lastSpawnTime = 0;
    }

    update(dt, player, room, game) {
        this.aiTimer += dt;
        this.fireCooldown -= dt;
        this.contactDamageCooldown -= dt;
        this.teleportCooldown -= dt;
        this.shieldCooldown -= dt;
        if (this.shieldCooldown <= 0 && !this.shieldActive && this.type === 'shielded') {
            this.shieldActive = true;
        }
        if (this.flashTime > 0) this.flashTime -= dt;
        if (this.invisTime > 0) this.invisTime -= dt;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToP = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / distToP;
        const ny = dy / distToP;

        if (this.isBoss) {
            const { x: mvx, y: mvy } = this.updateBoss(dt, player, room, game, distToP, nx, ny, dx, dy);
            this.x += mvx * dt;
            this.y += mvy * dt;
            // Boss边界钳位
            if (room) {
                this.x = Math.max(room.innerX + this.r, Math.min(room.innerX + room.innerW - this.r, this.x));
                this.y = Math.max(room.innerY + this.r, Math.min(room.innerY + room.innerH - this.r, this.y));
            }
            return;
        }

        let mvx = 0, mvy = 0;

        if (this.type === 'chaser') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'slow_chaser') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'fast_chaser') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'shooter') {
            mvx = nx * this.speed * 0.5;
            mvy = ny * this.speed * 0.5;
            if (this.fireCooldown <= 0) {
                game.bullets.push(new Bullet(this.x, this.y, Math.atan2(dy, dx), {
                    speed: 200, damage: this.damage, r: 5, color: this.color,
                    life: 2.5, fromPlayer: false
                }));
                this.fireCooldown = 1.5;
            }
        } else if (this.type === 'rapid_shooter') {
            mvx = nx * this.speed * 0.3;
            mvy = ny * this.speed * 0.3;
            if (this.fireCooldown <= 0) {
                for (let k = -1; k <= 1; k++) {
                    game.bullets.push(new Bullet(this.x, this.y, Math.atan2(dy, dx) + k * 0.15, {
                        speed: 180, damage: this.damage, r: 4, color: this.color,
                        life: 2, fromPlayer: false
                    }));
                }
                this.fireCooldown = 0.8;
            }
        } else if (this.type === 'spitter') {
            if (distToP > 80) {
                mvx = nx * this.speed * 0.6;
                mvy = ny * this.speed * 0.6;
            }
            if (this.fireCooldown <= 0) {
                const bullet = new Bullet(this.x, this.y, Math.atan2(dy, dx), {
                    speed: 150, damage: this.damage, r: 10, color: this.color,
                    life: 3, fromPlayer: false
                });
                bullet.slowDown = true;
                game.bullets.push(bullet);
                this.fireCooldown = 2;
            }
        } else if (this.type === 'dasher') {
            if (this.fireCooldown <= 0) {
                mvx = nx * this.speed * 3;
                mvy = ny * this.speed * 3;
                this.fireCooldown = 2;
            } else {
                mvx = nx * this.speed * 0.3;
                mvy = ny * this.speed * 0.3;
            }
        } else if (this.type === 'flyer') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'wanderer') {
            if (this.aiTimer > 2) {
                this.aiTimer = 0;
                this.wanderAngle = Utils.rand(0, Math.PI * 2);
            }
            mvx = Math.cos(this.wanderAngle) * this.speed;
            mvy = Math.sin(this.wanderAngle) * this.speed;
        } else if (this.type === 'splitter') {
            mvx = nx * this.speed * 0.7;
            mvy = ny * this.speed * 0.7;
        } else if (this.type === 'teleporter') {
            mvx = nx * this.speed * 0.3;
            mvy = ny * this.speed * 0.3;
            if (this.teleportCooldown <= 0 && distToP < 200) {
                const newX = this.x + Utils.rand(-150, 150);
                const newY = this.y + Utils.rand(-150, 150);
                if (!room.collidesWithWall(newX, newY, this.r)) {
                    this.x = newX;
                    this.y = newY;
                    game.particles.explosion(this.x, this.y, this.color);
                }
                this.teleportCooldown = 3;
            }
        } else if (this.type === 'shielded') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'invisible') {
            // 闪烁：半透明 1.5 秒后完全可见 1.5 秒
            if (this.invisTime <= 0) {
                this.invisPhase = (this.invisPhase || 0) + 1;
                this.invisTime = 1.5;
            }
            mvx = nx * this.speed;
            mvy = ny * this.speed;
        } else if (this.type === 'bomber') {
            mvx = nx * this.speed;
            mvy = ny * this.speed;
            if (distToP < 40) {
                game.particles.explosion(this.x, this.y, this.color);
                this.dead = true;
                return;
            }
        } else if (this.type === 'healer') {
            mvx = nx * this.speed * 0.5;
            mvy = ny * this.speed * 0.5;
            // healer 只能治疗 2 次，避免敌人永远不死
            if (this.healCount === undefined) this.healCount = 0;
            if (this.fireCooldown <= 0 && this.healCount < 2) {
                for (const enemy of room.enemies) {
                    if (enemy !== this && enemy.hp < enemy.maxHp) {
                        const edx = enemy.x - this.x;
                        const edy = enemy.y - this.y;
                        const eDist = Math.sqrt(edx * edx + edy * edy);
                        if (eDist < 150) {
                            enemy.hp = Math.min(enemy.maxHp, enemy.hp + 3);
                            game.particles.hit(enemy.x, enemy.y, '#4ade80');
                        }
                    }
                }
                this.healCount++;
                this.fireCooldown = 3;
            }
        } else if (this.type === 'spawner') {
            // spawner 最多刷 2 次，避免永远清不完
            if (this.spawnCount === undefined) this.spawnCount = 0;
            if (this.fireCooldown <= 0 && this.spawnCount < 2) {
                const types = ['chaser', 'shooter'];
                const typeKey = Utils.choice(types);
                const base = { ...EnemyTypes[typeKey] };
                base.hp = Math.floor(base.hp * 0.5);
                room.enemies.push(new Enemy(
                    this.x + Utils.rand(-80, 80),
                    this.y + Utils.rand(-80, 80),
                    base
                ));
                this.spawnCount++;
                this.fireCooldown = 4;
            }
        }

        // 先保存旧位置
        const oldX = this.x;
        const oldY = this.y;
        this.x += mvx * dt;
        this.y += mvy * dt;

        // 障碍物碰撞
        if (room && room.obstacles) {
            for (const obs of room.obstacles) {
                if (obs.type === 'pillar' || obs.type === 'rock') {
                    // 圆形障碍
                    const dx2 = this.x - obs.x;
                    const dy2 = this.y - obs.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    const minDist = this.r + obs.r;
                    if (dist2 < minDist && dist2 > 0) {
                        const overlap = minDist - dist2;
                        this.x += (dx2 / dist2) * overlap;
                        this.y += (dy2 / dist2) * overlap;
                    }
                } else if (obs.type === 'wall') {
                    // 矩形障碍 - 简单 AABB 推开
                    const halfW = obs.w / 2;
                    const halfH = obs.h / 2;
                    if (this.x + this.r > obs.x - halfW && this.x - this.r < obs.x + halfW &&
                        this.y + this.r > obs.y - halfH && this.y - this.r < obs.y + halfH) {
                        // 回到旧位置
                        this.x = oldX;
                        this.y = oldY;
                    }
                }
            }
        }

        // 安全检查：NaN 时重置位置到房间中心
        if (isNaN(this.x) || isNaN(this.y)) {
            this.x = room ? room.innerX + room.innerW / 2 : player.x;
            this.y = room ? room.innerY + room.innerH / 2 : player.y;
        }
        if (isNaN(mvx)) mvx = 0;
        if (isNaN(mvy)) mvy = 0;

        if (room) {
            this.x = Math.max(room.innerX + this.r, Math.min(room.innerX + room.innerW - this.r, this.x));
            this.y = Math.max(room.innerY + this.r, Math.min(room.innerY + room.innerH - this.r, this.y));
        }

        if (this.contactDamageCooldown <= 0) {
            const dist = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
            if (dist < this.r + player.r) {
                player.takeDamage(this.damage);
                this.contactDamageCooldown = 0.5;
            }
        }
    }

    updateBoss(dt, player, room, game, distToP, nx, ny, dx, dy) {
        this.phaseTimer += dt;
        this.updateTelegraph(dt);
        
        // 处理无敌阶段
        if (this.invulnPhase) {
            return { x: 0, y: 0 };
        }
        
        // 处理血量屏障（多次触发）
        if (this.barrierHP !== null && this.hp <= this.barrierHP && this.barriersBroken < 3) {
            this.barriersBroken++;
            this.invulnPhase = true;
            // 每次屏障血量降低
            this.barrierHP = this.hp * 0.5;
            this.shieldActive = true;
            this.shieldCooldown = 2;
            game.addMessage('⚠ ' + this.name + ' 激活了能量屏障！');
            setTimeout(() => { this.invulnPhase = false; }, 2500);
            return { x: 0, y: 0 };
        }
        
        const healthPercent = this.hp / this.maxHp;
        // 更平滑的阶段转换
        const phaseIndex = healthPercent > 0.66 ? 0 : (healthPercent > 0.33 ? 1 : 2);
        this.currentPhase = phaseIndex;
        
        // 狂暴机制（更低血量触发）
        if (healthPercent <= this.enrageThreshold && !this.enraged) {
            this.enraged = true;
            this.dodgeChance = 0.15; // 降低闪避几率
            this.fireCooldown = Math.max(0.1, this.fireCooldown * 0.7);
            game.addMessage('🔥 ' + this.name + ' 进入狂暴状态！');
        }
        
        // 狂暴时额外效果（移除瞬移，只保留速度提升）
        if (this.enraged) {
            this.enrageTimer += dt;
        }

        // Boss基础移动（更积极追踪）
        let mvx = nx * this.speed * 0.8;
        let mvy = ny * this.speed * 0.8;
        
        // 保持一定距离（不要贴太近）
        if (distToP < 100) {
            mvx = -mvx * 0.5;
            mvy = -mvy * 0.5;
        }

        this.useBossAttack(phaseIndex, mvx, mvy, nx, ny, dx, dy, room, game);

        // 根据Boss类型调整基础速度
        if (this.bossType === 'purple' || this.bossType === 'green') { mvx *= 0.5; mvy *= 0.5; }
        if (this.bossType === 'pink') { mvx *= 1.2; mvy *= 1.2; }
        if (this.bossType === 'shadow' || this.bossType === 'demon') { mvx *= 1.1; mvy *= 1.1; }
        
        // 阶段越高速度越快（减少增幅）
        if (phaseIndex >= 1) { mvx *= 1.15; mvy *= 1.15; }
        if (phaseIndex >= 2) { mvx *= 1.25; mvy *= 1.25; }
        
        // 狂暴时速度适度提升
        if (this.enraged) { mvx *= 1.25; mvy *= 1.25; }

        return { x: mvx, y: mvy };
    }
    
    // Boss闪避机制（改为小位移，不突兀）
    tryDodge(bullet) {
        // 完全禁用闪避，避免闪烁
        return false;
    }
    
    // Boss预警机制
    showTelegraph(game, positions, color, duration) {
        this.telegraphActive = true;
        this.telegraphColor = color;
        this.telegraphPositions = positions;
        this.telegraphTimer = duration;
    }
    
    updateTelegraph(dt) {
        if (this.telegraphTimer > 0) {
            this.telegraphTimer -= dt;
            if (this.telegraphTimer <= 0) {
                this.telegraphActive = false;
                this.telegraphPositions = [];
            }
        }
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= dt;
        }
    }

    useBossAttack(phaseIndex, mvx, mvy, nx, ny, dx, dy, room, game) {
        const attackKey = this.bossType + '_phase' + phaseIndex;
        const attack = Enemy.bossAttacks[attackKey];
        if (attack) {
            attack.call(this, game, dx, dy, room);
        }
    }

    takeDamage(dmg, game, room) {
        if (this.shieldActive) {
            this.shieldActive = false;
            this.shieldCooldown = 5;
            return;
        }
        this.hp -= dmg;
        this.flashTime = 0.2;
        if (game && game.particles) game.particles.hit(this.x, this.y, this.color);
        if (this.hp <= 0) {
            this.dead = true;
            if (game && game.particles) game.particles.explosion(this.x, this.y, this.color);
            // Splitter 分裂
            if (this.type === 'splitter' && this.splitCount > 0 && room) {
                const baseStats = {
                    r: Math.max(6, this.r * 0.6),
                    speed: this.speed * 1.3,
                    hp: Math.max(1, Math.floor(this.maxHp * 0.4)),
                    damage: Math.max(1, this.damage),
                    color: this.color,
                    type: 'chaser',
                    splitCount: this.splitCount - 1
                };
                for (let i = 0; i < 2; i++) {
                    const child = new Enemy(
                        this.x + Utils.rand(-20, 20),
                        this.y + Utils.rand(-20, 20),
                        baseStats
                    );
                    room.enemies.push(child);
                }
            }
            return true;
        }
        return false;
    }

    render(ctx) {
        let color = this.color;
        if (this.flashTime > 0) color = '#ffffff';
        
        let alpha = 1;
        if (this.type === 'invisible') {
            // 奇数 phase 半透明，偶数 phase 完全可见
            if ((this.invisPhase || 0) % 2 === 1) {
                alpha = 0.35;
            } else {
                alpha = 1.0;
            }
        }
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.isBoss ? 25 : 8;

        if (this.type === 'shooter' || this.type === 'rapid_shooter') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.aiTimer * 1.5);
            ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
            ctx.restore();
        } else if (this.type === 'spitter') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.isBoss) {
            // 绘制预警区域
            if (this.telegraphActive && this.telegraphPositions) {
                ctx.strokeStyle = this.telegraphColor || '#ff0000';
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.5 + Math.sin(this.aiTimer * 10) * 0.3;
                
                for (const spot of this.telegraphPositions) {
                    if (spot.x !== undefined && spot.y !== undefined && spot.r !== undefined) {
                        // 圆形预警
                        ctx.beginPath();
                        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.fillStyle = this.telegraphColor || '#ff0000';
                        ctx.globalAlpha = 0.2;
                        ctx.fill();
                    } else if (spot.x1 !== undefined) {
                        // 线条预警
                        ctx.beginPath();
                        ctx.moveTo(spot.x1, spot.y1);
                        ctx.lineTo(spot.x2, spot.y2);
                        ctx.stroke();
                    }
                }
                ctx.globalAlpha = 1;
            }
            
            // 狂暴特效
            if (this.enraged) {
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 30 + Math.sin(this.aiTimer * 8) * 10;
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            if (this.bossType === 'blue') {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - this.r * 0.5, this.y - this.r * 0.5, this.r, this.r);
            } else if (this.bossType === 'green' || this.bossType === 'pink') {
                for (let i = 0; i < 4; i++) {
                    const ang = (Math.PI * 2 * i / 4) + this.aiTimer * 0.5;
                    ctx.beginPath();
                    ctx.arc(
                        this.x + Math.cos(ang) * this.r * 0.5,
                        this.y + Math.sin(ang) * this.r * 0.5,
                        this.r * 0.2, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            } else if (this.bossType === 'lightning' || this.bossType === 'fire') {
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 5; i++) {
                    const ang = (Math.PI * 2 * i / 5) + this.aiTimer * 3;
                    const dist = this.r * 0.7 + Math.sin(this.aiTimer * 5 + i) * 5;
                    ctx.beginPath();
                    ctx.arc(
                        this.x + Math.cos(ang) * dist,
                        this.y + Math.sin(ang) * dist,
                        4, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                for (let i = 0; i < 6; i++) {
                    const ang = (Math.PI * 2 * i / 6) + this.aiTimer;
                    ctx.beginPath();
                    ctx.arc(
                        this.x + Math.cos(ang) * this.r * 0.6,
                        this.y + Math.sin(ang) * this.r * 0.6,
                        this.r * 0.15, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        } else if (this.type === 'wanderer') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3a2a2a';
            ctx.fillRect(this.x - 3, this.y - 3, 2, 2);
            ctx.fillRect(this.x + 1, this.y - 3, 2, 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Boss血量条（始终显示）
        if (this.isBoss) {
            const barW = 120;
            const barH = 10;
            const bx = this.x - barW / 2;
            const by = this.y - this.r - 30;
            
            // 背景
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
            
            // 血量条
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(bx, by, barW, barH);
            
            // 根据血量颜色变化
            const healthPercent = this.hp / this.maxHp;
            let hpColor = '#22c55e';
            if (healthPercent < 0.25) hpColor = '#ef4444';
            else if (healthPercent < 0.5) hpColor = '#f59e0b';
            else if (healthPercent < 0.75) hpColor = '#eab308';
            
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, barW * healthPercent, barH);
            
            // 护盾指示
            if (this.shieldActive) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.strokeRect(bx - 1, by - 1, barW + 2, barH + 2);
            }
            
            // 阶段指示
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            const phaseText = 'P' + (this.currentPhase + 1) + '/3';
            ctx.fillText(phaseText, this.x, by - 5);
            
            // 狂暴指示
            if (this.enraged) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('RAGE!', this.x, by - 18);
            }
            
            return;
        }
        
        if (this.hp < this.maxHp) {
            const barW = this.r * 2.4;
            const barH = 3;
            const bx = this.x - barW / 2;
            const by = this.y - this.r - 8;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#3a2a2a';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = this.color;
            ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
        }
    }
}

const EnemyTypes = {
    chaser:        { r: 11, speed: 95,  hp: 8,   damage: 1, color: '#c44545', goldDrop: 1, type: 'chaser' },
    slow_chaser:   { r: 16, speed: 55,  hp: 18,  damage: 1, color: '#8b2c2c', goldDrop: 3, type: 'slow_chaser' },
    fast_chaser:   { r: 9,  speed: 140, hp: 5,   damage: 1, color: '#e85555', goldDrop: 2, type: 'fast_chaser' },
    shooter:       { r: 12, speed: 65,  hp: 12,  damage: 1, color: '#c4456b', goldDrop: 3, type: 'shooter' },
    rapid_shooter: { r: 11, speed: 70,  hp: 10,  damage: 1, color: '#ff8c42', goldDrop: 4, type: 'rapid_shooter' },
    spitter:       { r: 13, speed: 55,  hp: 16,  damage: 1, color: '#d47d3a', goldDrop: 4, type: 'spitter' },
    dasher:        { r: 10, speed: 75,  hp: 10,  damage: 1, color: '#ffa726', goldDrop: 3, type: 'dasher' },
    flyer:         { r: 11, speed: 85,  hp: 14,  damage: 1, color: '#a855f7', goldDrop: 4, type: 'flyer' },
    wanderer:      { r: 13, speed: 60,  hp: 15,  damage: 1, color: '#e85555', goldDrop: 3, type: 'wanderer' },
    splitter:      { r: 14, speed: 70,  hp: 12,  damage: 1, color: '#6bb3d9', goldDrop: 5, type: 'splitter', splitCount: 2 },
    teleporter:    { r: 12, speed: 60,  hp: 14,  damage: 1, color: '#a855f7', goldDrop: 5, type: 'teleporter' },
    shielded:      { r: 14, speed: 50,  hp: 20,  damage: 1, color: '#6bb3d9', goldDrop: 6, type: 'shielded' },
    invisible:     { r: 11, speed: 100, hp: 8,   damage: 1, color: '#8b6f6f', goldDrop: 4, type: 'invisible' },
    bomber:        { r: 12, speed: 110, hp: 6,   damage: 2, color: '#ff6b6b', goldDrop: 4, type: 'bomber' },
    healer:        { r: 14, speed: 45,  hp: 18,  damage: 1, color: '#7fd47f', goldDrop: 6, type: 'healer' },
    spawner:       { r: 16, speed: 40,  hp: 25,  damage: 1, color: '#ff6b9d', goldDrop: 8, type: 'spawner' },
    tank:          { r: 20, speed: 45,  hp: 40,  damage: 2, color: '#5c1f1f', goldDrop: 7, type: 'slow_chaser' },
    
    boss_floor1_a: { r: 30, speed: 40, hp: 300, damage: 1, color: '#a855f7', goldDrop: 20, type: 'boss', isBoss: true, bossType: 'purple', name: '紫色黏液王' },
    boss_floor1_b: { r: 32, speed: 50, hp: 250, damage: 1, color: '#6bb3d9', goldDrop: 20, type: 'boss', isBoss: true, bossType: 'blue', name: '蓝色机械兽' },
    boss_floor2_a: { r: 34, speed: 55, hp: 450, damage: 1, color: '#ff6b9d', goldDrop: 30, type: 'boss', isBoss: true, bossType: 'pink', name: '粉色刺客' },
    boss_floor2_b: { r: 36, speed: 45, hp: 500, damage: 2, color: '#7fd47f', goldDrop: 30, type: 'boss', isBoss: true, bossType: 'green', name: '绿色史莱姆' },
    boss_floor3_a: { r: 38, speed: 60, hp: 650, damage: 2, color: '#ef5350', goldDrop: 45, type: 'boss', isBoss: true, bossType: 'red', name: '红色烈焰兽' },
    boss_floor3_b: { r: 40, speed: 50, hp: 700, damage: 2, color: '#d47d3a', goldDrop: 45, type: 'boss', isBoss: true, bossType: 'orange', name: '橙色岩石王' },
    boss_floor4_a: { r: 42, speed: 65, hp: 900, damage: 2, color: '#ff8c42', goldDrop: 60, type: 'boss', isBoss: true, bossType: 'fire', name: '火焰霸主' },
    boss_floor4_b: { r: 40, speed: 70, hp: 800, damage: 2, color: '#fbbf24', goldDrop: 60, type: 'boss', isBoss: true, bossType: 'lightning', name: '雷电法师' },
    boss_floor5_a: { r: 44, speed: 55, hp: 1200, damage: 2, color: '#a855f7', goldDrop: 80, type: 'boss', isBoss: true, bossType: 'shadow', name: '暗影领主' },
    boss_floor5_b: { r: 46, speed: 45, hp: 1500, damage: 3, color: '#dc2626', goldDrop: 80, type: 'boss', isBoss: true, bossType: 'demon', name: '地狱魔王' }
};