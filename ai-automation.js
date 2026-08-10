(() => {
  const GOLD = '#d4af37';
  const SERVICE_PRICES = {
    'Logo Design': { Basic: 5000, Standard: 15000, Premium: 35000 },
    'Website Design': { Basic: 15000, Standard: 35000, Premium: 75000 },
    'Mobile App': { Basic: 30000, Standard: 80000, Premium: 150000 },
    'Photo Editing': { Basic: 3000, Standard: 8000, Premium: 15000 },
    Printing: { Basic: 5000, Standard: 15000, Premium: 35000 },
    'Brand Identity': { Basic: 15000, Standard: 40000, Premium: 100000 },
    'Video Editing': { Basic: 10000, Standard: 30000, Premium: 75000 },
    Other: { Basic: null, Standard: null, Premium: null }
  };

  const money = n => n == null ? 'Custom quote' : `₦${n.toLocaleString()}`;

  const parseBudget = value => {
    const digits = String(value || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  };

  const recommend = (service, budget, details) => {
    const prices = SERVICE_PRICES[service] || SERVICE_PRICES.Other;
    if (!prices.Basic) return { level: 'Standard', reason: 'Your request needs a custom quote.' };

    if (budget) {
      if (budget >= prices.Premium) return { level: 'Premium', reason: 'Your budget can cover the Premium level.' };
      if (budget >= prices.Standard) return { level: 'Standard', reason: 'Your budget fits the Standard level.' };
      if (budget >= prices.Basic) return { level: 'Basic', reason: 'Your budget is closest to the Basic level.' };
      return { level: 'Basic', reason: 'Your budget is below the starting guide, so we recommend Basic or a smaller custom scope.' };
    }

    const text = String(details || '').toLowerCase();
    const premiumWords = ['full branding', 'complete branding', 'ecommerce', 'online store', 'booking system', 'dashboard', 'advanced', 'multiple pages', 'many pages', 'professional campaign', 'urgent', 'premium'];
    const standardWords = ['branding', 'responsive', 'business website', 'landing page', 'social media', 'advert', 'promotion', 'retouch', 'multiple photos', 'motion graphics'];
    const premiumHits = premiumWords.filter(word => text.includes(word)).length;
    const standardHits = standardWords.filter(word => text.includes(word)).length;

    if (premiumHits >= 2) return { level: 'Premium', reason: 'Your project details suggest a larger or more advanced scope.' };
    if (premiumHits === 1 || standardHits >= 1) return { level: 'Standard', reason: 'Your project looks like a good fit for the Standard level.' };
    return { level: 'Basic', reason: 'Your current description looks suitable for the Basic level.' };
  };

  const injectStyles = () => {
    if (document.getElementById('vgs-ai-automation-styles')) return;
    const style = document.createElement('style');
    style.id = 'vgs-ai-automation-styles';
    style.textContent = `
      .vgs-ai-recommendation{border:1px solid ${GOLD};border-radius:10px;background:linear-gradient(135deg,#1d1d1d,#24200f);padding:13px;margin:2px 0 4px;line-height:1.45}
      .vgs-ai-recommendation strong{color:${GOLD}}
      .vgs-ai-recommendation .vgs-rec-title{font-weight:800;font-size:14px;margin-bottom:5px}
      .vgs-ai-recommendation .vgs-rec-reason{font-size:12px;color:#ddd;margin:4px 0 9px}
      .vgs-ai-recommendation button{width:100%;border:1px solid ${GOLD};background:${GOLD};color:#111;border-radius:8px;padding:9px;font-weight:700;cursor:pointer}
    `;
    document.head.appendChild(style);
  };

  const enhanceForm = form => {
    if (!form || form.dataset.vgsAutomationReady === '1') return;
    form.dataset.vgsAutomationReady = '1';

    const service = form.querySelector('#vgs-service');
    const level = form.querySelector('#vgs-level');
    const details = form.querySelector('#vgs-details');
    const budget = form.querySelector('#vgs-budget');
    const estimate = form.querySelector('#vgs-estimate');
    if (!service || !level || !details || !budget || !estimate) return;

    const panel = document.createElement('div');
    panel.className = 'vgs-ai-recommendation';
    panel.innerHTML = '<div class="vgs-rec-title">✨ VGS Recommendation</div><div class="vgs-rec-body">Choose a service and I will recommend the best package for your needs.</div>';
    estimate.parentNode.insertBefore(panel, estimate);

    const refresh = () => {
      const selectedService = service.value;
      const result = recommend(selectedService, parseBudget(budget.value), details.value);
      const prices = SERVICE_PRICES[selectedService] || SERVICE_PRICES.Other;
      const price = prices[result.level];
      const body = panel.querySelector('.vgs-rec-body');
      if (!selectedService) {
        body.innerHTML = 'Choose a service and I will recommend the best package for your needs.';
        return;
      }
      body.innerHTML = `<strong>${result.level}</strong> — ${money(price)}<div class="vgs-rec-reason">${result.reason}</div><button type="button" data-vgs-apply="${result.level}">Use ${result.level} recommendation</button>`;
    };

    [service, details, budget].forEach(el => {
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
    });

    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-vgs-apply]');
      if (!button) return;
      level.value = button.dataset.vgsApply;
      level.dispatchEvent(new Event('change', { bubbles: true }));
      level.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    refresh();
  };

  const scan = () => {
    const form = document.getElementById('vgs-ai-form');
    if (form) enhanceForm(form);
  };

  const init = () => {
    injectStyles();
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
