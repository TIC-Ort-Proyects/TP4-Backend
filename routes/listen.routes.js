import { Router } from "express";
import { getListens, addListen } from '../controllers/listen.controller.js'
import { verifyToken } from '../middlewares/auth.js'

const router = Router();

router.get('/listen', verifyToken, getListens);
router.post('/listen', verifyToken, addListen);

export default router;