import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Extract VNPay response parameters
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTxnRef = searchParams.get("vnp_TxnRef");
    const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");
    const vnpSecureHash = searchParams.get("vnp_SecureHash");

    // Set order number from transaction reference
    if (vnpTxnRef) {
      setOrderNumber(vnpTxnRef);
    }

    // Check payment status
    if (vnpResponseCode === "00" && vnpTransactionStatus === "00") {
      // Payment successful
      setPaymentStatus("success");
      setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
    } else if (vnpResponseCode && vnpResponseCode !== "00") {
      // Payment failed
      setPaymentStatus("failed");
      const errorMessages: Record<string, string> = {
        "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
        "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
        "10": "Xác thực giao dịch không thành công do: Nhập sai quá 3 lần mật khẩu thanh toán/OTP",
        "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
        "12": "Thẻ/Tài khoản bị khóa.",
        "13": "Nhập sai mật khẩu xác thực giao dịch (OTP).",
        "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
        "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
        "75": "Ngân hàng thanh toán đang bảo trì.",
        "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
      };
      setMessage(
        errorMessages[vnpResponseCode] ||
          `Thanh toán thất bại. Mã lỗi: ${vnpResponseCode}`
      );
    } else {
      // Pending or unknown status
      setPaymentStatus("pending");
      setMessage("Đang xử lý kết quả thanh toán...");
    }

    setLoading(false);
  }, [searchParams]);

  const handleViewOrder = () => {
    if (orderNumber) {
      navigate("/orders", { state: { highlightOrder: orderNumber } });
    } else {
      navigate("/orders");
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            {paymentStatus === "success" ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Thanh toán thành công!</CardTitle>
              </div>
            ) : paymentStatus === "failed" ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-100 p-4">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <CardTitle className="text-2xl">Thanh toán thất bại</CardTitle>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-yellow-100 p-4">
                  <Loader2 className="h-16 w-16 text-yellow-600 animate-spin" />
                </div>
                <CardTitle className="text-2xl">Đang xử lý</CardTitle>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">{message}</p>
              {orderNumber && (
                <p className="text-sm text-muted-foreground">
                  Mã đơn hàng: <span className="font-medium text-foreground">{orderNumber}</span>
                </p>
              )}
            </div>

            {paymentStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
                  Chúng tôi sẽ gửi email xác nhận đến địa chỉ email bạn đã cung cấp.
                </p>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Vui lòng thử lại thanh toán hoặc chọn phương thức thanh toán khác.
                  Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {paymentStatus === "success" && (
                <Button
                  onClick={handleViewOrder}
                  className="flex-1"
                  size="lg"
                >
                  Xem đơn hàng
                </Button>
              )}
              <Button
                onClick={handleBackToHome}
                variant={paymentStatus === "success" ? "outline" : "default"}
                className="flex-1"
                size="lg"
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}





