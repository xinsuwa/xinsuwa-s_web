class UI {
    constructor(game) {
        this.game = game;
        this.hpFill = document.getElementById('hp-fill');
        this.hpText = document.getElementById('hp-text');
        this.goldEl = document.getElementById('gold');
        this.floorEl = document.getElementById('floor');
        this.roomInfoEl = document.getElementById('room-info');
        this.minimapEl = document.getElementById('minimap');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.rewardOverlay = document.getElementById('reward-overlay');
        this.messageLog = document.getElementById('message-log');
    }

    update() {
        const p = this.game.player;
        if (p && this.hpFill) {
            const pct = Math.max(0, p.hearts / p.maxHearts) * 100;
            this.hpFill.style.width = pct + '%';
            this.hpText.textContent = `❤ ${Math.ceil(p.hearts)} / ${p.maxHearts}`;
        }
        if (this.goldEl) this.goldEl.textContent = p ? `💰 ${p.gold}` : '💰 0';
        if (this.floorEl) this.floorEl.textContent = this.game.floor;
        const room = this.game.currentRoom;
        if (room && this.roomInfoEl) {
            const typeLabel = {
                start: '起始房间',
                combat: '战斗房间',
                treasure: '宝箱房间',
                shop: '商店',
                rest: '休息区',
                boss: 'BOSS 房间'
            };
            if (room.type === RoomType.COMBAT && !room.cleared) {
                this.roomInfoEl.textContent = `${typeLabel[room.type]} (敌人: ${room.enemies.length})`;
            } else if (room.type === RoomType.BOSS && !room.cleared && room.bossTriggered) {
                this.roomInfoEl.textContent = 'BOSS 房间';
            } else if (room.cleared || room.type === RoomType.START || room.type === RoomType.TREASURE || room.type === RoomType.REST || room.type === RoomType.SHOP) {
                this.roomInfoEl.textContent = `${typeLabel[room.type]} ✓`;
            } else {
                this.roomInfoEl.textContent = typeLabel[room.type];
            }
        }
        this.renderMinimap();
    }

    renderMinimap() {
        if (!this.minimapEl || !this.game.map) return;
        const map = this.game.map;
        const cell = 18;
        const [cx, cy] = map.currentKey.split(',').map(Number);
        let minX = cx, maxX = cx, minY = cy, maxY = cy;
        for (const k in map.rooms) {
            const [x, y] = k.split(',').map(Number);
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
        }

        const w = (maxX - minX + 1) * cell;
        const h = (maxY - minY + 1) * cell;
        const offsetX = (140 - w) / 2;
        const offsetY = (100 - h) / 2;

        let html = '';
        for (const k in map.rooms) {
            const room = map.rooms[k];
            const [x, y] = k.split(',').map(Number);
            const rx = offsetX + (x - minX) * cell;
            const ry = offsetY + (y - minY) * cell;
            const isCurrent = (k === map.currentKey);

            let color = '#3a342c';
            if (room.visited || room.type === RoomType.START) {
                if (room.type === RoomType.BOSS) color = room.cleared ? '#d4a574' : '#a855f7';
                else if (room.type === RoomType.TREASURE) color = '#ffd700';
                else if (room.type === RoomType.SHOP) color = '#7fd47f';
                else if (room.type === RoomType.REST) color = '#6bb3d9';
                else if (room.type === RoomType.START) color = '#d4a574';
                else color = room.cleared ? '#d4a574' : '#c44545';
            }
            const shadow = isCurrent ? '0 0 10px #ffd700' : 'none';
            html += `<div style="position:absolute;left:${rx}px;top:${ry}px;width:${cell - 3}px;height:${cell - 3}px;background:${color};border-radius:3px;box-shadow:${shadow};"></div>`;
        }
        this.minimapEl.innerHTML = html;
    }

    showMenu() {
        this.menuOverlay.classList.remove('hidden');
        this.pauseOverlay.classList.add('hidden');
        this.gameoverOverlay.classList.add('hidden');
        this.rewardOverlay.classList.add('hidden');
        document.getElementById('btn-resume').classList.add('hidden');
    }

    hideMenu() {
        this.menuOverlay.classList.add('hidden');
    }

    showPause() {
        this.pauseOverlay.classList.remove('hidden');
    }

    hidePause() {
        this.pauseOverlay.classList.add('hidden');
    }

    showGameOver() {
        document.getElementById('final-floor').textContent = this.game.floor;
        document.getElementById('final-gold').textContent = this.game.player ? this.game.player.gold : 0;
        this.gameoverOverlay.classList.remove('hidden');
    }

    hideGameOver() {
        this.gameoverOverlay.classList.add('hidden');
    }

    showReward(upgrades, isBoss) {
        const container = document.getElementById('reward-choices');
        const title = document.getElementById('reward-title');
        if (title) {
            title.textContent = isBoss ? '击败 Boss！选择一个奖励：' : '房间清理完成！选择一个奖励：';
        }
        container.innerHTML = '';
        upgrades.forEach((up, idx) => {
            const card = document.createElement('div');
            card.className = 'reward-card';
            let rarityClass = '';
            let rarityText = '';
            if (up.rarity === 'legendary') {
                rarityClass = 'legendary';
                rarityText = '传说';
            } else if (up.rarity === 'rare') {
                rarityClass = 'rare';
                rarityText = '稀有';
            } else {
                rarityText = '普通';
            }
            if (rarityClass) card.classList.add(rarityClass);
            card.innerHTML = `
                <span class="reward-icon">${up.icon}</span>
                <div class="reward-name">${up.name}</div>
                <div class="reward-desc">${up.desc}</div>
                <div class="reward-rarity">${rarityText}</div>
            `;
            card.addEventListener('click', () => this.game.selectReward(idx));
            container.appendChild(card);
        });
        this.rewardOverlay.classList.remove('hidden');
    }

    hideReward() {
        this.rewardOverlay.classList.add('hidden');
    }

    showWiki(ownedIds) {
        const overlay = document.getElementById('wiki-overlay');
        const content = document.getElementById('wiki-content');
        overlay.classList.remove('hidden');
        // 绑定关闭按钮
        document.getElementById('wiki-close').onclick = () => this.game.hideWiki();
        // 绑定 tab 切换
        document.querySelectorAll('.wiki-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.wiki-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderWikiTab(tab.dataset.tab, ownedIds);
            };
        });
        this.renderWikiTab('items', ownedIds);
    }

    hideWiki() {
        document.getElementById('wiki-overlay').classList.add('hidden');
    }

    renderWikiTab(tab, ownedIds) {
        const content = document.getElementById('wiki-content');
        let html = '';

        if (tab === 'items') {
            html += this._renderWikiSection('普通道具', UpgradePool.common, ownedIds, true);
            html += this._renderWikiSection('稀有道具', UpgradePool.rare, ownedIds, true);
            html += this._renderWikiSection('传说道具', UpgradePool.legendary, ownedIds, true);
        } else if (tab === 'enemies') {
            html += this._renderEnemySection('近战型', ['chaser', 'slow_chaser', 'fast_chaser', 'tank', 'bomber']);
            html += this._renderEnemySection('远程型', ['shooter', 'rapid_shooter', 'spitter']);
            html += this._renderEnemySection('特殊型', ['flyer', 'wanderer', 'splitter', 'teleporter', 'shielded', 'invisible', 'healer', 'spawner']);
        } else if (tab === 'bosses') {
            html += this._renderBossSection('第 1 层 Boss', ['boss_floor1_a', 'boss_floor1_b']);
            html += this._renderBossSection('第 2 层 Boss', ['boss_floor2_a', 'boss_floor2_b']);
            html += this._renderBossSection('第 3 层 Boss', ['boss_floor3_a', 'boss_floor3_b']);
            html += this._renderBossSection('第 4 层 Boss', ['boss_floor4_a', 'boss_floor4_b']);
            html += this._renderBossSection('第 5 层 Boss', ['boss_floor5_a', 'boss_floor5_b']);
        }

        content.innerHTML = html;
    }

    _renderWikiSection(title, list, ownedIds, withIcon = false) {
        let html = `<div class="wiki-section-title">${title}</div><div class="wiki-grid">`;
        for (const item of list) {
            const owned = ownedIds && ownedIds.has(item.id);
            const rClass = item.rarity || '';
            const oClass = owned ? ' owned' : '';
            html += `<div class="wiki-card ${rClass}${oClass}">`;
            html += `<div class="wc-head"><span class="wc-icon">${item.icon}</span><span class="wc-name">${item.name}</span></div>`;
            html += `<div class="wc-desc">${item.desc}</div>`;
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    _renderEnemySection(title, keys) {
        let html = `<div class="wiki-section-title">${title}</div><div class="wiki-grid">`;
        const enemyDescs = {
            chaser: '紧贴玩家的普通追击者，血少但数量多时危险',
            slow_chaser: '缓慢但耐打的追击者，伤害 1 点',
            fast_chaser: '高速追击者，移动极快但很脆',
            shooter: '保持距离并向玩家射击',
            rapid_shooter: '快速射击型，射速较快',
            spitter: '吐出多向子弹的远程怪',
            dasher: '会冲向玩家的冲刺型',
            flyer: '可以穿越障碍物的飞行敌人',
            wanderer: '在房间里游荡的敌人',
            splitter: '死亡时分裂成更小的敌人',
            teleporter: '会瞬移的麻烦敌人',
            shielded: '拥有护盾的高血量敌人',
            invisible: '会隐身的敌人，需要仔细观察',
            bomber: '接触玩家后爆炸造成高伤害',
            healer: '会治疗其他敌人的支援型',
            spawner: '定期召唤小怪的母体',
            tank: '高血量的坦克型敌人'
        };
        for (const key of keys) {
            const e = EnemyTypes[key];
            if (!e) continue;
            const desc = enemyDescs[key] || '常见的敌人类型';
            html += `<div class="wiki-card">`;
            html += `<div class="wc-head"><span class="wc-color-dot" style="background:${e.color};color:${e.color};"></span><span class="wc-name">${this._enemyName(key)}</span></div>`;
            html += `<div class="wc-desc">${desc}</div>`;
            html += `<div class="wc-stats">HP ${e.hp} · 伤害 ${e.damage} · 💰 ${e.goldDrop}</div>`;
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    _enemyName(key) {
        const names = {
            chaser: '追击者', slow_chaser: '重装兵', fast_chaser: '疾行者',
            shooter: '射手', rapid_shooter: '速射手', spitter: '吐息者',
            dasher: '冲撞者', flyer: '飞行者', wanderer: '游荡者',
            splitter: '分裂体', teleporter: '瞬移者', shielded: '护盾兵',
            invisible: '隐形者', bomber: '自爆者', healer: '治疗者',
            spawner: '母体', tank: '坦克'
        };
        return names[key] || key;
    }

    _renderBossSection(title, keys) {
        let html = `<div class="wiki-section-title">${title}</div><div class="wiki-grid">`;
        for (const key of keys) {
            const b = EnemyTypes[key];
            if (!b) continue;
            html += `<div class="wiki-card rare">`;
            html += `<div class="wc-head"><span class="wc-color-dot" style="background:${b.color};color:${b.color};"></span><span class="wc-name">${b.name}</span></div>`;
            html += `<div class="wc-desc">拥有多阶段攻击模式，击败后会生成楼梯通向下一层</div>`;
            html += `<div class="wc-stats">HP ${b.hp} · 伤害 ${b.damage} · 💰 ${b.goldDrop}</div>`;
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    addMessage(text) {
        const div = document.createElement('div');
        div.className = 'log-message';
        div.textContent = text;
        this.messageLog.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    }
}
