'use client';

import Cookies from 'js-cookie';
import axiosInstance from '@/lib/axiosInstance';

const USER_ID_KEY = 'userId';

const userService = {
  getCurrentUser: async () => {
    const userId = Cookies.get(USER_ID_KEY);
    if (!userId) throw new Error('User ID không tồn tại trong cookie');

    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUserById: async (id: string, updateData: any) => {
    const res = await axiosInstance.put(`/users/${id}`, updateData);
    return res.data;
  },

  deleteUserById: async (id: string) => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
  },

  getUserAvatarById: async (id: string) => {
    const res = await axiosInstance.get(`/users/${id}/avatar`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(res.data);
  },

  postAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await axiosInstance.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // để trình duyệt set boundary
      },
    });
    return res.data;
  },

  searchUsers: async (params: Record<string, string>) => {
    const res = await axiosInstance.get('/search', { params });
    return res.data;
  },
};

export default userService;
