import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import auth from "@/service/auth";
const apiUrl = 'http://localhost:3000/api';
let socket: Socket | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messageCallbacks: ((message: any) => void)[] = [];

export function connectSocket() {
  const token = auth.getToken();
  if (!token) {
    console.error('No token available for socket connection');
    return;
  }

  socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket?.id);
    const userId = auth.getUserId();
    if (userId) socket?.emit('join', { userId });
  });

  socket.on('message', (msg) => notifyCallbacks(msg));
  socket.on('newMessage', (msg) => notifyCallbacks(msg));
  socket.on('disconnect', (r) => console.log('Disconnected:', r));
  socket.on('error', (e) => console.error('Socket error:', e));
}

export function getSocket(): Socket | null {
  return socket;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifyCallbacks(message: any) {
  messageCallbacks.forEach((cb) => {
    try {
      cb(message);
    } catch (err) {
      console.error('Callback error:', err);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function listenForMessages(callback: (msg: any) => void) {
  messageCallbacks.push(callback);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeMessageListener(callback: (msg: any) => void) {
  messageCallbacks = messageCallbacks.filter((cb) => cb !== callback);
}

export async function sendMessage(recipientId: string, content: string, conversationId?: string) {
  const token = auth.getToken();
  const senderId = auth.getUserId();

  if (!token || !senderId || !recipientId || !content.trim()) {
    return Promise.reject('Invalid data');
  }

  try {
    const res = await axios.post(
      `${apiUrl}/mess/send`,
      { recipientId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const resolvedConvId = res.data?.data?.conversation?._id || conversationId;

    const messagePayload = {
      senderId,
      receiverId: recipientId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
      conversationId: resolvedConvId,
    };

    return emitWithRetry('newMessage', messagePayload).then(() => res.data);
  } catch (error) {
    console.error('Send msg error:', error);
    throw error;
  }
}

export async function sendFileMessage(conversationId: string, file: File, recipientId?: string) {
  const token = auth.getToken();
  const senderId = auth.getUserId();
  if (!token || !senderId) return Promise.reject('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversationId', conversationId);
  if (recipientId) formData.append('recipientId', recipientId);

  try {
    const res = await axios.post(`${apiUrl}/mess/send-file`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const messagePayload = {
      senderId,
      receiverId: recipientId || null,
      content: '',
      file: res.data.data.fileUrl,
      createdAt: new Date().toISOString(),
      status: 'sent',
      conversationId,
    };

    return emitWithRetry('newMessage', messagePayload).then(() => res.data);
  } catch (error) {
    console.error('File msg error:', error);
    throw error;
  }
}

export async function getMessages(friendId: string) {
  const token = auth.getToken();
  const res = await axios.get(`${apiUrl}/mess/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getGroupChat(id: string) {
  const token = auth.getToken();
  const res = await axios.get(`${apiUrl}/groupchat/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getGroupChats() {
  const token = auth.getToken();
  const res = await axios.get(`${apiUrl}/groupchat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function emitWithRetry(event: string, data: any, attempts = 3): Promise<void> {
  return new Promise((resolve, reject) => {
    const tryEmit = (retry: number) => {
      if (!socket || !socket.connected) {
        if (retry > 0) {
          setTimeout(() => tryEmit(retry - 1), 500);
        } else {
          reject(new Error('Socket not connected'));
        }
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit(event, data, (ack: any) => {
        if (ack?.error) {
          if (retry > 0) {
            setTimeout(() => tryEmit(retry - 1), 500);
          } else {
            reject(new Error(ack.error));
          }
        } else {
          resolve();
        }
      });
    };
    tryEmit(attempts);
  });
}
