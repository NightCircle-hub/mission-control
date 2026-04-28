'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export default function Taskboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch('/api/taskboard')
      .then(res => res.json())
      .then(data => setTasks(data.tasks || []))
      .catch(() => {
        setTasks([
          { id: 1, title: 'Review system logs', assignee: 'NightCircle', status: 'todo', priority: 'high' },
          { id: 2, title: 'Update documentation', assignee: 'Signal', status: 'in-progress', priority: 'medium' },
          { id: 3, title: 'Optimize database', assignee: 'Engine', status: 'done', priority: 'low' },
        ]);
      });
  }, []);

  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#E3E3E3] mb-1">Taskboard</h2>
        <p className="text-sm text-[#8E8E93]">Track tasks across your AI team</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Column title="TODO" color="blue" tasks={tasks.filter(t => t.status === 'todo')} />
        <Column title="IN PROGRESS" color="purple" tasks={tasks.filter(t => t.status === 'in-progress')} />
        <Column title="DONE" color="green" tasks={tasks.filter(t => t.status === 'done')} />
      </div>
    </div>
  );
}

function Column({ title, color, tasks }: { title: string; color: string; tasks: Task[] }) {
  const colors: any = {
    blue: { bg: 'bg-blue-600/20', border: 'border-blue-600/30', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-600/20', border: 'border-purple-600/30', text: 'text-purple-400' },
    green: { bg: 'bg-green-600/20', border: 'border-green-600/30', text: 'text-green-400' },
  };

  return (
    <div className={`bg-[#0A0A0A] border ${colors[color].border} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${colors[color].text}`}>{title}</h3>
        <span className="text-xs text-[#8E8E93]">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#E3E3E3]">{task.title}</h4>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
              <span className="text-xs text-[#8E8E93]">{task.assignee}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-[#8E8E93] text-center py-8">No tasks</p>}
      </div>
    </div>
  );
}
