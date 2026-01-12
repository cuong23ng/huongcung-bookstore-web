import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderHistoryService, OrderDetails as OrderDetailsType } from "@/services/OrderHistoryService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const orderHistoryService = OrderHistoryService.getInstance();

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails(Number.parseInt(id));
    }
  }, [id]);

  const loadOrderDetails = async (orderId: number) => {
    setLoading(true);
    try {
      const data = await orderHistoryService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error("Failed to load order details:", error);
      if (error.message === "Authentication required") {
        toast({
          title: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập để xem chi tiết đơn hàng.",
          variant: "destructive",
        });
        navigate("/auth");
      } else if (error.message === "Access denied") {
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền xem đơn hàng này.",
          variant: "destructive",
        });
        navigate("/orders");
      } else {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải chi tiết đơn hàng. Vui lòng thử lại.",
          variant: "destructive",
        });
        navigate("/orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đã gửi hàng",
      DELIVERED: "Đã giao hàng",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại lịch sử đơn hàng
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-wide">
                Đơn hàng: {order.orderNumber}
              </h1>
              <p className="text-muted-foreground mt-2">
                Đặt ngày {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-normal">Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium"><span className="text-muted-foreground">Người nhận hàng:</span> {order.shippingAddress.name}</p>
                <p className="font-medium text-muted-foreground"><span className="text-muted-foreground">Số điện thoại:</span> {order.shippingAddress.phone}</p>
                <p className="font-medium text-muted-foreground"><span className="text-muted-foreground">Địa chỉ:</span> {order.formattedShippingAddress}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-normal">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.bookTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      ISBN: {item.isbn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity} • {item.itemType === "PHYSICAL" ? "Sách in" : "Sách điện tử"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.totalPrice)}₫</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-normal">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatPrice(order.subtotal)}₫</span>
                </div>
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span>{formatPrice(order.shippingAmount)}₫</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span>{formatPrice(order.taxAmount)}₫</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span>-{formatPrice(order.discountAmount)}₫</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(order.totalAmount)}₫</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div>
                  <p className="text-sm font-medium mb-1">Phương thức thanh toán: {order.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}





















