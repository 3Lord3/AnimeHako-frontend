import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi, userListApi, reviewsApi } from '@/lib/api';
import { useUser } from './useAuth';
import type { UserAnimeUpdate, AnimeStatus } from '@/types';
import { mapStatusToListId } from '@/types';

// =============================================================================
// ANIME LIST / CATALOG
// =============================================================================

export function useAnimeList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string | string[];
  year?: string;
  min_rating?: number;
  kind?: string;
  status?: string;
  order?: string;
  mylist?: string;
}) {
  return useQuery({
    queryKey: ['anime', 'catalog', params],
    queryFn: async () => {
      const response = await animeApi.getCatalog(params);
      
      let animeArray: any[] = [];
      
      // Check if response is an object with numeric keys (new API format)
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        const keys = Object.keys(response);
        // Check if keys are numeric (0, 1, 2...)
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
          animeArray = Object.values(response);
        }
      } else if (response && response.data && Array.isArray(response.data.response)) {
        animeArray = response.data.response;
      } else if (Array.isArray(response)) {
        animeArray = response;
      }
      
      // Normalize anime items for backward compatibility
      const normalizedData = (animeArray || [])
        .filter((item): item is NonNullable<typeof item> => item != null)
        .map((item: any) => {
        // Get ID - API uses 'anime_id'
        const id = item.anime_id;
        
        // Extract poster URL - API returns object with different sizes
        let posterUrl = null;
        if (item.poster) {
          if (typeof item.poster === 'string') {
            posterUrl = item.poster;
          } else if (item.poster.huge) {
            posterUrl = item.poster.huge;
          } else if (item.poster.mega) {
            posterUrl = item.poster.mega;
          } else if (item.poster.big) {
            posterUrl = item.poster.big;
          } else if (item.poster.medium) {
            posterUrl = item.poster.medium;
          } else if (item.poster.small) {
            posterUrl = item.poster.small;
          }
        }
        
        // Extract score/rating - API uses rating.average
        let scoreStr = null;
        if (item.rating?.average != null) {
          const avg = item.rating.average;
          scoreStr = avg != null ? String(avg.toFixed(2)) : null;
        }
        
        // Extract kind/type - API uses type.alias (tv, movie, ova, etc.)
        const kind = item.type?.alias ?? null;
        
        // Extract status - API uses anime_status.title
        const status = item.anime_status?.title || null;
        
        // Extract year
        const year = item.year || null;
        
        // Extract description
        const description = item.description || null;
        
        return {
          id: id,
          name: item.title || '',
          russian: item.title || null,
          poster: posterUrl,
          cover: null, // API doesn't provide separate cover field
          url: item.anime_url || String(id),
          kind: kind,
          score: scoreStr,
          status: status,
          episodes: item.episodes || null,
          episodes_aired: item.episodes_aired || null,
          aired_on: item.aired_on || null,
          released_on: item.released_on || null,
          // Additional fields
          title: item.title,
          description: description,
          duration: item.duration,
          rating: item.rating,
          genres: item.genres,
          year: year,
        };
      });
      
      return {
        data: normalizedData,
        page: 1,
        total_pages: 1,
        total: normalizedData.length,
      };
    },
  });
}

// =============================================================================
// ANIME DETAIL
// =============================================================================

export function useAnimeDetail(idOrUrl: string | number) {
  return useQuery({
    queryKey: ['anime', 'detail', idOrUrl],
    queryFn: async () => {
      const response = await animeApi.getByUrl(String(idOrUrl));
      
      // Handle object response with numeric keys (new API format)
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        const keys = Object.keys(response);
        if (keys.length === 1 && !isNaN(Number(keys[0]))) {
          return response[keys[0]];
        }
      }
      
      return response;
    },
    enabled: !!idOrUrl,
  });
}

// =============================================================================
// RANDOM ANIME
// =============================================================================

export function useRandomAnime() {
  return useQuery({
    queryKey: ['anime', 'random'],
    queryFn: async () => {
      const randomAnime = await animeApi.getRandom();
      if (!randomAnime) return null;
      
      // Fetch full details for the random anime
      const { data } = await animeApi.getById(randomAnime.id);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// =============================================================================
// ANIME SCREENSHOTS (from detail)
// =============================================================================

export function useAnimeScreenshots(id: number) {
  return useQuery({
    queryKey: ['anime', 'screenshots', id],
    queryFn: async () => {
      const { data } = await animeApi.getById(id);
      return data.screenshots || [];
    },
    enabled: !!id,
  });
}

// =============================================================================
// ANIME REVIEWS
// =============================================================================

export function useAnimeReviews(id: number, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['anime', 'reviews', id, limit, offset],
    queryFn: async () => {
      const { data } = await reviewsApi.getByAnimeId(id, limit, offset);
      return data;
    },
    enabled: !!id,
  });
}

// =============================================================================
// GENRES
// =============================================================================

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data } = await animeApi.getGenres();
      return data;
    },
  });
}

// =============================================================================
// USER ANIME LIST
// =============================================================================

export function useUserAnimeList(status?: AnimeStatus, favorites?: boolean) {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['user', 'anime', status, favorites],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // If status is provided, use specific list endpoint
        if (status) {
          const listId = mapStatusToListId(status);
          const { data } = await userListApi.getUserList(user.id, listId);
          const rates = data.response || [];
          return favorites 
            ? rates.filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true)
            : rates;
        }
        
        // Otherwise get all lists and combine
        const { data } = await userListApi.getUserLists(user.id);
        const rates = data.response || [];
        
        if (favorites) {
          // Filter anime that have is_fav = true (YummyAnime API)
          return rates.filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true);
        }
        
        return rates;
      } catch (error: unknown) {
        // Return empty array on auth errors to prevent redirect on public pages
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            return [];
          }
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

// =============================================================================
// USER ANIME RATE FOR SPECIFIC ANIME
// =============================================================================

export function useUserAnimeRate(animeId: number) {
  return useQuery({
    queryKey: ['user', 'anime', 'rate', animeId],
    queryFn: async () => {
      try {
        const { data } = await userListApi.getAnimeList(animeId);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!animeId,
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { animeId: number; status: AnimeStatus; episodes?: number; score?: number; text?: string }) =>
      userListApi.addToList(data.animeId, {
        list: mapStatusToListId(data.status),
        episodes: data.episodes,
        score: data.score,
        text: data.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useUpdateListEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animeId, data }: { animeId: number; data: UserAnimeUpdate }) =>
      userListApi.addToList(animeId, {
        list: data.status ? mapStatusToListId(data.status) : undefined,
        episodes: data.episodes,
        score: data.score,
        text: data.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (animeId: number) => userListApi.removeFromList(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ animeId, isFavorite }: { animeId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        return userListApi.removeFromFavorites(animeId);
      } else {
        return userListApi.addToFavorites(animeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'anime'] });
    },
  });
}

// =============================================================================
// FAVORITES
// =============================================================================

export function useFavorites() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get all lists and filter favorites
        const { data } = await userListApi.getUserLists(user.id);
        return data.filter((rate: YummyUserAnimeRate) => rate.user?.list?.is_fav === true);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            return [];
          }
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}