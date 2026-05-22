// 通用工具函数
export class Utils {
    // 日期格式化（复用）
    static formatDate(dateStr) {
        if (!dateStr) return '未知日期';
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 安全的 JSON 解析
    static safeJsonParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.warn('JSON parse error:', e);
            return fallback;
        }
    }

    // 提取 Markdown 中的图片 URL
    static extractImageUrl(content) {
        if (!content) return null;
        const match = (content || '').match(/!\[.*?\]\((.*?)\)/);
        return match ? match[1] : null;
    }

    // 清理 HTML 标签
    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    // HTML 转义（防 XSS）
    static escapeHtml(str) {
        if (!str) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(str).replace(/[&<>"']/g, c => map[c]);
    }

    // 生成唯一 ID
    static generateId() {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}

// 事件管理器 - 防止内存泄漏
export class EventManager {
    constructor() {
        this.listeners = [];
    }

    on(element, event, handler, options = false) {
        if (!element) return;
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler, options });
    }

    off(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
        this.listeners = this.listeners.filter(
            l => !(l.element === element && l.event === event && l.handler === handler)
        );
    }

    offAll() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners = [];
    }

    clear() {
        this.offAll();
    }
}

// 定时器管理器 - 防止内存泄漏
export class TimerManager {
    constructor() {
        this.timers = [];
    }

    setTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        this.timers.push(id);
        return id;
    }

    setInterval(callback, interval) {
        const id = setInterval(callback, interval);
        this.timers.push(id);
        return id;
    }

    clear(id) {
        clearTimeout(id);
        clearInterval(id);
        this.timers = this.timers.filter(t => t !== id);
    }

    clearAll() {
        this.timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        this.timers = [];
    }
}

// 请求重试管理器
export class RetryManager {
    static async retry(fn, maxRetries = 3, delay = 1000, backoff = 2) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    const waitTime = delay * Math.pow(backoff, i);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        throw lastError;
    }
}

// 缓存管理器
export class CacheManager {
    constructor(ttl = 5 * 60 * 1000) { // 默认 5 分钟
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, ttl = this.ttl) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
    }

    delete(key) {
        this.cache.delete(key);
    }
}
