import { Router } from "express";
import { seed } from '../controllers/seed.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.js'

const router = Router();

router.post('/seed', verifyToken, verifyAdmin, seed);

export default router;