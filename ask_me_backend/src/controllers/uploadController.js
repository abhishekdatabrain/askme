const path = require('path');

/**
 * Handle single file upload
 * POST /api/upload
 */
const uploadSingleFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILE_PROVIDED',
        message: 'No file was uploaded.'
      });
    }

    // Determine subfolder based on file destination
    const destinationPath = req.file.destination.replace(/\\/g, '/');
    let subfolder = 'general';
    if (destinationPath.includes('uploads/profiles')) {
      subfolder = 'profiles';
    } else if (destinationPath.includes('uploads/documents')) {
      subfolder = 'documents';
    }

    const relativePath = `/uploads/${subfolder}/${req.file.filename}`;
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativePath}`;

    return res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: relativePath,
        url: fullUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 'UPLOAD_ERROR',
      message: error.message || 'File upload failed.'
    });
  }
};

/**
 * Handle multiple files upload
 * POST /api/upload/multiple
 */
const uploadMultipleFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILES_PROVIDED',
        message: 'No files were uploaded.'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';

    const uploadedFiles = req.files.map(file => {
      const destinationPath = file.destination.replace(/\\/g, '/');
      let subfolder = 'general';
      if (destinationPath.includes('uploads/profiles')) {
        subfolder = 'profiles';
      } else if (destinationPath.includes('uploads/documents')) {
        subfolder = 'documents';
      }

      const relativePath = `/uploads/${subfolder}/${file.filename}`;
      const fullUrl = `${protocol}://${host}${relativePath}`;

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath,
        url: fullUrl
      };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 'UPLOAD_ERROR',
      message: error.message || 'Multiple file upload failed.'
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles
};
