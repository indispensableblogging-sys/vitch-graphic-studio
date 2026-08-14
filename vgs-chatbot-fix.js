import { getVgsTeamAvailability } from './vgs-presence.js?v=1';

(() => {
  if (!/dashboard\.html$/.test(location.pathname)) return;

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
  let online = false;
  let pendingService = '';
  let history = [];

  const styles = () => {
    if (document.getElementById('vgs-chatbot-fix-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-chatbot-fix-styles';
    style.textContent = `
      #vgs-chatbot-fix{position:fixed;right:18px;bottom:18px;width:min(410px,calc(100vw - 24px));height:min(680px,calc(100vh - 35px));background:#111;color:#fff;border:1px solid ${GOLD};border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.65);z-index:100003;display:none;overflow:hidden;font-family:Arial,sans-serif}
      #vgs-chatbot-fix.open{display:flex;flex-direction:column}
      #vgs-chatbot-fix-head{background:${GOLD};color:#111;padding:15px 16px;display:flex;align-items:center;justify-content:space-between}
      #vgs-chatbot-fix-head strong{display:block;font-size:16px}
      #vgs-chatbot-fix-status{font-size:11px;margin-top:3px;opacity:.8}
      #vgs-chatbot-fix-close{border:0;background:transparent;color:#111;font-size:24px;cursor:pointer}
      #vgs-chatbot-fix-messages{flex:1;overflow-y:auto;padding:16px;background:#101010}
      .vgs-fix-msg{max-width:86%;padding:11px 13px;border-radius:15px;margin:0 0 10px;line-height:1.45;font-size:14px;white-space:pre-wrap}
      .vgs-fix-msg.bot{background:#222;border:1px solid rgba(212,175,55,.25);border-bottom-left-radius:5px}
      .vgs-fix-msg.user{margin-left:auto;background:${GOLD};color:#111;border-bottom-right-radius:5px}
      #vgs-chatbot-fix-quick{display:flex;gap:7px;overflow-x:auto;padding:9px 12px;border-top:1px solid #292929;background:#151515}
      .vgs-fix-quick{white-space:nowrap;border:1px solid ${GOLD};background:#1d1d1d;color:#fff;border-radius:999px;padding:8px 11px;font-size:12px;cursor:pointer}
      #vgs-chatbot-fix-form{display:flex;gap:8px;padding:10px;border-top:1px solid #292929;background:#151515}
      #vgs-chatbot-fix-input{flex:1;min-width:0;resize:none;height:44px;padding:11px;border-radius:12px;border:1px solid #555;background:#202020;color:#fff;font:inherit;box-sizing:border-box}
      #vgs-chatbot-fix-send{width:48px;border:0;border-radius:12px;background:${GOLD};color:#111;font-size:18px;font-weight:800;cursor:pointer}
      #vgs-chatbot-fix-toggle{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border:0;border-radius:50%;background:${GOLD};color:#111;font-size:25px;z-index:100004;cursor:pointer;box-shadow:0 10px 28px rgba(212,175,55,.4)}
      @media(max-width:600px){#vgs-chatbot-fix{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:18px}}
    `;
    document.head.appendChild(style);
  };

  const add = (text, who='bot') => {
    const box = document.getElementById('vgs-chatbot-fix-messages');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `vgs-fix-msg ${who}`;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    history.push({who,text});
  };

  const refresh = async () => {
    try {
      const r = await getVgsTeamAvailability();
      online = !!r?.online;
      const s = document.getElementById('vgs-chatbot-fix-status');
      if (s) s.textContent = online ? '🟢 A VGS team member is online' : '🤖 Team away • AI is handling clients';
    } catch (_) {}
  };

  const serviceFor = text => {
    const lower = text.toLowerCase();
    const aliases = {logo:'Logo Design',logos:'Logo Design',branding:'Brand Identity',brand:'Brand Identity',website:'Website Design',web:'Website Design',app:'Mobile App',application:'Mobile App',video:'Video Editing',photo:'Photo Editing',printing:'Printing',print:'Printing'};
    return services.find(s => lower.includes(s.toLowerCase())) || Object.keys(aliases).reduce((found,k)=>found|| (lower.includes(k)?aliases[k]:''),'');
  };

  const respond = async raw => {
    const text = raw.trim();
    if (!text) return;
    add(text,'user');
    const lower = text.toLowerCase();
    const service = serviceFor(text);

    // Important: detect the client's actual request before checking for a greeting.
    if (service) {
      pendingService = service;
      add(`Great — ${service} sounds like a good fit. 🎨\n\n${prompts[service]}\n\nGive me those details and I’ll keep building the brief with you.`);
      return;
    }

    if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!.,\s]*$/i.test(text)) {
      add(`Hi! 👋🏽 I’m the VGS AI receptionist. ${online ? 'Our team is online too if you need a human.' : 'The team is currently away, so I’ll take care of you.'}\n\nWhat would you like to create today?`);
      return;
    }

    if (/what (services|do you offer)|services|what can you do/.test(lower)) {
      add('We can help with:\n\n🎨 Logo Design\n🌐 Website Design\n📱 Mobile App\n✨ Brand Identity\n🎬 Video Editing\n📸 Photo Editing\n🖨️ Printing\n\nTell me what you need and I’ll guide you from the idea to the project brief.');
      return;
    }

    if (/price|cost|quote|budget|how much|pricing/.test(lower)) {
      add('Absolutely. 💰 Tell me the service you need and what you want done. I’ll help you choose a suitable package and prepare the details for a quote.');
      return;
    }

    if (/book|booking|appointment|schedule/.test(lower)) {
      add('Sure 👍🏽 Tell me the service you want, what you’re creating, and your preferred deadline. I’ll help prepare the booking details.');
      return;
    }

    if (/human|person|staff|designer|team|agent/.test(lower)) {
      await refresh();
      add(online ? '🟢 A VGS team member is online. You can request human support now.' : 'Nobody from the VGS team is online right now, but you’re not stuck — I can collect your project details for the team.');
      return;
    }

    if (pendingService && history.filter(x => x.who === 'user').length > 1) {
      add(`Perfect. I’ve noted that this is for ${pendingService}. 👍🏽\n\nNow tell me who the project is for, the style you want, your deadline, and your approximate budget if you have one.`);
      return;
    }

    add(`I’m with you. 😊 ${pendingService ? `Since we’re working on ${pendingService}, tell me a little more about the project and I’ll keep building the brief.` : 'Tell me what you want to create, and I’ll help you shape the idea into a project brief.'}`);
  };

  const build = () => {
    styles();
    // Remove the previous chatbot so it cannot answer the same message a second time.
    document.getElementById('vgs-chatbot')?.remove();
    document.getElementById('vgs-chatbot-toggle')?.remove();
    document.getElementById('ai-chat')?.remove();
    document.getElementById('ai-toggle')?.remove();
    if (document.getElementById('vgs-chatbot-fix')) return;

    const chat = document.createElement('section');
    chat.id = 'vgs-chatbot-fix';
    chat.innerHTML = `<div id="vgs-chatbot-fix-head"><div><strong>🤖 VGS AI Receptionist</strong><div id="vgs-chatbot-fix-status">Checking team availability…</div></div><button id="vgs-chatbot-fix-close" type="button">×</button></div><div id="vgs-chatbot-fix-messages"></div><div id="vgs-chatbot-fix-quick"><button class="vgs-fix-quick" data-vgs-fix="What services do you offer?">Services</button><button class="vgs-fix-quick" data-vgs-fix="How much does it cost?">Pricing</button><button class="vgs-fix-quick" data-vgs-fix="I want to book a service">Book</button><button class="vgs-fix-quick" data-vgs-fix="I want human support">Human support</button></div><form id="vgs-chatbot-fix-form"><textarea id="vgs-chatbot-fix-input" placeholder="Type your message…"></textarea><button id="vgs-chatbot-fix-send" type="submit">➤</button></form>`;
    document.body.appendChild(chat);

    const toggle = document.createElement('button');
    toggle.id = 'vgs-chatbot-fix-toggle';
    toggle.type = 'button';
    toggle.textContent = '🤖';
    document.body.appendChild(toggle);

    toggle.onclick = async () => {
      chat.classList.add('open');
      toggle.style.display = 'none';
      await refresh();
      if (!history.length) add(`Welcome to Vitch Graphic Studio! 👋🏽\n\nI’m your AI receptionist. Tell me what you want to create and I’ll help you through it. ${online ? 'A VGS team member is also online.' : 'The team is currently away, so I can take care of you.'}`);
    };
    document.getElementById('vgs-chatbot-fix-close').onclick = () => { chat.classList.remove('open'); toggle.style.display = 'block'; };
    document.getElementById('vgs-chatbot-fix-form').addEventListener('submit', async e => { e.preventDefault(); const input = document.getElementById('vgs-chatbot-fix-input'); const value = input.value; input.value=''; await respond(value); });
    document.getElementById('vgs-chatbot-fix-quick').addEventListener('click', e => { const b=e.target.closest('[data-vgs-fix]'); if(b) respond(b.dataset.vgsFix); });
    refresh();
    setInterval(refresh,15000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, {once:true}); else build();
})();
