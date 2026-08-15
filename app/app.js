import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://unidgmiuyfzfttutwyev.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wrJ4jMABrxax1ThqVjG6mw_GV7KSDLK";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const services = [
  {id:"graphic",title:"Graphic Design",icon:"✒️",text:"Logos, flyers, branding and more.",service:"Graphic Design"},
  {id:"video",title:"Video Editing",icon:"▶️",text:"Promos, reels, ads and more.",service:"Video Editing"},
  {id:"motion",title:"Motion Graphics",icon:"◇",text:"Animation, explainer videos and more.",service:"Motion Graphics"},
  {id:"photo",title:"Photo Editing",icon:"📷",text:"Retouching, cleanup and creative edits.",service:"Photo Editing"}
];

let state = { user:null, profile:null, projects:[], bookings:[], invoices:[], messages:[], tab:"home" };
const screen = document.getElementById("screen");
const toast = document.getElementById("toast");

function esc(value=""){return String(value).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function money(amount,currency="NGN"){if(amount===null||amount===undefined||amount==="")return "—";return `${currency === "NGN" ? "₦" : currency+" "}${Number(amount).toLocaleString()}`;}
function date(value){return value?new Date(value).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}):"No deadline";}
function initials(name="V"){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"V";}
function showToast(message){toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600);}
function statusLabel(status){const map={active:"Active",pending:"Pending",in_progress:"In Progress",reviewing:"Review",completed:"Completed",cancelled:"Cancelled"};return map[status]||status||"New";}
function badge(status){const cls=status==="completed"?"green":status==="cancelled"?"red":status==="active"?"green":"";return `<span class="badge ${cls}">${esc(statusLabel(status))}</span>`;}

async function loadData(){
  const {data:{session}}=await supabase.auth.getSession();
  state.user=session?.user||null;
  if(!state.user){renderLogin();return false;}
  const uid=state.user.id;
  const [profile,projects,bookings,invoices,messages]=await Promise.all([
    supabase.from("profiles").select("id,full_name,email,phone,role").eq("id",uid).maybeSingle(),
    supabase.from("projects").select("id,title,service,description,status,progress,budget,currency,deadline,created_at,updated_at").eq("client_id",uid).order("created_at",{ascending:false}),
    supabase.from("bookings").select("id,service,project_title,description,budget,currency,deadline,status,created_at,updated_at").eq("client_id",uid).order("created_at",{ascending:false}),
    supabase.from("invoices").select("id,project_id,amount,currency,status,due_date,created_at").eq("client_id",uid).order("created_at",{ascending:false}),
    supabase.from("messages").select("id,project_id,sender_role,message,created_at").eq("client_id",uid).order("created_at",{ascending:true})
  ]);
  state.profile=profile.data||{full_name:state.user.email?.split("@")[0]||"Client",email:state.user.email};
  state.projects=projects.data||[]; state.bookings=bookings.data||[]; state.invoices=invoices.data||[]; state.messages=messages.data||[];
  return true;
}

function renderLogin(){
  screen.innerHTML=`<section class="login"><div class="login-box"><div class="logo">VG</div><div class="eyebrow">Vitch Graphic Studio</div><h1>Your mobile studio.</h1><p>Sign in with the same VGS account you already use on the website.</p><form id="login-form"><input id="email" type="email" placeholder="Email address" autocomplete="email" required><input id="password" type="password" placeholder="Password" autocomplete="current-password" required><button class="gold-btn" type="submit">Sign in</button></form><p style="margin-top:14px;font-size:12px">This is the separate VGS mobile experience — not the admin website.</p></div></section>`;
  document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value;const {error}=await supabase.auth.signInWithPassword({email,password});if(error){showToast(error.message);return;}await loadData();render();});
}

function render(){
  if(!state.user){renderLogin();return;}
  document.querySelectorAll(".nav-item").forEach(btn=>btn.classList.toggle("active",btn.dataset.tab===state.tab));
  if(state.tab==="home")renderHome();
  if(state.tab==="projects")renderProjects();
  if(state.tab==="orders")renderOrders();
  if(state.tab==="messages")renderMessages();
  if(state.tab==="profile")renderProfile();
}

function renderHome(){
  const name=state.profile?.full_name||state.user.email?.split("@")[0]||"Client";
  const active=state.projects.filter(p=>p.status!=="completed"&&p.status!=="cancelled").length;
  const unpaid=state.invoices.filter(i=>i.status!=="paid"&&i.status!=="cancelled").length;
  screen.innerHTML=`<section class="hero"><div class="eyebrow">Vitch Graphic Studio</div><h1>Good morning,<br>${esc(name)} 👋</h1><p>Your creative work, orders and messages — all in one mobile app.</p><div class="search"><input id="service-search" placeholder="Search services, projects..." autocomplete="off"></div></section>
  <div class="stats"><div class="stat"><span>Active projects</span><strong>${active}</strong></div><div class="stat"><span>Orders</span><strong>${state.bookings.length}</strong></div><div class="stat"><span>Unpaid invoices</span><strong>${unpaid}</strong></div><div class="stat"><span>Messages</span><strong>${state.messages.length}</strong></div></div>
  <div class="section-head"><h2>Popular Services</h2><button id="all-services">See all</button></div>
  <div class="service-grid" id="service-grid">${services.slice(0,4).map(serviceCard).join("")}</div>
  <div class="section-head"><h2>Recent Projects</h2><button data-go="projects" class="link-btn">See all</button></div>
  ${state.projects.length?`<div class="project-list">${state.projects.slice(0,3).map(projectCard).join("")}</div>`:`<div class="empty">No projects yet. Once an order is approved, your project will appear here.</div>`}`;
  bindHome();
}
function serviceCard(s){return `<article class="service-card"><div><div class="service-icon">${s.icon}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div><button class="outline-btn" data-service="${esc(s.service)}">Get started →</button></article>`;}
function projectCard(p){const progress=Math.max(0,Math.min(100,Number(p.progress)||0));return `<article class="project-card"><div class="row"><div><h3>${esc(p.title)}</h3><div class="meta">${esc(p.service)} · ${date(p.created_at)}</div></div>${badge(p.status)}</div><div class="progress"><span style="width:${progress}%"></span></div><div class="row"><span class="meta">Progress</span><strong>${progress}%</strong></div></article>`;}
function bindHome(){
  document.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>openBookingForm(b.dataset.service)));
  document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{state.tab=b.dataset.go;render();}));
  document.getElementById("all-services")?.addEventListener("click",()=>showToast("Choose a service below to start an order."));
  document.getElementById("service-search")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("#service-grid .service-card").forEach(c=>c.style.display=c.innerText.toLowerCase().includes(q)?"flex":"none");});
}

function renderProjects(){screen.innerHTML=`<div class="hero"><div class="eyebrow">Your work</div><h1>Projects</h1><p>Follow each project from approval to completion.</p></div>${state.projects.length?`<div class="project-list">${state.projects.map(projectCard).join("")}</div>`:`<div class="empty">No projects yet.</div>`}`;}

function renderOrders(){screen.innerHTML=`<div class="hero"><div class="eyebrow">Your requests</div><h1>Orders</h1><p>Bookings and their current status.</p><button id="new-order" class="gold-btn full" style="margin-top:14px">+ Start a new order</button></div><div class="order-list">${state.bookings.length?state.bookings.map(orderCard).join(""):`<div class="empty">You haven't placed an order yet.</div>`}</div><div class="section-head"><h2>Invoices</h2></div><div class="invoice-list">${state.invoices.length?state.invoices.map(invoiceCard).join(""):`<div class="empty">No invoices yet.</div>`}</div>`;document.getElementById("new-order")?.addEventListener("click",()=>openBookingForm("Graphic Design"));}
function orderCard(b){return `<article class="order-card"><div class="row"><div><h3>${esc(b.project_title)}</h3><div class="meta">${esc(b.service)} · ${date(b.created_at)}</div></div>${badge(b.status)}</div><p class="meta" style="margin:12px 0">${esc(b.description||"No description provided.")}</p><div class="row"><span class="meta">Budget</span><strong>${money(b.budget,b.currency)}</strong></div></article>`;}
function invoiceCard(i){const cls=i.status==="paid"?"green":i.status==="overdue"?"red":"";return `<article class="invoice-card"><div class="row"><div><strong>${money(i.amount,i.currency)}</strong><div class="meta">Due ${date(i.due_date)}</div></div><span class="badge ${cls}">${esc(i.status)}</span></div></article>`;}

function renderMessages(){
  screen.innerHTML=`<div class="hero"><div class="eyebrow">VGS support</div><h1>Messages</h1><p>Chat with the Vitch Graphic Studio team.</p></div><div class="message-list">${state.messages.length?state.messages.map(m=>`<article class="message-card ${m.sender_role}"><div class="row"><strong>${m.sender_role==="admin"?"VGS Team":"You"}</strong><span class="meta">${new Date(m.created_at).toLocaleString()}</span></div><div>${esc(m.message)}</div></article>`).join(""):`<div class="empty">No messages yet. Send us a message below when you need help.</div>`}</div><form id="message-form" class="composer"><input id="message-input" placeholder="Type a message..." maxlength="1000" required><button class="gold-btn" type="submit">Send</button></form>`;
  document.getElementById("message-form").addEventListener("submit",async e=>{e.preventDefault();const input=document.getElementById("message-input"),message=input.value.trim();if(!message)return;const {error}=await supabase.from("messages").insert({client_id:state.user.id,sender_role:"client",message});if(error){showToast(error.message);return;}input.value="";await loadData();renderMessages();});
}

function renderProfile(){const p=state.profile||{};screen.innerHTML=`<div class="hero"><div class="eyebrow">Account</div><h1>Profile</h1><p>Your VGS account details.</p></div><div class="profile-card"><div class="profile-avatar">${esc(initials(p.full_name||state.user.email||"V"))}</div><div><strong style="font-size:20px">${esc(p.full_name||"Client")}</strong><div class="meta">${esc(p.email||state.user.email||"")}</div></div><div class="row"><span class="meta">Phone</span><strong>${esc(p.phone||"Not added")}</strong></div><div class="row"><span class="meta">Account</span><span class="badge green">Active</span></div><button id="logout" class="outline-btn full">Sign out</button></div><div class="section-head"><h2>About the app</h2></div><div class="empty">VGS Mobile is the client app. The admin website remains separate.</div>`;document.getElementById("logout").addEventListener("click",async()=>{await supabase.auth.signOut();state.user=null;renderLogin();});}

function openBookingForm(defaultService){
  const existing=document.getElementById("booking-modal");if(existing)existing.remove();
  const modal=document.createElement("div");modal.id="booking-modal";modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:60;display:grid;place-items:end center;padding:16px";
  modal.innerHTML=`<div style="width:min(100%,620px);max-height:88vh;overflow:auto;background:#111;border:1px solid #4b3912;border-radius:24px;padding:20px"><div class="row"><h2 style="margin:0">Start a project</h2><button id="close-booking" class="icon-btn">×</button></div><p class="meta">Tell Vitch what you need. The request will appear in the website admin area.</p><form id="booking-form"><label class="meta">Service</label><select id="b-service" style="width:100%;margin:6px 0 10px;background:#0b0b0b;color:white;border:1px solid #333;border-radius:14px;padding:13px">${services.map(s=>`<option ${s.service===defaultService?"selected":""}>${esc(s.service)}</option>`).join("")}</select><input id="b-title" placeholder="Project title" required style="width:100%;margin:6px 0;background:#0b0b0b;color:white;border:1px solid #333;border-radius:14px;padding:13px"><textarea id="b-desc" placeholder="Describe what you need" rows="5" required style="width:100%;margin:6px 0;background:#0b0b0b;color:white;border:1px solid #333;border-radius:14px;padding:13px;resize:vertical"></textarea><input id="b-budget" type="number" min="0" placeholder="Budget (optional)" style="width:100%;margin:6px 0;background:#0b0b0b;color:white;border:1px solid #333;border-radius:14px;padding:13px"><input id="b-deadline" type="date" style="width:100%;margin:6px 0;background:#0b0b0b;color:white;border:1px solid #333;border-radius:14px;padding:13px"><button class="gold-btn full" type="submit" style="margin-top:10px">Send project request</button></form></div>`;
  document.body.appendChild(modal);document.getElementById("close-booking").onclick=()=>modal.remove();document.getElementById("booking-form").onsubmit=async e=>{e.preventDefault();const payload={client_id:state.user.id,service:document.getElementById("b-service").value,project_title:document.getElementById("b-title").value.trim(),description:document.getElementById("b-desc").value.trim(),budget:document.getElementById("b-budget").value?Number(document.getElementById("b-budget").value):null,currency:"NGN",deadline:document.getElementById("b-deadline").value||null};const {error}=await supabase.from("bookings").insert(payload);if(error){showToast(error.message);return;}modal.remove();await loadData();state.tab="orders";render();showToast("Project request sent to Vitch.");};
}

supabase.auth.onAuthStateChange(async event=>{if(event==="SIGNED_OUT"){state.user=null;renderLogin();}else if(event==="SIGNED_IN"){await loadData();render();}});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{state.tab=btn.dataset.tab;render();}));
document.getElementById("menu-btn").addEventListener("click",()=>showToast("VGS Mobile is your client workspace. Use the tabs below to navigate."));
document.getElementById("bell-btn").addEventListener("click",()=>showToast("Notifications are ready for future VGS updates."));

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
loadData().then(render);
