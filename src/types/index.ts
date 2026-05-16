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
// ANIME TYPES (YummyAnime API)
// =============================================================================

// Poster sizes structure
export interface AnimePoster {
  small: string;    // 33x47 webp
  medium: string;   // 184x260 webp
  big: string;      // 250x350 avif
  huge: string;     // 400x560 avif
  fullsize: string; // responsive jpeg
  mega: string;     // 570x800 avif
}

// Rating structure
export interface AnimeRating {
  average: number;
  kp_rating?: number;
  anidub_rating?: number;
  counters: number;
  myanimelist_rating?: number;
  shikimori_rating?: number;
  worldart_rating?: number;
}

// Anime type structure
export interface AnimeType {
  name: string;
  value: number;
  shortname: string;
  alias: string;
}

// Anime status structure
export interface AnimeStatus {
  title: string;
  class?: string;
  alias: 'released' | 'ongoing' | 'announcement';
  value: 0 | 1 | 2;
}

// Episodes structure
export interface AnimeEpisodes {
  aired: number;
  count: number;
  next_date?: number;
  prev_date?: number;
}

// Studio/Creator structure
export interface AnimeStudio {
  title: string;
  id: number;
  url: string;
}

// Genre structure
export interface AnimeGenre {
  title: string;
  id: number;
  alias: string;
  url: string;
}

// User list info
export interface AnimeUserList {
  title: string;
  href: string;
  id: 0 | 1 | 2 | 3 | 5;
}

// User info within anime response
export interface AnimeUser {
  list?: {
    is_fav: boolean;
    list?: AnimeUserList;
  };
  rating?: number;
}

// Screenshot structure
export interface AnimeScreenshot {
  sizes: {
    small: string;
    full: string;
  };
  id: number;
  time: number;
  episode: string;
}

// Video structure for episodes
export interface AnimeVideo {
  video_id: number;
  iframe_url: string;
  data: {
    dubbing: string;
    player: string;
    player_id: number;
  };
  number: string;
  date: number;
  index: number;
  skips?: {
    ending?: { time: number; length: number };
    opening?: { time: number; length: number };
  };
  views: number;
  duration: number;
}

// Translate option
export interface AnimeTranslate {
  title: string;
  href: string;
  value: number;
}

// Viewing order item
export interface AnimeViewingOrder {
  title: string;
  anime_id: number;
  type: AnimeType;
  anime_url: string;
  anime_status: AnimeStatus;
  description?: string;
  poster: AnimePoster;
  user?: {
    list?: { list: AnimeUserList; is_fav: boolean };
    rating?: number;
  };
  year: number;
  data?: { id: number; index: number; text: string };
}

// Remote IDs for external services
export interface AnimeRemoteIds {
  worldart_id?: number;
  worldart_type?: 'animation' | 'cinema';
  kp_id?: number;
  anidub_id?: number;
  sr_id?: number;
  anilibria_alias?: string;
  shikimori_id?: number;
  myanimelist_id?: number;
}

// Top placement
export interface AnimeTop {
  category?: number;
  global?: number;
}

// Min age rating
export interface AnimeMinAge {
  value: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  title_long?: string;
}

// Main anime catalog item from API response.data[]
export interface AnimeCatalogItem {
  anime_id: number;
  anime_status: AnimeStatus;
  anime_url: string;
  poster: AnimePoster;
  rating: {
    average: number;
    counters: number;
  };
  title: string;
  type: AnimeType;
  year: number;
  description: string;
  views: number;
  season: 1 | 2 | 3 | 4;
  min_age?: AnimeMinAge;
  user?: AnimeUser;
  remote_ids?: AnimeRemoteIds;
  top?: AnimeTop;
  blocked_in?: string[];
  original?: string;
  duration?: number;
  trailers_count?: number;
  lists_count?: number;
  other_titles?: string[];
  creators?: AnimeStudio[];
  studios?: AnimeStudio[];
  videos?: AnimeVideo[];
  genres?: AnimeGenre[];
  viewing_order?: AnimeViewingOrder[];
  translates?: AnimeTranslate[];
  episodes: AnimeEpisodes;
  comments_count?: number;
  reviews_count?: number;
  random_screenshots?: AnimeScreenshot[];
  posts_count?: number;
  partner_videos_count?: number;
  // Allow any additional properties
  [key: string]: any;
}

// Legacy type names for backward compatibility
export type AnimeListItem = AnimeCatalogItem;

// Helper to get display title
export function getDisplayTitle(anime: { title: string; other_titles?: string[] }): string {
  return anime.title || 'Unknown';
}

// Anime detail response - single anime object from /anime/{url}
export interface AnimeDetailResponse extends AnimeCatalogItem {
  // Additional fields available in detail response
  // Most fields are inherited from AnimeCatalogItem
}

// Legacy type name for backward compatibility
export type AnimeDetail = AnimeDetailResponse;

// =============================================================================
// USER ANIME LIST TYPES
// =============================================================================

// YummyAnime list IDs: 0=watch_now, 1=will, 2=watched, 3=lost, 5=postpone
export type YummyAnimeListId = 0 | 1 | 2 | 3 | 5;

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
  // Allow any additional properties
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
  // Allow any additional properties
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
export interface TagResponse extends GenreResponse {}

// =============================================================================
// REVIEW TYPES
// =============================================================================

// Author info for reviews
export interface ReviewAuthor {
  id: number;
  nickname: string;
  avatars: {
    big?: string;
    full?: string;
    small?: string;
  };
}

// Review likes
export interface ReviewLikes {
  likes: number;
  dislikes: number;
  vote: 1 | 0 | -1;
}

// Main review structure from YummyAnime API
export interface ReviewResponse {
  anime_id: number;
  type: 'approved' | 'waiting' | 'declined';
  review_id: number;
  avatar?: {
    big?: string;
    full?: string;
    small?: string;
  };
  user_roles?: string[];
  user_id?: number;
  total_likes?: number;
  nickname?: string;
  views?: number;
  update_date?: number;
  rating?: {
    average?: number;
    category?: Record<string, number>;
  };
  published_by?: number;
  commentable?: boolean;
  create_date?: number;
  check_comment?: string;
  likes?: ReviewLikes;
  author: ReviewAuthor;
  anime?: AnimeCatalogItem;
  comments_count?: number;
  text_preview?: string;
  // For full review response
  text_html?: string;
  // Allow any additional properties
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

// YummyAnime API list IDs
export const YUMMY_LIST_IDS = {
  watch_now: 0,
  will: 1,
  watched: 2,
  lost: 3,
  postpone: 5,
} as const;

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

// Map YummyAnime list ID to internal status
export function mapListIdToStatus(listId: number | undefined): AnimeStatus {
  switch (listId) {
    case 0: return 'watching';
    case 1: return 'planned';
    case 2: return 'completed';
    case 3: return 'dropped';
    case 5: return 'paused';
    default: return 'planned';
  }
}

// Map internal status to YummyAnime list ID
export function mapStatusToListId(status: AnimeStatus): YummyAnimeListId {
  switch (status) {
    case 'watching': return 0;
    case 'planned': return 1;
    case 'completed': return 2;
    case 'dropped': return 3;
    case 'paused': return 5;
    default: return 1;
  }
}

// =============================================================================
// NORMALIZATION HELPERS
// =============================================================================

// Helper to normalize anime data from YummyAnime API
export function normalizeAnimeCatalogItem(item: AnimeCatalogItem): AnimeCatalogItem {
  return {
    ...item,
    title: item.title,
    year: item.year,
  };
}

// Helper to get season name from number
export function getSeasonName(season: 1 | 2 | 3 | 4 | undefined): string {
  switch (season) {
    case 1: return 'Зима';
    case 2: return 'Весна';
    case 3: return 'Лето';
    case 4: return 'Осень';
    default: return '';
  }
}

// Helper to format episode count string
export function formatEpisodeCount(episodes: AnimeEpisodes | undefined): string {
  if (!episodes) return '';
  if (episodes.count === 0) return '?';
  if (episodes.aired === episodes.count) return `${episodes.count}`;
  return `${episodes.aired} / ${episodes.count}`;
}

// Helper to check if anime is currently airing
export function isAnimeAiring(anime: AnimeCatalogItem): boolean {
  return anime.anime_status?.alias === 'ongoing';
}

// Helper to get poster URL with fallback
export function getPosterUrl(anime: AnimeCatalogItem, size: keyof AnimePoster = 'huge'): string {
  return anime.poster?.[size] || anime.poster?.medium || anime.poster?.big || '';
}

// Helper to get rating display value
export function getRatingDisplay(rating: { average: number; counters?: number } | undefined): string {
  if (!rating) return '0.00';
  return rating.average.toFixed(2);
}