export type ToolId = 'merge' | 'split' | 'rotate' | 'reorder' | 'image-pdf' | 'convert' | 'resize' | 'compress';
export type Tool = { id: ToolId; name: string; group: 'PDF' | 'Image'; description: string; icon: string };
export type ProcessingOptions = { range: string; rotation: number; order: string; format: string; quality: number; width: string; height: string };
