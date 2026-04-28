import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to state directory - works both locally and on Vercel
const TASKBOARD_PATH = path.join(process.cwd(), 'data', 'taskboard.json');

export async function GET() {
  try {
    console.log('Reading taskboard from:', TASKBOARD_PATH);
    
    if (!fs.existsSync(TASKBOARD_PATH)) {
      console.log('Taskboard file not found at:', TASKBOARD_PATH);
      return NextResponse.json({ tasks: [], activities: [] });
    }

    const data = fs.readFileSync(TASKBOARD_PATH, 'utf-8');
    const taskboard = JSON.parse(data);
    console.log(`Loaded ${taskboard.tasks.length} tasks, ${taskboard.activities.length} activities`);

    return NextResponse.json(taskboard);
  } catch (error) {
    console.error('Error reading taskboard:', error);
    return NextResponse.json({ tasks: [], activities: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    fs.writeFileSync(TASKBOARD_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing taskboard:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
