class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, down: false, pressed: false };
        this._pressedThisFrame = {};
        this.escapePressed = false;

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) this._pressedThisFrame[e.code] = true;
            this.keys[e.code] = true;
            if (e.code === 'Escape') this.escapePressed = true;
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab','KeyB'].includes(e.code) ||
                e.code.startsWith('Key') || e.code.startsWith('Digit') || e.code.startsWith('F')) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                if (!this.mouse.down) this.mouse.pressed = true;
                this.mouse.down = true;
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.down = false;
        });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        canvas.addEventListener('mouseleave', () => {
            this.mouse.down = false;
        });
    }

    endFrame() {
        this._pressedThisFrame = {};
        this.mouse.pressed = false;
        this.escapePressed = false;
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this._pressedThisFrame[code];
    }

    isAnyDown(codes) {
        return codes.some(c => this.keys[c]);
    }

    getMoveAxis() {
        let x = 0, y = 0;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(2);
            x /= len;
            y /= len;
        }
        return { x, y };
    }

    isShooting() {
        return this.mouse.down || this.isDown('Space');
    }
}
