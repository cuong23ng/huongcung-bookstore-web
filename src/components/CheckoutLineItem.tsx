import React from "react";
import { Link } from "react-router-dom";
import { CartItem as CartItemType } from "@/models/Cart";

interface CheckoutLineItemProps {
  item: CartItemType;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

export const CheckoutLineItem: React.FC<CheckoutLineItemProps> = ({ item }) => {
  const bookImage = item.book.images?.[0]?.url || "";
  const authors = item.book.authors?.map((a) => a.name).join(", ") || "Unknown Author";
  const formatLabel = item.format === "physical" ? "Sách in" : "E-book";
  const bookDetailsUrl = `/books/${item.book.code}`;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
      {/* Book Cover */}
      <Link 
        to={bookDetailsUrl}
        className="w-10 h-15 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          src={bookImage}
          alt={item.book.title}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <Link 
          to={bookDetailsUrl}
          className="block cursor-pointer hover:text-primary transition-colors"
        >
          <h3 className="text-[13px] font-normal line-clamp-2">
            {item.book.title}
          </h3>
        </Link>
        <p className="text-[11px] text-muted-foreground">{formatLabel}</p>
        <p className="text-[11px] text-muted-foreground">{authors}</p>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-sm font-normal mb-1">
           {formatPrice(item.price)} ₫
        </span>
        <span className="text-xs text-muted-foreground">
          Số lượng: {item.quantity}
        </span>
      </div>
    </div>
  );
};

