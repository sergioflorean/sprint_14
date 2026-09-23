import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../controllers/users.js';

const usersRouter = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', createUser);

export { usersRouter };
