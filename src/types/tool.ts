export type ToolId = 'merge' | 'split' | 'rotate' | 'reorder' | 'page-number' | 'watermark' | 'image-pdf' | 'convert' | 'resize' | 'compress' | 'crop';
export type Tool = { id: ToolId; name: string; group: 'PDF' | 'Image'; description: string; icon: string };
export type ProcessingOptions = { range: string; rotation: number; order: string; format: string; quality: number; width: string; height: string; keepRatio: boolean; pageStart: number; watermark: string; cropRatio: string; cropX: number; cropY: number };
export type ProcessedFile = { blob: Blob; filename: string };
