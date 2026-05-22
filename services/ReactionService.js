// 点赞反应服务
export class ReactionService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        // 统一使用 libra_user_id，与 App 保持一致
        this.userId = this.getUserId();
    }

    getUserId() {
        let userId = localStorage.getItem('libra_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('libra_user_id', userId);
        }
        return userId;
    }

    getUserReaction(postId) {
        const reactionKey = `reaction_${postId}_${this.userId}`;
        return localStorage.getItem(reactionKey);
    }

    async toggleReaction(post, emoji) {
        const reactionKey = `reaction_${post.id}_${this.userId}`;
        const hasReacted = localStorage.getItem(reactionKey) === emoji;
        
        const reactions = { ...(post.reactions || {}) };
        
        if (hasReacted) {
            // 取消点赞
            localStorage.removeItem(reactionKey);
            reactions[emoji] = (reactions[emoji] || 0) - 1;
            if (reactions[emoji] <= 0) delete reactions[emoji];
        } else {
            // 先取消之前的点赞
            const oldReaction = localStorage.getItem(reactionKey);
            if (oldReaction) {
                reactions[oldReaction] = (reactions[oldReaction] || 0) - 1;
                if (reactions[oldReaction] <= 0) delete reactions[oldReaction];
            }
            // 添加新点赞
            localStorage.setItem(reactionKey, emoji);
            reactions[emoji] = (reactions[emoji] || 0) + 1;
        }
        
        // 尝试同步到服务器
        try {
            await this.supabaseService.updateReaction(post.id, reactions);
        } catch (e) {
            console.warn('Failed to sync reaction to server:', e);
            // 本地状态已更新，不影响用户体验
        }
        
        return reactions;
    }
}
