export type ToolId = 'merge' | 'split' | 'rotate' | 'reorder' | 'page-number' | 'watermark' | 'image-pdf' | 'convert' | 'resize' | 'compress' | 'crop' | 'text-pdf' | 'pdf-images' | 'qr' | 'word-count' | 'unit-converter' | 'date-calculator' | 'video-frame';
export type ToolGroup = 'PDF' | 'Image' | 'Everyday' | 'Media';
export type Tool = { id: ToolId; name: string; group: ToolGroup; description: string; icon: string };
export type ProcessingOptions = { range: string; rotation: number; order: string; format: string; quality: number; width: string; height: string; keepRatio: boolean; pageStart: number; watermark: string; cropRatio: string; cropX: number; cropY: number; text: string; qrFormat: 'png' | 'svg'; qrSize: number; renderScale: number; timeSeconds: number };
export type ProcessedFile = { blob: Blob; filename: string; previewBlob?: Blob; itemCount?: number };
