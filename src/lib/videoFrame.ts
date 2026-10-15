import type { ProcessedFile } from '../types/tool';

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_FRAME_PIXELS = 24_000_000;

function waitFor(video: HTMLVideoElement, eventName: 'loadedmetadata' | 'loadeddata' | 'seeked', signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, done);
      video.removeEventListener('error', failed);
      signal?.removeEventListener('abort', cancelled);
    };
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error('This browser could not decode the selected video. Try an MP4 with H.264 video, or another video your browser can play.')); };
    const cancelled = () => { cleanup(); reject(new DOMException('Processing cancelled.', 'AbortError')); };
    video.addEventListener(eventName, done, { once: true });
    video.addEventListener('error', failed, { once: true });
    signal?.addEventListener('abort', cancelled, { once: true });
    if (signal?.aborted) cancelled();
  });
}

export async function videoFrameToJpeg(file: File, timeSeconds: number, onProgress: (message: string) => void, signal?: AbortSignal): Promise<ProcessedFile> {
  if (!file.size) throw new Error('This video file is empty.');
  if (file.size > MAX_VIDEO_BYTES) throw new Error('Videos must be 200 MB or smaller for this on-device tool. Large videos may exceed available browser memory.');
  const supportedContainer = /\.(mp4|m4v|mov|webm)$/i.test(file.name) || ['video/mp4', 'video/x-m4v', 'video/quicktime', 'video/webm'].includes(file.type.toLowerCase());
  if (!supportedContainer) throw new Error('Choose an MP4, M4V, MOV, or WebM video file. The browser must also be able to decode its video codec.');

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  let loaded = false;
  try {
    onProgress('Opening video locally…');
    const metadataReady = waitFor(video, 'loadedmetadata', signal);
    video.src = url;
    video.load();
    await metadataReady;
    loaded = true;
    if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) throw new Error('No playable video frames were found. The file may be corrupt, audio-only, or use an unsupported codec.');
    const pixels = video.videoWidth * video.videoHeight;
    if (pixels > MAX_FRAME_PIXELS) throw new Error('This video frame is larger than 24 megapixels. Try a lower-resolution copy to avoid running out of memory.');

    const targetTime = Math.min(Math.max(0, timeSeconds), Math.max(0, video.duration - 0.05));
    onProgress(`Seeking to ${targetTime.toFixed(1)} seconds…`);
    if (Math.abs(video.currentTime - targetTime) > 0.02) {
      const seeked = waitFor(video, 'seeked', signal);
      video.currentTime = targetTime;
      await seeked;
    } else if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      const frameReady = waitFor(video, 'loadeddata', signal);
      video.currentTime = targetTime;
      await frameReady;
    }
    if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError');
    onProgress('Creating JPEG frame…');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not create an image canvas.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(image => image ? resolve(image) : reject(new Error('The browser could not encode this video frame.')), 'image/jpeg', 0.92));
    if (signal?.aborted) throw new DOMException('Processing cancelled.', 'AbortError');
    const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || 'video';
    return { blob, filename: `${stem}-frame-${targetTime.toFixed(1)}s.jpg` };
  } catch (problem) {
    if (problem instanceof DOMException && problem.name === 'AbortError') throw problem;
    if (problem instanceof Error) throw problem;
    throw new Error(loaded ? 'Could not capture a still image from this video.' : 'This browser could not open this video file.');
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    canvas.width = 0;
    canvas.height = 0;
    URL.revokeObjectURL(url);
  }
}
