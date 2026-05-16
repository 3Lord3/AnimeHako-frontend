// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

// =============================================================================
// ANIME TYPES (mapped from YummyAnime API)
// =============================================================================

export interface AnimeCatalogItem {
  id: number;
  name: string;
  russian: string | null;
  poster: string | null;
  cover: string | null;
  url: string;
  kind: string | null;
  score: string | null;
  status: string | null;
  episodes: number | null;
  episodes_aired: number | null;
  aired_on: string | null;
  released_on: string | null;
  // Allow any additional properties for backward compatibility
  [key: string]: any;
}

// Legacy type names for backward compatibility
export type AnimeListItem = AnimeCatalogItem;

// Helper to extract year from aired_on date string
export function extractYear(airedOn: string | null | undefined): number | null {
  if (!airedOn) return null;
  const year = parseInt(airedOn.split('-')[0]);
  return isNaN(year) ? null : year;
}

// Helper to get display title (russian or name)
export function getDisplayTitle(anime: { name: string; russian?: string | null }): string {
  return anime.russian || anime.name || 'Unknown';
}

export interface AnimeDetailResponse {
  id: number;
  name: string;
  russian: string | null;
  poster: string | null;
  cover: string | null;
  url: string;
  kind: string | null;
  score: string | null;
  status: string | null;
  description: string | null;
  description_html: string | null;
  episodes: number | null;
  episodes_aired: number | null;
  aired_on: string | null;
  released_on: string | null;
  rating: string | null;
  duration: number | null;
  studio: string[];
  genre: Array<{ id: number; name: string; russian: string | null }>;
  video: string | null;
  screenshots: string[];
  rates_scores_stats: Array<{ score: number; count: number }>;
  rates_statuses_stats: Array<{ status: string; count: number }>;
  // Allow any additional properties for backward compatibility
  [key: string]: any;
}

// Legacy type name for backward compatibility
export type AnimeDetail = AnimeDetailResponse;

// =============================================================================
// USER ANIME LIST TYPES
// =============================================================================

export type AnimeStatus = 'watching' | 'completed' | 'dropped' | 'planned' | 'rewatching' | 'paused' | 'idle';

export interface UserAnimeRate {
  id: number;
  user_id: number;
  anime_id: number;
  anime: AnimeCatalogItem;
  text: string | null;
  episodes: number;
  status: string;
  score: number | null;
  created_at: string;
  updated_at: string;
  // Allow any additional properties for backward compatibility
  [key: string]: any;
}

export interface UserAnimeCreate {
  anime_id: number;
  status: AnimeStatus;
  score?: number;
  episodes?: number;
  text?: string;
}

export interface UserAnimeUpdate {
  status?: AnimeStatus | null;
  score?: number;
  episodes?: number;
  text?: string;
}

export interface UserListResponse {
  id: number;
  name: string;
  user_id: number;
  anime: UserAnimeRate[];
}

// Legacy type for backward compatibility
export interface UserAnimeResponse {
  anime_id: number;
  status: string | null;
  score: number | null;
  episodes_watched: number;
  is_favorite: boolean;
  anime: AnimeCatalogItem;
  // Allow any additional properties for backward compatibility
  [key: string]: any;
}

// =============================================================================
// GENRE TYPES
// =============================================================================

export interface GenreResponse {
  id: number;
  name: string;
  russian: string | null;
  kind: string | null;
}

// Legacy alias
export interface TagResponse extends GenreResponse {
  // Tags use the same structure as genres in YummyAnime API
}

// =============================================================================
// REVIEW TYPES
// =============================================================================

export interface ReviewResponse {
  id: number;
  author: string;
  anime_id: number;
  anime: string;
  titles: { en: string | null; jp: string | null; ru: string | null };
  text: string | null;
  score: number | null;
  created_at: string;
  // Allow any additional properties for backward compatibility
  [key: string]: any;
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    last: number;
    page: number;
    items: number;
  };
}

// =============================================================================
// STATUS MAPPING
// =============================================================================

// API status values (from YummyAnime)
export const API_STATUS_VALUES = {
  watching: 'watching',
  rewatching: 'rewatching',
  completed: 'completed',
  paused: 'paused',
  dropped: 'dropped',
  planned: 'planned',
  idle: 'idle',
} as const;

// Map internal status to API status
export const mapStatusToApi = (status: AnimeStatus): string => {
  return API_STATUS_VALUES[status] || status;
};

// Map API status to internal status
export const mapStatusFromApi = (apiStatus: string): AnimeStatus => {
  const statusMap: Record<string, AnimeStatus> = {
    watching: 'watching',
    rewatching: 'rewatching',
    completed: 'completed',
    paused: 'paused',
    dropped: 'dropped',
    planned: 'planned',
    idle: 'idle',
  };
  return statusMap[apiStatus] || 'planned';
};

// Helper to normalize anime data for backward compatibility
export function normalizeAnimeCatalogItem(item: AnimeCatalogItem): AnimeCatalogItem {
  return {
    ...item,
    title: item.russian || item.name,
    title_en: item.name !== item.russian ? item.name : undefined,
    year: extractYear(item.aired_on),
    rating: item.score,
  };
}

export function normalizeAnimeDetailResponse(item: AnimeDetailResponse): AnimeDetailResponse {
  const year = extractYear(item.aired_on);
  const genres = item.genre?.map(g => g.russian || g.name) || [];
  return {
    ...item,
    title: item.russian || item.name,
    title_en: item.name !== item.russian ? item.name : undefined,
    year,
    genres,
    tags: [], // YummyAnime API doesn't have separate tags in detail response
  };
}