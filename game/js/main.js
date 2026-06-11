(function () {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    game.ui.showMenu();

    let lastTime = performance.now();

    function loop(now) {
        let dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.05) dt = 0.05;

        game.update(dt);
        game.render();

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
