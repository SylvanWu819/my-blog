// 点赞反应服务
export class ReactionService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.userId = this.getUserId();
    }

    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
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
        
        const reactions = post.reactions || {};
        
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
        
        await this.supabaseService.updateReaction(post.id, reactions);
        return reactions;
    }
}
