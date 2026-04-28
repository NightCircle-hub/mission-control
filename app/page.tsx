'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('taskboard');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E3E3E3] font-sans antialiased">
      {/* Header */}
      <header className="border-b border-[#1F1F1F] bg-[#0D0D0D]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6] flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-sm font-medium text-[#E3E3E3]">Mission Control</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                Dashboard →
              </a>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                <span className="text-xs text-[#8E8E93]">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[#1F1F1F] bg-[#0D0D0D]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-0.5">
            {[
              { id: 'taskboard', label: 'Taskboard' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'team', label: 'Team' },
              { id: 'overview', label: 'Overview' },
              { id: 'tools', label: 'Tools' },
              { id: 'sessions', label: 'Sessions' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-all ${
                  activeTab === tab.id
                    ? 'text-[#E3E3E3] bg-[#1A1A1A] rounded-md'
                    : 'text-[#8E8E93] hover:text-[#E3E3E3] hover:bg-[#141414] rounded-md'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'taskboard' && <Taskboard />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'tools' && <ToolsTab />}
        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function Taskboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('NightCircle');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

  // Fetch live task data
  const fetchTaskboard = async () => {
    try {
      const res = await fetch('/api/taskboard');
      const data = await res.json();
      if (data.tasks && data.activities) {
        setTasks(data.tasks);
        setActivities(data.activities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch taskboard:', error);
      setLoading(false);
    }
  };

  // Load on mount and poll every 5 seconds
  useEffect(() => {
    fetchTaskboard();
    const interval = setInterval(fetchTaskboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleSubtasks = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSubtaskStatus = async (parentId: number, subtaskId: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === parentId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(st => {
          if (st.id === subtaskId) {
            const newStatus: Task['status'] = st.status === 'done' ? 'in-progress' : 'done';
            return {
              ...st,
              status: newStatus,
              completedAt: newStatus === 'done' ? Date.now() : undefined
            } as Task;
          }
          return st;
        });
        return { ...task, subtasks: updatedSubtasks } as Task;
      }
      return task;
    });
    
    // Update local state immediately
    setTasks(updatedTasks);
    
    // Find the subtask for activity log
    const parentTask = tasks.find(t => t.id === parentId);
    const subtask = parentTask?.subtasks?.find(st => st.id === subtaskId);
    if (parentTask && subtask) {
      const newStatus = subtask.status === 'done' ? 'in-progress' : 'done';
      const activity: Activity = {
        id: Date.now(),
        type: 'task-updated',
        message: `${parentTask.assignee} ${newStatus === 'done' ? 'completed' : 'reopened'} subtask "${subtask.title}"`,
        time: Date.now(),
      };
      const updatedActivities = [activity, ...activities.slice(0, 49)];
      setActivities(updatedActivities);
    }
    
    // Persist to file
    await fetch('/api/taskboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updatedTasks, activities: [activities[0], ...activities.slice(0, 49)] }),
    });
  };

  const moveTask = async (taskId: number, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const activity: Activity = {
        id: Date.now(),
        type: 'task-moved',
        message: `${task.assignee} moved "${task.title}" to ${formatStatus(newStatus)}`,
        time: Date.now(),
      };
      const updatedActivities = [activity, ...activities.slice(0, 49)];
      
      // Update local state
      setTasks(updatedTasks);
      setActivities(updatedActivities);
      
      // Persist to file
      await fetch('/api/taskboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks, activities: updatedActivities }),
      });
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      assignee: newTaskAssignee,
      status: 'backlog',
      description: 'No description yet',
      createdAt: Date.now(),
    };
    
    const updatedTasks = [...tasks, newTask];
    const newActivity: Activity = {
      id: Date.now(),
      type: 'task-created',
      message: `${newTaskAssignee} created "${newTaskTitle}"`,
      time: Date.now(),
    };
    const updatedActivities = [newActivity, ...activities.slice(0, 49)];
    
    // Update local state
    setTasks(updatedTasks);
    setActivities(updatedActivities);
    setNewTaskTitle('');
    
    // Persist to file
    await fetch('/api/taskboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updatedTasks, activities: updatedActivities }),
    });
  };

  const markForReview = (taskId: number) => {
    moveTask(taskId, 'review');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6 overflow-hidden">
      {/* Task Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto">
        <Column 
          title="Backlog" 
          status="backlog" 
          tasks={tasks.filter(t => t.status === 'backlog')}
          onMove={moveTask}
          onSelect={setSelectedTask}
          onToggleSubtasks={toggleSubtasks}
          onToggleSubtaskStatus={toggleSubtaskStatus}
          expandedTasks={expandedTasks}
          accent="gray"
        />
        <Column 
          title="In Progress" 
          status="in-progress" 
          tasks={tasks.filter(t => t.status === 'in-progress')}
          onMove={moveTask}
          onSelect={setSelectedTask}
          onToggleSubtasks={toggleSubtasks}
          onToggleSubtaskStatus={toggleSubtaskStatus}
          expandedTasks={expandedTasks}
          accent="blue"
        />
        <Column 
          title="Done" 
          status="done" 
          tasks={tasks.filter(t => t.status === 'done')}
          onMove={moveTask}
          onSelect={setSelectedTask}
          onToggleSubtasks={toggleSubtasks}
          onToggleSubtaskStatus={toggleSubtaskStatus}
          expandedTasks={expandedTasks}
          accent="green"
        />
        <Column 
          title="Review" 
          status="review" 
          tasks={tasks.filter(t => t.status === 'review')}
          onMove={moveTask}
          onSelect={setSelectedTask}
          onToggleSubtasks={toggleSubtasks}
          onToggleSubtaskStatus={toggleSubtaskStatus}
          expandedTasks={expandedTasks}
          accent="purple"
        />
      </div>

      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4 border-l border-[#1F1F1F] pl-6">
        {/* New Task */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
          <h3 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">New Task</h3>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-[#141414] border border-[#2A2A2A] text-[#E3E3E3] text-sm rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-[#5E6AD2]"
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] text-[#E3E3E3] text-sm rounded-md px-3 py-2 mb-3 focus:outline-none focus:border-[#5E6AD2]"
          >
            <option value="Eli">Eli</option>
            <option value="NightCircle">NightCircle</option>
            <option value="Sub-agent">Sub-agent</option>
          </select>
          <button
            onClick={addTask}
            className="w-full px-3 py-2 text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#6B7AD8] rounded-md transition-colors"
          >
            Add Task
          </button>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 overflow-hidden flex flex-col">
          <h3 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Live Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#E3E3E3]">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="text-[#8E8E93] hover:text-[#E3E3E3]">
                <span className="text-xl">×</span>
              </button>
            </div>
            <p className="text-sm text-[#8E8E93] mb-4">{selectedTask.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93]">Assignee:</span>
                <span className="text-xs font-medium text-[#E3E3E3]">{selectedTask.assignee}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93]">Status:</span>
                <span className={`text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                  {formatStatus(selectedTask.status)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedTask.status !== 'backlog' && (
                <button
                  onClick={() => moveTask(selectedTask.id, getPrevStatus(selectedTask.status))}
                  className="flex-1 px-3 py-2 text-xs font-medium text-[#E3E3E3] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors"
                >
                  ← Move Back
                </button>
              )}
              {selectedTask.status !== 'review' && (
                <button
                  onClick={() => moveTask(selectedTask.id, getNextStatus(selectedTask.status))}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#6B7AD8] rounded-md transition-colors"
                >
                  Move Forward →
                </button>
              )}
              {selectedTask.status !== 'review' && (
                <button
                  onClick={() => markForReview(selectedTask.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-[#E3E3E3] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors"
                >
                  Send to Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ 
  title, 
  status, 
  tasks, 
  onMove, 
  onSelect,
  onToggleSubtasks,
  onToggleSubtaskStatus,
  expandedTasks,
  accent 
}: { 
  title: string; 
  status: Task['status']; 
  tasks: Task[]; 
  onMove: (id: number, s: Task['status']) => void;
  onSelect: (t: Task) => void;
  onToggleSubtasks: (id: number) => void;
  onToggleSubtaskStatus: (parentId: number, subtaskId: number) => void;
  expandedTasks: number[];
  accent: 'gray' | 'blue' | 'green' | 'purple';
}) {
  const accents = {
    gray: 'bg-[#3A3A3C]',
    blue: 'bg-[#5E6AD2]',
    green: 'bg-[#34C759]',
    purple: 'bg-[#8B5CF6]',
  };

  return (
    <div className="w-72 flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-[#8E8E93] bg-[#1A1A1A] px-2 py-0.5 rounded">{tasks.length}</span>
      </div>
      <div className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-2 overflow-y-auto space-y-2">
        {tasks.map((task) => (
          <div key={task.id}>
            <TaskCard 
              task={task} 
              onClick={() => onSelect(task)}
              onToggleSubtasks={() => onToggleSubtasks(task.id)}
              isExpanded={expandedTasks.includes(task.id)}
              hasSubtasks={!!task.subtasks && task.subtasks.length > 0}
              accent={accent}
            />
            {expandedTasks.includes(task.id) && task.subtasks && (
              <div className="ml-4 mt-2 space-y-2 border-l-2 border-[#2A2A2A] pl-3">
                {task.subtasks.map((subtask) => (
                  <TaskCard 
                    key={subtask.id} 
                    task={subtask} 
                    onClick={() => onSelect(subtask)}
                    onToggleSubtasks={() => {}}
                    onToggleSubtaskStatus={() => onToggleSubtaskStatus(task.id, subtask.id)}
                    isExpanded={false}
                    hasSubtasks={false}
                    accent={accent}
                    isSubtask
                    showCheckbox
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ 
  task, 
  onClick, 
  onToggleSubtasks,
  onToggleSubtaskStatus,
  isExpanded,
  hasSubtasks,
  isSubtask = false,
  showCheckbox = false,
  accent 
}: { 
  task: Task; 
  onClick: () => void;
  onToggleSubtasks: () => void;
  onToggleSubtaskStatus?: () => void;
  isExpanded: boolean;
  hasSubtasks: boolean;
  isSubtask?: boolean;
  showCheckbox?: boolean;
  accent: 'gray' | 'blue' | 'green' | 'purple';
}) {
  const accents = {
    gray: 'border-l-[#3A3A3C]',
    blue: 'border-l-[#5E6AD2]',
    green: 'border-l-[#34C759]',
    purple: 'border-l-[#8B5CF6]',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-[#141414] border border-[#1F1F1F] ${accents[accent]} border-l-2 rounded-md p-3 cursor-pointer hover:bg-[#1A1A1A] transition-colors ${isSubtask ? 'opacity-90 scale-[0.98]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-start gap-2 flex-1">
          {showCheckbox && onToggleSubtaskStatus && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSubtaskStatus(); }}
              className="mt-0.5 text-xs transition-colors"
            >
              {task.status === 'done' ? '✅' : '⬜'}
            </button>
          )}
          <h3 className="text-sm font-medium text-[#E3E3E3] flex-1">{task.title}</h3>
        </div>
        {hasSubtasks && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSubtasks(); }}
            className="text-[#8E8E93] hover:text-[#E3E3E3] transition-colors"
          >
            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
      </div>
      <p className="text-xs text-[#8E8E93] mb-2 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8E8E93]">{task.assignee}</span>
        <span className="text-xs text-[#8E8E93]">{formatTime(task.createdAt)}</span>
      </div>
      {hasSubtasks && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] text-[#8E8E93] bg-[#1A1A1A] px-1.5 py-0.5 rounded">
            {task.subtasks?.filter(st => st.status === 'done').length || 0}/{task.subtasks?.length || 0} subtasks
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const icons = {
    'task-created': '📝',
    'task-moved': '➡️',
    'task-completed': '✅',
    'task-review': '👀',
    'task-updated': '🔄',
  };

  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-[#8E8E93]">{icons[activity.type]}</span>
      <div className="flex-1">
        <p className="text-[#E3E3E3]">{activity.message}</p>
        <p className="text-[#8E8E93] mt-0.5">{formatTime(activity.time)}</p>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatStatus(status: Task['status']): string {
  const map = {
    'backlog': 'Backlog',
    'in-progress': 'In Progress',
    'done': 'Done',
    'review': 'Review',
  };
  return map[status];
}

function getStatusColor(status: Task['status']): string {
  const colors = {
    'backlog': 'text-[#8E8E93]',
    'in-progress': 'text-[#5E6AD2]',
    'done': 'text-[#34C759]',
    'review': 'text-[#8B5CF6]',
  };
  return colors[status];
}

function getPrevStatus(status: Task['status']): Task['status'] {
  const order: Task['status'][] = ['backlog', 'in-progress', 'done', 'review'];
  const idx = order.indexOf(status);
  return order[Math.max(0, idx - 1)];
}

function getNextStatus(status: Task['status']): Task['status'] {
  const order: Task['status'][] = ['backlog', 'in-progress', 'done', 'review'];
  const idx = order.indexOf(status);
  return order[Math.min(order.length - 1, idx + 1)];
}

function Calendar() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([
    { 
      id: 1, 
      title: 'Bootstrap OpenClaw', 
      type: 'completed',
      start: new Date(Date.now() - 7200000), 
      end: new Date(Date.now() - 6600000),
      description: 'Initial setup and identity configuration',
      assignee: 'NightCircle',
      status: 'done'
    },
    { 
      id: 2, 
      title: 'Build Mission Control Dashboard', 
      type: 'completed',
      start: new Date(Date.now() - 5400000), 
      end: new Date(Date.now() - 3600000),
      description: 'Create Next.js dashboard with Linear-style UI',
      assignee: 'NightCircle',
      status: 'done'
    },
    { 
      id: 3, 
      title: 'Build Taskboard', 
      type: 'completed',
      start: new Date(Date.now() - 2400000), 
      end: new Date(Date.now() - 1200000),
      description: 'Kanban board with live activity feed',
      assignee: 'NightCircle',
      status: 'done'
    },
    { 
      id: 4, 
      title: 'Heartbeat Check', 
      type: 'scheduled',
      start: new Date(Date.now() + 1800000), 
      end: new Date(Date.now() + 1860000),
      description: 'Periodic system check - inbox, calendar, notifications',
      assignee: 'NightCircle',
      status: 'scheduled'
    },
    { 
      id: 5, 
      title: 'Discord Integration Setup', 
      type: 'scheduled',
      start: new Date(Date.now() + 7200000), 
      end: new Date(Date.now() + 9000000),
      description: 'Configure Discord channel for alternative access',
      assignee: 'NightCircle',
      status: 'pending'
    },
    { 
      id: 6, 
      title: 'Review Project Structure', 
      type: 'review',
      start: new Date(Date.now() + 3600000), 
      end: new Date(Date.now() + 3900000),
      description: 'Eli to review workspace organization and file layout',
      assignee: 'Eli',
      status: 'pending'
    },
    { 
      id: 7, 
      title: 'Daily Memory Maintenance', 
      type: 'recurring',
      start: new Date(new Date().setHours(23, 0, 0, 0)), 
      end: new Date(new Date().setHours(23, 30, 0, 0)),
      description: 'Review daily notes and update MEMORY.md',
      assignee: 'NightCircle',
      status: 'recurring',
      recurrence: 'daily'
    },
    { 
      id: 8, 
      title: 'Weekly Security Audit', 
      type: 'recurring',
      start: new Date(new Date().setDate(new Date().getDate() + 3)), 
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
      description: 'Run openclaw security audit --deep',
      assignee: 'NightCircle',
      status: 'recurring',
      recurrence: 'weekly'
    },
  ]);

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push({
        hour: i,
        label: new Date(0, 0, 0, i).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      });
    }
    return slots;
  };

  const getDaysInWeek = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      'completed': 'bg-[#34C759]/20 border-[#34C759] text-[#34C759]',
      'scheduled': 'bg-[#5E6AD2]/20 border-[#5E6AD2] text-[#5E6AD2]',
      'recurring': 'bg-[#FF9500]/20 border-[#FF9500] text-[#FF9500]',
      'review': 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]',
    };
    return colors[type];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#E3E3E3]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 text-[#8E8E93] hover:text-[#E3E3E3] hover:bg-[#1A1A1A] rounded-md transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-medium text-[#E3E3E3] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 text-[#8E8E93] hover:text-[#E3E3E3] hover:bg-[#1A1A1A] rounded-md transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-0.5">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize rounded ${
                  view === v
                    ? 'text-white bg-[#5E6AD2]'
                    : 'text-[#8E8E93] hover:text-[#E3E3E3]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="h-[calc(100vh-300px)] bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden flex flex-col">
        {view === 'day' && (
          <DayView 
            date={currentDate} 
            events={events} 
            getTimeSlots={getTimeSlots}
            onSelectEvent={setSelectedEvent}
            getTypeColor={getTypeColor}
          />
        )}
        {view === 'week' && (
          <WeekView 
            date={currentDate} 
            events={events} 
            getDaysInWeek={getDaysInWeek}
            getEventsForDay={getEventsForDay}
            onSelectEvent={setSelectedEvent}
            getTypeColor={getTypeColor}
          />
        )}
        {view === 'month' && (
          <MonthView 
            date={currentDate} 
            events={events} 
            onSelectEvent={setSelectedEvent}
            getTypeColor={getTypeColor}
          />
        )}
      </div>

      {/* Upcoming Panels */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
          <h3 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Upcoming (24h)</h3>
          <div className="space-y-2">
            {events
              .filter(e => e.start > new Date() && e.start < new Date(Date.now() + 86400000))
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type).split(' ')[1].replace('border-', 'bg-')}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#E3E3E3] truncate">{event.title}</p>
                    <p className="text-xs text-[#8E8E93]">
                      {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
          <h3 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Scheduled Jobs</h3>
          <div className="space-y-2">
            {events
              .filter(e => e.type === 'scheduled' || e.type === 'recurring')
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type).split(' ')[1].replace('border-', 'bg-')}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#E3E3E3] truncate">{event.title}</p>
                    <p className="text-xs text-[#8E8E93]">
                      {event.recurrence || 'One-time'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
          <h3 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Pending Review</h3>
          <div className="space-y-2">
            {events
              .filter(e => e.type === 'review')
              .map(event => (
                <div key={event.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type).split(' ')[1].replace('border-', 'bg-')}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#E3E3E3] truncate">{event.title}</p>
                    <p className="text-xs text-[#8E8E93]">
                      {event.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getTypeColor(selectedEvent.type).split(' ')[1].replace('border-', 'bg-')}`}></div>
                <h2 className="text-lg font-semibold text-[#E3E3E3]">{selectedEvent.title}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-[#8E8E93] hover:text-[#E3E3E3]">
                <span className="text-xl">×</span>
              </button>
            </div>
            <p className="text-sm text-[#8E8E93] mb-4">{selectedEvent.description}</p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8E8E93] w-20">Time:</span>
                <span className="text-[#E3E3E3]">
                  {selectedEvent.start.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8E8E93] w-20">Assignee:</span>
                <span className="text-[#E3E3E3]">{selectedEvent.assignee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8E8E93] w-20">Type:</span>
                <span className={`text-[#E3E3E3] capitalize`}>{selectedEvent.type}</span>
              </div>
              {selectedEvent.recurrence && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#8E8E93] w-20">Recurrence:</span>
                  <span className="text-[#E3E3E3] capitalize">{selectedEvent.recurrence}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-3 py-2 text-xs font-medium text-[#E3E3E3] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayView({ date, events, getTimeSlots, onSelectEvent, getTypeColor }: any) {
  const timeSlots = getTimeSlots();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex">
        <div className="w-16 flex-shrink-0 border-r border-[#1F1F1F]">
          {timeSlots.map((slot: any) => (
            <div key={slot.hour} className="h-12 border-b border-[#1F1F1F] flex items-start justify-end pr-2 pt-1">
              <span className="text-xs text-[#8E8E93]">{slot.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 relative">
          {timeSlots.map((slot: any) => (
            <div key={slot.hour} className="h-12 border-b border-[#1F1F1F] relative">
              {events.filter((e: any) => {
                const eventHour = new Date(e.start).getHours();
                return eventHour === slot.hour;
              }).map((event: any) => (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={`absolute left-2 right-2 rounded border px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity ${getTypeColor(event.type)}`}
                  style={{
                    top: `${(new Date(event.start).getMinutes() / 60) * 100}%`,
                    height: `${Math.max(((event.end.getTime() - event.start.getTime()) / 3600000) * 48, 20)}px`,
                  }}
                >
                  <p className="text-xs font-medium truncate">{event.title}</p>
                  <p className="text-xs opacity-75 truncate">{event.assignee}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ date, events, getDaysInWeek, getEventsForDay, onSelectEvent, getTypeColor }: any) {
  const days = getDaysInWeek();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex">
        <div className="w-16 flex-shrink-0 border-r border-[#1F1F1F]">
          {timeSlots.map((hour) => (
            <div key={hour} className="h-12 border-b border-[#1F1F1F] flex items-start justify-end pr-2 pt-1">
              <span className="text-xs text-[#8E8E93]">
                {new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex">
          {days.map((day: Date, dayIdx: number) => (
            <div key={dayIdx} className="flex-1 min-w-[120px] border-r border-[#1F1F1F]">
              <div className="h-8 border-b border-[#1F1F1F] px-2 py-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[#8E8E93]">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xs font-semibold ${
                  day.toDateString() === new Date().toDateString() 
                    ? 'text-[#5E6AD2]' 
                    : 'text-[#E3E3E3]'
                }`}>
                  {day.getDate()}
                </span>
              </div>
              {timeSlots.map((hour) => (
                <div key={hour} className="h-12 border-b border-[#1F1F1F] relative">
                  {getEventsForDay(day).filter((e: any) => {
                    const startHour = new Date(e.start).getHours();
                    return startHour === hour;
                  }).map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`absolute left-0.5 right-0.5 rounded border px-1.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity ${getTypeColor(event.type)}`}
                      style={{
                        top: `${(new Date(event.start).getMinutes() / 60) * 100}%`,
                        height: `${Math.max(((event.end.getTime() - event.start.getTime()) / 3600000) * 48, 16)}px`,
                      }}
                    >
                      <p className="text-[10px] font-medium truncate">{event.title}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({ date, events, onSelectEvent, getTypeColor }: any) {
  const getDaysInMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 gap-px bg-[#1F1F1F] border border-[#1F1F1F] rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-[#0A0A0A] px-2 py-2 text-center">
            <span className="text-xs font-medium text-[#8E8E93]">{day}</span>
          </div>
        ))}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="contents">
            {week.map((day, dayIdx) => {
              const dayEvents = day ? events.filter((e: any) => 
                new Date(e.start).toDateString() === day?.toDateString()
              ) : [];
              const isToday = day?.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={dayIdx} 
                  className={`bg-[#0A0A0A] min-h-[100px] p-2 ${!day ? 'bg-[#0D0D0D]' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-xs font-semibold mb-1 ${
                        isToday ? 'text-[#5E6AD2]' : 'text-[#E3E3E3]'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event: any) => (
                          <div
                            key={event.id}
                            onClick={() => onSelectEvent(event)}
                            className={`text-[9px] px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity truncate ${getTypeColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-[#8E8E93] pl-1.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Gateway" value="Running" subtext="Port 18789" accent="green" />
        <StatCard label="Sessions" value="1" subtext="Telegram direct" accent="blue" />
        <StatCard label="Uptime" value="2h 14m" subtext="Since last restart" accent="gray" />
      </div>

      <div>
        <h2 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Recent Activity</h2>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
          <ActivityItemSimple time="2m ago" text="Bootstrap completed" />
          <ActivityItemSimple time="5m ago" text="Identity configured" />
          <ActivityItemSimple time="8m ago" text="Telegram connected" />
          <ActivityItemSimple time="12m ago" text="Dashboard refreshed" />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          <ActionButtonSimple label="Restart" />
          <ActionButtonSimple label="Logs" />
          <ActionButtonSimple label="Status" />
          <ActionButtonSimple label="Cache" />
        </div>
      </div>
    </div>
  );
}

function ToolsTab() {
  const [tools, setTools] = useState([
    { id: 1, name: 'Web Search', description: 'DuckDuckGo API', enabled: true },
    { id: 2, name: 'Memory', description: 'Long-term storage', enabled: true },
    { id: 3, name: 'File Operations', description: 'Read/write/edit', enabled: true },
    { id: 4, name: 'Shell Commands', description: 'Terminal access', enabled: true },
    { id: 5, name: 'Web Fetch', description: 'URL content extraction', enabled: false },
    { id: 6, name: 'Image Analysis', description: 'Vision model', enabled: false },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#E3E3E3]">Available Tools</h2>
        <button className="px-3 py-1.5 text-xs font-medium text-[#5E6AD2] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors">
          + New Tool
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            className={`flex items-center justify-between px-4 py-3 ${
              index !== tools.length - 1 ? 'border-b border-[#1F1F1F]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${tool.enabled ? 'bg-[#34C759]' : 'bg-[#3A3A3C]'}`}></div>
              <div>
                <p className="text-sm font-medium text-[#E3E3E3]">{tool.name}</p>
                <p className="text-xs text-[#8E8E93]">{tool.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tool.enabled}
                onChange={() => setTools(tools.map(t => t.id === tool.id ? { ...t, enabled: !t.enabled } : t))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#2A2A2A] rounded-full peer peer-checked:bg-[#5E6AD2] transition-colors relative">
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  tool.enabled ? 'translate-x-4' : ''
                }`}></div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-[#E3E3E3] mb-3">Active Sessions</h2>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
          <SessionRow channel="Telegram" user="Elijah Smith" status="Active" lastActive="Now" messages="26" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-[#E3E3E3] mb-3">Archived</h2>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-8 text-center">
          <p className="text-sm text-[#8E8E93]">No archived sessions</p>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-[#E3E3E3] mb-3">Configuration</h2>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
          <SettingRow label="Gateway Port" value="18789" />
          <SettingRow label="Timezone" value="America/New_York" />
          <SettingRow label="Default Model" value="qwen3.5:397b-cloud" />
          <SettingRow label="Heartbeat" value="30m" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-[#E3E3E3] mb-3">Data</h2>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden">
          <SettingRow label="Memory Files" value="0" />
          <SettingRow label="Sessions" value="1" />
          <SettingRow label="Cache Size" value="0 KB" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, accent }: { label: string; value: string; subtext: string; accent: 'green' | 'blue' | 'gray' }) {
  const accents = {
    green: 'text-[#34C759]',
    blue: 'text-[#5E6AD2]',
    gray: 'text-[#8E8E93]',
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4">
      <p className="text-xs text-[#8E8E93] mb-1">{label}</p>
      <p className={`text-xl font-semibold ${accents[accent]}`}>{value}</p>
      <p className="text-xs text-[#8E8E93] mt-1">{subtext}</p>
    </div>
  );
}

function ActionButtonSimple({ label }: { label: string }) {
  return (
    <button className="px-3 py-2 text-xs font-medium text-[#E3E3E3] bg-[#1A1A1A] hover:bg-[#232323] border border-[#2A2A2A] rounded-md transition-colors text-center">
      {label}
    </button>
  );
}

function ActivityItemSimple({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#141414] transition-colors">
      <span className="text-xs text-[#8E8E93] w-14">{time}</span>
      <span className="text-sm text-[#E3E3E3]">{text}</span>
    </div>
  );
}

function SessionRow({ channel, user, status, lastActive, messages }: { channel: string; user: string; status: string; lastActive: string; messages: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
          <span className="text-xs">💬</span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#E3E3E3]">{channel}</p>
          <p className="text-xs text-[#8E8E93]">{user}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-2 py-0.5 text-xs font-medium text-[#34C759] bg-[#1A2F1F] rounded">
          {status}
        </span>
        <span className="text-xs text-[#8E8E93]">{lastActive}</span>
        <span className="text-xs text-[#8E8E93]">{messages} msgs</span>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F] last:border-0">
      <span className="text-sm text-[#8E8E93]">{label}</span>
      <span className="text-sm text-[#E3E3E3] font-mono">{value}</span>
    </div>
  );
}

interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'backlog' | 'in-progress' | 'done' | 'review';
  description: string;
  createdAt: number;
  completedAt?: number;
  subtasks?: Task[];
}

interface Activity {
  id: number;
  type: 'task-created' | 'task-moved' | 'task-completed' | 'task-review' | 'task-updated';
  message: string;
  time: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  type: 'completed' | 'scheduled' | 'recurring' | 'review';
  start: Date;
  end: Date;
  description: string;
  assignee: string;
  status: string;
  recurrence?: string;
}

function TeamTab() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'nightcircle',
      name: 'NightCircle',
      role: 'Orchestrator',
      color: 'from-[#5E6AD2] to-[#8B5CF6]',
      status: 'active',
      description: 'Routing and coordination',
      responsibilities: [
        'Analyze incoming requests',
        'Route to specialist agents',
        'Combine multi-agent outputs',
        'Quality assurance',
      ],
      whenToEngage: [
        'Multi-agent coordination',
        'Complex workflows',
        'Final synthesis',
        'Team management',
      ],
    },
    {
      id: 'signal',
      name: 'Signal',
      role: 'Researcher',
      color: 'from-[#34C759] to-[#30D158]',
      status: 'ready',
      description: 'Intelligence + content',
      responsibilities: [
        'Gather research and context',
        'Summarize insights',
        'Create written content',
        'Trend analysis',
      ],
      whenToEngage: [
        '"Research X for me"',
        '"Write a post about..."',
        '"Summarize this..."',
        '"What\'s trending in..."',
      ],
    },
    {
      id: 'vector',
      name: 'Vector',
      role: 'Analyst',
      color: 'from-[#FF9500] to-[#FF6B00]',
      status: 'ready',
      description: 'Data and insights',
      responsibilities: [
        'Data analysis',
        'Pattern recognition',
        'Strategic recommendations',
        'Performance review',
      ],
      whenToEngage: [
        '"Analyze this data..."',
        '"What should I prioritize?"',
        '"Review performance..."',
        '"Identify trends..."',
      ],
    },
    {
      id: 'anchor',
      name: 'Anchor',
      role: 'Chief of Staff',
      color: 'from-[#007AFF] to-[#0055B3]',
      status: 'ready',
      description: 'Operations',
      responsibilities: [
        'Task tracking',
        'Goal breakdown',
        'Priority setting',
        'Workflow optimization',
      ],
      whenToEngage: [
        '"Help me plan..."',
        '"What\'s my focus today?"',
        '"Break this into steps..."',
        '"Track my progress..."',
      ],
    },
    {
      id: 'engine',
      name: 'Engine',
      role: 'Builder',
      color: 'from-[#BF5AF2] to-[#9F40E0]',
      status: 'ready',
      description: 'Execution',
      responsibilities: [
        'Build deliverables',
        'Solve technical problems',
        'Create tools and systems',
        'Debug and fix issues',
      ],
      whenToEngage: [
        '"Build me a..."',
        '"Fix this bug..."',
        '"Create a tool for..."',
        '"Implement X..."',
      ],
    },
    {
      id: 'beacon',
      name: 'Beacon',
      role: 'Nonprofit Strategist',
      color: 'from-[#FFD700] to-[#FFA500]',
      status: 'ready',
      description: 'Mission-driven strategy & fundraising',
      responsibilities: [
        'Grant proposals & donor appeals',
        'Nonprofit messaging & outreach',
        'Program development & board materials',
        'Fundraising strategy & community engagement',
      ],
      whenToEngage: [
        '"Write a grant proposal..."',
        '"Draft a donor appeal..."',
        '"Create volunteer plan..."',
        '"Develop nonprofit strategy..."',
      ],
    },
  ];

  const activeAgent = agents.find(a => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#E3E3E3] mb-2">AI Dream Team</h2>
        <p className="text-sm text-[#8E8E93]">
          Specialized agents coordinated by NightCircle. Each agent has a distinct role and stays in their lane.
        </p>
      </div>

      {/* Active Agent Banner */}
      {activeAgent && (
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeAgent.color} flex items-center justify-center`}>
              <span className="text-sm font-bold text-white">{activeAgent.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#E3E3E3]">{activeAgent.name}</p>
              <p className="text-xs text-[#8E8E93]">{activeAgent.role} · Currently orchestrating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
            <span className="text-xs text-[#34C759]">Active</span>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            className={`bg-[#0A0A0A] border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAgent === agent.id
                ? 'border-[#5E6AD2] bg-[#141414]'
                : 'border-[#1F1F1F] hover:border-[#2A2A2A]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                <span className="text-sm font-bold text-white">{agent.name[0]}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                agent.status === 'active'
                  ? 'bg-[#34C759]/20 text-[#34C759]'
                  : 'bg-[#3A3A3C]/20 text-[#8E8E93]'
              }`}>
                {agent.status === 'active' ? 'Active' : 'Ready'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-[#E3E3E3] mb-1">{agent.name}</h3>
            <p className="text-xs text-[#8E8E93] mb-3">{agent.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8E8E93] uppercase tracking-wide">{agent.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail */}
      {selectedAgent && (
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
          {(() => {
            const agent = agents.find(a => a.id === selectedAgent)!;
            return (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <span className="text-lg font-bold text-white">{agent.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#E3E3E3]">{agent.name}</h3>
                    <p className="text-sm text-[#8E8E93]">{agent.role} · {agent.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Responsibilities</h4>
                    <ul className="space-y-2">
                      {agent.responsibilities.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#E3E3E3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2]"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">When to Engage</h4>
                    <ul className="space-y-2">
                      {agent.whenToEngage.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#E3E3E3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                          <code className="text-xs bg-[#141414] px-2 py-0.5 rounded">{item}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Workflow Info */}
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
        <h3 className="text-sm font-medium text-[#E3E3E3] mb-4">Workflow</h3>
        <div className="flex items-center justify-between text-sm overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">1. NightCircle analyzes</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">2. Assigns agent</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">3. Agent executes</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">4. NightCircle combines</span>
          </div>
        </div>
      </div>
    </div>
  );
}
