import { ModelDefinition } from '../types/index.ts';

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'error';

export interface DownloadItem {
  model: ModelDefinition;
  status: DownloadStatus;
  progress: number; // 0-100
  error?: string;
  startTime?: number;
  endTime?: number;
}

export class DownloadManager {
  private downloads: Map<string, DownloadItem> = new Map();
  private listeners: Set<(downloads: DownloadItem[])> = new Set();

  constructor() {
    // In a real app, we might load existing downloads from IndexedDB or the server
  }

  public subscribe(callback: (downloads: DownloadItem[]) => void) {
    this.listeners.add(callback);
    callback(this.getAllDownloads());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const all = this.getAllDownloads();
    this.listeners.forEach(l => l(all));
  }

  public getAllDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values());
  }

  public getDownload(modelId: string): DownloadItem | undefined {
    return this.downloads.get(modelId);
  }

  public addDownload(model: ModelDefinition) {
    if (this.downloads.has(model.id)) return;

    const item: DownloadItem = {
      model,
      status: 'pending',
      progress: 0,
      startTime: Date.now()
    };

    this.downloads.set(model.id, item);
    this.notify();
    
    // In a real app, this is where we'd call the server API to start the download
    // this.startServerDownload(model);
  }

  public updateProgress(modelId: string, progress: number, status: DownloadStatus = 'downloading', error?: string) {
    const item = this.downloads.get(modelId);
    if (!item) return;

    item.progress = progress;
    item.status = status;
    if (error) item.error = error;
    if (status === 'completed') item.endTime = Date.now();

    this.downloads.set(modelId, { ...item });
    this.notify();
  }

  public removeDownload(modelId: string) {
    this.downloads.delete(modelId);
    this.notify();
  }
}
