const RoomType = {
    START: 'start',
    COMBAT: 'combat',
    TREASURE: 'treasure',
    SHOP: 'shop',
    REST: 'rest',
    BOSS: 'boss'
};

// 房间布局模板
const RoomLayouts = {
    // 空房间
    empty: {
        obstacles: [],
        name: '空房间'
    },
    // 中央柱子
    center_pillar: {
        obstacles: [
            { type: 'pillar', x: 0.5, y: 0.5, r: 30 }
        ],
        name: '中央柱子'
    },
    // 四角柱子
    corner_pillars: {
        obstacles: [
            { type: 'pillar', x: 0.2, y: 0.2, r: 25 },
            { type: 'pillar', x: 0.8, y: 0.2, r: 25 },
            { type: 'pillar', x: 0.2, y: 0.8, r: 25 },
            { type: 'pillar', x: 0.8, y: 0.8, r: 25 }
        ],
        name: '四角柱子'
    },
    // 两侧墙壁
    side_walls: {
        obstacles: [
            { type: 'wall', x: 0.15, y: 0.35, w: 80, h: 30 },
            { type: 'wall', x: 0.85, y: 0.65, w: 80, h: 30 }
        ],
        name: '两侧墙壁'
    },
    // 中央十字
    cross: {
        obstacles: [
            { type: 'wall', x: 0.5, y: 0.3, w: 30, h: 100 },
            { type: 'wall', x: 0.35, y: 0.5, w: 100, h: 30 }
        ],
        name: '十字障碍'
    },
    // L形障碍
    l_shape: {
        obstacles: [
            { type: 'wall', x: 0.25, y: 0.25, w: 100, h: 30 },
            { type: 'wall', x: 0.25, y: 0.25, w: 30, h: 100 }
        ],
        name: 'L形障碍'
    },
    // 环形柱子
    ring_pillars: {
        obstacles: [
            { type: 'pillar', x: 0.35, y: 0.5, r: 20 },
            { type: 'pillar', x: 0.65, y: 0.5, r: 20 },
            { type: 'pillar', x: 0.5, y: 0.35, r: 20 },
            { type: 'pillar', x: 0.5, y: 0.65, r: 20 }
        ],
        name: '环形柱子'
    },
    // 狭窄通道
    narrow_passage: {
        obstacles: [
            { type: 'wall', x: 0.3, y: 0.15, w: 40, h: 200 },
            { type: 'wall', x: 0.7, y: 0.15, w: 40, h: 200 }
        ],
        name: '狭窄通道'
    },
    // 散落岩石
    scattered_rocks: {
        obstacles: [
            { type: 'rock', x: 0.25, y: 0.3, r: 18 },
            { type: 'rock', x: 0.75, y: 0.4, r: 22 },
            { type: 'rock', x: 0.4, y: 0.7, r: 15 },
            { type: 'rock', x: 0.6, y: 0.65, r: 20 }
        ],
        name: '散落岩石'
    },
    // 水坑（减速区域）
    water_pools: {
        obstacles: [],
        hazards: [
            { type: 'water', x: 0.3, y: 0.5, w: 80, h: 80 },
            { type: 'water', x: 0.7, y: 0.5, w: 80, h: 80 }
        ],
        name: '水坑'
    },
    // Boss房间 - 大型障碍
    boss_arena: {
        obstacles: [
            { type: 'pillar', x: 0.2, y: 0.3, r: 35 },
            { type: 'pillar', x: 0.8, y: 0.3, r: 35 },
            { type: 'pillar', x: 0.2, y: 0.7, r: 35 },
            { type: 'pillar', x: 0.8, y: 0.7, r: 35 }
        ],
        name: 'Boss竞技场'
    }
};

class Room {
    constructor(x, y, type) {
        this.gridX = x;
        this.gridY = y;
        this.type = type;
        this.width = 960;
        this.height = 600;
        this.wallThickness = 40;
        this.innerX = this.wallThickness;
        this.innerY = this.wallThickness;
        this.innerW = this.width - this.wallThickness * 2;
        this.innerH = this.height - this.wallThickness * 2;

        this.cleared = (type === RoomType.START);
        this.visited = false;
        this.enemies = [];
        this.items = [];
        this.doors = { top: false, right: false, bottom: false, left: false };

        this.initialized = false;
        this.bossTriggered = false;
        this.chestOpened = false;
        this.restUsed = false;
        
        // 障碍物和地形
        this.obstacles = [];
        this.hazards = [];
        this.layout = null;
        
        // 楼梯机制
        this.stairsActive = false;
        this.stairsX = 0;
        this.stairsY = 0;
        this.stairsTimer = 0;
        this.stairsReady = false;
    }

    initialize(floor) {
        if (this.initialized) return;
        this.initialized = true;

        this.enemies = [];
        this.items = [];

        if (this.type === RoomType.START) {
            this.cleared = true;
            this.layout = RoomLayouts.empty;
        } else if (this.type === RoomType.COMBAT) {
            this.generateLayout(floor);
            this.spawnCombatRoom(floor);
        } else if (this.type === RoomType.TREASURE) {
            this.layout = RoomLayouts.empty;
            this.cleared = true;
        } else if (this.type === RoomType.SHOP) {
            this.layout = RoomLayouts.empty;
            this.shopItems = this.generateShop(floor);
            this.cleared = true;
        } else if (this.type === RoomType.REST) {
            this.layout = RoomLayouts.empty;
            this.cleared = true;
        } else if (this.type === RoomType.BOSS) {
            this.layout = RoomLayouts.boss_arena;
            this.generateObstacles();
        }
        
        if (this.layout) {
            this.generateObstacles();
        }
    }

    generateLayout(floor) {
        // 根据楼层选择布局
        const layoutKeys = ['empty', 'center_pillar', 'corner_pillars', 'side_walls', 
                          'scattered_rocks', 'ring_pillars', 'l_shape'];
        if (floor >= 2) layoutKeys.push('cross', 'narrow_passage');
        if (floor >= 3) layoutKeys.push('water_pools');
        
        // 随机选择布局
        this.layout = RoomLayouts[Utils.choice(layoutKeys)];
    }

    generateObstacles() {
        this.obstacles = [];
        this.hazards = [];
        
        if (!this.layout) return;
        
        for (const obs of this.layout.obstacles) {
            const obstacle = {
                type: obs.type,
                x: this.innerX + obs.x * this.innerW,
                y: this.innerY + obs.y * this.innerH,
                r: obs.r || 20,
                w: obs.w || 40,
                h: obs.h || 40,
                color: obs.type === 'rock' ? '#5a5045' : '#3a342c'
            };
            this.obstacles.push(obstacle);
        }
        
        for (const haz of (this.layout.hazards || [])) {
            const hazard = {
                type: haz.type,
                x: this.innerX + haz.x * this.innerW,
                y: this.innerY + haz.y * this.innerH,
                w: haz.w || 60,
                h: haz.h || 60
            };
            this.hazards.push(hazard);
        }
    }

    spawnCombatRoom(floor) {
        // 根据楼层构建敌人池
        const pool = ['chaser', 'chaser', 'wanderer'];
        if (floor >= 1) { 
            pool.push('shooter'); 
            pool.push('fast_chaser');
        }
        if (floor >= 2) { 
            pool.push('dasher'); 
            pool.push('spitter');
            pool.push('splitter');
        }
        if (floor >= 3) { 
            pool.push('flyer');
            pool.push('teleporter');
            pool.push('shielded');
            pool.push('bomber');
        }
        if (floor >= 4) {
            pool.push('invisible');
            pool.push('healer');
            pool.push('rapid_shooter');
        }
        if (floor >= 5) {
            pool.push('spawner');
            pool.push('tank');
        }

        // 敌人数量随楼层增加
        const baseCount = Utils.randInt(3, 4);
        const count = baseCount + Math.floor(floor * 0.8);
        
        for (let i = 0; i < count; i++) {
            const typeKey = Utils.choice(pool);
            const base = { ...EnemyTypes[typeKey] };
            // 楼层越高敌人越强
            const hpMult = 1 + (floor - 1) * 0.15;
            const speedMult = 1 + (floor - 1) * 0.05;
            
            // 在安全位置生成敌人（使用多个尝试位置）
            let x, y;
            const spawnPositions = this.getSpawnPositions(60, base.r);
            if (spawnPositions.length > 0) {
                const pos = Utils.choice(spawnPositions);
                x = pos.x;
                y = pos.y;
            } else {
                // 回退位置：房间四个角落
                const corners = [
                    { x: this.innerX + 80, y: this.innerY + 80 },
                    { x: this.innerX + this.innerW - 80, y: this.innerY + 80 },
                    { x: this.innerX + 80, y: this.innerY + this.innerH - 80 },
                    { x: this.innerX + this.innerW - 80, y: this.innerY + this.innerH - 80 }
                ];
                const corner = Utils.choice(corners);
                x = corner.x;
                y = corner.y;
            }
            
            const enemyBase = { ...EnemyTypes[typeKey] };
            enemyBase.hp = Math.floor(enemyBase.hp * hpMult);
            enemyBase.speed = Math.floor(enemyBase.speed * speedMult);
            this.enemies.push(new Enemy(x, y, enemyBase));
        }
    }
    
    getSpawnPositions(minDist, radius) {
        const positions = [];
        const gridSize = 60;
        const safeMin = minDist + radius + 10;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        for (let x = this.innerX + safeMin; x < this.innerX + this.innerW - safeMin; x += gridSize) {
            for (let y = this.innerY + safeMin; y < this.innerY + this.innerH - safeMin; y += gridSize) {
                if (Utils.dist(x, y, centerX, centerY) < 160) continue;
                let blocked = false;
                for (const obs of this.obstacles) {
                    if (this.collidesWithObstacle(x, y, radius, obs)) {
                        blocked = true;
                        break;
                    }
                }
                if (!blocked) positions.push({ x, y });
            }
        }
        return positions;
    }

    isPositionBlocked(x, y, r) {
        // 检查是否在玩家起始位置附近
        if (Utils.dist(x, y, this.width / 2, this.height / 2) < 120) return true;
        // 检查是否与障碍物重叠
        for (const obs of this.obstacles) {
            if (this.collidesWithObstacle(x, y, r, obs)) return true;
        }
        return false;
    }

    spawnBoss(floor) {
        const clampedFloor = Math.min(floor, 5);
        const variant = Utils.choice(['a', 'b']);
        const bossKey = 'boss_floor' + clampedFloor + '_' + variant;
        const base = { ...EnemyTypes[bossKey] };
        const hpBonus = 1 + (floor - 1) * 0.08;
        base.hp = Math.floor(base.hp * hpBonus);
        // 设置血量屏障（Boss会在这些血量进入防御姿态）
        base.barrierHP = base.hp * 0.66;
        base.enrageThreshold = 0.2; // 20%血量时狂暴
        this.enemies.push(new Enemy(this.width / 2, this.height / 3, base));
    }

    generateShop(floor) {
        const shopItems = [];
        const baseCost = 12 + floor * 4;

        shopItems.push({
            id: 'shop_dmg', name: '⚔ 锋利眼泪', cost: baseCost + 8,
            desc: '伤害 +1', apply: (p) => p.tearDamage += 1, type: 'shop'
        });
        shopItems.push({
            id: 'shop_rate', name: '👁 急促之泪', cost: baseCost + 10,
            desc: '射速 +10%', apply: (p) => p.tearsDelay = Math.max(0.18, p.tearsDelay * 0.9), type: 'shop'
        });
        shopItems.push({
            id: 'shop_heart', name: '❤ 生命容器', cost: baseCost + 12,
            desc: '最大生命 +1', apply: (p) => p.addMaxHearts(1, false), type: 'shop'
        });
        shopItems.push({
            id: 'shop_heal', name: '🍖 回满生命', cost: baseCost + 3,
            desc: '恢复满生命', apply: (p) => p.hearts = p.maxHearts, type: 'shop'
        });
        shopItems.push({
            id: 'shop_speed', name: '🥾 迅捷之靴', cost: baseCost + 5,
            desc: '移速 +10', apply: (p) => p.baseSpeed += 10, type: 'shop'
        });
        return shopItems;
    }

    collidesWithWall(x, y, r) {
        if (x - r < this.innerX || x + r > this.innerX + this.innerW) return true;
        if (y - r < this.innerY || y + r > this.innerY + this.innerH) return true;
        return false;
    }

    collidesWithObstacle(x, y, r, specificObs = null) {
        const obstaclesToCheck = specificObs ? [specificObs] : this.obstacles;
        for (const obs of obstaclesToCheck) {
            if (obs.type === 'pillar' || obs.type === 'rock') {
                if (Utils.dist(x, y, obs.x, obs.y) < r + obs.r) return true;
            } else if (obs.type === 'wall') {
                // 矩形碰撞检测
                const halfW = obs.w / 2;
                const halfH = obs.h / 2;
                const cx = obs.x;
                const cy = obs.y;
                if (x + r > cx - halfW && x - r < cx + halfW &&
                    y + r > cy - halfH && y - r < cy + halfH) {
                    return true;
                }
            }
        }
        return false;
    }

    isInHazard(x, y) {
        for (const haz of this.hazards) {
            const halfW = haz.w / 2;
            const halfH = haz.h / 2;
            if (x > haz.x - halfW && x < haz.x + halfW &&
                y > haz.y - halfH && y < haz.y + halfH) {
                return haz.type;
            }
        }
        return null;
    }

    checkDoorTransition(player) {
        const threshold = 30;
        if (this.doors.top && player.y < this.innerY + threshold) return 'top';
        if (this.doors.bottom && player.y > this.innerY + this.innerH - threshold) return 'bottom';
        if (this.doors.left && player.x < this.innerX + threshold) return 'left';
        if (this.doors.right && player.x > this.innerX + this.innerW - threshold) return 'right';
        return null;
    }

    enterFromDirection(dir) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const offset = 70;
        // 根据进入方向设置玩家位置
        if (dir === 'top') return { x: cx, y: this.innerY + offset };
        if (dir === 'bottom') return { x: cx, y: this.innerY + this.innerH - offset };
        if (dir === 'left') return { x: this.innerX + offset, y: cy };
        if (dir === 'right') return { x: this.innerX + this.innerW - offset, y: cy };
        return { x: cx, y: cy };
    }

    update(dt, player, game) {
        if (!this.initialized) return;

        // 检查水坑减速效果
        if (this.hazards.length > 0) {
            const hazType = this.isInHazard(player.x, player.y);
            if (hazType === 'water') {
                player.speedModifier = 0.6; // 减速40%
            } else {
                player.speedModifier = 1;
            }
        }

        if (!this.cleared && this.type === RoomType.COMBAT && this.enemies.length === 0) {
            this.onCombatClear(game, player);
        }

        if (this.type === RoomType.BOSS && !this.bossTriggered && this.visited) {
            this.spawnBoss(game.floor);
            this.bossTriggered = true;
        }
        if (this.type === RoomType.BOSS && this.bossTriggered && !this.cleared && this.enemies.length === 0) {
            this.onBossClear(game, player);
        }

        for (const e of this.enemies) {
            e.update(dt, player, this, game);
        }
        this.enemies = this.enemies.filter(e => !e.dead);

        for (const it of this.items) it.update(dt);
        
        // 更新楼梯计时器
        if (this.stairsActive && !this.stairsReady) {
            this.stairsTimer += dt;
            if (this.stairsTimer >= 2) {
                this.stairsReady = true;
                game.addMessage('▶ 楼梯已就绪，按 E 或触碰下楼');
            }
        }
    }

    onCombatClear(game, player) {
        this.cleared = true;
        
        // 减少金币掉落
        const drops = Utils.randInt(1, 3);
        for (let i = 0; i < drops; i++) {
            const ex = Utils.rand(this.width / 2 - 100, this.width / 2 + 100);
            const ey = Utils.rand(this.height / 2 - 60, this.height / 2 + 60);
            this.items.push(new Item(ex, ey, { type: 'gold', value: Utils.randInt(1, 3) }));
        }
        
        // 降低心掉落概率
        if (Math.random() < 0.08 + player.luck * 0.02) {
            this.items.push(new Item(this.width / 2 + Utils.rand(-30, 30), this.height / 2 + Utils.rand(-20, 20), { type: 'heart', value: 1 }));
        }
        
        // 只有50%概率给奖励（而不是每次都给）
        if (Math.random() < 0.5 && !game.rewardShownThisRoom) {
            game.showReward();
        }
    }

    onBossClear(game, player) {
        this.cleared = true;
        
        // Boss掉落更多金币
        for (let i = 0; i < 6; i++) {
            const ex = Utils.rand(this.width / 2 - 120, this.width / 2 + 120);
            const ey = Utils.rand(this.height / 2 - 60, this.height / 2 + 60);
            this.items.push(new Item(ex, ey, { type: 'gold', value: Utils.randInt(3, 6) }));
        }
        
        // Boss必定掉落心
        this.items.push(new Item(this.width / 2, this.height / 2 + 40, { type: 'heart', value: 2 }));
        
        // 在房间中心生成楼梯
        this.stairsX = this.width / 2;
        this.stairsY = this.height / 2;
        this.stairsActive = true;
        this.stairsTimer = 0;
        this.stairsReady = false;
        
        // Boss必定给奖励
        game.showBossReward();
    }

    render(ctx) {
        ctx.fillStyle = '#1a1816';
        ctx.fillRect(0, 0, this.width, this.height);

        // 地板格子
        ctx.fillStyle = '#252019';
        const tileSize = 40;
        for (let gx = 0; gx < this.width / tileSize; gx++) {
            for (let gy = 0; gy < this.height / tileSize; gy++) {
                if ((gx + gy) % 2 === 0) {
                    ctx.fillRect(gx * tileSize, gy * tileSize, tileSize, tileSize);
                }
            }
        }

        // 渲染障碍物
        for (const obs of this.obstacles) {
            ctx.fillStyle = obs.color;
            ctx.shadowColor = '#1a1816';
            ctx.shadowBlur = 4;
            
            if (obs.type === 'pillar') {
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
                ctx.fill();
                // 添加阴影效果
                ctx.fillStyle = '#252019';
                ctx.beginPath();
                ctx.arc(obs.x - 3, obs.y - 3, obs.r * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'rock') {
                ctx.beginPath();
                // 不规则形状
                ctx.moveTo(obs.x + obs.r, obs.y);
                for (let i = 0; i < 8; i++) {
                    const ang = Math.PI * 2 * i / 8;
                    const rr = obs.r * (0.8 + Math.sin(i * 2.5) * 0.2);
                    ctx.lineTo(obs.x + Math.cos(ang) * rr, obs.y + Math.sin(ang) * rr);
                }
                ctx.closePath();
                ctx.fill();
            } else if (obs.type === 'wall') {
                ctx.fillRect(obs.x - obs.w / 2, obs.y - obs.h / 2, obs.w, obs.h);
                // 添加边框
                ctx.strokeStyle = '#252019';
                ctx.lineWidth = 2;
                ctx.strokeRect(obs.x - obs.w / 2, obs.y - obs.h / 2, obs.w, obs.h);
            }
            ctx.shadowBlur = 0;
        }

        // 渲染水坑等危险区域
        for (const haz of this.hazards) {
            if (haz.type === 'water') {
                ctx.fillStyle = 'rgba(100, 150, 180, 0.4)';
                ctx.fillRect(haz.x - haz.w / 2, haz.y - haz.h / 2, haz.w, haz.h);
                // 添加波纹效果
                ctx.strokeStyle = 'rgba(100, 150, 180, 0.6)';
                ctx.lineWidth = 1;
                const time = Date.now() / 1000;
                for (let i = 0; i < 3; i++) {
                    const offset = (time + i * 0.3) % 1;
                    ctx.beginPath();
                    ctx.arc(haz.x, haz.y, 10 + offset * 20, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        // 墙壁
        ctx.fillStyle = '#3a342c';
        ctx.fillRect(0, 0, this.width, this.wallThickness);
        ctx.fillRect(0, this.height - this.wallThickness, this.width, this.wallThickness);
        ctx.fillRect(0, 0, this.wallThickness, this.height);
        ctx.fillRect(this.width - this.wallThickness, 0, this.wallThickness, this.height);

        this.renderDoors(ctx);

        // 房间提示文字
        if (this.type === RoomType.START && !this.visited) {
            ctx.fillStyle = '#a8a29a';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('WASD 移动 · 鼠标点击或空格射击', this.width / 2, this.height / 2 - 60);
            ctx.fillText('清理战斗房间有概率获得道具奖励', this.width / 2, this.height / 2 - 35);
            ctx.fillStyle = '#d4a574';
            ctx.font = '13px sans-serif';
            ctx.fillText('起始生命 6 · 起始伤害 3.5 · 射速 0.5s', this.width / 2, this.height / 2 - 10);
        }

        if (this.type === RoomType.TREASURE) {
            const cx = this.width / 2;
            const cy = this.height / 2;
            if (!this.chestOpened) {
                ctx.fillStyle = '#d4a574';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('宝箱房 · 走过去打开宝箱', cx, cy - 50);
            } else {
                ctx.fillStyle = '#a8a29a';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('已领取奖励', cx, cy - 50);
            }
        }

        if (this.type === RoomType.REST) {
            const cx = this.width / 2;
            const cy = this.height / 2;
            if (!this.restUsed) {
                ctx.fillStyle = '#7fd47f';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('休息区 · 按 H 恢复 2 生命（或 按 M 提升 1 最大生命）', cx, cy - 50);
            } else {
                ctx.fillStyle = '#5a5045';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('已经休息过了', cx, cy - 50);
            }
        }

        if (this.type === RoomType.SHOP && this.shopItems) {
            const cx = this.width / 2;
            const cy = this.height / 2 - 40;
            ctx.fillStyle = '#d4a574';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛒 商店 · 按数字键购买', cx, cy - 50);

            this.shopItems.forEach((item, i) => {
                const y = cy + i * 30;
                ctx.textAlign = 'left';
                ctx.fillStyle = item.sold ? '#5a5045' : '#e8c098';
                ctx.font = '13px sans-serif';
                const label = item.sold
                    ? `${i + 1}. ${item.name}  [已售]`
                    : `${i + 1}. ${item.name}  -  ${item.desc}   [💰 ${item.cost}]`;
                ctx.fillText(label, cx - 220, y);
            });
            ctx.textAlign = 'center';
        }

        if (this.type === RoomType.BOSS && this.bossTriggered && !this.cleared) {
            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ BOSS 战 ⚠', this.width / 2, this.innerY + 25);
        }
    }

    renderDoors(ctx) {
        const doorW = 80;
        const doorH = 60;
        const cx = this.width / 2;
        const cy = this.height / 2;
        const openColor = this.cleared ? '#d4a574' : '#5a4530';
        ctx.shadowBlur = this.cleared ? 15 : 0;
        ctx.shadowColor = openColor;

        if (this.doors.top) {
            ctx.fillStyle = openColor;
            ctx.fillRect(cx - doorW / 2, 0, doorW, this.wallThickness);
            ctx.fillStyle = this.cleared ? '#e8c098' : '#5a5045';
            ctx.fillRect(cx - doorW / 2 + 10, 5, doorW - 20, this.wallThickness - 15);
        }
        if (this.doors.bottom) {
            ctx.fillStyle = openColor;
            ctx.fillRect(cx - doorW / 2, this.height - this.wallThickness, doorW, this.wallThickness);
            ctx.fillStyle = this.cleared ? '#e8c098' : '#5a5045';
            ctx.fillRect(cx - doorW / 2 + 10, this.height - this.wallThickness + 5, doorW - 20, this.wallThickness - 15);
        }
        if (this.doors.left) {
            ctx.fillStyle = openColor;
            ctx.fillRect(0, cy - doorH / 2, this.wallThickness, doorH);
            ctx.fillStyle = this.cleared ? '#e8c098' : '#5a5045';
            ctx.fillRect(5, cy - doorH / 2 + 8, this.wallThickness - 15, doorH - 16);
        }
        if (this.doors.right) {
            ctx.fillStyle = openColor;
            ctx.fillRect(this.width - this.wallThickness, cy - doorH / 2, this.wallThickness, doorH);
            ctx.fillStyle = this.cleared ? '#e8c098' : '#5a5045';
            ctx.fillRect(this.width - this.wallThickness + 5, cy - doorH / 2 + 8, this.wallThickness - 15, doorH - 16);
        }
        ctx.shadowBlur = 0;

        if (this.cleared) {
            ctx.fillStyle = '#a8a29a';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            if (this.doors.top) ctx.fillText('↑', cx, this.wallThickness / 2 + 4);
            if (this.doors.bottom) ctx.fillText('↓', cx, this.height - this.wallThickness / 2 + 4);
            if (this.doors.left) ctx.fillText('←', this.wallThickness / 2, cy + 4);
            if (this.doors.right) ctx.fillText('→', this.width - this.wallThickness / 2, cy + 4);
        }
    }

    renderEntities(ctx) {
        for (const it of this.items) {
            if (!it.picked) it.render(ctx);
        }
        for (const e of this.enemies) e.render(ctx);

        if (this.type === RoomType.TREASURE && !this.chestOpened) {
            const cx = this.width / 2;
            const cy = this.height / 2;
            ctx.fillStyle = '#8b6f47';
            ctx.fillRect(cx - 18, cy - 14, 36, 28);
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(cx - 18, cy - 14, 36, 8);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(cx - 3, cy - 2, 6, 10);
            ctx.strokeStyle = '#3a2a15';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 18, cy - 14, 36, 28);
        }
        
        // 渲染楼梯
        if (this.stairsActive) {
            this.renderStairs(ctx);
        }
    }
    
    renderStairs(ctx) {
        const x = this.stairsX;
        const y = this.stairsY;
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.05;
        
        // 楼梯底座
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x - 35, y - 5, 70, 40);
        
        // 楼梯台阶
        ctx.fillStyle = '#6b4423';
        for (let i = 0; i < 5; i++) {
            const stepY = y + 30 - i * 7;
            const stepW = 12 + i * 4;
            ctx.fillRect(x - stepW / 2, stepY, stepW, 5);
        }
        
        // 发光效果
        const glowColor = this.stairsReady ? '#4ade80' : '#fbbf24';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = this.stairsReady ? 25 : 15;
        
        // 发光边框
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 35 * pulse, y - 5 * pulse, 70 * pulse, 40 * pulse);
        
        ctx.shadowBlur = 0;
        
        // 提示文字
        ctx.fillStyle = this.stairsReady ? '#4ade80' : '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        if (!this.stairsReady) {
            const remaining = Math.ceil(2 - this.stairsTimer);
            ctx.fillText(`楼梯准备中... ${remaining}s`, x, y - 15);
        } else {
            ctx.fillText('按 E 或触碰下楼', x, y - 15);
        }
    }
    
    checkStairsCollision(player) {
        if (!this.stairsActive || !this.stairsReady) return false;
        const dist = Utils.dist(player.x, player.y, this.stairsX, this.stairsY);
        return dist < 40;
    }
}