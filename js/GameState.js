/**
 * GameState类 - 管理游戏的核心状态数据
 * 负责网格数据、分数和游戏状态的管理
 */
class GameState {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.status = 'playing'; // 'playing', 'won', 'lost'
        this.bestScore = this.loadBestScore();
        this.moveCount = 0;
        this.previousState = null; // 用于撤销功能（如果需要）
    }

    /**
     * 获取游戏网格
     * @returns {number[][]} 4x4网格数组
     */
    getGrid() {
        return this.grid;
    }

    /**
     * 获取当前分数
     * @returns {number} 当前分数
     */
    getScore() {
        return this.score;
    }

    /**
     * 获取游戏状态
     * @returns {string} 游戏状态: 'playing', 'won', 'lost'
     */
    getGameStatus() {
        return this.status;
    }

    /**
     * 获取最高分
     * @returns {number} 最高分
     */
    getBestScore() {
        return this.bestScore;
    }

    /**
     * 设置指定位置的方块值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} value - 方块值
     */
    setCell(row, col, value) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col] = value;
        }
    }

    /**
     * 获取指定位置的方块值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 方块值
     */
    getCell(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col];
        }
        return 0;
    }

    /**
     * 设置整个网格
     * @param {number[][]} newGrid - 新的网格数据
     */
    setGrid(newGrid) {
        if (newGrid && newGrid.length === 4 && newGrid[0].length === 4) {
            this.grid = newGrid.map(row => [...row]);
        }
    }

    /**
     * 增加分数
     * @param {number} points - 要增加的分数
     */
    addScore(points) {
        this.score += points;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
    }

    /**
     * 设置游戏状态
     * @param {string} status - 新的游戏状态
     */
    setGameStatus(status) {
        this.status = status;
    }

    /**
     * 重置游戏到初始状态
     */
    reset() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.status = 'playing';
        this.moveCount = 0;
        this.previousState = null;

        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
    }

    /**
     * 在随机空位置添加新方块
     * @returns {boolean} 是否成功添加方块
     */
    addRandomTile() {
        const emptyCells = this.getEmptyCells();

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4; // 90% 概率生成2，10% 概率生成4
            this.setCell(randomCell.row, randomCell.col, value);
            return true;
        }

        return false;
    }

    /**
     * 获取所有空位置
     * @returns {Array} 空位置数组
     */
    getEmptyCells() {
        const emptyCells = [];

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        return emptyCells;
    }

    /**
     * 检查游戏是否结束
     * @returns {boolean} 游戏是否结束
     */
    isGameOver() {
        // 如果还有空位置，游戏未结束
        if (this.getEmptyCells().length > 0) {
            return false;
        }

        // 检查是否还能合并
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.grid[row][col];

                // 检查右边是否可以合并
                if (col < 3 && current === this.grid[row][col + 1]) {
                    return false;
                }

                // 检查下面是否可以合并
                if (row < 3 && current === this.grid[row + 1][col]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 检查是否获胜（达到2048）
     * @returns {boolean} 是否获胜
     */
    hasWon() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 验证位置是否有效
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 位置是否有效
     */
    isValidPosition(row, col) {
        return row >= 0 && row < 4 && col >= 0 && col < 4;
    }

    /**
     * 保存当前状态（用于撤销功能）
     */
    saveState() {
        this.previousState = {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            status: this.status,
            moveCount: this.moveCount
        };
    }

    /**
     * 从本地存储加载最高分
     * @returns {number} 最高分
     */
    loadBestScore() {
        try {
            const saved = localStorage.getItem('2048-best-score');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * 保存最高分到本地存储
     */
    saveBestScore() {
        try {
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        } catch (e) {
            // 忽略存储错误
        }
    }

    /**
     * 获取游戏统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            score: this.score,
            bestScore: this.bestScore,
            moveCount: this.moveCount,
            status: this.status
        };
    }
}

// 支持Node.js模块导出（用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}