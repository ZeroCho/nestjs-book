// 노드 강의 슬라이드 공용 내비게이션
(function(){
  const deck = document.getElementById('deck');
  if(!deck) return;
  const slides = Array.from(deck.querySelectorAll('.slide'));

  const bar = document.createElement('div'); bar.className='progress'; document.body.appendChild(bar);
  const hud = document.createElement('div'); hud.className='hud'; document.body.appendChild(hud);
  const help = document.createElement('div'); help.className='help'; help.textContent='← → 이동 · F 전체화면'; document.body.appendChild(help);

  let idx = 0;
  const clamp = n => Math.max(0, Math.min(slides.length-1, n));
  function update(){ hud.textContent = (idx+1)+' / '+slides.length; bar.style.width = ((idx+1)/slides.length*100)+'%'; }
  function go(n){ idx = clamp(n); slides[idx].scrollIntoView({behavior:'smooth'}); update(); }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ const i = slides.indexOf(e.target); if(i>=0){ idx=i; update(); } } });
  }, {root:deck, threshold:0.6});
  slides.forEach(s=>io.observe(s));

  document.addEventListener('keydown', (e)=>{
    if(['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)){ e.preventDefault(); go(idx+1); }
    else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); go(idx-1); }
    else if(e.key==='Home'){ e.preventDefault(); go(0); }
    else if(e.key==='End'){ e.preventDefault(); go(slides.length-1); }
    else if(e.key==='f'||e.key==='F'){ if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
  });
  update();
})();
