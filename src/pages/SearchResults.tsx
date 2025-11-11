import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { BookService } from "@/services/BookService";
import { SearchResponse } from "@/models/Search";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookService = BookService.getInstance();

  // State
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search parameters from URL
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const size = parseInt(searchParams.get("size") || "20", 10);
  const sort = searchParams.get("sort") || "relevance";

  // Filter parameters - memoized to prevent infinite loops
  // Use searchParams.toString() as stable key for comparison
  const searchParamsKey = useMemo(() => searchParams.toString(), [searchParams]);
  const genres = useMemo(() => searchParams.getAll("genre"), [searchParamsKey]);
  const languages = useMemo(() => searchParams.getAll("language"), [searchParamsKey]);
  const formats = useMemo(() => searchParams.getAll("format"), [searchParamsKey]);
  const cities = useMemo(() => searchParams.getAll("city"), [searchParamsKey]);
  const minPrice = useMemo(() => {
    const value = searchParams.get("minPrice");
    return value ? Number(value) : undefined;
  }, [searchParamsKey]);
  const maxPrice = useMemo(() => {
    const value = searchParams.get("maxPrice");
    return value ? Number(value) : undefined;
  }, [searchParamsKey]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await bookService.searchBooks({
          q: query || undefined,
          genre: genres.length > 0 ? genres : undefined,
          language: languages.length > 0 ? languages : undefined,
          format: formats.length > 0 ? formats : undefined,
          city: cities.length > 0 ? cities : undefined,
          minPrice,
          maxPrice,
          page,
          size,
          sort,
        });

        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, size, sort, genres, languages, formats, cities, minPrice, maxPrice]);

  const handleSearch = (searchQuery: string) => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("q", searchQuery);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleFilterChange = (filters: {
    genres?: string[];
    languages?: string[];
    formats?: string[];
    cities?: string[];
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1"); // Reset to first page

    // Update genres
    newParams.delete("genre");
    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach((g) => newParams.append("genre", g));
    }

    // Update languages
    newParams.delete("language");
    if (filters.languages && filters.languages.length > 0) {
      filters.languages.forEach((l) => newParams.append("language", l));
    }

    // Update formats
    newParams.delete("format");
    if (filters.formats && filters.formats.length > 0) {
      filters.formats.forEach((f) => newParams.append("format", f));
    }

    // Update cities
    newParams.delete("city");
    if (filters.cities && filters.cities.length > 0) {
      filters.cities.forEach((c) => newParams.append("city", c));
    }

    // Update prices
    if (filters.minPrice !== undefined) {
      newParams.set("minPrice", filters.minPrice.toString());
    } else {
      newParams.delete("minPrice");
    }

    if (filters.maxPrice !== undefined) {
      newParams.set("maxPrice", filters.maxPrice.toString());
    } else {
      newParams.delete("maxPrice");
    }

    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", newSort);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pagination = searchResults?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

        {/* Filters and Results Layout */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            {searchResults && (
              <div className="sticky top-4">
                <SearchFilters
                  facets={searchResults.facets}
                  selectedGenres={genres}
                  selectedLanguages={languages}
                  selectedFormats={formats}
                  selectedCities={cities}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  {searchResults && (
                    <SearchFilters
                      facets={searchResults.facets}
                      selectedGenres={genres}
                      selectedLanguages={languages}
                      selectedFormats={formats}
                      selectedCities={cities}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onFilterChange={(filters) => {
                        handleFilterChange(filters);
                        setShowFilters(false);
                      }}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {pagination && (
                  <>
                    Hiển thị {searchResults?.books.length || 0} trong tổng số{" "}
                    {pagination.totalResults} kết quả
                  </>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-input rounded-md bg-background"
                aria-label="Sort results"
              >
                <option value="relevance">Liên quan nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="date_desc">Mới nhất</option>
                <option value="rating_desc">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && searchResults && (
              <>
                {searchResults.books.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                      {searchResults.books.map((book) => (
                        <BookCard
                          key={book.code}
                          id={book.code}
                          title={book.title}
                          authors={book.authors.map((a) => ({ name: a.name }))}
                          price="0" // Price not available in Book model
                          image={book.images?.[0]?.url}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={!pagination.hasPrevious}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            // Show first, last, current, and adjacent pages
                            return (
                              p === 1 ||
                              p === pagination.totalPages ||
                              (p >= page - 1 && p <= page + 1)
                            );
                          })
                          .map((p, idx, arr) => {
                            // Add ellipsis
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && p - prev > 1;

                            return (
                              <div key={p} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-muted-foreground">...</span>
                                )}
                                <Button
                                  variant={p === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(p)}
                                  aria-label={`Page ${p}`}
                                  aria-current={p === page ? "page" : undefined}
                                >
                                  {p}
                                </Button>
                              </div>
                            );
                          })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={!pagination.hasNext}
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium mb-2">
                      Không tìm thấy kết quả
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchParams(new URLSearchParams());
                        navigate("/");
                      }}
                    >
                      Quay về trang chủ
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;

