'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import userService from '@/service/UsersService';

export default function SettingsComponent() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData.data);

      const avatar = await userService.getUserAvatarById(userData.data._id);
      setAvatarUrl(avatar);
    } catch (err) {
      console.error('Lỗi khi tải thông tin người dùng:', err);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userId');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xoá tài khoản?')) return;
    try {
      const userId = Cookies.get('userId');
      await userService.deleteUserById(userId!);

      Cookies.remove('token');
      Cookies.remove('userId');
      alert('Đã xoá tài khoản');
      router.push('/login');
    } catch (err) {
      alert('Xoá tài khoản thất bại');
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md font-sans">
      <h2 className="text-center text-2xl font-semibold mb-6">Thông tin tài khoản</h2>

      {user && (
        <div className="bg-white rounded shadow mb-4">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t">
            <h3 className="text-lg font-bold">Thông tin tài khoản</h3>
          </div>
          <div className="p-4 flex gap-6">
            <div className="flex-shrink-0 text-center">
              <Image
                src={avatarUrl || '/default-avatar.png'}
                alt="Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-blue-600 object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="font-semibold">Họ tên:</label>
                <div>{user.fullname}</div>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <div>{user.email}</div>
              </div>
              <div>
                <label className="font-semibold">Số điện thoại:</label>
                <div>{user.number}</div>
              </div>
              <div>
                <label className="font-semibold">Trạng thái:</label>
                <div>{user.statusMessage}</div>
              </div>

              <button
                onClick={() => router.push('/edit-profile')}
                className="mt-3 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded mt-6">
        <h3 className="text-red-600 font-semibold mb-2">Xoá tài khoản</h3>
        <p>Bạn không thể hoàn tác sau khi xoá tài khoản.</p>
        <button
          onClick={handleDeleteAccount}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Xoá tài khoản
        </button>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Đăng xuất
        </button>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
