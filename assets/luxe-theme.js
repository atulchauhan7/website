(function(){
var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document);
function throttle(fn,lim){let t;return function(){if(!t){fn.apply(this,arguments);t=true;setTimeout(()=>t=false,lim)}}}
function debounce(fn,w){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),w)}}

/* === PAGE LOADER === */
window.addEventListener('load',function(){
var lo=document.getElementById('page-loader');
if(lo){requestAnimationFrame(function(){lo.classList.add('loaded');document.body.classList.add('page-loaded');
requestAnimationFrame(function(){initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals()})})}
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
if(announcementBar){if(cs>150){announcementBar.classList.add('announcement-hidden');header.classList.remove('has-announcement')}else{announcementBar.classList.remove('announcement-hidden');header.classList.add('has-announcement')}}
}
lastScroll=cs;
}
window.addEventListener('scroll',throttle(handleHeaderScroll,16),{passive:true});

/* === MOBILE MENU === */
const menuToggle=$('.menu-toggle');
const mobileNav=$('.site-header__nav');
if(menuToggle&&mobileNav){menuToggle.addEventListener('click',function(){this.classList.toggle('active');mobileNav.classList.toggle('open');document.body.classList.toggle('overflow-hidden');this.setAttribute('aria-expanded',this.classList.contains('active'))})}
/* Mobile: toggle mega-menu on tap instead of hover */
if(window.innerWidth<=1024){$$('.nav-item').forEach(function(ni){var link=ni.querySelector('.site-header__nav-link');var mega=ni.querySelector('.mega-menu');if(link&&mega){link.addEventListener('click',function(e){if(mega){e.preventDefault();mega.classList.toggle('open')}})}})}

/* === CART DRAWER === */
const cartDrawer=$('.cart-drawer');
const cartOverlay=$('.cart-drawer-overlay');
const cartTriggers=$$('[data-cart-trigger]');
const cartClose=$('.cart-drawer__close');
function openCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.add('open');cartOverlay.classList.add('open');document.body.classList.add('overflow-hidden');if(cartClose)cartClose.focus();triggerCartCelebration()}}
function closeCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove('open');cartOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCartDrawer()}));
if(cartClose)cartClose.addEventListener('click',closeCartDrawer);
if(cartOverlay)cartOverlay.addEventListener('click',closeCartDrawer);

/* Refresh cart drawer HTML + count */
function refreshCart(callback){
var done=0,total=2,cartData=null;
if(cartDrawer)cartDrawer._sectionUpdated=false;
function check(){
done++;
if(done>=total){
/* If section rendering failed but we have cart data, rebuild drawer client-side */
if(cartData&&cartDrawer&&!cartDrawer._sectionUpdated){
rebuildCartDrawer(cartData);
}
if(typeof callback==='function')callback();
}
}
fetch('/?sections=cart-drawer',{cache:'no-store'}).then(r=>r.json()).then(data=>{
var html=data['cart-drawer'];
if(html){
var tmp=document.createElement('div');tmp.innerHTML=html;
var newDrawer=tmp.querySelector('.cart-drawer');
if(newDrawer&&cartDrawer){
cartDrawer.innerHTML=newDrawer.innerHTML;
cartDrawer._sectionUpdated=true;
/* re-bind close */
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
/* re-bind qty buttons */
initCartQty();
}
}
check();
}).catch(function(){check()});
fetch('/cart.js',{cache:'no-store'}).then(r=>r.json()).then(c=>{
cartData=c;
$$('.cart-count').forEach(el=>{el.textContent=c.item_count;el.classList.add('elastic-scale');setTimeout(()=>el.classList.remove('elastic-scale'),600)});
$$('.cart-drawer__title').forEach(el=>{el.textContent='Your Cart ('+c.item_count+')'});
check();
}).catch(function(){check()});
}
/* Fallback: rebuild cart drawer entirely from /cart.js data */
function rebuildCartDrawer(cart){
if(!cartDrawer)return;
var fmt=window.theme&&window.theme.moneyFormat?window.theme.moneyFormat:'{{amount}}';
function money(cents){return fmt.replace(/\{\{[^}]*\}\}/,(cents/100).toFixed(2))}
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var h='<div class="cart-drawer__header"><span class="cart-drawer__title">Your Cart ('+cart.item_count+')</span>';
h+='<button class="cart-drawer__close" aria-label="Close cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
if(cart.items&&cart.items.length>0){
h+='<div class="cart-drawer__items">';
for(var i=0;i<cart.items.length;i++){
var it=cart.items[i];
h+='<div class="cart-drawer__item" data-line="'+(i+1)+'" data-key="'+escAttr(it.key)+'">';
h+='<div class="cart-drawer__item-image">';
if(it.image){h+='<img src="'+escAttr(it.image)+'" alt="'+escAttr(it.title)+'" loading="lazy" width="200">';}
h+='</div><div class="cart-drawer__item-info">';
h+='<a href="'+escAttr(it.url)+'" class="cart-drawer__item-title">'+esc(it.product_title)+'</a>';
if(it.variant_title&&it.variant_title!=='Default Title'){h+='<div class="cart-drawer__item-variant">'+esc(it.variant_title)+'</div>';}
h+='<div class="cart-drawer__item-price">'+money(it.final_line_price)+'</div>';
h+='<div class="cart-drawer__qty"><button data-qty-minus aria-label="Decrease quantity">&#8722;</button>';
h+='<span>'+it.quantity+'</span>';
h+='<button data-qty-plus aria-label="Increase quantity">+</button></div>';
h+='</div></div>';
}
h+='</div>';
h+='<div class="cart-drawer__footer"><div class="cart-drawer__subtotal"><span>Subtotal</span>';
h+='<span class="cart-drawer__subtotal-price">'+money(cart.total_price)+'</span></div>';
h+='<form action="/cart" method="post"><button type="submit" name="checkout" class="btn btn--primary btn--full">Checkout</button></form>';
h+='<div class="payment-icons payment-icons--drawer"><div class="payment-icons__list">';
h+='<span class="payment-icon" title="Visa"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#1A1F71"/><path d="M15.6 16.4l1.7-10.3h2.7l-1.7 10.3h-2.7zm11.3-10c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.1c.6.3 1.8.5 3 .5 2.9 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2zm7 0h-2.1c-.7 0-1.2.2-1.4.8l-4.1 9.6h2.9l.6-1.6h3.5l.3 1.6h2.5l-2.2-10.3zm-3.4 6.6l1.5-3.9.4 3.9h-1.9zM14.2 6.1l-2.6 7-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.5 9h2.9l4.3-10.3h-3.1z" fill="#fff"/><path d="M8.4 6.1H4.2l-.1.3c3.4.9 5.7 2.9 6.6 5.4l-1-4.9c-.2-.6-.6-.8-1.3-.8z" fill="#F9A533"/></svg></span>';
h+='<span class="payment-icon" title="Mastercard"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#252525"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.3a7 7 0 0 1 2.6 4.7A7 7 0 0 1 19 16.7a7 7 0 0 1-2.6-4.7A7 7 0 0 1 19 7.3z" fill="#FF5F00"/></svg></span>';
h+='<span class="payment-icon" title="PayPal"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#fff" stroke="#e8e8e8"/><path d="M25.2 7.8c-.4 2.6-2.4 2.6-4.3 2.6h-1.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#003087"/><path d="M13.5 7.8c-.4 2.6-2.4 2.6-4.3 2.6H8.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#002F86"/></svg></span>';
h+='<span class="payment-icon" title="Apple Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#000"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Pay</text></svg></span>';
h+='<span class="payment-icon" title="Shop Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#5A31F4"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Shop</text></svg></span>';
h+='</div></div>';
h+='<p class="cart-drawer__note">Shipping &amp; taxes calculated at checkout</p></div>';
}else{
h+='<div class="cart-drawer__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
h+='<p>Your cart is empty</p><a href="/collections/all" class="btn btn--primary">Start Shopping</a></div>';
}
cartDrawer.innerHTML=h;
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
initCartQty();
}

function initCartQty(){
if(!cartDrawer)return;
cartDrawer.querySelectorAll('.cart-drawer__qty').forEach(wrap=>{
var line=wrap.closest('[data-line]');if(!line)return;
var key=line.getAttribute('data-key')||line.getAttribute('data-line');
var minusBtn=wrap.querySelector('[data-qty-minus]');
var plusBtn=wrap.querySelector('[data-qty-plus]');
var qtySpan=wrap.querySelector('span');
if(minusBtn){
var newMinus=minusBtn.cloneNode(true);
minusBtn.parentNode.replaceChild(newMinus,minusBtn);
newMinus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newMinus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,Math.max(0,cur-1));
});
}
if(plusBtn){
var newPlus=plusBtn.cloneNode(true);
plusBtn.parentNode.replaceChild(newPlus,plusBtn);
newPlus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newPlus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,cur+1);
});
}
});
}
function changeCartLine(key,qty){
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(()=>refreshCart()).catch(()=>refreshCart());
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

/* === WISHLIST (localStorage-based) === */
var wishlistDrawer=$('.wishlist-drawer');
var wishlistOverlay=$('.wishlist-drawer-overlay');
var wishlistClose=wishlistDrawer?wishlistDrawer.querySelector('.wishlist-drawer__close'):null;
var WISHLIST_KEY='luxe_wishlist';

function getWishlist(){try{return JSON.parse(localStorage.getItem(WISHLIST_KEY))||[]}catch(e){return[]}}
function saveWishlist(list){localStorage.setItem(WISHLIST_KEY,JSON.stringify(list))}

function isInWishlist(handle){return getWishlist().some(function(item){return item.handle===handle})}

function addToWishlist(data){
var list=getWishlist();
if(list.some(function(item){return item.handle===data.handle}))return;
list.push({handle:data.handle,title:data.title,url:data.url,price:data.price,image:data.image,addedAt:Date.now()});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
}

function removeFromWishlist(handle){
var list=getWishlist().filter(function(item){return item.handle!==handle});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
}

function toggleWishlist(data){
if(isInWishlist(data.handle)){removeFromWishlist(data.handle)}else{addToWishlist(data)}
}

function openWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
renderWishlistDrawer();
wishlistDrawer.classList.add('open');
wishlistOverlay.classList.add('open');
document.body.classList.add('overflow-hidden');
}
}
function closeWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
wishlistDrawer.classList.remove('open');
wishlistOverlay.classList.remove('open');
document.body.classList.remove('overflow-hidden');
}
}

function renderWishlistDrawer(){
if(!wishlistDrawer)return;
var list=getWishlist();
var itemsContainer=wishlistDrawer.querySelector('.wishlist-drawer__items');
var emptyState=wishlistDrawer.querySelector('.wishlist-drawer__empty');
var footer=wishlistDrawer.querySelector('.wishlist-drawer__footer');
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

if(list.length===0){
itemsContainer.innerHTML='';
itemsContainer.style.display='none';
emptyState.style.display='flex';
if(footer)footer.style.display='none';
}else{
emptyState.style.display='none';
itemsContainer.style.display='block';
if(footer)footer.style.display='block';
var html='';
for(var i=0;i<list.length;i++){
var item=list[i];
html+='<div class="wishlist-drawer__item" data-wishlist-handle="'+escAttr(item.handle)+'">';
html+='<div class="wishlist-drawer__item-image">';
if(item.image){html+='<a href="'+escAttr(item.url)+'"><img src="'+escAttr(item.image)+'" alt="'+escAttr(item.title)+'" loading="lazy" width="200"></a>'}
html+='</div>';
html+='<div class="wishlist-drawer__item-info">';
html+='<a href="'+escAttr(item.url)+'" class="wishlist-drawer__item-title">'+esc(item.title)+'</a>';
html+='<div class="wishlist-drawer__item-price">'+esc(item.price)+'</div>';
html+='<div class="wishlist-drawer__item-actions">';
html+='<a href="'+escAttr(item.url)+'" class="btn btn--small btn--primary">View Product</a>';
html+='<button class="wishlist-drawer__remove" data-wishlist-remove="'+escAttr(item.handle)+'" aria-label="Remove from wishlist">';
html+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
html+='</button>';
html+='</div>';
html+='</div>';
html+='</div>';
}
itemsContainer.innerHTML=html;
/* Bind remove buttons */
itemsContainer.querySelectorAll('[data-wishlist-remove]').forEach(function(btn){
btn.addEventListener('click',function(e){
e.preventDefault();
var handle=this.getAttribute('data-wishlist-remove');
var itemEl=this.closest('.wishlist-drawer__item');
if(itemEl){itemEl.style.transition='opacity 0.3s,transform 0.3s';itemEl.style.opacity='0';itemEl.style.transform='translateX(20px)';
setTimeout(function(){removeFromWishlist(handle)},300);
}else{removeFromWishlist(handle)}
});
});
}
}

function updateWishlistBadges(){
var count=getWishlist().length;
$$('.wishlist-count').forEach(function(el){el.textContent=count});
$$('.wishlist-count-badge').forEach(function(el){
if(count>0){el.textContent=count;el.style.display='flex'}else{el.style.display='none'}
});
}

function updateWishlistButtons(){
$$('[data-wishlist-toggle]').forEach(function(btn){
var handle=btn.getAttribute('data-product-handle');
if(handle&&isInWishlist(handle)){
btn.classList.add('wishlisted');
btn.setAttribute('aria-label','Remove from wishlist');
}else{
btn.classList.remove('wishlisted');
btn.setAttribute('aria-label','Add to wishlist');
}
});
}

/* Wishlist trigger — header icon */
$$('[data-wishlist-trigger]').forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();openWishlistDrawer()})});
if(wishlistClose)wishlistClose.addEventListener('click',closeWishlistDrawer);
if(wishlistOverlay)wishlistOverlay.addEventListener('click',closeWishlistDrawer);

/* Wishlist toggle — product card heart buttons (event delegation) */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-wishlist-toggle]');
if(!btn)return;
e.preventDefault();
e.stopPropagation();
var data={
handle:btn.getAttribute('data-product-handle'),
title:btn.getAttribute('data-product-title'),
url:btn.getAttribute('data-product-url'),
price:btn.getAttribute('data-product-price'),
image:btn.getAttribute('data-product-image')
};
if(!data.handle)return;
toggleWishlist(data);
/* Animate the heart */
btn.style.transform='scale(1.3)';
setTimeout(function(){btn.style.transform=''},300);
});

/* Init on load */
updateWishlistBadges();
updateWishlistButtons();

/* === NEWSLETTER POPUP === */
var closeNewsletterPopup=function(){};
function initNewsletterPopup(){
var p=$('.newsletter-popup-overlay');if(!p)return;
var cb=p.querySelector('.newsletter-popup__close');
var closed=sessionStorage.getItem('luxe_newsletter_closed');
closeNewsletterPopup=function(){p.classList.remove('open');document.body.classList.remove('overflow-hidden');sessionStorage.setItem('luxe_newsletter_closed','true')};
if(!closed){var idleCb=window.requestIdleCallback||function(fn){setTimeout(fn,5000)};idleCb(function(){setTimeout(function(){p.classList.add('open');document.body.classList.add('overflow-hidden')},3000)})}
if(cb)cb.addEventListener('click',closeNewsletterPopup);
p.addEventListener('click',function(e){if(e.target===p)closeNewsletterPopup()});
window.closeNewsletterPopup=closeNewsletterPopup;
}
initNewsletterPopup();

/* === ESC KEY === */
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSearch();closeCartDrawer();closeWishlistDrawer();if(typeof closeNewsletterPopup==='function')closeNewsletterPopup();
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
btn.innerHTML='<span>Added!</span>';
refreshCart(function(){
openCartDrawer();
setTimeout(function(){btn.innerHTML=orig;btn.disabled=false},400);
});
}).catch(()=>{btn.innerHTML='<span>Error</span>';setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false},1500)});
});
}
initQuickAdd();

/* === ADD TO CART FORM (product page) === */
function initAddToCart(){
$$('[data-add-to-cart],[data-product-form]').forEach(f=>{f.addEventListener('submit',function(e){e.preventDefault();const btn=this.querySelector('[type="submit"]');const orig=btn.textContent;btn.disabled=true;btn.textContent='Adding...';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',body:new FormData(this)}).then(r=>{if(!r.ok)throw new Error('Add failed');return r.json()}).then(()=>{btn.textContent='Added! \u2713';
refreshCart(function(){
openCartDrawer();
setTimeout(function(){btn.textContent=orig;btn.disabled=false},400);
});
}).catch(()=>{btn.textContent='Error';setTimeout(()=>{btn.textContent=orig;btn.disabled=false},1500)})})});
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
ths.forEach(th=>{th.addEventListener('click',function(){const ns=this.dataset.fullImage||this.querySelector('img').src;mi.style.opacity='0';mi.style.transform='scale(0.95)';setTimeout(()=>{mi.src=ns;mi.removeAttribute('srcset');mi.style.opacity='1';mi.style.transform='scale(1)'},300);ths.forEach(t=>t.classList.remove('active'));this.classList.add('active')})});
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
v.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click()}});
v.addEventListener('click',function(){
this.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(function(x){x.classList.remove('selected');x.setAttribute('aria-pressed','false')});
this.classList.add('selected');
this.setAttribute('aria-pressed','true');
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
priceEl.textContent=match.price?window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(match.price/100).toFixed(2)):priceEl.textContent;
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
function initQuantitySelector(){$$('.quantity-selector').forEach(s=>{if(s.closest('.cart-item[data-line]'))return;const m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');if(m&&p&&i){m.addEventListener('click',()=>{const v=parseInt(i.value)-1;if(v>=1)i.value=v});p.addEventListener('click',()=>{i.value=parseInt(i.value)+1})}})}
initQuantitySelector();

/* === CART PAGE QUANTITY === */
function initCartPageQty(){
$$('.cart-item[data-line] .quantity-selector').forEach(function(s){
var item=s.closest('.cart-item[data-line]');
if(!item)return;
var key=item.getAttribute('data-key')||item.getAttribute('data-line');
var m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');
if(!m||!p||!i)return;
/* Clone to remove stale listeners */
var newM=m.cloneNode(true);m.parentNode.replaceChild(newM,m);m=newM;
var newP=p.cloneNode(true);p.parentNode.replaceChild(newP,p);p=newP;
function setLoading(state){i.disabled=state;m.disabled=state;p.disabled=state;var qs=s;if(state){item.style.opacity='0.5';qs.classList.add('is-loading')}else{item.removeAttribute('style');qs.classList.remove('is-loading');m.blur();p.blur()}}
function updateCartLine(qty){
setLoading(true);
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})})
.then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
.then(function(cart){
if(qty===0){item.style.transition='opacity 0.3s,max-height 0.3s';item.style.opacity='0';item.style.maxHeight='0';item.style.overflow='hidden';item.style.padding='0';setTimeout(function(){window.location.reload()},350);
}else{i.value=qty;setLoading(false);
/* Update line total */
var totalEl=item.querySelector('.cart-item__total');
if(totalEl&&cart.items){
var cartItem=null;
for(var ci=0;ci<cart.items.length;ci++){if(cart.items[ci].key===key){cartItem=cart.items[ci];break}}
if(cartItem){totalEl.textContent=window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cartItem.final_line_price/100).toFixed(2))}
}
/* Update subtotal */
var subtotalEl=document.querySelector('.cart-summary__total');
if(subtotalEl&&cart.total_price!==undefined){subtotalEl.innerHTML='<strong>Subtotal:</strong> '+window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cart.total_price/100).toFixed(2))}
/* Update header cart count */
$$('.cart-count').forEach(function(el){el.textContent=cart.item_count});
}
}).catch(function(){setLoading(false)})
}
m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(Math.max(0,cur-1))});
p.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(cur+1)});
i.addEventListener('change',function(){var val=parseInt(this.value);if(!isNaN(val)&&val>=0)updateCartLine(val)});
});
}
initCartPageQty();

/* === ACCORDIONS === */
function initAccordions(){$$('.accordion-trigger').forEach(tr=>{tr.setAttribute('aria-expanded',tr.closest('.accordion-item').classList.contains('open'));tr.addEventListener('click',function(){const it=this.closest('.accordion-item'),co=it.querySelector('.accordion-content'),inn=co.querySelector('.accordion-content__inner');if(it.classList.contains('open')){co.style.maxHeight='0';it.classList.remove('open');this.setAttribute('aria-expanded','false')}else{const pa=it.closest('.product-accordion');if(pa)pa.querySelectorAll('.accordion-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.accordion-content').style.maxHeight='0';var otr=o.querySelector('.accordion-trigger');if(otr)otr.setAttribute('aria-expanded','false')});it.classList.add('open');this.setAttribute('aria-expanded','true');co.style.maxHeight=inn.scrollHeight+'px'}})})}
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
function initAddressToggle(){$$('[data-toggle-address]').forEach(function(b){b.addEventListener('click',function(){var id=this.getAttribute('data-toggle-address');var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'})});
$$('[data-delete-address]').forEach(function(b){b.addEventListener('click',function(){if(!confirm('Are you sure you want to delete this address?'))return;var url=this.getAttribute('data-delete-url');if(url)Shopify.postLink(url,{parameters:{_method:'delete'}})})})}
function initCollectionSort(){var sel=$('[data-sort-collection]');if(sel)sel.addEventListener('change',function(){window.location.href=this.value})}

/* === SHOPIFY SECTION EVENTS === */
document.addEventListener('shopify:section:load',function(){initScrollAnimations();initSmoothReveal();initSectionReveals();initProductGallery();initProductOptions();initQuantitySelector();initCartPageQty();initAccordions();initLazyLoad();initCarousels();initHeroSlideshow();initVideoAutoplay();initFooterToggle();initAddToCart();initAddressToggle();initCollectionSort();initParallax();initMagneticButtons();initSplitText();initCounterAnimations();initImageReveals();initBuyNow()});

/* === PARALLAX SCROLLING === */
function initParallax(){
var els=$$('[data-parallax]');if(!els.length)return;
if(window.innerWidth<769)return; /* disable on mobile for perf */
function updateParallax(){
var st=window.pageYOffset;
els.forEach(function(el){
var rect=el.getBoundingClientRect();
var speed=parseFloat(el.getAttribute('data-parallax'))||0.06;
if(rect.bottom>0&&rect.top<window.innerHeight){
var yPos=-(st-el.offsetTop+window.innerHeight)*speed;
el.style.transform='translate3d(0,'+yPos+'px,0)';
}
});
}
window.addEventListener('scroll',throttle(updateParallax,16),{passive:true});
updateParallax();
}

/* === MAGNETIC BUTTONS === */
function initMagneticButtons(){
if(window.innerWidth<1025||'ontouchstart' in window)return;
$$('.btn--magnetic').forEach(function(btn){
btn.addEventListener('mousemove',function(e){
var rect=this.getBoundingClientRect();
var x=(e.clientX-rect.left-rect.width/2)*0.3;
var y=(e.clientY-rect.top-rect.height/2)*0.3;
this.style.transform='translate3d('+x+'px,'+y+'px,0)';
});
btn.addEventListener('mouseleave',function(){
this.style.transform='translate3d(0,0,0)';
});
});
}

/* === TEXT SPLIT ANIMATIONS === */
function initSplitText(){
$$('.split-words:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
var words=text.split(/\s+/);
el.innerHTML='';
words.forEach(function(word,i){
var span=document.createElement('span');
span.className='word';
var inner=document.createElement('span');
inner.className='word-inner';
inner.textContent=word;
span.appendChild(inner);
el.appendChild(span);
if(i<words.length-1){el.appendChild(document.createTextNode(' '))}
});
el.classList.add('split-done');
});

$$('.split-chars:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
el.innerHTML='';
for(var i=0;i<text.length;i++){
if(text[i]===' '){
el.appendChild(document.createTextNode(' '));
}else{
var span=document.createElement('span');
span.className='char';
span.textContent=text[i];
span.style.transitionDelay=(i*30)+'ms';
el.appendChild(span);
}
}
el.classList.add('split-done');
});
}

/* === CUSTOM CURSOR === */
function initCustomCursor(){
var cursor=$('.cursor-follower');
var dot=$('.cursor-follower-dot');
if(!cursor||!dot||window.innerWidth<1025||'ontouchstart' in window)return;

var cx=0,cy=0,dx=0,dy=0;
document.addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;
if(!cursor.classList.contains('visible')){cursor.classList.add('visible');dot.classList.add('visible')}
},{passive:true});

function animate(){
dx+=(cx-dx)*0.15;dy+=(cy-dy)*0.15;
cursor.style.transform='translate3d('+(dx-18)+'px,'+(dy-18)+'px,0)';
dot.style.transform='translate3d('+(cx-2.5)+'px,'+(cy-2.5)+'px,0)';
requestAnimationFrame(animate);
}
animate();

/* Hover detection for interactive elements */
var hoverTargets='a,button,.btn,.product-card,.carousel__btn,.hero-slider__arrow,input,textarea,select';
document.addEventListener('mouseover',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.add('hovering')}
},{passive:true});
document.addEventListener('mouseout',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.remove('hovering')}
},{passive:true});
}

/* === COUNTER ANIMATIONS === */
function initCounterAnimations(){
var counters=$$('[data-count-to]');if(!counters.length)return;
if(!('IntersectionObserver' in window)){
counters.forEach(function(el){el.textContent=el.getAttribute('data-count-to')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
var el=entry.target;
var target=parseInt(el.getAttribute('data-count-to'))||0;
var duration=parseInt(el.getAttribute('data-count-duration'))||2000;
var start=0;var startTime=null;
function step(timestamp){
if(!startTime)startTime=timestamp;
var progress=Math.min((timestamp-startTime)/duration,1);
/* easeOutQuart */
var eased=1-Math.pow(1-progress,4);
el.textContent=Math.floor(eased*target);
if(progress<1)requestAnimationFrame(step);
else el.textContent=target;
}
requestAnimationFrame(step);
obs.unobserve(el);
}
});
},{threshold:0.3});
counters.forEach(function(el){obs.observe(el)});
}

/* === IMAGE REVEAL ON SCROLL === */
function initImageReveals(){
var reveals=$$('.image-reveal:not(.animated)');if(!reveals.length)return;
if(!('IntersectionObserver' in window)){
reveals.forEach(function(el){el.classList.add('animated')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('animated');
obs.unobserve(entry.target);
}
});
},{threshold:0.2,rootMargin:'0px 0px -50px 0px'});
reveals.forEach(function(el){obs.observe(el)});
}

/* === CART CELEBRATION — Confetti burst === */
function triggerCartCelebration(){
var container=document.getElementById('cart-celebration');
if(!container)return;
/* Only trigger once per drawer open cycle */
if(container._celebrating)return;
container._celebrating=true;
var colors=['#d4a853','#c1272d','#0c0c0c','#e5e0d8','#8a8278','#f6f4f0'];
var frag=document.createDocumentFragment();
for(var i=0;i<40;i++){
var p=document.createElement('div');
p.className='confetti-piece';
p.style.left=Math.random()*100+'%';
p.style.top='-10px';
p.style.background=colors[Math.floor(Math.random()*colors.length)];
p.style.animationDelay=(Math.random()*0.6)+'s';
p.style.animationDuration=(1.2+Math.random()*1)+'s';
var size=4+Math.random()*8;
p.style.width=size+'px';
p.style.height=size+'px';
frag.appendChild(p);
}
container.appendChild(frag);
setTimeout(function(){container.innerHTML='';container._celebrating=false},2500);
}

/* === BUY NOW — Direct checkout === */
function initBuyNow(){
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-buy-now]');
if(!btn)return;
e.preventDefault();
var form=btn.closest('form')||btn.closest('.product-info__cta-group').previousElementSibling;
/* Find the closest product form */
var productForm=btn.closest('[data-product-form]')||document.querySelector('[data-product-form]');
if(!productForm)return;
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput)return;
var orig=btn.innerHTML;
btn.disabled=true;
btn.innerHTML='<span>Processing...</span>';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:parseInt(variantInput.value),quantity:parseInt(qtyInput?qtyInput.value:1)}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
window.location.href=window.theme.routes.checkout_url||'/checkout';
}).catch(function(){btn.innerHTML='<span>Error</span>';setTimeout(function(){btn.innerHTML=orig;btn.disabled=false},1500)});
});
}
initBuyNow();

/* === SMOOTH PAGE TRANSITIONS === */
(function(){
if(!document.startViewTransition)return; /* only for browsers that support View Transitions */
document.addEventListener('click',function(e){
var link=e.target.closest('a[href]');
if(!link)return;
var href=link.getAttribute('href');
if(!href||href.startsWith('#')||href.startsWith('javascript:')||link.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return;
/* Only internal same-origin links */
try{var url=new URL(href,window.location.origin);if(url.origin!==window.location.origin)return}catch(err){return}
e.preventDefault();
document.startViewTransition(function(){window.location.href=href});
});
})();

/* === DOM READY === */
document.addEventListener('DOMContentLoaded',function(){
/* Priority inits */
initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals();
/* Defer non-critical inits to idle time */
var idle=window.requestIdleCallback||function(fn){setTimeout(fn,200)};
idle(function(){
initSectionReveals();initAddressToggle();initCollectionSort();initFooterToggle();
setTimeout(function(){var hasOpen=document.querySelector('.cart-drawer.open')||document.querySelector('.search-overlay.open')||document.querySelector('.newsletter-popup-overlay.open')||document.querySelector('.site-header__nav.open');if(!hasOpen)document.body.classList.remove('overflow-hidden')},800);
});
});
})();
