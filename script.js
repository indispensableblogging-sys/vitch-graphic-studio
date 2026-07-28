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
