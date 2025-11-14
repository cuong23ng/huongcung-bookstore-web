import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import Checkout from "./Checkout";
import { CartProvider } from "@/contexts/CartContext";
import { Book } from "@/models";

// Mock CheckoutService
vi.mock("@/services/CheckoutService", () => ({
  CheckoutService: {
    getInstance: () => ({
      loadFormData: vi.fn(() => null),
      saveFormData: vi.fn(),
      clearFormData: vi.fn(),
    }),
  },
}));

const mockBook: Book = {
  id: "1",
  title: "Test Book",
  author: { id: "1", name: "Test Author" },
  coverImage: "test.jpg",
  price: 100000,
  format: "physical",
} as Book;

describe("Checkout", () => {
  const renderCheckout = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it("should redirect to cart if cart is empty", async () => {
    const { container } = renderCheckout();
    // Component should render null and redirect
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("should display checkout form when cart has items", async () => {
    // Add item to cart via localStorage
    const cartData = {
      items: [
        {
          id: "1",
          bookId: "1",
          book: mockBook,
          format: "physical",
          quantity: 1,
          price: 100000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      shippingEstimate: 0,
      total: 100000,
    };
    localStorage.setItem("hc_bookstore_cart", JSON.stringify(cartData));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText("Thông tin giao hàng")).toBeInTheDocument();
      expect(screen.getByText("Địa chỉ giao hàng")).toBeInTheDocument();
      expect(screen.getByText("Phương thức vận chuyển")).toBeInTheDocument();
    });
  });

  it("should display form fields", async () => {
    const cartData = {
      items: [
        {
          id: "1",
          bookId: "1",
          book: mockBook,
          format: "physical",
          quantity: 1,
          price: 100000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      shippingEstimate: 0,
      total: 100000,
    };
    localStorage.setItem("hc_bookstore_cart", JSON.stringify(cartData));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/Họ và tên/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Địa chỉ/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Thành phố/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mã bưu điện/i)).toBeInTheDocument();
    });
  });

  it("should show validation errors for required fields", async () => {
    const user = userEvent.setup();
    const cartData = {
      items: [
        {
          id: "1",
          bookId: "1",
          book: mockBook,
          format: "physical",
          quantity: 1,
          price: 100000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      shippingEstimate: 0,
      total: 100000,
    };
    localStorage.setItem("hc_bookstore_cart", JSON.stringify(cartData));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText("Tiếp tục thanh toán")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Tiếp tục thanh toán");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Tên phải có ít nhất 2 ký tự/i)).toBeInTheDocument();
    });
  });

  it("should display shipping method options", async () => {
    const cartData = {
      items: [
        {
          id: "1",
          bookId: "1",
          book: mockBook,
          format: "physical",
          quantity: 1,
          price: 100000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      shippingEstimate: 0,
      total: 100000,
    };
    localStorage.setItem("hc_bookstore_cart", JSON.stringify(cartData));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText("Giao hàng tiêu chuẩn")).toBeInTheDocument();
      expect(screen.getByText("Giao hàng nhanh")).toBeInTheDocument();
    });
  });

  it("should display cart summary", async () => {
    const cartData = {
      items: [
        {
          id: "1",
          bookId: "1",
          book: mockBook,
          format: "physical",
          quantity: 1,
          price: 100000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      shippingEstimate: 0,
      total: 100000,
    };
    localStorage.setItem("hc_bookstore_cart", JSON.stringify(cartData));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText("Tóm tắt đơn hàng")).toBeInTheDocument();
      expect(screen.getByText("Tạm tính:")).toBeInTheDocument();
      expect(screen.getByText("Phí vận chuyển:")).toBeInTheDocument();
      expect(screen.getByText("Tổng cộng:")).toBeInTheDocument();
    });
  });
});










