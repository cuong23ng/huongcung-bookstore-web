import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className={paymentStatus === "success" ? "border-2 border-green-500" : paymentStatus === "failed" ? "border-2 border-red-500" : "border-2 border-yellow-500"}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {paymentStatus === "success" ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : paymentStatus === "failed" ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : (
                <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
              )}
            </div>
            <CardTitle className="text-2xl font-light tracking-wide">
              {paymentStatus === "success" 
                ? "Thanh toán thành công!" 
                : paymentStatus === "failed" 
                ? "Thanh toán thất bại"
                : "Đang xử lý"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {paymentStatus === "success" 
                  ? "Cảm ơn bạn đã thanh toán tại Huong Cung Bookstore"
                  : message}
              </p>
              {orderNumber && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Mã đơn hàng của bạn là:
                  </p>
                  <p className="text-2xl font-medium tracking-wider">
                    {orderNumber}
                  </p>
                </>
              )}
            </div>

            {paymentStatus === "success" && (
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <p className="text-sm font-medium">Lưu ý:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Chúng tôi sẽ gửi email xác nhận đơn hàng đến địa chỉ email của bạn.</li>
                  <li>Đơn hàng sẽ được xử lý trong vòng 1-2 ngày làm việc.</li>
                  <li>Bạn có thể theo dõi đơn hàng trong mục "Lịch sử đơn hàng".</li>
                </ul>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <p className="text-sm font-medium">Lưu ý:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{message}</li>
                  <li>Vui lòng thử lại thanh toán hoặc chọn phương thức thanh toán khác.</li>
                  <li>Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.</li>
                </ul>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="flex-1"
              >
                {paymentStatus === "success" ? "Tiếp tục mua sắm" : "Về trang chủ"}
              </Button>
              {paymentStatus === "success" && (
                <Button
                  onClick={handleViewOrder}
                  className="flex-1"
                >
                  Xem lịch sử đơn hàng
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      {/* <Footer /> */}
    </div>
  );
}





