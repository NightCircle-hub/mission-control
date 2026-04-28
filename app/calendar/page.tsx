'use client';

import { useState } from 'react';

export default function Calendar() {
  const events = [
    { id: 1, title: 'Daily Briefing', time: '8:00 AM', type: 'recurring' },
    { id: 2, title: 'System Maintenance', time: '10:30 AM', type: 'automated' },
    { id: 3, title: 'Heartbeat Review', time: '1:00 PM', type: 'automated' },
    { id: 4, title: 'Memory Sync to NAS', time: '6:00 PM', type: 'backup' },
  ];

  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#E3E3E3] mb-1">Calendar</h2>
        <p className="text-sm text-[#8E8E93]">Schedule and automated events</p>
      </div>

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#E3E3E3] mb-4">TODAY'S SCHEDULE</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 items-start">
              <div className="text-xs text-[#8E8E93] w-16 pt-0.5">{event.time}</div>
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div className="flex-1">
                <p className="text-sm text-[#E3E3E3]">{event.title}</p>
                <p className="text-xs text-[#8E8E93] capitalize">{event.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
