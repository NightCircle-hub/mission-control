const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/taskboard',
  method: 'GET'
};

console.log('Testing API endpoint...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`✅ Tasks: ${json.tasks?.length || 0}`);
      console.log(`✅ Activities: ${json.activities?.length || 0}`);
      
      const withSubtasks = json.tasks?.filter(t => t.subtasks && t.subtasks.length > 0) || [];
      console.log(`✅ Tasks with subtasks: ${withSubtasks.length}\n`);
      
      if (withSubtasks.length > 0) {
        console.log('📋 Subtask breakdown:\n');
        withSubtasks.forEach(task => {
          console.log(`  ${task.id}. ${task.title}`);
          task.subtasks.forEach(st => {
            console.log(`    └─ ${st.id}. ${st.title} [${st.status}]`);
          });
          console.log();
        });
      }
    } catch (e) {
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.log('\nServer might not be running. Start with: npm run dev');
});

req.end();
