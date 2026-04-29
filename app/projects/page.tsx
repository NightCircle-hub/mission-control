'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Projects() {
  const [projects, setProjects] = useState([
    { id: 1, title: 'AI Dream Team', progress: 100, status: 'Complete' },
    { id: 2, title: 'Mission Control PWA', progress: 85, status: 'In Progress' },
    { id: 3, title: 'Daily Briefing', progress: 100, status: 'Complete' },
    { id: 4, title: 'Team Us Foundation', progress: 60, status: 'In Progress' },
  ]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Projects</h1>
        <p className="text-gray-400 mb-6">Track your initiatives</p>
        
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-[#1E293B] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{project.title}</h3>
                <span className="text-xs text-blue-400">{project.status}</span>
              </div>
              <div className="w-full bg-[#0F1623] rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">{project.progress}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
