/**
 * 主程序入口 - 初始化和启动2048游戏
 */

// 全局游戏实例
let gameState;
let gameEngine;
let uiController;
let inputHandler;

/**
 * 初始化游戏
 */
function initGame() {
    try {
        // 创建游戏状态管理器
        gameState = new GameState();

        // 创建游戏引擎
        gameEngine = new GameEngine(gameState);

        // 创建UI控制器
        uiController = new UIController(gameEngine);

        // 创建输入处理器
        inputHandler = new InputHandler((direction) => {
            handleMove(direction);
        });

        // 开始新游戏
        startNewGame();

        console.log('2048游戏初始化成功');

    } catch (error) {
        console.error('游戏初始化失败:', error);
        showError('游戏初始化失败，请刷新页面重试。');
    }
}

/**
 * 开始新游戏
 */
function startNewGame() {
    try {
        gameState.reset();
        uiController.render();
        console.log('新游戏开始');
    } catch (error) {
        console.error('开始新游戏失败:', error);
        showError('开始新游戏失败，请刷新页面重试。');
    }
}

/**
 * 处理移动操作
 * @param {string} direction - 移动方向
 */
async function handleMove(direction) {
    try {
        // 如果正在动画中，忽略输入
        if (uiController.isAnimating) {
            return;
        }

        // 如果游戏已结束，忽略输入
        const gameStatus = gameState.getGameStatus();
        if (gameStatus === 'lost') {
            return;
        }

        // 执行移动动画
        await uiController.animateMove(direction);

    } catch (error) {
        console.error('处理移动操作失败:', error);
    }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 5px;
        z-index: 1000;
        text-align: center;
        font-size: 16px;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // 5秒后自动移除错误信息
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始初始化游戏...');
    initGame();
});

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', () => {
    try {
        if (inputHandler && typeof inputHandler.destroy === 'function') {
            inputHandler.destroy();
        }
        console.log('游戏资源清理完成');
    } catch (error) {
        console.error('清理游戏资源时出错:', error);
    }
});

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    showError('游戏运行出现错误，请刷新页面重试。');
});

/**
 * 导出全局函数供调试使用
 */
window.game2048 = {
    getGameState: () => gameState,
    getGameEngine: () => gameEngine,
    getUIController: () => uiController,
    getInputHandler: () => inputHandler,
    restart: startNewGame,
    move: handleMove
};