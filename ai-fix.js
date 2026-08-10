(() => {
  const fix = () => {
    const chat = document.getElementById('ai-chat');
    const toggle = document.getElementById('ai-toggle');
    if (!chat || !toggle) return false;

    if (toggle.parentElement === chat) {
      document.body.appendChild(toggle);
    }

    toggle.onclick = () => chat.classList.toggle('active');
    return true;
  };

  if (fix()) return;

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (fix() || attempts >= 40) clearInterval(timer);
  }, 250);
})();
