import { Router } from 'express';
import { logger } from "../utils";

const router = Router();

// GET /hello
router.get('/', (req, res) => {
  logger.info("Hello endpoint accessed");
  res.json({ message: 'Hello, World!' });
});

// GET /hello/:name
router.get('/:name', (req, res) => {
  const { name } = req.params;
  logger.info("Hello endpoint accessed with name", { name });
  res.json({ message: `Hello, ${name}!` });
});

export { router as helloRoute };
