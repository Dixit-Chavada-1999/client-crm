import Badge from '../common/Badge';
import { LEAD_STATUSES } from '../../utils/constants';

export default function LeadStatusBadge({ status }) {
  const config = LEAD_STATUSES[status];

  if (!config) {
    return <Badge color="gray">{status}</Badge>;
  }

  return <Badge color={config.color}>{config.label}</Badge>;
}
