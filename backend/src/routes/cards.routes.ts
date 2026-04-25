import { Router } from 'express';

const router = Router();

router.get('/lookup', (req, res) => {
  const { plate } = req.query;
  // Mock data
  res.json({
    success: true,
    data: {
      cardId: 1001,
      plateNumber: plate,
      status: 'ACTIVE'
    }
  });
});

router.put('/:id/disable', (req, res) => {
  res.json({ success: true, message: `Card ${req.params.id} disabled` });
});

export default router;
