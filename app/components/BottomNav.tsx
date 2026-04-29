'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  
  const moreItems = [
    { href: '/team', icon: '👥', label: 'Team' },
    { href: '/projects', icon: '📁', label: 'Projects' },
    { href: '/docs', icon: '📚', label: 'Docs' },
    { href: '/memory', icon: '💾', label: 'Memory' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1623] border-t border-[#1E293B] px-4 py-2 md:hidden z-50">
        <div className="flex justify-around items-center">
          <a href="/dashboard" className={`flex flex-col items-center p-2 ${pathname === '/dashboard' ? 'text-blue-400' : 'text-gray-400'}`}>
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a href="/calendar" className={`flex flex-col items-center p-2 ${pathname.startsWith('/calendar') ? 'text-blue-400' : 'text-gray-400'}`}>
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">Calendar</span>
          </a>
          <a href="/taskboard" className={`flex flex-col items-center p-2 ${pathname.startsWith('/taskboard') ? 'text-blue-400' : 'text-gray-400'}`}>
            <span className="text-xl">✅</span>
            <span className="text-xs mt-1">Tasks</span>
          </a>
          <button onClick={() => setShowMore(true)} className="flex flex-col items-center p-2 text-gray-400">
            <span className="text-xl">⋯</span>
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Modal */}
      {showMore && (
        <div className="fixed inset-0 bg-black/80 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#0F1623] rounded-t-lg p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-4 text-white">More</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {moreItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center p-4 bg-[#1E293B] rounded-lg"
                  onClick={() => setShowMore(false)}
                >
                  <span className="text-2xl mb-2">{item.icon}</span>
                  <span className="text-sm text-white">{item.label}</span>
                </a>
              ))}
            </div>
            <button onClick={() => setShowMore(false)} className="w-full py-3 bg-blue-600 rounded-lg font-medium text-white">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
