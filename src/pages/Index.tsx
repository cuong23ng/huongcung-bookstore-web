import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BestSellers, type BestSellerItem } from "@/components/BestSellers";
import { BookService } from "@/services/BookService";
import { DisplayUtils } from "@/utils/DisplayUtils";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellerItems, setBestSellerItems] = useState<BestSellerItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const bookService = BookService.getInstance();
        const bookPage = await bookService.getAllBooks(1, 20);
        const mapped: BestSellerItem[] = bookPage.books.map((b, idx) => {
          const authors = b.authors?.map(author => ({ name: author.name, id: author.id })) || [];
          return {
            id: b.code,
            title: b.title,
            authors,
            price: DisplayUtils.formatPrice(b.physicalPrice, b.ebookPrice),
            image: b.coverUrl,
          };
        });
        setBestSellerItems(mapped);
      } catch (error) {
        console.error("Failed to load books:", error);
        setBestSellerItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
      <main className="container mx-auto px-4 py-8">
        <BestSellers items={bestSellerItems} />
      </main>
    </div>
  );
};

export default Index;