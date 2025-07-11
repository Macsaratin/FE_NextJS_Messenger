/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState } from 'react';
import userService from '@/service/UsersService';
interface UserInfoCardProps {
  user: {
    _id: string;
    fullname: string;
    email: string;
    number?: string;
    gender?: string;
    age?: number;
    statusMessage?: string;
    bio?: string;
    isVerified?: boolean;
    onlineStatus?: boolean;
  };
  actions?: React.ReactNode;
}


const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, actions }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    useEffect(() => {
    const fetchAvatar = async () => {
      if (user._id) {
        const url = await userService.getUserAvatarById(user._id);
        setAvatarUrl(url);
      }
    };
    fetchAvatar();
  }, [user._id]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex gap-5 items-start">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 bg-gray-100 shadow">
        <img
          src={avatarUrl || 'uploads/default-avatar.png'}
          alt={user.fullname}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin */}
      <div className="flex-1 space-y-1">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {user.fullname || 'Không có tên'}
          {user.isVerified && (
            <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">✔ Đã xác minh</span>
          )}
        </h3>

        <p className="text-sm text-gray-600">{user.email}</p>
        {user.number && <p className="text-sm text-gray-500">📱 {user.number}</p>}
        {user.gender && <p className="text-sm text-gray-500">👤 Giới tính: {user.gender}</p>}
        {user.age !== undefined && <p className="text-sm text-gray-500">🎂 Tuổi: {user.age}</p>}
        {user.bio && <p className="text-sm text-gray-500">📝 Tiểu sử: {user.bio}</p>}
        {user.statusMessage && (
          <p className="text-xs italic text-gray-400 mt-1 border-l-4 border-blue-300 pl-3">
            “{user.statusMessage}”
          </p>
        )}
        <p className="text-xs mt-2">
          Trạng thái:{' '}
          <span className={user.onlineStatus ? 'text-green-600 font-semibold' : 'text-gray-400'}>
            {user.onlineStatus ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </span>
        </p>
      </div>

      {/* Nút hành động nếu có */}
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  );
};

export default UserInfoCard;
