import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/AuthService";
import { AxiosError } from "axios";
import { LoginRequest, RegisterRequest } from "@/models";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { Separator } from "../components/ui/separator";
import { z } from "zod";

const authService = AuthService.getInstance();

// Custom Facebook icon component
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const loginSchema = z.object({
  username: z.string().trim().min(1, { message: "Tên đăng nhập là bắt buộc" }).max(255),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }).max(100),
});

const registerSchema = z.object({
  firstName: z.string().trim().min(2, { message: "Tên phải có ít nhất 2 ký tự" }).max(50, { message: "Tên không được quá 50 ký tự" }),
  lastName: z.string().trim().min(2, { message: "Họ phải có ít nhất 2 ký tự" }).max(50, { message: "Họ không được quá 50 ký tự" }),
  username: z.string().trim().email({ message: "Tên đăng nhập phải là username hoặc email hợp lệ" }).max(255),
  email: z.string().trim().email({ message: "Email không hợp lệ" }).max(255),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }).max(100),
  phone: z.string().regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" }),
  gender: z.string().min(1, { message: "Vui lòng chọn giới tính" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse({ username: loginUsername, password: loginPassword });
      
      const loginData: LoginRequest = {
        username: validated.username,
        password: validated.password,
      };
      const authData = await authService.login(loginData);

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${authData.firstName} ${authData.lastName}!`,
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Lỗi xác thực",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error?.message;
        toast({
          title: "Lỗi đăng nhập",
          description: errorMessage || "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi đăng nhập",
          description: "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = registerSchema.parse({ 
        firstName,
        lastName,
        username: signupUsername,
        email: signupEmail, 
        password: signupPassword,
        phone,
        gender
      });
      
      const registerData: RegisterRequest = {
        firstName: validated.firstName,
        lastName: validated.lastName,
        username: validated.username,
        email: validated.email,
        password: validated.password,
        phone: validated.phone,
        gender: validated.gender
      };
      const authData = await authService.register(registerData);

      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng ${authData.firstName} ${authData.lastName}!`,
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Lỗi xác thực",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error?.message;
        toast({
          title: "Lỗi đăng ký",
          description: errorMessage || "Có lỗi xảy ra khi đăng ký tài khoản",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi đăng ký",
          description: "Có lỗi xảy ra khi đăng ký tài khoản",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    //window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    console.log("Google login not implemented");
  };

  const handleFacebookLogin = async () => {
    // TODO: Implement Facebook login
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Chào mừng đến Hương Cung Book</CardTitle>
          <CardDescription className="text-center">
            Đăng nhập hoặc tạo tài khoản mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng ký</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Tên đăng nhập (Username hoặc Email)</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="example@email.com"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
                
                {/* <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    Hoặc
                  </span>
                </div> */}

                {/* <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                    Đăng nhập bằng Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                  >
                    <FacebookIcon />
                    Đăng nhập bằng Facebook
                  </Button>
                </div> */}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">Tên</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="Văn A"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Họ</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Nguyễn"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Tên đăng nhập (Username hoặc email)</Label>
                  <Input
                    id="signup-username"
                    type="email"
                    placeholder="example@email.com"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mật khẩu</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Số điện thoại</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="0123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    pattern="\d{10,11}"
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">Giới tính</Label>
                  <select
                    id="signup-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    title="Chọn giới tính"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </Button>
                
                {/* <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    Hoặc
                  </span>
                </div> */}

                {/* <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                    Đăng ký bằng Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                  >
                    <FacebookIcon />
                    Đăng ký bằng Facebook
                  </Button>
                </div> */}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;