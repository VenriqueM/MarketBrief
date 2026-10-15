import { useEffect, useRef, useState } from 'react';
import { tools } from './data/tools';
import { ACCEPT_IMAGES, ACCEPT_PDF, formatBytes, processFiles } from './lib/processing';
import type { ProcessingOptions, ToolId } from './types/tool';

type UnitKind = 'length' | 'weight' | 'temperature';
const unitOptions: Record<UnitKind, { id: string; label: string; toBase: (value: number) => number; fromBase: (value: number) => number }[]> = {
  length: [
    { id: 'm', label: 'Metres', toBase: value => value, fromBase: value => value },
    { id: 'km', label: 'Kilometres', toBase: value => value * 1000, fromBase: value => value / 1000 },
    { id: 'cm', label: 'Centimetres', toBase: value => value / 100, fromBase: value => value * 100 },
    { id: 'mi', label: 'Miles', toBase: value => value * 1609.344, fromBase: value => value / 1609.344 },
    { id: 'ft', label: 'Feet', toBase: value => value * 0.3048, fromBase: value => value / 0.3048 },
    { id: 'in', label: 'Inches', toBase: value => value * 0.0254, fromBase: value => value / 0.0254 },
  ],
  weight: [
    { id: 'kg', label: 'Kilograms', toBase: value => value * 1000, fromBase: value => value / 1000 },
    { id: 'g', label: 'Grams', toBase: value => value, fromBase: value => value },
    { id: 'lb', label: 'Pounds', toBase: value => value * 453.59237, fromBase: value => value / 453.59237 },
    { id: 'oz', label: 'Ounces', toBase: value => value * 28.349523125, fromBase: value => value / 28.349523125 },
  ],
  temperature: [
    { id: 'C', label: 'Celsius', toBase: value => value, fromBase: value => value },
    { id: 'F', label: 'Fahrenheit', toBase: value => (value - 32) * 5 / 9, fromBase: value => value * 9 / 5 + 32 },
    { id: 'K', label: 'Kelvin', toBase: value => value - 273.15, fromBase: value => value + 273.15 },
  ],
};
function localDateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function daysBetween(start: string, end: string) {
  if (!start || !end) return null;
  const [sy, sm, sd] = start.split('-').map(Number); const [ey, em, ed] = end.split('-').map(Number);
  if (![sy, sm, sd, ey, em, ed].every(Number.isFinite)) return null;
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000);
}
function wordStats(value: string) {
  const words = value.trim() ? value.trim().split(/\s+/u).length : 0;
  const characters = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].length : Array.from(value).length;
  const withoutWhitespace = value.replace(/\s/gu, '');
  const charactersNoSpaces = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(withoutWhitespace)].length : Array.from(withoutWhitespace).length;
  return { words, characters, charactersNoSpaces, lines: value ? value.split(/\r\n|\r|\n/).length : 0 };
}

export default function App() {
  const [active, setActive] = useState<ToolId | null>(null);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [range, setRange] = useState('');
  const [rotation, setRotation] = useState(90);
  const [order, setOrder] = useState('');
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepRatio, setKeepRatio] = useState(true);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [pageStart, setPageStart] = useState(1);
  const [watermark, setWatermark] = useState('CONFIDENTIAL');
  const [cropRatio, setCropRatio] = useState('original');
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [qrText, setQrText] = useState('');
  const [countText, setCountText] = useState('');
  const [qrFormat, setQrFormat] = useState<'png' | 'svg'>('png');
  const [qrSize, setQrSize] = useState(512);
  const [renderScale, setRenderScale] = useState(1.5);
  const [unitKind, setUnitKind] = useState<UnitKind>('length');
  const [unitValue, setUnitValue] = useState('1');
  const [unitFrom, setUnitFrom] = useState('km');
  const [unitTo, setUnitTo] = useState('mi');
  const [dateStart, setDateStart] = useState(localDateString(new Date()));
  const [dateEnd, setDateEnd] = useState(localDateString(new Date()));
  const [processed, setProcessed] = useState<Awaited<ReturnType<typeof processFiles>> | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const controller = useRef<AbortController | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const tool = tools.find(item => item.id === active);
  const fileTool = tool && !['qr', 'word-count', 'unit-converter', 'date-calculator'].includes(tool.id);
  const filtered = tools.filter(item => `${item.name} ${item.description} ${item.group}`.toLowerCase().includes(query.toLowerCase()));
  const activeUnits = unitOptions[unitKind];
  const fromUnit = activeUnits.find(item => item.id === unitFrom) ?? activeUnits[0];
  const toUnit = activeUnits.find(item => item.id === unitTo) ?? activeUnits[1] ?? activeUnits[0];
  const parsedUnitValue = Number(unitValue);
  const convertedValue = unitValue.trim() && Number.isFinite(parsedUnitValue) ? toUnit.fromBase(fromUnit.toBase(parsedUnitValue)) : null;
  const dateDifference = daysBetween(dateStart, dateEnd);
  const stats = wordStats(countText);
  const acceptedFiles = tool?.id === 'text-pdf' ? '.txt,.md,.markdown,text/plain,text/markdown' : tool?.group === 'PDF' ? ACCEPT_PDF : ACCEPT_IMAGES;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.current?.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const choose = (id: ToolId) => { setActive(id); setFiles([]); setProcessed(null); setStatus(''); setError(''); setRange(''); if (id === 'pdf-images') setFormat('image/png'); };
  const pickFiles = (selected: FileList | null) => { setFiles(selected ? Array.from(selected) : []); setProcessed(null); setStatus(''); setError(''); };
  useEffect(() => {
    if (!files.length || tool?.group !== 'Image') { setSourceUrl(''); setNaturalSize({ width: 0, height: 0 }); return; }
    const url = URL.createObjectURL(files[0]); setSourceUrl(url);
    let cancelled = false;
    if (typeof createImageBitmap === 'function') createImageBitmap(files[0]).then(bitmap => {
      if (!cancelled) {
        setNaturalSize({ width: bitmap.width, height: bitmap.height });
        if (tool.id === 'resize') { setWidth(String(bitmap.width)); setHeight(String(bitmap.height)); }
        bitmap.close();
      } else bitmap.close();
    }).catch(() => setError('This image could not be opened by your browser.'));
    return () => { cancelled = true; URL.revokeObjectURL(url); };
  }, [files, tool]);
  useEffect(() => {
    if (!processed) { setPreviewUrl(''); setDownloadUrl(''); return; }
    const previewBlob = processed.previewBlob ?? processed.blob;
    const preview = URL.createObjectURL(previewBlob);
    const download = previewBlob === processed.blob ? preview : URL.createObjectURL(processed.blob);
    setPreviewUrl(preview); setDownloadUrl(download);
    return () => { URL.revokeObjectURL(preview); if (download !== preview) URL.revokeObjectURL(download); };
  }, [processed]);
  const clearResult = () => { setProcessed(null); setStatus(''); };
  const run = async () => {
    if (!tool) return;
    setBusy(true); setProcessed(null); setStatus('Starting on-device processing…'); setError('');
    controller.current = new AbortController();
    try {
      const options: ProcessingOptions = { range, rotation, order, format, quality, width, height, keepRatio, pageStart, watermark, cropRatio, cropX, cropY, text: qrText, qrFormat, qrSize, renderScale };
      const result = await processFiles(tool.id, files, options, setStatus, controller.current.signal);
      setProcessed(result); setStatus(`Preview ready · ${formatBytes(result.blob.size)}`);
    } catch (problem) {
      if (problem instanceof DOMException && problem.name === 'AbortError') setStatus('Cancelled. Your original file is unchanged.');
      else { setStatus(''); setError(problem instanceof Error ? problem.message : 'Something went wrong while processing this file.'); }
    } finally { setBusy(false); controller.current = null; }
  };
  return <div className="site-shell">
    <header className="site-header"><a className="brand" href="#home" onClick={() => setActive(null)}><span className="brand-mark">p</span><span>paper<span className="brand-accent">plane</span></span></a><nav aria-label="Main navigation"><a href="#tools">Tools</a><a href="#privacy">Privacy</a></nav><span className="header-note"><i/> Files stay on your device</span></header>
    <main id="home">
      <section className="hero"><div className="hero-copy"><p className="eyebrow">YOUR EVERYDAY FILE TOOLKIT</p><h1>Make files<br/><em>work for you.</em></h1><p className="hero-text">Simple PDF and image tools that run right here in your browser. No account. No upload. No fuss.</p><a className="primary-link" href="#tools">Explore the tools <span>↓</span></a><div className="hero-proof"><span>✳</span> Private by design <b>·</b> Free to use</div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card back-card"><span>PNG</span><i>◩</i></div><div className="art-card front-card"><span className="pdf-tag">PDF</span><div className="art-lines"><i/><i/><i/><i/></div><span className="art-check">✓</span></div><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div></div></section>
      <section className="trust-strip" aria-label="Service details"><div><span>⌘</span><p><strong>Runs in your browser</strong><small>Your files are processed on this device.</small></p></div><div><span>◷</span><p><strong>Static and free</strong><small>No account, subscription, or backend.</small></p></div><div><span>▣</span><p><strong>Made for every screen</strong><small>Desktop, iPad, and iPhone ready.</small></p></div></section>
      <section className="tool-section" id="tools"><div className="section-top"><div><p className="eyebrow">THE TOOLBOX</p><h2>{tool ? tool.name : 'What would you like to do?'}</h2><p className="section-description">{tool ? tool.description : 'A small set of useful tools, ready when you are.'}</p></div><label className="search-wrap"><span aria-hidden="true">⌕</span><input ref={search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a tool…" aria-label="Search tools"/><kbd>⌘ K</kbd></label></div>
        {tool && <div className="workspace"><div className="workspace-head"><div><span className={`group-chip ${tool.group.toLowerCase()}`}>{tool.group} TOOL</span><h3>{tool.name}</h3></div><button className="text-button" disabled={busy} onClick={() => { setActive(null); setFiles([]); setProcessed(null); setStatus(''); setError(''); }}>← All tools</button></div><p className="privacy-note">{fileTool ? 'Files are processed locally in this browser and are not uploaded. Large files use device memory; the limit is 100 MB per file (10 MB for text files).' : 'Your text and calculator inputs stay in this browser tab and are not uploaded or saved.'}</p>
          {fileTool && <div className={`drop-zone ${busy ? 'disabled' : ''}`} onClick={() => { if (!busy) picker.current?.click(); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) pickFiles(e.dataTransfer.files); }} role="button" tabIndex={busy ? -1 : 0} onKeyDown={e => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); picker.current?.click(); } }}><span className="upload-icon">↑</span><strong>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Choose files or drop them here'}</strong><small>{tool.id === 'text-pdf' ? 'TXT or Markdown · up to 10 MB' : tool.id === 'pdf-images' ? 'PDF · up to 100 MB · blank page range exports all pages (max 30)' : tool.group === 'PDF' ? 'PDF files · up to 100 MB each' : 'JPEG, PNG, WebP, GIF, or BMP · up to 100 MB each'}</small>{files.length > 0 && <small className="file-list">{files.map(f => `${f.name} · ${formatBytes(f.size)}`).join('  •  ')}</small>}<input ref={picker} className="sr-only" tabIndex={-1} aria-hidden="true" type="file" accept={acceptedFiles} disabled={busy} multiple={tool.id === 'merge' || tool.id === 'image-pdf'} onClick={e => e.stopPropagation()} onChange={e => pickFiles(e.target.files)}/></div>}
          <div className="options">
            {(tool.id === 'split' || tool.id === 'rotate' || tool.id === 'pdf-images') && <label>Pages {tool.id === 'rotate' && <span className="muted-label">(leave blank to rotate all)</span>}<input value={range} onChange={e => setRange(e.target.value)} placeholder={tool.id === 'pdf-images' ? 'blank for all, or 1-3, 5' : '1-3, 5'} aria-label="Page numbers or ranges"/><small>{tool.id === 'pdf-images' ? 'Choose specific pages or leave blank for every page.' : 'For example: 1-3, 5'}</small></label>}
            {tool.id === 'rotate' && <label>Turn pages<select value={rotation} onChange={e => setRotation(Number(e.target.value))}><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option></select></label>}
            {tool.id === 'reorder' && <label>New page order<input value={order} onChange={e => setOrder(e.target.value)} placeholder="3, 1, 2"/><small>List every page once, in the order you want.</small></label>}
            {tool.id === 'page-number' && <label>First page number<input type="number" min="1" max="999999" value={pageStart} onChange={e => setPageStart(Number(e.target.value))}/><small>Numbers are centered near the bottom of each page.</small></label>}
            {tool.id === 'watermark' && <label>Watermark text<input maxLength={80} value={watermark} onChange={e => setWatermark(e.target.value)} placeholder="CONFIDENTIAL"/><small>Light, angled text appears on every page.</small></label>}
            {tool.id === 'pdf-images' && <label>Image output<select value={format} onChange={e => setFormat(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select></label>}
            {tool.id === 'pdf-images' && <label>Render size<select value={renderScale} onChange={e => setRenderScale(Number(e.target.value))}><option value={1}>Standard</option><option value={1.5}>High</option><option value={2}>Very high</option></select><small>Higher resolution uses more memory.</small></label>}
            {(tool.id === 'convert' || tool.id === 'resize' || tool.id === 'compress' || tool.id === 'crop') && <label>Output format<select value={format} onChange={e => setFormat(e.target.value)}><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select><small>Image exports use the browser’s supported encoders.</small></label>}
            {tool.id === 'resize' && <><label>Width in pixels<input type="number" min="1" max="12000" value={width} onChange={e => { const next = e.target.value; setWidth(next); if (keepRatio && naturalSize.width && Number(next)) setHeight(String(Math.round(Number(next) * naturalSize.height / naturalSize.width))); }} placeholder="e.g. 1200"/></label><label>Height in pixels<input type="number" min="1" max="12000" value={height} onChange={e => { const next = e.target.value; setHeight(next); if (keepRatio && naturalSize.height && Number(next)) setWidth(String(Math.round(Number(next) * naturalSize.width / naturalSize.height))); }} placeholder="e.g. 800"/></label><label className="check-option"><input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)}/> Keep original aspect ratio</label></>}
            {tool.id === 'crop' && <><label>Crop ratio<select value={cropRatio} onChange={e => setCropRatio(e.target.value)}><option value="original">Original</option><option value="1">Square · 1:1</option><option value="1.3333333333">Landscape · 4:3</option><option value="1.7777777778">Widescreen · 16:9</option><option value="0.75">Portrait · 3:4</option><option value="0.5625">Story · 9:16</option></select></label><label>Horizontal framing <strong className="quality-value">{cropX}%</strong><input type="range" min="0" max="100" value={cropX} onChange={e => setCropX(Number(e.target.value))}/><small>Move the crop window left or right.</small></label><label>Vertical framing <strong className="quality-value">{cropY}%</strong><input type="range" min="0" max="100" value={cropY} onChange={e => setCropY(Number(e.target.value))}/><small>Move the crop window up or down.</small></label></>}
            {(['compress', 'convert', 'resize', 'crop', 'pdf-images'] as ToolId[]).includes(tool.id) && format !== 'image/png' && <label>Image quality <strong className="quality-value">{quality}%</strong><input type="range" min="20" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))}/><small>Lower quality usually creates a smaller file.</small></label>}
            {tool.id === 'text-pdf' && <p className="workspace-hint">Supports .txt, .md, and .markdown files. Markdown headings and lists are formatted. Text must use characters supported by standard PDF fonts.</p>}
            {tool.id === 'qr' && <><label>Link or text<textarea value={qrText} maxLength={2048} onChange={e => setQrText(e.target.value)} placeholder="https://example.com" rows={4}/><small>{qrText.length}/2,048 characters · QR is generated locally.</small></label><label>Download format<select value={qrFormat} onChange={e => setQrFormat(e.target.value as 'png' | 'svg')}><option value="png">PNG image</option><option value="svg">SVG vector</option></select></label>{qrFormat === 'png' && <label>PNG size<select value={qrSize} onChange={e => setQrSize(Number(e.target.value))}><option value={256}>256 × 256</option><option value={512}>512 × 512</option><option value={1024}>1024 × 1024</option></select></label>}</>}
            {tool.id === 'word-count' && <label>Text to count<textarea value={countText} onChange={e => setCountText(e.target.value)} rows={9} placeholder="Paste or type text here. It stays in this tab."/></label>}
            {tool.id === 'unit-converter' && <><label>Measurement<select value={unitKind} onChange={e => { const next = e.target.value as UnitKind; setUnitKind(next); setUnitFrom(unitOptions[next][0].id); setUnitTo(unitOptions[next][1]?.id ?? unitOptions[next][0].id); }}><option value="length">Length</option><option value="weight">Weight / mass</option><option value="temperature">Temperature</option></select></label><label>Value<input type="number" value={unitValue} onChange={e => setUnitValue(e.target.value)} step="any"/></label><label>From<select value={fromUnit.id} onChange={e => setUnitFrom(e.target.value)}>{activeUnits.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>To<select value={toUnit.id} onChange={e => setUnitTo(e.target.value)}>{activeUnits.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></>}
            {tool.id === 'date-calculator' && <><label>Start date<input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}/></label><label>End date<input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}/></label></>}
          </div>
          {tool.id === 'word-count' && <div className="utility-result" aria-live="polite"><div><strong>{stats.words}</strong><span>words</span></div><div><strong>{stats.characters}</strong><span>characters</span></div><div><strong>{stats.charactersNoSpaces}</strong><span>without whitespace</span></div><div><strong>{stats.lines}</strong><span>lines</span></div></div>}
          {tool.id === 'unit-converter' && <p className="calculator-result" aria-live="polite">{convertedValue === null ? 'Enter a number to convert.' : `${parsedUnitValue.toLocaleString()} ${fromUnit.label} = ${Number(convertedValue.toPrecision(8)).toLocaleString()} ${toUnit.label}`}</p>}
          {tool.id === 'date-calculator' && <p className="calculator-result" aria-live="polite">{dateDifference === null ? 'Choose two dates.' : dateDifference === 0 ? 'The dates are the same day.' : `${Math.abs(dateDifference).toLocaleString()} calendar days · ${dateDifference > 0 ? 'end date is later' : 'end date is earlier'}`}</p>}
          {tool.id === 'crop' && sourceUrl && naturalSize.width > 0 && <div className="crop-preview-block"><p>Crop preview</p><div className="crop-preview" style={{ aspectRatio: cropRatio === 'original' ? `${naturalSize.width} / ${naturalSize.height}` : cropRatio }}><img src={sourceUrl} alt="Selected image with the current crop framing" style={{ objectPosition: `${cropX}% ${cropY}%` }}/></div></div>}
          {error && <p className="message error" role="alert">{error}</p>}{status && <p className="message" role="status" aria-live="polite">{status}</p>}
          {!processed && (fileTool || tool.id === 'qr') && <button className="run-button" onClick={() => void run()} disabled={busy}>{busy ? 'Working…' : `Prepare ${tool.name.toLowerCase()} preview →`}</button>}
          {busy && <button className="text-button cancel-button" onClick={() => controller.current?.abort()}>Cancel</button>}
          {processed && previewUrl && <div className="result-preview"><div className="result-heading"><div><strong>Preview your result</strong><small>{processed.filename} · {formatBytes(processed.blob.size)} output size{processed.itemCount ? ` · ${processed.itemCount} pages` : ''}</small></div><button className="text-button" onClick={clearResult}>Discard preview</button></div>{processed.blob.type === 'application/pdf' ? <><iframe title="Generated PDF preview" src={previewUrl}/><p className="preview-note">If the preview does not appear on your device, you can still download the prepared PDF below.</p></> : <>{processed.itemCount && <p className="preview-note">Preview of the first page image; the ZIP contains all selected pages.</p>}<img className="result-image" src={previewUrl} alt="Preview of the processed result"/></>}<a className="run-button download-button" href={downloadUrl} download={processed.filename}>Download {processed.filename}</a></div>}
          {fileTool && <p className="workspace-hint">Tip: large PDFs and high-resolution images may take longer on mobile devices.</p>}
        </div>}
        <div className="tool-groups">{(['PDF', 'Image', 'Everyday'] as const).map(group => <div className="tool-group" key={group}><div className="group-heading"><span className={`group-icon ${group.toLowerCase()}`}>{group === 'PDF' ? '▤' : group === 'Image' ? '▧' : '✳'}</span><div><h3>{group === 'Everyday' ? 'Everyday tools' : group + ' tools'}</h3><p>{group === 'PDF' ? 'Organize, convert, and prepare documents.' : group === 'Image' ? 'Change dimensions and file formats.' : 'Small helpers for links, words, measures, and dates.'}</p></div></div><div className="tool-grid">{filtered.filter(item => item.group === group).map(item => <button disabled={busy} className={`tool-card ${active === item.id ? 'selected' : ''}`} key={item.id} onClick={() => choose(item.id)}><span className="tool-icon">{item.icon}</span><strong>{item.name}<span>↗</span></strong><small>{item.description}</small></button>)}{filtered.filter(item => item.group === group).length === 0 && <p className="no-tools">No matching tools in this category.</p>}</div></div>)}</div>
      </section>
      <section className="privacy-section" id="privacy"><div className="privacy-icon">✳</div><div><p className="eyebrow">YOUR FILES ARE YOURS</p><h2>Private by default.</h2><p>PDF, image, QR, text, and calculator work happens in your browser. This site does not upload selected files, save inputs to an account, or store file contents in local storage. Your browser may use memory while a tool is running; downloads are created on your device.</p><a href="#tools">Choose a tool ↑</a></div><div className="privacy-stamp">ON DEVICE<br/><strong>ONLY</strong></div></section>
    </main><footer className="site-footer"><a className="brand" href="#home"><span className="brand-mark">p</span><span>paper<span className="brand-accent">plane</span></span></a><span>Small tools. A little more ease.</span><a href="#privacy">Privacy & file handling</a></footer>
  </div>;
}
