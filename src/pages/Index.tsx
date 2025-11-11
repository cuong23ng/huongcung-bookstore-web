import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BestSellers, type BestSellerItem } from "@/components/BestSellers";
import { BookService } from "@/services/BookService";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellerItems, setBestSellerItems] = useState<BestSellerItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const bookService = BookService.getInstance();
        const books = await bookService.getAllBooks();
        const mapped: BestSellerItem[] = books.map((b, idx) => ({
          id: b.code || String(idx),
          title: b.title,
          authors: b.authors?.map(author => ({ name: author.name })) || [],
          price: "0",
          image: b.images?.[0]?.url,
        }));
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