import type { ProcessingOptions, ToolId } from '../types/tool';

const LIMIT = 100 * 1024 * 1024;
export const ACCEPT_PDF = '.pdf,application/pdf';
export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function stem(name: string) { return name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || 'file'; }
function checked(files: File[], kind: 'pdf' | 'image') {
  if (!files.length) throw new Error('Choose at least one file to continue.');
  if (files.some(file => !file.size)) throw new Error('One of the selected files is empty.');
  if (files.some(file => file.size > LIMIT)) throw new Error('Each file must be smaller than 100 MB.');
  if (files.some(file => kind === 'pdf' ? file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf') : !file.type.startsWith('image/'))) {
    throw new Error(kind === 'pdf' ? 'Choose PDF files only.' : 'Choose supported image files only.');
  }
}
async function imageBlob(file: File, type: string, quality: number, width?: number, height?: number): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') throw new Error('This browser does not support image processing. Try an up-to-date browser.');
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error(`Could not read “${file.name}”. Try a JPEG, PNG, or WebP image.`); });
  const w = width || bitmap.width; const h = height || bitmap.height;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('This browser could not start image processing.'); }
  context.drawImage(bitmap, 0, 0, w, h); bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(`This browser cannot export ${type.replace('image/', '').toUpperCase()} images.`)), type, quality));
}
function parseRange(value: string, count: number): number[] {
  const indexes = new Set<number>();
  for (const part of value.split(',').map(item => item.trim()).filter(Boolean)) {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Enter pages like 1-3, 5.');
    const start = Number(match[1]); const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > count) throw new Error(`Page numbers must be between 1 and ${count}.`);
    for (let page = start; page <= end; page++) indexes.add(page - 1);
  }
  if (!indexes.size) throw new Error('Enter at least one page.');
  return [...indexes];
}
function parseOrder(value: string, count: number): number[] {
  const pages = value.split(',').map(item => Number(item.trim()));
  if (pages.length !== count || pages.some(page => !Number.isInteger(page) || page < 1 || page > count) || new Set(pages).size !== count) throw new Error(`List each page from 1 to ${count} exactly once.`);
  return pages.map(page => page - 1);
}
export function formatBytes(size: number) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`; }

export async function processFiles(id: ToolId, files: File[], options: ProcessingOptions) {
  if (['merge', 'split', 'rotate', 'reorder'].includes(id)) {
    checked(files, 'pdf');
    const { PDFDocument, degrees } = await import('pdf-lib');
    if (id === 'merge') {
      const out = await PDFDocument.create();
      for (const file of files) { const src = await PDFDocument.load(await file.arrayBuffer()); const pages = await out.copyPages(src, src.getPageIndices()); pages.forEach(page => out.addPage(page)); }
      download(new Blob([await out.save()], { type: 'application/pdf' }), 'merged.pdf');
      return;
    }
    if (files.length !== 1) throw new Error('Choose exactly one PDF for this tool.');
    const doc = await PDFDocument.load(await files[0].arrayBuffer()); const count = doc.getPageCount();
    if (id === 'split') {
      const out = await PDFDocument.create();
      (await out.copyPages(doc, parseRange(options.range, count))).forEach(page => out.addPage(page));
      download(new Blob([await out.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-pages.pdf`);
    } else if (id === 'rotate') {
      const indexes = options.range.trim() ? parseRange(options.range, count) : doc.getPageIndices();
      indexes.forEach(index => { const page = doc.getPage(index); page.setRotation(degrees((page.getRotation().angle + options.rotation) % 360)); });
      download(new Blob([await doc.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-rotated.pdf`);
    } else {
      const out = await PDFDocument.create();
      (await out.copyPages(doc, parseOrder(options.order, count))).forEach(page => out.addPage(page));
      download(new Blob([await out.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-reordered.pdf`);
    }
    return;
  }
  checked(files, 'image');
  if (id === 'image-pdf') {
    const { PDFDocument } = await import('pdf-lib'); const out = await PDFDocument.create();
    for (const file of files) {
      const blob = await imageBlob(file, 'image/jpeg', 0.92); const image = await out.embedJpg(await blob.arrayBuffer());
      const page = out.addPage([image.width, image.height]); page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    download(new Blob([await out.save()], { type: 'application/pdf' }), 'images.pdf');
    return;
  }
  if (files.length !== 1) throw new Error('Choose one image at a time.');
  if (typeof createImageBitmap !== 'function') throw new Error('This browser does not support image processing. Try an up-to-date browser.');
  const bitmap = await createImageBitmap(files[0]).catch(() => { throw new Error('This image could not be opened by your browser.'); });
  const width = id === 'resize' ? Number(options.width) : bitmap.width;
  const height = id === 'resize' ? Number(options.height) : bitmap.height;
  bitmap.close();
  if (!width || !height || width > 12000 || height > 12000) throw new Error('Enter image dimensions between 1 and 12,000 pixels.');
  const output = await imageBlob(files[0], options.format, options.quality / 100, width, height);
  download(output, `${stem(files[0].name)}.${options.format.split('/')[1]}`);
}
