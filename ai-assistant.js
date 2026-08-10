(() => {
  const GOLD = '#d4af37';

  const injectStyles = () => {
    if (document.getElementById('vgs-ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-ai-styles';
    style.textContent = `
      #ai-chat{position:fixed;right:20px;bottom:20px;width:min(380px,calc(100vw - 30px));background:#151515;color:#fff;border:1px solid ${GOLD};border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 25px rgba(212,175,55,.18);z-index:99999;overflow:hidden;font-family:Arial,sans-serif;display:none}
      #ai-chat.active{display:block}
      #ai-header{background:${GOLD};color:#111;font-weight:800;padding:17px 20px;text-align:center;font-size:16px}
      #ai-body{padding:20px;max-height:65vh;overflow-y:auto}
      #ai-message p{margin:0 0 10px;line-height:1.5}
      #ai-message h3{margin:0 0 10px;color:${GOLD}}
      #ai-options{display:grid;gap:9px;margin-top:15px}
      .ai-option,.vgs-ai-btn{width:100%;border:1px solid ${GOLD};background:#202020;color:#fff;border-radius:10px;padding:12px 14px;cursor:pointer;font-size:14px;transition:.2s}
      .ai-option:hover,.vgs-ai-btn:hover{background:${GOLD};color:#111;transform:translateY(-1px)}
      #ai-toggle{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border:0;border-radius:50%;background:${GOLD};color:#111;font-size:24px;cursor:pointer;z-index:100000;box-shadow:0 8px 25px rgba(212,175,55,.35)}
      #ai-chat.active + #ai-toggle{right:20px;bottom:calc(20px + min(65vh,520px) + 10px)}
      .vgs-ai-form{display:grid;gap:10px;margin-top:15px}
      .vgs-ai-form input,.vgs-ai-form textarea,.vgs-ai-form select{width:100%;padding:12px;border:1px solid #555;border-radius:9px;background:#202020;color:#fff;box-sizing:border-box;font:inherit}
      .vgs-ai-form textarea{min-height:90px;resize:vertical}
      .vgs-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:5px}
      .vgs-ai-small{font-size:12px;color:#bbb;margin-top:8px}
      @media(max-width:600px){#ai-chat{right:10px;bottom:10px;width:calc(100vw - 20px)}#ai-toggle{right:15px;bottom:15px}#ai-chat.active + #ai-toggle{right:15px;bottom:15px;transform:translateY(-72px)}}
    `;
    document.head.appendChild(style);
  };

  const buildMarkupIfMissing = () => {
    let chat = document.getElementById('ai-chat');
    if (!chat) {
      chat = document.createElement('div');
      chat.id = 'ai-chat';
      chat.innerHTML = `
        <div id="ai-header">🤖 VGS AI Assistant</div>
        <div id="ai-body">
          <div id="ai-message"></div>
          <div id="ai-options"></div>
        </div>`;
      document.body.appendChild(chat);
    }

    let toggle = document.getElementById('ai-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'ai-toggle';
      toggle.type = 'button';
      toggle.textContent = '🤖';
      document.body.appendChild(toggle);
    }

    return {chat, toggle};
  };

  const setWelcome = () => {
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    if (!message || !options) return;
    message.innerHTML = `
      <p>Hello 👋</p>
      <p>Welcome to <strong>Vitch Graphic Studio</strong>.</p>
      <p>I can help you choose a service or prepare a project request for you.</p>`;
    options.innerHTML = `
      <button class="ai-option" data-ai-action="service" data-service="Logo Design">🎨 Logo Design</button>
      <button class="ai-option" data-ai-action="service" data-service="Website Design">🌐 Website Design</button>
      <button class="ai-option" data-ai-action="service" data-service="Mobile App">📱 Mobile App</button>
      <button class="ai-option" data-ai-action="service" data-service="Photo Editing">📸 Photo Editing</button>
      <button class="ai-option" data-ai-action="quote">💰 Get a Quote</button>
      <button class="ai-option" data-ai-action="whatsapp">💬 WhatsApp Support</button>`;
  };

  const showService = (service) => {
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    const descriptions = {
      'Logo Design':'Premium logos and brand identity systems for businesses, churches, restaurants, fashion brands and startups.',
      'Website Design':'Modern responsive websites, landing pages and business sites with premium UI and mobile support.',
      'Mobile App':'Custom mobile-app concepts and development planning for Android and iOS business needs.',
      'Photo Editing':'Professional retouching, cinematic edits, background work and studio-quality photo enhancement.'
    };
    message.innerHTML = `<h3>${service}</h3><p>${descriptions[service] || 'Tell us what you need and we will help you plan it.'}</p><p>Would you like me to prepare a project request?</p>`;
    options.innerHTML = `
      <button class="ai-option" data-ai-action="quote" data-service="${service}">💰 Yes, prepare my request</button>
      <button class="ai-option" data-ai-action="home">↩️ Back to services</button>`;
  };

  const showQuoteForm = (prefilledService = '') => {
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    message.innerHTML = `<h3>💰 Project Request</h3><p>Give me a few details and I will prepare a WhatsApp-ready summary for you.</p>`;
    options.innerHTML = `
      <form class="vgs-ai-form" id="vgs-ai-form">
        <select id="vgs-service" required>
          <option value="">Select service</option>
          ${['Logo Design','Website Design','Mobile App','Photo Editing','Printing','Brand Identity','Video Editing','Other'].map(s => `<option ${s===prefilledService?'selected':''}>${s}</option>`).join('')}
        </select>
        <input id="vgs-name" type="text" placeholder="Your name" required>
        <input id="vgs-project" type="text" placeholder="Business / project name" required>
        <textarea id="vgs-details" placeholder="Tell us what you want..." required></textarea>
        <input id="vgs-budget" type="text" placeholder="Budget (optional)">
        <input id="vgs-deadline" type="text" placeholder="Deadline (optional)">
        <div class="vgs-ai-actions">
          <button class="vgs-ai-btn" type="submit">📲 Send to WhatsApp</button>
          <button class="vgs-ai-btn" type="button" data-ai-action="home">↩️ Back</button>
        </div>
      </form>`;
  };

  const sendToWhatsApp = (form) => {
    const service = form.querySelector('#vgs-service').value;
    const name = form.querySelector('#vgs-name').value.trim();
    const project = form.querySelector('#vgs-project').value.trim();
    const details = form.querySelector('#vgs-details').value.trim();
    const budget = form.querySelector('#vgs-budget').value.trim() || 'Not specified';
    const deadline = form.querySelector('#vgs-deadline').value.trim() || 'Not specified';
    const text = `Hello Vitch Graphic Studio 👋%0A%0AI would like a project quote.%0A%0A*Service:* ${encodeURIComponent(service)}%0A*Name:* ${encodeURIComponent(name)}%0A*Project:* ${encodeURIComponent(project)}%0A*Details:* ${encodeURIComponent(details)}%0A*Budget:* ${encodeURIComponent(budget)}%0A*Deadline:* ${encodeURIComponent(deadline)}`;
    window.open(`https://wa.me/2348083336746?text=${text}`, '_blank');
  };

  const init = () => {
    injectStyles();
    const {chat, toggle} = buildMarkupIfMissing();
    setWelcome();

    toggle.onclick = () => chat.classList.toggle('active');

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-ai-action]');
      if (!button) return;
      const action = button.dataset.aiAction;
      if (action === 'home') setWelcome();
      if (action === 'service') showService(button.dataset.service || '');
      if (action === 'quote') showQuoteForm(button.dataset.service || '');
      if (action === 'whatsapp') window.open('https://wa.me/2348083336746', '_blank');
    });

    document.addEventListener('submit', (event) => {
      if (event.target.id !== 'vgs-ai-form') return;
      event.preventDefault();
      sendToWhatsApp(event.target);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
