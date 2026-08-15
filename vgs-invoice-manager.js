import { supabase } from './vgs-auth.js?v=13';

const money=(amount,currency='NGN')=>new Intl.NumberFormat('en-NG',{style:'currency',currency,maximumFractionDigits:0}).format(Number(amount||0));
const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));

function invoiceStatusLabel(status){
  return ({unpaid:'Unpaid',pending:'Unpaid',sent:'Sent',paid:'Paid',cancelled:'Cancelled'}[status]||status||'Unpaid');
}

function invoicePanel(){
  return document.getElementById('invoices-table');
}

async function loadInvoiceManager(){
  const panel=invoicePanel();
  if(!panel) return;

  const [projectsRes,invoicesRes]=await Promise.all([
    supabase.from('projects').select('id,client_id,title,service,status,budget,currency').eq('status','active').order('created_at',{ascending:false}).limit(20),
    supabase.from('invoices').select('id,client_id,amount,currency,status,due_date,created_at').neq('status','paid').neq('status','cancelled').order('created_at',{ascending:false}).limit(20)
  ]);

  if(invoicesRes.error){
    panel.innerHTML='<div class="admin-empty">Invoice data could not be loaded right now.</div>';
    console.error('Invoice data',invoicesRes.error);
    return;
  }

  const invoices=invoicesRes.data||[];
  const projects=projectsRes.error?[]:(projectsRes.data||[]);
  const stat=document.getElementById('stat-invoices');
  if(stat) stat.textContent=invoices.length;

  const outstanding=invoices.map(i=>`<tr data-invoice-id="${esc(i.id)}">
    <td>${money(i.amount,i.currency||'NGN')}</td>
    <td><span class="status">${esc(invoiceStatusLabel(i.status))}</span></td>
    <td>${esc(i.due_date||'—')}</td>
    <td><button class="invoice-paid-btn project-save" data-invoice-paid type="button">Mark Paid</button></td>
  </tr>`).join('');

  const projectOptions=projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)} · ${esc(p.service||'')}</option>`).join('');

  panel.innerHTML=`
    <div style="margin-bottom:16px">
      <button id="create-invoice-btn" class="project-save" type="button">＋ Create Invoice</button>
    </div>
    ${invoices.length?`<table class="admin-table"><thead><tr><th>Amount</th><th>Status</th><th>Due</th><th>Action</th></tr></thead><tbody>${outstanding}</tbody></table>`:'<div class="admin-empty">No outstanding invoices.</div>'}
    <div id="invoice-form-wrap" style="display:none;margin-top:16px;padding:16px;border:1px solid rgba(212,175,55,.25);border-radius:14px">
      <h4 style="color:#d4af37;margin:0 0 12px">Create Invoice</h4>
      <label style="display:block;margin-bottom:8px">Project<select id="invoice-project" class="project-status" style="width:100%;margin-top:6px"><option value="">Choose a project</option>${projectOptions}</select></label>
      <label style="display:block;margin-bottom:8px">Amount<input id="invoice-amount" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 10000" style="width:100%;margin-top:6px;padding:10px;border-radius:10px;border:1px solid rgba(212,175,55,.35);background:#171717;color:#fff"></label>
      <label style="display:block;margin-bottom:12px">Due date<input id="invoice-due" type="date" style="width:100%;margin-top:6px;padding:10px;border-radius:10px;border:1px solid rgba(212,175,55,.35);background:#171717;color:#fff"></label>
      <div class="admin-actions"><button id="save-invoice-btn" class="project-save" type="button">Save Invoice</button><button id="cancel-invoice-btn" class="project-save" type="button">Cancel</button></div>
    </div>`;

  document.getElementById('create-invoice-btn')?.addEventListener('click',()=>{
    const wrap=document.getElementById('invoice-form-wrap');
    if(wrap) wrap.style.display=wrap.style.display==='none'?'block':'none';
  });
  document.getElementById('cancel-invoice-btn')?.addEventListener('click',()=>{
    const wrap=document.getElementById('invoice-form-wrap'); if(wrap) wrap.style.display='none';
  });

  document.getElementById('save-invoice-btn')?.addEventListener('click',async()=>{
    const projectId=document.getElementById('invoice-project')?.value;
    const amount=Number(document.getElementById('invoice-amount')?.value||0);
    const dueDate=document.getElementById('invoice-due')?.value||null;
    const button=document.getElementById('save-invoice-btn');
    if(!projectId||amount<=0){alert('Choose a project and enter a valid invoice amount.');return;}
    const project=projects.find(p=>String(p.id)===String(projectId));
    if(!project){alert('That project could not be found.');return;}
    button.disabled=true;button.textContent='Saving…';
    const {error}=await supabase.from('invoices').insert({client_id:project.client_id,amount,currency:project.currency||'NGN',status:'unpaid',due_date:dueDate});
    if(error){button.disabled=false;button.textContent='Save Invoice';alert(`Could not create the invoice: ${error.message}`);return;}
    button.textContent='✓ Created';
    setTimeout(loadInvoiceManager,500);
  });

  panel.querySelectorAll('[data-invoice-paid]').forEach(button=>button.addEventListener('click',async()=>{
    const row=button.closest('[data-invoice-id]');
    const id=row?.dataset.invoiceId;
    if(!id)return;
    button.disabled=true;button.textContent='Updating…';
    const {error}=await supabase.from('invoices').update({status:'paid'}).eq('id',id);
    if(error){button.disabled=false;button.textContent='Mark Paid';alert(`Could not mark the invoice as paid: ${error.message}`);return;}
    loadInvoiceManager();
  }));
}

if(location.pathname.endsWith('admin.html')){
  window.addEventListener('load',()=>setTimeout(loadInvoiceManager,900),{once:true});
}
