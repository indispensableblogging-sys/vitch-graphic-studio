(() => {
  if (!/admin\.html$/.test(location.pathname)) return;
  if (window.__VGS_ADMIN_RECEPTIONIST_BRIDGE__) return;
  window.__VGS_ADMIN_RECEPTIONIST_BRIDGE__ = true;

  // Keep the legacy admin assistant completely hidden and load the same
  // conversational receptionist used on the client dashboard.
  const style = document.createElement('style');
  style.id = 'vgs-admin-receptionist-bridge-style';
  style.textContent = '#ai-chat,#ai-toggle{display:none!important}';
  document.head.appendChild(style);

  const hideLegacy = () => {
    document.getElementById('ai-chat')?.style.setProperty('display','none','important');
    document.getElementById('ai-toggle')?.style.setProperty('display','none','important');
  };
  hideLegacy();
  new MutationObserver(hideLegacy).observe(document.documentElement,{childList:true,subtree:true});

  fetch('vgs-receptionist-v4.js?v=1', { cache: 'no-store' })
    .then(r => r.text())
    .then(code => {
      const patched = code.replace(
        "if (!/dashboard\\.html$/.test(location.pathname)) return;",
        "if (!/dashboard\\.html$|admin\\.html$/.test(location.pathname)) return;"
      );
      Function(patched)();
    })
    .catch(err => console.error('Could not load VGS receptionist', err));
})();
