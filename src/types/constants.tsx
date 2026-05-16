import { Eye, CheckCircle, XCircle, CalendarClock, Heart, RotateCcw, Pause } from 'lucide-react';
import type { AnimeStatus } from '@/types';

export type StatusType = AnimeStatus;

export const STATUS_ICONS: Record<StatusType, React.ReactNode> = {
  watching: <Eye size={24} strokeWidth={2.5} />,
  rewatching: <RotateCcw size={24} strokeWidth={2.5} />,
  completed: <CheckCircle size={24} strokeWidth={2.5} />,
  paused: <Pause size={24} strokeWidth={2.5} />,
  dropped: <XCircle size={24} strokeWidth={2.5} />,
  planned: <CalendarClock size={24} strokeWidth={2.5} />,
  idle: <CalendarClock size={24} strokeWidth={2.5} />,
};

export const STATUS_COLORS: Record<StatusType, string> = {
  watching: 'bg-blue-500 text-white',
  rewatching: 'bg-purple-500 text-white',
  completed: 'bg-green-500 text-white',
  paused: 'bg-yellow-500 text-white',
  dropped: 'bg-red-500 text-white',
  planned: 'bg-yellow-600 text-white',
  idle: 'bg-gray-500 text-white',
};

export const STATUS_LABELS: Record<StatusType, string> = {
  watching: 'Смотрю',
  rewatching: 'Пересматриваю',
  completed: 'Просмотрено',
  paused: 'Приостановлено',
  dropped: 'Брошено',
  planned: 'Запланировано',
  idle: 'В планах',
};

export const ALL_STATUSES: StatusType[] = ['watching', 'rewatching', 'completed', 'paused', 'dropped', 'planned', 'idle'];

export const FAVORITE_ICON = <Heart size={24} strokeWidth={2.5} />;

export const SEASON_LABELS: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

export const KIND_LABELS: Record<string, string> = {
  tv: 'TV сериал',
  movie: 'Фильм',
  ova: 'OVA',
  onu: 'ONA',
  special: 'Спешл',
  music: 'Клип',
};

export function getRatingColor(rating: number | string | null): string {
  if (rating === null || rating === undefined) return 'bg-gray-500 text-white';
  const r = typeof rating === 'number' ? rating : parseFloat(rating);
  if (isNaN(r)) return 'bg-gray-500 text-white';
  if (r >= 8) return 'bg-green-500 text-white';
  if (r >= 6) return 'bg-yellow-500 text-black';
  return 'bg-red-500 text-white';
}

export function getKindIcon(kind: string | null): string {
  const kindMap: Record<string, string> = {
    tv: '📺',
    movie: '🎬',
    ova: '💿',
    onu: '🌐',
    special: '⭐',
    music: '🎵',
  };
  return kindMap[kind || ''] || '📺';
}