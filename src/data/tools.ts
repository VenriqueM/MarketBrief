import type { Tool } from '../types/tool';

export const tools: Tool[] = [
  { id: 'merge', name: 'Merge PDFs', group: 'PDF', description: 'Combine several PDFs into one file.', icon: '▧' },
  { id: 'split', name: 'Split PDF', group: 'PDF', description: 'Save a chosen page range as a new PDF.', icon: '⫿' },
  { id: 'rotate', name: 'Rotate pages', group: 'PDF', description: 'Rotate every page or selected pages.', icon: '↻' },
  { id: 'reorder', name: 'Reorder pages', group: 'PDF', description: 'Set a new order for PDF pages.', icon: '↕' },
  { id: 'page-number', name: 'Add page numbers', group: 'PDF', description: 'Add a discreet number to every page.', icon: '#' },
  { id: 'watermark', name: 'Text watermark', group: 'PDF', description: 'Place a light text mark on each page.', icon: '◇' },
  { id: 'image-pdf', name: 'Images to PDF', group: 'PDF', description: 'Place selected images in a PDF.', icon: '▤' },
  { id: 'text-pdf', name: 'Text to PDF', group: 'PDF', description: 'Turn plain text or Markdown into a printable PDF.', icon: 'T' },
  { id: 'pdf-images', name: 'PDF to images', group: 'PDF', description: 'Export selected pages as PNG or JPEG images.', icon: '▧' },
  { id: 'convert', name: 'Convert image', group: 'Image', description: 'Export as JPEG, PNG, or WebP.', icon: '⇄' },
  { id: 'resize', name: 'Resize image', group: 'Image', description: 'Change image dimensions in pixels.', icon: '⤢' },
  { id: 'compress', name: 'Compress image', group: 'Image', description: 'Choose a quality level and export.', icon: '⌑' },
  { id: 'crop', name: 'Crop image', group: 'Image', description: 'Frame an image with a chosen aspect ratio.', icon: '⛶' },
  { id: 'qr', name: 'QR code maker', group: 'Everyday', description: 'Create a downloadable QR code for text or a link.', icon: '▦' },
  { id: 'word-count', name: 'Word counter', group: 'Everyday', description: 'Count words, characters, and lines locally.', icon: 'Aa' },
  { id: 'unit-converter', name: 'Unit converter', group: 'Everyday', description: 'Convert common length, weight, and temperature units.', icon: '⇄' },
  { id: 'date-calculator', name: 'Date calculator', group: 'Everyday', description: 'Find the number of calendar days between dates.', icon: '▦' },
];
