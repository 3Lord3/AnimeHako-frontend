import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Film, Building2, Tag } from 'lucide-react';
import { SEASON_LABELS, KIND_LABELS } from '@/types/constants';
import type { AnimeDetailResponse } from '@/types';

interface CharacteristicItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function CharacteristicItem({ label, value, icon }: CharacteristicItemProps) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium select-text">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-foreground select-text font-medium">
        {value}
      </div>
    </div>
  );
}

interface AnimeCharacteristicsProps {
  anime: AnimeDetailResponse;
  className?: string;
}

// Helper to extract year from aired_on date
function extractYear(airedOn: string | null): number | null {
  if (!airedOn) return null;
  const year = parseInt(airedOn.split('-')[0]);
  return isNaN(year) ? null : year;
}

// Helper to extract season from aired_on date
function extractSeason(airedOn: string | null): string | null {
  if (!airedOn) return null;
  const month = parseInt(airedOn.split('-')[1]);
  if (isNaN(month)) return null;
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'autumn';
}

export function AnimeCharacteristics({ anime, className }: AnimeCharacteristicsProps) {
  const year = extractYear(anime.aired_on);
  const season = extractSeason(anime.aired_on);
  const genres = anime.genre?.map(g => g.russian || g.name) || [];
  const studios = anime.studio || [];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 ${className || ''}`}>
      <CharacteristicItem
        label="Рейтинг"
        icon={<Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
        value={
          anime.rating && !isNaN(parseFloat(anime.rating)) ? (
            <span className="font-medium text-foreground">{parseFloat(anime.rating).toFixed(1)}</span>
          ) : anime.score && !isNaN(parseFloat(anime.score)) ? (
            <span className="font-medium text-foreground">{parseFloat(anime.score).toFixed(1)}</span>
          ) : null
        }
      />
      <CharacteristicItem
        label="Год"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={year ? <span className="text-foreground">{year}</span> : null}
      />
      <CharacteristicItem
        label="Сезон"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={season ? <span className="text-foreground">{SEASON_LABELS[season] || season}</span> : null}
      />
      <CharacteristicItem
        label="Тип"
        value={
          anime.kind ? (
            <Badge variant="secondary">
              {KIND_LABELS[anime.kind] || anime.kind}
            </Badge>
          ) : null
        }
      />
      <CharacteristicItem
        label="Статус"
        value={
          anime.status ? (
            <Badge variant={anime.status === 'ongoing' ? 'default' : 'secondary'}>
              {anime.status === 'ongoing' ? 'Онгоинг' : anime.status === 'released' ? 'Вышло' : anime.status}
            </Badge>
          ) : null
        }
      />
      <CharacteristicItem
        label="Эпизоды"
        icon={<Film className="w-3.5 h-3.5" />}
        value={
          anime.episodes ? (
            <span className="text-foreground">
              {anime.episodes} эп.
              {anime.episodes_aired && anime.episodes_aired > 0 && ` (вышло ${anime.episodes_aired})`}
            </span>
          ) : anime.episodes_aired ? (
            <span className="text-foreground">{anime.episodes_aired} эп.</span>
          ) : null
        }
      />
      <CharacteristicItem
        label="Длительность"
        icon={<Clock className="w-3.5 h-3.5" />}
        value={anime.duration && anime.duration > 0 ? <span className="text-foreground">{anime.duration} мин.</span> : null}
      />
      {studios.length > 0 && (
        <CharacteristicItem
          label="Студия"
          icon={<Building2 className="w-3.5 h-3.5" />}
          value={<span className="text-foreground">{studios.join(', ')}</span>}
        />
      )}
      <CharacteristicItem
        label="Жанры"
        icon={<Tag className="w-3.5 h-3.5" />}
        value={
          genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 5).map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              {genres.length > 5 && (
                <Badge variant="outline">+{genres.length - 5}</Badge>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
}