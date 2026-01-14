import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { AuthorService } from "@/services/AuthorService";
import React from "react";

const authors = [
  {
    id: "nguyen-nhat-anh",
    name: "Nguyễn Nhật Ánh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "nam-cao",
    name: "Nam Cao",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "to-hoai",
    name: "Tô Hoài",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "vu-trong-phung",
    name: "Vũ Trọng Phụng",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "ngo-tat-to",
    name: "Ngô Tất Tố",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "xuan-dieu",
    name: "Xuân Diệu",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "ho-anh-thai",
    name: "Hồ Anh Thái",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "nguyen-huy-thiep",
    name: "Nguyễn Huy Thiệp",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face",
  },
];

const Authors = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchAuthors = async () => {
      setIsLoading(true);
      try {
        const authorService = AuthorService.getInstance();
        const authorPage = await authorService.getAuthors(0, 20);
        const fetchedAuthors = authorPage.authors.map(author => ({
          id: author.id,
          name: author.name,
          avatar: author.image.url || '',
        }));
      } catch (error) {
        console.error("Failed to load authors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-light tracking-wide mb-8 text-center">
          Tác giả
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Khám phá các tác giả và tác phẩm của họ
        </p>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {authors.map((author) => (
            <div
              key={author.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/authors/${author.id}`)}
            >
              <Avatar className="h-24 w-24 md:h-28 md:w-28 transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-primary">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-lg">
                  {author.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-center font-medium group-hover:text-primary transition-colors">
                {author.name}
              </span>
            </div>
          ))}
         </div>
      </main>
    </div>
  );
};
export default Authors;