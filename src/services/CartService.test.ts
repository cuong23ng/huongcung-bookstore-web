import { describe, it, expect, beforeEach, vi } from "vitest";
import { CartService } from "./CartService";
import { Cart, CartItem } from "@/models/Cart";
import { Book } from "@/models";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CartService", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockBook: Book = {
    code: "book-1",
    title: "Test Book",
    authors: [{ name: "Test Author" }],
    translators: [],
    images: [{ url: "https://example.com/book.jpg" }],
    hasPhysicalEdition: true,
    hasElectricEdition: false,
  };

  const mockCartItem: CartItem = {
    id: "item-1",
    bookId: "book-1",
    book: mockBook,
    format: "physical",
    quantity: 2,
    price: 100000,
    subtotal: 200000,
  };

  const mockCart: Cart = {
    items: [mockCartItem],
    subtotal: 200000,
    shippingEstimate: 0,
    total: 200000,
  };

  it("should save cart to localStorage", () => {
    CartService.saveCart(mockCart);

    const saved = localStorageMock.getItem("hc_bookstore_cart");
    expect(saved).toBeTruthy();

    const parsed = JSON.parse(saved!);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.subtotal).toBe(200000);
  });

  it("should load cart from localStorage", () => {
    localStorageMock.setItem("hc_bookstore_cart", JSON.stringify(mockCart));

    const loaded = CartService.loadCart();
    expect(loaded).toBeTruthy();
    expect(loaded?.items).toHaveLength(1);
    expect(loaded?.subtotal).toBe(200000);
    expect(loaded?.total).toBe(200000);
  });

  it("should return null when cart doesn't exist", () => {
    const loaded = CartService.loadCart();
    expect(loaded).toBeNull();
  });

  it("should clear cart from localStorage", () => {
    localStorageMock.setItem("hc_bookstore_cart", JSON.stringify(mockCart));
    CartService.clearCart();

    const saved = localStorageMock.getItem("hc_bookstore_cart");
    expect(saved).toBeNull();
  });

  it("should get item count from cart", () => {
    localStorageMock.setItem("hc_bookstore_cart", JSON.stringify(mockCart));

    const count = CartService.getItemCount();
    expect(count).toBe(2); // quantity of the item
  });

  it("should return 0 when cart doesn't exist for getItemCount", () => {
    const count = CartService.getItemCount();
    expect(count).toBe(0);
  });

  it("should handle invalid JSON gracefully", () => {
    localStorageMock.setItem("hc_bookstore_cart", "invalid json");

    // Should not throw, but return null
    const loaded = CartService.loadCart();
    expect(loaded).toBeNull();
  });

  it("should handle missing items array gracefully", () => {
    const invalidCart = {
      subtotal: 0,
      shippingEstimate: 0,
      total: 0,
    };
    localStorageMock.setItem("hc_bookstore_cart", JSON.stringify(invalidCart));

    const loaded = CartService.loadCart();
    expect(loaded).toBeNull();
  });
});

