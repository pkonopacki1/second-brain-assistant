import { initializeRuntime } from './composition/runtime';

async function main(): Promise<void> {
  const runtime = await initializeRuntime();

  const aiRequest = {
    messages: [
      {
        role: 'user' as const,
        content: 'Your prompt here',
      },
    ],
    model: runtime.globalModel,
  };

  const response = await runtime.aiProvider.generate(aiRequest);
  console.log(response);
}

main();
