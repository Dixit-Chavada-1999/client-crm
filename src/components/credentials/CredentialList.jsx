import { useState } from 'react';
import {
  Key,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function CredentialList({
  credentials = [],
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No credentials added yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Store login credentials, API keys, and other sensitive information securely
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {credentials.map((credential) => {
        const isExpanded = expandedId === credential.id;

        return (
          <div
            key={credential.id}
            className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Key className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">Credentials</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : credential.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? 'Hide Details' : 'Show Details'}
                  >
                    {isExpanded ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit?.(credential)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(credential.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && credential.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: credential.notes }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
