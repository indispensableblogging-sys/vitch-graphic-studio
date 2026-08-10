(() => {
  const GOLD = '#d4af37';
  const DRAFT_KEY = 'vgs_ai_quote_draft_v2';

  const serviceData = {
    'Logo Design': {
      desc: 'Premium logo and visual identity design.',
      prompt: 'Tell us your brand name, style, colours and what the logo should communicate.',
      prices: { Basic: 5000, Standard: 15000, Premium: 35000 }
    },
    'Website Design': {
      desc: 'Responsive business websites and landing pages.',
      prompt: 'Tell us about the business, pages you need, features, and any website examples you like.',
      prices: { Basic: 15000, Standard: 35000, Premium: 75000 }
    },
    'Mobile App': {
      desc: 'Mobile app planning and development solutions.',
      prompt: 'Tell us what the app should do, who will use it, and the main features you need.',
      prices: { Basic: 30000, Standard: 80000, Premium: 150000 }
    },
    'Photo Editing': {
      desc: 'Professional retouching and creative photo enhancement.',
      prompt: 'Tell us how many photos you have and the type of editing you need.',
      prices: { Basic: 3000, Standard: 8000, Premium: 15000 }
    },
    'Printing': {
      desc: 'Professional print-ready designs and production support.',
      prompt: 'Tell us what you want printed, quantity, size and preferred material if known.',
      prices: { Basic: 5000, Standard: 15000, Premium: 35000 }
    },
    'Brand Identity': {
      desc: 'Complete branding systems for businesses and organizations.',
      prompt: 'Tell us your business name, industry, target audience and the brand materials you need.',
      prices: { Basic: 15000, Standard: 40000, Premium: 100000 }
    },
    'Video Editing': {
      desc: 'Social media videos, adverts and promotional content.',
      prompt: 'Tell us the video type, approximate duration, footage you have and the style you want.',
      prices: { Basic: 10000, Standard: 30000, Premium: 75000 }
    },
    Other: {
      desc: 'A custom creative request.',
      prompt: 'Describe the project clearly and we will recommend the best approach.',
      prices: { Basic: null, Standard: null, Premium: null }
    }
  };

  const injectStyles = () => {
    if (document.getElementById('vgs-ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-ai-styles';
    style.textContent = `
      #ai-chat{position:fixed;right:20px;bottom:20px;width:min(380px,calc(100vw - 30px));background:#151515;color:#fff;border:1px solid ${GOLD};border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 25px rgba(212,175,55,.18);z-index:99999;overflow:hidden;font-family:Arial,sans-serif;display:none}
      #ai-chat.active{display:block}
      #ai-header{background:${GOLD};color:#111;font-weight:800;padding:17px 20px;text-align:center;font-size:16px}
      #ai-body{padding:20px;max-height:72vh;overflow-y:auto}
      #ai-message p{margin:0 0 10px;line-height:1.5}
      #ai-message h3{margin:0 0 10px;color:${GOLD}}
      #ai-options{display:grid;gap:9px;margin-top:15px}
      .ai-option,.vgs-ai-btn{width:100%;border:1px solid ${GOLD};background:#202020;color:#fff;border-radius:10px;padding:12px 14px;cursor:pointer;font-size:14px;transition:.2s;box-sizing:border-box}
      .ai-option:hover,.vgs-ai-btn:hover{background:${GOLD};color:#111;transform:translateY(-1px)}
      #ai-toggle{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border:0;border-radius:50%;background:${GOLD};color:#111;font-size:24px;cursor:pointer;z-index:100000;box-shadow:0 8px 25px rgba(212,175,55,.35)}
      .vgs-ai-form{display:grid;gap:10px;margin-top:15px}
      .vgs-ai-form input,.vgs-ai-form textarea,.vgs-ai-form select{width:100%;padding:12px;border:1px solid #555;border-radius:9px;background:#202020;color:#fff;box-sizing:border-box;font:inherit}
      .vgs-ai-form textarea{min-height:100px;resize:vertical}
      .vgs-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:5px}
      .vgs-ai-small{font-size:12px;color:#bbb;margin:4px 0 0;line-height:1.4}
      .vgs-ai-estimate{border:1px solid ${GOLD};border-radius:10px;padding:12px;margin-top:4px;background:#1d1d1d}
      .vgs-ai-estimate strong{color:${GOLD}}
      .vgs-ai-summary{background:#1d1d1d;border:1px solid #555;border-radius:10px;padding:13px;line-height:1.55;font-size:13px}
      .vgs-ai-summary b{color:${GOLD}}
      @media(max-width:600px){#ai-chat{right:10px;bottom:10px;width:calc(100vw - 20px)}#ai-toggle{right:15px;bottom:15px}}
    `;
    document.head.appendChild(style);
  };

  const buildMarkupIfMissing = () => {
    let chat = document.getElementById('ai-chat');
    if (!chat) {
      chat = document.createElement('div');
      chat.id = 'ai-chat';
      chat.innerHTML = `<div id="ai-header">🤖 VGS AI Assistant</div><div id="ai-body"><div id="ai-message"></div><div id="ai-options"></div></div>`;
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
    return { chat, toggle };
  };

  const saveDraft = (form) => {
    try {
      const data = {};
      form.querySelectorAll('input,textarea,select').forEach(el => { data[el.id] = el.value; });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (_) {}
  };

  const loadDraft = () => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch (_) { return {}; }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  };

  const money = (value) => value == null ? 'Custom quote' : `₦${value.toLocaleString()}`;

  const setWelcome = () => {
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    if (!message || !options) return;
    message.innerHTML = `<p>Hello 👋</p><p>Welcome to <strong>Vitch Graphic Studio</strong>.</p><p>I can help you choose a service or prepare a smart project brief for you.</p>`;
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
    const data = serviceData[service] || serviceData.Other;
    message.innerHTML = `<h3>${service}</h3><p>${data.desc}</p><p>${data.prompt}</p><p>Would you like me to build the project brief for you?</p>`;
    options.innerHTML = `<button class="ai-option" data-ai-action="quote" data-service="${service}">💰 Yes, prepare my brief</button><button class="ai-option" data-ai-action="home">↩️ Back to services</button>`;
  };

  const showQuoteForm = (prefilledService = '') => {
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    const draft = loadDraft();
    const selected = prefilledService || draft['vgs-service'] || '';
    message.innerHTML = `<h3>💰 Smart Project Request</h3><p>Give me the details below. I will build a clean project brief and prepare it for WhatsApp.</p>`;
    options.innerHTML = `
      <form class="vgs-ai-form" id="vgs-ai-form">
        <select id="vgs-service" required><option value="">Select service</option>${Object.keys(serviceData).map(s => `<option value="${s}" ${s===selected?'selected':''}>${s}</option>`).join('')}</select>
        <div id="vgs-service-help" class="vgs-ai-small"></div>
        <input id="vgs-name" type="text" placeholder="Your name" value="${escapeHtml(draft['vgs-name'] || '')}" required>
        <input id="vgs-project" type="text" placeholder="Business / project name" value="${escapeHtml(draft['vgs-project'] || '')}" required>
        <textarea id="vgs-details" placeholder="Tell us what you want..." required>${escapeHtml(draft['vgs-details'] || '')}</textarea>
        <select id="vgs-level"><option value="Basic">Basic</option><option value="Standard">Standard</option><option value="Premium">Premium</option></select>
        <div id="vgs-estimate" class="vgs-ai-estimate"></div>
        <input id="vgs-budget" type="text" placeholder="Your budget (optional)" value="${escapeHtml(draft['vgs-budget'] || '')}">
        <input id="vgs-deadline" type="text" placeholder="Deadline (optional)" value="${escapeHtml(draft['vgs-deadline'] || '')}">
        <div class="vgs-ai-actions"><button class="vgs-ai-btn" type="submit">📋 Review Brief</button><button class="vgs-ai-btn" type="button" data-ai-action="home">↩️ Back</button></div>
      </form>`;
    const form = document.getElementById('vgs-ai-form');
    const update = () => updateFormState(form);
    form.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', () => { saveDraft(form); update(); }));
    form.querySelectorAll('select').forEach(el => el.addEventListener('change', () => { saveDraft(form); update(); }));
    update();
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const updateFormState = (form) => {
    if (!form) return;
    const service = form.querySelector('#vgs-service').value;
    const level = form.querySelector('#vgs-level').value;
    const data = serviceData[service] || serviceData.Other;
    const help = form.querySelector('#vgs-service-help');
    const details = form.querySelector('#vgs-details');
    const estimate = form.querySelector('#vgs-estimate');
    help.textContent = service ? data.prompt : 'Select a service to get tailored questions and a budget guide.';
    details.placeholder = service ? data.prompt : 'Tell us what you want...';
    estimate.innerHTML = service ? `<strong>Budget guide:</strong> ${money(data.prices[level])}<div class="vgs-ai-small">This is only a starting guide. Final pricing is confirmed after reviewing your project.</div>` : '<strong>Budget guide:</strong> Select a service first.';
  };

  const reviewBrief = (form) => {
    const service = form.querySelector('#vgs-service').value;
    const name = form.querySelector('#vgs-name').value.trim();
    const project = form.querySelector('#vgs-project').value.trim();
    const details = form.querySelector('#vgs-details').value.trim();
    const level = form.querySelector('#vgs-level').value;
    const budget = form.querySelector('#vgs-budget').value.trim() || 'Not specified';
    const deadline = form.querySelector('#vgs-deadline').value.trim() || 'Not specified';
    const data = serviceData[service] || serviceData.Other;
    const estimate = money(data.prices[level]);
    const message = document.getElementById('ai-message');
    const options = document.getElementById('ai-options');
    message.innerHTML = `<h3>📋 Review Your Brief</h3><div class="vgs-ai-summary"><b>Service:</b> ${escapeHtml(service)}<br><b>Name:</b> ${escapeHtml(name)}<br><b>Project:</b> ${escapeHtml(project)}<br><b>Package:</b> ${escapeHtml(level)}<br><b>Details:</b> ${escapeHtml(details)}<br><b>Your budget:</b> ${escapeHtml(budget)}<br><b>Deadline:</b> ${escapeHtml(deadline)}<br><b>Budget guide:</b> ${estimate}</div>`;
    options.innerHTML = `<button class="ai-option" data-ai-action="send-brief">📲 Send Brief to WhatsApp</button><button class="ai-option" data-ai-action="edit-brief">✏️ Edit Brief</button><button class="ai-option" data-ai-action="home">↩️ Start Over</button>`;
    window.__vgsCurrentBrief = { service, name, project, details, level, budget, deadline, estimate };
  };

  const sendBrief = () => {
    const b = window.__vgsCurrentBrief;
    if (!b) return showQuoteForm();
    const text = `Hello Vitch Graphic Studio 👋\n\nI would like a project quote.\n\n*Service:* ${b.service}\n*Name:* ${b.name}\n*Project:* ${b.project}\n*Package:* ${b.level}\n*Details:* ${b.details}\n*My Budget:* ${b.budget}\n*Deadline:* ${b.deadline}\n*Budget Guide:* ${b.estimate}`;
    clearDraft();
    window.open(`https://wa.me/2348083336746?text=${encodeURIComponent(text)}`, '_blank');
  };

  const init = () => {
    injectStyles();
    const { chat, toggle } = buildMarkupIfMissing();
    setWelcome();
    toggle.onclick = () => chat.classList.toggle('active');

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-ai-action]');
      if (!button) return;
      const action = button.dataset.aiAction;
      if (action === 'home') setWelcome();
      if (action === 'service') showService(button.dataset.service || '');
      if (action === 'quote') showQuoteForm(button.dataset.service || '');
      if (action === 'edit-brief') showQuoteForm((window.__vgsCurrentBrief || {}).service || '');
      if (action === 'send-brief') sendBrief();
      if (action === 'whatsapp') window.open('https://wa.me/2348083336746', '_blank');
    });

    document.addEventListener('submit', (event) => {
      if (event.target.id !== 'vgs-ai-form') return;
      event.preventDefault();
      reviewBrief(event.target);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
