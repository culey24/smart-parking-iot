import { Router } from 'express';

const router = Router();

// TODO: Define authentication routes
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

export default router;
