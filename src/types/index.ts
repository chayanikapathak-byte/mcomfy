/**
 * Shared types for ComfyPocket
 */

// --- Workflow Types ---

export interface WorkflowNode {
  id: string;
  type: string;
  pos: [number, number];
  size: [number, number];
  properties: Record<string, any>;
  inputs?: WorkflowSlot[];
  outputs?: WorkflowSlot[];
  widgets_values?: any[];
}

export interface WorkflowSlot {
  name: string;
  type: string;
  link?: number;
}

export interface WorkflowEdge {
  id: number;
  from_node: string;
  from_slot: number;
  to_node: string;
  to_slot: number;
  type: string;
}

export interface WorkflowGraph {
  last_node_id: number;
  last_link_id: number;
  nodes: WorkflowNode[];
  links: WorkflowEdge[];
  groups: any[];
  config: Record<string, any>;
  extra: Record<string, any>;
  version: number;
}

// --- API Client Types ---

export interface ComfyUIClientConfig {
  serverAddress: string; // e.g., "http://127.0.0.1:8188"
  clientId?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface SystemStats {
  system: {
    os: string;
    python_version: string;
    embedded_python: boolean;
  };
  devices: Array<{
    name: string;
    type: string;
    index: number;
    vram_total: number;
    vram_free: number;
    torch_vram_total: number;
    torch_vram_free: number;
  }>;
}

// --- Queue & Execution Types ---

export interface QueueItem {
  prompt_id: string;
  number: number;
  node_errors: Record<string, any>;
}

export interface GenerationProgress {
  value: number;
  max: number;
  node?: string;
  prompt_id: string;
}

export interface GenerationResult {
  prompt_id: string;
  outputs: Record<string, any>;
  status: 'success' | 'error' | 'interrupted';
}

// --- Model Downloader Types ---

export type ModelSource = 'civitai' | 'huggingface';

export interface ModelDefinition {
  id: string;
  name: string;
  source: ModelSource;
  type: string; // e.g., "Checkpoint", "Lora", "VAE"
  description?: string;
  versionId?: string;
  downloadUrl: string;
  filename: string;
  thumbnailUrl?: string;
  baseModel?: string;
  metadata?: Record<string, any>;
}

// --- Gallery & Asset Types ---

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  prompt_id?: string;
  workflow?: WorkflowGraph;
  metadata: ImageMetadata;
  createdAt: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  seed?: number;
  steps?: number;
  cfg?: number;
  sampler?: string;
  scheduler?: string;
  model?: string;
  positive_prompt?: string;
  negative_prompt?: string;
  [key: string]: any;
}

// --- WebSocket Message Types ---

export type ComfyWSMessage = 
  | { type: 'status'; data: { status: { exec_info: { queue_remaining: number } } } }
  | { type: 'progress'; data: { value: number; max: number; node: string; prompt_id: string } }
  | { type: 'executing'; data: { node: string | null; prompt_id: string } }
  | { type: 'executed'; data: { node: string; output: any; prompt_id: string } }
  | { type: 'execution_start'; data: { prompt_id: string } }
  | { type: 'execution_cached'; data: { prompt_id: string; nodes: string[] } }
  | { type: 'execution_success'; data: { prompt_id: string } }
  | { type: 'execution_error'; data: { prompt_id: string; exception_type: string; exception_message: string; node_id: string; node_type: string; stack_trace: string[] } };
