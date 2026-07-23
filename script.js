document.addEventListener("DOMContentLoaded", () => {
  console.log("Welcome to Vitch Graphic Studio!");

  const year = new Date().getFullYear();
  const footer = document.querySelector("footer p");

  if (footer) {
    footer.innerHTML = `© ${year} Vitch Graphic Studio. All Rights Reserved.`;
  }
});
