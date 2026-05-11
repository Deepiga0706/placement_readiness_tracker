import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const testEmail = 'testuser@placement.dev';

    // Remove existing test user to allow re-runs
    await db.user.deleteMany({ where: { email: testEmail } });

    const hashed = await bcrypt.hash('Test@1234', 10);
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashed,
      },
    });

    const found = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      message: 'MongoDB connected & user inserted successfully',
      user: found,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Connection or insert failed',
      error: error.message || String(error),
    }, { status: 500 });
  }
}
