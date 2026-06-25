import {
  Phone,
  Calendar,
  MessageCircle,
  Mail,
  RotateCcw,
  FileText,
  Paperclip,
  Edit,
  Trash2,
  Download,
  Image,
  Eye,
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatRelativeTime, formatDate, formatFileSize } from '../../utils/formatters';
import { ACTIVITY_TYPES } from '../../utils/constants';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';
import { cn } from '../../utils/cn';

const ACTIVITY_ICONS = {
  call: Phone,
  meeting: Calendar,
  whatsapp: MessageCircle,
  email: Mail,
  follow_up: RotateCcw,
  notes: FileText,
};

const getFileIcon = (fileType) => {
  if (fileType?.startsWith('image/')) {
    return Image;
  }
  return FileText;
};

function ActivityItem({ activity, onEdit, onDelete, onFileClick }) {
  const Icon = ACTIVITY_ICONS[activity.type] || FileText;
  const config = ACTIVITY_TYPES[activity.type] || { label: activity.type, color: 'gray' };

  return (
    <div className="relative pb-8">
      <span
        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
        aria-hidden="true"
      />
      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full',
            `bg-${config.color}-100`
          )}
          style={{ backgroundColor: `var(--color-${config.color}-100, #dbeafe)` }}
        >
          <Icon
            className={cn('h-5 w-5', `text-${config.color}-600`)}
            style={{ color: `var(--color-${config.color}-600, #2563eb)` }}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">{activity.title}</span>
              <Badge className="ml-2" color={config.color}>
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {formatRelativeTime(activity.createdAt)}
              </span>
              {onEdit && (
                <button
                  onClick={() => onEdit(activity)}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Edit activity"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(activity)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          {activity.summary && (
            <p className="mt-1 text-sm text-gray-600">{activity.summary}</p>
          )}

          {/* Discussion points */}
          {activity.discussionPoints && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-1">Discussion Points:</p>
              <p className="whitespace-pre-wrap">{activity.discussionPoints}</p>
            </div>
          )}

          {/* Client Response */}
          {activity.clientResponse && (
            <div className="mt-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
              <p className="font-medium text-blue-700 mb-1">Client Response:</p>
              <p className="whitespace-pre-wrap text-blue-900">{activity.clientResponse}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {activity.user && (
              <span>by {activity.user.name}</span>
            )}
            {activity.durationMinutes && (
              <span>{activity.durationMinutes} min</span>
            )}
            {activity.callOutcome && (
              <span>Outcome: {activity.callOutcome}</span>
            )}
            {activity.meetingLocation && (
              <span>Location: {activity.meetingLocation}</span>
            )}
            {activity.nextFollowUpDate && (
              <span className="text-orange-600">
                Follow-up: {formatDate(activity.nextFollowUpDate)}
              </span>
            )}
          </div>

          {/* Files */}
          {activity.files?.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Paperclip className="w-4 h-4 mr-1" />
                {activity.files.length} attachment{activity.files.length > 1 ? 's' : ''}
              </div>
              <div className="flex flex-wrap gap-2">
                {activity.files.map((file) => {
                  const FileIcon = getFileIcon(file.fileType);
                  const isImage = file.fileType?.startsWith('image/');
                  return (
                    <button
                      key={file.id}
                      onClick={() => onFileClick && onFileClick(file)}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-primary-50 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-colors cursor-pointer group"
                      title={isImage ? 'Click to preview' : 'Click to download'}
                    >
                      <FileIcon className="w-4 h-4 mr-2 text-gray-500 group-hover:text-primary-600" />
                      <span className="truncate max-w-[150px]">{file.fileName}</span>
                      <span className="ml-2 text-gray-500">({formatFileSize(file.fileSize)})</span>
                      {isImage ? (
                        <Eye className="w-3.5 h-3.5 ml-2 text-gray-400 group-hover:text-primary-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5 ml-2 text-gray-400 group-hover:text-primary-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities, isLoading, onEdit, onDelete, onFileClick }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No activities yet"
        description="Add your first activity to track interactions with this lead"
      />
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <ActivityItem
              activity={activity}
              isLast={index === activities.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onFileClick={onFileClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
