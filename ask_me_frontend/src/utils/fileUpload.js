import { API_ENDPOINTS, getMediaUrl } from '@/config/api';

/**
 * Upload a file to the backend server
 * @param {File} file - File object from <input type="file">
 * @param {string} [type='profile'] - Upload type ('profile', 'document', 'general')
 * @returns {Promise<{ path: string, url: string, filename: string }>}
 */
export async function uploadFile(file, type = 'profile') {
  if (!file) throw new Error('No file selected for upload.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(API_ENDPOINTS.UPLOAD, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'File upload failed');
  }

  return {
    path: data.file.path,
    url: data.file.url,
    filename: data.file.filename,
    previewUrl: getMediaUrl(data.file.path)
  };
}

/**
 * Get local blob preview URL for instant file preview before uploading
 * @param {File} file
 * @returns {string} Blob URL for <img src="...">
 */
export function getLocalFilePreview(file) {
  if (!file) return '';
  return URL.createObjectURL(file);
}
