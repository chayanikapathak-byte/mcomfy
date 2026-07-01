import { WorkflowGraph } from '../types/index.ts';

/**
 * PNG Workflow Metadata Parser
 * Extracts ComfyUI workflow JSON and prompt JSON from PNG metadata chunks.
 */

export class WorkflowParser {
  /**
   * Parses a PNG file (as ArrayBuffer or Blob) and extracts the workflow and prompt.
   */
  static async parsePngMetadata(data: ArrayBuffer | Blob): Promise<{ workflow: WorkflowGraph | null; prompt: any | null }> {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    const view = new DataView(buffer);

    // Check PNG signature
    if (view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a) {
      throw new Error('Not a valid PNG file');
    }

    let offset = 8;
    let workflow: WorkflowGraph | null = null;
    let prompt: any | null = null;

    while (offset < buffer.byteLength) {
      const length = view.getUint32(offset);
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );

      if (type === 'tEXt') {
        const chunkData = new Uint8Array(buffer, offset + 8, length);
        const text = new TextDecoder().decode(chunkData);
        const [key, value] = this.parseTextChunk(text);
        
        if (key === 'workflow') {
          try {
            workflow = JSON.parse(value);
          } catch (e) {
            console.error('Failed to parse workflow JSON', e);
          }
        } else if (key === 'prompt') {
          try {
            prompt = JSON.parse(value);
          } catch (e) {
            console.error('Failed to parse prompt JSON', e);
          }
        }
      } else if (type === 'iTXt') {
          // iTXt is for international text, sometimes used by ComfyUI
          const chunkData = new Uint8Array(buffer, offset + 8, length);
          const [key, value] = this.parseITextChunk(chunkData);
          if (key === 'workflow') {
            try {
              workflow = JSON.parse(value);
            } catch (e) {
              console.error('Failed to parse workflow JSON (iTXt)', e);
            }
          } else if (key === 'prompt') {
            try {
              prompt = JSON.parse(value);
            } catch (e) {
              console.error('Failed to parse prompt JSON (iTXt)', e);
            }
          }
      } else if (type === 'IEND') {
        break;
      }

      offset += length + 12; // length + type + data + crc
    }

    return { workflow, prompt };
  }

  private static parseTextChunk(text: string): [string, string] {
    const nullIndex = text.indexOf('\0');
    if (nullIndex === -1) return ['', ''];
    return [text.substring(0, nullIndex), text.substring(nullIndex + 1)];
  }

  private static parseITextChunk(data: Uint8Array): [string, string] {
    let offset = 0;
    // Key
    while (offset < data.length && data[offset] !== 0) offset++;
    const key = new TextDecoder().decode(data.slice(0, offset));
    offset++; // skip null
    
    // Compression flag (1 byte)
    const compressionFlag = data[offset];
    offset++;
    
    // Compression method (1 byte)
    const compressionMethod = data[offset];
    offset++;
    
    // Language tag
    while (offset < data.length && data[offset] !== 0) offset++;
    offset++; // skip null
    
    // Translated key
    while (offset < data.length && data[offset] !== 0) offset++;
    offset++; // skip null
    
    // Text
    const textData = data.slice(offset);
    let value = '';
    
    if (compressionFlag === 1) {
      // zlib compressed
      // In a real environment, we'd use fflate or similar to decompress.
      // ComfyUI usually doesn't compress workflow/prompt in iTXt if I recall correctly,
      // but let's be safe. If we need decompression, we'll need a library.
      console.warn('Compressed iTXt chunk detected, decompression not implemented');
    } else {
      value = new TextDecoder().decode(textData);
    }
    
    return [key, value];
  }
}
