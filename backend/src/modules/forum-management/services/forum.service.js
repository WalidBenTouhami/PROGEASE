// src/modules/forum-management/services/forum.service.js

import { Thread } from '../models/forum.model.js';
import { redisClient } from '../../../utils/redis.js';

export class ForumService {
    static async getTrendingThreads() {
        const cacheKey = 'forum:trending';
        const cached = await redisClient.get(cacheKey);

        if (cached) return JSON.parse(cached);

        const results = await Thread.aggregate([
            {
                $project: {
                    title: 1,
                    engagement: {
                        $add: [
                            { $multiply: ['$upvotes', 2] },
                            { $size: '$comments' }
                        ]
                    }
                }
            },
            { $sort: { engagement: -1 } },
            { $limit: 10 }
        ]);

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(results));
        return results;
    }
}