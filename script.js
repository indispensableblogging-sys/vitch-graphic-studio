const menuToggle=document.getElementById('menu-toggle');
const navbar=document.getElementById('navbar');
if(menuToggle&&navbar){menuToggle.addEventListener('click',()=>{const open=navbar.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));});navbar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navbar.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}));}

const reveals=document.querySelectorAll('.reveal');
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active')}),{threshold:.12});
reveals.forEach(el=>revealObserver.observe(el));

const currency=document.getElementById('currency'),prices=document.querySelectorAll('.price');
const values={NGN:['₦5,000','₦15,000','₦35,000+'],USD:['$4','$10','$25+'],GBP:['£3','£8','£20+'],EUR:['€4','€9','€22+'],CAD:['CA$6','CA$14','CA$35+'],AUD:['A$6','A$15','A$40+'],GHS:['GH₵60','GH₵180','GH₵420+'],SLL:['Le 60','Le 180','Le 420+'],KES:['KSh 650','KSh 1,950','KSh 4,600+'],ZAR:['R75','R225','R530+']};
function setPrices(){const list=values[currency?.value]||values.NGN;prices.forEach((p,i)=>{p.textContent=list[i]||list[0]});}
if(currency){currency.addEventListener('change',setPrices);setPrices();}

const backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{if(backToTop)backToTop.style.display=window.scrollY>500?'block':'none'});
if(backToTop)backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// Preserve the existing AI, auth, presence and automation modules used by the site.
const load=(src,type='text/javascript')=>{const s=document.createElement('script');s.src=src;s.defer=true;if(type!=='text/javascript')s.type=type;document.body.appendChild(s)};
const path=location.pathname;
const isDashboard=/dashboard\.html$/.test(path),isAdmin=/admin\.html$/.test(path);
if(isDashboard){load('vgs-auth.js?v=15','module')}else if(isAdmin){load('vgs-auth.js?v=15','module');load('vgs-presence.js?v=3','module');load('vgs-ai-presence.js?v=3','module');load('vgs-project-sync.js?v=2');load('vgs-invoice-manager.js?v=2','module');load('vgs-admin-receptionist-bridge.js?v=3')}else{load('ai-assistant.js?v=7');load('ai-fix.js?v=4');load('ai-automation.js?v=3');load('vgs-auth.js?v=15','module');load('vgs-presence.js?v=2','module');load('vgs-ai-presence.js?v=2','module');}
