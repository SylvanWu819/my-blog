// 加载动画组件
export class Loader {
    constructor() {
        this.isRemoved = false;
        this.element = null;
    }

    render() {
        return `
            <div id="loader">
                <div class="libra-container">
                    <svg class="libra-svg text-gray-400 mb-8" viewBox="0 0 24 24">
                        <path d="M12 5v14M9 21h6" opacity="0.5"/>
                        <g class="libra-beam">
                            <path d="M4 10h16" />
                            <g class="libra-pan-l">
                                <path d="M4 10l-1 4h2l-1-4z" fill="currentColor" opacity="0.2"/>
                                <path d="M2 14h4" />
                            </g>
                            <g class="libra-pan-r">
                                <path d="M20 10l-1 4h2l-1-4z" fill="currentColor" opacity="0.2"/>
                                <path d="M18 14h4" />
                            </g>
                        </g>
                    </svg>
                </div>
                <div class="flex flex-col items-center space-y-4">
                    <p id="loader-status" class="text-[10px] tracking-[0.5em] uppercase opacity-40 serif sync-active">Connecting Cloud</p>
                    <button id="skip-btn" class="text-[9px] border border-gray-200 dark:border-zinc-800 px-6 py-2 rounded-full opacity-40 hover:opacity-100 transition-all uppercase tracking-widest">Skip</button>
                </div>
            </div>
        `;
    }

    dismiss(reason = "Ready", immediate = false) {
        if (this.isRemoved) return;
        this.isRemoved = true;
        
        const loader = document.getElementById('loader');
        const status = document.getElementById('loader-status');
        if (status) status.innerText = reason;
        
        if (immediate) {
            loader.classList.add('stopped');
        }
        
        setTimeout(() => {
            loader.classList.add('stopped');
            loader.classList.add('fade-out');
            setTimeout(() => { 
                loader.style.display = 'none';
                loader.remove();
            }, 1200);
        }, immediate ? 0 : 1500);
    }

    bindEvents() {
        document.getElementById('skip-btn')?.addEventListener('click', () => {
            this.dismiss('Manual Skip', true);
        });
    }
}
