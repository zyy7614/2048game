/**
 * UIController类 - 管理用户界面和用户交互
 * 负责界面渲染、动画效果和UI事件处理
 */
class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameState = gameEngine.gameState;
        this.animationDuration = 150; // 动画持续时间（毫秒）
        this.isAnimating = false;

        // DOM元素引用
        this.gameGrid = null;
        this.scoreElement = null;
        this.bestScoreElement = null;
        this.gameMessage = null;
        this.restartButton = null;

        this.init();
    }

    /**
     * 初始化UI控制器
     */
    init() {
        this.initializeElements();
        this.createGridCells();
        this.bindEvents();
        this.render();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        this.gameGrid = document.getElementById('game-grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.restartButton = document.getElementById('restart-btn');

        if (!this.gameGrid) {
            throw new Error('游戏网格元素未找到');
        }
    }

    /**
     * 创建网格背景单元格
     */
    createGridCells() {
        // 清空现有内容
        this.gameGrid.innerHTML = '';

        // 创建16个背景单元格
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gameGrid.appendChild(cell);
        }
    }

    /**
     * 绑定UI事件
     */
    bindEvents() {
        // 重新开始按钮
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }

        // 游戏消息中的按钮事件将在显示消息时动态绑定
    }

    /**
     * 渲染游戏界面
     */
    render() {
        this.updateScore();
        this.renderGrid();
        this.updateGameStatus();
    }

    /**
     * 更新分数显示
     */
    updateScore() {
        const stats = this.gameState.getStats();

        if (this.scoreElement) {
            this.scoreElement.textContent = stats.score.toString();
        }

        if (this.bestScoreElement) {
            this.bestScoreElement.textContent = stats.bestScore.toString();
        }
    }

    /**
     * 渲染游戏网格
     */
    renderGrid() {
        // 移除现有的方块
        const existingTiles = this.gameGrid.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());

        // 渲染新的方块
        const grid = this.gameState.getGrid();

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    this.createTile(row, col, value);
                }
            }
        }
    }

    /**
     * 创建方块元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方块值
     * @param {boolean} isNew - 是否为新方块
     */
    createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;

        if (isNew) {
            tile.classList.add('tile-new');
        }

        tile.textContent = value.toString();

        // 设置位置
        this.setTilePosition(tile, row, col);

        this.gameGrid.appendChild(tile);

        return tile;
    }

    /**
     * 设置方块位置
     * @param {HTMLElement} tile - 方块元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     */
    setTilePosition(tile, row, col) {
        const cellSize = 90; // 方块大小
        const gap = 8; // 间隙大小

        const x = col * (cellSize + gap) + gap;
        const y = row * (cellSize + gap) + gap;

        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
    }

    /**
     * 更新游戏状态显示
     */
    updateGameStatus() {
        const status = this.gameState.getGameStatus();

        switch (status) {
            case 'won':
                this.showWin();
                break;
            case 'lost':
                this.showGameOver();
                break;
            case 'playing':
                this.hideMessage();
                break;
        }
    }

    /**
     * 显示游戏结束界面
     */
    showGameOver() {
        const finalScore = this.gameState.getScore();

        this.showMessage(
            '游戏结束!',
            `最终分数: ${finalScore}`,
            [
                { text: '重新开始', action: () => this.restartGame() }
            ]
        );
    }

    /**
     * 显示胜利界面
     */
    showWin() {
        const finalScore = this.gameState.getScore();

        this.showMessage(
            '恭喜获胜!',
            `你达到了2048! 分数: ${finalScore}`,
            [
                { text: '继续游戏', action: () => this.continueGame() },
                { text: '重新开始', action: () => this.restartGame() }
            ]
        );
    }

    /**
     * 显示消息界面
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @param {Array} buttons - 按钮配置数组
     */
    showMessage(title, message, buttons = []) {
        if (!this.gameMessage) {
            return;
        }

        // 创建消息内容
        this.gameMessage.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="message-buttons">
                ${buttons.map((btn, index) =>
            `<button data-action="${index}">${btn.text}</button>`
        ).join('')}
            </div>
        `;

        // 绑定按钮事件
        const buttonElements = this.gameMessage.querySelectorAll('button[data-action]');
        buttonElements.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (buttons[index] && buttons[index].action) {
                    buttons[index].action();
                }
            });
        });

        // 显示消息
        this.gameMessage.style.display = 'flex';
    }

    /**
     * 隐藏消息界面
     */
    hideMessage() {
        if (this.gameMessage) {
            this.gameMessage.style.display = 'none';
        }
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        this.hideMessage();
        this.gameState.reset();
        this.render();
    }

    /**
     * 继续游戏（胜利后）
     */
    continueGame() {
        this.hideMessage();
        this.gameState.setGameStatus('playing');
    }

    /**
     * 执行移动动画
     * @param {string} direction - 移动方向
     * @returns {Promise} 动画完成的Promise
     */
    async animateMove(direction) {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        try {
            // 执行移动
            const moved = this.gameEngine.move(direction);

            if (moved) {
                // 重新渲染界面
                this.render();

                // 等待动画完成
                await this.waitForAnimation();
            }
        } catch (error) {
            console.error('移动动画出错:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * 等待动画完成
     * @returns {Promise} 动画完成的Promise
     */
    waitForAnimation() {
        return new Promise(resolve => {
            setTimeout(resolve, this.animationDuration);
        });
    }

    /**
     * 处理方块合并动画
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     */
    animateMerge(row, col) {
        const tiles = this.gameGrid.querySelectorAll('.tile');

        tiles.forEach(tile => {
            const tileRow = Math.floor(parseInt(tile.style.top) / 98);
            const tileCol = Math.floor(parseInt(tile.style.left) / 98);

            if (tileRow === row && tileCol === col) {
                tile.classList.add('tile-merged');

                // 移除动画类
                setTimeout(() => {
                    tile.classList.remove('tile-merged');
                }, this.animationDuration);
            }
        });
    }

    /**
     * 获取UI控制器状态
     * @returns {Object} 状态信息
     */
    getUIStatus() {
        return {
            isAnimating: this.isAnimating,
            animationDuration: this.animationDuration,
            hasGameGrid: !!this.gameGrid,
            gameStatus: this.gameState.getGameStatus()
        };
    }

    /**
     * 设置动画持续时间
     * @param {number} duration - 动画持续时间（毫秒）
     */
    setAnimationDuration(duration) {
        this.animationDuration = Math.max(50, duration);
    }
}