'use client';

import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsAuthenticated(!!token);
  }, []);

  if (!isAuthenticated) return null;

  const navItems = [
    { label: 'Trò chuyện', path: '/chat', icon: '🏠' },
    { label: 'Bạn bè', path: '/friend', icon: '👥' },
    { label: 'Nhóm', path: '/groups', icon: '💬' },
    { label: 'Cài đặt', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="w-60 bg-white border-r h-screen flex flex-col">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-blue-600">Menu</h2>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={clsx(
              'flex items-center gap-3 px-4 py-2 w-full rounded text-left hover:bg-blue-50',
              pathname === item.path ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
