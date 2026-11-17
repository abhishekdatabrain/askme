const path = require('path');

/**
 * Handle single file upload
 * POST /api/upload, /api/upload/profile, /api/upload/document
 */
const uploadSingleFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILE_PROVIDED',
        message: 'No file was uploaded. Please provide a file in multipart/form-data.'
      });
    }

    // Determine subfolder based on destination or uploadTarget
    const destinationPath = (req.file.destination || '').replace(/\\/g, '/');
    let subfolder = 'general';
    if (destinationPath.includes('uploads/profiles') || req.uploadTarget === 'profile') {
      subfolder = 'profiles';
    } else if (destinationPath.includes('uploads/documents') || req.uploadTarget === 'document') {
      subfolder = 'documents';
    }

    const relativePath = `/uploads/${subfolder}/${req.file.filename}`;
    const apiRelativePath = `/api/uploads/${subfolder}/${req.file.filename}`;

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const fullUrl = `${protocol}://${host}${apiRelativePath}`;

    const filePayload = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: relativePath,
      apiPath: apiRelativePath,
      url: fullUrl
    };

    return res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: filePayload,
      file: filePayload
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
        message: 'No files were uploaded. Please provide at least one file in multipart/form-data.'
      });
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';

    const uploadedFiles = req.files.map(file => {
      const destinationPath = (file.destination || '').replace(/\\/g, '/');
      let subfolder = 'general';
      if (destinationPath.includes('uploads/profiles') || req.uploadTarget === 'profile') {
        subfolder = 'profiles';
      } else if (destinationPath.includes('uploads/documents') || req.uploadTarget === 'document') {
        subfolder = 'documents';
      }

      const relativePath = `/uploads/${subfolder}/${file.filename}`;
      const apiRelativePath = `/api/uploads/${subfolder}/${file.filename}`;
      const fullUrl = `${protocol}://${host}${apiRelativePath}`;

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath,
        apiPath: apiRelativePath,
        url: fullUrl
      };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Files uploaded successfully',
      data: {
        count: uploadedFiles.length,
        files: uploadedFiles
      },
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
