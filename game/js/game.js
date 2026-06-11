class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.input = new Input(canvas);
        this.particles = new ParticleSystem();
        this.bullets = [];
        this.player = null;
        this.map = null;
        this.floor = 1;
        this.state = 'menu';
        this.rewardChoices = null;
        this.rewardIsBoss = false;
        this.rewardShownThisRoom = false;
        this.ui = new UI(this);
        this.shopUsedIds = new Set();
        this.ownedUpgradeIds = new Set();
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionPhase = null;
        this._transitionTarget = null;
        this._transitionDir = null;
        this.holdTime = 0;
        this.debugMode = false;
        this._bindUI();
    }

    get currentRoom() {
        return this.map ? this.map.getCurrentRoom() : null;
    }

    _findRoomByType(type) {
        if (!this.map) return null;
        for (const key in this.map.rooms) {
            if (this.map.rooms[key].type === type) return key;
        }
        return null;
    }

    _bindUI() {
        document.getElementById('btn-start').addEventListener('click', () => this.startGame());
        document.getElementById('btn-resume').addEventListener('click', () => this.resume());
        document.getElementById('btn-continue').addEventListener('click', () => this.resume());
        document.getElementById('btn-quit').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.ui.hideGameOver();
            this.startGame();
        });
        document.getElementById('btn-to-menu').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-skip-reward').addEventListener('click', () => this.skipReward());
    }

    startGame() {
        this.floor = 1;
        this.bullets = [];
        this.particles.clear();
        this.map = new GameMap(this.floor);
        this.player = new Player(this.width / 2, this.height / 2);
        this.currentRoom.visited = true;
        this.ownedUpgradeIds = new Set();
        this.shopUsedIds = new Set();
        this.rewardShownThisRoom = false;
        this.state = 'playing';
        this.ui.hideMenu();
        this.addMessage(`第 ${this.floor} 层 · 找到并击败 Boss`);
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.ui.showPause();
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.ui.hidePause();
        }
    }

    showWiki() {
        this._prevState = this.state;
        this.state = 'wiki';
        this.ui.showWiki(this.ownedUpgradeIds);
    }

    hideWiki() {
        this.state = this._prevState === 'paused' ? 'paused' : 'playing';
        this.ui.hideWiki();
    }

    toMenu() {
        this.state = 'menu';
        this.ui.hidePause();
        this.ui.hideGameOver();
        this.ui.hideReward();
        this.ui.showMenu();
    }

    gameOver() {
        this.state = 'gameover';
        this.ui.showGameOver();
    }

    nextFloor() {
        this.floor++;
        this.bullets = [];
        this.particles.clear();
        this.map = new GameMap(this.floor);
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + 1);
        this.currentRoom.visited = true;
        this.shopUsedIds = new Set();
        this.rewardShownThisRoom = false;
        this.state = 'playing';
        this.addMessage(`进入第 ${this.floor} 层 · 恢复 1 生命`);
    }

    showReward(isBoss = false) {
        if (this.rewardShownThisRoom) return;
        this.rewardShownThisRoom = true;
        const count = isBoss ? 4 : 3;
        const choices = rollUpgrades(count, this.floor, this.ownedUpgradeIds);
        if (choices.length === 0) return;
        this.rewardChoices = choices;
        this.rewardIsBoss = isBoss;
        this.state = 'reward';
        this.ui.showReward(choices, isBoss);
    }

    showBossReward() {
        this.showReward(true);
    }

    selectReward(idx) {
        const up = this.rewardChoices[idx];
        if (!up) return;
        up.apply(this.player);
        this.ownedUpgradeIds.add(up.id);
        const rarityText = up.rarity === 'legendary' ? '传说' : up.rarity === 'rare' ? '稀有' : '普通';
        this.addMessage(`${up.icon} ${up.name} [${rarityText}]`);
        this.rewardChoices = null;
        this.ui.hideReward();
        this.state = 'playing';
        this.rewardIsBoss = false;
    }

    skipReward() {
        const healAmount = 2;
        this.player.heal(healAmount);
        this.addMessage(`放弃选择 · 恢复 ${healAmount} 生命补偿`);
        this.rewardChoices = null;
        this.ui.hideReward();
        this.state = 'playing';
        this.rewardIsBoss = false;
    }

    addMessage(text) {
        this.ui.addMessage(text);
    }

    handleShopInput() {
        const room = this.currentRoom;
        if (!room || room.type !== RoomType.SHOP || !room.shopItems) return;
        for (let i = 0; i < room.shopItems.length; i++) {
            if (this.input.wasPressed('Digit' + (i + 1))) {
                const item = room.shopItems[i];
                const uniqueId = `${room.gridX}-${room.gridY}-${item.id}`;
                if (item.sold || this.shopUsedIds.has(uniqueId)) {
                    this.addMessage('这件物品已经售出了');
                    return;
                }
                if (this.player.gold < item.cost) {
                    this.addMessage('金币不足！');
                    return;
                }
                this.player.gold -= item.cost;
                if (item.apply) item.apply(this.player);
                item.sold = true;
                this.shopUsedIds.add(uniqueId);
                this.addMessage(`购买：${item.name}`);
                return;
            }
        }
    }

    handleRestInput() {
        const room = this.currentRoom;
        if (!room || room.type !== RoomType.REST || room.restUsed) return;
        if (this.input.wasPressed('KeyH')) {
            this.player.heal(2);
            room.restUsed = true;
            this.addMessage('❤ 休息恢复 2 生命');
        } else if (this.input.wasPressed('KeyM')) {
            this.player.addMaxHearts(1, true);
            room.restUsed = true;
            this.addMessage('❤ 最大生命 +1');
        }
    }

    handleStairsInput() {
        const room = this.currentRoom;
        if (!room || !room.stairsActive) return;
        
        if (room.checkStairsCollision(this.player) || this.input.wasPressed('KeyE')) {
            this.goToNextFloor();
        }
    }

    goToNextFloor() {
        this.floor++;
        this.bullets = [];
        this.particles.clear();
        this.map = new GameMap(this.floor);
        const startRoom = this.map.getStartRoom();
        startRoom.visited = true;
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + 1);
        this.shopUsedIds = new Set();
        this.rewardShownThisRoom = false;
        this.state = 'playing';
        this.addMessage(`📉 进入第 ${this.floor} 层 · 恢复 1 生命`);
    }

    update(dt) {
        this.ui.update();

        if (this.state === 'menu' || this.state === 'gameover') {
            this.input.endFrame();
            return;
        }

        // Wiki 切换（Tab 或 B 键）
        if (this.input.wasPressed('Tab') || this.input.wasPressed('KeyB')) {
            if (this.state === 'wiki') this.hideWiki();
            else if (this.state === 'playing' || this.state === 'paused') this.showWiki();
        }

        // Debug 模式切换
        if (this.input.wasPressed('Backquote') || this.input.wasPressed('Tilde')) {
            this.debugMode = !this.debugMode;
            this.addMessage('🐞 调试模式: ' + (this.debugMode ? '开' : '关'));
        }
        if (this.debugMode) {
            // F1 切换无敌
            if (this.input.wasPressed('F1')) {
                this.player.invulnerable = !this.player.invulnerable;
                this.addMessage('🛡 无敌: ' + (this.player.invulnerable ? '开' : '关'));
            }
            // F2 秒杀房间内所有敌人
            if (this.input.wasPressed('F2')) {
                const r = this.currentRoom;
                if (r) {
                    while (r.enemies.length > 0) {
                        const e = r.enemies[0];
                        e.hp = 0;
                        e.dead = true;
                    }
                    this.addMessage('💥 秒杀全部');
                }
            }
            // F3 增加最大血量
            if (this.input.wasPressed('F3')) {
                this.player.maxHearts += 2;
                this.player.hearts += 2;
                this.addMessage('❤ 最大生命 +2');
            }
            // F4 增加最大伤害
            if (this.input.wasPressed('F4')) {
                this.player.tearDamage += 3;
                this.addMessage('🗡 伤害 +3');
            }
            // F5 增加射速
            if (this.input.wasPressed('F5')) {
                this.player.tearsDelay = Math.max(0.1, this.player.tearsDelay * 0.8);
                this.addMessage('⚡ 射速提升');
            }
            // F6 传送到 Boss 房（如果存在）
            if (this.input.wasPressed('F6') && this.map) {
                const bossRoomKey = this._findRoomByType('boss');
                if (bossRoomKey) {
                    this.map.currentKey = bossRoomKey;
                    const r2 = this.map.getCurrentRoom();
                    this.player.x = r2.width / 2;
                    this.player.y = r2.height / 2;
                    this.addMessage('🚪 传送到 Boss 房');
                }
            }
            // F7 直接下一层
            if (this.input.wasPressed('F7')) {
                this.floor++;
                this.bullets = [];
                this.particles.clear();
                this.map = new GameMap(this.floor);
                this.player.x = this.width / 2;
                this.player.y = this.height / 2;
                this.addMessage('📉 进入第 ' + this.floor + ' 层');
            }
            // F8 回到第 1 层
            if (this.input.wasPressed('F8')) {
                this.floor = 1;
                this.bullets = [];
                this.particles.clear();
                this.map = new GameMap(this.floor);
                this.player.x = this.width / 2;
                this.player.y = this.height / 2;
                this.addMessage('🏠 回到第 1 层');
            }
            // F9 获得 99 金币
            if (this.input.wasPressed('F9')) {
                this.player.gold += 99;
                this.addMessage('💰 +99 金币');
            }
            // F10 给玩家传说道具池随机 5 个
            if (this.input.wasPressed('F10')) {
                for (let i = 0; i < 5 && UpgradePool.legendary.length > 0; i++) {
                    const pick = Utils.choice(UpgradePool.legendary);
                    if (pick && pick.apply && !this.ownedUpgradeIds.has(pick.id)) {
                        pick.apply(this.player);
                        this.ownedUpgradeIds.add(pick.id);
                    }
                }
                this.addMessage('✨ 赠送传说道具');
            }
        }

        if (this.input.escapePressed) {
            if (this.state === 'wiki') { this.hideWiki(); }
            else if (this.state === 'playing') this.pause();
            else if (this.state === 'paused') this.resume();
        }

        if (this.state !== 'playing') {
            this.input.endFrame();
            return;
        }

        const room = this.currentRoom;
        if (!room) { this.input.endFrame(); return; }

        this.player.update(dt, this.input, room, this);
        room.update(dt, this.player, this);

        this.handleShopInput();
        this.handleRestInput();
        this.handleStairsInput();

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt, room, room.enemies);
            if (b.dead) { this.bullets.splice(i, 1); continue; }

            if (b.fromPlayer) {
                for (const enemy of room.enemies) {
                    if (enemy.dead) continue;
                    if (Utils.aabbCollide({ x: b.x, y: b.y, r: b.r }, { x: enemy.x, y: enemy.y, r: enemy.r })) {
                        // Boss闪避检查
                        if (enemy.isBoss && enemy.tryDodge && enemy.tryDodge(b) === true) {
                            this.addMessage('⚡ ' + enemy.name + ' 闪避了攻击！');
                            continue;
                        }
                        if (enemy.takeDamage(b.damage, this, room)) {
                            this.particles.explosion(enemy.x, enemy.y, enemy.color);
                            const goldValue = enemy.goldDrop || 2;
                            room.items.push(new Item(
                                enemy.x + Utils.rand(-15, 15),
                                enemy.y + Utils.rand(-15, 15),
                                { type: 'gold', value: goldValue }));
                            if (!enemy.isBoss && Math.random() < 0.12 + this.player.luck * 0.03) {
                                room.items.push(new Item(
                                    enemy.x + Utils.rand(-20, 20),
                                    enemy.y + Utils.rand(-20, 20),
                                    { type: 'heart', value: 1 }));
                            }
                        }
                        if (b.pierce > 0) b.pierce--;
                        else b.dead = true;
                        if (b.dead) break;
                    }
                }
            } else {
                if (Utils.aabbCollide({ x: b.x, y: b.y, r: b.r }, { x: this.player.x, y: this.player.y, r: this.player.r })) {
                    this.player.takeDamage(b.damage);
                    this.particles.hit(b.x, b.y, '#ff6b6b');
                    b.dead = true;
                }
            }
        }

        if (room.type === RoomType.TREASURE && !room.chestOpened) {
            const cx = this.width / 2;
            const cy = this.height / 2;
            if (Utils.dist(this.player.x, this.player.y, cx, cy) < 30) {
                room.chestOpened = true;
                this.showReward();
                for (let i = 0; i < 6; i++) {
                    room.items.push(new Item(
                        cx + Utils.rand(-60, 60),
                        cy + Utils.rand(-30, 30),
                        { type: 'gold', value: Utils.randInt(3, 6) }));
                }
            }
        }

        for (let i = room.items.length - 1; i >= 0; i--) {
            const it = room.items[i];
            if (it.picked) continue;
            const d = Utils.dist(it.x, it.y, this.player.x, this.player.y);
            if (d < 18) it.onPickup(this.player, this);
        }

        this.bullets = this.bullets.filter(b => !b.dead);
        this.particles.update(dt);

        if (this.player.dead) {
            this.particles.explosion(this.player.x, this.player.y, '#fff4a3');
            setTimeout(() => this.gameOver(), 600);
            this.player.dead = 'processed';
        }

        if (!this.transitioning && room.cleared) {
            const dir = room.checkDoorTransition(this.player);
            if (dir) {
                const res = this.map.moveToRoom(dir);
                if (res) {
                    this.transitioning = true;
                    this.transitionAlpha = 0;
                    this.transitionPhase = 'out';
                    this._transitionTarget = res;
                    this._transitionDir = dir;
                    this.rewardShownThisRoom = false;
                }
            }
        }

        if (this.transitioning) this.updateTransition(dt);

        this.input.endFrame();
    }

    updateTransition(dt) {
        const speed = 3;
        if (this.transitionPhase === 'out') {
            this.transitionAlpha += dt * speed;
            if (this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                this.transitionPhase = 'hold';
                const res = this._transitionTarget;
                this._transitionTarget = null;
                if (res && res.room) {
                    const newPos = res.room.enterFromDirection(this._transitionDir);
                    this.player.x = newPos.x;
                    this.player.y = newPos.y;
                    this.bullets = [];
                }
                this.holdTime = 0.08;
            }
        } else if (this.transitionPhase === 'hold') {
            this.holdTime -= dt;
            if (this.holdTime <= 0) this.transitionPhase = 'in';
        } else if (this.transitionPhase === 'in') {
            this.transitionAlpha -= dt * speed;
            if (this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitioning = false;
                this.transitionPhase = null;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'menu') {
            this.renderMenuBackground();
            return;
        }

        const room = this.currentRoom;
        if (room) room.render(this.ctx);

        if (this.player) {
            if (room) room.renderEntities(this.ctx);
            if (!this.player.dead) this.player.render(this.ctx);
            for (const b of this.bullets) b.render(this.ctx);
            this.particles.render(this.ctx);
        }

        if (this.transitioning) {
            this.ctx.fillStyle = `rgba(20, 18, 16, ${this.transitionAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        if (room && room.type === RoomType.BOSS && room.bossTriggered && !room.cleared) {
            const boss = room.enemies.find(e => e.isBoss);
            if (boss) {
                const barW = this.width * 0.55;
                const barH = 12;
                const bx = (this.width - barW) / 2;
                const by = this.height - 28;
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(bx - 3, by - 3, barW + 6, barH + 6);
                this.ctx.fillStyle = '#3a342c';
                this.ctx.fillRect(bx, by, barW, barH);
                this.ctx.fillStyle = boss.color;
                this.ctx.fillRect(bx, by, barW * (boss.hp / boss.maxHp), barH);
                this.ctx.fillStyle = '#e8c098';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                const bossName = boss.bossName || 'BOSS';
                const hpText = Math.ceil(boss.hp) + ' / ' + boss.maxHp;
                this.ctx.fillText(bossName, this.width / 2, by - 6);
                this.ctx.font = 'bold 10px sans-serif';
                this.ctx.fillStyle = '#fff4a3';
                this.ctx.fillText(hpText, this.width / 2, by + barH + 12);
            }
        }

        // Debug 模式左上角信息
        if (this.debugMode && this.player) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
            this.ctx.fillRect(8, 8, 220, 138);
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 12px monospace';
            this.ctx.textAlign = 'left';
            const p = this.player;
            const lines = [
                '🐞 DEBUG MODE (按 ` 关闭)',
                'F1 无敌: ' + (p.invulnerable ? '开' : '关'),
                'F2 秒杀当前房',
                'F3 +2 最大血量',
                'F4 +3 伤害',
                'F5 加速射击',
                'F6 传送 Boss 房',
                'F7 下一层   F8 回到 1 层',
                'F9 +99 金   F10 传说装备'
            ];
            lines.forEach((t, i) => {
                this.ctx.fillStyle = i === 0 ? '#ffd700' : '#e8c098';
                this.ctx.fillText(t, 16, 26 + i * 13);
            });
        }
    }

    renderMenuBackground() {
        this.ctx.fillStyle = '#1a1816';
        this.ctx.fillRect(0, 0, this.width, this.height);
        const t = Date.now() / 1000;
        for (let i = 0; i < 50; i++) {
            const x = ((i * 97 + this.width / 2 + Math.cos(t * 0.3 + i) * 40) % this.width + this.width) % this.width;
            const y = ((i * 61 + this.height / 2 + Math.sin(t + i) * 40) % this.height + this.height) % this.height;
            const glowR = 15 + Math.sin(t * 2 + i) * 8;
            const alpha = 0.15 + Math.sin(t * 1.5 + i) * 0.08;
            const grad = this.ctx.createRadialGradient(x, y, 0, x, y, glowR);
            grad.addColorStop(0, `rgba(255, 215, 0, ${Math.max(0, alpha)})`);
            grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowR, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
