import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/components/CartItem";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, shippingEstimate, total, updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleProceedToCheckout = () => {
    if (items.length > 0) {
      navigate("/checkout");
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-7xl">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-6" />
            <h1 className="text-2xl font-light tracking-wide mb-4">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá thêm những cuốn sách thú vị!
            </p>
            <Button
              variant="default"
              className="rounded-none font-normal px-8"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Trang chủ
            </button>
            <span>/</span>
            <span className="text-foreground">Giỏ hàng</span>
          </div>
        </nav>

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            <h1 className="text-2xl font-light tracking-wide mb-6">Giỏ hàng của bạn</h1>
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit">
            <Card className="border border-border sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-normal tracking-wide mb-6 uppercase">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-normal">{formatPrice(subtotal)}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển (ước tính):</span>
                    <span className="font-normal">{formatPrice(shippingEstimate)}₫</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between">
                    <span className="text-base font-normal">Tổng cộng:</span>
                    <span className="text-lg font-normal">{formatPrice(total)}₫</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-none font-normal h-12"
                  onClick={handleProceedToCheckout}
                >
                  Tiến hành thanh toán
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-none font-normal"
                  onClick={() => navigate("/")}
                >
                  Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

