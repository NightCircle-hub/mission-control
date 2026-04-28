const fs = require('fs');
const path = require('path');

const taskboardPath = path.join(__dirname, '../state/taskboard.json');

console.log('Reading from:', taskboardPath);

if (!fs.existsSync(taskboardPath)) {
  console.error('❌ File not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(taskboardPath, 'utf-8'));

console.log(`\n✅ Found ${data.tasks.length} tasks`);
console.log(`✅ Found ${data.activities.length} activities\n`);

// Show tasks with subtasks
const tasksWithSubtasks = data.tasks.filter(t => t.subtasks && t.subtasks.length > 0);

if (tasksWithSubtasks.length > 0) {
  console.log('📋 Tasks with subtasks:\n');
  tasksWithSubtasks.forEach(task => {
    console.log(`  ${task.id}. ${task.title} (${task.status})`);
    console.log(`     Subtasks: ${task.subtasks.length}`);
    task.subtasks.forEach(st => {
      console.log(`       - ${st.id}. ${st.title} [${st.status}]`);
    });
    console.log();
  });
} else {
  console.log('⚠️  No tasks have subtasks yet');
}
