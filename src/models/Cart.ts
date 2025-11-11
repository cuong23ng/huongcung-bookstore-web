import { Book } from "./Book";

/**
 * Cart item format - physical or digital book
 */
export type CartItemFormat = "physical" | "digital";

/**
 * Individual item in the shopping cart
 */
export interface CartItem {
  id: string; // Unique identifier for this cart item
  bookId: string; // Reference to Book model
  book: Book; // Full book object (title, author, cover, etc.)
  format: CartItemFormat; // Book format selection
  quantity: number; // Item quantity
  price: number; // Unit price at time of addition
  subtotal: number; // Calculated: quantity × price
}

/**
 * Shopping cart data structure
 */
export interface Cart {
  items: CartItem[];
  subtotal: number; // Sum of all item subtotals
  shippingEstimate: number; // Estimated shipping cost
  total: number; // Final total (subtotal + shipping)
}

/**
 * Helper function to calculate cart totals
 */
export function calculateCartTotals(items: CartItem[], shippingEstimate: number = 0): {
  subtotal: number;
  shippingEstimate: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + shippingEstimate;
  
  return {
    subtotal,
    shippingEstimate,
    total,
  };
}

/**
 * Helper function to calculate item subtotal
 */
export function calculateItemSubtotal(quantity: number, price: number): number {
  return quantity * price;
}

