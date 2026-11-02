import { ClientConfig, ClientOverrides } from './types';
import { defaultConfig } from './clients/default';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Fusion récursive : les objets sont fusionnés, les tableaux et valeurs simples remplacés.
function merge<T>(base: T, overrides: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return (overrides === undefined ? base : overrides) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) result[key] = merge(result[key], value);
  }
  return result as T;
}

/**
 * Construit la configuration d'un client à partir de la configuration par défaut.
 * Le client ne déclare que ce qui le distingue.
 */
export function defineClient(overrides: ClientOverrides): ClientConfig {
  return merge(defaultConfig, overrides);
}
