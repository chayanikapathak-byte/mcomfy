import { ModelDefinition } from '../types/index.ts';

export interface CivitaiSearchOptions {
  query?: string;
  tag?: string;
  type?: string;
  sort?: 'Highest Rated' | 'Most Downloaded' | 'Newest';
  period?: 'AllTime' | 'Year' | 'Month' | 'Week' | 'Day';
  limit?: number;
  page?: number;
}

export class CivitaiClient {
  private baseUrl = 'https://civitai.com/api/v1';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url.toString(), { ...options, headers });
    if (!response.ok) {
      throw new Error(`CivitAI API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async searchModels(options: CivitaiSearchOptions = {}): Promise<{ items: ModelDefinition[], metadata: any }> {
    const params = new URLSearchParams();
    if (options.query) params.append('query', options.query);
    if (options.tag) params.append('tag', options.tag);
    if (options.type) params.append('types', options.type);
    if (options.sort) params.append('sort', options.sort);
    if (options.period) params.append('period', options.period);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.page) params.append('page', options.page.toString());

    const data = await this.fetchApi(`/models?${params.toString()}`);
    
    return {
      items: data.items.map((item: any) => this.mapToModelDefinition(item)),
      metadata: data.metadata
    };
  }

  async getModelDetails(modelId: string): Promise<ModelDefinition> {
    const data = await this.fetchApi(`/models/${modelId}`);
    return this.mapToModelDefinition(data);
  }

  async getModelVersion(versionId: string): Promise<any> {
    return this.fetchApi(`/model-versions/${versionId}`);
  }

  private mapToModelDefinition(item: any): ModelDefinition {
    // Map the first version if available
    const latestVersion = item.modelVersions?.[0];
    const downloadUrl = latestVersion?.downloadUrl || '';
    
    // Find the primary file to get the filename
    const primaryFile = latestVersion?.files?.find((f: any) => f.primary) || latestVersion?.files?.[0];

    return {
      id: item.id.toString(),
      name: item.name,
      source: 'civitai',
      type: item.type,
      description: item.description,
      versionId: latestVersion?.id.toString(),
      downloadUrl: downloadUrl,
      filename: primaryFile?.name || `${item.name}.safetensors`,
      thumbnailUrl: item.modelVersions?.[0]?.images?.[0]?.url,
      baseModel: latestVersion?.baseModel,
      metadata: {
        nsfw: item.nsfw,
        tags: item.tags,
        stats: item.stats,
        creator: item.creator
      }
    };
  }
}
