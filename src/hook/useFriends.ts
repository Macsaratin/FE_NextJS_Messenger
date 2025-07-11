'use client';

import { useEffect, useState } from 'react';
import friendService from '@/service/FriendsService';
import Cookies from 'js-cookie';

export default function useFriends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('token');
      if (!token) throw new Error('Chưa đăng nhập');

      const data = await friendService.getFriendList();
      setFriends(data.friends || []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách bạn bè:', err);
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ gọi khi có token
    if (Cookies.get('token')) {
      fetchFriends();
    } else {
      setLoading(false); // không cần loading nếu không gọi API
      setError('Chưa đăng nhập');
    }
  }, []);

  return {
    friends,
    loading,
    error,
    refresh: fetchFriends,
  };
}