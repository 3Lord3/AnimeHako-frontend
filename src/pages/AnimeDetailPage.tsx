import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAnimeReviews, useAddToList, useUserAnimeList, useToggleFavorite, useUpdateListEntry, useRemoveFromList } from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_ICONS } from '@/types/constants';
import { mapStatusToListId } from '@/types';
import { AnimeDetailPageSkeleton } from '@/components/loaders/PageSkeletons';
import { AnimeCharacteristics } from './AnimeDetailPage/components/AnimeCharacteristics';
import type { AnimeStatus } from '@/types';

export function AnimeDetailPage() {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const { data: anime, isLoading } = useAnimeDetail(url || '');
  const { data: reviews } = useAnimeReviews(anime?.anime_id || 0, 5);

  // Extract anime_id from API response
  const animeId = anime?.anime_id || 0;
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: addToList } = useAddToList();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: updateListEntry } = useUpdateListEntry();
  const { mutate: removeFromList } = useRemoveFromList();

  // Find user's rate for this anime
  // YummyAnime API: userAnimeList items have anime_id directly
  const userAnime = userAnimeList?.find((rate) => rate.anime_id === animeId);
  // YummyAnime API: is_favorite is stored in user.list.is_fav on anime object
  const isFavorite = anime?.user?.list?.is_fav || false;
  // YummyAnime API: user status list ID (number: 0-5)
  const userListId: number | null = anime?.user?.list?.list?.id ?? userAnime?.list?.id ?? null;

  const handleAddToList = (status: AnimeStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Use proper mapping function from types
    const statusId = mapStatusToListId(status);
    // If already in list with the same status, remove from list
    if (userListId === statusId) {
      removeFromList(animeId, { onError: () => {} });
    } else if (userAnime) {
      // If already in list, update status instead of adding new
      updateListEntry(
        { animeId, data: { status } },
        { onError: () => {} }
      );
    } else {
      addToList(
        { animeId, status, episodes: 0 },
        { onError: () => {} }
      );
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite({ animeId, isFavorite });
  };

  // Статусы списков: watching, planned, completed, dropped, paused
  // 'favourite' - это не статус списка, а флаг is_fav (отдельная кнопка Heart)
  const statusOptions: AnimeStatus[] = ['watching', 'planned', 'completed', 'paused', 'dropped'];

  if (isLoading) {
    return <AnimeDetailPageSkeleton />;
  }

  if (!anime) {
    return <div className="text-center py-12">Аниме не найдено</div>;
  }

  // YummyAnime API uses 'title' field directly
  const displayTitle = anime.title;
  // YummyAnime API may have other_titles for alternative names
  const otherTitles = anime.other_titles;
  const englishTitle = otherTitles && otherTitles.length > 0 ? otherTitles[0] : null;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="cursor-pointer text-foreground hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      {/* Hero with blurred background - YummyAnime uses poster.huge or poster.big */}
      {anime.poster && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background" />
          <img
            src={getImageUrl(anime.poster.huge || anime.poster.big || anime.poster.fullsize)}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster column with buttons below */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={getImageUrl(anime.poster?.medium || anime.poster?.big || anime.poster?.huge)}
            alt={displayTitle}
            className="w-64 rounded-lg shadow-lg"
          />
          {user && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={isFavorite ? 'default' : 'outline'}
                size="icon"
                onClick={handleToggleFavorite}
                className="cursor-pointer"
                title={isFavorite ? 'В любимом' : 'В любимое'}
              >
                <Heart className={cn(
                  'w-5 h-5',
                  isFavorite ? 'fill-current text-primary-foreground' : 'text-foreground'
                )} />
              </Button>
              {statusOptions.map((status) => {
                  const statusId = mapStatusToListId(status);
                  const isActive = userListId === statusId;
                  return (
                  <Button
                    key={status}
                    variant={isActive ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleAddToList(status)}
                    className="cursor-pointer"
                    title={STATUS_LABELS[status]}
                  >
                    <span className={cn(isActive && 'text-primary-foreground')}>
                      {STATUS_ICONS[status]}
                    </span>
                  </Button>
                  )
                })}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-foreground select-text">{displayTitle}</h1>
          {englishTitle && englishTitle !== displayTitle && (
            <p className="text-xl text-muted-foreground select-text">{englishTitle}</p>
          )}

          <AnimeCharacteristics anime={anime} />
        </div>
      </div>

      {/* Description Section */}
      {anime.description && (
        <Card>
          <CardHeader>
            <CardTitle className="select-text">Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap select-text">{anime.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section - YummyAnime API structure */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Обзоры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.review_id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  {/* YummyAnime: author is an object with nickname */}
                  <strong>{review.author?.nickname || 'Anonymous'}</strong>
                  {/* YummyAnime: rating is an object with average */}
                  {review.rating?.average && (
                    <Badge variant="outline">{review.rating.average}/10</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {review.create_date 
                      ? new Date(review.create_date * 1000).toLocaleDateString('ru-RU')
                      : ''}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.text_preview || review.text_html}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}