import { NextResponse } from 'next/server';

export async function GET() {
  // Temporary test - return hardcoded data to verify API works
  const testData = {
    tasks: [
      { id: 1, title: 'Test Task 1', status: 'todo', assignee: 'NightCircle' },
      { id: 2, title: 'Test Task 2', status: 'done', assignee: 'Engine' },
    ],
    activities: []
  };
  
  return NextResponse.json(testData);
}
