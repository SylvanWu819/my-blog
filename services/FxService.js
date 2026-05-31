// 华丽交互特效服务 (Premium FX)
// 极光视差 / 卡片 3D 倾斜 + 聚光灯 / 磁吸按钮
// 全部基于 transform & CSS 变量, GPU 加速, 移动端与 reduced-motion 自动降级

export class FxService {
    constructor() {
        this.auroraEl = null;
        this.rafPending = false;
        this.pointer = { x: 0.5, y: 0.5 };
        this.boundPointerMove = null;
        this.cardCleanups = [];
        this.magnetCleanups = [];

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        // 触摸设备 / 偏好减弱动效: 仅保留静态极光, 跳过指针特效
        this.interactive = !reduced && !coarse;
    }

    init() {
        this.mountAurora();
        if (this.interactive) {
            this.bindPointerParallax();
        }
        // 卡片与按钮特效在内容渲染后由 refresh() 触发
        this.refresh();
    }

    mountAurora() {
        if (document.querySelector('.fx-aurora')) {
            this.auroraEl = document.querySelector('.fx-aurora');
            return;
        }
        const el = document.createElement('div');
        el.className = 'fx-aurora';
        el.setAttribute('aria-hidden', 'true');
        document.body.prepend(el);
        this.auroraEl = el;
    }

    bindPointerParallax() {
        this.boundPointerMove = (e) => {
            this.pointer.x = e.clientX / window.innerWidth;
            this.pointer.y = e.clientY / window.innerHeight;
            if (!this.rafPending) {
                this.rafPending = true;
                requestAnimationFrame(() => {
                    document.documentElement.style.setProperty('--cursor-x', (this.pointer.x - 0.5).toFixed(3));
                    document.documentElement.style.setProperty('--cursor-y', (this.pointer.y - 0.5).toFixed(3));
                    this.rafPending = false;
                });
            }
        };
        window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    }

    // 内容更新后调用: 重新绑定卡片与按钮特效
    refresh() {
        if (this.interactive) {
            this.bindCardTilt();
        }
        this.bindMagnetButtons();
    }

    bindCardTilt() {
        // 清理旧绑定
        this.cardCleanups.forEach(fn => fn());
        this.cardCleanups = [];

        const MAX = 9; // 最大倾斜角度
        document.querySelectorAll('.post-card').forEach(card => {
            const inner = card.querySelector('.post-card-inner');
            if (!inner) return;

            let raf = null;

            const onMove = (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    const rx = (0.5 - py) * MAX;
                    const ry = (px - 0.5) * MAX;
                    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
                    // 聚光灯位置
                    inner.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
                    inner.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
                });
            };

            const onLeave = () => {
                if (raf) cancelAnimationFrame(raf);
                card.style.transform = '';
                inner.style.removeProperty('--mx');
                inner.style.removeProperty('--my');
            };

            card.addEventListener('pointermove', onMove, { passive: true });
            card.addEventListener('pointerleave', onLeave, { passive: true });
            this.cardCleanups.push(() => {
                card.removeEventListener('pointermove', onMove);
                card.removeEventListener('pointerleave', onLeave);
                onLeave();
            });
        });
    }

    bindMagnetButtons() {
        this.magnetCleanups.forEach(fn => fn());
        this.magnetCleanups = [];
        if (!this.interactive) return;

        const selectors = '#nav-write, #pub-btn, #nav-theme, #load-more-btn, #back-btn';
        document.querySelectorAll(selectors).forEach(btn => {
            const STR = 0.35; // 吸附强度
            let raf = null;

            const onMove = (e) => {
                const rect = btn.getBoundingClientRect();
                const mx = e.clientX - (rect.left + rect.width / 2);
                const my = e.clientY - (rect.top + rect.height / 2);
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    btn.style.transform = `translate(${(mx * STR).toFixed(2)}px, ${(my * STR).toFixed(2)}px)`;
                });
            };
            const onLeave = () => {
                if (raf) cancelAnimationFrame(raf);
                btn.style.transform = '';
            };

            btn.addEventListener('pointermove', onMove, { passive: true });
            btn.addEventListener('pointerleave', onLeave, { passive: true });
            this.magnetCleanups.push(() => {
                btn.removeEventListener('pointermove', onMove);
                btn.removeEventListener('pointerleave', onLeave);
                onLeave();
            });
        });
    }

    destroy() {
        if (this.boundPointerMove) {
            window.removeEventListener('pointermove', this.boundPointerMove);
        }
        this.cardCleanups.forEach(fn => fn());
        this.magnetCleanups.forEach(fn => fn());
        this.cardCleanups = [];
        this.magnetCleanups = [];
    }
}
