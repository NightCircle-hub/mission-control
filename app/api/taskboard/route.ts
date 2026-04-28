import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On Vercel, files are in the same directory as the API route
    const taskboardPath = path.join(process.cwd(), 'data', 'taskboard.json');
    
    if (!fs.existsSync(taskboardPath)) {
      console.log('Taskboard not found at:', taskboardPath);
      return NextResponse.json({ tasks: [], activities: [] });
    }

    const data = fs.readFileSync(taskboardPath, 'utf-8');
    const taskboard = JSON.parse(data);
    console.log(`Loaded ${taskboard.tasks.length} tasks`);

    return NextResponse.json(taskboard);
  } catch (error) {
    console.error('Error reading taskboard:', error);
    return NextResponse.json({ tasks: [], activities: [] }, { status: 500 });
  }
}
