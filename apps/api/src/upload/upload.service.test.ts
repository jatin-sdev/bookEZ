import { UploadService } from './upload.service';
import { cloudinary } from '../lib/cloudinary';
import { logger } from '../lib/logger';
import { Readable } from 'stream';

// Mock Cloudinary
jest.mock('../lib/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

// Mock Logger
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadService();
  });

  describe('uploadImage', () => {
    it('should successfully upload image buffer to Cloudinary', async () => {
      const mockBuffer =Buffer.from('test image data');
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
        public_id: 'ticketforge/events/test123',
      };

      // Create a proper mock writable stream
      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      // Mock upload_stream to immediately call the callback with success
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        // Simulate successful upload
        setImmediate(() => callback(null, mockResult));
        return mockUploadStream;
      });

      const result = await service.uploadImage(mockBuffer);

      expect(result).toBe(mockResult.secure_url);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'ticketforge/events',
          resource_type: 'image',
        }),
        expect.any(Function)
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Image uploaded successfully')
      );
    });

    it('should use custom folder path when provided', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
        public_id: 'ticketforge/venues/test123',
      };

      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setImmediate(() => callback(null, mockResult));
        return mockUploadStream;
      });

      await service.uploadImage(mockBuffer, 'venues');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'ticketforge/venues',
        }),
        expect.any(Function)
      );
    });

    it('should apply correct transformations', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test',
      };

      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setImmediate(() => callback(null, mockResult));
        return mockUploadStream;
      });

      await service.uploadImage(mockBuffer);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        }),
        expect.any(Function)
      );
    });

    it('should reject when Cloudinary returns error', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockError = new Error('Cloudinary connection failed');

      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setImmediate(() => callback(mockError, null));
        return mockUploadStream;
      });

      await expect(service.uploadImage(mockBuffer)).rejects.toThrow('Image upload failed');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Cloudinary upload failed:',
        mockError
      );
    });

    it('should reject when Cloudinary returns no result', async () => {
      const mockBuffer = Buffer.from('test image data');

      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setImmediate(() => callback(null, null));
        return mockUploadStream;
      });

      await expect(service.uploadImage(mockBuffer)).rejects.toThrow(
        'Cloudinary returned no result'
      );
    });

    it('should return secure_url from Cloudinary response', async () => {
      const mockBuffer = Buffer.from('test image data');
      const expectedUrl = 'https://res.cloudinary.com/test/secure/image.jpg';
      const mockResult = {
        secure_url: expectedUrl,
        public_id: 'test',
        url: 'http://res.cloudinary.com/test/image.jpg', // non-secure url
      };

      const mockUploadStream = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setImmediate(() => callback(null, mockResult));
        return mockUploadStream;
      });

      const result = await service.uploadImage(mockBuffer);

      // Should return secure_url, not regular url
      expect(result).toBe(expectedUrl);
      expect(result).toContain('https://');
    });
  });
});
