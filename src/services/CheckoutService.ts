import { ApiClient } from "@/integrations/ApiClient";
import { AxiosInstance } from "axios";
import { CheckoutFormData } from "@/models/Checkout";
import {
  GhnProvince,
  GhnDistrict,
  GhnWard,
  CalculateFeeRequest,
  CalculateFeeResponse,
  CheckoutOrderRequest,
  CheckoutOrderResponse,
} from "@/models/Ghn";
import { ApiResponse } from "@/models";

const CHECKOUT_FORM_STORAGE_KEY = "hc_bookstore_checkout_form";

/**
 * Service for managing checkout form data persistence and GHN API integration
 */
export class CheckoutService {
  private static instance: CheckoutService;
  private readonly apiFetcher: AxiosInstance;

  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService();
    }
    return CheckoutService.instance;
  }

  /**
   * Save checkout form data to localStorage
   */
  saveFormData(formData: CheckoutFormData): void {
    try {
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save checkout form data:", error);
    }
  }

  /**
   * Load checkout form data from localStorage
   */
  loadFormData(): CheckoutFormData | null {
    try {
      const data = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as CheckoutFormData;
      }
    } catch (error) {
      console.error("Failed to load checkout form data:", error);
    }
    return null;
  }

  /**
   * Clear checkout form data from localStorage
   */
  clearFormData(): void {
    try {
      localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear checkout form data:", error);
    }
  }

  /**
   * Get GHN provinces
   */
  async getGhnProvinces(): Promise<GhnProvince[]> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<any[]>>(
        "/checkout/ghn/provinces"
      );
      const rawData = response.data?.data ?? [];
      // Transform from API format (ProvinceID, ProvinceName) to frontend format (provinceId, provinceName)
      return rawData.map((item: any) => ({
        provinceId: item.ProvinceID ?? item.provinceId,
        provinceName: item.ProvinceName ?? item.provinceName,
      })).filter((item: GhnProvince) => item.provinceId != null);
    } catch (error) {
      console.error("Failed to fetch GHN provinces:", error);
      throw error;
    }
  }

  /**
   * Get GHN districts for a province
   */
  async getGhnDistricts(provinceId: number): Promise<GhnDistrict[]> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<any[]>>(
        "/checkout/ghn/districts",
        {
          params: { provinceId },
        }
      );
      const rawData = response.data?.data ?? [];
      // Transform from API format to frontend format
      return rawData.map((item: any) => ({
        districtId: item.DistrictID ?? item.districtId,
        districtName: item.DistrictName ?? item.districtName,
        provinceId: item.ProvinceID ?? item.provinceId ?? provinceId,
      })).filter((item: GhnDistrict) => item.districtId != null);
    } catch (error) {
      console.error("Failed to fetch GHN districts:", error);
      throw error;
    }
  }

  /**
   * Get GHN wards for a district
   */
  async getGhnWards(districtId: number): Promise<GhnWard[]> {
    try {
      const response = await this.apiFetcher.get<ApiResponse<any[]>>(
        "/checkout/ghn/wards",
        {
          params: { districtId },
        }
      );
      const rawData = response.data?.data ?? [];
      // Transform from API format to frontend format
      return rawData.map((item: any) => ({
        wardCode: item.WardCode ?? item.wardCode,
        wardName: item.WardName ?? item.wardName,
        districtId: item.DistrictID ?? item.districtId ?? districtId,
      })).filter((item: GhnWard) => item.wardCode != null);
    } catch (error) {
      console.error("Failed to fetch GHN wards:", error);
      throw error;
    }
  }

  /**
   * Calculate delivery fee using GHN API
   */
  async calculateDeliveryFee(request: CalculateFeeRequest): Promise<CalculateFeeResponse> {
    try {
      const response = await this.apiFetcher.post<ApiResponse<CalculateFeeResponse>>(
        "/checkout/ghn/calculate-fee",
        request
      );
      if (!response.data?.data) {
        throw new Error("Invalid response from fee calculation API");
      }
      return response.data.data;
    } catch (error) {
      console.error("Failed to calculate delivery fee:", error);
      throw error;
    }
  }

  /**
   * Create order
   */
  async createOrder(request: CheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    try {
      const response = await this.apiFetcher.post<ApiResponse<CheckoutOrderResponse>>(
        "/checkout/orders",
        request
      );
      if (!response.data?.data) {
        throw new Error("Invalid response from order creation API");
      }
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to create order:", error);
      // Extract error message from response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}










