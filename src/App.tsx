import { useEffect, useRef, useState } from 'react';
import { tools } from './data/tools';
import { ACCEPT_IMAGES, ACCEPT_PDF, formatBytes, processFiles } from './lib/processing';
import type { ProcessingOptions, ToolId } from './types/tool';

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
  const [processed, setProcessed] = useState<Awaited<ReturnType<typeof processFiles>> | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const controller = useRef<AbortController | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const tool = tools.find(item => item.id === active);
  const filtered = tools.filter(item => `${item.name} ${item.description} ${item.group}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.current?.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const choose = (id: ToolId) => { setActive(id); setFiles([]); setProcessed(null); setStatus(''); setError(''); setRange(''); };
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
    if (!processed) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(processed.blob); setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [processed]);
  const clearResult = () => { setProcessed(null); setStatus(''); };
  const run = async () => {
    if (!tool) return;
    setBusy(true); setProcessed(null); setStatus('Starting on-device processing…'); setError('');
    controller.current = new AbortController();
    try {
      const options: ProcessingOptions = { range, rotation, order, format, quality, width, height, keepRatio, pageStart, watermark, cropRatio, cropX, cropY };
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
      <section className="trust-strip" aria-label="Service details"><div><span>⌘</span><p><strong>Runs in your browser</strong><small>Your files are processed on this device.</small></p></div><div><span>◷</span><p><strong>Works offline after loading</strong><small>No account or subscription needed.</small></p></div><div><span>▣</span><p><strong>Made for every screen</strong><small>Desktop, iPad, and iPhone ready.</small></p></div></section>
      <section className="tool-section" id="tools"><div className="section-top"><div><p className="eyebrow">THE TOOLBOX</p><h2>{tool ? tool.name : 'What would you like to do?'}</h2><p className="section-description">{tool ? tool.description : 'A small set of useful tools, ready when you are.'}</p></div><label className="search-wrap"><span aria-hidden="true">⌕</span><input ref={search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a tool…" aria-label="Search tools"/><kbd>⌘ K</kbd></label></div>
        {tool && <div className="workspace"><div className="workspace-head"><div><span className={`group-chip ${tool.group.toLowerCase()}`}>{tool.group} TOOL</span><h3>{tool.name}</h3></div><button className="text-button" onClick={() => { setActive(null); setFiles([]); setStatus(''); setError(''); }}>← All tools</button></div><p className="privacy-note">Files are processed locally in this browser and are not uploaded. For smoother processing on phones and tablets, use files under 100 MB each.</p>
          <div className="drop-zone" onClick={() => picker.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pickFiles(e.dataTransfer.files); }} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); picker.current?.click(); } }}><span className="upload-icon">↑</span><strong>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Choose files or drop them here'}</strong><small>{tool.group === 'PDF' ? 'PDF files · up to 100 MB each' : 'JPEG, PNG, WebP, GIF, or BMP · up to 100 MB each'}</small>{files.length > 0 && <small className="file-list">{files.map(f => `${f.name} · ${formatBytes(f.size)}`).join('  •  ')}</small>}<input ref={picker} className="sr-only" tabIndex={-1} aria-hidden="true" type="file" accept={tool.group === 'PDF' ? ACCEPT_PDF : ACCEPT_IMAGES} multiple={tool.id === 'merge' || tool.id === 'image-pdf'} onClick={e => e.stopPropagation()} onChange={e => pickFiles(e.target.files)}/></div>
          <div className="options">
            {(tool.id === 'split' || tool.id === 'rotate') && <label>Pages {tool.id === 'rotate' && <span className="muted-label">(leave blank to rotate all)</span>}<input value={range} onChange={e => setRange(e.target.value)} placeholder="1-3, 5" aria-label="Page numbers or ranges"/><small>For example: 1-3, 5</small></label>}
            {tool.id === 'rotate' && <label>Turn pages<select value={rotation} onChange={e => setRotation(Number(e.target.value))}><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option></select></label>}
            {tool.id === 'reorder' && <label>New page order<input value={order} onChange={e => setOrder(e.target.value)} placeholder="3, 1, 2"/><small>List every page once, in the order you want.</small></label>}
            {tool.id === 'page-number' && <label>First page number<input type="number" min="1" max="999999" value={pageStart} onChange={e => setPageStart(Number(e.target.value))}/><small>Numbers are centered near the bottom of each page.</small></label>}
            {tool.id === 'watermark' && <label>Watermark text<input maxLength={80} value={watermark} onChange={e => setWatermark(e.target.value)} placeholder="CONFIDENTIAL"/><small>Light, angled text appears on every page.</small></label>}
            {(tool.id === 'convert' || tool.id === 'resize' || tool.id === 'compress' || tool.id === 'crop') && <label>Output format<select value={format} onChange={e => setFormat(e.target.value)}><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select><small>Image exports use the browser’s supported encoders.</small></label>}
            {tool.id === 'resize' && <><label>Width in pixels<input type="number" min="1" max="12000" value={width} onChange={e => { const next = e.target.value; setWidth(next); if (keepRatio && naturalSize.width && Number(next)) setHeight(String(Math.round(Number(next) * naturalSize.height / naturalSize.width))); }} placeholder="e.g. 1200"/></label><label>Height in pixels<input type="number" min="1" max="12000" value={height} onChange={e => { const next = e.target.value; setHeight(next); if (keepRatio && naturalSize.height && Number(next)) setWidth(String(Math.round(Number(next) * naturalSize.width / naturalSize.height))); }} placeholder="e.g. 800"/></label><label className="check-option"><input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)}/> Keep original aspect ratio</label></>}
            {tool.id === 'crop' && <><label>Crop ratio<select value={cropRatio} onChange={e => setCropRatio(e.target.value)}><option value="original">Original</option><option value="1">Square · 1:1</option><option value="1.3333333333">Landscape · 4:3</option><option value="1.7777777778">Widescreen · 16:9</option><option value="0.75">Portrait · 3:4</option><option value="0.5625">Story · 9:16</option></select></label><label>Horizontal framing <strong className="quality-value">{cropX}%</strong><input type="range" min="0" max="100" value={cropX} onChange={e => setCropX(Number(e.target.value))}/><small>Move the crop window left or right.</small></label><label>Vertical framing <strong className="quality-value">{cropY}%</strong><input type="range" min="0" max="100" value={cropY} onChange={e => setCropY(Number(e.target.value))}/><small>Move the crop window up or down.</small></label></>}
            {(['compress', 'convert', 'resize', 'crop'] as ToolId[]).includes(tool.id) && format !== 'image/png' && <label>Image quality <strong className="quality-value">{quality}%</strong><input type="range" min="20" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))}/><small>Lower quality usually creates a smaller file.</small></label>}
          </div>
          {tool.id === 'crop' && sourceUrl && naturalSize.width > 0 && <div className="crop-preview-block"><p>Crop preview</p><div className="crop-preview" style={{ aspectRatio: cropRatio === 'original' ? `${naturalSize.width} / ${naturalSize.height}` : cropRatio }}><img src={sourceUrl} alt="Selected image with the current crop framing" style={{ objectPosition: `${cropX}% ${cropY}%` }}/></div></div>}
          {error && <p className="message error" role="alert">{error}</p>}{status && <p className="message" role="status" aria-live="polite">{status}</p>}
          {!processed && <button className="run-button" onClick={() => void run()} disabled={busy}>{busy ? 'Working…' : `Prepare ${tool.name.toLowerCase()} preview →`}</button>}
          {busy && <button className="text-button cancel-button" onClick={() => controller.current?.abort()}>Cancel</button>}
          {processed && previewUrl && <div className="result-preview"><div className="result-heading"><div><strong>Preview your result</strong><small>{processed.filename} · {formatBytes(processed.blob.size)} actual output size</small></div><button className="text-button" onClick={clearResult}>Discard preview</button></div>{processed.blob.type === 'application/pdf' ? <><iframe title="Generated PDF preview" src={previewUrl}/><p className="preview-note">If the preview does not appear on your device, you can still download the prepared PDF below.</p></> : <img className="result-image" src={previewUrl} alt="Preview of the processed image"/>}<a className="run-button download-button" href={previewUrl} download={processed.filename}>Download {processed.filename}</a></div>}
          <p className="workspace-hint">Tip: large PDFs and high-resolution images may take longer on mobile devices.</p>
        </div>}
        <div className="tool-groups">{(['PDF', 'Image'] as const).map(group => <div className="tool-group" key={group}><div className="group-heading"><span className={`group-icon ${group.toLowerCase()}`}>{group === 'PDF' ? '▤' : '▧'}</span><div><h3>{group} tools</h3><p>{group === 'PDF' ? 'Organize pages and create documents.' : 'Change dimensions and file formats.'}</p></div></div><div className="tool-grid">{filtered.filter(item => item.group === group).map(item => <button className={`tool-card ${active === item.id ? 'selected' : ''}`} key={item.id} onClick={() => choose(item.id)}><span className="tool-icon">{item.icon}</span><strong>{item.name}<span>↗</span></strong><small>{item.description}</small></button>)}{filtered.filter(item => item.group === group).length === 0 && <p className="no-tools">No matching tools in this category.</p>}</div></div>)}</div>
      </section>
      <section className="privacy-section" id="privacy"><div className="privacy-icon">✳</div><div><p className="eyebrow">YOUR FILES ARE YOURS</p><h2>Private by default.</h2><p>PDF and image processing happens inside your browser using local web APIs. This site does not upload selected files, save them to an account, or store file contents in local storage. Your browser may use memory while a tool is running; downloads are created on your device.</p><a href="#tools">Choose a tool ↑</a></div><div className="privacy-stamp">ON DEVICE<br/><strong>ONLY</strong></div></section>
    </main><footer className="site-footer"><a className="brand" href="#home"><span className="brand-mark">p</span><span>paper<span className="brand-accent">plane</span></span></a><span>Small tools. A little more ease.</span><a href="#privacy">Privacy & file handling</a></footer>
  </div>;
}
