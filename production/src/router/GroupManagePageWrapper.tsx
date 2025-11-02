/**
 * Wrapper pour GroupManagePage avec extraction des params de route
 */

import { useParams } from 'react-router-dom';
import { GroupManagePage } from '../components/GroupManagePage';

export function GroupManagePageWrapper() {
  const { groupId } = useParams<{ groupId: string }>();

  if (!groupId) {
    return <div>Groupe introuvable</div>;
  }

  return <GroupManagePage groupId={groupId} />;
}
