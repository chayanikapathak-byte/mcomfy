import { ComfyUIClient } from './index';

console.log('ComfyUIClient module loaded successfully');

// Example usage (uncomment and adjust if you have a running ComfyUI server)
/*
const client = new ComfyUIClient({ serverAddress: 'http://127.0.0.1:8188' });
client.onStatusChange((status) => console.log('Status changed:', status));
client.onMessage((msg) => console.log('New message:', msg.type));

try {
  await client.connect();
  const stats = await client.getSystemStats();
  console.log('System Stats:', stats);
} catch (e) {
  console.error('Connection failed:', e);
}
*/
