/**
 * Shipping address data structure
 */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city?: string; // Legacy field for backward compatibility
  postalCode?: string; // Optional
  // GHN address fields
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
}

export interface CustomerInfo {
  email: string;
  fullName: string;
  phone: string;
}

/**
 * Shipping method options
 */
export type ShippingMethod = "standard" | "express";

/**
 * Shipping method details
 */
export interface ShippingMethodOption {
  value: ShippingMethod;
  label: string;
  cost: number;
  estimatedDays: string;
}

/**
 * Payment method options
 */
export type PaymentMethod = "COD" | "VNPAY";

/**
 * Checkout form data
 */
export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  saveAsDefault: boolean;
}

/**
 * Shipping method costs (in VND)
 */
export const SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    value: "standard",
    label: "Giao hàng tiêu chuẩn",
    cost: 30000,
    estimatedDays: "5-7 ngày",
  },
  {
    value: "express",
    label: "Giao hàng nhanh",
    cost: 50000,
    estimatedDays: "2-3 ngày",
  },
];

/**
 * Get shipping method by value
 */
export function getShippingMethod(value: ShippingMethod): ShippingMethodOption {
  return SHIPPING_METHODS.find((method) => method.value === value) || SHIPPING_METHODS[0];
}










