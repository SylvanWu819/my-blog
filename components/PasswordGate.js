// ============================================================
// 密码门 (PasswordGate)
// ------------------------------------------------------------
// ⚠️ 重要安全声明 (务必阅读):
// 这是一个【前端密码遮罩】, 不是真正的加密 / 鉴权。
//   1. 这是纯静态站, 所有校验都在浏览器里执行, 懂技术的人按 F12
//      可直接跳过本遮罩, 或修改代码绕过。
//   2. 它【完全不保护】Supabase 里的数据 —— 任何人拿到 SupabaseService.js
//      里的公开地址和 key, 不打开本网站就能直接读取全部文章。
//   3. 它只能挡住"随便点进来看看"的普通访客, 属于心理安慰级别。
// 若需要真正"只有我能打开"并保护数据, 请使用:
//   Cloudflare Access (锁页面) + Supabase Auth/RLS (锁数据)。
//
// 这里存的是密码的 SHA-256 哈希, 而非明文 —— 这样翻源码看不到原始密码,
// 但仍【不等于】安全。默认密码: libra2024 (强烈建议改成你自己的, 见下)。
// ============================================================

export class PasswordGate {
    /**
     * @param {Object} opts
     * @param {string} opts.passwordHash - 正确密码的 SHA-256 十六进制哈希
     * @param {Function} opts.onUnlock   - 验证通过后的回调
     * @param {number}  [opts.ttlHours]  - 解锁记忆时长(小时), 默认 720(30天)
     */
    constructor({ passwordHash, onUnlock, ttlHours = 720 }) {
        this.passwordHash = (passwordHash || '').toLowerCase();
        this.onUnlock = onUnlock;
        this.ttlMs = ttlHours * 60 * 60 * 1000;
        this.storageKey = 'libra_gate_unlocked_at';
        this.el = null;
    }

    // 计算字符串的 SHA-256 哈希 (Web Crypto API)
    async sha256(text) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // 是否已在有效期内解锁过
    isUnlocked() {
        try {
            const ts = parseInt(localStorage.getItem(this.storageKey) || '0', 10);
            return ts > 0 && (Date.now() - ts) < this.ttlMs;
        } catch {
            return false;
        }
    }

    // 入口: 已解锁则直接放行, 否则显示遮罩。返回 Promise, resolve 时代表已解锁
    guard() {
        return new Promise(resolve => {
            if (this.isUnlocked()) {
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
                        <input id="gate-input" type="password" inputmode="text"
                               placeholder="输入密码" aria-label="访问密码" autocomplete="current-password" />
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

        const input = wrap.querySelector('#gate-input');
        const form = wrap.querySelector('.gate-form');
        const errEl = wrap.querySelector('.gate-error');
        const card = wrap.querySelector('.gate-card');

        requestAnimationFrame(() => {
            wrap.classList.add('show');
            input.focus();
        });

        const fail = (msg) => {
            errEl.textContent = msg;
            card.classList.remove('shake');
            void card.offsetWidth; // 重启动画
            card.classList.add('shake');
            input.select();
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = input.value.trim();
            if (!val) {
                fail('请输入密码');
                return;
            }
            let hash;
            try {
                hash = await this.sha256(val);
            } catch {
                fail('当前环境不支持校验 (需 HTTPS)');
                return;
            }
            if (hash === this.passwordHash) {
                try { localStorage.setItem(this.storageKey, String(Date.now())); } catch {}
                this.unlock(done);
            } else {
                fail('密码错误');
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
