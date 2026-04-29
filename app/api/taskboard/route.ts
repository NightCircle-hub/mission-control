import { NextResponse } from 'next/server';
import taskboardData from '../../../data/taskboard.json';

export async function GET() {
  try {
    console.log(`Loaded ${taskboardData.tasks?.length || 0} tasks from JSON`);
    return NextResponse.json(taskboardData);
  } catch (error) {
    console.error('Error loading taskboard:', error);
    return NextResponse.json({ tasks: [], activities: [] }, { status: 500 });
  }
}
