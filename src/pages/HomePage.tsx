import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnimeList, useGenres, useDebounce, useUserAnimeList } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimeGrid } from '@/components/AnimeGrid';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Star, Calendar, X } from 'lucide-react';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const genres = searchParams.get('genres') || '';
  const year = searchParams.get('year') || '';
  const sort = searchParams.get('sort') || '';
  const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
  const kind = searchParams.get('kind') || '';

  const [searchInput, setSearchInput] = useState(search);
  const isUserTypingRef = useRef(false);

  // Sync with URL only when navigating (not on user typing)
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setSearchInput(search);
    }
  }, [search]);

  const clearSearch = () => {
    setSearchInput('');
    isUserTypingRef.current = false;
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  };

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genreSearchInput, setGenreSearchInput] = useState('');

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
    }
  }, [debouncedSearch, search, searchParams, setSearchParams]);

  // Build query params for YummyAnime API
  const queryParams = {
    page: 1,
    limit: 100,
    search: search || undefined,
    genre: genres ? genres.split(',') : undefined,
    year: year || undefined,
    order: sort === 'rating' ? 'score' : sort === 'year' ? 'aired_on' : sort || undefined,
  };

  const { data: animeData, isLoading } = useAnimeList(queryParams);
  const { data: genresData } = useGenres();
  const { data: userAnimeList } = useUserAnimeList();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const toggleGenre = (genreName: string) => {
    const currentGenres = genres ? genres.split(',') : [];
    const newGenres = currentGenres.includes(genreName)
      ? currentGenres.filter((g) => g !== genreName)
      : [...currentGenres, genreName];
    updateParams('genres', newGenres.join(','));
  };

  const toggleYear = (yearValue: string) => {
    const currentYears = year ? year.split(',') : [];
    const newYears = currentYears.includes(yearValue)
      ? currentYears.filter((y) => y !== yearValue)
      : [...currentYears, yearValue];
    updateParams('year', newYears.join(','));
  };

  // Filter genres by search
  const filteredGenres = useMemo(() => {
    if (!genresData) return [];
    // Ensure genresData is an array
    const genresArray = Array.isArray(genresData) ? genresData : (genresData as any).data || [];
    if (!genreSearchInput) return genresArray;
    const searchLower = genreSearchInput.toLowerCase();
    return genresArray.filter((genre: any) => 
      (genre.name?.toLowerCase().includes(searchLower)) || 
      (genre.russian?.toLowerCase().includes(searchLower))
    );
  }, [genresData, genreSearchInput]);

  // Get years range (2010-2025)
  const allYears = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

  // Rating filter options
  const ratingOptions = [9, 8, 7, 6];

  // Clear all filters (only filters, not search)
  const clearFiltersOnly = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('genres');
    params.delete('year');
    params.delete('rating');
    params.delete('sort');
    params.delete('kind');
    setSearchParams(params);
  };

  const hasActiveFilters = genres || year || minRating || sort || kind;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск аниме..."
              value={searchInput}
              onChange={(e) => {
                isUserTypingRef.current = true;
                setSearchInput(e.target.value);
              }}
              className="pl-10 pr-10"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Button
              variant="outline"
              className="relative cursor-pointer text-foreground"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <DialogContent 
              className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto"
              style={{ maxWidth: '42rem' }}
              showCloseButton={false}
            >
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-semibold">Фильтры</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Rating filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Минимальный рейтинг</h4>
                  <div className="flex flex-wrap gap-2">
                    {ratingOptions.map((r) => (
                      <Badge
                        key={r}
                        variant={minRating === r ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => updateParams('rating', minRating === r ? '' : String(r))}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {r}+
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Year filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Год выпуска</h4>
                  <div className="flex flex-wrap gap-2">
                    {allYears.map((y) => (
                      <Badge
                        key={y}
                        variant={year.split(',').includes(y) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleYear(y)}
                      >
                        {y}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Genres filter with search */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Жанры</h4>
                  <Input
                    placeholder="Поиск жанров..."
                    value={genreSearchInput}
                    onChange={(e) => setGenreSearchInput(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {filteredGenres.map((genre: { id: number; name: string; russian: string | null }) => (
                      <Badge
                        key={genre.id}
                        variant={genres.split(',').includes(genre.name) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleGenre(genre.name)}
                      >
                        {genre.russian || genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear and apply buttons */}
                <div className="flex gap-2 pt-4 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={clearFiltersOnly}
                  >
                    Очистить
                  </Button>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Готово
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick filters row */}
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant={sort === 'rating' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer text-foreground"
            onClick={() => updateParams('sort', sort === 'rating' ? '' : 'rating')}
          >
            <Star className="w-4 h-4 mr-1" />
            По рейтингу
          </Button>
          <Button
            variant={sort === 'year' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer text-foreground"
            onClick={() => updateParams('sort', sort === 'year' ? '' : 'year')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            По году
          </Button>

          {/* Active filters badges */}
          {year && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('year', '')}>
              Год: {year.split(',').length > 1 ? `${year.split(',').length} годов` : year}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {minRating && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('rating', '')}>
              Рейтинг: {minRating}+
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {genres && (
            <Button variant="secondary" size="sm" onClick={() => updateParams('genres', '')}>
              Жанры: {genres.split(',').length}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFiltersOnly}>
              Очистить фильтры
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <AnimeGrid anime={[]} isLoading={true} />
      ) : animeData?.data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Аниме не найдены
        </div>
      ) : (
        <AnimeGrid anime={animeData?.data || []} userAnimeList={userAnimeList} />
      )}
    </div>
  );
}