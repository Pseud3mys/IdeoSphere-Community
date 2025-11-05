/**
 * Wrapper pour GroupManagePage avec extraction des params de route
 */

import { useParams } from 'react-router-dom';
import { GroupManagePage } from '../components/GroupManagePage';
import { ensureGroupPrefix } from '../utils/idUtils';

export function GroupManagePageWrapper() {
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();

  if (!urlGroupId) {
    return <div>Groupe introuvable</div>;
  }

  // Ajouter le préfixe "groups/" si nécessaire
  const groupId = ensureGroupPrefix(urlGroupId);

  return <GroupManagePage groupId={groupId} />;
}
