'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import friendService from '@/service/FriendsService';

export default function useFriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await friendService.getFriendPending();
      const userId = Cookies.get('userId');

      if (!userId) throw new Error('Chưa xác định userId');

      const received = res.requests.filter((r: any) => r.toUser === userId);
      const sent = res.requests.filter((r: any) => r.fromUser._id === userId);

      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lỗi khi tải lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

const acceptRequest = async (requestId: string) => {
  try {
    await friendService.acceptFriendRequest(requestId);
    setActionMessage('Đã chấp nhận lời mời kết bạn.');
    await fetchRequests();
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Lỗi khi chấp nhận lời mời.');
  }
};

const rejectRequest = async (requestId: string) => {
  try {
    await friendService.rejectFriendRequest(requestId);
    setActionMessage('Đã từ chối lời mời kết bạn.');
    await fetchRequests();
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Lỗi khi từ chối lời mời.');
  }
};


  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    receivedRequests,
    sentRequests,
    loading,
    error,
    refresh: fetchRequests,
    acceptRequest,
    rejectRequest,
    actionMessage,
    setActionMessage,
  };
}
