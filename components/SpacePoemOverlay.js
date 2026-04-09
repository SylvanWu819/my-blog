// 空间切换诗句提示组件
export class SpacePoemOverlay {
    render() {
        return `
            <div id="space-poem-overlay">
                <p id="space-poem-text" class="serif"></p>
            </div>
        `;
    }

    show(spaceName) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('space-poem-overlay');
            const text = document.getElementById('space-poem-text');
            
            if (!overlay || !text) {
                resolve();
                return;
            }
            
            text.textContent = spaceName;
            overlay.classList.add('show');
            
            // 动画持续时间缩短,让切换更快
            setTimeout(() => {
                overlay.classList.remove('show');
                // 淡出动画完成后resolve
                setTimeout(resolve, 400);
            }, 1200);
        });
    }
}
