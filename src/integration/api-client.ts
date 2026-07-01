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

export type MessageHandler = (msg: ComfyWSMessage) => void;
export type StatusHandler = (status: ConnectionStatus) => void;

export class ComfyUIClient {
  private config: ComfyUIClientConfig;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private clientId: string;
  private statusListeners: Set<StatusHandler> = new Set();
  private messageListeners: Set<MessageHandler> = new Set();
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;

  constructor(config: ComfyUIClientConfig) {
    this.config = config;
    this.clientId = config.clientId || crypto.randomUUID();
  }

  public onStatusChange(callback: StatusHandler) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  public onMessage(callback: MessageHandler) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach(l => l(status));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
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
            // ComfyUI sometimes sends non-JSON messages (like heartbeats)
            if (event.data !== 'pong') {
              console.debug('Received non-JSON message:', event.data);
            }
          }
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();
          if (this.status !== 'disconnected') {
            console.log(`WebSocket closed: ${event.code} ${event.reason}. Reconnecting...`);
            this.setStatus('reconnecting');
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          this.setStatus('error');
          // Don't reject if we're already connected, just let onclose handle it
          if (this.status === 'connecting') {
            reject(err);
          }
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
      if (this.status === 'reconnecting' || this.status === 'error') {
        this.connect().catch(() => {
          if (this.status !== 'disconnected') {
            this.scheduleReconnect();
          }
        });
      }
    }, 5000);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
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

  private async fetchApi(path: string, options: RequestInit = {}) {
    const res = await fetch(`${this.config.serverAddress}${path}`, options);
    if (!res.ok) {
      let errorMsg = `HTTP error! status: ${res.status}`;
      try {
        const err = await res.json();
        errorMsg = err.error?.message || err.message || errorMsg;
      } catch (e) { /* ignore */ }
      throw new Error(errorMsg);
    }
    return res;
  }

  public async getSystemStats(): Promise<SystemStats> {
    const res = await this.fetchApi('/system_stats');
    return await res.json();
  }

  public async submitPrompt(workflow: any): Promise<{ prompt_id: string; number: number }> {
    const body = {
      prompt: workflow,
      client_id: this.clientId,
    };

    const res = await this.fetchApi('/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await res.json();
  }

  public async getQueue(): Promise<{ queue_running: any[]; queue_pending: any[] }> {
    const res = await this.fetchApi('/queue');
    const data = await res.json();
    return data;
  }

  public async getHistory(promptId?: string): Promise<any> {
    const path = promptId ? `/history/${promptId}` : '/history';
    const res = await this.fetchApi(path);
    return await res.json();
  }

  public async interrupt(): Promise<void> {
    await this.fetchApi('/interrupt', { method: 'POST' });
  }

  public async freeMemory(unloadModels: boolean = true, freeVram: boolean = true): Promise<void> {
    await this.fetchApi('/free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unload_models: unloadModels, free_vram: freeVram })
    });
  }

  public async getObjectInfo(nodeClass?: string): Promise<Record<string, any>> {
    const path = nodeClass ? `/object_info/${nodeClass}` : '/object_info';
    const res = await this.fetchApi(path);
    return await res.json();
  }

  public getImageUrl(filename: string, subfolder: string = '', type: string = 'output'): string {
    const params = new URLSearchParams({ filename, subfolder, type });
    return `${this.config.serverAddress}/view?${params.toString()}`;
  }
}
