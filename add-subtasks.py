import json

# Read the taskboard
with open('/Users/elijahsmith/NAS/UGREEN/OpenClaw/workspace/state/taskboard.json', 'r') as f:
    data = json.load(f)

# Find tasks that should have subtasks
# Look for tasks with "Build", "Create", "Implement", "Set up" etc in title
parent_keywords = ['Build', 'Create', 'Implement', 'Set up', 'Configure', 'Deploy', 'Add']

# Group tasks by potential parent-child relationships
# For now, let's add subtasks to some key parent tasks

# Example: Find tasks related to specific projects and group them
project_groups = {
    'Mission Control': ['Dashboard', 'Taskboard', 'Calendar', 'Activity Feed', 'Quick Actions', 'Tab Navigation'],
    'AI Dream Team': ['Dream Team', 'Beacon', 'Agent'],
    'Integration': ['Weather', 'API', 'Remote Access', 'ngrok'],
}

# Let's add subtasks to a few key parent tasks
tasks_to_enhance = []

for task in data['tasks']:
    # Check if this task looks like a parent task
    if any(kw in task['title'] for kw in ['Build', 'Create', 'System', 'Platform', 'Framework']):
        if 'subtasks' not in task:
            tasks_to_enhance.append(task['id'])

print(f"Found {len(tasks_to_enhance)} potential parent tasks")
print("First 10:", tasks_to_enhance[:10])

# Now let's actually add some example subtasks to demonstrate the feature
# Find a good candidate - let's use task 3 "Build Taskboard System"
for task in data['tasks']:
    if task['id'] == 3:  # Build Taskboard System
        task['subtasks'] = [
            {
                "id": 301,
                "title": "Design kanban layout",
                "description": "Create column structure for Backlog, In Progress, Done, Review",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 1000000
            },
            {
                "id": 302,
                "title": "Implement drag-and-drop",
                "description": "Add mouse/touch event handlers for task movement",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 2000000
            },
            {
                "id": 303,
                "title": "Add activity feed",
                "description": "Real-time sidebar showing task updates",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 3000000
            },
            {
                "id": 304,
                "title": "Support subtasks",
                "description": "Enable task breakdown with expandable child tasks",
                "status": "in-progress",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 4000000
            }
        ]
        print(f"\n✅ Added subtasks to: {task['title']}")
    
    if task['id'] == 2:  # Build Mission Control Dashboard
        task['subtasks'] = [
            {
                "id": 201,
                "title": "Set up Next.js project",
                "description": "Initialize app with TypeScript and Tailwind",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 1000000
            },
            {
                "id": 202,
                "title": "Create tab navigation",
                "description": "Dashboard, Calendar, Tasks, Team tabs",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 2000000
            },
            {
                "id": 203,
                "title": "Build widget components",
                "description": "Weather, calendar, quick actions widgets",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 3000000
            },
            {
                "id": 204,
                "title": "Style with Linear aesthetic",
                "description": "Dark theme, clean typography, smooth animations",
                "status": "done",
                "assignee": "Engine",
                "createdAt": task['createdAt'] + 4000000
            }
        ]
        print(f"✅ Added subtasks to: {task['title']}")

# Write back
with open('/Users/elijahsmith/NAS/UGREEN/OpenClaw/workspace/state/taskboard.json', 'w') as f:
    json.dump(data, f, indent=2)

print("\n✅ Updated taskboard.json with subtasks!")
print(f"Total tasks: {len(data['tasks'])}")
tasks_with_subtasks = [t for t in data['tasks'] if 'subtasks' in t]
print(f"Tasks with subtasks: {len(tasks_with_subtasks)}")
