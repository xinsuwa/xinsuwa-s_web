class Item {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.r = opts.r || 10;
        this.type = opts.type || 'gold';
        this.value = opts.value || 1;
        this.picked = false;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.time = 0;
        this.color = opts.color || '#ffd700';
        this.name = opts.name || '金币';
    }

    update(dt) {
        this.time += dt;
    }

    render(ctx) {
        const bob = Math.sin(this.time * 3 + this.bobPhase) * 3;
        const y = this.y + bob;

        if (this.type === 'gold') {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#8b6f00';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('¢', this.x, y);
        } else if (this.type === 'heart') {
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            const hr = this.r;
            ctx.moveTo(this.x, y + hr * 0.4);
            ctx.bezierCurveTo(this.x, y - hr * 0.2, this.x - hr, y - hr * 0.2, this.x - hr, y + hr * 0.2);
            ctx.bezierCurveTo(this.x - hr, y + hr * 0.7, this.x, y + hr, this.x, y + hr);
            ctx.bezierCurveTo(this.x, y + hr, this.x + hr, y + hr * 0.7, this.x + hr, y + hr * 0.2);
            ctx.bezierCurveTo(this.x + hr, y - hr * 0.2, this.x, y - hr * 0.2, this.x, y + hr * 0.4);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.type === 'chest') {
            ctx.fillStyle = '#8b6f47';
            ctx.fillRect(this.x - 14, y - 10, 28, 20);
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(this.x - 14, y - 10, 28, 6);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x - 2, y - 2, 4, 6);
            ctx.strokeStyle = '#3a2a15';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - 14, y - 10, 28, 20);
        } else if (this.type === 'key') {
            ctx.fillStyle = '#d4a574';
            ctx.shadowColor = '#d4a574';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x - 4, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(this.x + 1, y - 2, 8, 4);
            ctx.fillRect(this.x + 6, y - 4, 3, 8);
            ctx.shadowBlur = 0;
        } else if (this.type === 'bomb') {
            ctx.fillStyle = '#3a342c';
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(this.x, y - this.r * 0.6, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    onPickup(player, game) {
        if (this.picked) return;
        if (this.type === 'gold') {
            player.gold += this.value;
            if (game) game.addMessage(`💰 +${this.value}`);
        } else if (this.type === 'heart') {
            if (player.hearts < player.maxHearts) {
                player.heal(this.value);
                if (game) game.addMessage(`❤ +${this.value}`);
                this.picked = true;
            }
            return;
        } else if (this.type === 'key') {
            player.keys += this.value;
            if (game) game.addMessage(`🔑 +${this.value}`);
        } else if (this.type === 'bomb') {
            player.bombs += this.value;
            if (game) game.addMessage(`💣 +${this.value}`);
        }
        this.picked = true;
    }
}

// 大幅扩充道具池，参考以撒的设计
// 普通道具：小幅增益，效果较弱
// 稀有道具：中等增益，有特色效果
// 传说道具：强力但不是无敌
const UpgradePool = {
    common: [
        // 伤害类 - 小幅提升
        { id: 'dmg1',       rarity: 'common', name: '洋葱',         icon: '🧅', desc: '伤害 +0.7',
          apply: (p) => p.tearDamage += 0.7 },
        { id: 'dmg2',       rarity: 'common', name: '小号',         icon: '🎺', desc: '伤害 +0.5',
          apply: (p) => p.tearDamage += 0.5 },
        { id: 'dmg3',       rarity: 'common', name: '钉子',         icon: '📌', desc: '伤害 +0.6',
          apply: (p) => p.tearDamage += 0.6 },
        
        // 射速类 - 小幅提升
        { id: 'rate1',      rarity: 'common', name: '双瞳',         icon: '👁', desc: '射速 +8%',
          apply: (p) => p.tearsDelay = Math.max(0.18, p.tearsDelay * 0.92) },
        { id: 'rate2',      rarity: 'common', name: '眼镜',         icon: '👓', desc: '射速 +6%',
          apply: (p) => p.tearsDelay = Math.max(0.18, p.tearsDelay * 0.94) },
        { id: 'rate3',      rarity: 'common', name: '时钟',         icon: '⏰', desc: '射速 +5%',
          apply: (p) => p.tearsDelay = Math.max(0.18, p.tearsDelay * 0.95) },
        
        // 范围类
        { id: 'range1',     rarity: 'common', name: '望远镜',       icon: '🔭', desc: '距离 +25',
          apply: (p) => p.tearRange += 25 },
        { id: 'range2',     rarity: 'common', name: '尺子',         icon: '📏', desc: '距离 +20',
          apply: (p) => p.tearRange += 20 },
        
        // 速度类 - 小幅提升
        { id: 'speed1',     rarity: 'common', name: '绷带',         icon: '🥾', desc: '移速 +8',
          apply: (p) => p.baseSpeed += 8 },
        { id: 'speed2',     rarity: 'common', name: '袜子',         icon: '🧦', desc: '移速 +6',
          apply: (p) => p.baseSpeed += 6 },
        
        // 生命类 - 小幅提升
        { id: 'heart1',     rarity: 'common', name: '红心',         icon: '❤', desc: '最大生命 +1',
          apply: (p) => p.addMaxHearts(1, false) },
        { id: 'heal1',      rarity: 'common', name: '绷带卷',       icon: '🩹', desc: '恢复 1 生命',
          apply: (p) => p.heal(1) },
        { id: 'heal2',      rarity: 'common', name: '药丸',         icon: '💊', desc: '恢复 2 生命',
          apply: (p) => p.heal(2) },
        
        // 子弹速度
        { id: 'tspeed1',    rarity: 'common', name: '橡皮筋',       icon: '🎯', desc: '子弹速度 +30',
          apply: (p) => p.tearSpeed += 30 },
        { id: 'tspeed2',    rarity: 'common', name: '弹簧',         icon: '🔄', desc: '子弹速度 +25',
          apply: (p) => p.tearSpeed += 25 },
        
        // 幸运
        { id: 'luck1',      rarity: 'common', name: '四叶草',       icon: '🍀', desc: '幸运 +0.5',
          apply: (p) => p.luck += 0.5 },
        { id: 'luck2',      rarity: 'common', name: '硬币',         icon: '🪙', desc: '幸运 +0.3',
          apply: (p) => p.luck += 0.3 },
        
        // 子弹大小
        { id: 'size1',      rarity: 'common', name: '大眼',         icon: '👀', desc: '子弹稍大',
          apply: (p) => p.tearSize += 0.5 }
    ],
    
    rare: [
        // 伤害类 - 中等提升
        { id: 'dmg_rare1',  rarity: 'rare',   name: '苦药',         icon: '💊', desc: '伤害 +1.5',
          apply: (p) => p.tearDamage += 1.5 },
        { id: 'dmg_rare2',  rarity: 'rare',   name: '血瓶',         icon: '🩸', desc: '伤害 +1.2',
          apply: (p) => p.tearDamage += 1.2 },
        
        // 射速类 - 中等提升
        { id: 'rate_rare1', rarity: 'rare',   name: '结膜炎',       icon: '👀', desc: '射速 +15%',
          apply: (p) => p.tearsDelay = Math.max(0.16, p.tearsDelay * 0.85) },
        { id: 'rate_rare2', rarity: 'rare',   name: '急眼',         icon: '⚡', desc: '射速 +12%',
          apply: (p) => p.tearsDelay = Math.max(0.16, p.tearsDelay * 0.88) },
        
        // 多发
        { id: 'multi1',     rarity: 'rare',   name: '黏液菌',       icon: '🦠', desc: '多发 1 发眼泪',
          apply: (p) => p.tearCount += 1 },
        { id: 'multi2',     rarity: 'rare',   name: '双胞胎',       icon: '👯', desc: '多发 1 发眼泪',
          apply: (p) => p.tearCount += 1 },
        
        // 穿透
        { id: 'pierce1',    rarity: 'rare',   name: '穿透之泪',     icon: '⚡', desc: '穿透 1 个敌人',
          apply: (p) => p.tearPierce += 1 },
        { id: 'pierce2',    rarity: 'rare',   name: '针',           icon: '📍', desc: '穿透 1 个敌人',
          apply: (p) => p.tearPierce += 1 },
        
        // 生命类
        { id: 'heart_rare1',rarity: 'rare',   name: '生命容器',     icon: '💜', desc: '最大生命 +2',
          apply: (p) => p.addMaxHearts(2, false) },
        { id: 'heart_rare2',rarity: 'rare',   name: '血瓶',         icon: '🫀', desc: '最大生命 +1 并回满',
          apply: (p) => p.addMaxHearts(1, true) },
        
        // 速度类
        { id: 'speed_rare1',rarity: 'rare',   name: '羽翼',         icon: '🕊', desc: '移速 +20',
          apply: (p) => p.baseSpeed += 20 },
        { id: 'speed_rare2',rarity: 'rare',   name: '疾风',         icon: '💨', desc: '移速 +15',
          apply: (p) => p.baseSpeed += 15 },
        
        // 特殊效果
        { id: 'homing1',    rarity: 'rare',   name: '追踪泪',       icon: '🎯', desc: '眼泪轻微追踪敌人',
          apply: (p) => p.tearHoming = 0.02 },
        { id: 'spectral1',  rarity: 'rare',   name: '幽灵泪',       icon: '👻', desc: '眼泪可穿透障碍物',
          apply: (p) => p.tearSpectral = true },
        
        // 子弹大小
        { id: 'bigtear1',   rarity: 'rare',   name: '巨泪',         icon: '💧', desc: '眼泪更大 + 伤害 +1',
          apply: (p) => { p.tearSize += 1; p.tearDamage += 1; } },
        
        // 范围
        { id: 'range_rare1',rarity: 'rare',   name: '长弓',         icon: '🏹', desc: '距离 +60',
          apply: (p) => p.tearRange += 60 }
    ],
    
    legendary: [
        // 强力伤害
        { id: 'brimstone',  rarity: 'legendary', name: '硫磺',      icon: '🔥', desc: '伤害 +3 + 穿透 +1',
          apply: (p) => { p.tearDamage += 3; p.tearPierce += 1; } },
        { id: 'polyphemus', rarity: 'legendary', name: '独眼巨人',  icon: '👁', desc: '伤害 +4 + 子弹变大',
          apply: (p) => { p.tearDamage += 4; p.tearSize += 1.5; } },
        { id: 'godhead',    rarity: 'legendary', name: '圣心',      icon: '✨', desc: '伤害 +3 + 追踪 +穿透',
          apply: (p) => { p.tearDamage += 3; p.tearHoming = 0.04; p.tearPierce += 1; } },
        
        // 多发类
        { id: '2020',       rarity: 'legendary', name: '分裂之泪',  icon: '💦', desc: '三连发（射速略降）',
          apply: (p) => { p.tearCount += 2; p.tearsDelay = Math.max(0.2, p.tearsDelay * 1.08); } },
        { id: 'inner',      rarity: 'legendary', name: '内眼',      icon: '🔮', desc: '多发 2 发眼泪',
          apply: (p) => p.tearCount += 2 },
        
        // 生命类
        { id: 'abaddon',    rarity: 'legendary', name: '深渊',      icon: '💀', desc: '最大生命 +3 + 伤害 +2',
          apply: (p) => { p.addMaxHearts(3, false); p.tearDamage += 2; } },
        { id: 'deadcat',    rarity: 'legendary', name: '死猫',      icon: '🐱', desc: '最大生命 +4 但伤害 -0.5',
          apply: (p) => { p.addMaxHearts(4, false); p.tearDamage -= 0.5; } },
        
        // 射速类
        { id: 'sadon',      rarity: 'legendary', name: '悲伤之泪',  icon: '😢', desc: '射速 +30% + 多发 1',
          apply: (p) => { p.tearsDelay = Math.max(0.14, p.tearsDelay * 0.7); p.tearCount += 1; } },
        
        // 特殊
        { id: 'flight',     rarity: 'legendary', name: '圣羽',      icon: '🦋', desc: '飞行（可穿越障碍）',
          apply: (p) => p.flight = true },
        { id: 'shield',     rarity: 'legendary', name: '护盾',      icon: '🛡', desc: '每 10 秒抵挡一次伤害',
          apply: (p) => p.shieldCooldown = 10 }
    ]
};

// 减少奖励频率：只有特定房间给奖励
// 宝箱房：100% 给一个奖励
// Boss房：100% 给一个奖励
// 普通战斗房：50% 概率给奖励（而不是每次都给）
function rollUpgrades(count, floor, excludeIds = []) {
    const pool = [];
    const commonList = UpgradePool.common.filter(u => !excludeIds.has(u.id));
    const rareList = UpgradePool.rare.filter(u => !excludeIds.has(u.id));
    const legList = UpgradePool.legendary.filter(u => !excludeIds.has(u.id));

    // 降低稀有和传说概率
    for (let i = 0; i < count * 8; i++) pool.push('common');
    for (let i = 0; i < count * 2 + floor; i++) pool.push('rare');
    for (let i = 0; i < Math.floor(floor / 2); i++) pool.push('legendary');

    const chosen = [];
    const usedIds = new Set(excludeIds);
    let attempts = 0;
    while (chosen.length < count && attempts < 50) {
        attempts++;
        const tier = Utils.choice(pool);
        let list;
        if (tier === 'legendary' && legList.length > 0) list = legList;
        else if (tier === 'rare' && rareList.length > 0) list = rareList;
        else list = commonList;

        if (!list || list.length === 0) continue;
        const pick = Utils.choice(list);
        if (usedIds.has(pick.id)) continue;
        usedIds.add(pick.id);
        chosen.push(pick);
    }
    return chosen;
}