const express = require('express');
const router = express.Router();
const { uploadSingleFlexible, uploadMultipleFlexible } = require('../middlewares/uploadMiddleware');
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/uploadController');

// Single file upload endpoints:
// POST /api/upload - general single file
router.post('/', uploadSingleFlexible('general'), uploadSingleFile);
router.post('/single', uploadSingleFlexible('general'), uploadSingleFile);

// POST /api/upload/profile - profile image upload (saved in uploads/profiles)
// Accepts field: 'file', 'profile_image', 'avatar', 'profile', 'image'
router.post('/profile', uploadSingleFlexible('profile'), uploadSingleFile);
router.post('/profiles', uploadSingleFlexible('profile'), uploadSingleFile);
router.post('/avatar', uploadSingleFlexible('profile'), uploadSingleFile);

// POST /api/upload/document - document upload (saved in uploads/documents)
// Accepts field: 'file', 'document', 'kyc', 'doc'
router.post('/document', uploadSingleFlexible('document'), uploadSingleFile);
router.post('/documents', uploadSingleFlexible('document'), uploadSingleFile);

// Multiple files upload endpoints:
// POST /api/upload/multiple - upload multiple files (up to 10 files)
// Accepts fields: 'files', 'file', 'images', 'documents', 'photos'
router.post('/multiple', uploadMultipleFlexible('general'), uploadMultipleFiles);
router.post('/multi', uploadMultipleFlexible('general'), uploadMultipleFiles);
router.post('/files', uploadMultipleFlexible('general'), uploadMultipleFiles);
router.post('/documents/multiple', uploadMultipleFlexible('document'), uploadMultipleFiles);

module.exports = router;
