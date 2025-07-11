'use client';
import { useState } from 'react';
import useFriends from '@/hook/useFriends';
import useUserSearch from '@/hook/useUserSearch';
import useFriendRequests from '@/hook/useFriendRequests';
import friendService from '@/service/FriendsService';
import UserInfoCard from '@/components/UserInfoCard';
import UserInfoModal from '@/components/modal/UserInfoModal';

export default function FriendPage() {
  const { friends, loading, error } = useFriends();
  const { results, loading: searching, error: searchError, search } = useUserSearch();
  const {
    receivedRequests,
    sentRequests,
    loading: loadingRequests,
    error: errorRequests,
    acceptRequest,
    rejectRequest,
    actionMessage,
    setActionMessage,
    refresh,
  } = useFriendRequests();

  const [keyword, setKeyword] = useState('');
  const [searchField, setSearchField] = useState<'fullname' | 'email' | 'number'>('fullname');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = () => {
    if (!keyword.trim()) {
      setMessage('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    setMessage('');
    search({ [searchField]: keyword.trim() });
  };

  const handleInfor = (userId: string) => {
    const user = results.find((u) => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setShowModal(true);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    try {
      await friendService.sendFriendRequest(toUserId);
      setMessage('Đã gửi lời mời kết bạn.');
      await refresh();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Lỗi khi gửi lời mời.');
    }
  };

  const handleCancelRequest = async (toUserId: string) => {
    try {
      await friendService.rejectFriendRequest(toUserId);
      setMessage('Đã huỷ lời mời.');
      await refresh();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Lỗi khi huỷ lời mời.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Danh sách bạn bè</h2>

        <div className="mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Từ khóa</label>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Tìm theo</label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as 'fullname' | 'email' | 'number')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="fullname">Họ tên</option>
              <option value="email">Email</option>
              <option value="number">Số điện thoại</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="sm:mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Tìm kiếm
          </button>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 mb-4 rounded text-sm text-center">
            {message}
          </div>
        )}

        {actionMessage && (
          <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 mb-4 rounded text-sm text-center">
            {actionMessage}
          </div>
        )}

        {searching && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 text-lg">Đang tìm kiếm...</p>
          </div>
        )}
        {searchError && (
          <div className="bg-red-100 text-red-600 text-sm font-medium py-3 px-4 mb-6 rounded border border-red-200">
            {searchError}
          </div>
        )}
        {results.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Kết quả tìm kiếm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((u) => (
                <div
                  key={u._id}
                  className="p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col gap-4"
                >
                  <UserInfoCard user={u} />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleInfor(u._id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleSendRequest(u._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Kết bạn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xl font-semibold text-gray-700 mb-4">Bạn bè của bạn</h3>
        {loading && <div className="text-center text-gray-600 py-6">Đang tải bạn bè...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {!loading && !error && friends.length === 0 && (
          <p className="text-center text-gray-500">Bạn chưa có bạn nào. Hãy tìm kiếm để kết bạn!</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {friends.map((f) => (
            <UserInfoCard key={f._id} user={f} />
          ))}
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">Lời mời bạn nhận được</h3>
        {loadingRequests && <div className="text-center text-gray-600 py-6">Đang tải lời mời...</div>}
        {!loadingRequests && receivedRequests.length === 0 && (
          <p className="text-center text-gray-500">Không có lời mời bạn nhận được.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {receivedRequests.map((req) => (
            <div key={req._id} className="p-5 bg-white rounded-2xl shadow-md flex flex-col gap-4">
              <UserInfoCard user={req.fromUser} />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => acceptRequest(req._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Chấp nhận
                </button>
                <button
                  onClick={() => rejectRequest(req._id)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">Lời mời bạn đã gửi</h3>
        {!loadingRequests && sentRequests.length === 0 && (
          <p className="text-center text-gray-500">Không có lời mời bạn đã gửi.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sentRequests.map((req) => (
            <div key={req._id} className="p-5 bg-white rounded-2xl shadow-md flex flex-col gap-4">
              <UserInfoCard user={req.toUser} />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Đang chờ phản hồi</span>
                <button
                  onClick={() => handleCancelRequest(req.toUser._id)}
                  className="text-red-500 hover:underline"
                >
                  Huỷ lời mời
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && selectedUser && (
          <UserInfoModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
