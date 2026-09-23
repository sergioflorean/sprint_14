import { Router } from 'express';
import { getPosts, createPost } from '../controllers/posts.js';

const postsRouter = Router();

postsRouter.get('/', getPosts);
postsRouter.post('/', createPost);

export { postsRouter };
