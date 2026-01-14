import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookCard } from "@/components/BookCard";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthorService } from "@/services/AuthorService";
import React from "react";
import { DisplayUtils } from "@/utils/DisplayUtils";

interface AuthorBooksData {
  name: string;
  avatar: string;
  bio: string;
  books: {
    id: string;
    title: string;
    price: string;
    image?: string;
  }[];
}

const AuthorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [author, setAuthor] = React.useState<AuthorBooksData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAuthor = async () => {
      setIsLoading(true);
      try {
        const authorService = AuthorService.getInstance();
        const booksByAuthor = await authorService.getBooksByAuthor(Number.parseInt(id));
        if (booksByAuthor) {
          setAuthor({
            name: booksByAuthor.name,
            avatar: booksByAuthor.avatar || "",
            bio: booksByAuthor.biography || "",
            books: booksByAuthor.books.map(book => ({
              id: book.code,
              title: book.title,
              price: DisplayUtils.formatPrice(book.physicalPrice, book.ebookPrice),
              image: book.coverUrl,
            })),
          });
        }
      } catch (error) {
        console.error("Failed to load author:", error);
        setAuthor(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAuthor();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate("/authors")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tất cả tác giả
        </Button>

        {/* Author info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-primary/20">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-2xl">
              {author.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-light tracking-wide mb-4">
              {author.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {author.bio}
            </p>
          </div>
        </div>

        {/* Books section */}
        <div>
          <h2 className="text-xl font-light tracking-wide mb-6 border-b pb-4">
            Tác phẩm ({author.books.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {author.books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                image={book.image}
                title={book.title}
                authors={[{ name: author.name }]}
                price={book.price}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthorDetails;