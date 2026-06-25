import { X, Download } from 'lucide-react';

export default function FilePreview({ file, url, onClose }) {
  if (!file || !url) return null;

  const isImage = file.fileType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Preview content */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate pr-4">
              {file.fileName}
            </h3>
            <a
              href={url}
              download={file.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700 text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </a>
          </div>

          {/* Content */}
          <div className="flex items-center justify-center bg-gray-100 p-4 max-h-[70vh] overflow-auto">
            {isImage ? (
              <img
                src={url}
                alt={file.fileName}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Preview not available for this file type</p>
                <a
                  href={url}
                  download={file.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
