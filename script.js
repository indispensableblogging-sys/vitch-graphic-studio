const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
});
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
// ===== Auto Sliding Testimonials =====

const slider = document.querySelector(".testimonial-slider");

if (slider) {
    let scrollAmount = 0;

    setInterval(() => {

        const cardWidth = slider.querySelector(".testimonial-card").offsetWidth + 25;

        scrollAmount += cardWidth;

        if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
            scrollAmount = 0;
        }

        slider.scrollTo({
            left: scrollAmount,
            behavior: "smooth"
        });

    }, 4000);
}
// Animated Counter

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const updateCounter = () => {

        const target = +counter.getAttribute("data-target");

        const current = +counter.innerText;

        const increment = Math.ceil(target / 100);

        if(current < target){

            counter.innerText = current + increment;

            setTimeout(updateCounter,20);

        }else{

            counter.innerText = target + "+";

        }

    };

    updateCounter();

});
// Luxury Preloader

window.addEventListener("load", () => {

    const preloader = document.getElementById("preloader");

    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
        }, 1800);
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const aiToggle = document.getElementById("ai-toggle");
    const aiChat = document.getElementById("ai-chat");

    if (aiToggle && aiChat) {
        aiToggle.addEventListener("click", function () {

            aiChat.classList.toggle("active");

        });
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const aiMessage = document.getElementById("ai-message");

    document.querySelectorAll(".ai-option").forEach(function(button){

        button.addEventListener("click", function(){

            const reply = this.dataset.reply;

            switch(reply){

                case "logo":
                    aiMessage.innerHTML =
                    "🎨 <strong>Logo Design</strong><br><br>We create premium logos for businesses, churches, restaurants, fashion brands and startups.";
                    break;

                case "website":
                    aiMessage.innerHTML =
                    "🌐 <strong>Website Design</strong><br><br>We build modern, responsive websites with premium UI, fast loading speed and SEO optimization.";
                    break;

                case "app":
                    aiMessage.innerHTML =
                    "📱 <strong>Mobile App Development</strong><br><br>Android and iOS applications tailored for your business needs.";
                    break;

                case "photo":
                    aiMessage.innerHTML =
                    "📸 <strong>Photo Editing</strong><br><br>Luxury photo editing, retouching, cinematic effects and studio-quality enhancements.";
                    break;

                
case "quote":
    aiMessage.innerHTML = `
        <h3>💰 Get a Quote</h3>
        <p>Select the service you need:</p>

        <button class="ai-option">🎨 Logo Design</button>
        <button class="ai-option">🌐 Website Design</button>
        <button class="ai-option">📱 Mobile App</button>
        <button class="ai-option">📸 Photo Editing</button>
        <button class="ai-option">🖨️ Printing</button>
    `;
                    document.getElementById("ai-options").style.display = "none";
    break;
                case "whatsapp":
                    window.open("https://wa.me/2348083336746","_blank");
                    break;

            }

        });

    });

});
