// friendService.ts
import axiosInstance from '../lib/axiosInstance';
import Cookies from 'js-cookie';
const friendService = {
  getFriendList: async () => {
    const res = await axiosInstance.get('/friend');
    return res.data;
  },

  sendFriendRequest: async (toUserId: string) => {
    const fromUserId = Cookies.get('userId');
    if (!fromUserId) throw new Error('Thiếu userId');

    const res = await axiosInstance.post('/friend/send', {
      fromUser: fromUserId,
      toUser: toUserId,
    });

    return res.data;
  },
  getUserInfo: async (userId: string) => {
    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data;
  },
  getFriendPending: async () => {
    const res = await axiosInstance.get(`/friend/list/pending`);
    return res.data;
  },
    acceptFriendRequest: async (requestId: string) => {
    const res = await axiosInstance.post('/friend/accept', { requestId });
    return res.data;
  },
  rejectFriendRequest: async (requestId: string) => {
    const res = await axiosInstance.post('/friend/reject', { requestId });
    return res.data;
  },
};

export default friendService;
