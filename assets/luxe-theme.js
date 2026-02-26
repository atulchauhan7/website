(function(){
var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document);
function throttle(fn,lim){let t;return function(){if(!t){fn.apply(this,arguments);t=true;setTimeout(()=>t=false,lim)}}}
function debounce(fn,w){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),w)}}

/* === PAGE LOADER === */
window.addEventListener('load',function(){
const lo=document.getElementById('page-loader');
if(lo){setTimeout(()=>{lo.classList.add('loaded');document.body.classList.add('page-loaded');
setTimeout(()=>{initScrollAnimations();initSmoothReveal()},300)},600)}
});

/* === SCROLL PROGRESS === */
(function(){
const b=$('.scroll-progress');if(!b)return;
window.addEventListener('scroll',function(){const s=document.documentElement.scrollTop;const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;b.style.width=(s/h)*100+'%'},{passive:true});
})();

/* === HEADER SCROLL === */
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

/* === MOBILE MENU === */
const menuToggle=$('.menu-toggle');
const mobileNav=$('.site-header__nav');
if(menuToggle&&mobileNav){menuToggle.addEventListener('click',function(){this.classList.toggle('active');mobileNav.classList.toggle('open');document.body.classList.toggle('overflow-hidden')})}

/* === CART DRAWER === */
const cartDrawer=$('.cart-drawer');
const cartOverlay=$('.cart-drawer-overlay');
const cartTriggers=$$('[data-cart-trigger]');
const cartClose=$('.cart-drawer__close');
function openCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.add('open');cartOverlay.classList.add('open');document.body.classList.add('overflow-hidden')}}
function closeCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove('open');cartOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCartDrawer()}));
if(cartClose)cartClose.addEventListener('click',closeCartDrawer);
if(cartOverlay)cartOverlay.addEventListener('click',closeCartDrawer);

/* Refresh cart drawer HTML + count */
function refreshCart(){
fetch('/?sections=cart-drawer').then(r=>r.json()).then(data=>{
var html=data['cart-drawer'];
if(html){
var tmp=document.createElement('div');tmp.innerHTML=html;
var newDrawer=tmp.querySelector('.cart-drawer');
var newOverlay=tmp.querySelector('.cart-drawer-overlay');
if(newDrawer&&cartDrawer)cartDrawer.innerHTML=newDrawer.innerHTML;
/* re-bind close */
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
/* re-bind qty buttons */
initCartQty();
}
}).catch(()=>{});
fetch('/cart.js').then(r=>r.json()).then(c=>{
$$('.cart-count').forEach(el=>{el.textContent=c.item_count;el.classList.add('elastic-scale');setTimeout(()=>el.classList.remove('elastic-scale'),600)});
}).catch(()=>{});
}

function initCartQty(){
cartDrawer.querySelectorAll('.cart-drawer__qty').forEach(wrap=>{
var line=wrap.closest('[data-line]');if(!line)return;
var idx=line.getAttribute('data-line');
wrap.querySelector('[data-qty-minus]')&&wrap.querySelector('[data-qty-minus]').addEventListener('click',function(){
var cur=parseInt(wrap.querySelector('span').textContent)||1;
changeCartLine(idx,Math.max(0,cur-1));
});
wrap.querySelector('[data-qty-plus]')&&wrap.querySelector('[data-qty-plus]').addEventListener('click',function(){
var cur=parseInt(wrap.querySelector('span').textContent)||1;
changeCartLine(idx,cur+1);
});
});
}
function changeCartLine(line,qty){
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({line:parseInt(line),quantity:qty})}).then(r=>r.json()).then(()=>refreshCart()).catch(()=>{});
}
if(cartDrawer)initCartQty();

/* === SEARCH OVERLAY === */
const searchOverlay=$('.search-overlay');
const searchTriggers=$$('[data-search-trigger]');
const searchClose=$('.search-overlay__close');
const searchInput=$('.search-overlay__input');
function openSearch(){if(searchOverlay){searchOverlay.classList.add('open');document.body.classList.add('overflow-hidden');setTimeout(()=>{if(searchInput)searchInput.focus()},400)}}
function closeSearch(){if(searchOverlay){searchOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
searchTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openSearch()}));
if(searchClose)searchClose.addEventListener('click',closeSearch);

/* === NEWSLETTER POPUP === */
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

/* === ESC KEY === */
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSearch();closeCartDrawer();if(typeof closeNewsletterPopup==='function')closeNewsletterPopup();
if(menuToggle&&menuToggle.classList.contains('active')){menuToggle.classList.remove('active');if(mobileNav)mobileNav.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
});

/* === SCROLL ANIMATIONS === */
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
function initSectionReveals(){
const grids=$$('[data-stagger-reveal]');
if('IntersectionObserver' in window){
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){Array.from(e.target.children).forEach((it,i)=>{setTimeout(()=>{it.style.opacity='1';it.style.transform='translateY(0)'},i*120)});obs.unobserve(e.target)}})},{threshold:0.1});
grids.forEach(g=>{Array.from(g.children).forEach(it=>{it.style.opacity='0';it.style.transform='translateY(40px)';it.style.transition='opacity 0.6s ease,transform 0.6s ease'});obs.observe(g)});
}
}

/* === BACK TO TOP === */
const backToTop=document.getElementById('back-to-top');
if(backToTop){
window.addEventListener('scroll',throttle(function(){backToTop.classList.toggle('visible',window.pageYOffset>500)},100),{passive:true});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

/* === HERO SLIDER (dots + arrows + autoplay) === */
function initHeroSlideshow(){
$$('[data-hero-slideshow]').forEach(h=>{
const slides=h.querySelectorAll('.hero-slide');
if(slides.length<=1)return;
let cur=0;const speed=parseInt(h.dataset.heroSpeed)||6000;let timer=null;
function goTo(i){
if(i<0)i=slides.length-1;if(i>=slides.length)i=0;
cur=i;slides.forEach((s,idx)=>s.classList.toggle('hero-slide--active',idx===cur));
h.querySelectorAll('.hero-slider__dot').forEach((d,idx)=>d.classList.toggle('active',idx===cur));
}
function next(){goTo(cur+1)}
function prev(){goTo(cur-1)}
function startAP(){stopAP();timer=setInterval(next,speed)}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
/* Dots */
h.querySelectorAll('.hero-slider__dot').forEach(d=>{d.addEventListener('click',function(){goTo(parseInt(this.getAttribute('data-slide-index')));stopAP();startAP()})});
/* Arrows */
var prevBtn=h.querySelector('.hero-slider__arrow--prev');
var nextBtn=h.querySelector('.hero-slider__arrow--next');
if(prevBtn)prevBtn.addEventListener('click',function(){prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',function(){next();stopAP();startAP()});
/* Touch swipe */
var touchStartX=0;
h.addEventListener('touchstart',function(e){touchStartX=e.touches[0].clientX},{passive:true});
h.addEventListener('touchend',function(e){var diff=touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>50){if(diff>0)next();else prev();stopAP();startAP()}},{passive:true});
/* Pause on hover */
h.addEventListener('mouseenter',stopAP);h.addEventListener('mouseleave',startAP);
goTo(0);startAP();
});
}
initHeroSlideshow();

/* === QUICK ADD TO CART (product card overlay) === */
function initQuickAdd(){
document.addEventListener('click',function(e){
/* Quick-view: navigate to product page */
var qv=e.target.closest('[data-quick-view]');
if(qv){e.preventDefault();var url=qv.getAttribute('data-quick-view');if(url)window.location.href=url;return}
/* Quick-add to cart */
var btn=e.target.closest('[data-quick-add]');
if(!btn)return;
e.preventDefault();
var variantId=btn.getAttribute('data-quick-add');
if(!variantId)return;
var orig=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span>Adding...</span>';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:parseInt(variantId),quantity:1}]})}).then(r=>{if(!r.ok)throw new Error('Add failed');return r.json()}).then(()=>{
btn.innerHTML='<span>Added!</span>';refreshCart();
setTimeout(()=>{openCartDrawer();btn.innerHTML=orig;btn.disabled=false},800);
}).catch(()=>{btn.innerHTML='<span>Error</span>';setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false},1500)});
});
}
initQuickAdd();

/* === ADD TO CART FORM (product page) === */
function initAddToCart(){
$$('[data-add-to-cart],[data-product-form]').forEach(f=>{f.addEventListener('submit',function(e){e.preventDefault();const btn=this.querySelector('[type="submit"]');const orig=btn.textContent;btn.disabled=true;btn.textContent='Adding...';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',body:new FormData(this)}).then(r=>r.json()).then(()=>{btn.textContent='Added! \u2713';refreshCart();setTimeout(()=>{openCartDrawer();btn.textContent=orig;btn.disabled=false},800)}).catch(()=>{btn.textContent='Error';setTimeout(()=>{btn.textContent=orig;btn.disabled=false},1500)})})});
}
initAddToCart();

/* === FOOTER MOBILE TOGGLE === */
function initFooterToggle(){
$$('.site-footer__toggle').forEach(btn=>{
btn.addEventListener('click',function(){
this.closest('.site-footer__menu-col').classList.toggle('open');
});
});
}
initFooterToggle();

/* === PRODUCT GALLERY === */
function initProductGallery(){
const mi=$('.product-gallery__main img'),ths=$$('.product-gallery__thumb');
if(!mi||!ths.length)return;
ths.forEach(th=>{th.addEventListener('click',function(){const ns=this.dataset.fullImage||this.querySelector('img').src;mi.style.opacity='0';mi.style.transform='scale(0.95)';setTimeout(()=>{mi.src=ns;mi.style.opacity='1';mi.style.transform='scale(1)'},300);ths.forEach(t=>t.classList.remove('active'));this.classList.add('active')})});
if(mi){const ct=mi.parentElement;ct.addEventListener('mousemove',function(e){if(window.innerWidth<769)return;const r=ct.getBoundingClientRect();mi.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';mi.style.transform='scale(1.5)'});ct.addEventListener('mouseleave',()=>{mi.style.transform='scale(1)'})}
}
initProductGallery();

/* === PRODUCT OPTIONS === */
function initProductOptions(){
var form=$('[data-product-form]');if(!form)return;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var addBtn=form.querySelector('[type="submit"]');
$$('.product-option__value').forEach(function(v){
v.addEventListener('click',function(){
this.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(function(x){x.classList.remove('selected')});
this.classList.add('selected');
/* Build selected options array */
var selected=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var active=opt.querySelector('.product-option__value.selected');
if(active)selected.push(active.getAttribute('data-value'));
});
/* Find matching variant */
var match=null;
for(var i=0;i<variants.length;i++){
var v=variants[i];var opts=v.options||[];var isMatch=true;
for(var j=0;j<selected.length;j++){if(opts[j]!==selected[j]){isMatch=false;break}}
if(isMatch){match=v;break}
}
if(match&&hiddenInput){
hiddenInput.value=match.id;
/* Update price display */
var priceEl=form.closest('.product-info,.product-page').querySelector('.product-info__price');
if(priceEl&&window.theme&&window.theme.moneyFormat){
priceEl.textContent=match.price?(match.price/100).toLocaleString('en-US',{style:'currency',currency:window.theme.currency||'USD'}):priceEl.textContent;
}
/* Update availability */
if(addBtn){
if(match.available){addBtn.disabled=false;addBtn.textContent='Add to Cart'}
else{addBtn.disabled=true;addBtn.textContent='Sold Out'}
}
}else if(!match&&addBtn){
addBtn.disabled=true;addBtn.textContent='Unavailable';
}
});
});
}
initProductOptions();

/* === QUANTITY SELECTOR === */
function initQuantitySelector(){$$('.quantity-selector').forEach(s=>{const m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');if(m&&p&&i){m.addEventListener('click',()=>{const v=parseInt(i.value)-1;if(v>=1)i.value=v});p.addEventListener('click',()=>{i.value=parseInt(i.value)+1})}})}
initQuantitySelector();

/* === ACCORDIONS === */
function initAccordions(){$$('.accordion-trigger').forEach(tr=>{tr.addEventListener('click',function(){const it=this.closest('.accordion-item'),co=it.querySelector('.accordion-content'),inn=co.querySelector('.accordion-content__inner');if(it.classList.contains('open')){co.style.maxHeight='0';it.classList.remove('open')}else{const pa=it.closest('.product-accordion');if(pa)pa.querySelectorAll('.accordion-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.accordion-content').style.maxHeight='0'});it.classList.add('open');co.style.maxHeight=inn.scrollHeight+'px'}})})}
initAccordions();

/* === LAZY LOAD === */
function initLazyLoad(){
const imgs=$$('img[data-src]');
if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const i=e.target;i.src=i.dataset.src;if(i.dataset.srcset)i.srcset=i.dataset.srcset;i.classList.add('loaded');obs.unobserve(i)}})},{rootMargin:'100px 0px'});imgs.forEach(i=>obs.observe(i))}
}
initLazyLoad();

/* === CAROUSELS === */
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
let idx=0,timer=null,dragging=false,isDragged=false,startX=0,curTr=0,prevTr=0;
var DRAG_THRESHOLD=8;
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
function dStart(e){dragging=true;isDragged=false;startX=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;track.style.transition='none';stopAP()}
function dMove(e){if(!dragging)return;var cx=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;if(!isDragged&&Math.abs(cx-startX)>DRAG_THRESHOLD){isDragged=true;track.style.cursor='grabbing'}if(isDragged){curTr=prevTr+(cx-startX);track.style.transform='translate3d('+curTr+'px,0,0)'}}
function dEnd(){if(!dragging)return;dragging=false;track.style.cursor='';if(isDragged){var mv=curTr-prevTr;if(Math.abs(mv)>gsw()/4){if(mv<0)next();else prev()}else go(idx)}startAP()}
track.addEventListener('click',function(e){if(isDragged){e.preventDefault();e.stopPropagation();isDragged=false}},true);
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

/* === VIDEO AUTOPLAY === */
function initVideoAutoplay(){
const vids=$$('video[data-autoplay-scroll]');if(!vids.length)return;
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.play().catch(()=>{});else e.target.pause()})},{threshold:0.3});
vids.forEach(v=>obs.observe(v));
}
initVideoAutoplay();

/* === SMOOTH SCROLL ANCHORS === */
$$('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){const id=this.getAttribute('href');if(id==='#')return;const t=$(id);if(t){e.preventDefault();const off=header?header.offsetHeight:0;window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-off,behavior:'smooth'})}})});

/* === UTILITY INITS === */
function initAddressToggle(){$$('[data-toggle-address]').forEach(function(b){b.addEventListener('click',function(){var id=this.getAttribute('data-toggle-address');var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'})})}
function initCollectionSort(){var sel=$('[data-sort-collection]');if(sel)sel.addEventListener('change',function(){window.location.href=this.value})}

/* === SHOPIFY SECTION EVENTS === */
document.addEventListener('shopify:section:load',function(){initScrollAnimations();initSmoothReveal();initSectionReveals();initProductGallery();initProductOptions();initQuantitySelector();initAccordions();initLazyLoad();initCarousels();initHeroSlideshow();initVideoAutoplay();initFooterToggle();initAddToCart();initAddressToggle();initCollectionSort()});

/* === DOM READY === */
document.addEventListener('DOMContentLoaded',function(){initScrollAnimations();initSmoothReveal();initSectionReveals();initAddressToggle();initCollectionSort();initFooterToggle();
setTimeout(function(){if(!$('.cart-drawer.open,.search-overlay.open,.newsletter-popup-overlay.open,.site-header__nav.open'))document.body.classList.remove('overflow-hidden')},3000)});
})();
