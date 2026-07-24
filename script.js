const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
});

const links = document.querySelectorAll("#navbar a");

links.forEach(link => {
    link.addEventListener("click", () => {
        navbar.classList.remove("active");
    });
});
