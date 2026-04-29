'use client';

import { useState, useEffect } from 'react';

export default function Taskboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/taskboard')
      .then(res => res.json())
      .then(data => {
        const taskList = data.tasks || [];
        setTasks(taskList.map(t => ({
          ...t,
          progress: t.status === 'in-progress' ? 50 : (t.status === 'done' ? 100 : 0)
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center pb-20"><p className="text-gray-400">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-20">
      <div className="p-4 border-b border-gray-800 sticky top-0 bg-[#0B0F19] z-10">
        <h1 className="text-2xl font-bold mb-3">Taskboard</h1>
        <div className="flex gap-2">
          {['all', 'todo', 'in-progress', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded-full ${filter === f ? 'bg-blue-600' : 'bg-gray-800'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 pb-32">
        {filtered.map(task => (
          <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-gray-800 rounded-lg p-4 cursor-pointer border-l-4 border-blue-500">
            <h3 className="font-semibold">{task.title}</h3>
            {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">{task.assignee}</span>
              {task.status === 'in-progress' && <span className="text-xs text-purple-400">50%</span>}
              {task.status === 'done' && <span className="text-xs text-green-400">✓</span>}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-end justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-gray-800 rounded-t-lg w-full max-w-md p-6 mb-20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Task Details</h2>
              <button onClick={() => setSelectedTask(null)} className="text-2xl">×</button>
            </div>
            <h3 className="text-lg font-semibold mb-2">{selectedTask.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{selectedTask.description || 'No description'}</p>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Assignee:</strong> {selectedTask.assignee}</p>
              {selectedTask.progress !== undefined && <p><strong>Progress:</strong> {selectedTask.progress}%</p>}
            </div>
            <button onClick={() => setSelectedTask(null)} className="w-full mt-6 py-3 bg-blue-600 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
