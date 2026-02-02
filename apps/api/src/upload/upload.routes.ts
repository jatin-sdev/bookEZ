import { Router } from 'express';
import { uploadImage } from './upload.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// POST /api/upload
// Security Chain:
// 1. requireAuth: Ensures user is logged in (valid JWT)
// 2. requireRole('ADMIN'): Ensures only Admins can upload
// 3. uploadMiddleware.single('file'): Processes the file (limit 5MB, image only)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  uploadMiddleware.single('file'),
  uploadImage
);

export default router;