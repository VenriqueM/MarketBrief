# Paperplane — PDF & Image Toolkit

A free, static toolkit for everyday PDF and image tasks. Paperplane is built with React, TypeScript, Vite, and `pdf-lib`. File processing happens in your browser; selected files are not uploaded to a server.

## Tools

### PDF

- Merge multiple PDFs in the selected order.
- Split a PDF by page number or range, for example `1-3, 5`.
- Rotate selected PDF pages, or leave the page field blank to rotate every page.
- Reorder pages by listing every page exactly once, for example `3, 1, 2`.
- Add page numbers centered at the bottom of every page, with a chosen starting number.
- Add an angled, translucent text watermark to every page.
- Convert `.txt`, `.md`, or `.markdown` files to a printable PDF.
- Render chosen PDF pages as PNG or JPEG images in a ZIP archive.
- Convert JPEG, PNG, WebP, GIF, or BMP images to a multi-page PDF.

### Images

- Convert images to JPEG, PNG, or WebP where the browser can encode that format.
- Resize images to a chosen width and height in pixels.
- Resize while keeping the original aspect ratio, or set width and height independently.
- Compress and convert images with JPEG/WebP quality controls.
- Crop with original, square, 4:3, 16:9, 3:4, or 9:16 framing and a live crop preview.
- Convert selected images to PDF.

### Everyday

- Create QR codes from text or links as PNG or SVG.
- Count whitespace-separated words, grapheme characters, characters without whitespace, and lines.
- Convert length (m, km, cm, mi, ft, in), mass (kg, g, lb, oz), and temperature (°C, °F, K).
- Calculate the signed calendar-day difference between two dates.

### Media

- Extract one still image as JPEG from a locally selected video at a chosen timestamp.
- Video-to-audio conversion is not offered. MediaRecorder can encode streams, but the available output containers/codecs and ways to access a selected video's audio track differ between browsers; a dependable general converter would require a large local decoder/transcoder and extra device memory. That tradeoff is especially poor on iPad Safari.
- No online video downloader is included. A static browser app cannot reliably fetch arbitrary cross-origin media: the media host must allow the site's origin with CORS headers. Link-only downloads are inconsistent across browsers, and this toolkit will not work around host restrictions.

Unless a tool below says otherwise, each file must be under 100 MB. Large files and high-resolution images may take substantial device memory or time, especially on phones and tablets. The app prepares a local result and shows a preview before the user downloads it. PDF preview uses the browser's built-in PDF viewer; if the viewer is unavailable, download is still available. Actual output size is shown after image encoding.

Image inputs are JPEG, PNG, WebP, GIF, and BMP when the browser can decode them. Outputs are JPEG, PNG, and WebP when the browser can encode them. Animated GIFs are exported as a still image. PNG does not use the quality slider. JPEG output uses the browser canvas and may not preserve image transparency. Crop preview is a centered or slider-positioned rectangular crop; it does not provide freehand selection.

PDF text import supports basic Markdown headings and lists; inline Markdown emphasis and links are kept as plain text. Text-to-PDF uses built-in standard PDF fonts and supports their Latin character repertoire, not emoji or arbitrary scripts. PDF-to-image output is limited to 30 selected pages per run; it previews the first image and downloads all chosen pages in one ZIP. Page rendering uses PDF.js locally. Very complex PDFs or PDFs with unusual fonts may fail to render, and high render scales consume more memory. Page numbers and watermarks are drawn into page content, not editable PDF comments. Watermark image, drawing, highlighting, and note annotations are not included. The app does not remove passwords or bypass PDF restrictions.

QR generation is local and supports PNG at 256, 512, or 1024 pixels and scalable SVG. QR content is limited to 2,048 characters. The word counter treats words as whitespace-separated tokens. Character counts use grapheme segmentation when available. The date calculator returns elapsed calendar days (end date minus start date); it does not count both endpoints inclusively. Unit conversion covers the units listed above and is intended for everyday use, not regulated or scientific measurement.

OCR is not included: bundling language models would add large downloads and memory use, while accuracy depends on language, layout, and scan quality.

Video frame extraction uses the browser's built-in video decoder and canvas; no media library is added. The file picker accepts MP4, M4V, MOV, and WebM containers, but a filename extension does not guarantee the contained codec is supported. Try a video that plays in the current browser; H.264 MP4 is a practical first choice for Safari. The file must be under 200 MB and the decoded frame under 24 megapixels. A saved frame is JPEG at its original dimensions. Browser seeking may land on the nearest decodable frame rather than an exact sub-frame timestamp. Playback/decoder support varies by browser and OS. The selected video is not uploaded; its object URL is revoked when replaced or the tool is closed.

To use it, choose one local video, wait for its duration and preview to load, set the frame time in seconds or move the timeline, choose **Capture this frame**, and download the JPEG. If the video errors or never reports a duration, the browser could not decode its video track. The 200 MB and 24-megapixel limits reduce avoidable memory pressure but cannot guarantee success on every device.

## Privacy and file handling

PDF editing uses `pdf-lib`; PDF page rendering uses Mozilla PDF.js; QR generation uses `qrcode`; and selected page images are packaged with JSZip. Video still-image extraction uses the browser's built-in video element and canvas, with no additional dependency. PDF.js is Apache-2.0 licensed; the QR and ZIP packages are MIT licensed. These libraries are bundled for static hosting and run in the visitor's browser. The app does not send selected file contents to a server, save them to localStorage, or collect analytics or personal information. Text counters and calculators also run locally in the current tab. Temporary source and preview object URLs are revoked when cleared or replaced. Files occupy browser memory while processing and previewing; discard the preview or close the tab when finished to release that memory promptly. Cancellation is checked between files and PDF pages, and during video decode/seek; a single PDF page render, PDF encoding operation, or browser canvas encode may temporarily block the page before the next cancellation check.

The app loads its frontend assets from GitHub Pages and uses system fonts. It makes no third-party runtime requests. Some larger tool code is lazy-loaded from GitHub Pages when first used; the app has no service worker or guaranteed offline mode.

## Requirements and local development

- Node.js 24 LTS (npm is included)
- Git

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. The development server runs on your computer while you use it locally; the published GitHub Pages site is static and does not depend on your Mac.

## Build and preview

```sh
npm run build
npm run preview
```

The production output is written to `dist/`. The build runs the TypeScript project check and Vite bundling. No separate automated test suite is configured.

## GitHub Pages deployment

The repository deploy workflow builds the static site on GitHub-hosted runners and publishes it to GitHub Pages. The Vite base path is `/MarketBrief/` when `GITHUB_PAGES=true`, matching `https://venriquem.github.io/MarketBrief/`. In repository settings, choose **GitHub Actions** as the Pages deployment source. No personal computer or backend serves the published site.

Deployment happens on pushes to `main` or manual workflow dispatch. This project does not use scheduled jobs, news feeds, AI services, analytics, or runtime file uploads.

## Adding tools

The tool directory is defined in `src/data/tools.ts`, IDs and processing option types are in `src/types/tool.ts`, and file operations live in `src/lib/processing.ts`. The responsive shell is in `src/App.tsx`, with its visual system in `src/styles.css`. To add a tool, register its metadata, add its controls to the toolkit UI, and implement the operation in `processFiles`. As the collection grows, tool workspaces can move into `src/components/` or dedicated tool pages. Keep browser memory limits, type validation, clear errors, and on-device processing explicit for every new tool.
