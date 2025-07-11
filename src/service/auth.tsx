import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import  axiosInstance  from '@/lib/axiosInstance';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'email';
const FULLNAME_KEY = 'fullname';

interface LoginParams {
  email: string;
  password: string;
}

const authService = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(user: any) {
    try {
      const response = await axiosInstance.post(`/auth/register`, user, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Lỗi khi đăng ký:', error.response?.data || error.message);
      throw error;
    }
  },

  async login({ email, password }: LoginParams): Promise<void> {
    try {
      const response = await axiosInstance.post(`/auth/login`, { email, password }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const token = response.data.token;
      const fullname = response.data.fullname || '';
      Cookies.set(TOKEN_KEY, token, { expires: 1, path: '/' });
      Cookies.set(USERNAME_KEY, email, { expires: 1, path: '/' });
      Cookies.set(FULLNAME_KEY, fullname, { expires: 1, path: '/' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(token);
      if (decoded?.id) {
        Cookies.set('userId', decoded.id, { expires: 1, path: '/' });
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Tài khoản hoặc mật khẩu không đúng.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập.');
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`/auth/logout`, {}, { withCredentials: true });

      Cookies.remove(TOKEN_KEY);
      Cookies.remove(USERNAME_KEY);
      Cookies.remove('userId');
     Cookies.remove(FULLNAME_KEY);     
    } catch {
      throw new Error('Không thể đăng xuất. Vui lòng thử lại.');
    }
  },

  checkAuth(): boolean {
    return !!Cookies.get(TOKEN_KEY);
  },

  getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null;
  },

  getUsername(): string | null {
    return Cookies.get(FULLNAME_KEY) || null;
  },

  getUserId(): string | null {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return null;

    try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(token);
      return decoded?.id || null;
    } catch {
      return null;
    }
  }
};

export default authService;
