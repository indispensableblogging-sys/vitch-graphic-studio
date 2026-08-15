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

function hideVgsPreloader(){const p=document.getElementById("preloader");if(!p)return;p.style.opacity="0";p.style.visibility="hidden";p.style.pointerEvents="none";p.style.display="none";}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hideVgsPreloader,{once:true});else hideVgsPreloader();
window.addEventListener("load",hideVgsPreloader,{once:true});
setTimeout(hideVgsPreloader,1500);

function loadVgsScript(src,type="text/javascript"){
  const s=document.createElement("script");
  s.src=src;
  s.defer=true;
  if(type!=="text/javascript")s.type=type;
  document.head.appendChild(s);
  return s;
}

const isDashboard=/dashboard\.html$/.test(location.pathname);
const isAdmin=/admin\.html$/.test(location.pathname);

if(isDashboard){
  loadVgsScript("vgs-auth.js?v=13","module");
  loadVgsScript("vgs-receptionist-v4.js?v=2","text/javascript");
  loadVgsScript("vgs-project-sync.js?v=2","text/javascript");
}else if(isAdmin){
  loadVgsScript("vgs-auth.js?v=13","module");
  loadVgsScript("vgs-presence.js?v=3","module");
  loadVgsScript("vgs-ai-presence.js?v=3","module");
  loadVgsScript("vgs-project-sync.js?v=2","text/javascript");
  loadVgsScript("vgs-invoice-manager.js?v=2","module");
  loadVgsScript("vgs-admin-receptionist-bridge.js?v=3","text/javascript");
}else{
  loadVgsScript("ai-assistant.js?v=7");
  loadVgsScript("ai-fix.js?v=4");
  loadVgsScript("ai-automation.js?v=3");
  loadVgsScript("vgs-auth.js?v=13","module");
  loadVgsScript("vgs-presence.js?v=2","module");
  loadVgsScript("vgs-ai-presence.js?v=2","module");
}

// VGS mobile-app layer: install the existing site as a lightweight PWA.
(() => {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/manifest.webmanifest?v=2";
  document.head.appendChild(manifest);

  const theme = document.createElement("meta");
  theme.name = "theme-color";
  theme.content = "#d9b22e";
  document.head.appendChild(theme);

  const appleIcon = document.createElement("link");
  appleIcon.rel = "apple-touch-icon";
  appleIcon.href = "/vgs-app-icon.svg";
  document.head.appendChild(appleIcon);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .catch(error => console.warn("VGS app shell could not register", error));
    }, { once: true });
  }
})();

// Client dashboard hardening: keep its navigation horizontal on mobile even if
// the global website stylesheet contains generic mobile nav rules.
if (isDashboard) {
  const dashboardStyle = document.createElement("style");
  dashboardStyle.id = "vgs-client-dashboard-runtime-fix";
  dashboardStyle.textContent = `
    html, body { width:100%; min-width:0; overflow-x:hidden; }
    .vgs-app { width:100%; min-width:0; padding-bottom:92px !important; }
    .vgs-main { width:100%; max-width:720px; margin:0 auto; }
    .vgs-bottom { position:fixed !important; top:auto !important; right:0 !important; bottom:0 !important; left:0 !important; width:100% !important; height:78px !important; min-height:78px !important; display:flex !important; flex-direction:row !important; align-items:stretch !important; justify-content:center !important; margin:0 !important; padding:8px 12px calc(8px + env(safe-area-inset-bottom)) !important; box-sizing:border-box !important; border-radius:0 !important; z-index:9999 !important; }
    .vgs-bottom-inner { width:100% !important; max-width:720px !important; height:100% !important; display:grid !important; grid-template-columns:repeat(5,minmax(0,1fr)) !important; gap:4px !important; margin:0 !important; padding:0 !important; }
    .vgs-bottom .vgs-nav { position:static !important; top:auto !important; right:auto !important; bottom:auto !important; left:auto !important; width:auto !important; height:100% !important; min-height:0 !important; display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; float:none !important; transform:none !important; margin:0 !important; padding:5px 2px !important; box-sizing:border-box !important; }
    .vgs-bottom .vgs-nav span { display:block !important; }
    .vgs-float { position:fixed !important; right:18px !important; bottom:88px !important; z-index:10000 !important; }
    body #preloader { display:flex !important; position:fixed !important; inset:0 !important; z-index:20000 !important; }
  `;
  document.head.appendChild(dashboardStyle);

  // Restore a lightweight VGS loading screen if the dashboard page no longer
  // contains the original preloader markup.
  if (!document.getElementById("preloader")) {
    const preloader = document.createElement("div");
    preloader.id = "preloader";
    preloader.setAttribute("aria-label", "Loading Vitch Graphic Studio");
    preloader.innerHTML = `<div style="width:72px;height:72px;border:3px solid rgba(217,178,46,.2);border-top-color:#d9b22e;border-radius:50%;animation:vgsSpin .8s linear infinite"></div><div style="margin-top:16px;color:#d9b22e;font-weight:700;letter-spacing:1px">VITCH GRAPHIC STUDIO</div>`;
    preloader.style.cssText = "position:fixed;inset:0;z-index:20000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#050505;color:#fff;transition:opacity .35s ease,visibility .35s ease";
    document.head.insertAdjacentHTML("beforeend", "<style>@keyframes vgsSpin{to{transform:rotate(360deg)}}</style>");
    document.body.prepend(preloader);
  }

  // The dashboard's own data loader will be visible shortly; don't leave the
  // fallback screen stuck on slow connections.
  setTimeout(hideVgsPreloader, 2200);
}
