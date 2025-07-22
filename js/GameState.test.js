/**
 * GameState类的单元测试
 */

// 模拟localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// 导入GameState类
const GameState = require('./GameState.js');

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        // 重置localStorage模拟
        localStorageMock.getItem.mockReset();
        localStorageMock.setItem.mockReset();
        localStorageMock.clear.mockReset();

        // 默认返回null（没有保存的最高分）
        localStorageMock.getItem.mockReturnValue(null);

        // 创建新的GameState实例
        gameState = new GameState();
    });

    describe('构造函数和初始状态', () => {
        test('应该创建4x4的空网格', () => {
            const grid = gameState.getGrid();
            expect(grid).toHaveLength(4);
            expect(grid[0]).toHaveLength(4);

            // 检查所有位置都是0
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    expect(grid[row][col]).toBe(0);
                }
            }
        });

        test('应该初始化分数为0', () => {
            expect(gameState.getScore()).toBe(0);
        });

        test('应该初始化游戏状态为playing', () => {
            expect(gameState.getGameStatus()).toBe('playing');
        });

        test('应该从localStorage加载最高分', () => {
            // 重新设置mock并创建新实例
            localStorageMock.getItem.mockReturnValue('1000');
            const newGameState = new GameState();
            expect(newGameState.getBestScore()).toBe(1000);
        });
    });

    describe('网格操作方法', () => {
        test('setCell应该设置指定位置的值', () => {
            gameState.setCell(0, 0, 2);
            expect(gameState.getCell(0, 0)).toBe(2);
        });

        test('getCell应该返回指定位置的值', () => {
            gameState.setCell(1, 2, 4);
            expect(gameState.getCell(1, 2)).toBe(4);
        });

        test('setCell应该验证位置边界', () => {
            gameState.setCell(-1, 0, 2);
            gameState.setCell(0, -1, 2);
            gameState.setCell(4, 0, 2);
            gameState.setCell(0, 4, 2);

            // 无效位置不应该改变网格
            const grid = gameState.getGrid();
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    expect(grid[row][col]).toBe(0);
                }
            }
        });

        test('getCell应该对无效位置返回0', () => {
            expect(gameState.getCell(-1, 0)).toBe(0);
            expect(gameState.getCell(0, -1)).toBe(0);
            expect(gameState.getCell(4, 0)).toBe(0);
            expect(gameState.getCell(0, 4)).toBe(0);
        });

        test('setGrid应该设置整个网格', () => {
            const newGrid = [
                [2, 4, 0, 0],
                [0, 0, 8, 0],
                [0, 0, 0, 16],
                [0, 0, 0, 0]
            ];

            gameState.setGrid(newGrid);
            expect(gameState.getGrid()).toEqual(newGrid);
        });
    });

    describe('分数管理', () => {
        test('addScore应该增加分数', () => {
            gameState.addScore(100);
            expect(gameState.getScore()).toBe(100);

            gameState.addScore(50);
            expect(gameState.getScore()).toBe(150);
        });

        test('addScore应该更新最高分', () => {
            // 创建一个新的GameState实例来避免之前测试的影响
            const freshGameState = new GameState();
            freshGameState.addScore(500);
            expect(freshGameState.getBestScore()).toBe(500);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('2048-best-score', '500');
        });

        test('addScore不应该降低最高分', () => {
            gameState.addScore(1000);
            const bestScore = gameState.getBestScore();

            gameState.addScore(-500); // 这不应该发生，但测试边界情况
            expect(gameState.getBestScore()).toBe(bestScore);
        });
    });

    describe('游戏状态管理', () => {
        test('setGameStatus应该设置游戏状态', () => {
            gameState.setGameStatus('won');
            expect(gameState.getGameStatus()).toBe('won');

            gameState.setGameStatus('lost');
            expect(gameState.getGameStatus()).toBe('lost');
        });

        test('reset应该重置游戏到初始状态', () => {
            // 设置一些状态
            gameState.setCell(0, 0, 2);
            gameState.addScore(100);
            gameState.setGameStatus('won');

            // 重置游戏
            gameState.reset();

            expect(gameState.getScore()).toBe(0);
            expect(gameState.getGameStatus()).toBe('playing');

            // 检查网格中应该有两个随机方块
            let tileCount = 0;
            const grid = gameState.getGrid();
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    if (grid[row][col] !== 0) {
                        tileCount++;
                        expect([2, 4]).toContain(grid[row][col]);
                    }
                }
            }
            expect(tileCount).toBe(2);
        });
    });

    describe('随机方块生成', () => {
        test('addRandomTile应该在空位置添加方块', () => {
            const result = gameState.addRandomTile();
            expect(result).toBe(true);

            // 检查是否添加了一个方块
            let tileCount = 0;
            const grid = gameState.getGrid();
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    if (grid[row][col] !== 0) {
                        tileCount++;
                        expect([2, 4]).toContain(grid[row][col]);
                    }
                }
            }
            expect(tileCount).toBe(1);
        });

        test('addRandomTile在网格满时应该返回false', () => {
            // 填满网格
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    gameState.setCell(row, col, 2);
                }
            }

            const result = gameState.addRandomTile();
            expect(result).toBe(false);
        });

        test('getEmptyCells应该返回所有空位置', () => {
            gameState.setCell(0, 0, 2);
            gameState.setCell(1, 1, 4);

            const emptyCells = gameState.getEmptyCells();
            expect(emptyCells).toHaveLength(14); // 16 - 2 = 14

            // 检查返回的位置确实是空的
            emptyCells.forEach(cell => {
                expect(gameState.getCell(cell.row, cell.col)).toBe(0);
            });
        });
    });

    describe('游戏状态检查', () => {
        test('hasWon应该在有2048方块时返回true', () => {
            gameState.setCell(0, 0, 2048);
            expect(gameState.hasWon()).toBe(true);
        });

        test('hasWon应该在没有2048方块时返回false', () => {
            gameState.setCell(0, 0, 1024);
            gameState.setCell(0, 1, 1024);
            expect(gameState.hasWon()).toBe(false);
        });

        test('isGameOver应该在有空位置时返回false', () => {
            gameState.setCell(0, 0, 2);
            expect(gameState.isGameOver()).toBe(false);
        });

        test('isGameOver应该在可以合并时返回false', () => {
            // 填满网格但留下可合并的方块
            const grid = [
                [2, 4, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2, 4],
                [8, 16, 2, 2]
            ];
            gameState.setGrid(grid);

            expect(gameState.isGameOver()).toBe(false); // 最后一行有相邻的2
        });

        test('isGameOver应该在无法移动时返回true', () => {
            // 创建无法移动的网格
            const grid = [
                [2, 4, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2048, 4096],
                [8192, 16384, 32768, 65536]
            ];
            gameState.setGrid(grid);

            expect(gameState.isGameOver()).toBe(true);
        });
    });

    describe('辅助方法', () => {
        test('isValidPosition应该验证位置', () => {
            expect(gameState.isValidPosition(0, 0)).toBe(true);
            expect(gameState.isValidPosition(3, 3)).toBe(true);
            expect(gameState.isValidPosition(-1, 0)).toBe(false);
            expect(gameState.isValidPosition(0, -1)).toBe(false);
            expect(gameState.isValidPosition(4, 0)).toBe(false);
            expect(gameState.isValidPosition(0, 4)).toBe(false);
        });

        test('getStats应该返回游戏统计信息', () => {
            // 创建一个新的GameState实例来避免之前测试的影响
            const freshGameState = new GameState();
            freshGameState.addScore(100);
            freshGameState.setGameStatus('playing');

            const stats = freshGameState.getStats();
            expect(stats).toEqual({
                score: 100,
                bestScore: 100,
                moveCount: 0,
                status: 'playing'
            });
        });

        test('saveState应该保存当前状态', () => {
            gameState.setCell(0, 0, 2);
            gameState.addScore(100);
            gameState.saveState();

            // 修改状态
            gameState.setCell(0, 1, 4);
            gameState.addScore(50);

            // 验证之前的状态被保存
            expect(gameState.previousState).toBeDefined();
            expect(gameState.previousState.score).toBe(100);
            expect(gameState.previousState.grid[0][0]).toBe(2);
            expect(gameState.previousState.grid[0][1]).toBe(0);
        });
    });

    describe('localStorage错误处理', () => {
        test('应该处理localStorage读取错误', () => {
            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const newGameState = new GameState();
            expect(newGameState.getBestScore()).toBe(0);
        });

        test('应该处理localStorage写入错误', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            // 这不应该抛出错误
            expect(() => {
                gameState.addScore(100);
            }).not.toThrow();
        });
    });
});