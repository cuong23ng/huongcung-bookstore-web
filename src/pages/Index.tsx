import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BestSellers, type BestSellerItem } from "@/components/BestSellers";
import { BookService } from "@/services/BookService";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellerItems, setBestSellerItems] = useState<BestSellerItem[]>([]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getDisplayPrice = (physicalPrice: number | null, ebookPrice: number | null): string => {
    if (physicalPrice === null && ebookPrice === null) {
      return "Liên hệ";
    }
    
    if (physicalPrice === null && ebookPrice !== null) {
      return formatPrice(ebookPrice);
    }
    
    if (ebookPrice === null && physicalPrice !== null) {
      return formatPrice(physicalPrice);
    }
    
    // Both are not null, display the smaller price with "Chỉ từ"
    const minPrice = Math.min(physicalPrice, ebookPrice);
    return `Chỉ từ ${formatPrice(minPrice)}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const bookService = BookService.getInstance();
        const bookPage = await bookService.getAllBooks(0, 20);
        const mapped: BestSellerItem[] = bookPage.books.map((b, idx) => {
          const authors = b.authors?.map(author => ({ name: author.name })) || [];
          return {
            id: b.code || String(idx),
            title: b.title,
            authors,
            price: getDisplayPrice(b.physicalPrice, b.ebookPrice),
            image: b.coverUrl,
          };
        });
        setBestSellerItems(mapped);
      } catch (error) {
        console.error("Failed to load books:", error);
        // If API fails, BestSellers component will show fallback mock data
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