import { loadEnvConfig } from '../config/config';

function main(): void {
  const config = loadEnvConfig();
  console.log('Loaded environment configuration');
}

main();
