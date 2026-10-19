// Supabase数据服务
import { RetryManager, CacheManager } from './Utils.js';
import { SUPABASE_URL, SUPABASE_KEY } from './SupabaseConfig.js';

export class SupabaseService {
    constructor(getAccessToken) {
        this.SUPABASE_URL = SUPABASE_URL;
        this.SUPABASE_KEY = SUPABASE_KEY;
        this.getAccessToken = getAccessToken;
        this.cache = new CacheManager(5 * 60 * 1000); // 5 分钟缓存
        this.requestTimeout = 10000; // 10 秒超时
    }

    async authHeaders(extra = {}) {
        const token = await this.getAccessToken?.();
        if (!token) throw new Error('登录已过期，请重新登录');
        return {
            'apikey': this.SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            ...extra
        };
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
                async () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/rest/v1/posts?select=*&order=timestamp.desc`,
                    {
                        headers: await this.authHeaders()
                    }
                ),
                3,
                1000
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rawData = await response.json();
            const data = await Promise.all(rawData.map(post => this.signPostImages(post)));
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
                async () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/rest/v1/posts`,
                    {
                        method: 'POST',
                        headers: await this.authHeaders({
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        }),
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
                async () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/storage/v1/object/post-images/${fileName}`,
                    {
                        method: 'POST',
                        headers: await this.authHeaders(),
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
            
            // 数据库只保存稳定的内部引用，展示时再换成短期签名 URL。
            return `supabase://post-images/${fileName}`;
        } catch(e) {
            const errorType = this.classifyError(e);
            console.error('Image upload error:', errorType, e);
            throw new Error(this.getUserFriendlyMessage(errorType));
        }
    }

    async updateReaction(postId, reactions) {
        try {
            const response = await RetryManager.retry(
                async () => this.fetchWithTimeout(
                    `${this.SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`,
                    {
                        method: 'PATCH',
                        headers: await this.authHeaders({
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        }),
                        body: JSON.stringify({ reactions })
                    }
                ),
                2,
                1000
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // 清除缓存以便下次获取最新数据
            this.cache.delete('posts');
            return true;
        } catch(e) {
            const errorType = this.classifyError(e);
            console.error('Update reaction error:', errorType, e);
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

    async createSignedImageUrl(path) {
        const safePath = path.split('/').map(encodeURIComponent).join('/');
        const response = await this.fetchWithTimeout(
            `${this.SUPABASE_URL}/storage/v1/object/sign/post-images/${safePath}`,
            {
                method: 'POST',
                headers: await this.authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ expiresIn: 3600 })
            }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!data.signedURL) throw new Error('签名图片地址生成失败');
        return data.signedURL.startsWith('http')
            ? data.signedURL
            : `${this.SUPABASE_URL}/storage/v1${data.signedURL}`;
    }

    async signPostImages(post) {
        const content = post.content || '';
        const references = new Map();
        const internalPattern = /supabase:\/\/post-images\/([^\s)]+)/g;
        const legacyPattern = new RegExp(
            `${this.SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/storage/v1/object/public/post-images/([^\\s)]+)`,
            'g'
        );

        for (const match of content.matchAll(internalPattern)) {
            references.set(match[0], decodeURIComponent(match[1]));
        }
        for (const match of content.matchAll(legacyPattern)) {
            references.set(match[0], decodeURIComponent(match[1]));
        }
        if (references.size === 0) return post;

        const signed = await Promise.all(
            [...references.entries()].map(async ([source, path]) => {
                try {
                    return [source, await this.createSignedImageUrl(path)];
                } catch (error) {
                    console.warn('Failed to sign image URL:', path, error);
                    return [source, source];
                }
            })
        );

        let signedContent = content;
        signed.forEach(([source, url]) => {
            signedContent = signedContent.split(source).join(url);
        });
        return { ...post, content: signedContent };
    }

    clearCache() {
        this.cache.clear();
    }
}
