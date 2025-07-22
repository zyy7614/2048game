/**
 * InputHandler类 - 处理用户输入（键盘和触摸）
 * 负责监听和处理用户的操作输入
 */
class InputHandler {
    constructor(callback) {
        this.callback = callback; // 移动回调函数
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30; // 最小滑动距离
        this.isProcessing = false; // 防止重复处理

        this.init();
    }

    /**
     * 初始化输入处理器
     */
    init() {
        this.bindKeyboard();
        this.bindTouch();
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboard() {
        document.addEventListener('keydown', (event) => {
            if (this.isProcessing) {
                return;
            }

            let direction = null;

            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    break;
                default:
                    return; // 不处理其他按键
            }

            if (direction) {
                event.preventDefault();
                this.handleMove(direction);
            }
        });
    }

    /**
     * 绑定触摸事件
     */
    bindTouch() {
        const gameGrid = document.getElementById('game-grid');

        if (!gameGrid) {
            return;
        }

        // 触摸开始
        gameGrid.addEventListener('touchstart', (event) => {
            event.preventDefault();

            if (event.touches.length === 1) {
                const touch = event.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }
        }, { passive: false });

        // 触摸移动（可选，用于实时反馈）
        gameGrid.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });

        // 触摸结束
        gameGrid.addEventListener('touchend', (event) => {
            event.preventDefault();

            if (this.isProcessing) {
                return;
            }

            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                this.touchEndX = touch.clientX;
                this.touchEndY = touch.clientY;

                const direction = this.detectSwipe();
                if (direction) {
                    this.handleMove(direction);
                }
            }
        }, { passive: false });

        // 鼠标事件（用于桌面测试）
        let mouseStartX = 0;
        let mouseStartY = 0;
        let isMouseDown = false;

        gameGrid.addEventListener('mousedown', (event) => {
            event.preventDefault();
            isMouseDown = true;
            mouseStartX = event.clientX;
            mouseStartY = event.clientY;
        });

        gameGrid.addEventListener('mouseup', (event) => {
            event.preventDefault();

            if (!isMouseDown || this.isProcessing) {
                isMouseDown = false;
                return;
            }

            isMouseDown = false;

            const deltaX = event.clientX - mouseStartX;
            const deltaY = event.clientY - mouseStartY;

            const direction = this.detectSwipeFromDeltas(deltaX, deltaY);
            if (direction) {
                this.handleMove(direction);
            }
        });

        // 防止拖拽
        gameGrid.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });
    }

    /**
     * 检测滑动方向
     * @returns {string|null} 滑动方向或null
     */
    detectSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        return this.detectSwipeFromDeltas(deltaX, deltaY);
    }

    /**
     * 根据位移量检测滑动方向
     * @param {number} deltaX - X轴位移
     * @param {number} deltaY - Y轴位移
     * @returns {string|null} 滑动方向或null
     */
    detectSwipeFromDeltas(deltaX, deltaY) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // 检查是否达到最小滑动距离
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            return null;
        }

        // 确定主要滑动方向
        if (absDeltaX > absDeltaY) {
            // 水平滑动
            return deltaX > 0 ? 'right' : 'left';
        } else {
            // 垂直滑动
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    /**
     * 处理移动操作
     * @param {string} direction - 移动方向
     */
    handleMove(direction) {
        if (this.isProcessing) {
            return;
        }

        // 设置处理标志，防止重复操作
        this.isProcessing = true;

        // 调用回调函数
        if (this.callback && typeof this.callback === 'function') {
            try {
                this.callback(direction);
            } catch (error) {
                console.error('移动处理回调出错:', error);
            }
        }

        // 短暂延迟后重置处理标志
        setTimeout(() => {
            this.isProcessing = false;
        }, 100);
    }

    /**
     * 设置移动回调函数
     * @param {Function} callback - 新的回调函数
     */
    setCallback(callback) {
        this.callback = callback;
    }

    /**
     * 设置最小滑动距离
     * @param {number} distance - 最小滑动距离（像素）
     */
    setMinSwipeDistance(distance) {
        this.minSwipeDistance = Math.max(10, distance);
    }

    /**
     * 销毁输入处理器（清理事件监听器）
     */
    destroy() {
        // 注意：在实际应用中，应该保存事件监听器的引用以便正确移除
        // 这里简化处理，实际项目中建议改进
        document.removeEventListener('keydown', this.handleKeyboard);

        const gameGrid = document.getElementById('game-grid');
        if (gameGrid) {
            gameGrid.removeEventListener('touchstart', this.handleTouchStart);
            gameGrid.removeEventListener('touchmove', this.handleTouchMove);
            gameGrid.removeEventListener('touchend', this.handleTouchEnd);
            gameGrid.removeEventListener('mousedown', this.handleMouseDown);
            gameGrid.removeEventListener('mouseup', this.handleMouseUp);
            gameGrid.removeEventListener('dragstart', this.handleDragStart);
        }
    }

    /**
     * 获取输入处理器状态
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            minSwipeDistance: this.minSwipeDistance,
            hasCallback: typeof this.callback === 'function'
        };
    }
}