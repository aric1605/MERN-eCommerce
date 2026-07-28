import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const uploadsDir = path.resolve('uploads');

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Local Storage Engine for Fallback
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const sanitizedName = path.basename(file.originalname);
    const ext = path.extname(sanitizedName).toLowerCase();
    cb(null, `${file.fieldname}-${crypto.randomUUID()}${ext}`);
  }
});

// Memory Storage Engine for Direct Cloudinary Stream Upload
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ];
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

  const sanitizedName = path.basename(file.originalname);
  const ext = path.extname(sanitizedName).toLowerCase();

  if (file.mimetype === 'image/svg+xml' || ext === '.svg') {
    return cb(new Error('SVG files are not allowed!'), false);
  }

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Images only! Allowed formats: JPG, JPEG, PNG, WEBP, GIF.'), false);
  }
};

const uploadLocal = multer({
  storage: localStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

router.post('/', protect, admin, (req, res) => {
  const useCloudinary = isCloudinaryConfigured();
  const uploader = useCloudinary ? uploadMemory : uploadLocal;

  uploader(req, res, async err => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (useCloudinary) {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'mern-ecommerce', resource_type: 'image' },
          (cloudinaryErr, result) => {
            if (cloudinaryErr || !result) {
              return res
                .status(500)
                .json({ message: cloudinaryErr?.message || 'Cloudinary upload failed' });
            }
            return res.send({
              message: 'Image uploaded to Cloudinary',
              imageUrl: result.secure_url
            });
          }
        );
        uploadStream.end(req.file.buffer);
      } catch (streamErr) {
        return res.status(500).json({ message: streamErr.message });
      }
    } else {
      const resolvedPath = path.resolve(req.file.path);
      if (!resolvedPath.startsWith(uploadsDir)) {
        return res.status(400).json({ message: 'Invalid file destination path' });
      }

      const normalizedPath = req.file.path.replace(/\\/g, '/');
      res.send({
        message: 'Image uploaded locally',
        imageUrl: `/${normalizedPath}`
      });
    }
  });
});

export default router;
