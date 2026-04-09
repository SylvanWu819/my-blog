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
            
            text.textContent = spaceName;
            overlay.classList.add('show');
            
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(resolve, 600);
            }, 1800);
        });
    }
}
