import { spawn } from 'node:child_process';

console.log('Starting StatusHub services...');

// Start webhook-proxy
const webhook = spawn('node', ['server/webhook-proxy.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '4000' }
});

// Start auth-server
const auth = spawn('node', ['server/auth-server.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, AUTH_PORT: '4001' }
});

// Handle exits
webhook.on('exit', (code) => {
  console.log('Webhook server exited with code', code);
  process.exit(code);
});

auth.on('exit', (code) => {
  console.log('Auth server exited with code', code);
});

process.on('SIGTERM', () => {
  webhook.kill();
  auth.kill();
});
