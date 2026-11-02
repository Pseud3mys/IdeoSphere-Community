import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, Search, Users, X } from "lucide-react";
import { useEntityStoreSimple } from "../../hooks/useEntityStoreSimple";
import { useGroupActions } from "../../hooks/useGroupActions";
import { getGroupTypeInfo } from "../../config/clientConfig";
import { Group } from "../../types";
import "./GroupPicker.css";

interface GroupPickerProps {
  selectedIds: string[];
  onChange: (groupIds: string[]) => void;
}

// Comparaison insensible à la casse et aux accents
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Choix des groupes dans lesquels publier (plusieurs possibles).
 * Les groupes choisis sont affichés en étiquettes ; la recherche porte sur tous
 * les groupes, ceux dont l'utilisateur est membre en premier (utile aux invités,
 * qui ne sont membres d'aucun groupe).
 */
export function GroupPicker({ selectedIds, onChange }: GroupPickerProps) {
  const { getAllGroups, getGroupById, getUserGroups, getCurrentUser } = useEntityStoreSimple();
  const groupActions = useGroupActions();
  const currentUser = getCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tous les groupes, chargés à la première ouverture
  useEffect(() => {
    if (!isOpen || hasLoaded) return;
    setHasLoaded(true);
    setIsLoadingGroups(true);
    groupActions.loadAllGroups().catch(() => {}).finally(() => setIsLoadingGroups(false));
  }, [isOpen, hasLoaded]);

  // Fermeture au clic extérieur et avec Échap
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const selectedGroups = selectedIds
    .map(id => getGroupById(id))
    .filter((group): group is Group => Boolean(group));

  const { myGroups, otherGroups } = useMemo(() => {
    const needle = normalize(query.trim());
    const matches = (group: Group) => !needle || normalize(group.name).includes(needle);
    const mine = currentUser ? getUserGroups(currentUser.id) : [];
    const mineIds = new Set(mine.map(group => group.id));
    const byName = (a: Group, b: Group) => a.name.localeCompare(b.name, 'fr');
    return {
      myGroups: mine.filter(matches).sort(byName),
      otherGroups: getAllGroups().filter(group => !mineIds.has(group.id) && matches(group)).sort(byName),
    };
  }, [query, currentUser?.id, getAllGroups, getUserGroups]);

  const toggle = (groupId: string) => {
    onChange(selectedIds.includes(groupId)
      ? selectedIds.filter(id => id !== groupId)
      : [...selectedIds, groupId]);
  };

  const renderOption = (group: Group) => {
    const isSelected = selectedIds.includes(group.id);
    return (
      <button
        key={group.id}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={`gp-option${isSelected ? ' is-selected' : ''}`}
        onClick={() => toggle(group.id)}
      >
        <span className="gp-check">{isSelected && <Check className="w-3 h-3" />}</span>
        <span className="gp-option-name">{group.name}</span>
        <span className="gp-option-type">{getGroupTypeInfo(group.type)?.label}</span>
      </button>
    );
  };

  return (
    <div className="gp" ref={wrapperRef}>
      <div className="gp-row">
        <span className="gp-label">
          <Users className="w-4 h-4" />
          {selectedGroups.length > 0 ? 'Publier dans' : 'Groupe (optionnel)'}
        </span>

        {selectedGroups.map(group => (
          <span key={group.id} className="gp-chip">
            <span className="gp-chip-name">{group.name}</span>
            <button
              type="button"
              className="gp-chip-remove"
              onClick={() => toggle(group.id)}
              aria-label={`Retirer le groupe ${group.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <button type="button" className="gp-add" onClick={() => setIsOpen(open => !open)} aria-expanded={isOpen}>
          <Plus className="w-4 h-4" />
          {selectedGroups.length > 0 ? 'Autre groupe' : 'Ajouter un groupe'}
        </button>
      </div>

      {isOpen && (
        <div className="gp-panel">
          <label className="gp-search">
            <Search className="w-4 h-4" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un groupe…"
            />
          </label>

          <div className="gp-list" role="listbox" aria-multiselectable="true">
            {myGroups.length > 0 && (
              <>
                <div className="gp-section">Mes groupes</div>
                {myGroups.map(renderOption)}
              </>
            )}
            {otherGroups.length > 0 && (
              <>
                {myGroups.length > 0 && <div className="gp-section">Autres groupes</div>}
                {otherGroups.map(renderOption)}
              </>
            )}
            {myGroups.length === 0 && otherGroups.length === 0 && (
              <p className="gp-empty">{isLoadingGroups ? 'Chargement des groupes…' : query ? 'Aucun groupe ne correspond.' : 'Aucun groupe pour le moment.'}</p>
            )}
          </div>

          <div className="gp-footer">
            <button type="button" className="gp-done" onClick={() => setIsOpen(false)}>Terminé</button>
          </div>
        </div>
      )}
    </div>
  );
}
