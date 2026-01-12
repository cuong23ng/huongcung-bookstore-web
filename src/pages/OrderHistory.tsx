import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderHistoryService, OrderHistoryItem, OrderHistoryResponse } from "@/services/OrderHistoryService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package } from "lucide-react";

const orderHistoryService = OrderHistoryService.getInstance();

export default function OrderHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderHistoryService.getOrderHistory(page, 20);
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setTotalElements(data.pagination.totalResults);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      if (error.message === "Authentication required") {
        toast({
          title: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập để xem lịch sử đơn hàng.",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.",
          variant: "destructive",
        });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-light tracking-wide">Lịch sử đơn hàng</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">Chưa có đơn hàng nào</p>
              <Button onClick={() => navigate("/")} variant="outline">
                Tiếp tục mua sắm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-medium">
                            Đơn hàng: {order.orderNumber}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Ngày đặt: {formatDate(order.createdAt)}</p>
                          <p>
                            {order.itemCount} sản phẩm •{" "}
                            {order.paymentStatus === "PAID"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {formatPrice(order.totalAmount)}₫
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.id}`);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page + 1} / {totalPages} ({totalElements} đơn hàng)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}





















