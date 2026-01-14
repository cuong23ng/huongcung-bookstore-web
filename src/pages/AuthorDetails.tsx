import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookCard } from "@/components/BookCard";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const authorsData: Record<string, {
  name: string;
  avatar: string;
  bio: string;
  books: Array<{
    id: string;
    title: string;
    price: string;
    colorScheme: string;
  }>;
}> = {
  "nguyen-nhat-anh": {
    name: "Nguyễn Nhật Ánh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Nguyễn Nhật Ánh là một nhà văn Việt Nam chuyên viết cho tuổi mới lớn. Ông được biết đến với những tác phẩm như Mắt Biếc, Tôi Thấy Hoa Vàng Trên Cỏ Xanh, Cho Tôi Xin Một Vé Đi Tuổi Thơ... Các tác phẩm của ông thường mang đậm chất hoài niệm về tuổi thơ và tình yêu trong sáng.",
    books: [
      { id: "mat-biec", title: "Mắt Biếc", price: "95,000", colorScheme: "hsl(210, 50%, 60%)" },
      { id: "toi-thay-hoa-vang", title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", price: "110,000", colorScheme: "hsl(75, 40%, 45%)" },
      { id: "cho-toi-xin-mot-ve", title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", price: "85,000", colorScheme: "hsl(15, 60%, 55%)" },
      { id: "con-chim-xanh-trong-long-nguc", title: "Con Chim Xanh Trong Lồng Ngực", price: "98,000", colorScheme: "hsl(220, 40%, 40%)" },
    ],
  },
  "nam-cao": {
    name: "Nam Cao",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Nam Cao (1915-1951) là một nhà văn, nhà báo Việt Nam. Ông được coi là một trong những nhà văn tiêu biểu nhất của trào lưu văn học hiện thực phê phán Việt Nam. Các tác phẩm nổi tiếng bao gồm Chí Phèo, Lão Hạc, Đời Thừa...",
    books: [
      { id: "chi-pheo", title: "Chí Phèo", price: "65,000", colorScheme: "hsl(0, 0%, 50%)" },
      { id: "lao-hac", title: "Lão Hạc", price: "55,000", colorScheme: "hsl(140, 30%, 50%)" },
      { id: "doi-thua", title: "Đời Thừa", price: "60,000", colorScheme: "hsl(220, 40%, 40%)" },
    ],
  },
  "to-hoai": {
    name: "Tô Hoài",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    bio: "Tô Hoài (1920-2014) là một nhà văn Việt Nam nổi tiếng với các tác phẩm về thiên nhiên, động vật và cuộc sống nông thôn. Tác phẩm Dế Mèn Phiêu Lưu Ký của ông đã trở thành tác phẩm kinh điển trong văn học thiếu nhi Việt Nam.",
    books: [
      { id: "de-men-phieu-luu-ky", title: "Dế Mèn Phiêu Lưu Ký", price: "75,000", colorScheme: "hsl(75, 40%, 45%)" },
      { id: "o-chuot", title: "Ổ Chuột", price: "68,000", colorScheme: "hsl(15, 60%, 55%)" },
      { id: "vo-chong-a-phu", title: "Vợ Chồng A Phủ", price: "72,000", colorScheme: "hsl(210, 50%, 60%)" },
    ],
  },
  "vu-trong-phung": {
    name: "Vũ Trọng Phụng",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    bio: "Vũ Trọng Phụng (1912-1939) là một nhà văn, nhà báo Việt Nam. Ông được mệnh danh là 'ông vua phóng sự đất Bắc' với những tác phẩm trào phúng sắc sảo về xã hội đương thời.",
    books: [
      { id: "so-do", title: "Số Đỏ", price: "85,000", colorScheme: "hsl(0, 0%, 50%)" },
      { id: "gione-to", title: "Giông Tố", price: "78,000", colorScheme: "hsl(220, 40%, 40%)" },
      { id: "vo-de", title: "Vỡ Đê", price: "70,000", colorScheme: "hsl(140, 30%, 50%)" },
    ],
  },
  "ngo-tat-to": {
    name: "Ngô Tất Tố",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
    bio: "Ngô Tất Tố (1893-1954) là một nhà văn, nhà báo, nhà Nho học Việt Nam. Ông được biết đến qua các tác phẩm phản ánh đời sống nông thôn và số phận người nông dân.",
    books: [
      { id: "tat-den", title: "Tắt Đèn", price: "70,000", colorScheme: "hsl(0, 0%, 50%)" },
      { id: "viet-ngu-the-nao", title: "Việc Làng", price: "65,000", colorScheme: "hsl(15, 60%, 55%)" },
    ],
  },
  "xuan-dieu": {
    name: "Xuân Diệu",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face",
    bio: "Xuân Diệu (1916-1985) là một nhà thơ Việt Nam nổi tiếng, được mệnh danh là 'ông hoàng thơ tình'. Thơ của ông mang đậm chất lãng mạn và say đắm.",
    books: [
      { id: "tho-tho", title: "Thơ Thơ", price: "55,000", colorScheme: "hsl(210, 50%, 60%)" },
      { id: "gui-huong-cho-gio", title: "Gửi Hương Cho Gió", price: "58,000", colorScheme: "hsl(75, 40%, 45%)" },
    ],
  },
  "ho-anh-thai": {
    name: "Hồ Anh Thái",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    bio: "Hồ Anh Thái là một nhà văn Việt Nam đương đại với nhiều tác phẩm được đánh giá cao về cả nội dung lẫn phong cách viết độc đáo.",
    books: [
      { id: "de-men-an-oc", title: "Dế Mèn Ăn Ốc", price: "88,000", colorScheme: "hsl(140, 30%, 50%)" },
      { id: "mot-the-gioi-khong-co-dan-ba", title: "Một Thế Giới Không Có Đàn Bà", price: "95,000", colorScheme: "hsl(220, 40%, 40%)" },
    ],
  },
  "nguyen-huy-thiep": {
    name: "Nguyễn Huy Thiệp",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face",
    bio: "Nguyễn Huy Thiệp (1950-2021) là một nhà văn Việt Nam nổi tiếng với phong cách viết truyện ngắn độc đáo, táo bạo và đậm chất triết lý.",
    books: [
      { id: "tuong-ve-huu", title: "Tướng Về Hưu", price: "75,000", colorScheme: "hsl(0, 0%, 50%)" },
      { id: "nhung-ngon-gio-hua-tat", title: "Những Ngọn Gió Hua Tát", price: "80,000", colorScheme: "hsl(15, 60%, 55%)" },
      { id: "muoi-lam", title: "Muối Của Rừng", price: "72,000", colorScheme: "hsl(75, 40%, 45%)" },
    ],
  },
};

const AuthorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

   const author = id ? authorsData[id] : null;

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-light mb-4">Không tìm thấy tác giả</h1>
          <Button variant="outline" onClick={() => navigate("/authors")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách tác giả
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate("/authors")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tất cả tác giả
        </Button>

        {/* Author info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-primary/20">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-2xl">
              {author.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-light tracking-wide mb-4">
              {author.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {author.bio}
            </p>
          </div>
        </div>

        {/* Books section */}
        <div>
          <h2 className="text-xl font-light tracking-wide mb-6 border-b pb-4">
            Tác phẩm ({author.books.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {author.books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                authors={[{ name: author.name }]}
                price={book.price}
                colorScheme={book.colorScheme}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthorDetails;