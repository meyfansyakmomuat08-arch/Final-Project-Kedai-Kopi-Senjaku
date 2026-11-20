/* Kopi Senja – interaksi dan animasi multi-halaman */
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* Mode terang/gelap (tersimpan lintas halaman) */
const html=document.documentElement;
try{const t=localStorage.getItem('tema');if(t)html.setAttribute('data-bs-theme',t)}catch{}
$('#themeBtn')?.addEventListener('click',()=>{const n=html.getAttribute('data-bs-theme')==='dark'?'light':'dark';
  html.setAttribute('data-bs-theme',n);try{localStorage.setItem('tema',n)}catch{}});

/* Navbar kaca, progres scroll, tombol ke atas */
const nav=$('.site-nav'),prog=$('#prog'),toTop=$('#toTop');
function onScroll(){nav?.classList.toggle('scrolled',scrollY>40);toTop?.classList.toggle('show',scrollY>450);
  const h=document.documentElement.scrollHeight-innerHeight;if(prog)prog.style.width=(h>0?scrollY/h*100:0)+'%';}
addEventListener('scroll',onScroll,{passive:true});onScroll();
toTop?.addEventListener('click',()=>scrollTo({top:0,behavior:calm?'auto':'smooth'}));

/* Muncul saat scroll + penghitung angka */
function countUp(el){if(el.dataset.done)return;el.dataset.done=1;const to=+el.dataset.count;let t0;
  const f=t=>{t0=t0||t;const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f);}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');
  if(e.target.dataset.count)countUp(e.target);io.unobserve(e.target);}),{threshold:.12});
$$('.rv,.num').forEach((el,i)=>{el.style.transitionDelay=(i%4)*90+'ms';io.observe(el);});
if(calm)$$('.num').forEach(el=>el.textContent=el.dataset.count);

/* Biji kopi melayang + garis jaringan, bereaksi pada mouse */
(function(){const c=$('#beans');if(!c||calm)return;const x=c.getContext('2d');let W,H,P=[],m={x:-999,y:-999};
  const size=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
    P=Array.from({length:W<600?24:50},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*2+1}))};
  size();addEventListener('resize',size);
  $('.hero')?.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();m={x:e.clientX-r.left,y:e.clientY-r.top}});
  (function draw(){x.clearRect(0,0,W,H);
    P.forEach((a,i)=>{a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>H)a.vy*=-1;
      if(Math.hypot(a.x-m.x,a.y-m.y)<150){a.x+=(m.x-a.x)*.012;a.y+=(m.y-a.y)*.012}
      x.fillStyle='rgba(227,182,111,.75)';x.beginPath();x.ellipse(a.x,a.y,a.r*1.4,a.r,0,0,7);x.fill();
      for(let j=i+1;j<P.length;j++){const b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<115){x.strokeStyle='rgba(217,160,83,'+(1-d/115)*.45+')';x.lineWidth=.7;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}});
    requestAnimationFrame(draw)})();})();

/* Kartu miring 3D mengikuti kursor */
if(fine&&!calm){
  document.addEventListener('mousemove',e=>{const c=e.target.closest?.('.tilt');if(!c)return;
    const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(800px) rotateY(${px*8}deg) rotateX(${-py*8}deg) translateY(-4px)`;c.style.boxShadow='0 18px 40px rgba(0,0,0,.3)';});
  document.addEventListener('mouseout',e=>{const c=e.target.closest?.('.tilt');if(c){c.style.transform='';c.style.boxShadow=''}});
  $$('.btn-gold').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();
    b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.15}px,${(e.clientY-r.top-r.height/2)*.25}px)`});
    b.addEventListener('mouseleave',()=>b.style.transform='')});}

/* Cari dan filter menu (berfungsi di menu.html maupun mengarahkan dari halaman lain) */
const rows=$$('#menuTable tbody tr'),empty=$('#emptyMsg');
let activeCat='';
function updateCatButtons(cat){
  $$('[data-filter-cat]').forEach(btn=>{
    const match=btn.dataset.filterCat===cat;
    btn.classList.toggle('btn-gold',match);
    btn.classList.toggle('btn-outline-gold',!match);
  });
}
function filter(q,cat){
  activeCat=cat;
  updateCatButtons(cat);
  if(!rows.length)return;
  q=(q||'').trim().toLowerCase();let n=0;
  rows.forEach(r=>{const ok=(!q||r.textContent.toLowerCase().includes(q))&&(!cat||r.dataset.cat===cat);r.hidden=!ok;if(ok)n++});
  if(empty)empty.classList.toggle('d-none',n>0);
}

$('#searchForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const q=$('#searchInput')?.value.trim()||'';
  if(rows.length){
    filter(q,activeCat);
    location.hash='#harga';
  }else{
    location.href='menu.html'+(q?'?q='+encodeURIComponent(q):'');
  }
});
$('#searchInput')?.addEventListener('input',e=>{if(rows.length)filter(e.target.value,activeCat);});
$$('[data-filter-cat]').forEach(btn=>btn.addEventListener('click',()=>filter($('#searchInput')?.value||'',btn.dataset.filterCat)));

/* Baca parameter URL ?q= atau ?cat= saat membuka menu.html */
if(rows.length){
  const params=new URLSearchParams(location.search);
  const qParam=params.get('q')||'';
  const catParam=params.get('cat')||'';
  if(qParam&&$('#searchInput'))$('#searchInput').value=qParam;
  if(qParam||catParam)filter(qParam,catParam);
}

/* Simpan dan tampilkan riwayat pesanan di localStorage */
function saveOrder(o){
  try{
    const p=JSON.parse(localStorage.getItem('pesanan')||'[]');
    p.unshift(o);
    localStorage.setItem('pesanan',JSON.stringify(p.slice(0,10)));
  }catch{}
  renderOrderHistory();
}
function renderOrderHistory(){
  const list=$('#orderHistoryList');if(!list)return;
  let items=[];
  try{items=JSON.parse(localStorage.getItem('pesanan')||'[]');}catch{}
  list.innerHTML='';
  if(!items.length){
    list.innerHTML='<li class="list-group-item bg-transparent text-secondary px-0">Belum ada ringkasan pesanan.</li>';
    return;
  }
  items.forEach(item=>{
    const li=document.createElement('li');
    li.className='list-group-item bg-transparent px-0 border-secondary-subtle';
    li.textContent=`${item.jumlah}x ${item.menu} — ${item.nama} (${item.tanggal}${item.jam?' '+item.jam:''})`;
    list.appendChild(li);
  });
}
renderOrderHistory();
$('#clearHistoryBtn')?.addEventListener('click',()=>{
  try{localStorage.removeItem('pesanan');}catch{}
  renderOrderHistory();
});

/* Modal pesan cepat */
const modal=$('#bookingModal'),form=$('#bookingForm'),msg=$('#bookingMessage');
modal?.addEventListener('show.bs.modal',e=>{const b=e.relatedTarget;
  $('#bookingDestination').value=b?.dataset.destination||'';msg.textContent='';
  const d=$('#bookingDate'),t=new Date();d.min=t.toISOString().slice(0,10);if(!d.value)d.value=d.min;});
form?.addEventListener('submit',e=>{e.preventDefault();
  if(!form.checkValidity()){form.reportValidity();return;}
  const o={menu:form.destination.value,nama:form.name.value.trim(),tanggal:form.date.value,jumlah:+form.guests.value};
  saveOrder(o);
  const teks=`Halo Kopi Senja, saya ${o.nama} ingin memesan ${o.jumlah}x ${o.menu} untuk diambil pada ${o.tanggal}.`;
  msg.innerHTML='';const s=document.createElement('span');s.textContent=`Ringkasan: ${o.jumlah}x ${o.menu}, atas nama ${o.nama}, ${o.tanggal}. `;
  const a=document.createElement('a');a.href='https://wa.me/6281234567890?text='+encodeURIComponent(teks);a.target='_blank';a.rel='noopener';a.textContent='Kirim via WhatsApp';
  msg.append(s,a);});

/* Formulir pemesanan lengkap di halaman pesan.html */
const pageForm=$('#pageOrderForm'),pageResult=$('#pageOrderResult');
if(pageForm){
  const od=$('#orderDate'),today=new Date().toISOString().slice(0,10);
  if(od){od.min=today;if(!od.value)od.value=today;}
  pageForm.addEventListener('submit',e=>{
    e.preventDefault();
    if(!pageForm.checkValidity()){pageForm.reportValidity();return;}
    const o={
      nama:$('#orderName').value.trim(),
      layanan:$('#orderType').value,
      menu:$('#orderMenu').value,
      jumlah:+$('#orderQty').value,
      tanggal:$('#orderDate').value,
      jam:$('#orderTime').value,
      catatan:$('#orderNote').value.trim()
    };
    saveOrder(o);
    const teks=`Halo Kopi Senja, saya ${o.nama} (${o.layanan}) ingin memesan ${o.jumlah}x ${o.menu} pada ${o.tanggal} pukul ${o.jam}.${o.catatan?' Catatan: '+o.catatan:''}`;
    pageResult.innerHTML='';
    const s=document.createElement('span');
    s.textContent=`Ringkasan siap: ${o.jumlah}x ${o.menu} (${o.layanan}) a.n. ${o.nama}, ${o.tanggal} ${o.jam}. `;
    const a=document.createElement('a');
    a.href='https://wa.me/6281234567890?text='+encodeURIComponent(teks);
    a.target='_blank';a.rel='noopener';a.textContent='Kirim ke WhatsApp Kedai →';
    pageResult.append(s,a);
  });
}
