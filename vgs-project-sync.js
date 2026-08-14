(() => {
  if (window.__VGS_PROJECT_SYNC__) return;
  window.__VGS_PROJECT_SYNC__ = true;

  const clean = v => String(v ?? '').trim();
  const numberFromBudget = value => {
    const text = clean(value).toLowerCase();
    if (!text || /not provided|no budget|none|unknown|unsure/.test(text)) return null;
    const k = text.match(/([\d,]+(?:\.\d+)?)\s*k\b/);
    if (k) return Number(k[1].replace(/,/g, '')) * 1000;
    const n = text.match(/([\d,]+(?:\.\d+)?)/);
    return n ? Number(n[1].replace(/,/g, '')) : null;
  };
  const dateFromDeadline = value => {
    const text = clean(value);
    const m = text.match(/\b(\d{4})[-\/]?(\d{1,2})[-\/]?(\d{1,2})\b/);
    if (m) return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
    return null;
  };
  const briefText = () => {
    const state = (() => { try { return JSON.parse(localStorage.getItem('vgs_receptionist_state_v4') || '{}'); } catch (_) { return {}; } })();
    const answers = state.answers || {};
    const service = state.service || 'Other';
    const labels = {brand:'Brand',business:'Business',style:'Style',colors:'Colours',goal:'Goal',audience:'Audience',deadline:'Deadline',budget:'Budget',pages:'Pages',features:'Features',platform:'Platform',industry:'Industry',materials:'Materials',duration:'Duration',footage:'Assets',quantity:'Quantity',editing:'Editing',references:'References',item:'Print item',size:'Size',material:'Material',project:'Project'};
    const lines = Object.entries(answers).filter(([,v]) => v).map(([k,v]) => `${labels[k] || k}: ${v}`);
    return { state, service, answers, description: `New project brief\n\nService: ${service}\n${lines.join('\n')}` };
  };

  async function getSupabase() {
    return import('./vgs-auth.js?v=13').then(m => m.supabase);
  }

  async function sendBrief(event) {
    const button = event.target.closest('[data-action="send"]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.dataset.sending === '1') return;
    button.dataset.sending = '1';
    const original = button.textContent;
    button.textContent = '⏳ Sending to VGS…';
    try {
      const supabase = await getSupabase();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Please sign in before sending your project brief.');
      const { state, service, answers, description } = briefText();
      if (!state.complete) throw new Error('Please finish the project brief first.');
      const title = clean(answers.brand || answers.business || answers.project || `${service} Project`);
      const budget = numberFromBudget(answers.budget);
      const deadline = dateFromDeadline(answers.deadline);
      const { data: existing } = await supabase.from('bookings').select('id').eq('client_id', user.id).eq('project_title', title).eq('service', service).eq('description', description).limit(1);
      if (!existing?.length) {
        const { error } = await supabase.from('bookings').insert({
          client_id: user.id,
          service,
          project_title: title,
          description,
          budget,
          currency: 'NGN',
          deadline,
          status: 'pending'
        });
        if (error) throw error;
      }
      try { localStorage.setItem('vgs_brief_sent_v4', JSON.stringify({ sentAt: new Date().toISOString(), title, service })); } catch (_) {}
      button.textContent = '✅ Brief sent to VGS';
      button.disabled = true;
      const wa = `Hello Vitch Graphic Studio 👋\n\n${description}\n\nPlease review and let me know the next step.`;
      setTimeout(() => window.open(`https://wa.me/2348083336746?text=${encodeURIComponent(wa)}`, '_blank'), 350);
    } catch (error) {
      console.error('VGS project submit error', error);
      button.dataset.sending = '0';
      button.textContent = original;
      alert(`We couldn't send the brief yet. ${error?.message || error}`);
    }
  }

  async function syncBookingsToProjects() {
    if (!/admin\.html$/.test(location.pathname)) return;
    try {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role !== 'admin') return;
      const { data: bookings, error: bErr } = await supabase.from('bookings').select('id,client_id,service,project_title,description,budget,currency,deadline,status').order('created_at',{ascending:false}).limit(50);
      if (bErr) throw bErr;
      for (const b of (bookings || [])) {
        if (b.status === 'cancelled') continue;
        const { data: found } = await supabase.from('projects').select('id').eq('client_id', b.client_id).eq('title', b.project_title).eq('service', b.service).limit(1);
        if (found?.length) continue;
        const { error } = await supabase.from('projects').insert({
          client_id: b.client_id,
          title: b.project_title,
          service: b.service,
          description: b.description,
          status: b.status === 'completed' ? 'completed' : b.status === 'in_progress' ? 'in_progress' : 'pending',
          progress: b.status === 'completed' ? 100 : 0,
          budget: b.budget,
          currency: b.currency || 'NGN',
          deadline: b.deadline
        });
        if (error) console.warn('Could not create project from booking', b.id, error.message);
      }
      window.dispatchEvent(new CustomEvent('vgs-projects-synced'));
    } catch (error) {
      console.warn('VGS project sync skipped:', error?.message || error);
    }
  }

  function normalizeAdminStatusControls() {
    if (!/admin\.html$/.test(location.pathname)) return;
    const table = document.getElementById('projects-table');
    if (!table) return;
    table.querySelectorAll('[data-project-status]').forEach(select => {
      const map = { new:'pending', assigned:'pending', in_progress:'in_progress', review:'reviewing', completed:'completed' };
      const current = select.value;
      select.querySelectorAll('option').forEach(option => {
        if (map[option.value]) option.value = map[option.value];
      });
      if (map[current]) select.value = map[current];
    });
  }

  document.addEventListener('click', sendBrief, true);
  if (/admin\.html$/.test(location.pathname)) {
    const observer = new MutationObserver(() => normalizeAdminStatusControls());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', () => { syncBookingsToProjects(); setTimeout(normalizeAdminStatusControls, 500); });
    window.addEventListener('vgs-projects-synced', () => setTimeout(normalizeAdminStatusControls, 300));
  }
})();
