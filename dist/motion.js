(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('.desk-link,.story-intro,.chapter,.purpose-pullquote,.current-chapter,.afk-grid article,.nerd-signature,.discord-note,.note-card,.product-card,.empty-projects,.idea-list details,.template-row,.sample-banner,.release-note,.case-stat')];
  const headings = [...document.querySelectorAll('.hero-copy,.hero-art,.page-intro,.story-heading,.afk-heading,.desk-heading,.finance-blogs-heading,.article-header,.conversation')];
  const targets = [...new Set([...cards, ...headings])];
  let manualOff = false;
  try { manualOff = localStorage.getItem('portfolio-motion') === 'off'; } catch {}
  let enabled = !reduced.matches && !manualOff;
  const animations = new Map();
  let observer;
  const button = document.createElement('button');
  button.className = 'motion-preference';
  button.type = 'button';
  document.querySelector('footer')?.append(button);
  function sync() {
    document.documentElement.classList.toggle('motion-enabled', enabled);
    button.textContent = reduced.matches ? 'Motion reduced · system setting' : enabled ? 'Reduce page motion' : 'Enable page motion';
    button.disabled = reduced.matches;
    button.setAttribute('aria-pressed', String(!enabled));
  }
  function enter(el) {
    if (!enabled || el.hidden || !el.getClientRects().length) return;
    animations.get(el)?.cancel();
    const siblings = [...el.parentElement.children].filter(s => targets.includes(s));
    const delay = Math.min(siblings.indexOf(el), 3) * 65;
    const card = cards.includes(el);
    const animation = el.animate([
      {opacity:0, translate:card?'0 48px':'0 32px', scale:card?'.97':'1', offset:0},
      {opacity:1, translate:card?'0 -7px':'0 -3px', scale:'1', offset:.65},
      {opacity:1, translate:'0 2px', scale:'1', offset:.83},
      {opacity:1, translate:'0 0', scale:'1', offset:1}
    ], {duration:card?800:700, delay, easing:'cubic-bezier(.2,.65,.25,1)', fill:'backwards'});
    animations.set(el, animation);
    animation.onfinish = () => { if(animations.get(el) === animation) animations.delete(el); };
  }
  function start() {
    observer?.disconnect();
    animations.forEach(a=>a.cancel()); animations.clear();
    sync();
    if (!enabled || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) enter(entry.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px -35px 0px'});
    targets.forEach(el=>observer.observe(el));
  }
  cards.forEach(card => {
    card.classList.add('motion-card');
    let frame=0, x=0, y=0;
    const reset=()=>{
      cancelAnimationFrame(frame);frame=0;
      card.style.removeProperty('--card-rx');card.style.removeProperty('--card-ry');
      card.classList.remove('card-pointer');
    };
    card.addEventListener('pointermove',e=>{
      if(!enabled || !finePointer.matches || e.pointerType==='touch')return;
      const rect=card.getBoundingClientRect();
      x=((e.clientX-rect.left)/rect.width-.5)*5;
      y=((e.clientY-rect.top)/rect.height-.5)*-4;
      if(!frame)frame=requestAnimationFrame(()=>{
        card.style.setProperty('--card-rx',`${y}deg`);
        card.style.setProperty('--card-ry',`${x}deg`);
        card.classList.add('card-pointer');frame=0;
      });
    });
    card.addEventListener('pointerleave',reset);
    card.addEventListener('pointercancel',reset);
    card.addEventListener('focusout',reset);
  });
  button.addEventListener('click',()=>{
    manualOff=!manualOff;enabled=!manualOff&&!reduced.matches;
    try{localStorage.setItem('portfolio-motion',manualOff?'off':'on');}catch{}
    start();
  });
  reduced.addEventListener('change',()=>{enabled=!reduced.matches&&!manualOff;start();});
  start();
})();
