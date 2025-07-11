'use client';

import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import useFriends from '@/hook/useFriends';
import { useRouter } from 'next/navigation';

let socket: Socket;

export default function ChatComponent() {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  // const [token,setToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'friends'>('chat');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatType, setChatType] = useState<'friend' | 'group'>('friend');

  const router = useRouter();
  const { friends, loading: loadingFriends, error: friendError } = useFriends();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    // setToken(storedToken);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwtDecode(storedToken);
    setUser(decoded);

    socket = io('http://localhost:3000', {
      auth: { token: storedToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('newMessage', (msg) => {
      if (
        (chatType === 'friend' && selectedChat && msg.senderId === selectedChat._id) ||
        (chatType === 'group' && selectedChat && msg.conversationId === selectedChat._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.on('newGroupMessage', (msg) => {
      if (chatType === 'group' && selectedChat && msg.conversationId === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedChat, chatType, router]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !selectedChat) return;

    const msg = {
      senderId: user.id,
      content: newMessage,
      createdAt: new Date(),
      receiverId: chatType === 'friend' ? selectedChat._id : undefined,
      conversationId: chatType === 'group' ? selectedChat._id : undefined,
    };

    if (chatType === 'friend') {
      socket.emit('newMessage', msg);
    } else {
      socket.emit('newGroupMessage', { ...msg, chatRoomId: selectedChat._id });
    }

    setMessages((prev) => [...prev, { ...msg, self: true }]);
    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-lg font-semibold">👋 Xin chào, {user.fullname}</span>
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'friends' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            Bạn bè
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Danh sách bạn bè */}
          {activeTab === 'friends' && (
            <div className="p-6 max-w-5xl mx-auto w-full">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Chọn bạn để trò chuyện</h2>
              {loadingFriends && (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="ml-3 text-gray-600 text-lg">Đang tải bạn bè...</p>
                </div>
              )}
              {friendError && (
                <div className="bg-red-50 text-red-600 text-sm font-medium text-center py-3 px-4 mb-6 rounded-lg border border-red-200">
                  {friendError}
                </div>
              )}
              {!loadingFriends && !friendError && friends.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <p className="text-gray-500 text-lg font-medium">Bạn chưa có bạn nào.</p>
                  <p className="text-gray-400 mt-2">Hãy tìm kiếm và kết nối để thêm bạn bè mới!</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((f) => (
                  <div
                    key={f._id}
                    className="p-5 bg-white rounded-2xl shadow-lg flex items-center gap-4 hover:bg-blue-50 transition-shadow duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedChat(f);
                      setChatType('friend');
                      setMessages([]);
                      setActiveTab('chat');
                      socket.emit('joinRoom', { roomId: f._id });
                    }}
                  >
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                      {f.fullname?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{f.fullname || 'Không có tên'}</p>
                      <p className="text-sm text-gray-500">{f.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Giao diện chat */}
          {activeTab === 'chat' && (
            <>
              {/* Header người đang chat */}
              <div className="bg-white px-6 py-4 border-b shadow-lg">
                {selectedChat ? (
                  <h3 className="text-xl font-semibold text-gray-800">
                    Trò chuyện với {chatType === 'friend' ? selectedChat.fullname : selectedChat.name}
                  </h3>
                ) : (
                  <h3 className="text-xl font-semibold text-gray-500">Chưa chọn ai</h3>
                )}
              </div>

              {/* Nội dung tin nhắn */}
              <div ref={chatBoxRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && selectedChat && (
                  <div className="text-center text-gray-500 text-lg">Bắt đầu trò chuyện nào!</div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-md rounded-2xl px-4 py-3 text-sm shadow ${
                      msg.self
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Nhập tin nhắn */}
              {selectedChat && (
                <div className="p-4 bg-white border-t shadow-lg flex items-center gap-3">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Gửi
                  </button>
                </div>
              )}
              {!selectedChat && (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                  Vui lòng chọn một người bạn để bắt đầu trò chuyện
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}