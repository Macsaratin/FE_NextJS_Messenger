import { useState } from 'react';

export default function useNotification() {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string, duration = 4000) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, duration);
  };

  return { message, showMessage };
}
