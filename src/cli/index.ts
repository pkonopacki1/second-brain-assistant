import { loadEnvConfig } from '../config/config';

function main(): void {
  const config = loadEnvConfig();
  console.log('Loaded environment configuration:', config);
  // console.log('second-brain-assistant: scaffold ready. MVP not implemented yet.');
}

main();
