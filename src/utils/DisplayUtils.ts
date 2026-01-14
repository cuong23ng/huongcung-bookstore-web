export class DisplayUtils {


  static formatPrice(physicalPrice: number, ebookPrice: number): string {

    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat("vi-VN").format(price);
    }

    if (physicalPrice === null && ebookPrice === null) {
      return "Liên hệ";
    }
    
    if (physicalPrice === null && ebookPrice !== null) {
      return formatPrice(ebookPrice);
    }
    
    if (ebookPrice === null && physicalPrice !== null) {
      return formatPrice(physicalPrice);
    }
    
    const minPrice = Math.min(physicalPrice, ebookPrice);
    return `Chỉ từ ${formatPrice(minPrice)}`;
  };
  
}