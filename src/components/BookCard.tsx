import { Button } from "./ui/button";
import { HeartPlus, Eye, ShoppingBag } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useColor } from 'color-thief-react';
import styles from './BookCard.module.css';
import { ColorUtils } from "../utils/ColorUtils";

interface BookCardProps {
  id: string;
  title: string;
  authors: { name: string }[];
  price: string;
  originalPrice?: string;
  colorScheme?: string;
  image?: string
}

export const BookCard = ({
  id,
  title,
  authors,
  price,
  originalPrice,
  colorScheme,
  image
}: BookCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: dominantHex } = useColor(image || '', 'hex', { crossOrigin: 'anonymous', quality: 10 });

  const hsl = ColorUtils.hexToHsl(typeof dominantHex === 'string' ? dominantHex : '');
  const bgClass = ColorUtils.pickBackgroundSchemeClassByHue(hsl?.h, styles);
  
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `"${title}" đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const handleAddToFavorites = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    toast({
      title: "Đã thêm vào danh sách yêu thích",
      description: `"${title}" đã được thêm vào danh sách yêu thích.`,
    });
  };

  const handleQuickView = () => {
    navigate(`/books/${id}`);
  };
  
  return (
    <div className="group relative">
      {/* Book cover */}
      <div 
        className={`relative aspect-[5/7] mb-4 group/cover cursor-pointer ${bgClass}`}
        onClick={handleQuickView}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="h-5/6 bg-white/95 flex items-center justify-center shadow-xl">
            <img 
              src={image} 
              alt="book-cover"
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={(e) => handleAddToFavorites(e)}
          >
            <HeartPlus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={(e) => handleAddToCart(e)}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Book info */}
      <div className="space-y-2">
        <div>
          <Link to={`/books/${id}`}>
            <h3 className="text-sm font-normal line-clamp-2 leading-relaxed cursor-pointer">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 cursor-pointer">{authors.map((author, index) => (
            <>
              <span key={author.name} className={`text-xs transition-colors duration-300 cursor-pointer mt-1`}>{author.name}</span>
              {index < authors.length - 1 && ", "}
            </>
          ))}</p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-normal">{price}₫</span>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-none border-muted-foreground/70 text-muted-foreground hover:bg-muted hover:text-muted-foreground text-xs px-2 py-1"
            onClick={handleAddToCart}
          >
            Mua
          </Button>
        </div>
      </div>
    </div>
  );
};
