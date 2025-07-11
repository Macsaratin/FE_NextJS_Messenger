'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useNotification from '@/hook/useNotification';
import authService from '@/service/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message, showMessage } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      showMessage('Vui lòng nhập đầy đủ thông tin');
      setIsSubmitting(false);
      return;
    }

    try {
        await authService.login({ email, password });
        router.push('/chat');
    } catch (error: any) {
        showMessage(error.message || 'Đăng nhập thất bại');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Đăng nhập</h2>

        {message && (
          <div className="bg-red-50 text-red-600 text-sm font-medium text-center py-3 px-4 mb-6 rounded-lg border border-red-200">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <button
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            onClick={() => router.push('/register')}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}