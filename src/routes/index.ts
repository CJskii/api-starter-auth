import { Router } from 'express';
import { helloRoute } from './hello';

const router = Router();

// Register routes
router.use('/hello', helloRoute);

export default router;
