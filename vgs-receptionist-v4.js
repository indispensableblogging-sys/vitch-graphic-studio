(() => {
  if (!/dashboard\.html$/.test(location.pathname)) return;
  if (window.__VGS_RECEPTIONIST_V4__) return;
  window.__VGS_RECEPTIONIST_V4__ = true;

  const GOLD = '#d4af37';
  const STATE_KEY = 'vgs_receptionist_state_v4';
  const CHAT_KEY = 'vgs_receptionist_chat_v4';
  const WA_NUMBER = '2348083336746';

  const services = {
    'Logo Design': {
      aliases: ['logo', 'logos'],
      fields: [
        ['brand', 'What is the brand or business name?'],
        ['style', 'What style do you want — for example luxury, minimalist, streetwear, bold, or something else?'],
        ['colors', 'What colours would you like?'],
        ['goal', 'What should the logo communicate or make people feel?'],
        ['audience', 'Who is the logo mainly for?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    'Website Design': {
      aliases: ['website', 'web site', 'web'],
      fields: [
        ['business', 'What is the business or website name?'],
        ['pages', 'Which pages do you need?'],
        ['features', 'What important features should the website have?'],
        ['style', 'What visual style do you want?'],
        ['audience', 'Who is the website for?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    'Mobile App': {
      aliases: ['mobile app', 'app', 'application'],
      fields: [
        ['app', 'What should the app do?'],
        ['audience', 'Who will use the app?'],
        ['features', 'What are the most important features?'],
        ['platform', 'Should it be Android, iPhone, or both?'],
        ['style', 'What look and feel do you want?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    'Brand Identity': {
      aliases: ['brand identity', 'branding'],
      fields: [
        ['business', 'What is the business or brand name?'],
        ['industry', 'What industry is the business in?'],
        ['audience', 'Who is your target audience?'],
        ['materials', 'Which brand materials do you need?'],
        ['style', 'What style or personality should the brand have?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    'Video Editing': {
      aliases: ['video', 'videos'],
      fields: [
        ['videoType', 'What type of video are you creating?'],
        ['duration', 'About how long will the finished video be?'],
        ['footage', 'Do you already have the footage or other assets?'],
        ['style', 'What editing style do you want?'],
        ['platform', 'Where will the video be used?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    'Photo Editing': {
      aliases: ['photo', 'photos', 'photo editing', 'retouching'],
      fields: [
        ['quantity', 'How many photos need editing?'],
        ['editing', 'What kind of editing do you need?'],
        ['style', 'What final look do you want?'],
        ['references', 'Do you have reference images or examples you like?'],
        ['deadline', 'When would you like them completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    Printing: {
      aliases: ['printing', 'print'],
      fields: [
        ['item', 'What do you want printed?'],
        ['quantity', 'How many do you need?'],
        ['size', 'What size should they be?'],
        ['material', 'Do you have a preferred paper or material?'],
        ['deadline', 'When do you need them?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    },
    Other: {
      aliases: ['other', 'custom'],
      fields: [
        ['project', 'Tell me what you want to create and I’ll help shape it into a clear brief.'],
        ['audience', 'Who is it for?'],
        ['deadline', 'When would you like it completed?'],
        ['budget', 'Do you have a budget in mind?']
      ]
    }
  };

  const prices = {
    'Logo Design': [5000, 15000, 35000],
    'Website Design': [15000, 35000, 75000],
    'Mobile App': [30000, 80000, 150000],
    'Photo Editing': [3000, 8000, 15000],
    Printing: [5000, 15000, 35000],
    'Brand Identity': [15000, 40000, 100000],
    'Video Editing': [10000, 30000, 75000]
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = v => String(v ?? '').replace(/^[\s,:-]+|[\s.,!?]+$/g, '').trim();
  const money = n => `₦${Number(n).toLocaleString()}`;
  const defaultState = () => ({ service: '', answers: {}, lastField: '', complete: false });
  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  let state = { ...defaultState(), ...load(STATE_KEY, {}) };
  let history = load(CHAT_KEY, []);
  let busy = false;

  function addStyles() {
    if (document.getElementById('vgs-receptionist-v4-styles')) return;
    const s = document.createElement('style');
    s.id = 'vgs-receptionist-v4-styles';
    s.textContent = `
      #vgs-receptionist-v4{position:fixed;right:18px;bottom:18px;width:min(410px,calc(100vw - 24px));height:min(680px,calc(100vh - 35px));background:#111;color:#fff;border:1px solid ${GOLD};border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.65);z-index:100003;display:none;overflow:hidden;font-family:Arial,sans-serif}
      #vgs-receptionist-v4.open{display:flex;flex-direction:column}
      #vgs-receptionist-v4 .head{background:${GOLD};color:#111;padding:15px 16px;display:flex;align-items:center;justify-content:space-between}
      #vgs-receptionist-v4 .head strong{display:block;font-size:16px}.v4-status{font-size:11px;margin-top:3px;opacity:.8}
      #vgs-receptionist-v4 .close{border:0;background:transparent;color:#111;font-size:24px;cursor:pointer}
      #vgs-receptionist-v4 .messages{flex:1;overflow-y:auto;padding:16px;background:#101010}
      #vgs-receptionist-v4 .msg{max-width:88%;padding:11px 13px;border-radius:15px;margin:0 0 10px;line-height:1.48;font-size:14px;white-space:pre-wrap}
      #vgs-receptionist-v4 .bot{background:#222;border:1px solid rgba(212,175,55,.25);border-bottom-left-radius:5px}
      #vgs-receptionist-v4 .user{margin-left:auto;background:${GOLD};color:#111;border-bottom-right-radius:5px}
      #vgs-receptionist-v4 .typing{display:inline-flex;gap:4px}.typing i{width:6px;height:6px;border-radius:50%;background:${GOLD};display:block;animation:v4t 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes v4t{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
      #vgs-receptionist-v4 .quick{display:flex;gap:7px;overflow-x:auto;padding:9px 12px;border-top:1px solid #292929;background:#151515}
      #vgs-receptionist-v4 .quick button,#vgs-receptionist-v4 .action{white-space:nowrap;border:1px solid ${GOLD};background:#1d1d1d;color:#fff;border-radius:999px;padding:8px 11px;font-size:12px;cursor:pointer}
      #vgs-receptionist-v4 .form{display:flex;gap:8px;padding:10px;border-top:1px solid #292929;background:#151515}.v4-input{flex:1;min-width:0;resize:none;height:44px;padding:11px;border-radius:12px;border:1px solid #555;background:#202020;color:#fff;font:inherit;box-sizing:border-box}.v4-send{width:48px;border:0;border-radius:12px;background:${GOLD};color:#111;font-size:18px;font-weight:800;cursor:pointer}.v4-send:disabled{opacity:.45}
      #vgs-receptionist-v4-toggle{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border:0;border-radius:50%;background:${GOLD};color:#111;font-size:25px;z-index:100004;cursor:pointer;box-shadow:0 10px 28px rgba(212,175,55,.4)}
      .v4-actions{margin-top:8px}.v4-actions .action{display:block;width:100%;border-radius:10px;margin-top:8px;white-space:normal}
      @media(max-width:600px){#vgs-receptionist-v4{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:18px}}
    `;
    document.head.appendChild(s);
  }

  function addMessage(text, who='bot', persist=true) {
    const box = document.querySelector('#vgs-receptionist-v4 .messages');
    if (!box) return;
    const el = document.createElement('div'); el.className = `msg ${who}`; el.textContent = text; box.appendChild(el); box.scrollTop = box.scrollHeight;
    if (persist) { history.push({ who, text }); history = history.slice(-50); save(CHAT_KEY, history); }
  }

  function typing(on) {
    const box = document.querySelector('#vgs-receptionist-v4 .messages'); if (!box) return;
    const old = document.getElementById('v4-typing');
    if (on && !old) { const el=document.createElement('div'); el.id='v4-typing'; el.className='msg bot'; el.innerHTML='<span class="typing"><i></i><i></i><i></i></span>'; box.appendChild(el); box.scrollTop=box.scrollHeight; }
    if (!on && old) old.remove();
  }

  function renderHistory() {
    const box = document.querySelector('#vgs-receptionist-v4 .messages'); if (!box) return;
    box.innerHTML=''; history.forEach(x=>addMessage(x.text,x.who,false)); if (state.complete) addActions();
  }

  function detectService(text) {
    const lower=text.toLowerCase();
    const names=Object.keys(services).filter(x=>x!=='Other');
    const exact=names.find(x=>lower.includes(x.toLowerCase())); if(exact)return exact;
    for(const name of names) if(services[name].aliases.some(a=>lower.includes(a))) return name;
    return '';
  }

  function parseBudget(text) {
    const lower=text.toLowerCase();
    if (/\b(no|none|not|don't|dont|haven't|havent|unsure|unknown|rather not|prefer not)\b.{0,35}\b(budget|spend|price|amount)\b|\b(no budget|no idea|not sure)\b/i.test(lower)) return 'Not provided';
    const k=text.match(/(?:₦|ngn|naira)?\s*([\d,]+(?:\.\d+)?)\s*k\b/i); if(k)return `₦${Number(k[1].replace(/,/g,''))*1000}`;
    const n=text.match(/(?:₦|ngn|naira)\s*([\d,]+(?:\.\d+)?)/i); if(n)return `₦${Number(n[1].replace(/,/g,'')).toLocaleString()}`;
    return '';
  }

  function parseDeadline(text) {
    const lower=text.toLowerCase();
    if (/^(yes|yeah|yep|sure|okay|ok)$/i.test(clean(text))) return '';
    if (/\b(no|none|not sure|whenever|flexible|no deadline)\b/i.test(lower)) return 'Flexible / no fixed deadline';
    const match=text.match(/\b(?:today|tomorrow|tonight|this weekend|next week|next month|in \d+\s*(?:day|days|week|weeks)|\d+\s*(?:day|days|week|weeks)|by\s+[^.!,;]+)/i);
    if(match)return clean(match[0]);
    if (/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) return clean(text);
    if (/\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/.test(text)) return clean(text);
    return '';
  }

  function extractAnswers(text) {
    const found={};
    const simple={
      brand:/(?:brand|business)(?: name)?\s*(?:is|=|:)\s*([^,.;\n]+)/i,
      business:/(?:business|company)(?: name)?\s*(?:is|=|:)\s*([^,.;\n]+)/i,
      style:/(?:style|look|vibe)\s*(?:is|=|:)\s*([^,.;\n]+)/i,
      colors:/colou?rs?\s*(?:are|is|=|:)\s*([^.;\n]+)/i,
      goal:/(?:goal|communicate|message|meaning|feel)\s*(?:is|should be|=|:)\s*([^.;\n]+)/i,
      audience:/(?:target audience|audience)\s*(?:are|is|=|:)\s*([^.;\n]+)/i,
      pages:/(?:pages?)\s*(?:are|include|=|:)\s*([^.;\n]+)/i,
      features:/(?:features?|functions?)\s*(?:are|include|need|=|:)\s*([^.;\n]+)/i,
      platform:/(?:platform)\s*(?:is|=|:)\s*([^.;\n]+)/i,
      industry:/(?:industry|business type)\s*(?:is|=|:)\s*([^.;\n]+)/i,
      materials:/(?:materials?|brand materials?)\s*(?:are|include|need|=|:)\s*([^.;\n]+)/i,
      duration:/(?:duration|length)\s*(?:is|=|:)\s*([^.;\n]+)/i,
      footage:/(?:footage|assets?)\s*(?:is|are|=|:)\s*([^.;\n]+)/i,
      quantity:/(?:quantity|number|how many)\s*(?:is|are|=|:)\s*([^.;\n]+)/i,
      editing:/(?:editing|edit type)\s*(?:is|=|:)\s*([^.;\n]+)/i,
      references:/(?:references?|examples?)\s*(?:are|include|=|:)\s*([^.;\n]+)/i,
      item:/(?:print|printing)\s*(?:item)?\s*(?:is|=|:)\s*([^.;\n]+)/i,
      size:/(?:size|dimensions?)\s*(?:is|=|:)\s*([^.;\n]+)/i,
      material:/(?:paper|material)\s*(?:is|=|:)\s*([^.;\n]+)/i
    };
    for(const [key,re] of Object.entries(simple)){const m=text.match(re);if(m?.[1])found[key]=clean(m[1]);}
    const name=text.match(/(?:my name is|i am|i'm|name is)\s+([^,.;\n]+)/i);if(name)found.name=clean(name[1]);
    const called=text.match(/(?:called|named)\s+([^,.;\n]+)/i);if(called&&!found.brand&&!found.business)found.brand=clean(called[1]);
    const colour=text.match(/\b(?:black|white|gold|yellow|red|blue|green|purple|orange|pink|silver|brown|grey|gray)(?:\s*(?:and|,|&)\s*(?:black|white|gold|yellow|red|blue|green|purple|orange|pink|silver|brown|grey|gray))+\b/i);if(colour&&!found.colors)found.colors=clean(colour[0]);
    const b=parseBudget(text); if(b)found.budget=b;
    const d=parseDeadline(text); if(d)found.deadline=d;
    return found;
  }

  function fields(){ return (services[state.service]||services.Other).fields; }
  function missing(){ return fields().find(([key])=>!state.answers[key]); }

  function normalizeAnswer(field, text) {
    const value=clean(text);
    if(field==='deadline') return parseDeadline(value);
    if(field==='budget') return parseBudget(value) || (/\b(no|none|not|rather not|prefer not)\b/i.test(value) ? 'Not provided' : value);
    return value;
  }

  function summary() {
    const labels={brand:'Brand',business:'Business',style:'Style',colors:'Colours',goal:'Goal',audience:'Audience',deadline:'Deadline',budget:'Budget',pages:'Pages',features:'Features',platform:'Platform',industry:'Industry',materials:'Materials',duration:'Duration',footage:'Assets',quantity:'Quantity',editing:'Editing',references:'References',item:'Print item',size:'Size',material:'Material',project:'Project'};
    const lines=Object.entries(state.answers).filter(([,v])=>v).map(([k,v])=>`${labels[k]||k}: ${v}`);
    return `New project brief\n\nService: ${state.service}\n${lines.join('\n')}`;
  }

  function addActions(){
    const box=document.querySelector('#vgs-receptionist-v4 .messages'); if(!box||document.getElementById('v4-actions'))return;
    const wrap=document.createElement('div');wrap.id='v4-actions';wrap.className='v4-actions';wrap.innerHTML='<button class="action" data-action="send">📩 Send brief to VGS</button><button class="action" data-action="edit">✏️ Add or change details</button><button class="action" data-action="reset">🔄 Start a new project</button>';box.appendChild(wrap);box.scrollTop=box.scrollHeight;
  }

  function whatsapp(){
    const text=`Hello Vitch Graphic Studio 👋\n\n*${summary().replace(/\n/g,'\n')}*\n\nPlease review and let me know the next step.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,'_blank');
  }

  function reset(){state=defaultState();history=[];save(STATE_KEY,state);save(CHAT_KEY,history);const box=document.querySelector('#vgs-receptionist-v4 .messages');if(box)box.innerHTML='';addMessage('Welcome back to Vitch Graphic Studio! 👋🏽\n\nI’m your AI receptionist. Tell me what you want to create in your own words. I’ll remember the details and only ask for what is still missing.');addMessage('What would you like to create today?');}

  async function answer(raw){
    const text=clean(raw); if(!text||busy)return;
    busy=true;const input=document.querySelector('.v4-input'),send=document.querySelector('.v4-send');if(input)input.value='';if(send)send.disabled=true;addMessage(text,'user');
    const lower=text.toLowerCase();
    if(/^(hi|hello|hey|good morning|good afternoon|good evening)[!.,\s]*$/i.test(text)){typing(true);await sleep(550);typing(false);addMessage(state.service?`Welcome back 👋🏽 I still have your ${state.service} brief. I won’t make you repeat details you already gave me.`:'Welcome to Vitch Graphic Studio! 👋🏽 Tell me what you want to create and I’ll help you build a clear brief.');busy=false;if(send)send.disabled=false;return;}
    if(/\b(start a new project|new project|start over|reset)\b/i.test(lower)){reset();busy=false;if(send)send.disabled=false;return;}

    const detected=detectService(text);if(detected){if(detected!==state.service){state={...defaultState(),service:detected};}else state.service=detected;}

    const extracted=extractAnswers(text);Object.assign(state.answers,extracted);
    if(state.lastField&&!extracted[state.lastField]&&!detected){const normalized=normalizeAnswer(state.lastField,text);if(normalized)state.answers[state.lastField]=normalized;}

    if(!state.service){typing(true);await sleep(650);typing(false);addMessage('Absolutely 😊 What are we creating — a logo, website, mobile app, brand identity, video, photo editing, printing, or something custom?');busy=false;if(send)send.disabled=false;return;}

    const next=missing();
    if(next){
      state.lastField=next[0];save(STATE_KEY,state);
      typing(true);await sleep(550+Math.floor(Math.random()*300));typing(false);
      if(next[0]==='deadline') addMessage('Great. One last timing detail: what is the actual deadline — for example “2 days”, “Friday”, “next week”, or “no fixed deadline”?');
      else if(next[0]==='budget') addMessage('And for budget, you can give me an amount, a range, or simply say “no budget yet” if you want VGS to quote based on the brief.');
      else addMessage(next[1]);
    } else if(!state.complete){
      state.complete=true;save(STATE_KEY,state);typing(true);await sleep(650);typing(false);addMessage(`${summary()}\n\nPerfect — that’s a solid brief. 🎯 I can send it to VGS for review now. Would you like me to send it?`);addActions();
    }
    save(STATE_KEY,state);busy=false;if(send)send.disabled=false;
  }

  function build(){
    addStyles();
    ['vgs-chatbot','vgs-chatbot-toggle','ai-chat','ai-toggle','vgs-chatbot-fix','vgs-chatbot-fix-toggle'].forEach(id=>document.getElementById(id)?.remove());
    const chat=document.createElement('section');chat.id='vgs-receptionist-v4';chat.innerHTML=`<div class="head"><div><strong>🤖 VGS AI Receptionist</strong><div class="v4-status">Always available • remembers your brief</div></div><button class="close" type="button">×</button></div><div class="messages"></div><div class="quick"><button data-q="What services do you offer?">Services</button><button data-q="How much does it cost?">Pricing</button><button data-q="I want human support">Human support</button><button data-q="I want to start a new project">New project</button></div><form class="form"><textarea class="v4-input" placeholder="Type naturally…"></textarea><button class="v4-send" type="submit">➤</button></form>`;
    document.body.appendChild(chat);
    const toggle=document.createElement('button');toggle.id='vgs-receptionist-v4-toggle';toggle.type='button';toggle.textContent='🤖';document.body.appendChild(toggle);
    const open=()=>{chat.classList.add('open');toggle.style.display='none';if(history.length)renderHistory();else{addMessage('Welcome to Vitch Graphic Studio! 👋🏽\n\nI’m your AI receptionist. Tell me what you want to create in your own words. I’ll remember the details and only ask for what is still missing.');addMessage('What would you like to create today?');}};
    toggle.onclick=open;chat.querySelector('.close').onclick=()=>{chat.classList.remove('open');toggle.style.display='block';};
    chat.querySelector('.form').addEventListener('submit',e=>{e.preventDefault();answer(chat.querySelector('.v4-input').value);});
    chat.querySelector('.v4-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();answer(e.target.value);}});
    chat.querySelector('.quick').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b)answer(b.dataset.q);});
    chat.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='send')whatsapp();if(b.dataset.action==='reset')reset();if(b.dataset.action==='edit')chat.querySelector('.v4-input')?.focus();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
