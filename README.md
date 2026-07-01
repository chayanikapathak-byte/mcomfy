# ComfyPocket Integration Layer

This directory contains the core integration modules for ComfyPocket.

## ComfyUI API Client (`index.ts`)

A TypeScript client for interacting with the ComfyUI server via REST and WebSocket.

### Capabilities
- **WebSocket Connection**: Real-time monitoring of generation progress and status.
- **Queue Management**: Submit prompts, check queue status, interrupt execution.
- **System Info**: Fetch hardware stats (VRAM usage, etc.).
- **Node Info**: Fetch available node types and their definitions.
- **Image Viewing**: Generate URLs for viewing generated assets.

## API Research

### ComfyUI REST Endpoints
- `POST /prompt`: Submit a new generation.
- `GET /queue`: Get pending and running items.
- `GET /history`: Get past generations.
- `GET /object_info`: Get node definitions.
- `GET /view`: Retrieve generated images.
- `POST /interrupt`: Stop current execution.

### ComfyUI WebSocket (`/ws`)
Messages are JSON with a `type` and `data` field.
- `status`: Periodic queue status.
- `progress`: Step-by-step progress for a node.
- `executing`: Which node is currently running.
- `executed`: When a node finishes and has UI output (like an image).
- `execution_start`, `execution_success`, `execution_error`: Life-cycle events.

### CivitAI API
- **Endpoint**: `https://civitai.com/api/v1`
- **Model Search**: `GET /models`
  - Query params: `query`, `tag`, `type`, `sort`, `period`, `limit`.
- **Model Details**: `GET /models/:id`
- **Model Version**: `GET /model-versions/:id`
- **Hash Lookup**: `GET /model-versions/by-hash/:hash`
- **Rate Limits**: 10,000 requests per day (unauthenticated), higher for authenticated.
- **Download**: `GET /api/download/models/:versionId` (requires API Key in `Authorization: Bearer <key>` or as `token` query param).

### HuggingFace Hub API
- **Endpoint**: `https://huggingface.co/api`
- **Model Search**: `GET /models`
  - Query params: `search`, `filter`, `sort`, `limit`.
- **Model Details**: `GET /models/:id`
- **File Download**: `https://huggingface.co/:repo_id/resolve/:revision/:filename`
- **Rate Limits**: Generous for public models; requires token for private/gated.

### Workflow Metadata Parser
ComfyUI embeds data in PNG `tEXt` or `iTXt` chunks:
- `prompt`: The JSON prompt sent to the API.
- `workflow`: The full ComfyUI graph JSON.

Parsing can be done by reading PNG chunks and looking for these keys.
