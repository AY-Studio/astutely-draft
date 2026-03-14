(function () {
  if (localStorage.getItem('cookie-consent')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div class="cb-inner">
      <p>We use cookies to understand how our site is used and to improve your experience. Read our <a href="/privacy.html">Privacy Policy</a>.</p>
      <div class="cb-actions">
        <button id="cb-accept" class="cb-btn cb-btn--primary">Accept</button>
        <button id="cb-decline" class="cb-btn cb-btn--ghost">Decline</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #cookie-banner {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      width: calc(100% - 3rem);
      max-width: 680px;
      background: #0f1b2d;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
      font-family: inherit;
      animation: cb-slide-up 0.3s ease;
    }
    @keyframes cb-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(12px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .cb-inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.1rem 1.5rem;
      flex-wrap: wrap;
    }
    .cb-inner p {
      flex: 1;
      font-size: 0.82rem;
      line-height: 1.6;
      color: rgba(255,255,255,0.75);
      margin: 0;
    }
    .cb-inner a {
      color: #fff;
      text-decoration: underline;
    }
    .cb-actions {
      display: flex;
      gap: 0.6rem;
      flex-shrink: 0;
    }
    .cb-btn {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      padding: 0.55rem 1.1rem;
      transition: opacity 0.15s;
    }
    .cb-btn:hover { opacity: 0.85; }
    .cb-btn--primary {
      background: #fff;
      color: #0f1b2d;
    }
    .cb-btn--ghost {
      background: transparent;
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.2);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(banner);

  function dismiss(choice) {
    localStorage.setItem('cookie-consent', choice);
    banner.style.transition = 'opacity 0.25s';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 300);
  }

  document.getElementById('cb-accept').addEventListener('click', () => dismiss('accepted'));
  document.getElementById('cb-decline').addEventListener('click', () => dismiss('declined'));
})();
