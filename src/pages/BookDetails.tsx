import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Plus, Minus, ShoppingBag, Book, BookOpen, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { BookService } from "@/services/BookService";
import { BookCard } from "@/components/BookCard";
import { useColor } from 'color-thief-react';
import styles from '@/components/BookCard.module.css';
import { ColorUtils } from "../utils/ColorUtils";
import { useCart } from "@/contexts/CartContext";
import { Book as BookModel, BookImage } from "@/models";

const bookData: Record<string, any> = {
  "vapeur": {
    title: "Vapeur",
    author: "Tác giả",
    price: "635,000",
    colorScheme: "hsl(35, 50%, 85%)",
    rating: 4.5,
    reviews: 128,
    description: "Một tác phẩm văn học đương đại độc đáo, khám phá những khía cạnh sâu sắc của tâm hồn con người qua lăng kính của nghệ thuật và cuộc sống hiện đại.",
    details: {
      publisher: "NXB Văn học",
      year: "2024",
      pages: "320",
      language: "Tiếng Việt",
      isbn: "978-604-0-00000-0"
    },
    review_article: {
      title: "Vapeur - Kiệt tác văn học đương đại về nghệ thuật và tâm hồn con người",
      content: `Vapeur là một tác phẩm văn học xuất sắc, với cách kể chuyện tinh tế và sâu sắc. Tác giả đã khéo léo đan xen những cảm xúc phức tạp của con người vào từng trang sách, tạo nên một trải nghiệm đọc đầy ấn tượng. Đọc Vapeur, người đọc như được đắm mình vào một không gian nghệ thuật đầy mê hoặc, nơi mà ranh giới giữa hiện thực và ảo ảnh trở nên mờ nhạt.

Tác giả đã khéo léo sử dụng ngôn ngữ văn chương để vẽ nên những bức tranh tâm hồn đầy màu sắc, từ những khoảnh khắc vui sướng tột cùng đến những giây phút tuyệt vọng sâu thẳm nhất. Những nhân vật trong tác phẩm không chỉ là những hình tượng trên giấy, mà còn là những con người sống động với đầy đủ cảm xúc, suy nghĩ và hoài bão. Họ khiến người đọc phải suy ngẫm về chính cuộc đời mình, về những lựa chọn đã qua và những con đường còn phía trước.

Điểm đặc biệt của Vapeur nằm ở cách tác giả xử lý thời gian trong tác phẩm. Thay vì theo một mạch tuyến tính, câu chuyện được kể lại qua những mảnh ghép ký ức, tạo nên một bức tranh toàn cảnh về cuộc đời nhân vật chính. Kỹ thuật này không chỉ giúp làm phong phú thêm cấu trúc của tác phẩm, mà còn phản ánh chính bản chất của ký ức con người - luôn phân mảnh, đan xen và đầy những cảm xúc mâu thuẫn.

Trong bối cảnh văn học đương đại đang dần chuyển hướng sang những câu chuyện mang tính giải trí cao, Vapeur xuất hiện như một luồng gió mới, mang đến cho độc giả những trải nghiệm văn chương sâu sắc và có chiều sâu tư tưởng. Tác phẩm không đơn thuần là một câu chuyện được kể lại, mà là một hành trình khám phá tâm hồn con người qua lăng kính của nghệ thuật.

Ngôn ngữ trong tác phẩm vừa giản dị vừa đầy chất thơ, tạo nên một nhịp điệu đọc vừa êm dịu vừa sâu lắng. Mỗi câu chữ đều được chọn lọc kỹ lưỡng, không một từ ngữ nào thừa, không một chi tiết nào xuất hiện một cách vô nghĩa. Đây chính là dấu ấn của một tác giả thực sự tâm huyết với nghề viết. Tác phẩm cũng đặt ra nhiều câu hỏi triết học về ý nghĩa của nghệ thuật, về mối quan hệ giữa con người với con người, và về vị trí của cá nhân trong xã hội hiện đại.

Vapeur xứng đáng là một trong những tác phẩm văn học đáng chú ý nhất năm nay. Đây là cuốn sách dành cho những ai yêu thích văn chương nghệ thuật, những ai đang tìm kiếm một trải nghiệm đọc sâu sắc và đầy cảm xúc.`,
      sources: [
        { name: "Văn nghệ số", url: "https://vanngheso.com/review-vapeur" },
        { name: "Tạp chí Văn học", url: "https://tapchivanhoc.vn/vapeur-analysis" },
        { name: "Blog Sách & Đời sống", url: "https://sachdoisong.com/phebinhvapeur" }
      ]
    }
  },
  "nhung-noi-hoang-hot": {
    title: "Những nỗi hoang hót của cậu học sinh",
    author: "Nguyễn Nhật Ánh",
    price: "138,000",
    colorScheme: "hsl(75, 40%, 45%)",
    rating: 4.8,
    reviews: 256,
    description: "Tác phẩm mới nhất của nhà văn Nguyễn Nhật Ánh, kể về hành trình trưởng thành của một cậu học sinh với những trăn trở, hoang mang nhưng cũng đầy hy vọng về cuộc sống.",
    details: {
      publisher: "NXB Trẻ",
      year: "2024",
      pages: "280",
      language: "Tiếng Việt",
      isbn: "978-604-1-00000-0"
    },
    review_article: {
      title: "Nguyễn Nhật Ánh và những câu chuyện tuổi thơ đầy cảm xúc",
      content: `Một lần nữa, Nguyễn Nhật Ánh lại chạm đến trái tim độc giả bằng những câu chuyện giản dị nhưng đầy cảm động về tuổi học trò. Cuốn sách là món quà tinh thần tuyệt vời cho mọi lứa tuổi.

Với phong cách viết đặc trưng của mình, Nguyễn Nhật Ánh đã tạo nên một thế giới tuổi thơ đầy màu sắc, nơi mà những nỗi hoang hót, trăn trở của một cậu học sinh trở nên gần gũi và dễ đồng cảm với mọi độc giả. Tác giả không chỉ kể về những câu chuyện vui buồn trong trường học, mà còn khắc họa tinh tế những cảm xúc phức tạp trong quá trình trưởng thành của một con người.

Ngôn ngữ trong tác phẩm vừa giản dị vừa đầy chất thơ, phản ánh đúng tâm hồn của tuổi học trò - vừa trong sáng vừa đầy những suy tư sâu sắc. Mỗi trang sách đều mang lại những cảm xúc khác nhau, từ tiếng cười sảng khoái đến những giọt nước mắt lặng thầm.

Đây thực sự là một tác phẩm đáng đọc cho bất kỳ ai muốn nhớ lại những kỷ niệm tuổi học trò, hoặc đơn giản chỉ muốn tìm kiếm một câu chuyện ấm áp, chân thực về cuộc sống.`,
      sources: [
        { name: "Tuổi Trẻ Online", url: "https://tuoitre.vn/review-nna" },
        { name: "Báo Văn hóa", url: "https://vanhoa.vn/nguyen-nhat-anh-review" }
      ]
    }
  }
};

type BookDisplay = {
  id: string;
  title: string;
  authors: { name: string }[];
  translators: { name: string}[];
  price: string;
  description: string;
  image: string;
  images: BookImage[];
  details: {
    publisher: string;
    pages: string;
    language: string;
    hasPhysicalEdition: boolean;
    hasElectricEdition: boolean;
    isbn: string;
    eisbn: string;
    publicationDate: string;
    epublicationDate: string;
    physicalBookPrice: number;
    ebookPrice: number;
    coverType: string;
    specifications: string;
  } | null;
};

// Helper function to format date to YYYY-MM-DD format
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  let dateObj: Date;
  
  // Convert to Date object
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return as is
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.exec(date)) {
      return date;
    }
    // Try to parse the string
    dateObj = new Date(date);
    // Check if date is valid
    if (Number.isNaN(dateObj.getTime())) {
      return "";
    }
  } else {
    return "";
  }
  
  // Format as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<BookDisplay | null>(null);
  const [bookModel, setBookModel] = useState<BookModel | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<{ physical: boolean; ebook: boolean }>({
    physical: false,
    ebook: false,
  });
  const [quantity, setQuantity] = useState(1);
  const [ebookDuration, setEbookDuration] = useState('Vô thời hạn');
  const [bgColorScheme, setBgColorScheme] = useState(styles['background-color-olive']);
  const [textColorScheme, setTextColorScheme] = useState(styles['text-color-olive']);
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbnailScrollIndex, setThumbnailScrollIndex] = useState(0);

  // Get color from image - useColor hook must be at top level
  const { data: dominantHex } = useColor(book?.image || '', 'hex', { crossOrigin: 'anonymous', quality: 10 });

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const bookService = BookService.getInstance();
        const bookData = await bookService.getBookDetails(id);
        if (bookData) {
          // Store the Book model for cart operations
          setBookModel(bookData);
          // Store the local Book type for display
          setBook({
            id: bookData.code,
            title: bookData.title,
            authors: bookData.authors?.map(author => ({ name: author.name })) || [],
            translators: bookData.translators?.map(translator => ({ name: translator.name })) || [],
            price: "0",
            description: bookData.description || "",
            details: {
              publisher: bookData.publisher?.name || "",
              pages: bookData.pageCount?.toString() || "",
              language: bookData.language || "",
              hasPhysicalEdition: bookData.physicalBookInfo !== null,
              hasElectricEdition: bookData.ebookInfo !== null,
              isbn: bookData.physicalBookInfo?.isbn || "",
              eisbn: bookData.ebookInfo?.isbn || "",
              publicationDate: formatDate(bookData.physicalBookInfo?.publicationDate),
              epublicationDate: formatDate(bookData.ebookInfo?.publicationDate),
              physicalBookPrice: bookData.physicalBookInfo?.currentPrice || 0,
              ebookPrice: bookData.ebookInfo?.currentPrice || 0,
              coverType: bookData.physicalBookInfo?.coverType || "",
              specifications: bookData.physicalBookInfo?.heightCm?.toString() + " x " + bookData.physicalBookInfo?.widthCm?.toString() + " x " + bookData.physicalBookInfo?.lengthCm?.toString() + " cm" || "",
            },
            image: bookData.images?.[0]?.url || "",
            images: bookData.images || [],
          });
        } else {
          setBook(null);
          setBookModel(null);
        }
      } catch (error) {
        console.error("Error loading book:", error);
        setBook(null);
        setBookModel(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Set default format selection when book is loaded
  useEffect(() => {
    if (book?.details) {
      if (book.details.hasPhysicalEdition) {
        setSelectedFormats({ physical: true, ebook: false });
      } else if (book.details.hasElectricEdition) {
        setSelectedFormats({ physical: false, ebook: true });
      }
    }
  }, [book?.details]);

  // Update color scheme when image color is extracted
  useEffect(() => {
    if (book && dominantHex && typeof dominantHex === 'string') {
      const hsl = ColorUtils.hexToHsl(dominantHex);
      if (hsl) {
        const bgColorClass = ColorUtils.pickBackgroundSchemeClassByHue(hsl?.h, styles);
        setBgColorScheme(bgColorClass);
        const textColorClass = ColorUtils.pickTextSchemeClassByHue(hsl?.h, styles);
        setTextColorScheme(textColorClass);
      }
      console.log(textColorScheme.toString());
    }
  }, [dominantHex, book?.image]);

  // TODO: Fetch related books from API
  const relatedBooks: any[] = [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-light tracking-wide mb-4">Không tìm thấy sách</h1>
          <Button 
            variant="outline"
            className="rounded-none font-normal"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Toggle format selection
  const toggleFormat = (format: 'physical' | 'ebook') => {
    setSelectedFormats(prev => ({
      ...prev,
      [format]: !prev[format],
    }));
  };

  // Calculate total price
  const getTotalPrice = (): number => {
    if (!book?.details) return 0;
    let total = 0;
    if (selectedFormats.physical) {
      total += (book.details.physicalBookPrice || 0) * quantity;
    }
    if (selectedFormats.ebook) {
      total += book.details.ebookPrice || 0;
    }
    return total;
  };

  const handleAddToCart = () => {
    if (!book || !bookModel) return;

    // Check if any format is selected
    if (!selectedFormats.physical && !selectedFormats.ebook) {
      toast({
        title: "Chưa chọn sản phẩm",
        description: "Bạn chưa chọn sản phẩm nào",
        variant: "destructive",
      });
      return;
    }

    // Add physical book if selected
    if (selectedFormats.physical && book.details?.physicalBookPrice) {
      addItem(bookModel, 'physical', quantity, book.details.physicalBookPrice);
    }

    // Add ebook if selected (convert 'ebook' to 'digital' for CartItemFormat type)
    if (selectedFormats.ebook && book.details?.ebookPrice) {
      addItem(bookModel, 'digital', 1, book.details.ebookPrice);
    }
    
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `"${book.title}" đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const handleBuyNow = () => {
    if (!book || !bookModel) return;

    // Check if any format is selected
    if (!selectedFormats.physical && !selectedFormats.ebook) {
      toast({
        title: "Chưa chọn sản phẩm",
        description: "Bạn chưa chọn sản phẩm nào",
        variant: "destructive",
      });
      return;
    }

    // First add the item to cart
    handleAddToCart();
    
    // TODO: Navigate to checkout page when it's implemented
    // navigate("/checkout");
    
    // For now, just show a message that checkout will be implemented
    // Uncomment the navigate line above when checkout page is ready
  };

  const handleAddToFavorites = () => {
    toast({
      title: "Đã thêm vào danh sách yêu thích",
      description: `"${book.title}" đã được thêm vào danh sách yêu thích.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button 
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Trang chủ
            </button>
            <span>/</span>
            <span className="text-foreground">{book.title}</span>
          </div>
        </nav>

        <div className="grid md:grid-cols-[440px_1fr] gap-16 mb-20 md:items-center">
          {/* Book cover with thumbnails */}
          <div className="space-y-4 flex flex-col items-center justify-center">
            <div className={`w-full relative group/cover transition-transform duration-300 max-w-[390px]`} >
              <img 
                src={book.images && book.images.length > 0 && book.images[selectedImage] 
                  ? book.images[selectedImage].url 
                  : book.image} 
                alt={book.title} 
                className="w-full h-full object-contain transition-transform duration-300" 
              />
            </div>
            
            {/* Thumbnail images */}
            {book.images && book.images.length > 0 && (
              <div className="relative w-full max-w-[390px] flex items-center justify-center">
                {/* Left arrow button */}
                {book.images.length > 4 && thumbnailScrollIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
                    onClick={() => setThumbnailScrollIndex(Math.max(0, thumbnailScrollIndex - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Thumbnail container */}
                <div className="flex gap-2 overflow-hidden max-w-[240px]">
                  {book.images
                    .slice(thumbnailScrollIndex * 4, thumbnailScrollIndex * 4 + 4)
                    .map((image, localIndex) => {
                      const globalIndex = thumbnailScrollIndex * 4 + localIndex;
                      return (
                <button
                          key={`thumbnail-${globalIndex}`}
                  type="button"
                          className={`flex-shrink-0 aspect-[5/7] w-[56px] cursor-pointer transition-all duration-300 ${
                            selectedImage === globalIndex 
                      ? "opacity-100 brightness-100" 
                      : "opacity-70 brightness-85 hover:opacity-80 hover:brightness-100"
                  }`}
                          onClick={() => setSelectedImage(globalIndex)}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className={`w-full h-full flex items-center justify-center transition-all ${bgColorScheme}`}>
                              <img src={image.url} alt={image.altText || book.title} className="w-full h-full object-contain" />
                    </div>
                  </div>
                </button>
                      );
                    })}
                </div>
                
                {/* Right arrow button */}
                {book.images.length > 4 && thumbnailScrollIndex < Math.ceil(book.images.length / 4) - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
                    onClick={() => setThumbnailScrollIndex(Math.min(Math.ceil(book.images.length / 4) - 1, thumbnailScrollIndex + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
            </div>
            )}
          </div>

          {/* Book info */}
          <div className="space-y-8 ">
            {/* Author and Title */}
            <div>
              <p className="text-base tracking-wider mb-2">
                By {book.authors.map(author => (
                  <>
                    <span key={author.name} className={`text-lg transition-colors duration-300 cursor-pointer ${textColorScheme}`}>{author.name}</span>
                    {book.authors.indexOf(author) < book.authors.length - 1 && <span className="text-muted-foreground">, </span>}
                  </>
                ))}
              </p>
              <h1 className="text-5xl font-normal tracking-tight mb-8">{book.title}</h1>
            </div>


            {/* Metadata - Two columns */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">Dịch giả:</span>{" "}
                    {book.translators.map((translator, index) => (
                      <>
                        <span key={translator.name} className={`font-normal transition-colors duration-300 cursor-pointer`}>{translator.name}</span>
                        {index < book.translators.length - 1 && ", "}
                      </>
                    ))}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">NXB:</span>{" "}
                    <span className="font-normal">{book.details?.publisher || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">Ngày xuất bản:</span>{" "}
                    <span className="font-normal">{book.details?.publicationDate || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">ISBN:</span>{" "}
                    <span className="font-normal">{book.details?.isbn || "-"}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">Số trang:</span>{" "}
                    <span className="font-normal">{book.details?.pages || "-"} {book.details?.pages ? "trang" : ""}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">Quy cách:</span>{" "}
                    <span className="font-normal">{book.details?.specifications || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">Ngày xuất bản Ebook:</span>{" "}
                    <span className="font-normal">{book.details?.epublicationDate || "-"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold">E-ISBN:</span>{" "}
                    <span className="font-normal">{book.details?.eisbn || "-"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-base text-foreground leading-relaxed font-normal text-justify">
                {book.description}
              </p>
            </div>

            {/* Book Format Selection */}
            <div className="space-y-6 pt-8 border-t border-border">
              {/* Physical Book Option */}
              {book.details?.hasPhysicalEdition && (
                <div className="border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleFormat('physical')}
                        className="flex-shrink-0"
                      >
                        <div className={`w-5 h-5 border-2 border-foreground flex items-center justify-center transition-colors ${
                          selectedFormats.physical ? 'bg-foreground' : 'bg-transparent'
                        }`}>
                          {selectedFormats.physical && <Check className="h-3 w-3 text-background" />}
                        </div>
                      </button>
                      <div className="flex items-center gap-2 flex-1">
                        <Book className="h-5 w-5" />
                        <span className="text-base font-normal">Sách giấy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Số lượng:</span>
                        <div className="flex items-center border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-sm font-normal min-w-[2rem] text-center">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {book.details?.physicalBookPrice ? (
                        <div>
                          <p className="text-base font-bold">{formatPrice(book.details.physicalBookPrice)}₫</p>
                        </div>
                      ) : (
                        <p className="text-base text-muted-foreground">Liên hệ</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ebook Option */}
              {book.details?.hasElectricEdition && (
                <div className="border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleFormat('ebook')}
                        className="flex-shrink-0"
                      >
                        <div className={`w-5 h-5 border-2 border-foreground flex items-center justify-center transition-colors ${
                          selectedFormats.ebook ? 'bg-foreground' : 'bg-transparent'
                        }`}>
                          {selectedFormats.ebook && <Check className="h-3 w-3 text-background" />}
                        </div>
                      </button>
                      <div className="flex items-center gap-2 flex-1">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-base font-normal">Sách điện tử (ebook)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={ebookDuration}
                          onChange={(e) => setEbookDuration(e.target.value)}
                          className="text-sm border border-border bg-background px-3 py-1.5 rounded-none"
                        >
                          <option value="Vô thời hạn">Vô thời hạn</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-right">
                      {book.details?.ebookPrice ? (
                        <p className="text-base font-bold">{formatPrice(book.details.ebookPrice)}₫</p>
                      ) : (
                        <p className="text-base text-muted-foreground">Liên hệ</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="pt-4">
                <div className="flex items-center">
                  <span className="text-base font-normal mr-2">Thành tiền: </span>
                  <span className="text-lg font-bold">{formatPrice(getTotalPrice())} ₫</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 rounded-none font-normal h-14 px-8 text-base tracking-wide transition-all duration-300 hover:bg-secondary/80 hover:shadow-lg bg-secondary/90"
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Mua ngay
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 rounded-none font-normal h-14 px-8 text-base tracking-wide transition-all duration-300 hover:bg-secondary/80 hover:shadow-lg bg-secondary/90"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Thêm vào giỏ
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none h-14 w-14 border-2 border-muted-foreground/40 transition-all duration-300 hover:bg-muted hover:border-muted-foreground/60"
                  onClick={handleAddToFavorites}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Book Review Section */}
        {bookModel?.review?.content && (
        <div className="mb-20">
          <h2 className="text-xl font-base tracking-wider uppercase mb-8 text-foreground/80">Giới thiệu sách</h2>
          <Card className="border border-border overflow-hidden">
            <CardContent className="p-8 md:p-12">
                {bookModel.review.title && (
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    {bookModel.review.title}
                  </h3>
                )}
              <div className="prose prose-base max-w-none">
                <p className="text-md text-foreground/85 leading-relaxed whitespace-pre-line font-base">
                    {bookModel.review.content}
                </p>
              </div>
              
                {bookModel.review.sources && bookModel.review.sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h4 className="text-sm font-normal mb-4 text-foreground/70 uppercase tracking-wider">
                    Nguồn tham khảo
                  </h4>
                  <ul className="space-y-2">
                      {bookModel.review.sources.map((source, index: number) => (
                      <li key={`source-${index}`} className="text-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="text-foreground/80 hover:text-foreground underline"
                        >
                            {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Related Products */}
        <div className="mb-20">
          <h2 className="text-xl font-light tracking-wider uppercase mb-8 text-muted-foreground">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {relatedBooks.map((relatedBook) => (
              <BookCard
                key={relatedBook.id}
                id={relatedBook.id}
                title={relatedBook.title}
                authors={[{ name: relatedBook.author }]}
                price={relatedBook.price}
                colorScheme={relatedBook.colorScheme}
                image={relatedBook.image}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}