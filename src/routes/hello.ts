import { Router } from 'express';

const router = Router();

// GET /hello
router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// GET /hello/:name
router.get('/:name', (req, res) => {
  const { name } = req.params;
  res.json({ message: `Hello, ${name}!` });
});

export { router as helloRoute };
