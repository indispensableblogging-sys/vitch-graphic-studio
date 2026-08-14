import { getVgsTeamAvailability } from './vgs-presence.js?v=1';

(() => {
  if (!/dashboard\.html$/.test(location.pathname)) return;
  // This legacy chatbot is kept for compatibility, but the fixed chatbot owns the UI.
  // Do not create a second chatbot: two responders were causing duplicate/repeating replies.
  if (document.getElementById('vgs-chatbot-fix') || document.querySelector('script[src*="vgs-chatbot-fix.js"]')) return;

  const GOLD = '#d4af37';
  const services = ['Logo Design','Website Design','Mobile App','Brand Identity','Video Editing','Photo Editing','Printing'];
  const prompts = {
    'Logo Design':'Tell me your brand name, the style you like, and what you want the logo to communicate.',
    'Website Design':'Tell me about your business, the pages you need, and any features you want.',
    'Mobile App':'Tell me what the app should do, who will use it, and the main features.',
    'Brand Identity':'Tell me your business name, industry, audience, and the brand materials you need.',
    'Video Editing':'Tell me the video type, approximate length, footage you have, and the style you want.',
    'Photo Editing':'Tell me how many photos you have and the type of editing you need.',
    'Printing':'Tell me what you want printed, quantity, size, and preferred material if known.'
  };
  let history = [];
  let pendingService = '';
  let online = false;

  const styles = () => {
    if (document.getElementById('vgs-chatbot-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-chatbot-styles';
    style.textContent = `#vgs-chatbot{position:fixed;right:18px;bottom:18px;width:min(410px,calc(100vw - 24px));height:min(680px,calc(100vh - 35px));background:#111;color:#fff;border:1px solid ${GOLD};border-radius:22px;z-index:100001;display:none;overflow:hidden;font-family:Arial,sans-serif}#vgs-chatbot.open{display:flex;flex-direction:column}#vgs-chatbot-head{background:${GOLD};color:#111;padding:15px 16px;display:flex;align-items:center;justify-content:space-between}#vgs-chatbot-messages{flex:1;overflow-y:auto;padding:16px}.vgs-msg{max-width:86%;padding:11px 13px;border-radius:15px;margin:0 0 10px;line-height:1.45;font-size:14px;white-space:pre-wrap}.vgs-msg.bot{background:#222}.vgs-msg.user{margin-left:auto;background:${GOLD};color:#111}#vgs-chatbot-quick{display:flex;gap:7px;overflow-x:auto;padding:9px 12px;border-top:1px solid #292929}.vgs-quick{white-space:nowrap;border:1px solid ${GOLD};background:#1d1d1d;color:#fff;border-radius:999px;padding:8px 11px;font-size:12px}#vgs-chatbot-form{display:flex;gap:8px;padding:10px;border-top:1px solid #292929}#vgs-chatbot-input{flex:1;height:44px;padding:11px;border-radius:12px;border:1px solid #555;background:#202020;color:#fff}#vgs-chatbot-send{width:48px;border:0;border-radius:12px;background:${GOLD};font-weight:800}#vgs-chatbot-toggle{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border:0;border-radius:50%;background:${GOLD};font-size:25px;z-index:100002}`;
    document.head.appendChild(style);
  };

  const add = (text, who='bot') => {
    const box = document.getElementById('vgs-chatbot-messages');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `vgs-msg ${who}`;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    history.push({who,text});
  };

  const refresh = async () => {
    try {
      const r = await getVgsTeamAvailability();
      online = !!r?.online;
      const s = document.getElementById('vgs-chatbot-status');
      if (s) s.textContent = online ? '🟢 A VGS team member is online' : '🤖 Team away • AI is handling clients';
    } catch (_) {}
  };

  const findService = text => {
    const lower = text.toLowerCase();
    return services.find(s => lower.includes(s.toLowerCase()));
  };

  const explicitNewService = text => /\b(i need|i want|i would like|i'd like|looking for|switch to|change to|instead|book)\b/i.test(text) && !!findService(text);

  const reply = async raw => {
    const text = raw.trim();
    if (!text) return;
    add(text,'user');
    const lower = text.toLowerCase();

    // Critical rule: after a service is selected, the next client message is project
    // information. Never reinterpret words like "brand" or "logo" inside that answer
    // as a new service request.
    if (pendingService && !explicitNewService(text)) {
      add(`Perfect — I’ve got that for your ${pendingService} project. 👍🏽\n\nLet’s keep building the brief. Tell me who the project is for, your preferred deadline, and any examples or references you like. If you’re unsure, just say so and I’ll help you decide.`);
      return;
    }

    if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!.,\s]*$/i.test(text)) {
      add(`Hi! 👋🏽 I’m the VGS AI receptionist. ${online ? 'Our team is currently online too.' : 'The team is currently away, so I’ll take care of you.'}\n\nWhat are you looking to create today?`);
      return;
    }

    const matched = findService(text);
    if (matched) {
      pendingService = matched;
      add(`Great — ${matched} sounds like a good fit. 🎨\n\n${prompts[matched]}\n\nGive me those details and I’ll keep building the brief with you.`);
      return;
    }

    if (/price|cost|quote|budget|how much|pricing/.test(lower)) {
      add('Absolutely. 💰 Tell me the service you need and roughly what you want done. I’ll help prepare the details for a quote.');
      return;
    }
    if (/book|booking|appointment|schedule/.test(lower)) {
      add('Sure 👍🏽 Tell me the service you want, what you’re creating, and your preferred deadline. I’ll help prepare the booking details.');
      return;
    }
    if (/human|person|staff|designer|team|agent/.test(lower)) {
      await refresh();
      add(online ? '🟢 A VGS team member is online. You can request human support now.' : 'Nobody from the VGS team is online right now, but I can collect your project details for the team.');
      return;
    }
    add(`I’m listening. 😊 ${pendingService ? `We’re working on ${pendingService}. Tell me more about the project and I’ll keep building the brief.` : 'Tell me what you want to create, and I’ll help shape the idea into a project brief.'}`);
  };

  const build = () => {
    if (document.getElementById('vgs-chatbot-fix')) return;
    styles();
    document.getElementById('ai-chat')?.remove();
    document.getElementById('ai-toggle')?.remove();
    if (document.getElementById('vgs-chatbot')) return;
    const chat = document.createElement('section');
    chat.id = 'vgs-chatbot';
    chat.innerHTML = `<div id="vgs-chatbot-head"><div><strong>🤖 VGS AI Receptionist</strong><div id="vgs-chatbot-status">Checking team availability…</div></div><button id="vgs-chatbot-close" type="button">×</button></div><div id="vgs-chatbot-messages"></div><div id="vgs-chatbot-quick"><button class="vgs-quick" data-vgs-chat="What services do you offer?">Services</button><button class="vgs-quick" data-vgs-chat="How much does it cost?">Pricing</button><button class="vgs-quick" data-vgs-chat="I want to book a service">Book</button><button class="vgs-quick" data-vgs-chat="I want human support">Human support</button></div><form id="vgs-chatbot-form"><textarea id="vgs-chatbot-input" placeholder="Type your message…"></textarea><button id="vgs-chatbot-send" type="submit">➤</button></form>`;
    document.body.appendChild(chat);
    const toggle = document.createElement('button');
    toggle.id = 'vgs-chatbot-toggle'; toggle.type='button'; toggle.textContent='🤖'; document.body.appendChild(toggle);
    toggle.onclick = async () => { chat.classList.add('open'); toggle.style.display='none'; await refresh(); if(!history.length) add(`Welcome to Vitch Graphic Studio! 👋🏽\n\nI’m your AI receptionist. ${online ? 'Our team is online if you need a human.' : 'The team is currently away, so I can take care of you.'}`); };
    document.getElementById('vgs-chatbot-close').onclick=()=>{chat.classList.remove('open');toggle.style.display='block';};
    document.getElementById('vgs-chatbot-form').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('vgs-chatbot-input');const v=i.value;i.value='';reply(v);});
    document.getElementById('vgs-chatbot-quick').addEventListener('click',e=>{const b=e.target.closest('[data-vgs-chat]');if(b)reply(b.dataset.vgsChat);});
    refresh(); setInterval(refresh,15000);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build,{once:true}); else build();
})();
