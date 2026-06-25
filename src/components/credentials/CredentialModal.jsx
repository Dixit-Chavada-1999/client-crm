import { useState, useEffect } from 'react';
import { Key, Save, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import RichTextEditor from '../common/RichTextEditor';

export default function CredentialModal({
  isOpen,
  onClose,
  onSave,
  credential = null,
  isLoading = false,
}) {
  const [content, setContent] = useState('');
  const isEditing = !!credential;

  useEffect(() => {
    if (credential) {
      setContent(credential.notes || '');
    } else {
      setContent('');
    }
  }, [credential, isOpen]);

  const handleSave = () => {
    onSave({
      name: 'Project Credentials',
      credentialType: 'other',
      notes: content,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-primary-600" />
          <span>{isEditing ? 'Edit Credential' : 'Add Credential'}</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Rich Text Editor for Credential Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credential Details
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Enter credential details here...

Examples:
• URL: https://admin.example.com
• Username: admin@example.com
• Password: ********
• API Key: sk_live_xxxxx
• Notes: Additional information..."
            minHeight="300px"
          />
          <p className="text-xs text-gray-500 mt-2">
            Store login credentials, API keys, URLs, and any other sensitive information securely.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1" />
            {isEditing ? 'Update Credential' : 'Save Credential'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
