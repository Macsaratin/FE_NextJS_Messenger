'use client';

import { useEffect, useState } from 'react';
import friendService from '@/service/FriendsService';

interface Friend {
  _id: string;
  fullname: string;
  email: string;
}

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendModal({ isOpen, onClose }: FriendModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const data = await friendService.getFriendList();
      setFriends(data.friends || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setMessage('Không thể tải danh sách bạn bè.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      const res = await friendService.sendFriendRequest(email);
      setMessage(res.message || 'Đã gửi lời mời kết bạn.');
      setEmail('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Lỗi khi gửi lời mời.');
    }
  };

  // const handleUnfriend = async (friendId: string) => {
  //   if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;

  //   try {
  //     await friendService.unfriend(friendId);
  //     setFriends((prev) => prev.filter((f) => f._id !== friendId));
  //     setMessage('Đã hủy kết bạn.');
  //   } catch (err: any) {
  //     setMessage(err.response?.data?.message || 'Lỗi khi hủy kết bạn.');
  //   }
  // };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Quản lý bạn bè</h2>

        {message && <p className="mb-2 text-sm text-blue-600">{message}</p>}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Nhập email để kết bạn"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSendRequest}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Gửi lời mời
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">Bạn bè hiện tại</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <ul className="max-h-40 overflow-y-auto space-y-2">
            {friends.map((friend) => (
              <li key={friend._id} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <p className="font-medium">{friend.fullname}</p>
                  <p className="text-sm text-gray-600">{friend.email}</p>
                </div>
                <button
                  // onClick={() => handleUnfriend(friend._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Hủy kết bạn
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
