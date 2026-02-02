import { cloudinary } from '../lib/cloudinary';
import { logger } from '../lib/logger';
import { Readable } from 'stream';

export class UploadService {
  /**
   * Uploads a file buffer to Cloudinary using a stream.
   * @param buffer - The file buffer from Multer
   * @param folder - (Optional) Folder name in Cloudinary
   * @returns Promise<string> - The secure URL of the uploaded image
   */
  async uploadImage(buffer: Buffer, folder: string = 'events'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ticketforge/${folder}`, // Organized folder structure
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }, // Auto-optimize size/format
          ],
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload failed:', error);
            return reject(new Error('Image upload failed'));
          }

          if (!result) {
            return reject(new Error('Cloudinary returned no result'));
          }

          logger.info(`Image uploaded successfully: ${result.public_id}`);
          resolve(result.secure_url);
        }
      );

      // Convert Buffer to Readable Stream and pipe to Cloudinary
      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }
}

export const uploadService = new UploadService();