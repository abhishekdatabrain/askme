const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist under ask_me_backend/uploads
const UPLOADS_BASE_DIR = path.resolve(__dirname, '../../uploads');
const uploadDirs = ['profiles', 'testimonials', 'documents', 'general'];

uploadDirs.forEach(sub => {
  const fullPath = path.join(UPLOADS_BASE_DIR, sub);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'general';
    const targetType = (req.uploadTarget || req.body?.type || '').toLowerCase();
    const field = (file.fieldname || '').toLowerCase();

    if (
      targetType === 'profile' ||
      targetType === 'profiles' ||
      targetType === 'avatar' ||
      field === 'profile_image' ||
      field === 'avatar' ||
      field === 'profile'
    ) {
      subfolder = 'profiles';
    } else if (
      targetType === 'document' ||
      targetType === 'documents' ||
      targetType === 'kyc' ||
      field === 'document' ||
      field === 'kyc' ||
      field === 'doc'
    ) {
      subfolder = 'documents';
    }

    const fullPath = path.join(UPLOADS_BASE_DIR, subfolder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanPrefix = (file.fieldname || 'file').replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${cleanPrefix}-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|svg/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpg, jpeg, png, webp, gif, svg) and PDF documents are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter: fileFilter
});

/**
 * Graceful Multer Error Handler
 * Catches Multer limits or invalid formats and returns clean 400 Bad Request JSON
 */
const handleMulter = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          let msg = `File upload error: ${err.message}`;
          if (err.code === 'LIMIT_FILE_SIZE') {
            msg = 'File size limit exceeded (maximum allowed size is 15MB).';
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            msg = `Unexpected field '${err.field}'. Please send files under 'file', 'profile_image', 'document', or 'files'.`;
          }
          return res.status(400).json({
            status: 'error',
            code: err.code || 'MULTER_ERROR',
            message: msg
          });
        }
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_FILE',
          message: err.message || 'File upload validation failed.'
        });
      }
      next();
    });
  };
};

/**
 * Flexible Single-file Upload Middleware
 * Accepts ANY field name ('file', 'profile_image', 'avatar', 'document', 'image', etc.)
 */
const uploadSingleFlexible = (targetType = 'general') => {
  return [
    (req, res, next) => {
      req.uploadTarget = targetType;
      next();
    },
    handleMulter(upload.any()),
    (req, res, next) => {
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    }
  ];
};

/**
 * Flexible Multi-file Upload Middleware
 * Accepts ANY field names (up to 10 files)
 */
const uploadMultipleFlexible = (targetType = 'general') => {
  return [
    (req, res, next) => {
      req.uploadTarget = targetType;
      next();
    },
    handleMulter(upload.any()),
    (req, res, next) => {
      if (!req.files) req.files = [];
      next();
    }
  ];
};

module.exports = upload;
module.exports.upload = upload;
module.exports.uploadSingleFlexible = uploadSingleFlexible;
module.exports.uploadMultipleFlexible = uploadMultipleFlexible;
module.exports.handleMulter = handleMulter;
