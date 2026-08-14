import { getVgsTeamAvailability } from './vgs-presence.js?v=1';

(() => {
  const CHECK_MS = 15000;
  let lastOnline = null;

  const updateAssistant = async () => {
    try {
      const status = await getVgsTeamAvailability();
      if (status.online === lastOnline) return;
      lastOnline = status.online;

      const message = document.getElementById('ai-message');
      const options = document.getElementById('ai-options');
      const header = document.getElementById('ai-header');
      if (!message || !options) return;

      const current = message.innerHTML || '';
      if (!current.trim() || current.includes('Welcome to <strong>Vitch Graphic Studio</strong>')) {
        if (header) header.textContent = status.online ? '🤖 VGS AI Assistant • Team Online' : '🤖 VGS AI Assistant • Always Available';
        message.innerHTML = status.online
          ? `<p>Hello 👋</p><p>Welcome to <strong>Vitch Graphic Studio</strong>.</p><p>🟢 A VGS team member is currently available if you'd like human assistance.</p><p>I can still help you choose a service or prepare your project brief.</p>`
          : `<p>Hello 👋</p><p>Welcome to <strong>Vitch Graphic Studio</strong>.</p><p>🤖 Our team is currently away, so I’ll take care of you until someone is available.</p><p>I can help you choose a service or prepare your project brief.</p>`;

        if (status.online) {
          options.insertAdjacentHTML('afterbegin', '<button class="ai-option" data-ai-action="human-support">🟢 Request a VGS team member</button>');
        }
      } else if (header) {
        header.textContent = status.online ? '🤖 VGS AI Assistant • Team Online' : '🤖 VGS AI Assistant • Always Available';
      }
    } catch (error) {
      console.warn('VGS AI presence check failed:', error);
    }
  };

  const init = () => {
    const start = () => {
      updateAssistant();
      setInterval(updateAssistant, CHECK_MS);
    };
    if (document.getElementById('ai-chat')) start();
    else setTimeout(start, 1000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
