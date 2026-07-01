import { ModelDefinition } from '../types/index.ts';

export interface HFSearchOptions {
  search?: string;
  filter?: string;
  sort?: 'downloads' | 'likes' | 'modified' | 'created';
  direction?: -1 | 1;
  limit?: number;
}

export class HFClient {
  private baseUrl = 'https://huggingface.co/api';
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url.toString(), { ...options, headers });
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async searchModels(options: HFSearchOptions = {}): Promise<ModelDefinition[]> {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.filter) params.append('filter', options.filter);
    if (options.sort) params.append('sort', options.sort);
    if (options.direction) params.append('direction', options.direction.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const data = await this.fetchApi(`/models?${params.toString()}`);
    
    // HF returns an array of models
    return data.map((item: any) => this.mapToModelDefinition(item));
  }

  async getModelDetails(modelId: string): Promise<ModelDefinition> {
    const data = await this.fetchApi(`/models/${modelId}`);
    return this.mapToModelDefinition(data);
  }

  private mapToModelDefinition(item: any): ModelDefinition {
    // HF models can have multiple files. We try to find a .safetensors or .ckpt file.
    // This is a bit simplified for HF since it's repo-based.
    
    const repoId = item.id || item.modelId;
    const siblings = item.siblings || [];
    const mainFile = siblings.find((s: any) => s.rfilename.endsWith('.safetensors')) 
                  || siblings.find((s: any) => s.rfilename.endsWith('.ckpt'))
                  || siblings[0];

    const filename = mainFile?.rfilename || 'model.safetensors';
    const downloadUrl = `https://huggingface.co/${repoId}/resolve/main/${filename}`;

    return {
      id: repoId,
      name: repoId.split('/').pop() || repoId,
      source: 'huggingface',
      type: this.inferModelType(item.tags || []),
      description: item.pipeline_tag || '',
      downloadUrl: downloadUrl,
      filename: filename,
      thumbnailUrl: `https://huggingface.co/${repoId}/resolve/main/thumbnail.png`, // Guessing
      metadata: {
        author: item.author,
        lastModified: item.lastModified,
        likes: item.likes,
        downloads: item.downloads,
        tags: item.tags
      }
    };
  }

  private inferModelType(tags: string[]): string {
    if (tags.includes('text-to-image')) return 'Checkpoint';
    if (tags.includes('lora')) return 'Lora';
    if (tags.includes('vae')) return 'VAE';
    if (tags.includes('controlnet')) return 'ControlNet';
    return 'Other';
  }
}
