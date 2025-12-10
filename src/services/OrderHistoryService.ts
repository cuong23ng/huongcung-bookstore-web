import { ApiClient } from "@/integrations/ApiClient";
import { AxiosInstance } from "axios";
import { ApiResponse } from "@/models";

export interface OrderHistoryItem {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  bookCode: string;
  bookTitle: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryInfo {
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  serviceTypeId?: number;
  serviceId?: number;
  expectedDeliveryTime?: string;
  ghnOrderCode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  orderType: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress?: string; // JSON string
  billingAddress?: string; // JSON string
  notes?: string;
  items: OrderItem[];
  deliveryInfo?: DeliveryInfo;
}

export interface OrderHistoryPage {
  content: OrderHistoryItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export class OrderHistoryService {
  private static instance: OrderHistoryService;
  private readonly apiFetcher: AxiosInstance;

  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  static getInstance(): OrderHistoryService {
    if (!OrderHistoryService.instance) {
      OrderHistoryService.instance = new OrderHistoryService();
    }
    return OrderHistoryService.instance;
  }

  /**
   * Get order history with pagination
   */
  async getOrderHistory(page: number = 0, size: number = 20): Promise<OrderHistoryPage> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<OrderHistoryPage>>(
        "/customer/orders",
        {
          params: { page, size },
        }
      );
      return response.data?.data ?? {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
        first: true,
        last: true,
      };
    } catch (error: any) {
      console.error("Failed to fetch order history:", error);
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      throw error;
    }
  }

  /**
   * Get order details by order ID
   */
  async getOrderDetails(orderId: number): Promise<OrderDetails> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<OrderDetails>>(
        `/customer/orders/${orderId}`
      );
      if (!response.data?.data) {
        throw new Error("Order not found");
      }
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      if (error.response?.status === 403) {
        throw new Error("Access denied");
      }
      if (error.response?.status === 404) {
        throw new Error("Order not found");
      }
      throw error;
    }
  }
}





















