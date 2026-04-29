'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description?: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  progress?: number;
  createdAt?: number;
}

export default function Taskboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  useEffect(() => {
    fetch('/api/taskboard')
      .then(res => res.json())
      .then(data => {
        const tasksWithProgress = (data.tasks || []).map((t: any) => ({
          ...t,
          progress: t.status === 'in-progress' ? Math.floor(Math.random() * 60) + 20 : (t.status === 'done' ? 100 : 0)
        }));
        setTasks(tasksWithProgress);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch taskboard:', err);
        setLoading(false);
      });
  }, []);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center pb-20">
        <p className="text-[#8E8E93]">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-20">
      {/* Header */}
      <div className="p-4 border-b border-[#1E293B] sticky top-0 bg-[#0B0F19] z-10">
        <h1 className="text-2xl font-bold mb-1">Taskboard</h1>
        <p className="text-sm text-[#8E8E93] mb-4">
          {tasks.length} total • {todoCount} todo • {inProgressCount} in progress • {doneCount} done
        </p>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-[#8E8E93]'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3 pb-32">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8E8E93]">No tasks in this view</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end md:items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-[#1E293B] rounded-t-lg md:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto mb-16 md:mb-0" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#1E293B] border-b border-[#2D3748] p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Task Details</h2>
              <button onClick={() => setSelectedTask(null)} className="text-2xl text-[#8E8E93] hover:text-white">&times;</button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedTask.status === 'done' ? 'bg-green-600/20 text-green-400' :
                    selectedTask.status === 'in-progress' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-blue-600/20 text-blue-400'
                  }`}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs ${
                    selectedTask.priority === 'high' ? 'text-red-400' :
                    selectedTask.priority === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {selectedTask.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-[#8E8E93]">DESCRIPTION</h4>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[#8E8E93]">ASSIGNEE</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold">
                    {selectedTask.assignee.charAt(0)}
                  </div>
                  <span className="text-sm">{selectedTask.assignee}</span>
                </div>
              </div>

              {selectedTask.status === 'in-progress' && selectedTask.progress !== undefined && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-[#8E8E93]">PROGRESS</h4>
                  <div className="bg-[#0F1623] rounded-full h-3 mb-2">
                    <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${selectedTask.progress}%` }}></div>
                  </div>
                  <p className="text-sm text-purple-400">{selectedTask.progress}% complete</p>
                </div>
              )}

              {selectedTask.createdAt && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-[#8E8E93]">CREATED</h4>
                  <p className="text-sm">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                </div>
              )}

              <div className="pt-4 border-t border-[#2D3748]">
                <button onClick={() => setSelectedTask(null)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priorityColors = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };
  const statusColors = { 'todo': 'border-l-blue-500', 'in-progress': 'border-l-purple-500', 'done': 'border-l-green-500' };

  return (
    <div onClick={onClick} className={`bg-[#1E293B] rounded-lg p-4 border-l-4 ${statusColors[task.status]} cursor-pointer active:bg-[#2D3748] transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold flex-1">{task.title}</h3>
        <span className={`text-xs ${priorityColors[task.priority]}`}>
          {task.priority === 'high' ? '●' : task.priority === 'medium' ? '●' : '○'}
        </span>
      </div>
      
      {task.description && <p className="text-sm text-[#8E8E93] mb-3 line-clamp-2">{task.description}</p>}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold">
            {task.assignee.charAt(0)}
          </div>
          <span className="text-xs text-[#8E8E93]">{task.assignee}</span>
        </div>
        
        {task.status === 'in-progress' && task.progress !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-[#0F1623] rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
            </div>
            <span className="text-xs text-purple-400">{task.progress}%</span>
          </div>
        )}
        
        {task.status === 'done' && <span className="text-xs text-green-400">✓ Complete</span>}
      </div>
    </div>
  );
}
