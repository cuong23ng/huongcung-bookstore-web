import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem, Cart, CartItemFormat, calculateCartTotals, calculateItemSubtotal } from "@/models/Cart";
import { Book } from "@/models";
import { CartService } from "@/services/CartService";

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  shippingEstimate: number;
  total: number;
  itemCount: number;
  addItem: (book: Book, format: CartItemFormat, quantity?: number, price?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "hc_bookstore_cart";

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingEstimate, setShippingEstimate] = useState(0);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = CartService.loadCart();
    if (savedCart && savedCart.items.length > 0) {
      setItems(savedCart.items);
      setSubtotal(savedCart.subtotal);
      setShippingEstimate(savedCart.shippingEstimate);
      setTotal(savedCart.total);
    }
  }, []);

  // Update totals whenever items change
  useEffect(() => {
    const totals = calculateCartTotals(items, shippingEstimate);
    setSubtotal(totals.subtotal);
    setTotal(totals.total);
    
    // Persist to localStorage
    if (items.length > 0) {
      CartService.saveCart({
        items,
        ...totals,
      });
    } else {
      CartService.clearCart();
    }
  }, [items, shippingEstimate]);

  const addItem = useCallback((book: Book, format: CartItemFormat, quantity: number = 1, price?: number) => {
    setItems((prevItems) => {
      // Check if item already exists (same bookId and format)
      const existingItemIndex = prevItems.findIndex(
        (item) => item.bookId === book.code && item.format === format
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        const newSubtotal = calculateItemSubtotal(newQuantity, existingItem.price);
        
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newSubtotal,
        };
        return updatedItems;
      } else {
        // Add new item
        // Use provided price or default to 0 (price should be passed from component)
        const itemPrice = price ?? 0;
        const itemSubtotal = calculateItemSubtotal(quantity, itemPrice);
        
        const newItem: CartItem = {
          id: `${book.code}-${format}-${Date.now()}`,
          bookId: book.code,
          book,
          format,
          quantity,
          price: itemPrice,
          subtotal: itemSubtotal,
        };
        return [...prevItems, newItem];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newSubtotal = calculateItemSubtotal(quantity, item.price);
          return {
            ...item,
            quantity,
            subtotal: newSubtotal,
          };
        }
        return item;
      })
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    CartService.clearCart();
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const itemCount = getItemCount();

  const value: CartContextType = {
    items,
    subtotal,
    shippingEstimate,
    total,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

