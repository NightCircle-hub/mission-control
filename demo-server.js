#!/usr/bin/env node
/**
 * Standalone demo server for subtask feature
 * Runs without Next.js - pure Node.js HTTP server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Read taskboard data
const taskboardPath = path.join(__dirname, '../state/taskboard.json');
let taskboard;

try {
  taskboard = JSON.parse(fs.readFileSync(taskboardPath, 'utf-8'));
  console.log('✅ Loaded taskboard.json');
  console.log(`   Tasks: ${taskboard.tasks.length}`);
  console.log(`   Activities: ${taskboard.activities.length}`);
  
  const withSubtasks = taskboard.tasks.filter(t => t.subtasks && t.subtasks.length > 0);
  console.log(`   Tasks with subtasks: ${withSubtasks.length}\n`);
  
  if (withSubtasks.length > 0) {
    console.log('📋 Subtask breakdown:');
    withSubtasks.forEach(task => {
      const doneCount = task.subtasks.filter(st => st.status === 'done').length;
      console.log(`\n   ${task.id}. ${task.title} [${task.status}]`);
      console.log(`      Progress: ${doneCount}/${task.subtasks.length} subtasks done`);
      task.subtasks.forEach(st => {
        const icon = st.status === 'done' ? '✅' : st.status === 'in-progress' ? '🔄' : '⏳';
        console.log(`         ${icon} ${st.id}. ${st.title} (${st.status})`);
      });
    });
    console.log('\n✅ Subtask feature is working!\n');
  }
} catch (err) {
  console.error('❌ Error loading taskboard:', err.message);
  process.exit(1);
}

// Create simple HTML page
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mission Control - Subtask Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0D0D0D; 
      color: #E3E3E3;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #5E6AD2; }
    .subtitle { color: #8E8E93; margin-bottom: 2rem; }
    .stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 1rem; 
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #1A1A1A;
      border: 1px solid #2A2A2A;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .stat-value { font-size: 2rem; font-weight: bold; color: #5E6AD2; }
    .stat-label { color: #8E8E93; font-size: 0.875rem; margin-top: 0.25rem; }
    .task-list { display: grid; gap: 1rem; }
    .task-card {
      background: #141414;
      border: 1px solid #1F1F1F;
      border-left: 3px solid #5E6AD2;
      border-radius: 6px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .task-card:hover { background: #1A1A1A; }
    .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .task-title { font-weight: 500; }
    .task-status { 
      font-size: 0.75rem; 
      padding: 0.25rem 0.5rem; 
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-done { background: #34C759/20; color: #34C759; }
    .status-in-progress { background: #5E6AD2/20; color: #5E6AD2; }
    .status-backlog { background: #3A3A3C/20; color: #8E8E93; }
    .subtasks { 
      margin-top: 1rem; 
      padding-left: 1rem; 
      border-left: 2px solid #2A2A2A;
      display: none;
    }
    .subtasks.show { display: block; }
    .subtask-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }
    .subtask-icon { font-size: 1rem; }
    .toggle-btn {
      background: none;
      border: none;
      color: #8E8E93;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
    .toggle-btn:hover { color: #E3E3E3; }
    .progress { font-size: 0.75rem; color: #8E8E93; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌑 Mission Control - Subtask Demo</h1>
    <p class="subtitle">Task breakdown feature demonstration</p>
    
    <div class="stats" id="stats"></div>
    <div class="task-list" id="taskList"></div>
  </div>

  <script>
    const taskboard = ${JSON.stringify(taskboard)};
    
    // Stats
    const withSubtasks = taskboard.tasks.filter(t => t.subtasks && t.subtasks.length > 0);
    document.getElementById('stats').innerHTML = \`
      <div class="stat-card">
        <div class="stat-value">\${taskboard.tasks.length}</div>
        <div class="stat-label">Total Tasks</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">\${withSubtasks.length}</div>
        <div class="stat-label">Tasks with Subtasks</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">\${taskboard.activities.length}</div>
        <div class="stat-label">Activities</div>
      </div>
    \`;
    
    // Task list
    const taskList = document.getElementById('taskList');
    withSubtasks.forEach(task => {
      const doneCount = task.subtasks.filter(st => st.status === 'done').length;
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = \`
        <div class="task-header">
          <div>
            <div class="task-title">\${task.title}</div>
            <div class="progress">\${doneCount}/\${task.subtasks.length} subtasks completed</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span class="task-status status-\${task.status}">\${task.status.replace('-', ' ')}</span>
            <button class="toggle-btn" onclick="event.stopPropagation(); this.parentElement.parentElement.querySelector('.subtasks').classList.toggle('show')">▶ Expand</button>
          </div>
        </div>
        <div class="subtasks">
          \${task.subtasks.map(st => {
            const icon = st.status === 'done' ? '✅' : st.status === 'in-progress' ? '🔄' : '⏳';
            return \`<div class="subtask-item"><span class="subtask-icon">\${icon}</span><span>\${st.title}</span><span style="margin-left:auto;color:#8E8E93;font-size:0.75rem">\${st.status}</span></div>\`;
          }).join('')}
        </div>
      \`;
      taskList.appendChild(card);
    });
    
    if (withSubtasks.length === 0) {
      taskList.innerHTML = '<p style="color:#8E8E93;text-align:center;padding:2rem">No tasks with subtasks yet</p>';
    }
  </script>
</body>
</html>
`;

// Create server
const server = http.createServer((req, res) => {
  if (req.url === '/api/taskboard') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(taskboard));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlPage);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Demo server running at http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/taskboard`);
  console.log(`   Web interface: http://localhost:${PORT}/\n`);
  console.log('Press Ctrl+C to stop\n');
});
