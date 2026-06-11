class GameMap {
    constructor(floor) {
        this.floor = floor;
        this.gridW = 5;
        this.gridH = 5;
        this.rooms = {};
        this.currentKey = null;
        this.startKey = null;
        this.generate();
    }

    key(x, y) {
        return `${x},${y}`;
    }

    getRoom(x, y) {
        return this.rooms[this.key(x, y)];
    }

    getCurrentRoom() {
        return this.rooms[this.currentKey];
    }

    getStartRoom() {
        return this.rooms[this.startKey];
    }

    generate() {
        const cx = Math.floor(this.gridW / 2);
        const cy = Math.floor(this.gridH / 2);
        this.startKey = this.key(cx, cy);
        this.currentKey = this.startKey;

        this.rooms[this.startKey] = new Room(cx, cy, RoomType.START);

        const totalRooms = 7 + Math.min(this.floor, 3);
        const queue = [{ x: cx, y: cy }];
        const visited = new Set([this.startKey]);
        const placed = [this.startKey];

        while (placed.length < totalRooms && queue.length > 0) {
            const idx = Utils.randInt(0, queue.length - 1);
            const current = queue.splice(idx, 1)[0];
            const directions = [
                { dx: 0, dy: -1, door: 'top', opp: 'bottom' },
                { dx: 1, dy: 0, door: 'right', opp: 'left' },
                { dx: 0, dy: 1, door: 'bottom', opp: 'top' },
                { dx: -1, dy: 0, door: 'left', opp: 'right' }
            ];

            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }

            for (const d of directions) {
                const nx = current.x + d.dx;
                const ny = current.y + d.dy;
                const nkey = this.key(nx, ny);

                if (nx < 0 || nx >= this.gridW || ny < 0 || ny >= this.gridH) continue;
                if (visited.has(nkey)) continue;
                if (placed.length >= totalRooms) break;

                const existing = this.rooms[this.key(current.x, current.y)];
                existing.doors[d.door] = true;

                const newRoom = new Room(nx, ny, RoomType.COMBAT);
                newRoom.doors[d.opp] = true;
                this.rooms[nkey] = newRoom;

                visited.add(nkey);
                placed.push(nkey);
                queue.push({ x: nx, y: ny });
            }
        }

        let maxDist = 0;
        let bossKey = this.startKey;
        for (const k of placed) {
            if (k === this.startKey) continue;
            const [x, y] = k.split(',').map(Number);
            const dist = Math.abs(x - cx) + Math.abs(y - cy);
            if (dist > maxDist) {
                maxDist = dist;
                bossKey = k;
            }
        }

        if (bossKey !== this.startKey) {
            const [bx, by] = bossKey.split(',').map(Number);
            this.rooms[bossKey] = new Room(bx, by, RoomType.BOSS);
            const bossRoom = this.rooms[bossKey];
            const directions = [
                { dx: 0, dy: -1, door: 'top', opp: 'bottom' },
                { dx: 1, dy: 0, door: 'right', opp: 'left' },
                { dx: 0, dy: 1, door: 'bottom', opp: 'top' },
                { dx: -1, dy: 0, door: 'left', opp: 'right' }
            ];
            for (const d of directions) {
                const neighborKey = this.key(bx + d.dx, by + d.dy);
                if (this.rooms[neighborKey]) {
                    bossRoom.doors[d.door] = true;
                    this.rooms[neighborKey].doors[d.opp] = true;
                }
            }
        }

        const combatKeys = placed.filter(k => {
            const r = this.rooms[k];
            return r && r.type === RoomType.COMBAT && k !== bossKey;
        });

        if (combatKeys.length > 2) {
            const treasureKey = combatKeys.splice(Utils.randInt(0, combatKeys.length - 1), 1)[0];
            const [tx, ty] = treasureKey.split(',').map(Number);
            const doors = this.rooms[treasureKey].doors;
            this.rooms[treasureKey] = new Room(tx, ty, RoomType.TREASURE);
            this.rooms[treasureKey].doors = doors;
        }
        if (combatKeys.length > 2) {
            const shopKey = combatKeys.splice(Utils.randInt(0, combatKeys.length - 1), 1)[0];
            const [sx, sy] = shopKey.split(',').map(Number);
            const doors = this.rooms[shopKey].doors;
            this.rooms[shopKey] = new Room(sx, sy, RoomType.SHOP);
            this.rooms[shopKey].doors = doors;
        }
        if (combatKeys.length > 2) {
            const restKey = combatKeys.splice(Utils.randInt(0, combatKeys.length - 1), 1)[0];
            const [rx, ry] = restKey.split(',').map(Number);
            const doors = this.rooms[restKey].doors;
            this.rooms[restKey] = new Room(rx, ry, RoomType.REST);
            this.rooms[restKey].doors = doors;
        }

        for (const key in this.rooms) {
            this.rooms[key].initialize(this.floor);
        }
    }

    moveToRoom(direction) {
        const [x, y] = this.currentKey.split(',').map(Number);
        let nx = x, ny = y;
        let entryDir = null;
        if (direction === 'top') { ny--; entryDir = 'bottom'; }
        else if (direction === 'bottom') { ny++; entryDir = 'top'; }
        else if (direction === 'left') { nx--; entryDir = 'right'; }
        else if (direction === 'right') { nx++; entryDir = 'left'; }

        const nkey = this.key(nx, ny);
        if (this.rooms[nkey]) {
            this.rooms[this.currentKey].visited = true;
            this.currentKey = nkey;
            const room = this.rooms[nkey];
            room.visited = true;
            return { room, entryDir };
        }
        return null;
    }
}
