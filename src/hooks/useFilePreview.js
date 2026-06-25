import { useState } from 'react';
import activityService from '../services/activityService';
import toast from 'react-hot-toast';

export function useFilePreview() {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const openPreview = async (file) => {
    setIsLoading(true);
    try {
      const { url, fileName, fileType } = await activityService.getFileDownloadUrl(file.id);

      if (fileType?.startsWith('image/')) {
        // Show preview modal for images
        setPreviewFile({ ...file, fileName, fileType });
        setPreviewUrl(url);
      } else {
        // Download non-image files directly
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Failed to get file');
    } finally {
      setIsLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  return {
    previewFile,
    previewUrl,
    isLoading,
    openPreview,
    closePreview,
  };
}
