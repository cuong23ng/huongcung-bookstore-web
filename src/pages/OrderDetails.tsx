import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderHistoryService, OrderDetails as OrderDetailsType } from "@/services/OrderHistoryService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Package } from "lucide-react";

const orderHistoryService = OrderHistoryService.getInstance();

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails(parseInt(id));
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

  const parseShippingAddress = (addressJson?: string) => {
    if (!addressJson) return null;
    try {
      return JSON.parse(addressJson);
    } catch {
      return null;
    }
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

  const shippingAddress = parseShippingAddress(order.shippingAddress);

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
                      Mã sách: {item.bookCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity} • {item.itemType === "PHYSICAL" ? "Sách in" : "Sách điện tử"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.totalPrice)}₫</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unitPrice)}₫/sản phẩm
                    </p>
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
                  <p className="text-sm font-medium mb-1">Phương thức thanh toán:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Trạng thái thanh toán:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-normal">Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
                <p className="text-sm text-muted-foreground">{shippingAddress.address}</p>
                {order.deliveryInfo && (
                  <p className="text-sm text-muted-foreground mt-2">
                    GHN Tracking: {order.deliveryInfo.ghnOrderCode || "Chưa có mã vận đơn"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Info */}
        {order.deliveryInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-normal">Thông tin vận chuyển</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {order.deliveryInfo.provinceId && (
                  <div>
                    <p className="text-muted-foreground">Tỉnh/Thành phố:</p>
                    <p className="font-medium">ID: {order.deliveryInfo.provinceId}</p>
                  </div>
                )}
                {order.deliveryInfo.districtId && (
                  <div>
                    <p className="text-muted-foreground">Quận/Huyện:</p>
                    <p className="font-medium">ID: {order.deliveryInfo.districtId}</p>
                  </div>
                )}
                {order.deliveryInfo.wardCode && (
                  <div>
                    <p className="text-muted-foreground">Phường/Xã:</p>
                    <p className="font-medium">{order.deliveryInfo.wardCode}</p>
                  </div>
                )}
                {order.deliveryInfo.expectedDeliveryTime && (
                  <div>
                    <p className="text-muted-foreground">Thời gian dự kiến:</p>
                    <p className="font-medium">{order.deliveryInfo.expectedDeliveryTime}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}





















