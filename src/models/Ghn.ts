/**
 * GHN API response types
 */
export interface GhnProvince {
  provinceId: number;
  provinceName: string;
}

export interface GhnDistrict {
  districtId: number;
  districtName: string;
  provinceId: number;
}

export interface GhnWard {
  wardCode: string;
  wardName: string;
  districtId: number;
}

export interface CalculateFeeRequest {
  districtId: number;
  wardCode: string;
  weight: number; // in grams
  serviceTypeId?: number;
}

export interface CalculateFeeResponse {
  total: number;
  serviceFee: number;
  expectedDeliveryTime?: string;
}

export interface CheckoutOrderRequest {
  items: CheckoutOrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod?: string;
}

export interface CheckoutOrderItem {
  bookId?: number; // Book ID (optional, for backward compatibility)
  bookCode?: string; // Book code (preferred)
  quantity: number;
  itemType: "PHYSICAL" | "DIGITAL";
}

export interface CheckoutOrderResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
}

import { ShippingAddress } from "./Checkout";

