(() => {
  const slot = document.getElementById('opening-video');
  const config = window.OPENING_VIDEO || {};
  if (!slot || !String(config.url || '').trim()) return;
  let url;
  try { url = new URL(config.url, window.location.href); } catch { return; }
  if (!['https:', 'http:'].includes(url.protocol)) return;
  const host = url.hostname.replace(/^www\./, '');
  let id = '';
  if (host === 'youtu.be') id = url.pathname.split('/')[1] || '';
  if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    id = url.searchParams.get('v') || (/^\/(embed|shorts)\//.test(url.pathname) ? url.pathname.split('/')[2] : '');
  }
  let player;
  if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
    player = document.createElement('iframe');
    player.src = 'https://www.youtube-nocookie.com/embed/' + id;
    player.title = config.title || 'Vídeo de Artur Becker';
    player.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allowFullscreen = true;
  } else if (/\.mp4$/i.test(url.pathname)) {
    player = document.createElement('video');
    player.src = url.href;
    player.controls = true;
    player.playsInline = true;
    player.preload = 'metadata';
    player.setAttribute('aria-label', config.title || 'Vídeo de Artur Becker');
  } else { return; }
  player.width = 1280;
  player.height = 720;
  player.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:contain';
  const frame = document.createElement('div');
  frame.className = 'opening-video-frame';
  frame.appendChild(player);
  slot.appendChild(frame);
  slot.hidden = false;
})();
