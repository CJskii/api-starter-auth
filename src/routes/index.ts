import { Router } from 'express';
import { helloRoute } from './hello';
import { userRoute } from './user';

const router = Router();

// Register routes
router.use('/hello', helloRoute);
router.use('/user', userRoute);

export default router;
