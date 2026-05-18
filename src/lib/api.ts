import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// YummyAnime API Configuration
const YUMMY_API_URL = 'https://api.yani.tv';
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || '';

export const api = axios.create({
  baseURL: YUMMY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Application': APP_TOKEN,
    'Accept': 'image/avif,image/webp',
  },
});

// =============================================================================
// TYPE DEFINITIONS (matching YummyAnime API response structures)
// =============================================================================

// YummyAnime API Anime Detail Response (GET /anime/{url})
export interface YummyAnimeDetailResponse {
  anime_id: number;
  anime_status: {
    title: string;
    alias: 'released' | 'ongoing' | 'announcement';
    value: 0 | 1 | 2;
  };
  anime_url: string;
  poster: {
    small: string;
    medium: string;
    big: string;
    huge: string;
    fullsize: string;
    mega: string;
  };
  rating: {
    average: number;
    kp_rating?: number;
    anidub_rating?: number;
    counters: number;
    myanimelist_rating?: number;
    shikimori_rating?: number;
    worldart_rating?: number;
  };
  title: string;
  type: {
    name: string;
    value: number;
    shortname: string;
    alias: string;
  };
  year: number;
  description: string;
  views: number;
  season: 1 | 2 | 3 | 4;
  min_age: {
    value: 0 | 1 | 2 | 3 | 4 | 5;
    title: string;
    title_long: string;
  };
  user?: {
    list?: {
      is_fav: boolean;
      list?: {
        title: string;
        href: string;
        id: 0 | 1 | 2 | 3 | 5;
      };
    };
    rating?: number;
  };
  remote_ids?: {
    worldart_id?: number;
    worldart_type?: 'animation' | 'cinema';
    kp_id?: number;
    anidub_id?: number;
    sr_id?: number;
    anilibria_alias?: string;
    shikimori_id?: number;
    myanimelist_id?: number;
  };
  top?: {
    category: number;
    global: number;
  };
  blocked_in?: string[];
  original?: string;
  duration?: number;
  trailers_count?: number;
  lists_count?: number;
  other_titles?: string[];
  creators?: Array<{ title: string; id: number; url: string }>;
  studios?: Array<{ title: string; id: number; url: string }>;
  videos?: Array<{
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
  }>;
  genres?: Array<{
    title: string;
    id: number;
    alias: string;
    url: string;
  }>;
  viewing_order?: Array<{
    title: string;
    anime_id: number;
    type: {
      name: string;
      value: number;
      shortname: string;
      alias: string;
    };
    anime_url: string;
    anime_status: {
      title: string;
      alias: string;
      value: number;
    };
    description: string;
    poster: {
      small: string;
      medium: string;
      big: string;
      huge: string;
      fullsize: string;
      mega: string;
    };
    user?: {
      list?: {
        list: {
          title: string;
          href: string;
          id: number;
        };
        is_fav: boolean;
      };
      rating?: number;
    };
    year: number;
    data?: {
      id: number;
      index: number;
      text: string;
    };
  }>;
  translates?: Array<{
    title: string;
    href: string;
    value: number;
  }>;
  episodes?: {
    aired: number;
    count: number;
    next_date?: number;
    prev_date?: number;
  };
  comments_count?: number;
  reviews_count?: number;
  random_screenshots?: Array<{
    sizes: {
      small: string;
      full: string;
    };
    id: number;
    time: number;
    episode: string;
  }>;
  posts_count?: number;
  partner_videos_count?: number;
}

// YummyAnime API Reviews Response (GET /anime/{id}/reviews)
export interface YummyAnimeReview {
  anime_id: number;
  type: 'approved' | 'waiting' | 'declined';
  review_id: number;
  avatar?: {
    big: string;
    full: string;
    small: string;
  };
  user_roles?: string[];
  user_id?: number;
  total_likes?: number;
  nickname?: string;
  views: number;
  update_date: number;
  rating: {
    average: number;
    category: Record<string, number>;
  };
  published_by?: number;
  commentable: boolean;
  create_date: number;
  check_comment?: string;
  likes: {
    likes: number;
    dislikes: number;
    vote: number;
  };
  author: {
    id: number;
    nickname: string;
    avatars: {
      big: string;
      full: string;
      small: string;
    };
  };
  anime: YummyAnimeDetailResponse;
  comments_count?: number;
  text_preview?: string;
}

export interface YummyAnimeReviewsResponse {
  reviews: YummyAnimeReview[];
  can_add: boolean;
}

// YummyAnime API User List Response (GET /users/{id}/lists)
export interface YummyUserAnimeRate {
  rating_counters?: number;
  season?: number;
  top?: {
    global: number;
    category: number;
  };
  views?: number;
  anime_id: number;
  anime_status?: {
    title: string;
    alias: string;
    value: number;
  };
  anime_url: string;
  date: number;
  genres?: Array<{
    title: string;
    id: number;
    alias: string;
    url: string;
  }>;
  poster: {
    small: string;
    medium: string;
    big: string;
    huge: string;
    fullsize: string;
    mega: string;
  };
  rating: number;
  title: string;
  type: {
    name: string;
    value: number;
    shortname: string;
    alias: string;
  };
  user?: {
    list?: {
      is_fav: boolean;
      list?: {
        title: string;
        href: string;
        id: 0 | 1 | 2 | 3 | 5;
      };
    };
    rating?: number;
  };
  year?: number;
  remote_ids?: {
    worldart_id?: number;
    shikimori_id?: number;
    myanimelist_id?: number;
    sr_id?: number;
    kp_id?: number;
    worldart_type?: string;
  };
}

// Request interceptor: Add Authorization header with Bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
let redirectCallback: ((url: string) => void) | null = null;

export const setAuthRedirectCallback = (callback: (url: string) => void) => {
  redirectCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only clear local storage, don't redirect - let the app handle it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Don't do hard redirect here - the app should handle auth state properly
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface YummyUser {
  id: number;
  nickname: string;
  email?: string;
  about?: string;
  banned?: boolean;
  ids?: {
    shikimori?: { id: number; nickname: string };
    vk?: number;
    tg_nickname?: string;
  };
  avatars?: {
    big?: string;
    full?: string;
    small?: string;
  };
  bdate?: number | null;
  last_online?: number;
  sex?: 0 | 1 | 2;
  roles?: string[];
  register_date?: number;
  texts?: { color?: number; left?: string; right?: string };
  banner?: { cropped?: string; full?: string };
  lists_privacy?: 'public' | 'friends' | 'authed' | 'none';
  privacy?: {
    shiki_public?: boolean;
    tg_public?: boolean;
    vk_public?: boolean;
    discord_public?: boolean;
  };
  notifications?: {
    vk?: boolean;
    telegram?: boolean;
    count?: number;
  };
  messages?: { unread_count?: number };
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

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
}

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
}

export interface UserListResponse {
  id: number;
  name: string;
  user_id: number;
  anime: UserAnimeRate[];
}

export interface GenreResponse {
  id: number;
  name: string;
  russian: string | null;
  kind: string | null;
}

export interface ReviewResponse {
  id: number;
  author: string;
  anime_id: number;
  anime: string;
  titles: { en: string | null; jp: string | null; ru: string | null };
  text: string | null;
  score: number | null;
  created_at: string;
}

// =============================================================================
// AUTH API
// =============================================================================

export const authApi = {
  register: (email: string, username: string, password: string) =>
    api.post<{ user: YummyUser; tokens: AuthTokens }>('/users', {
      email,
      nickname: username,
      password,
    }),

  login: (email: string, password: string) =>
    api.post<{ response: { success: boolean; token: string } }>('/profile/login', {
      login: email,  // API expects "login" field, not "email"
      password,
      need_json: true,  // Request token in JSON response (not cookie)
    }),

  logout: () =>
    api.post('/profile/logout'),

  refreshToken: () =>
    api.post<AuthTokens>('/profile/token'),

  getProfile: () =>
    api.get<{ response: YummyUser }>('/profile').then(res => res.data.response),
};

// =============================================================================
// ANIME API
// =============================================================================

export const animeApi = {
  getCatalog: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string | string[];
    year?: string;
    kind?: string;
    status?: string;
    order?: string;
    mylist?: string;
  }) => {
    // YummyAnime API uses /anime with limit/offset pagination
    // Response format: { response: [...anime items...] }
    const offset = params?.page ? (params.page - 1) * (params.limit || 20) : undefined;
    return api.get<{ response: any[] }>('/anime', { 
      params: {
        ...params,
        offset,
        // Remove page as API uses offset
        page: undefined,
      } 
    }).then(res => res.data.response);
  },

  getById: (id: number) =>
    api.get<{ response: YummyAnimeDetailResponse }>(`/anime/${id}`)
      .then(res => res.data.response),

  getByUrl: (url: string) =>
    api.get<{ response: YummyAnimeDetailResponse }>(`/anime/${url}`)
      .then(res => res.data.response),

  getRandom: () =>
    api.get<AnimeCatalogItem[]>('/anime', { params: { limit: 1, order: 'random' } })
      .then(res => res.data[0] || null),

  getGenres: () =>
    api.get<GenreResponse[]>('/anime/genres'),
};

// =============================================================================
// USER LIST API
// =============================================================================

export const userListApi = {
  getUserLists: (userId: number) =>
    api.get<UserListResponse[]>(`/users/${userId}/lists`),

  getAnimeList: (animeId: number) =>
    api.get<UserAnimeRate>(`/anime/${animeId}/list`),

  addToList: (animeId: number, data: {
    status?: string;
    episodes?: number;
    score?: number;
    text?: string;
  }) =>
    api.put<UserAnimeRate>(`/anime/${animeId}/list`, data),

  removeFromList: (animeId: number) =>
    api.delete(`/anime/${animeId}/list`),

  addToFavorites: (animeId: number) =>
    api.put(`/anime/${animeId}/list/fav`),

  removeFromFavorites: (animeId: number) =>
    api.delete(`/anime/${animeId}/list/fav`),
};

// =============================================================================
// REVIEWS API
// =============================================================================

export const reviewsApi = {
  getByAnimeId: (animeId: number, limit?: number, offset?: number) =>
    api.get<ReviewResponse[]>(`/anime/${animeId}/reviews`, {
      params: { limit, offset },
    }),
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => localStorage.getItem('auth_token');

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const setUser = (user: YummyUser) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): YummyUser | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as YummyUser;
    } catch {
      return null;
    }
  }
  return null;
};