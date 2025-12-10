import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { CheckoutFormData } from "@/models";
import { GhnProvince, GhnDistrict, GhnWard, GhnService } from "@/models";
import { CheckoutService } from "@/services/CheckoutService";
import { PaymentService } from "@/services/PaymentService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { CheckoutLineItem } from "@/components/CheckoutLineItem";

const checkoutService = CheckoutService.getInstance();
const paymentService = PaymentService.getInstance();

// Zod schema for shipping address validation with GHN fields
const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Tên phải có ít nhất 2 ký tự" }).max(100),
  phone: z.string().regex(/^\d{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" }),
  address: z.string().trim().min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự" }).max(200),
  // GHN address fields
  provinceId: z.number().optional(),
  districtId: z.number().optional(),
  wardCode: z.string().optional(),
  // Legacy fields for backward compatibility
  city: z.string().optional(),
  postalCode: z.string().optional(),
}).refine(
  (data) => data.provinceId && data.districtId && data.wardCode,
  {
    message: "Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, và Phường/Xã",
    path: ["wardCode"],
  }
);

const customerInfoSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }).min(1, { message: "Email là bắt buộc" }),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  customerInfo: customerInfoSchema,
  shippingMethod: z.enum(["standard", "express"], {
    required_error: "Vui lòng chọn phương thức vận chuyển",
  }),
  paymentMethod: z.enum(["COD", "VNPAY"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
  saveAsDefault: z.boolean().default(false),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [shippingCost, setShippingCost] = useState(0);
  
  // GHN address data
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [services, setServices] = useState<GhnService[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | undefined>(undefined);
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [ghnApiAvailable, setGhnApiAvailable] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        fullName: "",
        phone: "",
        address: "",
        provinceId: undefined,
        districtId: undefined,
        wardCode: "",
      },
      customerInfo: {
        email: "",
        fullName: "",
        phone: "",
      },
      shippingMethod: "standard",
      paymentMethod: "COD",
      saveAsDefault: false,
    },
  });

  const shippingMethod = watch("shippingMethod");
  const paymentMethod = watch("paymentMethod");
  const saveAsDefault = watch("saveAsDefault");
  const selectedProvinceId = watch("shippingAddress.provinceId");
  const selectedDistrictId = watch("shippingAddress.districtId");
  const selectedWardCode = watch("shippingAddress.wardCode");

  // Load provinces and services on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await checkoutService.getGhnProvinces();
        setProvinces(data);
        setGhnApiAvailable(true);
      } catch (error) {
        console.error("Failed to load provinces:", error);
        setGhnApiAvailable(false);
        toast({
          title: "Cảnh báo",
          description: "Không thể tải danh sách địa chỉ. Vui lòng nhập thủ công.",
          variant: "destructive",
        });
      } finally {
        setLoadingProvinces(false);
      }
    };

    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const data = await checkoutService.getGhnServices();
        // Filter out services with invalid serviceTypeId
        const validServices = data.filter(s => s.serviceTypeId != null);
        setServices(validServices);
        console.log(validServices);
        // Set default service if available
        if (validServices.length > 0) {
          setSelectedServiceTypeId(validServices[0].serviceTypeId);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
        toast({
          title: "Cảnh báo",
          description: "Không thể tải danh sách phương thức vận chuyển.",
          variant: "destructive",
        });
      } finally {
        setLoadingServices(false);
      }
    };
    
    if (ghnApiAvailable) {
      loadProvinces();
    }
    loadServices();
  }, [ghnApiAvailable, toast]);

  // Load districts when province is selected
  useEffect(() => {
    if (!selectedProvinceId || !ghnApiAvailable) return;
    
    const loadDistricts = async () => {
      setLoadingDistricts(true);
      setDistricts([]);
      setWards([]);
      setValue("shippingAddress.districtId", undefined);
      setValue("shippingAddress.wardCode", "");
      
      try {
        const data = await checkoutService.getGhnDistricts(selectedProvinceId);
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách quận/huyện. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    loadDistricts();
  }, [selectedProvinceId, ghnApiAvailable, setValue, toast]);

  // Load wards when district is selected
  useEffect(() => {
    if (!selectedDistrictId || !ghnApiAvailable) return;
    
    const loadWards = async () => {
      setLoadingWards(true);
      setWards([]);
      setValue("shippingAddress.wardCode", "");
      
      try {
        const data = await checkoutService.getGhnWards(selectedDistrictId);
        setWards(data);
      } catch (error) {
        console.error("Failed to load wards:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phường/xã. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setLoadingWards(false);
      }
    };
    
    loadWards();
  }, [selectedDistrictId, ghnApiAvailable, setValue, toast]);

  // Calculate delivery fee when ward is selected
  useEffect(() => {
    if (!selectedWardCode || !selectedDistrictId || !ghnApiAvailable || !selectedServiceTypeId) {
      return;
    }
    
    const calculateFee = async () => {
      setCalculatingFee(true);
      try {
        // Calculate total weight from cart items (simplified: assume 500g per physical book)
        const totalWeight = items
          .filter(item => item.format === "physical")
          .reduce((sum, item) => sum + item.quantity * 500, 1000); // Minimum 1kg
        
        const feeResponse = await checkoutService.calculateDeliveryFee({
          districtId: selectedDistrictId,
          wardCode: selectedWardCode,
          weight: totalWeight,
          serviceTypeId: selectedServiceTypeId,
        });
        
        setShippingCost(feeResponse.total);
      } catch (error) {
        console.error("Failed to calculate delivery fee:", error);
        setShippingCost(0);
      } finally {
        setCalculatingFee(false);
      }
    };
    
    calculateFee();
  }, [selectedWardCode, selectedDistrictId, selectedServiceTypeId, items, ghnApiAvailable]);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = checkoutService.loadFormData();
    if (savedData) {
      setValue("shippingAddress", savedData.shippingAddress);
      setValue("shippingMethod", savedData.shippingMethod);
      setValue("saveAsDefault", savedData.saveAsDefault);
    }
  }, [setValue]);

  // Save form data on change
  useEffect(() => {
    const subscription = watch((data) => {
      if (data.shippingAddress && data.shippingMethod) {
        checkoutService.saveFormData(data as CheckoutFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Transform cart items to order items
      const orderItems = items.map(item => ({
        bookCode: item.bookId, // bookId in cart is actually the book code
        quantity: item.quantity,
        itemType: item.format.toUpperCase() as "PHYSICAL" | "DIGITAL",
      }));

      // Create order request
      const orderRequest = {
        items: orderItems,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        serviceTypeId: selectedServiceTypeId,
        email: data.customerInfo.email,
        fullName: data.shippingAddress.fullName,
        phone: data.shippingAddress.phone,
        paymentMethod: data.paymentMethod,
      };

      // Call order creation API
      const orderResponse = await checkoutService.createOrder(orderRequest);

      // Handle payment based on payment method
      if (data.paymentMethod === "VNPAY") {
        try {
          // Get VNPay payment URL
          const paymentUrl = await paymentService.createPaymentUrl(orderResponse.orderId);
          
          // Clear cart and form data
          clearCart();
          checkoutService.clearFormData();
          
          // Redirect to VNPay payment page
          window.location.href = paymentUrl;
          return; // Don't navigate to confirmation page
        } catch (error: any) {
          console.error("Failed to create payment URL:", error);
          toast({
            title: "Lỗi thanh toán",
            description: error.message || "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
            variant: "destructive",
          });
          return; // Don't proceed if payment URL creation fails
        }
      } else {
        // COD - proceed normally
      // Clear cart and form data
      clearCart();
      checkoutService.clearFormData();

      // Navigate to order confirmation
      navigate("/checkout/confirmation", {
        state: {
          orderNumber: orderResponse.orderNumber,
          orderId: orderResponse.orderId,
          totalAmount: orderResponse.totalAmount,
        },
      });
      }
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast({
        title: "Lỗi đặt hàng",
        description: error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return null; // Will redirect
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
            <button
              onClick={() => navigate("/cart")}
              className="hover:text-foreground transition-colors"
            >
              Giỏ hàng
            </button>
            <span>/</span>
            <span className="text-foreground">Thanh toán</span>
          </div>
        </nav>

        <div className="grid md:grid-cols-[1fr_440px] gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-light tracking-wide">Thông tin giao hàng</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shipping Address Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-normal">Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      {...register("customerInfo.email")}
                      placeholder="Nhập email"
                    />
                    {errors.customerInfo?.email && (
                      <p className="text-sm text-destructive">
                        {errors.customerInfo?.email.message}
                      </p>
                    )}
                  </div>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      {...register("shippingAddress.fullName")}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.shippingAddress?.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      {...register("shippingAddress.phone")}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.shippingAddress?.phone && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Địa chỉ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      {...register("shippingAddress.address")}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                    {errors.shippingAddress?.address && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.address.message}
                      </p>
                    )}
                  </div>

                  {/* Province */}
                  <div className="space-y-2">
                    <Label htmlFor="province">
                      Tỉnh/Thành phố <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedProvinceId?.toString() || ""}
                      onValueChange={(value) => {
                        setValue("shippingAddress.provinceId", parseInt(value));
                        setValue("shippingAddress.districtId", undefined);
                        setValue("shippingAddress.wardCode", "");
                      }}
                      disabled={!ghnApiAvailable || loadingProvinces}
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces
                          .filter((province) => province && province.provinceId != null)
                          .map((province) => (
                            <SelectItem key={province.provinceId} value={province.provinceId.toString()}>
                              {province.provinceName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {loadingProvinces && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tải danh sách...</span>
                      </div>
                    )}
                    {errors.shippingAddress?.provinceId && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.provinceId.message}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-2">
                    <Label htmlFor="district">
                      Quận/Huyện <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedDistrictId?.toString() || ""}
                      onValueChange={(value) => {
                        setValue("shippingAddress.districtId", parseInt(value));
                        setValue("shippingAddress.wardCode", "");
                      }}
                      disabled={!selectedProvinceId || !ghnApiAvailable || loadingDistricts}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder={loadingDistricts ? "Đang tải..." : selectedProvinceId ? "Chọn quận/huyện" : "Chọn tỉnh/thành phố trước"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts
                          .filter((district) => district && district.districtId != null)
                          .map((district) => (
                            <SelectItem key={district.districtId} value={district.districtId.toString()}>
                              {district.districtName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {loadingDistricts && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tải danh sách...</span>
                      </div>
                    )}
                    {errors.shippingAddress?.districtId && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.districtId.message}
                      </p>
                    )}
                  </div>

                  {/* Ward */}
                  <div className="space-y-2">
                    <Label htmlFor="ward">
                      Phường/Xã <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedWardCode || ""}
                      onValueChange={(value) => setValue("shippingAddress.wardCode", value)}
                      disabled={!selectedDistrictId || !ghnApiAvailable || loadingWards}
                    >
                      <SelectTrigger id="ward">
                        <SelectValue placeholder={loadingWards ? "Đang tải..." : selectedDistrictId ? "Chọn phường/xã" : "Chọn quận/huyện trước"} />
                      </SelectTrigger>
                      <SelectContent>
                        {wards
                          .filter((ward) => ward && ward.wardCode != null)
                          .map((ward) => (
                            <SelectItem key={ward.wardCode} value={ward.wardCode}>
                              {ward.wardName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {loadingWards && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tải danh sách...</span>
                      </div>
                    )}
                    {errors.shippingAddress?.wardCode && (
                      <p className="text-sm text-destructive">
                        {errors.shippingAddress.wardCode.message}
                      </p>
                    )}
                  </div>

                  {/* Save as default */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="saveAsDefault"
                      checked={saveAsDefault}
                      onCheckedChange={(checked) => setValue("saveAsDefault", checked === true)}
                    />
                    <Label
                      htmlFor="saveAsDefault"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Lưu làm địa chỉ mặc định
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-normal">Phương thức vận chuyển</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingServices ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Đang tải...</span>
                    </div>
                  ) : services.length > 0 ? (
                    <RadioGroup
                      value={selectedServiceTypeId?.toString() || ""}
                      onValueChange={(value) => {
                        const serviceTypeId = Number.parseInt(value, 10);
                        if (!Number.isNaN(serviceTypeId)) {
                          setSelectedServiceTypeId(serviceTypeId);
                          // Update form value for validation
                          const validServices = services.filter(s => s.serviceTypeId != null);
                          const selectedService = validServices.find(s => s.serviceTypeId === serviceTypeId);
                          if (selectedService && validServices.length > 0) {
                            setValue("shippingMethod", selectedService.serviceTypeId === validServices[0]?.serviceTypeId ? "standard" : "express");
                          }
                        }
                      }}
                    >
                      <div className="space-y-4">
                        {services
                          .filter((service) => service.serviceTypeId != null)
                          .map((service) => (
                            <div
                              key={service.serviceTypeId}
                              className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent/50 transition-colors"
                            >
                              <RadioGroupItem 
                                value={service.serviceTypeId.toString()} 
                                id={`service-${service.serviceTypeId}`} 
                              />
                              <Label
                                htmlFor={`service-${service.serviceTypeId}`}
                                className="flex-1 cursor-pointer font-normal"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{service.shortName || "N/A"}</div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      Không có phương thức vận chuyển nào khả dụng.
                    </p>
                  )}
                  {errors.shippingMethod && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.shippingMethod.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-normal">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod || "COD"}
                    onValueChange={(value) => setValue("paymentMethod", value as "COD" | "VNPAY")}
                  >
                    <div className="space-y-4">
                      {/* COD Option */}
                      <Label
                        htmlFor="payment-cod"
                        className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value="COD" id="payment-cod" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Wallet className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                                <div className="text-sm text-muted-foreground">
                                  Thanh toán bằng tiền mặt khi nhận hàng
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>

                      {/* VNPay Option */}
                      <Label
                        htmlFor="payment-vnpay"
                        className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value="VNPAY" id="payment-vnpay" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Thanh toán qua VNPay</div>
                                <div className="text-sm text-muted-foreground">
                                  Thanh toán trực tuyến qua cổng thanh toán VNPay
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.paymentMethod && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Continue Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-none font-normal h-12"
                disabled={isSubmitting || calculatingFee}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  "Đặt hàng"
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="h-fit">
            <Card className="border border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-normal tracking-wide uppercase">
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <CheckoutLineItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-normal">{formatPrice(subtotal)}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-normal">
                      {calculatingFee ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Đang tính...
                        </span>
                      ) : (
                        formatPrice(shippingCost) + "₫"
                      )}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between">
                    <span className="text-base font-normal">Tổng cộng:</span>
                    <span className="text-lg font-normal">{formatPrice(total)}₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}










