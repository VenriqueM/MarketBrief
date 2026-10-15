import JSZip from 'jszip';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ProcessedFile } from '../types/tool';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

function selectedPages(value: string, count: number) {
  if (!value.trim()) {
    if (count > 30) throw new Error('Choose up to 30 pages at a time, or split the PDF into smaller batches.');
    return Array.from({ length: count }, (_, index) => index + 1);
  }
  const selected = new Set<number>();
  for (const item of value.split(',').map(part => part.trim()).filter(Boolean)) {
    const match = item.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Enter pages like 1-3, 5.');
    const first = Number(match[1]); const last = Number(match[2] || match[1]);
    if (first < 1 || last < first || last > count) throw new Error(`Page numbers must be between 1 and ${count}.`);
    for (let page = first; page <= last; page++) selected.add(page);
  }
  if (!selected.size) throw new Error('Choose at least one page.');
  if (selected.size > 30) throw new Error('Export up to 30 pages at a time to keep memory use manageable.');
  return [...selected];
}

export async function pdfPagesToImages(file: File, range: string, format: 'image/png' | 'image/jpeg', quality: number, scale: number, onProgress: (message: string) => void, signal?: AbortSignal): Promise<ProcessedFile> {
  const task = pdfjs.getDocument({ data: await file.arrayBuffer(), useSystemFonts: true });
  try {
    const pdf = await task.promise;
    const pages = selectedPages(range, pdf.numPages);
    const archive = new JSZip();
    let preview: Blob | undefined;
    for (let i = 0; i < pages.length; i++) {
      if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError');
      onProgress(`Rendering page ${i + 1} of ${pages.length}…`);
      const page = await pdf.getPage(pages[i]);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('This browser could not create an image canvas.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const image = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The browser could not encode a page image.')), format, quality / 100));
      const extension = format === 'image/png' ? 'png' : 'jpg';
      archive.file(`page-${String(pages[i]).padStart(3, '0')}.${extension}`, image);
      if (i === 0) preview = image;
      canvas.width = 0; canvas.height = 0; page.cleanup();
    }
    if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError');
    onProgress('Packaging page images…');
    const blob = await archive.generateAsync({ type: 'blob', compression: 'STORE' });
    if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError');
    return { blob, filename: `${file.name.replace(/\.pdf$/i, '') || 'document'}-pages.zip`, previewBlob: preview, itemCount: pages.length };
  } finally {
    await task.destroy();
  }
}
