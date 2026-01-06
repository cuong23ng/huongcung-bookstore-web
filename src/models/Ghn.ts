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

export interface GhnService {
  serviceId: number;
  serviceTypeId: number;
  shortName: string;
}

export interface CalculateFeeRequest {
  items: CheckoutOrderItem[];
  shippingAddress: ShippingAddress;
}

export interface CalculateFeeResponse {
  warehouseCount: number;
  // ISO date string (LocalDate) from backend
  expectedDeliveryTime: string;
  totalFee: number;
}

export interface CheckoutOrderRequest {
  items: CheckoutOrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod?: string;
  serviceTypeId?: number;
  email: string;
  fullName: string;
  phone: string;
  paymentMethod?: "COD" | "VNPAY";
}

export interface CheckoutOrderItem {
  bookId?: number; // Book ID (optional, for backward compatibility)
  bookCode?: string; // Book code (preferred)
  quantity: number;
  // Item format for backend BookType enum
  bookType: "PHYSICAL" | "EBOOK";
}

export interface CheckoutOrderResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentUrl?: string;
}

import { ShippingAddress } from "./Checkout";

