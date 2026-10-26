(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('.desk-link,.story-intro,.chapter,.purpose-pullquote,.current-chapter,.afk-grid article,.nerd-signature,.discord-note,.note-card,.product-card,.empty-projects,.idea-list details,.template-row,.sample-banner,.release-note,.case-stat')];
  const headings = [...document.querySelectorAll('.hero-copy,.hero-art,.page-intro,.story-heading,.afk-heading,.desk-heading,.finance-blogs-heading,.article-header,.conversation')];
  const targets = [...new Set([...cards, ...headings])];
  let manualOff = false;
  try { manualOff = localStorage.getItem('portfolio-motion') === 'off'; } catch {}
  let enabled = !reduced.matches && !manualOff;
  const animations = new Map();
  const seen = new WeakSet();
  let observer;
  const button = document.createElement('button');
  button.className = 'motion-preference';
  button.type = 'button';
  document.querySelector('footer')?.append(button);
  function sync() {
    document.documentElement.classList.toggle('motion-enabled', enabled);
    document.documentElement.classList.toggle('motion-disabled', !enabled);
    button.textContent = reduced.matches ? 'Motion reduced · system setting' : enabled ? 'Reduce page motion' : 'Enable page motion';
    button.disabled = reduced.matches;
    button.setAttribute('aria-pressed', String(!enabled));
  }
  function enter(el) {
    if (!enabled || seen.has(el) || el.hidden || !el.getClientRects().length) return;
    // Unobserve before moving: the entrance itself must never trigger another entrance.
    seen.add(el);
    observer.unobserve(el);
    const siblings = [...el.parentElement.children].filter(s => targets.includes(s));
    const delay = Math.max(0, Math.min(siblings.indexOf(el), 3)) * 40;
    const animation = el.animate([
      {opacity: 0, translate: '0 20px'},
      {opacity: 1, translate: '0 0'}
    ], {duration: 500, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
    animations.set(el, animation);
    const cleanup = () => { if (animations.get(el) === animation) animations.delete(el); };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }
  function start() {
    observer?.disconnect();
    animations.forEach(a=>a.cancel()); animations.clear();
    sync();
    if (!enabled || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const currentObserver = new IntersectionObserver(entries => {
      if (observer !== currentObserver) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) enter(entry.target);
      });
    }, {threshold:0, rootMargin:'0px 0px -16px 0px'});
    observer = currentObserver;
    targets.forEach(el => { if (!seen.has(el)) observer.observe(el); });
  }
  cards.forEach(card => card.classList.add('motion-card'));
  button.addEventListener('click',()=>{
    manualOff=!manualOff;enabled=!manualOff&&!reduced.matches;
    try{localStorage.setItem('portfolio-motion',manualOff?'off':'on');}catch{}
    start();
  });
  reduced.addEventListener('change',()=>{enabled=!reduced.matches&&!manualOff;start();});
  start();
})();
