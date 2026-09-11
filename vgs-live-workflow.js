(() => {
  if (window.__VW_LIVE_WORKFLOW__) return;
  window.__VW_LIVE_WORKFLOW__ = true;
  const admin = /admin\.html$/.test(location.pathname);
  const client = /dashboard\.html$/.test(location.pathname);
  if (!admin && !client) return;
  const importAuth = () => import('./vgs-auth.js?v=15').then(m => m.supabase);
  const clean = v => String(v ?? '').trim();
  const statusLabel = s => ({active:'Active',completed:'Completed',cancelled:'Cancelled',pending:'Pending',in_progress:'In progress',reviewing:'Review'}[clean(s)] || clean(s) || 'Pending');

  async function createUpdateMessage(supabase, projectId, clientId, title, status, progress) {
    if (!clientId) return;
    const body = `Project update: ${title}. Status: ${statusLabel(status)}. Progress: ${progress}%.`;
    const { data: recent } = await supabase.from('messages').select('id,created_at').eq('client_id',clientId).eq('message',body).order('created_at',{ascending:false}).limit(1);
    if (recent?.length && Date.now() - new Date(recent[0].created_at).getTime() < 120000) return;
    const { error } = await supabase.from('messages').insert({ client_id: clientId, project_id: projectId || null, message: body, sender_role: 'admin' });
    if (error) console.warn('Could not publish client project update:', error.message);
  }

  async function wireAdminProjectUpdates() {
    const supabase = await importAuth();
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[data-project-save]:not([data-live-wired])').forEach(btn => {
        btn.dataset.liveWired = '1';
        btn.addEventListener('click', async () => {
          const row = btn.closest('[data-project-id]');
          if (!row) return;
          const id = row.dataset.projectId;
          const status = row.querySelector('[data-project-status]')?.value || 'active';
          const progress = Number(row.querySelector('[data-project-progress]')?.value || 0);
          setTimeout(async () => {
            try {
              const { data: p } = await supabase.from('projects').select('id,title,client_id,status,progress').eq('id',id).maybeSingle();
              if (p) await createUpdateMessage(supabase,p.id,p.client_id,p.title,p.status ?? status,p.progress ?? progress);
            } catch(e) { console.warn(e); }
          }, 900);
        });
      });
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  async function clientLiveRefresh() {
    const supabase = await importAuth();
    const { data:{user} } = await supabase.auth.getUser();
    if (!user) return;
    let busy = false;
    const refresh = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const { data: p } = await supabase.from('projects').select('id,title,service,status,progress,budget,currency,deadline,created_at').eq('client_id',user.id).order('created_at',{ascending:false});
        const { data: m } = await supabase.from('messages').select('id,message,sender_role,created_at').eq('client_id',user.id).order('created_at',{ascending:false}).limit(8);
        if (Array.isArray(p)) window.dispatchEvent(new CustomEvent('vw-live-projects',{detail:p}));
        if (Array.isArray(m)) window.dispatchEvent(new CustomEvent('vw-live-messages',{detail:m}));
      } finally { busy=false; }
    };
    setInterval(refresh,20000);
  }
  if (admin) wireAdminProjectUpdates();
  if (client) clientLiveRefresh();
})();
