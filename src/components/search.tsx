'use client';

import { useState } from 'react';
import useUserSearch from '@/hook/useUserSearch';
import useNotification from '@/hook/useNotification';

export default function SearchUserComponent() {
  const [searchType, setSearchType] = useState<'fullname' | 'email' | 'number' | 'all'>('all');
  const [inputFullname, setInputFullname] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const { results, loading, error, search } = useUserSearch();
  const { message, showMessage } = useNotification();

  const handleSearch = () => {
    const params: any = {};

    if (searchType === 'fullname' && inputFullname.trim()) {
      params.fullname = inputFullname;
    } else if (searchType === 'email' && inputEmail.trim()) {
      params.email = inputEmail;
    } else if (searchType === 'number' && inputNumber.trim()) {
      params.number = inputNumber;
    } else if (searchType === 'all') {
      if (inputFullname.trim()) params.fullname = inputFullname;
      if (inputEmail.trim()) params.email = inputEmail;
      if (inputNumber.trim()) params.number = inputNumber;
    }

    if (Object.keys(params).length === 0) {
      showMessage('Vui lòng nhập ít nhất một tiêu chí tìm kiếm');
      return;
    }

    search(params);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Tìm kiếm người dùng</h1>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">Chọn kiểu tìm kiếm:</label>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="all">Tất cả</option>
          <option value="fullname">Theo tên</option>
          <option value="email">Theo email</option>
          <option value="number">Theo số điện thoại</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Họ tên"
          value={inputFullname}
          onChange={(e) => setInputFullname(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={searchType !== 'fullname' && searchType !== 'all'}
        />
        <input
          type="text"
          placeholder="Email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={searchType !== 'email' && searchType !== 'all'}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={inputNumber}
          onChange={(e) => setInputNumber(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={searchType !== 'number' && searchType !== 'all'}
        />
      </div>

      <button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Tìm kiếm
      </button>

      {message && <p className="text-blue-600 mt-2">{message}</p>}
      {loading && <p className="mt-4">Đang tìm...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <ul className="space-y-3 mt-4">
        {results.map((user) => (
          <li key={user._id} className="p-4 border rounded bg-white shadow">
            <p className="font-semibold">{user.fullname}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">SĐT: {user.number || 'Không có'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
