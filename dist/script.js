// Set resumeUrl to an uploaded résumé PDF; product checkout links belong on each product page.
const siteConfig = { email: 'thakurnandini0608@gmail.com', resumeUrl: null };
const contactDialog = document.querySelector('#contact-dialog');
const form = document.querySelector('#contact-form');
let contactSubject = '';
let previousFocus = null;
function showContact(kind, topic = '') {
  previousFocus = document.activeElement;
  const titles = {question:'Ask me a question',suggestion:'Suggest something',product:'Ask about this product',resume:'Request my résumé'};
  document.querySelector('#contact-title').textContent = titles[kind] || titles.question;
  document.querySelector('#contact-intro').textContent = kind === 'resume' ? 'The downloadable PDF is coming soon. Ask for the latest copy by email.' : kind === 'product' ? 'This product is in development. Ask about the planned release, contents, or pricing.' : 'Good questions are always welcome. So are book recommendations with a convincing argument.';
  contactSubject = `${titles[kind] || titles.question} — ${topic || document.title.split(' · ')[0]}`;
  const message = document.querySelector('#message');
  message.value = kind === 'resume' ? 'Hi Nandini,\n\nCould you share your latest résumé?\n\nThanks!' : kind === 'product' ? `Hi Nandini,\n\nI’m interested in ${topic}. Could you tell me more about the planned release?\n\nThanks!` : '';
  document.querySelector('#form-status').textContent = '';
  contactDialog.showModal();
}
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click',()=>showContact(button.dataset.contact,button.dataset.topic)));
document.querySelectorAll('[data-resume]').forEach(button => {
  if(siteConfig.resumeUrl) { button.innerHTML = 'Download résumé <span>↓</span>'; const status=document.querySelector('.resume-status');if(status)status.textContent='Résumé · PDF'; }
  button.addEventListener('click',()=>{if(siteConfig.resumeUrl){const a=document.createElement('a');a.href=siteConfig.resumeUrl;a.download='Nandini-Thakur-Resume.pdf';a.click();}else showContact('resume','Nandini Thakur');});
});
function closeDialog(){contactDialog.close();previousFocus?.focus();}
document.querySelector('[data-close]').addEventListener('click',closeDialog);
contactDialog.addEventListener('click',event=>{if(event.target===contactDialog){const r=contactDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
contactDialog.addEventListener('close',()=>previousFocus?.focus());
function messageBody(){return document.querySelector('#message').value.trim()+`\n\nSent from: ${location.href}`;}
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;location.href=`mailto:${siteConfig.email}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(messageBody())}`;document.querySelector('#form-status').textContent='Email draft opened. If your email app didn’t open, use “Copy message & email” below.';});
document.querySelector('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`To: ${siteConfig.email}\nSubject: ${contactSubject}\n\n${messageBody()}`);document.querySelector('#form-status').textContent='Copied. Paste it into your email app when you’re ready.';}catch{document.querySelector('#form-status').textContent=`Copy isn’t available in this browser. Email ${siteConfig.email} with your message.`;}});
const filters=[...document.querySelectorAll('[data-filter]')],search=document.querySelector('.search input');
let activeFilter='All notes';
function filterNotes(){let count=0;const term=(search?.value||'').trim().toLowerCase();document.querySelectorAll('.note-card').forEach(card=>{const match=(activeFilter==='All notes'||card.dataset.category===activeFilter)&&card.textContent.toLowerCase().includes(term);card.hidden=!match;if(match)count++;});const empty=document.querySelector('#no-results');if(empty)empty.hidden=count>0;}
filters.forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filterNotes();}));
search?.addEventListener('input',filterNotes);
