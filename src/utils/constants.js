export const LEAD_STATUSES = {
  pending: { label: 'Pending', color: 'gray' },
  converted: { label: 'Converted to Client', color: 'green' },
  closed: { label: 'Closed', color: 'blue' },
  rejected: { label: 'Rejected', color: 'red' },
};

export const LEAD_SOURCES = {
  website: { label: 'Website', icon: 'Globe' },
  referral: { label: 'Referral', icon: 'Users' },
  cold_call: { label: 'Cold Call', icon: 'Phone' },
  social_media: { label: 'Social Media', icon: 'Share2' },
  advertisement: { label: 'Advertisement', icon: 'Megaphone' },
  trade_show: { label: 'Trade Show', icon: 'Building' },
  partner: { label: 'Partner', icon: 'Handshake' },
  other: { label: 'Other', icon: 'MoreHorizontal' },
};

export const LEAD_PRIORITIES = {
  low: { label: 'Low', color: 'gray' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

export const ACTIVITY_TYPES = {
  call: { label: 'Call', icon: 'Phone', color: 'blue' },
  meeting: { label: 'Meeting', icon: 'Calendar', color: 'purple' },
  whatsapp: { label: 'WhatsApp', icon: 'MessageCircle', color: 'green' },
  email: { label: 'Email', icon: 'Mail', color: 'yellow' },
  follow_up: { label: 'Follow Up', icon: 'RotateCcw', color: 'orange' },
  notes: { label: 'Notes', icon: 'FileText', color: 'gray' },
};

export const USER_ROLES = {
  superadmin: { label: 'Super Admin', color: 'rose' },
  admin: { label: 'Admin', color: 'red' },
  manager: { label: 'Manager', color: 'purple' },
  sales_rep: { label: 'Sales Rep', color: 'blue' },
  viewer: { label: 'Viewer', color: 'gray' },
};
