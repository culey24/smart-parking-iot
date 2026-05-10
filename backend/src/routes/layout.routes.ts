import { Router } from 'express';
import { getLayoutMapping, updateLayoutMapping } from '../controllers/layout.controller';

const router = Router();

router.get('/mapping', getLayoutMapping);
router.post('/mapping', updateLayoutMapping);

export default router;
