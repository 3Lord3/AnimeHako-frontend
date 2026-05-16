import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAnimeReviews, useAddToList, useUserAnimeList, useToggleFavorite, useUpdateListEntry } from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_ICONS, ALL_STATUSES, type StatusType } from '@/types/constants';
import { AnimeDetailPageSkeleton } from '@/components/loaders/PageSkeletons';
import { AnimeCharacteristics } from './AnimeDetailPage/components/AnimeCharacteristics';

export function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const animeId = parseInt(id || '0');
  const navigate = useNavigate();
  const { data: user } = useUser();

  const { data: anime, isLoading } = useAnimeDetail(animeId);
  const { data: reviews } = useAnimeReviews(animeId, 5);
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: addToList } = useAddToList();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: updateListEntry } = useUpdateListEntry();

  // Find user's rate for this anime
  const userAnime = userAnimeList?.find((rate) => rate.anime_id === animeId);
  const isFavorite = userAnime?.text?.includes('favorite') || false;

  const handleAddToList = (status: StatusType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If already in list with the same status, clear status
    if (userAnime?.status === status) {
      updateListEntry(
        { animeId, data: { status: null } },
        { onError: () => {} }
      );
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

  const statusOptions: StatusType[] = ALL_STATUSES;

  if (isLoading) {
    return <AnimeDetailPageSkeleton />;
  }

  if (!anime) {
    return <div className="text-center py-12">Аниме не найдено</div>;
  }

  // YummyAnime API uses 'name' and 'russian' instead of 'title'
  const displayTitle = anime.russian || anime.name;
  const englishTitle = anime.name !== anime.russian ? anime.name : null;

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

      {/* Hero with blurred background */}
      {anime.cover && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background" />
          <img
            src={getImageUrl(anime.cover)}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster column with buttons below */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={getImageUrl(anime.poster)}
            alt={displayTitle}
            className="w-64 rounded-lg shadow-lg"
          />
          {user && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={isFavorite ? 'default' : 'outline'}
                size="icon"
                onClick={handleToggleFavorite}
                className="cursor-pointer text-foreground"
                title={isFavorite ? 'В любимом' : 'В любимое'}
              >
                <Heart className={cn(
                  'w-5 h-5',
                  isFavorite ? 'fill-current text-white' : 'text-foreground'
                )} />
              </Button>
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={userAnime?.status === status ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleAddToList(status)}
                  className="cursor-pointer"
                  title={STATUS_LABELS[status]}
                >
                  <span className={userAnime?.status === status ? 'text-white' : 'text-foreground'}>
                    {STATUS_ICONS[status]}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-foreground select-text">{displayTitle}</h1>
          {englishTitle && (
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

      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Обзоры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <strong>{review.author}</strong>
                  {review.score && (
                    <Badge variant="outline">{review.score}/10</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}