/**
 * GameEngine类 - 处理游戏的核心逻辑和算法
 * 负责移动、合并算法和游戏规则的实现
 */
class GameEngine {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * 执行移动操作
     * @param {string} direction - 移动方向: 'up', 'down', 'left', 'right'
     * @returns {boolean} 是否发生了移动
     */
    move(direction) {
        if (this.gameState.getGameStatus() !== 'playing') {
            return false;
        }

        // 保存当前状态用于比较
        const originalGrid = this.gameState.getGrid().map(row => [...row]);
        const originalScore = this.gameState.getScore();

        let moved = false;
        let scoreGained = 0;

        // 根据方向处理移动
        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            default:
                return false;
        }

        // 如果发生了移动
        if (moved) {
            // 增加移动计数
            this.gameState.moveCount++;

            // 添加新方块
            this.gameState.addRandomTile();

            // 检查游戏状态
            this.updateGameStatus();
        }

        return moved;
    }

    /**
     * 向左移动
     * @returns {boolean} 是否发生移动
     */
    moveLeft() {
        let moved = false;
        const grid = this.gameState.getGrid();

        for (let row = 0; row < 4; row++) {
            const originalLine = [...grid[row]];
            const newLine = this.moveLine(originalLine);

            // 检查这一行是否发生了变化
            if (!this.arraysEqual(originalLine, newLine)) {
                moved = true;
                for (let col = 0; col < 4; col++) {
                    this.gameState.setCell(row, col, newLine[col]);
                }
            }
        }

        return moved;
    }

    /**
     * 向右移动
     * @returns {boolean} 是否发生移动
     */
    moveRight() {
        let moved = false;
        const grid = this.gameState.getGrid();

        for (let row = 0; row < 4; row++) {
            const originalLine = [...grid[row]].reverse();
            const newLine = this.moveLine(originalLine).reverse();

            if (!this.arraysEqual(grid[row], newLine)) {
                moved = true;
                for (let col = 0; col < 4; col++) {
                    this.gameState.setCell(row, col, newLine[col]);
                }
            }
        }

        return moved;
    }

    /**
     * 向上移动
     * @returns {boolean} 是否发生移动
     */
    moveUp() {
        let moved = false;
        const grid = this.gameState.getGrid();

        for (let col = 0; col < 4; col++) {
            const originalLine = [];
            for (let row = 0; row < 4; row++) {
                originalLine.push(grid[row][col]);
            }

            const newLine = this.moveLine(originalLine);

            if (!this.arraysEqual(originalLine, newLine)) {
                moved = true;
                for (let row = 0; row < 4; row++) {
                    this.gameState.setCell(row, col, newLine[row]);
                }
            }
        }

        return moved;
    }

    /**
     * 向下移动
     * @returns {boolean} 是否发生移动
     */
    moveDown() {
        let moved = false;
        const grid = this.gameState.getGrid();

        for (let col = 0; col < 4; col++) {
            const originalLine = [];
            for (let row = 3; row >= 0; row--) {
                originalLine.push(grid[row][col]);
            }

            const newLine = this.moveLine(originalLine);

            // 检查是否发生变化
            let changed = false;
            for (let i = 0; i < 4; i++) {
                if (originalLine[i] !== newLine[i]) {
                    changed = true;
                    break;
                }
            }

            if (changed) {
                moved = true;
                for (let i = 0; i < 4; i++) {
                    this.gameState.setCell(3 - i, col, newLine[i]);
                }
            }
        }

        return moved;
    }

    /**
     * 处理一行的移动和合并
     * @param {number[]} line - 要处理的行
     * @returns {number[]} 处理后的行
     */
    moveLine(line) {
        // 1. 移除零值，压缩非零元素
        const filtered = line.filter(val => val !== 0);

        // 2. 合并相同的相邻元素
        const merged = [];
        let i = 0;

        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                // 合并相同的方块
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);

                // 增加分数
                this.gameState.addScore(mergedValue);

                // 跳过下一个元素，因为已经合并了
                i += 2;
            } else {
                // 不能合并，直接添加
                merged.push(filtered[i]);
                i++;
            }
        }

        // 3. 用零填充到长度4
        while (merged.length < 4) {
            merged.push(0);
        }

        return merged;
    }

    /**
     * 检查是否还能移动
     * @returns {boolean} 是否还能移动
     */
    canMove() {
        // 如果有空位置，肯定能移动
        if (this.gameState.getEmptyCells().length > 0) {
            return true;
        }

        // 检查是否有相邻的相同方块可以合并
        const grid = this.gameState.getGrid();

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = grid[row][col];

                // 检查右边
                if (col < 3 && current === grid[row][col + 1]) {
                    return true;
                }

                // 检查下面
                if (row < 3 && current === grid[row + 1][col]) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 更新游戏状态
     */
    updateGameStatus() {
        // 检查是否获胜
        if (this.gameState.hasWon() && this.gameState.getGameStatus() === 'playing') {
            this.gameState.setGameStatus('won');
            return;
        }

        // 检查是否游戏结束
        if (!this.canMove()) {
            this.gameState.setGameStatus('lost');
            return;
        }

        // 游戏继续
        this.gameState.setGameStatus('playing');
    }

    /**
     * 比较两个数组是否相等
     * @param {Array} arr1 - 第一个数组
     * @param {Array} arr2 - 第二个数组
     * @returns {boolean} 数组是否相等
     */
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取游戏引擎状态信息
     * @returns {Object} 状态信息
     */
    getEngineInfo() {
        return {
            canMove: this.canMove(),
            emptyCells: this.gameState.getEmptyCells().length,
            gameStatus: this.gameState.getGameStatus()
        };
    }
}