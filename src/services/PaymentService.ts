import { ApiClient } from "@/integrations/ApiClient";
import type { AxiosInstance } from "axios";
import { AxiosError } from "axios";
import type { ApiResponse } from "@/models";

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
   * @param orderId The order ID
   * @returns The payment URL to redirect to
   */
  async createPaymentUrl(orderId: number): Promise<string> {
    try {
      const response = await this.apiFetcher.get<any>(
        `/payment/create-payment/${orderId}`
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






