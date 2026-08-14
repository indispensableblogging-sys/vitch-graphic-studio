import { supabase } from './vgs-auth.js?v=7';
import { getVgsTeamAvailability } from './vgs-presence.js?v=1';

(() => {
  if (!/dashboard\.html$/.test(location.pathname)) return;

  const GOLD = '#d4af37';
  const services = ['Logo Design','Website Design','Mobile App','Brand Identity','Video Editing','Photo Editing','Printing'];
  let history = [];
  let online = false;
  let pendingService = '';

  const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  const styles = () => {
    if (document.getElementById('vgs-chatbot-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-chatbot-styles';
    style.textContent = `
      #vgs-chatbot{position:fixed;right:18px;bottom:18px;width:min(410px,calc(100vw - 24px));height:min(680px,calc(100vh - 35px));background:#111;color:#fff;border:1px solid ${GOLD};border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.65);z-index:100001;display:none;overflow:hidden;font-family:Arial,sans-serif}
      #vgs-chatbot.open{display:flex;flex-direction:column}
      #vgs-chatbot-head{background:${GOLD};color:#111;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
      #vgs-chatbot-head strong{display:block;font-size:16px}
      #vgs-chatbot-status{font-size:11px;margin-top:3px;opacity:.8}
      #vgs-chatbot-close{border:0;background:transparent;color:#111;font-size:24px;cursor:pointer}
      #vgs-chatbot-messages{flex:1;overflow-y:auto;padding:16px;background:linear-gradient(#151515,#101010)}
      .vgs-msg{max-width:86%;padding:11px 13px;border-radius:15px;margin:0 0 10px;line-height:1.45;font-size:14px;white-space:pre-wrap}
      .vgs-msg.bot{background:#222;border:1px solid rgba(212,175,55,.25);border-bottom-left-radius:5px}
      .vgs-msg.user{margin-left:auto;background:${GOLD};color:#111;border-bottom-right-radius:5px}
      #vgs-chatbot-quick{display:flex;gap:7px;overflow-x:auto;padding:9px 12px;border-top:1px solid #292929;background:#151515}
      .vgs-quick{white-space:nowrap;border:1px solid ${GOLD};background:#1d1d1d;color:#fff;border-radius:999px;padding:8px 11px;font-size:12px;cursor:pointer}
      #vgs-chatbot-form{display:flex;gap:8px;padding:10px;border-top:1px solid #292929;background:#151515}
      #vgs-chatbot-input{flex:1;min-width:0;resize:none;height:44px;max-height:100px;padding:11px;border-radius:12px;border:1px solid #555;background:#202020;color:#fff;font:inherit;box-sizing:border-box}
      #vgs-chatbot-send{width:48px;border:0;border-radius:12px;background:${GOLD};color:#111;font-size:18px;font-weight:800;cursor:pointer}
      #vgs-chatbot-toggle{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border:0;border-radius:50%;background:${GOLD};color:#111;font-size:25px;z-index:100002;cursor:pointer;box-shadow:0 10px 28px rgba(212,175,55,.4)}
      @media(max-width:600px){#vgs-chatbot{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:18px}#vgs-chatbot-toggle{right:14px;bottom:14px}}
    `;
    document.head.appendChild(style);
  };

  const addMessage = (text, who='bot') => {
    const box = document.getElementById('vgs-chatbot-messages');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `vgs-msg ${who}`;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    history.push({who,text});
  };

  const statusText = () => online ? '🟢 A VGS team member is online' : '🤖 Team away • AI is handling clients';

  const refreshStatus = async () => {
    try {
      const result = await getVgsTeamAvailability();
      online = !!result?.online;
      const status = document.getElementById('vgs-chatbot-status');
      if (status) status.textContent = statusText();
    } catch (_) {}
  };

  const reply = async raw => {
    const text = raw.trim();
    if (!text) return;
    addMessage(text,'user');
    const lower = text.toLowerCase();

    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lower)) {
      addMessage(`Hi! 👋🏽 I’m the VGS AI receptionist. ${online ? 'Our team is currently online too.' : 'The team is currently away, so I’ll take care of you.'}\n\nWhat are you looking to create today?`);
      return;
    }

    const matched = services.find(s => lower.includes(s.toLowerCase()) || lower.includes(s.split(' ')[0].toLowerCase()));
    if (matched) {
      pendingService = matched;
      const prompts = {
        'Logo Design':'Tell me your brand name, the style you like, and what you want the logo to communicate.',
        'Website Design':'Tell me about your business, the pages you need, and any features you want.',
        'Mobile App':'Tell me what the app should do, who will use it, and the main features.',
        'Brand Identity':'Tell me your business name, industry, audience, and the brand materials you need.',
        'Video Editing':'Tell me the video type, approximate length, footage you have, and the style you want.',
        'Photo Editing':'Tell me how many photos you have and the type of editing you need.',
        'Printing':'Tell me what you want printed, quantity, size, and preferred material if known.'
      };
      addMessage(`Great choice — ${matched}. 🎨\n\n${prompts[matched]}\n\nI’ll turn your answers into a clean project brief.`);
      return;
    }

    if (/price|cost|quote|budget|how much|pricing/.test(lower)) {
      addMessage('Absolutely. I can help you work out a starting budget. Tell me the service you need and roughly what you want done. I’ll recommend a package, then the VGS team can confirm the final quote.');
      return;
    }

    if (/book|booking|appointment|schedule/.test(lower)) {
      addMessage('Sure 👍🏽 You can book a service from the dashboard using “Book a Service”. If you tell me what you need first, I can help you prepare the details for the booking.');
      return;
    }

    if (/human|person|staff|designer|team|agent/.test(lower)) {
      await refreshStatus();
      if (online) addMessage('🟢 A VGS team member is online. You can request human support now, and I’ll hand you over to the team.');
      else addMessage('Nobody from the VGS team is online right now. No worries — I’m here and can collect your project details so the team can pick it up when they return.');
      return;
    }

    if (/project|brief|need|want|design|create|make/.test(lower)) {
      addMessage(`Got it. Let’s turn that into a proper project brief. ${pendingService ? `We’re looking at ${pendingService}. ` : ''}Tell me:\n\n• What are you creating?\n• Who is it for?\n• What style do you want?\n• When do you need it?\n• Do you have a budget in mind?`);
      return;
    }

    addMessage('I’m listening. 😊 Tell me what you want to create, and I’ll help you shape the idea into a project brief. You can also ask about pricing, bookings, or human support.');
  };

  const build = () => {
    styles();
    const old = document.getElementById('ai-chat');
    if (old) old.style.display = 'none';
    const oldToggle = document.getElementById('ai-toggle');
    if (oldToggle) oldToggle.style.display = 'none';

    if (document.getElementById('vgs-chatbot')) return;
    const chat = document.createElement('section');
    chat.id = 'vgs-chatbot';
    chat.setAttribute('aria-label','VGS AI Client Chatbot');
    chat.innerHTML = `
      <div id="vgs-chatbot-head"><div><strong>🤖 VGS AI Receptionist</strong><div id="vgs-chatbot-status">Checking team availability…</div></div><button id="vgs-chatbot-close" type="button" aria-label="Close">×</button></div>
      <div id="vgs-chatbot-messages"></div>
      <div id="vgs-chatbot-quick"><button class="vgs-quick" data-vgs-chat="What services do you offer?">Services</button><button class="vgs-quick" data-vgs-chat="How much does it cost?">Pricing</button><button class="vgs-quick" data-vgs-chat="I want to book a service">Book</button><button class="vgs-quick" data-vgs-chat="I want human support">Human support</button></div>
      <form id="vgs-chatbot-form"><textarea id="vgs-chatbot-input" placeholder="Type your message…" aria-label="Message"></textarea><button id="vgs-chatbot-send" type="submit">➤</button></form>`;
    document.body.appendChild(chat);

    const toggle = document.createElement('button');
    toggle.id = 'vgs-chatbot-toggle';
    toggle.type = 'button';
    toggle.textContent = '🤖';
    toggle.setAttribute('aria-label','Open VGS AI receptionist');
    document.body.appendChild(toggle);

    toggle.onclick = async () => { chat.classList.add('open'); toggle.style.display='none'; await refreshStatus(); if (!history.length) addMessage(`Welcome to Vitch Graphic Studio! 👋🏽\n\nI’m your AI receptionist. I can help with ideas, services, project briefs, pricing and bookings. ${online ? 'Our team is online if you need a human.' : 'The team is currently away, so I can take care of you.'}`); };
    document.getElementById('vgs-chatbot-close').onclick = () => { chat.classList.remove('open'); toggle.style.display='block'; };
    document.getElementById('vgs-chatbot-form').addEventListener('submit', async e => { e.preventDefault(); const input=document.getElementById('vgs-chatbot-input'); const value=input.value; input.value=''; await reply(value); });
    document.getElementById('vgs-chatbot-messages').addEventListener('click', e => { const b=e.target.closest('[data-vgs-chat]'); if(b) reply(b.dataset.vgsChat); });
    refreshStatus();
    setInterval(refreshStatus,15000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, {once:true}); else build();
})();
