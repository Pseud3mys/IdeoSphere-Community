import { Location } from '../types';

const API_URL = 'https://data.geopf.fr/geocodage';

interface GeoFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    id: string;
    type: string;
    name: string;
    postcode?: string;
    citycode?: string;
    x: number;
    y: number;
    city?: string;
    context?: string;
    importance: number;
    street?: string;
  };
}

interface GeoResponse {
  type: string;
  version: string;
  features: GeoFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

/**
 * Recherche une adresse ou un lieu via l'API de géocodage du gouvernement français (Géoplateforme)
 * @param query - La chaîne de recherche (adresse, ville, lieu-dit)
 * @returns Une liste de lieux correspondants
 */
export async function searchLocation(query: string): Promise<Location[]> {
  if (!query || query.length < 3) return [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${API_URL}/search?q=${encodedQuery}&limit=5`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Géocodage: ${response.statusText}`);
    }

    const data: GeoResponse = await response.json();

    return data.features.map(feature => ({
      label: feature.properties.label,
      lon: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
      context: feature.properties.context,
      city: feature.properties.city,
      postcode: feature.properties.postcode,
      citycode: feature.properties.citycode
    }));
  } catch (error) {
    console.error('❌ [Geocoding] Erreur lors de la recherche:', error);
    return [];
  }
}

/**
 * Récupère l'adresse correspondant à des coordonnées (géocodage inverse)
 * @param lon - Longitude
 * @param lat - Latitude
 * @returns Le lieu correspondant ou null
 */
export async function reverseGeocode(lon: number, lat: number): Promise<Location | null> {
  try {
    const response = await fetch(`${API_URL}/reverse?lon=${lon}&lat=${lat}&limit=1`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Géocodage Inverse: ${response.statusText}`);
    }

    const data: GeoResponse = await response.json();

    if (data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      label: feature.properties.label,
      lon: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
      context: feature.properties.context,
      city: feature.properties.city,
      postcode: feature.properties.postcode,
      citycode: feature.properties.citycode
    };
  } catch (error) {
    console.error('❌ [Geocoding] Erreur lors du géocodage inverse:', error);
    return null;
  }
}
