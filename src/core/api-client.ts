import { 
  ComfyUIClientConfig, 
  ConnectionStatus, 
  SystemStats, 
  QueueItem, 
  GenerationProgress, 
  GenerationResult,
  ComfyWSMessage,
  WorkflowGraph
} from '../types/index.ts';

export class ComfyUIClient {
  private config: ComfyUIClientConfig;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private clientId: string;
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private messageListeners: Set<(msg: ComfyWSMessage) => void> = new Set();
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;

  constructor(config: ComfyUIClientConfig) {
    this.config = config;
    this.clientId = config.clientId || crypto.randomUUID();
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onMessage(callback: (msg: ComfyWSMessage) => void) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.listeners.forEach(l => l(status));
  }

  public async connect() {
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = new URL(this.config.serverAddress);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl.pathname = '/ws';
    wsUrl.searchParams.set('clientId', this.clientId);

    this.setStatus('connecting');

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl.toString());

        this.ws.onopen = () => {
          this.setStatus('connected');
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWSMessage(data);
          } catch (e) {
            console.error('Failed to parse WS message', e);
          }
        };

        this.ws.onclose = () => {
          this.stopHeartbeat();
          if (this.status !== 'disconnected') {
            this.setStatus('reconnecting');
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (err) => {
          this.setStatus('error');
          reject(err);
        };
      } catch (e) {
        this.setStatus('error');
        reject(e);
      }
    });
  }

  public disconnect() {
    this.setStatus('disconnected');
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => this.scheduleReconnect());
    }, 5000);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // ComfyUI doesn't strictly need heartbeats from client usually, 
        // but it keeps connection alive through proxies
        this.ws.send('ping');
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private handleWSMessage(data: any) {
    const msgType = data.type;
    const msg: ComfyWSMessage = { type: msgType, data: data.data };
    this.messageListeners.forEach(l => l(msg));
  }

  // --- REST API Methods ---

  public async getSystemStats(): Promise<SystemStats> {
    const res = await fetch(`${this.config.serverAddress}/system_stats`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  public async submitPrompt(workflow: any, outputNodeId?: string): Promise<{ prompt_id: string; number: number }> {
    const body = {
      prompt: workflow,
      client_id: this.clientId,
    };

    const res = await fetch(`${this.config.serverAddress}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getQueue(): Promise<{ queue_running: any[]; queue_pending: any[] }> {
    const res = await fetch(`${this.config.serverAddress}/queue`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  public async getHistory(promptId?: string): Promise<any> {
    const url = promptId 
      ? `${this.config.serverAddress}/history/${promptId}`
      : `${this.config.serverAddress}/history`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  public async interrupt(): Promise<void> {
    const res = await fetch(`${this.config.serverAddress}/interrupt`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  }

  public async freeMemory(unloadModels: boolean = true, freeVram: boolean = true): Promise<void> {
    const res = await fetch(`${this.config.serverAddress}/free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unload_models: unloadModels, free_vram: freeVram })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  }

  public async getObjectInfo(nodeClass?: string): Promise<Record<string, any>> {
    const url = nodeClass
      ? `${this.config.serverAddress}/object_info/${nodeClass}`
      : `${this.config.serverAddress}/object_info`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  public getImageUrl(filename: string, subfolder: string = '', type: string = 'output'): string {
    const params = new URLSearchParams({ filename, subfolder, type });
    return `${this.config.serverAddress}/view?${params.toString()}`;
  }
}
