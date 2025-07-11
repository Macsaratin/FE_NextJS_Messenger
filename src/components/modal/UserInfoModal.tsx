'use client';
import React from 'react';
import UserInfoCard from '@/components/UserInfoCard';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  onClose: () => void;
}

export default function UserInfoModal({ user, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 relative animate-fade-in-up">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Đóng"
        >
          &times;
        </button>
        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Thông tin người dùng</h2>

        {/* Nội dung card */}
        <UserInfoCard user={user} />
      </div>
    </div>
  );
}
