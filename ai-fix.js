document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('ai-chat');
  const toggle = document.getElementById('ai-toggle');
  if (chat && toggle && toggle.parentElement === chat) {
    document.body.appendChild(toggle);
  }
  if (chat && toggle) {
    toggle.onclick = () => chat.classList.toggle('active');
  }
});
