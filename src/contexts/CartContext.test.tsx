import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";
import { Book } from "@/models";
import { renderWithProviders } from "@/test/utils";

// Mock CartService
vi.mock("@/services/CartService", () => ({
  CartService: {
    loadCart: vi.fn(() => null),
    saveCart: vi.fn(),
    clearCart: vi.fn(),
  },
}));

const mockBook: Book = {
  code: "book-1",
  title: "Test Book",
  authors: [{ name: "Test Author" }],
  translators: [],
  images: [{ url: "https://example.com/book.jpg" }],
  hasPhysicalEdition: true,
  hasElectricEdition: false,
};

describe("CartContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide initial empty cart state", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("should add item to cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    act(() => {
      result.current.addItem(mockBook, "physical", 1, 100000);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].bookId).toBe("book-1");
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].price).toBe(100000);
    expect(result.current.subtotal).toBe(100000);
    expect(result.current.itemCount).toBe(1);
  });

  it("should update quantity when adding same item", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    act(() => {
      result.current.addItem(mockBook, "physical", 1, 100000);
      result.current.addItem(mockBook, "physical", 2, 100000);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.subtotal).toBe(300000);
    expect(result.current.itemCount).toBe(3);
  });

  it("should update item quantity", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    act(() => {
      result.current.addItem(mockBook, "physical", 1, 100000);
      result.current.updateQuantity(result.current.items[0].id, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.subtotal).toBe(500000);
    expect(result.current.itemCount).toBe(5);
  });

  it("should remove item from cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    act(() => {
      result.current.addItem(mockBook, "physical", 1, 100000);
      result.current.removeItem(result.current.items[0].id);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("should clear cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    act(() => {
      result.current.addItem(mockBook, "physical", 1, 100000);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("should calculate totals correctly", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => (
        <CartProvider>{children}</CartProvider>
      ),
    });

    const book2: Book = {
      ...mockBook,
      code: "book-2",
      title: "Test Book 2",
    };

    act(() => {
      result.current.addItem(mockBook, "physical", 2, 100000);
      result.current.addItem(book2, "physical", 1, 200000);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.subtotal).toBe(400000);
    expect(result.current.total).toBe(400000); // No shipping estimate
    expect(result.current.itemCount).toBe(3);
  });
});

