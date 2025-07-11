'use client';

import { useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';

interface User {
  _id: string;
  fullname: string;
  email: string;
  number?: string;
}

export default function useUserSearch() {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: {
    fullname?: string;
    email?: string;
    number?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.fullname) params.append('fullname', query.fullname);
      if (query.email) params.append('email', query.email);
      if (query.number) params.append('number', query.number);

      const res = await axiosInstance.get(`/search?${params.toString()}`);
      setResults(res.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi không xác định khi tìm kiếm.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}
