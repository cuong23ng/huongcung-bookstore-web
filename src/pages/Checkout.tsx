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
import { CartItem } from "@/components/CartItem";
import { useCart } from "@/contexts/CartContext";
import { CheckoutFormData, ShippingAddress, SHIPPING_METHODS, getShippingMethod } from "@/models";
import { GhnProvince, GhnDistrict, GhnWard } from "@/models";
import { CheckoutService } from "@/services/CheckoutService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const checkoutService = CheckoutService.getInstance();

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

const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(["standard", "express"], {
    required_error: "Vui lòng chọn phương thức vận chuyển",
  }),
  saveAsDefault: z.boolean().default(false),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [shippingCost, setShippingCost] = useState(0);
  
  // GHN address data
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
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
      shippingMethod: "standard",
      saveAsDefault: false,
    },
  });

  const shippingMethod = watch("shippingMethod");
  const saveAsDefault = watch("saveAsDefault");
  const selectedProvinceId = watch("shippingAddress.provinceId");
  const selectedDistrictId = watch("shippingAddress.districtId");
  const selectedWardCode = watch("shippingAddress.wardCode");

  // Load provinces on mount
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
    
    if (ghnApiAvailable) {
      loadProvinces();
    }
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
    if (!selectedWardCode || !selectedDistrictId || !ghnApiAvailable) {
      // Use default shipping method cost if GHN unavailable
      if (shippingMethod) {
        const method = getShippingMethod(shippingMethod);
        setShippingCost(method.cost);
      }
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
          serviceTypeId: shippingMethod === "express" ? 1 : 2,
        });
        
        setShippingCost(feeResponse.total);
      } catch (error) {
        console.error("Failed to calculate delivery fee:", error);
        // Fallback to default shipping method cost
        if (shippingMethod) {
          const method = getShippingMethod(shippingMethod);
          setShippingCost(method.cost);
        }
      } finally {
        setCalculatingFee(false);
      }
    };
    
    calculateFee();
  }, [selectedWardCode, selectedDistrictId, shippingMethod, items, ghnApiAvailable]);

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
      };

      // Call order creation API
      const orderResponse = await checkoutService.createOrder(orderRequest);

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

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-light tracking-wide">Thông tin giao hàng</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shipping Address Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-normal">Địa chỉ giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={(value) => setValue("shippingMethod", value as "standard" | "express")}
                  >
                    <div className="space-y-4">
                      {SHIPPING_METHODS.map((method) => (
                        <div
                          key={method.value}
                          className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent/50 transition-colors"
                        >
                          <RadioGroupItem value={method.value} id={method.value} />
                          <Label
                            htmlFor={method.value}
                            className="flex-1 cursor-pointer font-normal"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{method.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {method.estimatedDays}
                                </div>
                              </div>
                              <div className="font-medium">{formatPrice(method.cost)}₫</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {errors.shippingMethod && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.shippingMethod.message}
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
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










