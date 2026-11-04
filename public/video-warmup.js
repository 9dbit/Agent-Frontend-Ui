/* Warm Soft Tech MP4s from the first page, before the detail route is opened. */
(() => {
  const paths = [
    '/assets/soft-tech/video/uno-luck-v2.mp4',
    '/assets/soft-tech/video/mahjong-wild-v1.mp4',
    '/assets/soft-tech/video/skygate-v1.mp4'
  ];
  const warmed = new Map();

  function attachReadyMedia() {
    document.querySelectorAll('video.original-video').forEach(video => {
      const source = video.querySelector('source[src]');
      if (!source) return;
      const originalPath = source.dataset.mediaPath || source.getAttribute('src');
      const media = warmed.get(originalPath);
      if (!media || !media.url) return;
      if (!video.paused && video.readyState >= 3 && video.currentTime > 0.25) return;
      if (source.src === media.url) return;
      source.dataset.mediaPath = originalPath;
      source.src = media.url;
      video.muted = true;
      video.load();
      video.play().catch(() => {});
    });
  }

  paths.forEach(path => {
    const media = { url: null, status: 'loading' };
    warmed.set(path, media);
    fetch(path, { cache: 'force-cache', credentials: 'same-origin' })
      .then(response => {
        if (!response.ok) throw new Error('Media fetch ' + response.status);
        return response.blob();
      })
      .then(blob => {
        media.url = URL.createObjectURL(blob);
        media.status = 'ready';
        attachReadyMedia();
      })
      .catch(() => { media.status = 'unavailable'; });
  });

  window.__softTechVideoWarmup = warmed;
  const observer = new MutationObserver(attachReadyMedia);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachReadyMedia, { once: true });
  } else attachReadyMedia();
})();
