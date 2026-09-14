const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/uploadController');

// POST /api/upload - upload single file (field name can be 'file', 'profile_image', 'avatar', or 'document')
router.post('/', upload.single('file'), uploadSingleFile);
router.post('/profile', upload.single('profile_image'), uploadSingleFile);
router.post('/document', upload.single('document'), uploadSingleFile);

// POST /api/upload/multiple - upload multiple files (field name 'files')
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);

module.exports = router;
