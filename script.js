const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
        navbar.classList.toggle("active");
    });
}

const reveals = document.querySelectorAll(".reveal");
function revealSections() {
    reveals.forEach((section) => {
        const windowHeight = window.innerHeight;
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < windowHeight - 100) section.classList.add("active");
    });
}
window.addEventListener("scroll", revealSections);
window.addEventListener("load", revealSections);

const currency = document.getElementById("currency");
const prices = document.querySelectorAll(".price");
if (currency) {
    currency.addEventListener("change", function () {
        const values = {
            NGN:["₦5,000","₦15,000","₦35,000"], USD:["$10","$25","$60"], SLL:["Le 230","Le 690","Le 1,610"],
            GHS:["GH₵105","GH₵260","GH₵620"], KES:["KSh 1,300","KSh 3,900","KSh 9,100"], ZAR:["R170","R510","R1,190"],
            EUR:["€9","€27","€63"], GBP:["£8","£22","£55"], CAD:["CA$14","CA$35","CA$84"], AUD:["A$15","A$38","A$90"], AED:["AED 37","AED 92","AED 220"]
        };
        (values[this.value] || []).forEach((v,i)=>{ if(prices[i]) prices[i].innerHTML=v; });
    });
}

const slider = document.querySelector(".testimonial-slider");
if (slider) {
    let scrollAmount = 0;
    setInterval(() => {
        const firstCard = slider.querySelector(".testimonial-card");
        if (!firstCard) return;
        const cardWidth = firstCard.offsetWidth + 25;
        scrollAmount += cardWidth;
        if (scrollAmount >= slider.scrollWidth - slider.clientWidth) scrollAmount = 0;
        slider.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 4000);
}

const counters = document.querySelectorAll(".counter");
counters.forEach(counter => {
    const updateCounter = () => {
        const target = +counter.getAttribute("data-target");
        const current = +counter.innerText;
        const increment = Math.ceil(target / 100);
        if (current < target) {
            counter.innerText = current + increment;
            setTimeout(updateCounter, 20);
        } else counter.innerText = target + "+";
    };
    updateCounter();
}

const hideVgsPreloader = () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        preloader.style.pointerEvents = "none";
    }, 900);
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hideVgsPreloader, { once: true });
else hideVgsPreloader();
setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) { preloader.style.opacity="0"; preloader.style.visibility="hidden"; preloader.style.pointerEvents="none"; }
}, 5000);

// Keep the existing quote assistant available on the site, but load the fixed
// client receptionist last with a fresh cache-busting version. The receptionist
// removes the old assistant UI before creating its own chat, so only one responder
// can handle each client message.
const vgsAiLoader = document.createElement("script");
vgsAiLoader.src = "ai-assistant.js?v=6";
vgsAiLoader.defer = true;
document.head.appendChild(vgsAiLoader);

const vgsAiFixLoader = document.createElement("script");
vgsAiFixLoader.src = "ai-fix.js?v=3";
vgsAiFixLoader.defer = true;
document.head.appendChild(vgsAiFixLoader);

const vgsAutomationLoader = document.createElement("script");
vgsAutomationLoader.src = "ai-automation.js?v=2";
vgsAutomationLoader.defer = true;
document.head.appendChild(vgsAutomationLoader);

const vgsAuthLoader = document.createElement("script");
vgsAuthLoader.type = "module";
vgsAuthLoader.src = "vgs-auth.js?v=7";
vgsAuthLoader.defer = true;
document.head.appendChild(vgsAuthLoader);

const vgsPresenceLoader = document.createElement("script");
vgsPresenceLoader.type = "module";
vgsPresenceLoader.src = "vgs-presence.js?v=1";
vgsPresenceLoader.defer = true;
document.head.appendChild(vgsPresenceLoader);

const vgsAiPresenceLoader = document.createElement("script");
vgsAiPresenceLoader.type = "module";
vgsAiPresenceLoader.src = "vgs-ai-presence.js?v=1";
vgsAiPresenceLoader.defer = true;
document.head.appendChild(vgsAiPresenceLoader);

const vgsChatbotLoader = document.createElement("script");
vgsChatbotLoader.type = "module";
vgsChatbotLoader.src = "vgs-chatbot-fix.js?v=2";
vgsChatbotLoader.defer = true;
document.head.appendChild(vgsChatbotLoader);
