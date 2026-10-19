import { SUPABASE_URL, SUPABASE_KEY } from './SupabaseConfig.js';

// 使用 Supabase Auth 的邮箱/密码登录。
// 会话只保存在当前浏览器标签页；关闭标签页后需要重新登录。
export class AuthService {
    constructor() {
        this.storageKey = 'libra_auth_session';
        this.session = this.readSession();
        this.refreshPromise = null;
    }

    readSession() {
        try {
            return JSON.parse(sessionStorage.getItem(this.storageKey) || 'null');
        } catch {
            sessionStorage.removeItem(this.storageKey);
            return null;
        }
    }

    saveSession(data) {
        const expiresIn = Number(data.expires_in || 3600);
        this.session = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + expiresIn * 1000,
            user: data.user || this.session?.user || null
        };
        sessionStorage.setItem(this.storageKey, JSON.stringify(this.session));
        return this.session;
    }

    clearSession() {
        this.session = null;
        sessionStorage.removeItem(this.storageKey);
    }

    async request(path, options = {}) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
            ...options,
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            // 不把 Supabase 的详细认证错误显示给访客，避免泄露账户信息。
            throw new Error(response.status === 429 ? '尝试次数过多，请稍后再试' : '邮箱或密码错误');
        }

        return response.status === 204 ? null : response.json();
    }

    async signIn(email, password) {
        const data = await this.request('/token?grant_type=password', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        return this.saveSession(data);
    }

    async refreshSession() {
        if (!this.session?.refreshToken) return null;
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = this.request('/token?grant_type=refresh_token', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: this.session.refreshToken })
        })
            .then(data => this.saveSession(data))
            .catch(() => {
                this.clearSession();
                return null;
            })
            .finally(() => {
                this.refreshPromise = null;
            });

        return this.refreshPromise;
    }

    async getValidSession() {
        if (!this.session) return null;

        // 提前一分钟刷新，避免请求途中令牌过期。
        if (this.session.expiresAt - Date.now() < 60_000) {
            await this.refreshSession();
        }
        return this.session;
    }

    async getAccessToken() {
        const session = await this.getValidSession();
        return session?.accessToken || null;
    }

    async signOut() {
        const token = this.session?.accessToken;
        try {
            if (token) {
                await this.request('/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch {
            // 即使断网或服务端登出失败，也立即清除本地会话。
        } finally {
            this.clearSession();
        }
    }
}
