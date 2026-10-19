// 야장 결함 마킹 - 오프라인 캐시
// 앱을 업데이트하면 아래 버전 이름을 바꿔 주세요 (예: yajang-v23-ipad-2)
const CACHE = 'yajang-v23-ipad-1'; // IPAD-V23-PWA: v23 앱 (pwa/는 yajang-v10)
const SHELL = [
  './', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    // 화면(index.html)은 인터넷이 되면 최신 버전, 안 되면 저장된 버전
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // 나머지(엑셀 모듈, 글꼴, 아이콘)는 저장된 것 먼저
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
