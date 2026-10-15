import type { ProcessedFile, ProcessingOptions, ToolId } from '../types/tool';

const LIMIT = 100 * 1024 * 1024;
export const ACCEPT_PDF = '.pdf,application/pdf';
export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp';

function result(blob: Blob, filename: string): ProcessedFile { return { blob, filename }; }
function stem(name: string) { return name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || 'file'; }
function isImageFile(file: File) { return file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name); }
function checked(files: File[], kind: 'pdf' | 'image') {
  if (!files.length) throw new Error('Choose at least one file to continue.');
  if (files.some(file => !file.size)) throw new Error('One of the selected files is empty.');
  if (files.some(file => file.size > LIMIT)) throw new Error('Each file must be smaller than 100 MB.');
  if (files.some(file => kind === 'pdf' ? file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf') : !isImageFile(file))) {
    throw new Error(kind === 'pdf' ? 'Choose PDF files only.' : 'Choose supported image files only.');
  }
}
function checkCancelled(signal?: AbortSignal) { if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError'); }
async function imageBlob(file: File, type: string, quality: number, width?: number, height?: number, crop?: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') throw new Error('This browser does not support image processing. Try an up-to-date browser.');
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error(`Could not read “${file.name}”. Try a JPEG, PNG, or WebP image.`); });
  const w = Math.max(1, Math.round(crop?.width ?? width ?? bitmap.width)); const h = Math.max(1, Math.round(crop?.height ?? height ?? bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d');
  if (!context) { bitmap.close(); throw new Error('This browser could not start image processing.'); }
  if (crop) context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, w, h);
  else context.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
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

export async function processFiles(id: ToolId, files: File[], options: ProcessingOptions, onProgress: (message: string) => void, signal?: AbortSignal): Promise<ProcessedFile> {
  checkCancelled(signal);
  if (['merge', 'split', 'rotate', 'reorder', 'page-number', 'watermark'].includes(id)) {
    checked(files, 'pdf');
    const { PDFDocument, degrees, StandardFonts, rgb } = await import('pdf-lib');
    if (id === 'merge') {
      const out = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        checkCancelled(signal); onProgress(`Reading PDF ${i + 1} of ${files.length}…`);
        const src = await PDFDocument.load(await files[i].arrayBuffer());
        (await out.copyPages(src, src.getPageIndices())).forEach(page => out.addPage(page));
      }
      checkCancelled(signal); onProgress('Preparing PDF preview…');
      return result(new Blob([await out.save()], { type: 'application/pdf' }), 'merged.pdf');
    }
    if (files.length !== 1) throw new Error('Choose exactly one PDF for this tool.');
    onProgress('Reading PDF…');
    const doc = await PDFDocument.load(await files[0].arrayBuffer()); const count = doc.getPageCount();
    checkCancelled(signal);
    if (id === 'split') {
      const out = await PDFDocument.create();
      (await out.copyPages(doc, parseRange(options.range, count))).forEach(page => out.addPage(page));
      return result(new Blob([await out.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-pages.pdf`);
    }
    if (id === 'rotate') {
      const indexes = options.range.trim() ? parseRange(options.range, count) : doc.getPageIndices();
      indexes.forEach(index => { const page = doc.getPage(index); page.setRotation(degrees((page.getRotation().angle + options.rotation) % 360)); });
      return result(new Blob([await doc.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-rotated.pdf`);
    }
    if (id === 'reorder') {
      const out = await PDFDocument.create();
      (await out.copyPages(doc, parseOrder(options.order, count))).forEach(page => out.addPage(page));
      return result(new Blob([await out.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-reordered.pdf`);
    }
    if (id === 'page-number') {
      if (!Number.isInteger(options.pageStart) || options.pageStart < 1 || options.pageStart > 999999) throw new Error('Choose a starting number from 1 to 999,999.');
      onProgress('Adding page numbers…');
      const font = await doc.embedFont(StandardFonts.Helvetica);
      doc.getPages().forEach((page, index) => {
        const { width } = page.getSize(); const label = String(options.pageStart + index);
        page.drawText(label, { x: (width - font.widthOfTextAtSize(label, 10)) / 2, y: 18, size: 10, font, color: rgb(0.25, 0.34, 0.30) });
      });
      checkCancelled(signal);
      return result(new Blob([await doc.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-numbered.pdf`);
    }
    const text = options.watermark.trim();
    if (!text) throw new Error('Enter watermark text first.');
    if (text.length > 80) throw new Error('Watermark text must be 80 characters or fewer.');
    onProgress('Applying text watermark…');
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    try { font.encodeText(text); }
    catch { throw new Error('Watermark text must use basic Latin letters, numbers, and punctuation supported by standard PDF fonts.'); }
    doc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      const size = Math.min(48, Math.max(18, width * 0.075));
      page.drawText(text, { x: width * 0.12, y: height * 0.48, size, font, color: rgb(0.45, 0.52, 0.48), opacity: 0.22, rotate: degrees(-30), maxWidth: width * 0.76 });
    });
    checkCancelled(signal);
    return result(new Blob([await doc.save()], { type: 'application/pdf' }), `${stem(files[0].name)}-watermarked.pdf`);
  }
  checked(files, 'image');
  if (id === 'image-pdf') {
    const { PDFDocument } = await import('pdf-lib'); const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      checkCancelled(signal); onProgress(`Adding image ${i + 1} of ${files.length}…`);
      const blob = await imageBlob(files[i], 'image/jpeg', 0.92); const image = await out.embedJpg(await blob.arrayBuffer());
      const page = out.addPage([image.width, image.height]); page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    return result(new Blob([await out.save()], { type: 'application/pdf' }), 'images.pdf');
  }
  if (files.length !== 1) throw new Error('Choose one image at a time.');
  if (typeof createImageBitmap !== 'function') throw new Error('This browser does not support image processing. Try an up-to-date browser.');
  onProgress('Preparing image…');
  const bitmap = await createImageBitmap(files[0]).catch(() => { throw new Error('This image could not be opened by your browser.'); });
  const width = id === 'resize' ? Number(options.width) : bitmap.width;
  const height = id === 'resize' ? Number(options.height) : bitmap.height;
  let crop: { x: number; y: number; width: number; height: number } | undefined;
  if (id === 'crop') {
    const ratio = options.cropRatio === 'original' ? bitmap.width / bitmap.height : Number(options.cropRatio);
    if (!Number.isFinite(ratio) || ratio <= 0) { bitmap.close(); throw new Error('Choose a supported crop ratio.'); }
    let cropWidth = bitmap.width; let cropHeight = bitmap.height;
    if (bitmap.width / bitmap.height > ratio) cropWidth = bitmap.height * ratio;
    else cropHeight = bitmap.width / ratio;
    crop = { x: (bitmap.width - cropWidth) * options.cropX / 100, y: (bitmap.height - cropHeight) * options.cropY / 100, width: cropWidth, height: cropHeight };
  }
  bitmap.close();
  if (id === 'resize' && (!width || !height || width > 12000 || height > 12000)) throw new Error('Enter image dimensions between 1 and 12,000 pixels.');
  const output = await imageBlob(files[0], options.format, options.quality / 100, width, height, crop);
  checkCancelled(signal);
  return result(output, `${stem(files[0].name)}-${id === 'crop' ? 'cropped' : id === 'resize' ? 'resized' : id === 'compress' ? 'compressed' : 'converted'}.${options.format.split('/')[1]}`);
}
