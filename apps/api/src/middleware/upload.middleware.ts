import multer from 'multer';
import { Request } from 'express';

// 1. Storage Strategy: Memory (RAM)
// We use memory storage so we can stream the buffer directly to Cloudinary
// without writing to the disk first (faster & stateless).
const storage = multer.memoryStorage();

// 2. File Filter (Security)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only specific image types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Reject file
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
  }
};

// 3. Configure Multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit: 5MB (Prevent DoS)
    files: 1, // Max 1 file per request
  },
});