import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "./components/AppSidebar";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BookDetails from "./pages/BookDetails";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import Authors from "./pages/Authors";
import AuthorDetails from "./pages/AuthorDetails";
//import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/auth";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!isAuthRoute && <AppSidebar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/confirmation" element={<OrderConfirmation />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:id" element={<AuthorDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
