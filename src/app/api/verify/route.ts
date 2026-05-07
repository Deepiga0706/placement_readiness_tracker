import { NextResponse } from 'next/server';
import { mockVerifyCommitMessages } from '@/lib/mock';

export async function POST(req: Request) {
  try {
    const { githubRepoUrl, taskId, taskTitle } = await req.json();

    if (!githubRepoUrl || !taskId) {
      return NextResponse.json({ error: 'Missing githubRepoUrl or taskId' }, { status: 400 });
    }

    // Attempting verification with mock utility
    const verificationResult = await mockVerifyCommitMessages(githubRepoUrl, taskTitle || `Task ${taskId}`);

    return NextResponse.json({
      taskId,
      verified: verificationResult.verified,
      message: verificationResult.message
    });
  } catch (error) {
    console.error('API Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
