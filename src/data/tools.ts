import type { Tool } from '../types/tool';

export const tools: Tool[] = [
  { id: 'merge', name: 'Merge PDFs', group: 'PDF', description: 'Combine several PDFs into one file.', icon: '▧' },
  { id: 'split', name: 'Split PDF', group: 'PDF', description: 'Save a chosen page range as a new PDF.', icon: '⫿' },
  { id: 'rotate', name: 'Rotate pages', group: 'PDF', description: 'Rotate every page or selected pages.', icon: '↻' },
  { id: 'reorder', name: 'Reorder pages', group: 'PDF', description: 'Set a new order for PDF pages.', icon: '↕' },
  { id: 'image-pdf', name: 'Images to PDF', group: 'PDF', description: 'Place selected images in a PDF.', icon: '▤' },
  { id: 'convert', name: 'Convert image', group: 'Image', description: 'Export as JPEG, PNG, or WebP.', icon: '⇄' },
  { id: 'resize', name: 'Resize image', group: 'Image', description: 'Change image dimensions in pixels.', icon: '⤢' },
  { id: 'compress', name: 'Compress image', group: 'Image', description: 'Choose a quality level and export.', icon: '⌑' },
];
