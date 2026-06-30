/**
 * auth.routes.js
 * POST /api/auth/register — create account
 * POST /api/auth/login    — login and get token
 */

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);

export default router;
