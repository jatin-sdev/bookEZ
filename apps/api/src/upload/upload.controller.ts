import { Request, Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import { logger } from '../lib/logger';

/**
 * Handle image upload requests.
 * Expects a single file named 'file' in the multipart/form-data.
 */
export const uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Validation: specific error for missing file
    if (!req.file) {
      logger.warn('Upload attempt failed: No file provided');
      res.status(400).json({ error: 'No file uploaded. Please select an image.' });
      return;
    }

    // 2. Delegate to Service
    // We default to the 'events' folder, but could make this dynamic via req.body.folder if needed later
    const folder = req.body.folder || 'events';
    const imageUrl = await uploadService.uploadImage(req.file.buffer, folder);

    // 3. Success Response
    res.status(201).json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    // 4. Error Handling
    // Pass to global error handler to keep controller clean
    logger.error('Upload controller error:', error);
    next(error);
  }
};