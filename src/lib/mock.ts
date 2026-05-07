// Mock LLM function to verify commit messages against a task description
export async function mockVerifyCommitMessages(
  repoUrl: string, 
  taskTitle: string
): Promise<{ verified: boolean; message: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // In a real scenario, this would use the GitHub API (Octokit) to fetch commits
  // using process.env.GITHUB_ACCESS_TOKEN and then an LLM to check alignment
  console.log(`[MOCK] Fetching commits for ${repoUrl} and evaluating against "${taskTitle}"...`);
  
  // Randomly decide if verified (just for demo purposes)
  const isVerified = Math.random() > 0.3;

  if (isVerified) {
    return {
      verified: true,
      message: "Verified: Found relevant commit messages implementing this task.",
    };
  } else {
    return {
      verified: false,
      message: "Not Verified: Could not find matching commits for this task.",
    };
  }
}
