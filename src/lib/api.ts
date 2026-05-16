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
  },
});

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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (redirectCallback) {
        redirectCallback('/login');
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface YummyUser {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  created?: string;
  updated?: string;
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
    api.post<{ user: YummyUser; tokens: AuthTokens }>('/profile/login', {
      email,
      password,
    }),

  logout: () =>
    api.post('/profile/logout'),

  refreshToken: () =>
    api.post<AuthTokens>('/profile/token'),

  getProfile: () =>
    api.get<YummyUser>('/profile'),
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
    });
  },

  getById: (id: number) =>
    api.get<AnimeDetailResponse>(`/anime/${id}`),

  getByUrl: (url: string) =>
    api.get<AnimeDetailResponse>(`/anime/${url}`),

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

  getMyLists: () =>
    api.get<UserListResponse[]>('/profile/lists'),

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