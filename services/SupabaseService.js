// Supabase数据服务
import { RetryManager, CacheManager } from './Utils.js';

export class SupabaseService {
    constructor() {
        this.SUPABASE_URL = 'https://oldqgyflcveawfxopqgn.supabase.co';
        this.SUPABASE_KEY = 'sb_publishable_xo2kwCcjhNv7KrJ1z79Maw_e-Debb6n';
        this.cache = new CacheManager(5 * 60 * 1000); // 5 分钟缓存
        this.requestTimeout = 10000; // 10 秒超时
    }

    // 带超时的 fetch
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            throw error;
        }
    }

    // 分类错误
    classifyError(error) {
        if (error.message.includes('超时')) return 'timeout';
        if (error.message.includes('Failed to fetch')) return 'network';
        if (error.message.includes('HTTP 401')) return 'auth';
        if (error.message.includes('HTTP 403')) return 'forbidden';
        if (error.message.includes('HTTP 404')) return 'notfound';
        if (error.message.includes('HTTP 5')) return 'server';
        return 'unknown';
    }

    async fetchPosts() {
        // 检查缓存
        const cached = this.cache.get('posts');
        if (cached) return cached;

        try {
            const response = await RetryManager.retry(
                () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/rest/v1/posts?select=*&order=timestamp.desc`,
                    {
                        headers: {
                            'apikey': this.SUPABASE_KEY,
                            'Authorization': `Bearer ${this.SUPABASE_KEY}`
                        }
                    }
                ),
                3,
                1000
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.cache.set('posts', data);
            return data;
        } catch(e) {
            const errorType = this.classifyError(e);
            console.error('Fetch posts error:', errorType, e);
            throw new Error(this.getUserFriendlyMessage(errorType));
        }
    }

    async insertPost(post) {
        try {
            const response = await RetryManager.retry(
                () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/rest/v1/posts`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': this.SUPABASE_KEY,
                            'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(post)
                    }
                ),
                2,
                1000
            );

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const responseText = await response.text();
            const result = responseText ? JSON.parse(responseText) : null;
            
            // 清除缓存
            this.cache.delete('posts');
            return result;
        } catch(e) {
            const errorType = this.classifyError(e);
            console.error('Insert post error:', errorType, e);
            throw new Error(this.getUserFriendlyMessage(errorType));
        }
    }

    async uploadImage(file) {
        try {
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('图片大小不能超过5MB');
            }

            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const ext = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomStr}.${ext}`;
            
            const response = await RetryManager.retry(
                () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/storage/v1/object/post-images/${fileName}`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': this.SUPABASE_KEY,
                            'Authorization': `Bearer ${this.SUPABASE_KEY}`
                        },
                        body: file
                    }
                ),
                2,
                1000
            );
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Upload failed: ${error}`);
            }
            
            return `${this.SUPABASE_URL}/storage/v1/object/public/post-images/${fileName}`;
        } catch(e) {
            const errorType = this.classifyError(e);
            console.error('Image upload error:', errorType, e);
            throw new Error(this.getUserFriendlyMessage(errorType));
        }
    }

    getUserFriendlyMessage(errorType) {
        const messages = {
            'timeout': '网络连接超时，请检查网络后重试',
            'network': '网络连接失败，请检查网络设置',
            'auth': '认证失败，请刷新页面重试',
            'forbidden': '没有权限执行此操作',
            'notfound': '请求的资源不存在',
            'server': '服务器出错，请稍后重试',
            'unknown': '发生未知错误，请稍后重试'
        };
        return messages[errorType] || messages['unknown'];
    }

    clearCache() {
        this.cache.clear();
    }
}
