'use client';

export default function Memory() {
  const memories = [
    { date: 'Apr 28, 2026', title: 'Mission Control Deployed', preview: 'Live on Vercel with 116 tasks...' },
    { date: 'Apr 27, 2026', title: 'NAS Backup Configured', preview: 'Automated daily backups at 3am...' },
    { date: 'Apr 26, 2026', title: 'AI Dream Team Complete', preview: 'All 12 agents deployed...' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Memory</h1>
        <p className="text-gray-400 mb-6">Daily notes and long-term memories</p>
        
        <div className="space-y-4">
          {memories.map((memory, idx) => (
            <div key={idx} className="bg-[#1E293B] rounded-lg p-4 border-l-4 border-blue-600">
              <p className="text-xs text-gray-400 mb-1">{memory.date}</p>
              <h3 className="font-semibold">{memory.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{memory.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
