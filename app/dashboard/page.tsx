'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('Good Morning');
  const [tasks, setTasks] = useState<any[]>([]);
  const [weather, setWeather] = useState({ temp: 72, condition: 'Sunny', location: 'New York, NY' });
  const [quote, setQuote] = useState({ text: "You've got a great day ahead.", author: '' });

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Fetch tasks
    fetch('/api/taskboard')
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks || []);
      });

    return () => clearInterval(timer);
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const completedToday = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Top Ticker */}
      <div className="bg-[#0F1623] border-b border-[#1E293B] px-4 py-2">
        <div className="flex items-center gap-6 text-xs overflow-x-auto">
          <TickerItem symbol="S&P 500" value="5,300.25" change="+0.63%" positive />
          <TickerItem symbol="NASDAQ" value="16,874.71" change="+0.56%" positive />
          <TickerItem symbol="DOW" value="38,873.67" change="+0.35%" positive />
          <TickerItem symbol="BTC" value="$67,284.21" change="+1.02%" positive />
          <TickerItem symbol="ETH" value="$3,512.18" change="+0.65%" positive />
          <div className="text-[#94A3B8] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            SpaceX Starship completes fourth test flight...
            <span className="text-[#64748B] ml-2">2h ago</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Update Banner */}
        <div className="w-full bg-green-600 text-white text-center py-2 text-sm font-bold">
          ✅ MOBILE NAV ADDED!
        </div>
        {/* Sidebar */}
        <aside className="w-64 bg-[#0F1623] border-r border-[#1E293B] min-h-screen p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold">M</span>
            </div>
            <span className="text-lg font-semibold">Mission Control</span>
          </div>

          <nav className="space-y-1">
            <NavItem icon="📊" label="Dashboard" active />
            <NavItem icon="📅" label="Calendar" href="/calendar" />
            <NavItem icon="✅" label="Tasks" href="/taskboard" />
            <NavItem icon="👥" label="Team" href="/team" />
            <NavItem icon="📰" label="News" />
            <NavItem icon="📈" label="Analytics" />
            <NavItem icon="⚙️" label="Settings" href="/settings" />
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1E293B] cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Eli</p>
                <p className="text-xs text-[#94A3B8]">elijah@nightcircle.ai</p>
              </div>
              <span className="text-[#94A3B8]">▼</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#1E293B] to-[#0F1623] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <p className="text-[#94A3B8] text-sm mb-2">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-4xl font-bold mb-2">
                  {greeting}, Eli.
                </h1>
                <p className="text-[#94A3B8] text-lg mb-6">
                  {quote.text}
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">☀️</span>
                    <span className="text-2xl font-semibold">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#94A3B8] text-sm">WEATHER</p>
                  <p className="text-xs text-[#94A3B8]">{weather.location}</p>
                </div>
                <span className="text-4xl">☀️</span>
              </div>
              
              <div className="mb-4">
                <p className="text-5xl font-bold mb-1">{weather.temp}°F</p>
                <p className="text-[#94A3B8]">{weather.condition}</p>
                <p className="text-sm text-[#94A3B8]">Feels like 75°</p>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-4 border-t border-[#334155]">
                <ForecastDay day="TUE" temp={74} icon="☀️" />
                <ForecastDay day="WED" temp={76} icon="☀️" />
                <ForecastDay day="THU" temp={73} icon="⛅" />
                <ForecastDay day="FRI" temp={70} icon="☁️" />
                <ForecastDay day="SAT" temp={72} icon="☀️" />
              </div>
            </div>

            {/* Today's To-Do List */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">TODAY'S TO-DO LIST</h3>
                <span className="text-xs text-[#94A3B8]">{pendingTasks.length} Tasks</span>
              </div>

              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {pendingTasks.length === 0 && (
                  <p className="text-[#94A3B8] text-sm">No pending tasks! 🎉</p>
                )}
              </div>

              <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2">
                <span>+</span> Add Task
              </button>
            </div>

            {/* Portfolio Overview (Placeholder) */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <h3 className="font-semibold mb-2">SYSTEM STATUS</h3>
              <p className="text-3xl font-bold text-green-400 mb-2">All Systems Online</p>
              <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                +100% Operational
              </div>
              
              <div className="h-32 bg-gradient-to-t from-green-500/20 to-transparent rounded-lg flex items-end pb-2 px-2">
                <div className="flex items-end gap-1 w-full h-full">
                  {[40, 65, 45, 70, 55, 80, 60, 85, 75, 90, 70, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-500/60 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <TimeRangeBtn active>1D</TimeRangeBtn>
                <TimeRangeBtn>1W</TimeRangeBtn>
                <TimeRangeBtn>1M</TimeRangeBtn>
                <TimeRangeBtn>3M</TimeRangeBtn>
                <TimeRangeBtn>1Y</TimeRangeBtn>
                <TimeRangeBtn>ALL</TimeRangeBtn>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">TODAY'S SCHEDULE</h3>
                <a href="/calendar" className="text-xs text-blue-400 hover:text-blue-300">View Calendar</a>
              </div>

              <div className="space-y-3">
                <ScheduleItem time="9:00 AM" title="Daily Briefing Delivered" color="blue" />
                <ScheduleItem time="10:30 AM" title="System Maintenance Check" color="purple" />
                <ScheduleItem time="1:00 PM" title="Heartbeat Review" color="green" />
                <ScheduleItem time="6:00 PM" title="Memory Sync to NAS" color="orange" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <h3 className="font-semibold mb-4">QUICK ACTIONS</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon="📝" label="New Note" />
                <QuickAction icon="✉️" label="Send Email" />
                <QuickAction icon="📅" label="Calendar" />
                <QuickAction icon="🌙" label="Focus Mode" />
              </div>
            </div>

            {/* Top News */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">TOP NEWS</h3>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300">View All</a>
              </div>

              <div className="space-y-4">
                <NewsItem 
                  image="🚀"
                  title="SpaceX Starship completes fourth test flight, makes soft splashdown in Indian Ocean"
                  time="2h ago"
                />
                <NewsItem 
                  image="🏛️"
                  title="Markets rally as inflation data comes in lower than expected"
                  time="4h ago"
                />
              </div>
            </div>
          </div>

          {/* Latest News Ticker */}
          <div className="mt-6 bg-[#1E293B] rounded-xl p-4">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium whitespace-nowrap">
                LATEST NEWS
              </button>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-6 text-sm text-[#94A3B8] animate-pulse">
                  <span>Apple unveils AI-powered features at WWDC 2024</span>
                  <span>•</span>
                  <span>Oil prices drop as demand concerns grow</span>
                  <span>•</span>
                  <span>Microsoft invests $3B in AI startup</span>
                  <span>•</span>
                  <span>U.S. jobless claims fall to 210K</span>
                </div>
              </div>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap">View All</a>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

function TickerItem({ symbol, value, change, positive }: any) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="font-medium">{symbol}</span>
      <span className="text-[#94A3B8]">{value}</span>
      <span className={positive ? 'text-green-400' : 'text-red-400'}>{change}</span>
    </div>
  );
}

function NavItem({ icon, label, active = false, href }: any) {
  const content = (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${
      active ? 'bg-blue-600 text-white' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}

function ForecastDay({ day, temp, icon }: any) {
  return (
    <div className="text-center">
      <p className="text-xs text-[#94A3B8] mb-1">{day}</p>
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-sm font-medium">{temp}°</p>
    </div>
  );
}

function TaskItem({ task }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#0F1623] cursor-pointer group">
      <div className="w-5 h-5 rounded border border-[#475569] mt-0.5 group-hover:border-blue-500"></div>
      <div className="flex-1">
        <p className="text-sm font-medium">{task.title}</p>
        <p className="text-xs text-[#94A3B8] mt-1">{task.assignee}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ time, title, color }: any) {
  const colors: any = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex gap-3">
      <div className="text-xs text-[#94A3B8] w-16 pt-0.5">{time}</div>
      <div className={`w-2 h-2 rounded-full ${colors[color]} mt-1.5`}></div>
      <p className="text-sm flex-1">{title}</p>
    </div>
  );
}

function QuickAction({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0F1623] hover:bg-[#334155] transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-[#94A3B8]">{label}</span>
    </button>
  );
}

function NewsItem({ image, title, time }: any) {
  return (
    <div className="flex gap-3">
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
        {image}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <p className="text-xs text-[#94A3B8] mt-1">{time}</p>
      </div>
    </div>
  );
}

function TimeRangeBtn({ children, active = false }: any) {
  return (
    <button className={`px-3 py-1 text-xs rounded ${
      active ? 'bg-green-500 text-white' : 'text-[#94A3B8] hover:bg-[#334155]'
    }`}>
      {children}
    </button>
  );
}

function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/calendar', icon: '📅', label: 'Calendar' },
    { href: '/taskboard', icon: '✅', label: 'Tasks' },
    { href: '#more', icon: '⋯', label: 'More', isMenu: true },
  ];

  const moreItems = [
    { href: '/team', icon: '👥', label: 'Team' },
    { href: '/projects', icon: '📁', label: 'Projects' },
    { href: '/docs', icon: '📚', label: 'Docs' },
    { href: '/memory', icon: '💾', label: 'Memory' },
  ];

  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1623] border-t border-[#1E293B] px-4 py-2 md:hidden z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            item.isMenu ? (
              <button
                key={item.label}
                onClick={() => setShowMore(!showMore)}
                className="flex flex-col items-center p-2"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs text-gray-400 mt-1">{item.label}</span>
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center p-2 ${
                  pathname === item.href ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            )
          ))}
        </div>
      </nav>

      {/* More Menu Modal */}
      {showMore && (
        <div className="fixed inset-0 bg-black/80 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#0F1623] rounded-t-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {moreItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center p-4 bg-[#1E293B] rounded-lg"
                  onClick={() => setShowMore(false)}
                >
                  <span className="text-2xl mb-2">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </a>
              ))}
            </div>
            <button
              onClick={() => setShowMore(false)}
              className="w-full py-3 bg-blue-600 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
