import { ApiClient } from "@/integrations/ApiClient";
import { AxiosInstance } from "axios";
import { ApiResponse } from "@/models";
import { API_CONFIG } from "@/config/api.config";

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
  isbn: string;
  bookTitle: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProvinceDTO {
  provinceId: string;
  provinceName: string;
}

export interface DistrictDTO {
  districtId: string;
  districtName: string;
}

export interface WardDTO {
  wardCode: string;
  wardName: string;
}

export interface AddressDTO {
  serviceTypeId?: string;
  name: string;
  phone: string;
  address: string;
  province?: ProvinceDTO;
  district?: DistrictDTO;
  ward?: WardDTO;
  postalCode?: string;
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  paymentMethod?: string;
  orderType: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress?: AddressDTO;
  formattedShippingAddress?: string;
  notes?: string;
  items: OrderItem[];
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[];
  pagination: PaginationInfo;
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
  async getOrderHistory(page: number = 0, size: number = 20): Promise<OrderHistoryResponse> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<OrderHistoryResponse>>(
        API_CONFIG.endpoints.order.history,
        {
          params: { page, size },
        }
      );
      if (!response.data?.data) {
        throw new Error("Invalid response from server");
      }
      return response.data.data;
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
        API_CONFIG.endpoints.order.orderDetails(orderId)
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





















