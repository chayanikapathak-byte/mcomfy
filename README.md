# ComfyPocket Core Integration

Core modules for integrating with ComfyUI and external model hubs.

## Modules

### ComfyUI Client (`src/core/api-client.ts`)
Handles WebSocket monitoring and REST API interactions with the ComfyUI server.
- Real-time status, progress, and execution events.
- Prompt submission and queue management.
- System statistics and hardware monitoring.

### Model Downloader
Clients for browsing and downloading models from CivitAI and HuggingFace.
- **CivitaiClient** (`src/core/civitai-client.ts`): Search and details for CivitAI models.
- **HFClient** (`src/core/hf-client.ts`): Search and details for HuggingFace Hub models.
- **DownloadManager** (`src/core/download-manager.ts`): UI-side tracking of model downloads.

### Workflow Parser (`src/core/workflow-parser.ts`)
Extracts ComfyUI workflow and prompt JSON from generated PNG images.
- Supports both `tEXt` and `iTXt` PNG chunks.
- Type-safe output matching `WorkflowGraph`.

## Usage

```typescript
import { ComfyUIClient } from './core/api-client';

const client = new ComfyUIClient({ serverAddress: 'http://localhost:8188' });
client.onMessage((msg) => {
  if (msg.type === 'progress') {
    console.log(`Progress: ${msg.data.value}/${msg.data.max}`);
  }
});
await client.connect();
```
