import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useUpdateProfile } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfilePageSkeleton } from '@/components/loaders/PageSkeletons';

// Helper function to format timestamp to date string
function formatDate(timestamp: number | undefined | null): string {
  if (!timestamp) return 'Неизвестно';
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format last online time
function formatLastOnline(timestamp: number | undefined | null): string {
  if (!timestamp) return 'Был(а) давно';
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Онлайн';
  if (minutes < 60) return `Был(а) ${minutes} мин. назад`;
  if (hours < 24) return `Был(а) ${hours} ч. назад`;
  if (days < 7) return `Был(а) ${days} дн. назад`;
  return `Был(а) ${formatDate(timestamp)}`;
}

// Helper function to get role badge variant
function getRoleVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const roleLower = role.toLowerCase();
  if (roleLower === 'admin' || roleLower === 'администратор') return 'destructive';
  if (roleLower === 'moderator' || roleLower === 'модератор') return 'secondary';
  return 'outline';
}

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Для просмотра профиля необходимо войти</p>
        <Link to="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditNickname(user.nickname);
    setIsEditing(true);
  };

  const handleUpdateProfile = () => {
    updateProfile(
      { nickname: editNickname },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatars?.full || undefined} />
              <AvatarFallback className="text-2xl">
                {user.nickname[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="Имя пользователя"
                  />
                  <Button onClick={handleUpdateProfile}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.nickname}</h1>
                  {user.email && <p className="text-muted-foreground">{user.email}</p>}
                  
                  {/* User roles badges */}
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={getRoleVariant(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatLastOnline(user.last_online)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    className="mt-2"
                  >
                    Изменить имя
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User info card */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration date */}
            <div>
              <p className="text-sm text-muted-foreground">Дата регистрации</p>
              <p className="font-medium">{formatDate(user.register_date)}</p>
            </div>

            {/* Last online */}
            <div>
              <p className="text-sm text-muted-foreground">Последний вход</p>
              <p className="font-medium">{formatLastOnline(user.last_online)}</p>
            </div>

            {/* Linked accounts */}
            {user.ids && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Связанные аккаунты</p>
                <div className="flex gap-3 mt-1">
                  {user.ids.shikimori && (
                    <span className="text-sm">Shikimori: {user.ids.shikimori.nickname}</span>
                  )}
                  {user.ids.vk && (
                    <span className="text-sm">VK: {user.ids.vk}</span>
                  )}
                  {user.ids.tg_nickname && (
                    <span className="text-sm">Telegram: {user.ids.tg_nickname}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About */}
          {user.about && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">О себе</p>
              <p className="mt-1">{user.about}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}