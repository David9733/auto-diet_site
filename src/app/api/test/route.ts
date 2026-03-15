/**
 * 테스트 API Route
 * GET /api/test
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API Route 정상 작동',
    timestamp: new Date().toISOString()
  });
}















