(function(){
"use strict";

/* ---------- custom cursor ---------- */
var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if(canHover){
  document.documentElement.classList.add('has-cursor');
  var dot=document.createElement('div');dot.className='cur-dot';
  var ring=document.createElement('div');ring.className='cur-ring';
  var label=document.createElement('span');label.className='cur-label';label.textContent='Voir';
  ring.appendChild(label);
  document.body.appendChild(dot);document.body.appendChild(ring);

  var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
  },{passive:true});
  (function loop(){
    rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
    ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover',function(e){
    var proj=e.target.closest('.card[href],.work-card[href]');
    var interactive=e.target.closest('a,button,.chip,.exp-row,.btn');
    if(proj){
      ring.classList.add('hov-proj');
      dot.style.opacity='0';
      label.textContent=proj.getAttribute('data-cursor-label')||'Voir';
    } else if(interactive){
      ring.classList.add('hov');
    }
  });
  document.addEventListener('mouseout',function(e){
    var proj=e.target.closest('.card[href],.work-card[href]');
    var interactive=e.target.closest('a,button,.chip,.exp-row,.btn');
    if(proj){ring.classList.remove('hov-proj');dot.style.opacity='1';}
    if(interactive) ring.classList.remove('hov');
  });
  document.addEventListener('mouseleave',function(){dot.style.opacity='0';ring.style.opacity='0';});
  document.addEventListener('mouseenter',function(){dot.style.opacity='1';ring.style.opacity='1';});
}

/* ---------- page transition (circle wipe) ---------- */
/* reuse the pre-painted overlay (set inline in <head>, before CSS/JS load) to avoid any flash */
var overlay=document.getElementById('pt-pre');
if(overlay){
  overlay.removeAttribute('style');
  overlay.removeAttribute('id');
  overlay.className='pt-overlay';
} else {
  overlay=document.createElement('div');
  overlay.className='pt-overlay';
}
document.body.appendChild(overlay);

function pct(v,total){return (v/total*100).toFixed(2)+'%';}

/* reveal on load if we arrived via a transitioned link */
var sx=sessionStorage.getItem('pt-x'), sy=sessionStorage.getItem('pt-y');
if(sx!==null && sy!==null){
  sessionStorage.removeItem('pt-x');sessionStorage.removeItem('pt-y');
  overlay.style.clipPath='circle(150% at '+sx+' '+sy+')';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      overlay.classList.add('pt-anim');
      overlay.style.clipPath='circle(0% at '+sx+' '+sy+')';
    });
  });
  overlay.addEventListener('transitionend',function te(){
    overlay.removeEventListener('transitionend',te);
    overlay.classList.remove('pt-anim');
  });
}

/* intercept clicks on internal case-study / home links */
document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
  var a=e.target.closest('a[href]');
  if(!a) return;
  var href=a.getAttribute('href');
  if(!href||href.indexOf('.html')===-1) return;
  if(a.target && a.target!=='_self') return;
  if(a.hasAttribute('download')) return;
  if(/^https?:\/\//i.test(href) || href.indexOf('://')>-1) return;

  e.preventDefault();
  var x=pct(e.clientX,innerWidth), y=pct(e.clientY,innerHeight);
  sessionStorage.setItem('pt-x',x);
  sessionStorage.setItem('pt-y',y);
  overlay.classList.remove('pt-anim');
  overlay.style.clipPath='circle(0% at '+x+' '+y+')';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      overlay.classList.add('pt-anim');
      overlay.style.clipPath='circle(150% at '+x+' '+y+')';
    });
  });
  setTimeout(function(){location.href=href;},650);
});
})();
