// src/modules/forum-management/routes/forum.routes.js

import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller.js';
import { threadRateLimiter, threadContentValidation } from '../middlewares/forum.middleware.js';

const router = Router();

router.post('/threads',
    threadRateLimiter(),
    threadContentValidation,
    ForumController.createThread
);

router.get('/threads/trending',
    ForumController.getTrendingThreads
);

router.get('/threads/search',
    ForumController.searchThreads
);

export default router;