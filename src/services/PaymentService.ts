import { ApiClient } from "@/integrations/ApiClient";
import type { AxiosInstance } from "axios";
import { AxiosError } from "axios";
import type { ApiResponse } from "@/models";
import { API_CONFIG } from "@/config/api.config";

/**
 * Service for handling payment operations
 */
export class PaymentService {
  private static instance: PaymentService;
  private readonly apiFetcher: AxiosInstance;

  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create VNPay payment URL for an order
   * @param orderNumber The order number
   * @param amount The order amount
   * @param paymentMethod The payment method (VNPAY, COD, etc.)
   * @returns The payment URL to redirect to
   */
  async createPaymentUrl(orderNumber: string, amount: number, paymentMethod: string = 'VNPAY'): Promise<string> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<string>>(
        API_CONFIG.endpoints.payment.createUrl,
        {
          params: {
            orderNumber,
            amount,
            paymentMethod,
          },
        }
      );
      
      // Check if there's an error code (BaseResponse structure)
      if (response.data.errorCode) {
        throw new Error(response.data.message || 'Failed to create payment URL');
      }

      // Extract data from BaseResponse
      const data = response.data.data;
      if (!data || typeof data !== 'string') {
        throw new Error(response.data.message || 'Invalid payment URL from server');
      }

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = 
          (error.response?.data as any)?.error?.message ||
          (error.response?.data as any)?.message ||
          error.message ||
          'Failed to create payment URL. Please try again.';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}






