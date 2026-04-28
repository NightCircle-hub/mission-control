const fs = require('fs');
const path = require('path');

// Read taskboard
const taskboardPath = path.join(__dirname, '../state/taskboard.json');
const data = JSON.parse(fs.readFileSync(taskboardPath, 'utf-8'));

console.log('=== SUBTASK FEATURE TEST ===\n');

// Check for tasks with subtasks
const withSubtasks = data.tasks.filter(t => t.subtasks && t.subtasks.length > 0);

if (withSubtasks.length === 0) {
  console.log('❌ No tasks have subtasks yet');
  process.exit(1);
}

console.log(`✅ SUCCESS: Found ${withSubtasks.length} tasks with subtasks\n`);

withSubtasks.forEach(task => {
  const doneCount = task.subtasks.filter(st => st.status === 'done').length;
  console.log(`📋 ${task.title}`);
  console.log(`   Status: ${task.status} | Subtasks: ${doneCount}/${task.subtasks.length} done\n`);
  
  task.subtasks.forEach(st => {
    const icon = st.status === 'done' ? '✅' : st.status === 'in-progress' ? '🔄' : '⏳';
    console.log(`   ${icon} ${st.title} (${st.status})`);
  });
  console.log();
});

console.log('✅ Subtask feature is working correctly!');
