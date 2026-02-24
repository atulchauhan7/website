(function(){
var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document);
function throttle(fn,lim){let t;return function(){if(!t){fn.apply(this,arguments);t=true;setTimeout(()=>t=false,lim)}}}
function debounce(fn,w){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),w)}}
function lerp(a,b,f){return a+(b-a)*f}
window.addEventListener('load',function(){
const lo=document.getElementById('page-loader');
if(lo){setTimeout(()=>{lo.classList.add('loaded');document.body.classList.add('page-loaded');
if(!$('.cart-drawer.open,.search-overlay.open,.newsletter-popup-overlay.open'))document.body.classList.remove('overflow-hidden');
setTimeout(()=>{initScrollAnimations();initSmoothReveal()},300)},600)}
});
function initScrollProgress(){
const b=$('.scroll-progress');if(!b)return;
window.addEventListener('scroll',function(){const s=document.documentElement.scrollTop;const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;b.style.width=(s/h)*100+'%'},{passive:true});
}
initScrollProgress();
const header=$('.site-header');
const announcementBar=$('.announcement-bar');
let lastScroll=0;
function handleHeaderScroll(){
const cs=window.pageYOffset||document.documentElement.scrollTop;
if(header){
header.classList.toggle('scrolled',cs>50);
if(cs>300){if(cs>lastScroll+5)header.classList.add('header-hidden');else if(cs<lastScroll-5)header.classList.remove('header-hidden')}else header.classList.remove('header-hidden');
if(announcementBar){if(cs>150){announcementBar.classList.add('announcement-hidden');header.classList.remove('has-announcement')}else{announcementBar.classList.remove('announcement-hidden');header.classList.add('has-announcement')}}
}
lastScroll=cs;
}
window.addEventListener('scroll',throttle(handleHeaderScroll,16),{passive:true});
const menuToggle=$('.menu-toggle');
const mobileNav=$('.site-header__nav');
if(menuToggle&&mobileNav){menuToggle.addEventListener('click',function(){this.classList.toggle('active');mobileNav.classList.toggle('open');document.body.classList.toggle('overflow-hidden')})}
const cartDrawer=$('.cart-drawer');
const cartOverlay=$('.cart-drawer-overlay');
const cartTriggers=$$('[data-cart-trigger]');
const cartClose=$('.cart-drawer__close');
function openCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.add('open');cartOverlay.classList.add('open');document.body.classList.add('overflow-hidden')}}
function closeCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove('open');cartOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCartDrawer()}));
if(cartClose)cartClose.addEventListener('click',closeCartDrawer);
if(cartOverlay)cartOverlay.addEventListener('click',closeCartDrawer);
const searchOverlay=$('.search-overlay');
const searchTriggers=$$('[data-search-trigger]');
const searchClose=$('.search-overlay__close');
const searchInput=$('.search-overlay__input');
function openSearch(){if(searchOverlay){searchOverlay.classList.add('open');document.body.classList.add('overflow-hidden');setTimeout(()=>{if(searchInput)searchInput.focus()},400)}}
function closeSearch(){if(searchOverlay){searchOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
searchTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openSearch()}));
if(searchClose)searchClose.addEventListener('click',closeSearch);
var closeNewsletterPopup=function(){};
function initNewsletterPopup(){
const p=$('.newsletter-popup-overlay');if(!p)return;
const cb=p.querySelector('.newsletter-popup__close');
const closed=sessionStorage.getItem('luxe_newsletter_closed');
closeNewsletterPopup=function(){p.classList.remove('open');document.body.classList.remove('overflow-hidden');sessionStorage.setItem('luxe_newsletter_closed','true')};
if(!closed)setTimeout(()=>{p.classList.add('open');document.body.classList.add('overflow-hidden')},5000);
if(cb)cb.addEventListener('click',closeNewsletterPopup);
p.addEventListener('click',e=>{if(e.target===p)closeNewsletterPopup()});
window.closeNewsletterPopup=closeNewsletterPopup;
}
initNewsletterPopup();
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSearch();closeCartDrawer();if(typeof closeNewsletterPopup==='function')closeNewsletterPopup();
if(menuToggle&&menuToggle.classList.contains('active')){menuToggle.classList.remove('active');if(mobileNav)mobileNav.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
});
function initScrollAnimations(){
const els=$$('[data-animate]:not(.animated)');
if('IntersectionObserver' in window){
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const d=e.target.getAttribute('data-animate-delay')||0;setTimeout(()=>e.target.classList.add('animated'),parseInt(d));obs.unobserve(e.target)}})},{threshold:0.1,rootMargin:'0px 0px -60px 0px'});
els.forEach(el=>obs.observe(el));
}else els.forEach(el=>el.classList.add('animated'));
}
function initSmoothReveal(){
const secs=$$('.shopify-section:not(.revealed)');
if('IntersectionObserver' in window){
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target)}})},{threshold:0.05,rootMargin:'0px 0px -30px 0px'});
secs.forEach(s=>obs.observe(s));
}
}
function initParallax(){
const els=$$('.parallax-media');if(!els.length)return;
let raf=null;
function update(){els.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;const s=(r.top-window.innerHeight)/(r.height+window.innerHeight);const sp=parseFloat(el.dataset.parallaxSpeed)||0.2;el.style.transform='translate3d(0,'+(s*sp*100)+'px,0)'});raf=null}
window.addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(update)},{passive:true});
}
initParallax();
const backToTop=document.getElementById('back-to-top');
if(backToTop){
window.addEventListener('scroll',throttle(function(){backToTop.classList.toggle('visible',window.pageYOffset>500)},100),{passive:true});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}
function initCustomCursor(){
const c=$('.cursor-follower'),d=$('.cursor-follower-dot');
if(!c||!d||window.innerWidth<=1024)return;
let mx=0,my=0,cx=0,cy=0,dx=0,dy=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function anim(){cx=lerp(cx,mx,0.12);cy=lerp(cy,my,0.12);c.style.left=cx+'px';c.style.top=cy+'px';dx=lerp(dx,mx,0.25);dy=lerp(dy,my,0.25);d.style.left=dx+'px';d.style.top=dy+'px';requestAnimationFrame(anim)})();
$$('a,button,[data-cursor-hover]').forEach(el=>{el.addEventListener('mouseenter',()=>c.classList.add('hovering'));el.addEventListener('mouseleave',()=>c.classList.remove('hovering'))});
}
initCustomCursor();
function initProductGallery(){
const mi=$('.product-gallery__main img'),ths=$$('.product-gallery__thumb');
if(!mi||!ths.length)return;
ths.forEach(th=>{th.addEventListener('click',function(){const ns=this.dataset.fullImage||this.querySelector('img').src;mi.style.opacity='0';mi.style.transform='scale(0.95)';setTimeout(()=>{mi.src=ns;mi.style.opacity='1';mi.style.transform='scale(1)'},300);ths.forEach(t=>t.classList.remove('active'));this.classList.add('active')})});
if(mi){const ct=mi.parentElement;ct.addEventListener('mousemove',function(e){if(window.innerWidth<769)return;const r=ct.getBoundingClientRect();mi.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';mi.style.transform='scale(1.5)'});ct.addEventListener('mouseleave',()=>{mi.style.transform='scale(1)'})}
}
initProductGallery();
function initProductOptions(){$$('.product-option__value').forEach(v=>{v.addEventListener('click',function(){this.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(x=>x.classList.remove('selected'));this.classList.add('selected')})})}
initProductOptions();
function initQuantitySelector(){$$('.quantity-selector').forEach(s=>{const m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');if(m&&p&&i){m.addEventListener('click',()=>{const v=parseInt(i.value)-1;if(v>=1)i.value=v});p.addEventListener('click',()=>{i.value=parseInt(i.value)+1})}})}
initQuantitySelector();
function initAccordions(){$$('.accordion-trigger').forEach(tr=>{tr.addEventListener('click',function(){const it=this.closest('.accordion-item'),co=it.querySelector('.accordion-content'),inn=co.querySelector('.accordion-content__inner');if(it.classList.contains('open')){co.style.maxHeight='0';it.classList.remove('open')}else{const pa=it.closest('.product-accordion');if(pa)pa.querySelectorAll('.accordion-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.accordion-content').style.maxHeight='0'});it.classList.add('open');co.style.maxHeight=inn.scrollHeight+'px'}})})}
initAccordions();
function initRippleEffect(){$$('.ripple-effect').forEach(b=>{b.addEventListener('click',function(e){const r=document.createElement('span');r.classList.add('ripple');const rc=this.getBoundingClientRect();const sz=Math.max(rc.width,rc.height);r.style.width=r.style.height=sz+'px';r.style.left=e.clientX-rc.left-sz/2+'px';r.style.top=e.clientY-rc.top-sz/2+'px';this.appendChild(r);setTimeout(()=>r.remove(),600)})})}
initRippleEffect();
function initMagneticButtons(){
if(window.innerWidth<=1024)return;
$$('.magnetic-btn').forEach(b=>{b.addEventListener('mousemove',function(e){const r=this.getBoundingClientRect();this.style.transform='translate('+(e.clientX-r.left-r.width/2)*0.2+'px,'+(e.clientY-r.top-r.height/2)*0.2+'px)'});b.addEventListener('mouseleave',function(){this.style.transform='translate(0,0)'})});
}
initMagneticButtons();
function initTiltEffect(){
if(window.innerWidth<=1024)return;
$$('.tilt-effect').forEach(el=>{el.addEventListener('mousemove',function(e){const r=this.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-0.5;const y=(e.clientY-r.top)/r.height-0.5;this.style.transform='perspective(1000px) rotateX('+(y*-8)+'deg) rotateY('+(x*8)+'deg) scale(1.02)'});el.addEventListener('mouseleave',function(){this.style.transform='perspective(1000px) rotateX(0) rotateY(0) scale(1)'})});
}
initTiltEffect();

$$('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){const id=this.getAttribute('href');if(id==='#')return;const t=$(id);if(t){e.preventDefault();const off=header?header.offsetHeight:0;window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-off,behavior:'smooth'})}})});
function initAddToCart(){
$$('[data-add-to-cart]').forEach(f=>{f.addEventListener('submit',function(e){e.preventDefault();const btn=this.querySelector('[type="submit"]');const orig=btn.textContent;btn.disabled=true;btn.textContent='Adding...';btn.classList.add('pulse-animation');
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',body:new FormData(this)}).then(r=>r.json()).then(()=>{btn.textContent='Added! \u2713';updateCartCount();setTimeout(()=>{openCartDrawer();btn.textContent=orig;btn.disabled=false;btn.classList.remove('pulse-animation')},800)}).catch(()=>{btn.textContent='Error';setTimeout(()=>{btn.textContent=orig;btn.disabled=false;btn.classList.remove('pulse-animation')},1500)})})});
}
initAddToCart();
function updateCartCount(){fetch('/cart.js').then(r=>r.json()).then(c=>{$$('.cart-count').forEach(el=>{el.textContent=c.item_count;el.classList.add('elastic-scale');setTimeout(()=>el.classList.remove('elastic-scale'),600)})})}
function initLazyLoad(){
const imgs=$$('img[data-src]');
if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const i=e.target;i.src=i.dataset.src;if(i.dataset.srcset)i.srcset=i.dataset.srcset;i.classList.add('loaded');obs.unobserve(i)}})},{rootMargin:'100px 0px'});imgs.forEach(i=>obs.observe(i))}
}
initLazyLoad();
function initCarousels(){
$$('[data-carousel]').forEach(carousel=>{
const track=carousel.querySelector('[data-carousel-track]');
const slides=carousel.querySelectorAll('[data-carousel-slide]');
const sec=carousel.closest('.section,section,[data-section-id]')||carousel.parentElement;
const prevBtn=carousel.querySelector('[data-carousel-prev]')||sec.querySelector('[data-carousel-prev]');
const nextBtn=carousel.querySelector('[data-carousel-next]')||sec.querySelector('[data-carousel-next]');
const dotsC=carousel.querySelector('[data-carousel-dots]');
const autoplay=carousel.dataset.carouselAutoplay==='true';
const autoSpeed=parseInt(carousel.dataset.carouselSpeed)||5000;
const loop=carousel.dataset.carouselLoop!=='false';
const perView=parseInt(carousel.dataset.carouselPerView)||1;
if(!track||!slides.length)return;
const vp=carousel.querySelector('.carousel__viewport')||carousel;
let idx=0,timer=null,dragging=false,startX=0,curTr=0,prevTr=0;
function gpv(){if(window.innerWidth<=480)return Math.min(perView,1);if(window.innerWidth<=768)return Math.min(perView,2);if(window.innerWidth<=1024)return Math.min(perView,3);return perView}
function gsw(){return vp.offsetWidth/gpv()}
function ssw(){const w=gsw();slides.forEach(s=>{s.style.width=w+'px';s.style.flexShrink='0'})}
function gmi(){return Math.max(0,slides.length-gpv())}
function mkDots(){if(!dotsC)return;dotsC.innerHTML='';const mx=gmi();for(let i=0;i<=mx;i++){const d=document.createElement('button');d.classList.add('carousel__dot');if(i===0)d.classList.add('active');d.setAttribute('aria-label','Go to slide '+(i+1));(function(x){d.addEventListener('click',()=>go(x))})(i);dotsC.appendChild(d)}}
function upDots(){if(!dotsC)return;dotsC.querySelectorAll('.carousel__dot').forEach((d,i)=>d.classList.toggle('active',i===idx))}
function upBtns(){if(!loop){if(prevBtn)prevBtn.disabled=idx<=0;if(nextBtn)nextBtn.disabled=idx>=gmi()}}
function go(i,sm){if(sm===undefined)sm=true;const mx=gmi();idx=loop?(i<0?mx:i>mx?0:i):Math.max(0,Math.min(i,mx));const tx=-(idx*gsw());track.style.transition=sm?'transform 0.6s cubic-bezier(.25,.46,.45,.94)':'none';track.style.transform='translate3d('+tx+'px,0,0)';prevTr=tx;upDots();upBtns()}
function next(){go(idx+1)}function prev(){go(idx-1)}
function startAP(){if(!autoplay)return;stopAP();timer=setInterval(next,autoSpeed)}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
function dStart(e){dragging=true;startX=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;track.style.transition='none';track.style.cursor='grabbing';if(e.type.includes('mouse'))e.preventDefault();stopAP()}
function dMove(e){if(!dragging)return;const cx=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;curTr=prevTr+(cx-startX);track.style.transform='translate3d('+curTr+'px,0,0)'}
function dEnd(){if(!dragging)return;dragging=false;track.style.cursor='';const mv=curTr-prevTr;if(Math.abs(mv)>gsw()/4){if(mv<0)next();else prev()}else go(idx);startAP()}
if(prevBtn)prevBtn.addEventListener('click',()=>{prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',()=>{next();stopAP();startAP()});
track.addEventListener('touchstart',dStart,{passive:true});track.addEventListener('touchmove',dMove,{passive:true});track.addEventListener('touchend',dEnd);
track.addEventListener('mousedown',dStart);track.addEventListener('mousemove',dMove);track.addEventListener('mouseup',dEnd);track.addEventListener('mouseleave',()=>{if(dragging)dEnd()});
carousel.addEventListener('mouseenter',stopAP);carousel.addEventListener('mouseleave',startAP);
carousel.setAttribute('tabindex','0');carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){prev();stopAP()}if(e.key==='ArrowRight'){next();stopAP()}});
let rTimer;window.addEventListener('resize',()=>{clearTimeout(rTimer);rTimer=setTimeout(()=>{ssw();mkDots();go(Math.min(idx,gmi()),false)},250)});
ssw();mkDots();upBtns();go(0,false);startAP();
});
}
initCarousels();
function initTextScramble(){
const chars='!<>-_\\/[]{}=+*^?#________';
$$('[data-text-scramble]').forEach(el=>{
const orig=el.textContent;
new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){let it=0;const iv=setInterval(()=>{el.textContent=orig.split('').map((c,i)=>i<it?orig[i]:chars[Math.floor(Math.random()*chars.length)]).join('');if(it>=orig.length)clearInterval(iv);it+=0.5},30);obs.unobserve(e.target)}})},{threshold:0.5}).observe(el);
});
}
initTextScramble();
function initSectionReveals(){
const grids=$$('[data-stagger-reveal]');
if('IntersectionObserver' in window){
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){Array.from(e.target.children).forEach((it,i)=>{setTimeout(()=>{it.style.opacity='1';it.style.transform='translateY(0)'},i*120)});obs.unobserve(e.target)}})},{threshold:0.1});
grids.forEach(g=>{Array.from(g.children).forEach(it=>{it.style.opacity='0';it.style.transform='translateY(40px)';it.style.transition='opacity 0.6s ease,transform 0.6s ease'});obs.observe(g)});
}
}
initSectionReveals();
function initNumberTicker(){
$$('[data-ticker]').forEach(t=>{
const tgt=parseInt(t.dataset.ticker),pfx=t.dataset.tickerPrefix||'',sfx=t.dataset.tickerSuffix||'';
new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){const st=performance.now();(function up(ct){const p=Math.min((ct-st)/2000,1);const eased=1-Math.pow(1-p,3);t.textContent=pfx+Math.round(tgt*eased).toLocaleString()+sfx;if(p<1)requestAnimationFrame(up)})(st);obs.unobserve(e.target)}})},{threshold:0.5}).observe(t);
});
}
initNumberTicker();
function initHeroSlideshow(){
$$('[data-hero-slideshow]').forEach(h=>{
const sl=h.querySelectorAll('.hero-slide');if(sl.length<=1)return;
let cur=0;const iv=parseInt(h.dataset.heroSpeed)||6000;
setInterval(()=>{cur=(cur+1)%sl.length;sl.forEach((s,i)=>s.classList.toggle('hero-slide--active',i===cur))},iv);
sl.forEach((s,i)=>s.classList.toggle('hero-slide--active',i===0));
});
}
initHeroSlideshow();
function initVideoAutoplay(){
const vids=$$('video[data-autoplay-scroll]');if(!vids.length)return;
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.play().catch(()=>{});else e.target.pause()})},{threshold:0.3});
vids.forEach(v=>obs.observe(v));
}
initVideoAutoplay();
document.addEventListener('shopify:section:load',function(){initScrollAnimations();initSmoothReveal();initProductGallery();initProductOptions();initQuantitySelector();initAccordions();initRippleEffect();initLazyLoad();initCarousels();initTextScramble();initSectionReveals();initNumberTicker();initMagneticButtons();initTiltEffect();initHeroSlideshow()});
document.addEventListener('DOMContentLoaded',function(){initScrollAnimations();initSmoothReveal();setTimeout(function(){if(!$('.cart-drawer.open,.search-overlay.open,.newsletter-popup-overlay.open,.site-header__nav.open'))document.body.classList.remove('overflow-hidden')},3000)});
})();