// Supabase数据服务
export class SupabaseService {
    constructor() {
        this.SUPABASE_URL = 'https://oldqgyflcveawfxopqgn.supabase.co';
        this.SUPABASE_KEY = 'sb_publishable_xo2kwCcjhNv7KrJ1z79Maw_e-Debb6n';
    }

    async fetchPosts() {
        try {
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/posts?select=*&order=timestamp.desc`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch(e) {
            console.error('Fetch posts error:', e);
            return null;
        }
    }

    async insertPost(post) {
        try {
            console.log('Inserting post:', post);
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/posts`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(post)
            });
            
            console.log('Insert response status:', response.status);
            const responseText = await response.text();
            console.log('Insert response body:', responseText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
            
            return responseText ? JSON.parse(responseText) : null;
        } catch(e) {
            console.error('Insert post error:', e);
            throw e;
        }
    }

    async updateReaction(postId, reactions) {
        try {
            console.log('Updating reaction in database:', { postId, reactions });
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ reactions })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to update reaction:', response.status, errorText);
                return false;
            }
            
            console.log('Reaction updated successfully');
            return true;
        } catch(e) {
            console.error('Update reaction error:', e);
            return false;
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
            
            const response = await fetch(`${this.SUPABASE_URL}/storage/v1/object/post-images/${fileName}`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                },
                body: file
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Upload failed: ${error}`);
            }
            
            return `${this.SUPABASE_URL}/storage/v1/object/public/post-images/${fileName}`;
        } catch(e) {
            console.error('Image upload error:', e);
            throw e;
        }
    }
}
