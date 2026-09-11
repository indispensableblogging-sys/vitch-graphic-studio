(() => {
  if (window.__VW_LIVE_WORKFLOW__) return;
  window.__VW_LIVE_WORKFLOW__ = true;
  const admin = /admin\.html$/.test(location.pathname);
  const client = /dashboard\.html$/.test(location.pathname);
  if (!admin && !client) return;
  const importAuth = () => import('./vgs-auth.js?v=15').then(m => m.supabase);
  const clean = v => String(v ?? '').trim();
  const statusLabel = s => ({active:'Active',completed:'Completed',cancelled:'Cancelled',pending:'Pending',in_progress:'In progress',reviewing:'Review'}[clean(s)] || clean(s) || 'Pending');
  async function createUpdateMessage(supabase,projectId,clientId,title,status,progress){
    if(!clientId)return;
    const body=`Project update: ${title}. Status: ${statusLabel(status)}. Progress: ${progress}%.`;
    const {data:recent}=await supabase.from('messages').select('id,created_at').eq('client_id',clientId).eq('message',body).order('created_at',{ascending:false}).limit(1);
    if(recent?.length&&Date.now()-new Date(recent[0].created_at).getTime()<120000)return;
    const {error}=await supabase.from('messages').insert({client_id:clientId,project_id:projectId||null,message:body,sender_role:'admin'});
    if(error)console.warn('Could not publish client project update:',error.message);
  }
  async function wireAdminProjectUpdates(){
    const supabase=await importAuth();
    const observer=new MutationObserver(()=>{document.querySelectorAll('[data-project-save]:not([data-live-wired])').forEach(btn=>{
      btn.dataset.liveWired='1';
      btn.addEventListener('click',async()=>{const row=btn.closest('[data-project-id]');if(!row)return;const id=row.dataset.projectId;setTimeout(async()=>{try{const {data:p}=await supabase.from('projects').select('id,title,client_id,status,progress').eq('id',id).maybeSingle();if(p)await createUpdateMessage(supabase,p.id,p.client_id,p.title,p.status,p.progress)}catch(e){console.warn(e)}},1000)});
    })});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
  function startClientRefresh(){setInterval(()=>{if(document.visibilityState==='hidden')return;const refresh=document.getElementById('refresh');if(refresh)refresh.click()},20000)}
  if(admin)wireAdminProjectUpdates();
  if(client)startClientRefresh();
})();
