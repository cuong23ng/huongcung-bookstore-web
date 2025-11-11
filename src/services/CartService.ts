import { Cart, CartItem } from "@/models/Cart";

const CART_STORAGE_KEY = "hc_bookstore_cart";

/**
 * CartService handles persistence of cart data to localStorage
 */
export class CartService {
  /**
   * Save cart to localStorage
   */
  static saveCart(cart: Cart): void {
    try {
      const serialized = JSON.stringify(cart);
      localStorage.setItem(CART_STORAGE_KEY, serialized);
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }

  /**
   * Load cart from localStorage
   */
  static loadCart(): Cart | null {
    try {
      const serialized = localStorage.getItem(CART_STORAGE_KEY);
      if (!serialized) {
        return null;
      }

      const cart = JSON.parse(serialized) as Cart;
      
      // Validate cart structure
      if (!cart.items || !Array.isArray(cart.items)) {
        return null;
      }

      // Reconstruct CartItem objects with proper types
      const items: CartItem[] = cart.items.map((item) => ({
        ...item,
        // Ensure dates are properly handled if needed
      }));

      return {
        items,
        subtotal: cart.subtotal || 0,
        shippingEstimate: cart.shippingEstimate || 0,
        total: cart.total || 0,
      };
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return null;
    }
  }

  /**
   * Clear cart from localStorage
   */
  static clearCart(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  }

  /**
   * Get cart item count
   */
  static getItemCount(): number {
    const cart = this.loadCart();
    if (!cart || !cart.items) {
      return 0;
    }
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

