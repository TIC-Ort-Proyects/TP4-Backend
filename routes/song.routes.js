import { Router } from "express";
import { getSongs, createSong, updateSong, deleteSong } from '../controllers/song.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.js'

const router = Router();

router.get('/songs', verifyToken, getSongs);
router.post('/songs', verifyToken, verifyAdmin, createSong);
router.put('/songs', verifyToken, verifyAdmin, updateSong);
router.delete('/songs', verifyToken, verifyAdmin, deleteSong);

export default router;