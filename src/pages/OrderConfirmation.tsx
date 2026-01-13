import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

interface OrderConfirmationState {
  orderNumber: string;
  orderId: number;
  totalAmount: number;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderConfirmationState;

  // Redirect if no order data
  React.useEffect(() => {
    if (!state?.orderNumber) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.orderNumber) {
    return null;
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2 border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-light tracking-wide">
              Đặt hàng thành công!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Cảm ơn bạn đã đặt hàng tại Huong Cung Bookstore
              </p>
              <p className="text-sm text-muted-foreground">
                Mã đơn hàng của bạn là:
              </p>
              <p className="text-2xl font-medium tracking-wider">
                {state.orderNumber}
              </p>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="text-lg font-medium">
                  {formatPrice(state.totalAmount)}₫
                </span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-md space-y-2">
              <p className="text-sm font-medium">Lưu ý:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Chúng tôi sẽ gửi email xác nhận đơn hàng đến địa chỉ email của bạn.</li>
                <li>Đơn hàng sẽ được xử lý trong vòng 1-2 ngày làm việc.</li>
                <li>Bạn có thể theo dõi đơn hàng trong mục "Lịch sử đơn hàng".</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Tiếp tục mua sắm
              </Button>
              <Button
                onClick={() => navigate("/orders")}
                className="flex-1"
              >
                Xem lịch sử đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

