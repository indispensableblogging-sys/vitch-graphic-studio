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
        const revealPoint = 100;

        if (sectionTop < windowHeight - revealPoint) {
            section.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealSections);
window.addEventListener("load", revealSections);

const currency = document.getElementById("currency");
const prices = document.querySelectorAll(".price");

if (currency) {
    currency.addEventListener("change", function () {
        if (this.value === "NGN") {
            prices[0].innerHTML = "₦5,000";
            prices[1].innerHTML = "₦15,000";
            prices[2].innerHTML = "₦35,000";
        }
        if (this.value === "USD") {
            prices[0].innerHTML = "$10";
            prices[1].innerHTML = "$25";
            prices[2].innerHTML = "$60";
        }
        if (this.value === "SLL") {
            prices[0].innerHTML = "Le 230";
            prices[1].innerHTML = "Le 690";
            prices[2].innerHTML = "Le 1,610";
        }
        if (this.value === "GHS") {
            prices[0].innerHTML = "GH₵105";
            prices[1].innerHTML = "GH₵260";
            prices[2].innerHTML = "GH₵620";
        }
        if (this.value === "KES") {
            prices[0].innerHTML = "KSh 1,300";
            prices[1].innerHTML = "KSh 3,900";
            prices[2].innerHTML = "KSh 9,100";
        }
        if (this.value === "ZAR") {
            prices[0].innerHTML = "R170";
            prices[1].innerHTML = "R510";
            prices[2].innerHTML = "R1,190";
        }
        if (this.value === "EUR") {
            prices[0].innerHTML = "€9";
            prices[1].innerHTML = "€27";
            prices[2].innerHTML = "€63";
        }
        if (this.value === "GBP") {
            prices[0].innerHTML = "£8";
            prices[1].innerHTML = "£22";
            prices[2].innerHTML = "£55";
        }
        if (this.value === "CAD") {
            prices[0].innerHTML = "CA$14";
            prices[1].innerHTML = "CA$35";
            prices[2].innerHTML = "CA$84";
        }
        if (this.value === "AUD") {
            prices[0].innerHTML = "A$15";
            prices[1].innerHTML = "A$38";
            prices[2].innerHTML = "A$90";
        }
        if (this.value === "AED") {
            prices[0].innerHTML = "AED 37";
            prices[1].innerHTML = "AED 92";
            prices[2].innerHTML = "AED 220";
        }
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
        } else {
            counter.innerText = target + "+";
        }
    };
    updateCounter();
});

const hideVgsPreloader = () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        preloader.style.pointerEvents = "none";
    }, 900);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideVgsPreloader, { once: true });
} else {
    hideVgsPreloader();
}

setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        preloader.style.pointerEvents = "none";
    }
}, 5000);

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
