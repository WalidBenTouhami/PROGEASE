// src/modules/forum-management/tests/index.js

import { ForumService } from 'backend/src/modules/forum-management/services/forum.service.js';
import { redisClient } from 'backend/src/utils/redis.js';
import * as Thread from 'backend/src/modules/forum-management/models/forum.model.js';

jest.mock('backend/src/utils/redis.js');
jest.mock('backend/src/modules/forum-management/models/forum.model.js');

describe('ForumService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTrendingThreads', () => {
        it('devrait retourner les threads depuis le cache si disponibles', async () => {
            const cachedData = JSON.stringify([{ title: 'Thread 1', engagement: 10 }]);
            redisClient.get.mockResolvedValue(cachedData);

            const result = await ForumService.getTrendingThreads();

            expect(redisClient.get).toHaveBeenCalledWith('forum:trending');
            expect(result).toEqual(JSON.parse(cachedData));
        });

        it('devrait retourner les threads depuis la base de données si le cache est vide', async () => {
            redisClient.get.mockResolvedValue(null);
            const dbResults = [{ title: 'Thread 1', engagement: 10 }];
            Thread.aggregate.mockResolvedValue(dbResults);

            const result = await ForumService.getTrendingThreads();

            expect(redisClient.get).toHaveBeenCalledWith('forum:trending');
            expect(Thread.aggregate).toHaveBeenCalled();
            expect(redisClient.setEx).toHaveBeenCalledWith(
                'forum:trending',
                3600,
                JSON.stringify(dbResults)
            );
            expect(result).toEqual(dbResults);
        });
    });
});