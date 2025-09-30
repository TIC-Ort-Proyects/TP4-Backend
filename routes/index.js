import { Router } from "express";
import userRoutes from './user.routes.js'
import songRoutes from './song.routes.js'
import listenRoutes from './listen.routes.js'
import seedRoutes from './seed.routes.js'

const router = Router();

router.use(userRoutes);
router.use(songRoutes);
router.use(listenRoutes);
router.use(seedRoutes);

router.get('/', (_, res) => res.send('Hello World'));
router.get('/about', (_, res) => res.send('About route 🎉 '));

export default router;