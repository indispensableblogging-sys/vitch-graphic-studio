const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");
if (menuToggle && navbar) menuToggle.addEventListener("click", () => navbar.classList.toggle("active"));

const reveals = document.querySelectorAll(".reveal");
function revealSections(){reveals.forEach(section=>{if(section.getBoundingClientRect().top < window.innerHeight-100) section.classList.add("active");});}
window.addEventListener("scroll", revealSections); window.addEventListener("load", revealSections);

const currency=document.getElementById("currency"), prices=document.querySelectorAll(".price");
if(currency){currency.addEventListener("change",function(){const values={NGN:["₦5,000","₦15,000","₦35,000"],USD:["$10","$25","$60"],SLL:["Le 230","Le 690","Le 1,610"],GHS:["GH₵105","GH₵260","GH₵620"],KES:["KSh 1,300","KSh 3,900","KSh 9,100"],ZAR:["R170","R510","R1,190"],EUR:["€9","€27","€63"],GBP:["£8","£22","£55"],CAD:["CA$14","CA$35","CA$84"],AUD:["A$15","A$38","A$90"],AED:["AED 37","AED 92","AED 220"]};(values[this.value]||[]).forEach((v,i)=>{if(prices[i])prices[i].innerHTML=v;});});}

const slider=document.querySelector(".testimonial-slider");
if(slider){let scrollAmount=0;setInterval(()=>{const firstCard=slider.querySelector(".testimonial-card");if(!firstCard)return;scrollAmount+=firstCard.offsetWidth+25;if(scrollAmount>=slider.scrollWidth-slider.clientWidth)scrollAmount=0;slider.scrollTo({left:scrollAmount,behavior:"smooth"});},4000);}

const counters=document.querySelectorAll(".counter");
counters.forEach(counter=>{const update=()=>{const target=+counter.getAttribute("data-target"),current=+counter.innerText,increment=Math.ceil(target/100);if(current<target){counter.innerText=current+increment;setTimeout(update,20);}else counter.innerText=target+"+";};update();});

function hideVgsPreloader(){const p=document.getElementById("preloader");if(!p)return;p.classList?.add("hidden");p.style.opacity="0";p.style.visibility="hidden";p.style.pointerEvents="none";}

const isDashboard=/dashboard\.html$/.test(location.pathname);
const isAdmin=/admin\.html$/.test(location.pathname);

// The website dashboard and the mobile app are intentionally separate.
// The app lives under /app/ and owns its own manifest/service worker.
if(isDashboard){
  const s=document.createElement("script");s.src="vgs-auth.js?v=15";s.type="module";s.defer=true;document.head.appendChild(s);
}else if(isAdmin){
  const load=(src,type="text/javascript")=>{const s=document.createElement("script");s.src=src;s.defer=true;if(type!=="text/javascript")s.type=type;document.head.appendChild(s);};
  load("vgs-auth.js?v=15","module");
  load("vgs-presence.js?v=3","module");
  load("vgs-ai-presence.js?v=3","module");
  load("vgs-project-sync.js?v=2");
  load("vgs-invoice-manager.js?v=2","module");
  load("vgs-admin-receptionist-bridge.js?v=3");
}else{
  const load=(src,type="text/javascript")=>{const s=document.createElement("script");s.src=src;s.defer=true;if(type!=="text/javascript")s.type=type;document.head.appendChild(s);};
  load("ai-assistant.js?v=7");
  load("ai-fix.js?v=4");
  load("ai-automation.js?v=3");
  load("vgs-auth.js?v=15","module");
  load("vgs-presence.js?v=2","module");
  load("vgs-ai-presence.js?v=2","module");
}

// Only the public website uses the shared preloader automatically.
// dashboard.html controls its own preloader so it remains visible while
// the client dashboard data is loading.
if(!isDashboard){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hideVgsPreloader,{once:true});
  else hideVgsPreloader();
  window.addEventListener("load",hideVgsPreloader,{once:true});
  setTimeout(hideVgsPreloader,1500);
}
