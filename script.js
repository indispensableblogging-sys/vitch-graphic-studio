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

});
