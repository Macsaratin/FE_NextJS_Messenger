'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface Message {
  senderId: string;
  chatRoomId: string;
  content: string;
  createdAt: string;
  status?: string;
}

export default function useGroupChat(token: string | null, userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupChats, setGroupChats] = useState<any[]>([]);

  // Connect socket
  const connectSocket = useCallback(() => {
    if (!token || !userId) return;

    socketRef.current = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
      socketRef.current?.emit('join', { userId });
    });

    socketRef.current.on('newGroupMessage', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }, [token, userId]);

  useEffect(() => {
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connectSocket]);

  const joinGroupRoom = (roomId: string) => {
    socketRef.current?.emit('joinGroupRoom', { chatRoomId: roomId });
  };

  const leaveGroupRoom = (roomId: string) => {
    socketRef.current?.emit('leaveGroupRoom', { chatRoomId: roomId });
  };

  const sendGroupMessage = async (chatRoomId: string, content: string) => {
    if (!token || !userId || !chatRoomId || !content.trim()) return;

    const messagePayload = {
      senderId: userId,
      chatRoomId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    try {
      const res = await axios.post(`${API_URL}/mess/group/send`, {
        chatRoomId,
        content,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socketRef.current?.emit('newGroupMessage', messagePayload);
      setMessages((prev) => [...prev, messagePayload]);

      return res.data;
    } catch (err) {
      console.error('Send group message failed:', err);
      throw err;
    }
  };

  const getGroupMessages = async (groupId: string) => {
    if (!token) return;
    const res = await axios.get(`${API_URL}/mess/group/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data.data.messages);
    return res.data.data;
  };

  const getGroupChats = async () => {
    if (!token || !userId) return;
    const res = await axios.get(`${API_URL}/groupchat/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGroupChats(res.data.data || []);
  };

  return {
    socket: socketRef.current,
    messages,
    groupChats,
    joinGroupRoom,
    leaveGroupRoom,
    sendGroupMessage,
    getGroupMessages,
    getGroupChats,
  };
}
