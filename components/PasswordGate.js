// ============================================================
// Supabase Auth 登录门。密码由 Supabase 校验，不进入源码或本地存储。
// ============================================================

export class PasswordGate {
    /**
     * @param {Object} opts
     * @param {Object} opts.authService - Supabase Auth 服务
     * @param {Function} opts.onUnlock  - 验证通过后的回调
     */
    constructor({ authService, onUnlock }) {
        this.authService = authService;
        this.onUnlock = onUnlock;
        this.el = null;
    }

    // 入口: 已解锁则直接放行, 否则显示遮罩。返回 Promise, resolve 时代表已解锁
    async guard() {
        const session = await this.authService.getValidSession();
        return new Promise(resolve => {
            if (session) {
                resolve();
                if (this.onUnlock) this.onUnlock();
                return;
            }
            this.mount(() => {
                resolve();
                if (this.onUnlock) this.onUnlock();
            });
        });
    }

    mount(done) {
        const wrap = document.createElement('div');
        wrap.id = 'password-gate';
        wrap.innerHTML = `
            <div class="gate-aurora" aria-hidden="true"></div>
            <div class="gate-card">
                <div class="gate-mark serif">天秤书</div>
                <p class="gate-sub">LibraNote · 私人空间</p>
                <form class="gate-form" autocomplete="off">
                    <div class="gate-field">
                        <div class="gate-inputs">
                            <input id="gate-email" class="gate-input" type="email"
                                   placeholder="邮箱" aria-label="登录邮箱" autocomplete="username" required />
                            <input id="gate-password" class="gate-input" type="password"
                                   placeholder="密码" aria-label="登录密码" autocomplete="current-password" required />
                        </div>
                        <button type="submit" class="gate-enter" aria-label="进入">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                    </div>
                    <p class="gate-error" aria-live="polite"></p>
                </form>
            </div>
        `;
        document.body.appendChild(wrap);
        this.el = wrap;
        // 锁住背景滚动
        document.documentElement.style.overflow = 'hidden';

        const emailInput = wrap.querySelector('#gate-email');
        const passwordInput = wrap.querySelector('#gate-password');
        const form = wrap.querySelector('.gate-form');
        const submit = wrap.querySelector('.gate-enter');
        const errEl = wrap.querySelector('.gate-error');
        const card = wrap.querySelector('.gate-card');

        requestAnimationFrame(() => {
            wrap.classList.add('show');
            emailInput.focus();
        });

        const fail = (msg) => {
            errEl.textContent = msg;
            card.classList.remove('shake');
            void card.offsetWidth; // 重启动画
            card.classList.add('shake');
            passwordInput.select();
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                fail('请输入邮箱和密码');
                return;
            }
            submit.disabled = true;
            errEl.textContent = '正在验证…';
            try {
                await this.authService.signIn(email, password);
                this.unlock(done);
            } catch (error) {
                fail(error.message || '登录失败');
            } finally {
                submit.disabled = false;
            }
        });
    }

    unlock(done) {
        if (!this.el) { if (done) done(); return; }
        this.el.classList.add('unlocked');
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            this.el?.remove();
            this.el = null;
            if (done) done();
        }, 700);
    }
}
