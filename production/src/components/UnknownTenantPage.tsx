import { Compass } from 'lucide-react';
import IdeoSphereLogo from '../assets/logo.png';
import { UnknownTenant } from '../config/clientConfig';
import './UnknownTenantPage.css';

interface UnknownTenantPageProps {
  tenant: UnknownTenant;
}

/**
 * Page affichée quand le sous-domaine ne correspond à aucun client.
 * Elle ne liste jamais les clients existants : une suggestion n'est proposée
 * que si le nom saisi en est très proche (voir detectUnknownTenant).
 */
export function UnknownTenantPage({ tenant }: UnknownTenantPageProps) {
  const { subdomain, suggestion, platformDomain } = tenant;
  const { protocol, port } = window.location;
  const suggestionHost = suggestion ? `${suggestion}.${platformDomain}` : null;
  const suggestionUrl = suggestionHost ? `${protocol}//${suggestionHost}${port ? `:${port}` : ''}/` : null;

  return (
    <main className="ut">
      <div className="ut-card">
        <img className="ut-logo" src={IdeoSphereLogo} alt="IdeoSphere" />
        <span className="ut-icon" aria-hidden="true">
          <Compass className="w-6 h-6" />
        </span>

        <h1 className="ut-title">Oups, vous vous êtes trompé de domaine</h1>
        <p className="ut-text">
          Aucun espace IdeoSphere n'existe à l'adresse <strong className="ut-host">{subdomain}.{platformDomain}</strong>.
          Vérifiez le lien que vous avez reçu : il contient peut-être une faute de frappe.
        </p>

        {suggestionUrl && suggestionHost && (
          <a className="ut-suggestion" href={suggestionUrl}>
            <span className="ut-suggestion-label">Vous vouliez dire&nbsp;?</span>
            <span className="ut-suggestion-host">{suggestionHost}</span>
          </a>
        )}

        <p className="ut-footnote">
          Un doute&nbsp;? Demandez le lien exact à la personne ou à l'organisation qui vous a invité.
        </p>
      </div>
    </main>
  );
}
