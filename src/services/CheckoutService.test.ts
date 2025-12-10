import { describe, it, expect, beforeEach } from "vitest";
import { CheckoutService } from "./CheckoutService";
import { CheckoutFormData } from "@/models/Checkout";

describe("CheckoutService", () => {
  let service: CheckoutService;

  beforeEach(() => {
    service = CheckoutService.getInstance();
    localStorage.clear();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = CheckoutService.getInstance();
      const instance2 = CheckoutService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("saveFormData", () => {
    it("should save form data to localStorage", () => {
      const formData: CheckoutFormData = {
        shippingAddress: {
          fullName: "Nguyễn Văn A",
          phone: "0912345678",
          address: "123 Đường ABC",
          city: "Hà Nội",
          postalCode: "100000",
        },
        shippingMethod: "standard",
        saveAsDefault: false,
      };

      service.saveFormData(formData);

      const saved = localStorage.getItem("hc_bookstore_checkout_form");
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(formData);
    });
  });

  describe("loadFormData", () => {
    it("should load form data from localStorage", () => {
      const formData: CheckoutFormData = {
        shippingAddress: {
          fullName: "Nguyễn Văn A",
          phone: "0912345678",
          address: "123 Đường ABC",
          city: "Hà Nội",
          postalCode: "100000",
        },
        shippingMethod: "express",
        saveAsDefault: true,
      };

      localStorage.setItem("hc_bookstore_checkout_form", JSON.stringify(formData));

      const loaded = service.loadFormData();
      expect(loaded).toEqual(formData);
    });

    it("should return null if no data exists", () => {
      const loaded = service.loadFormData();
      expect(loaded).toBeNull();
    });
  });

  describe("clearFormData", () => {
    it("should remove form data from localStorage", () => {
      const formData: CheckoutFormData = {
        shippingAddress: {
          fullName: "Nguyễn Văn A",
          phone: "0912345678",
          address: "123 Đường ABC",
          city: "Hà Nội",
          postalCode: "100000",
        },
        shippingMethod: "standard",
        saveAsDefault: false,
      };

      service.saveFormData(formData);
      expect(localStorage.getItem("hc_bookstore_checkout_form")).toBeTruthy();

      service.clearFormData();
      expect(localStorage.getItem("hc_bookstore_checkout_form")).toBeNull();
    });
  });
});






























