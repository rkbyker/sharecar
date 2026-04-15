// Sharecar PWA bootstrap
// Регистрирует Service Worker и добавляет мета-теги динамически

(function () {
  'use strict';

  // ── 1. Регистрация Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[Sharecar SW] registered, scope:', reg.scope);
        })
        .catch(function (err) {
          console.warn('[Sharecar SW] registration failed:', err);
        });
    });
  }

  // ── 2. Добавить apple-touch-icon если отсутствует ──
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    var link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = '/icons/icon-192.png';
    document.head.appendChild(link);
  }

  // ── 3. Добавить manifest если отсутствует ──
  if (!document.querySelector('link[rel="manifest"]')) {
    var mlink = document.createElement('link');
    mlink.rel = 'manifest';
    mlink.href = '/manifest.json';
    document.head.appendChild(mlink);
  }

  // ── 4. Apple PWA мета ──
  var metas = {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Sharecar'
  };
  Object.keys(metas).forEach(function (name) {
    if (!document.querySelector('meta[name="' + name + '"]')) {
      var m = document.createElement('meta');
      m.name = name;
      m.content = metas[name];
      document.head.appendChild(m);
    }
  });

  // ── 5. Баннер «Установить приложение» (Android Chrome) ──
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    // Не показывать, если уже установлено или закрыто ранее
    if (localStorage.getItem('shercar_pwa_dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = [
      '<div style="display:flex;align-items:center;gap:12px;max-width:430px;margin:0 auto;">',
      '  <img src="/icons/icon-192.png" style="width:40px;height:40px;border-radius:10px;flex-shrink:0;" alt="Sharecar">',
      '  <div style="flex:1;min-width:0;">',
      '    <div style="font-size:13px;font-weight:700;color:#f0f0f0;">Установить Sharecar</div>',
      '    <div style="font-size:11px;color:#999;margin-top:1px;">Добавить на главный экран</div>',
      '  </div>',
      '  <button id="pwa-install-btn" style="background:#e8c84a;color:#000;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit;">Установить</button>',
      '  <button id="pwa-dismiss-btn" style="background:none;border:none;color:#666;cursor:pointer;font-size:18px;padding:4px;line-height:1;">×</button>',
      '</div>'
    ].join('');
    banner.style.cssText = [
      'position:fixed;bottom:0;left:0;right:0;',
      'background:#1a1a1a;border-top:1px solid #2e2e2e;',
      'padding:12px 16px;z-index:10000;',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.4);',
      'animation:slideUpBanner 0.3s ease;'
    ].join('');

    // Анимация
    var style = document.createElement('style');
    style.textContent = '@keyframes slideUpBanner{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(style);

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', function () {
      banner.remove();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === 'accepted') {
            console.log('[Sharecar PWA] installed!');
          }
          deferredPrompt = null;
        });
      }
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', function () {
      banner.remove();
      localStorage.setItem('shercar_pwa_dismissed', '1');
    });
  }

  // ── 6. Инструкция для iOS (Safari не поддерживает beforeinstallprompt) ──
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  }
  function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  }

  if (isIOS() && !isInStandaloneMode() && !localStorage.getItem('shercar_ios_dismissed')) {
    // Показываем подсказку через 3 секунды после загрузки
    window.addEventListener('load', function () {
      setTimeout(showIOSBanner, 3000);
    });
  }

  function showIOSBanner() {
    var banner = document.createElement('div');
    banner.id = 'pwa-ios-banner';
    banner.innerHTML = [
      '<div style="max-width:430px;margin:0 auto;">',
      '  <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">',
      '    <img src="/icons/icon-192.png" style="width:36px;height:36px;border-radius:8px;" alt="Sharecar">',
      '    <div>',
      '      <div style="font-size:13px;font-weight:700;color:#f0f0f0;">Установить Sharecar</div>',
      '      <div style="font-size:11px;color:#999;">Добавьте на главный экран</div>',
      '    </div>',
      '    <button id="pwa-ios-close" style="margin-left:auto;background:none;border:none;color:#666;cursor:pointer;font-size:20px;padding:4px;">×</button>',
      '  </div>',
      '  <div style="font-size:12px;color:#aaa;line-height:1.8;">',
      '    Нажмите <strong style="color:#e8c84a;">􀈂</strong> (поделиться) внизу Safari →<br>',
      '    выберите <strong style="color:#f0f0f0;">«На экран Домой»</strong> → <strong style="color:#f0f0f0;">«Добавить»</strong>',
      '  </div>',
      '  <div style="margin-top:10px;text-align:center;font-size:24px;letter-spacing:4px;">',
      '    📤 → 🏠 → ✅',
      '  </div>',
      '</div>'
    ].join('');
    banner.style.cssText = [
      'position:fixed;bottom:0;left:0;right:0;',
      'background:#1a1a1a;border-top:1px solid #2e2e2e;border-radius:16px 16px 0 0;',
      'padding:16px;z-index:10000;',
      'box-shadow:0 -4px 24px rgba(0,0,0,0.5);',
      'animation:slideUpBanner 0.3s ease;'
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('pwa-ios-close').addEventListener('click', function () {
      banner.remove();
      localStorage.setItem('shercar_ios_dismissed', '1');
    });
  }

})();
