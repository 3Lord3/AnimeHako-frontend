import { Link, useSearchParams } from 'react-router-dom';
import { useUserAnimeList } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl } from '@/lib/imageUrl';
import { STATUS_ICONS, STATUS_COLORS, ALL_STATUSES, type StatusType } from '@/types/constants';
import { UserAnimeListPageSkeleton } from '@/components/loaders/PageSkeletons';

export function UserAnimeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || undefined;
  const isFavorites = searchParams.get('favorites') === 'true';
  const { data: userAnimeList, isLoading } = useUserAnimeList(statusParam as StatusType | undefined, isFavorites);
  const { data: allLists } = useUserAnimeList();

  const statusLabels: Record<string, string> = {
    watching: 'Смотрю',
    rewatching: 'Пересматриваю',
    completed: 'Просмотрено',
    paused: 'Приостановлено',
    dropped: 'Брошено',
    planned: 'Запланировано',
    idle: 'В планах',
  };

  // Count by status from all lists
  const watching = allLists?.filter((a) => a.status === 'watching').length || 0;
  const rewatching = allLists?.filter((a) => a.status === 'rewatching').length || 0;
  const completed = allLists?.filter((a) => a.status === 'completed').length || 0;
  const dropped = allLists?.filter((a) => a.status === 'dropped').length || 0;
  const favoritesCount = allLists?.filter((a) => a.text?.includes('favorite')).length || 0;

  const stats = [
    { label: 'Смотрю', count: watching },
    { label: 'Пересматриваю', count: rewatching },
    { label: 'Просмотрено', count: completed },
    { label: 'Брошено', count: dropped },
    { label: 'Любимое', count: favoritesCount },
  ];

  const displayList = !statusParam && !isFavorites 
    ? allLists || [] 
    : userAnimeList || [];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">{stat.count}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <Button
            key={s}
            variant={statusParam === s ? 'default' : 'outline'}
            className={statusParam === s ? 'text-white' : 'text-foreground'}
            onClick={() =>
              setSearchParams(statusParam === s ? {} : { status: s })
            }
          >
            {statusLabels[s]}
          </Button>
        ))}
        <Button
          variant={isFavorites ? 'default' : 'outline'}
          className={isFavorites ? 'text-white' : 'text-foreground'}
          onClick={() => setSearchParams(isFavorites ? {} : { favorites: 'true' })}
        >
          Любимое
        </Button>
      </div>

      {isLoading ? (
        <UserAnimeListPageSkeleton />
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Список пуст
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayList.map((item) => {
            const displayTitle = item.anime.russian || item.anime.name || 'Unknown';
            const isFavorite = item.text?.includes('favorite') || false;
            
            return (
              <Link key={item.id || item.anime_id} to={`/anime/${item.anime_id}`} className="group block relative rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(item.anime.poster)}
                  alt={displayTitle}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-1">
                  <Badge 
                    title={statusLabels[item.status] || item.status}
                    className={`h-9 w-9 p-0 rounded-full cursor-pointer ${item.status ? STATUS_COLORS[item.status as StatusType] : 'bg-gray-500'}`}
                  >
                    <span className="flex items-center justify-center w-full h-full">
                      {STATUS_ICONS[item.status as StatusType] || STATUS_ICONS.watching}
                    </span>
                  </Badge>
                  {isFavorite && (
                    <Badge title="Избранное" className="bg-pink-500 text-white h-9 w-9 p-0 rounded-full cursor-pointer">
                      <span className="flex items-center justify-center w-full h-full text-white">
                        ♥
                      </span>
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
                  <h3 className="font-semibold text-sm text-white line-clamp-2">
                    {displayTitle}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}