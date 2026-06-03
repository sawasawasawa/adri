/* ============================================================
   Elegant Rescues — interactions
   ============================================================ */
(function () {
  'use strict';

  // Only hide-for-reveal once we know JS is running (see styles.css .js gate).
  document.documentElement.classList.add('js');

  /* ---------------- Year ---------------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     KINTSUGI SEAM GENERATOR
     Builds an irregular cracked-gold seam as SVG. Two stroke
     layers (soft halo + crisp line), branches, and gold-leaf
     flecks. Works horizontal or vertical.
     ============================================================ */
  function rand(min, max) { return min + Math.random() * (max - min); }

  function buildSeam(host) {
    var vertical = host.getAttribute('data-seam') === 'v';
    var MAIN = vertical ? 760 : 1240;   // length along the crack
    var SPAN = 64;                       // cross-axis room
    var mid = SPAN / 2;
    var segs = vertical ? 16 : 26;

    // unique gradient id so multiple seams don't collide
    var gid = 'g' + Math.random().toString(36).slice(2, 8);

    // main jagged spine
    var pts = [];
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      var main = t * MAIN;
      var amp = Math.sin(t * Math.PI) * 0.7 + 0.3;     // calmer at the ends
      var cross = mid + rand(-1, 1) * (SPAN * 0.34) * amp;
      if (i === 0 || i === segs) cross = mid + rand(-3, 3);
      pts.push([main, cross]);
    }

    function P(p) { return vertical ? (p[1] + ',' + p[0]) : (p[0] + ',' + p[1]); }

    var d = 'M' + P(pts[0]);
    for (var j = 1; j < pts.length; j++) {
      // slight curve for an organic crack
      var prev = pts[j - 1], cur = pts[j];
      var cx = (prev[0] + cur[0]) / 2 + rand(-6, 6);
      var cy = (prev[1] + cur[1]) / 2 + rand(-4, 4);
      d += ' Q' + P([cx, cy]) + ' ' + P(cur);
    }

    // a couple of fine branches splitting off the spine
    var branches = '';
    var nBranch = vertical ? 1 : 2;
    for (var b = 0; b < nBranch; b++) {
      var idx = Math.floor(rand(segs * 0.25, segs * 0.75));
      var base = pts[idx];
      var len = rand(40, 96);
      var dir = Math.random() < 0.5 ? -1 : 1;
      var bd = 'M' + P(base);
      var steps = 4, bx = base[0], by = base[1];
      for (var s = 1; s <= steps; s++) {
        bx += (len / steps) * (Math.random() < 0.6 ? 1 : 0.6);
        by += dir * rand(2, 9);
        bd += ' L' + P([bx, by]);
      }
      branches += '<path d="' + bd + '" fill="none" stroke="url(#' + gid + ')" stroke-width="1" stroke-linecap="round" opacity="0.7"/>';
    }

    // gold-leaf flecks near the spine
    var flecks = '';
    var nFleck = vertical ? 4 : 7;
    for (var f = 0; f < nFleck; f++) {
      var fp = pts[Math.floor(rand(1, pts.length - 1))];
      var ox = rand(-7, 7), oy = rand(-6, 6);
      var pt = vertical ? [fp[1] + oy, fp[0] + ox] : [fp[0] + ox, fp[1] + oy];
      var r = rand(0.8, 2.6);
      flecks += '<circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="' + r.toFixed(1) + '" fill="url(#' + gid + ')" opacity="' + rand(0.5, 1).toFixed(2) + '"/>';
    }

    var vbW = vertical ? SPAN : MAIN;
    var vbH = vertical ? MAIN : SPAN;
    var x1 = 0, y1 = 0, x2 = vertical ? 0 : MAIN, y2 = vertical ? MAIN : 0;

    var svg =
      '<svg viewBox="0 0 ' + vbW + ' ' + vbH + '" preserveAspectRatio="' + (vertical ? 'xMidYMid meet' : 'none') + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
            '<stop offset="0" stop-color="#8C6A1E"/>' +
            '<stop offset="0.22" stop-color="#E6CB82"/>' +
            '<stop offset="0.45" stop-color="#B8902F"/>' +
            '<stop offset="0.68" stop-color="#F0DEA8"/>' +
            '<stop offset="0.85" stop-color="#C9A347"/>' +
            '<stop offset="1" stop-color="#8C6A1E"/>' +
          '</linearGradient>' +
          '<filter id="' + gid + 'b" x="-20%" y="-60%" width="140%" height="220%">' +
            '<feGaussianBlur stdDeviation="' + (vertical ? '1.4' : '1.6') + '"/>' +
          '</filter>' +
        '</defs>' +
        // soft halo
        '<path d="' + d + '" fill="none" stroke="url(#' + gid + ')" stroke-width="3.4" stroke-linecap="round" opacity="0.32" filter="url(#' + gid + 'b)" vector-effect="non-scaling-stroke"/>' +
        branches +
        // crisp spine
        '<path d="' + d + '" fill="none" stroke="url(#' + gid + ')" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
        flecks +
      '</svg>';

    host.innerHTML = svg;
  }

  document.querySelectorAll('[data-seam]').forEach(buildSeam);

  /* ============================================================
     NAV — scrolled state, mobile toggle, active link
     ============================================================ */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  // active link via section observation
  var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var watch = ['about', 'services', 'workshops', 'gallery'];
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && map[e.target.id]) {
        links.forEach(function (l) { l.classList.remove('active'); });
        map[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  watch.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function revealAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { revealObs.observe(el); });
    // Failsafe: if IO is suppressed (background tab, embeds), never leave content hidden.
    window.addEventListener('load', function () { setTimeout(revealAll, 1400); });
  } else {
    revealAll();
  }

  /* ============================================================
     GALLERY — manual arrows + dots
     ============================================================ */
  var track = document.getElementById('galleryTrack');
  var slides = track ? track.children.length : 0;
  var dotsWrap = document.getElementById('galleryDots');
  var idx = 0;

  if (track && slides) {
    for (var k = 0; k < slides; k++) {
      var dot = document.createElement('button');
      dot.className = 'dot-btn' + (k === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to image ' + (k + 1));
      dot.dataset.i = k;
      dot.addEventListener('click', function () { go(parseInt(this.dataset.i, 10)); });
      dotsWrap.appendChild(dot);
    }
    var dotEls = dotsWrap.children;

    function go(n) {
      idx = (n + slides) % slides;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      for (var d = 0; d < dotEls.length; d++) dotEls[d].classList.toggle('active', d === idx);
    }
    window.__gallGo = go;
    document.getElementById('galleryNext').addEventListener('click', function () { go(idx + 1); });
    document.getElementById('galleryPrev').addEventListener('click', function () { go(idx - 1); });

    // keyboard arrows when gallery in view
    var gallerySection = document.getElementById('gallery');
    document.addEventListener('keydown', function (e) {
      var r = gallerySection.getBoundingClientRect();
      var inView = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      if (!inView) return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    });
  }

  /* ============================================================
     ENQUIRE FORM → composes a mailto
     ============================================================ */
  var form = document.getElementById('enquireForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = encodeURIComponent(form.name.value || '');
      var email = form.email.value || '';
      var type = form.type.value || '';
      var msg = form.message.value || '';
      var subject = encodeURIComponent('Quote request — ' + type + (name ? ' (' + form.name.value + ')' : ''));
      var body = encodeURIComponent(
        'Name: ' + form.name.value + '\n' +
        'Email: ' + email + '\n' +
        'Object: ' + type + '\n\n' +
        msg
      );
      window.location.href = 'mailto:hello@elegantrescues.com?subject=' + subject + '&body=' + body;
    });
  }
})();
