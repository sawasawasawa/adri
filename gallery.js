/* Elegant Rescues - rotating gallery
   Vanilla carousel: auto-advance, prev/next, dots, keyboard, swipe.
   Respects prefers-reduced-motion (no auto-advance) and pauses on hover/focus. */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTOPLAY_MS = 5000;

  /* ---- scroll-reveal: add .is-in so the .reveal sections become visible ---- */
  (function reveal() {
    const items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;
    const showAll = function () { items.forEach(function (el) { el.classList.add("is-in"); }); };

    if (reduceMotion || !("IntersectionObserver" in window)) { showAll(); return; }

    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });

    items.forEach(function (el) { io.observe(el); });
    // safety net: never let content stay hidden, even if the observer misfires
    window.setTimeout(showAll, 1400);
  })();

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const track = root.querySelector("[data-track]");
    const slides = Array.prototype.slice.call(track.children);
    const dotsWrap = root.querySelector("[data-dots]");
    const prevBtn = root.querySelector("[data-prev]");
    const nextBtn = root.querySelector("[data-next]");
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    // build dots
    const dots = slides.map(function (_, i) {
      const b = document.createElement("button");
      b.className = "carousel__dot";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, i) {
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach(function (d, i) {
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function go(i) { index = (i + slides.length) % slides.length; render(); }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() {
      if (reduceMotion || timer) return;
      timer = window.setInterval(next, AUTOPLAY_MS);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    nextBtn.addEventListener("click", function () { next(); restart(); });
    prevBtn.addEventListener("click", function () { prev(); restart(); });

    // pause when hovered or focused within
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // pause when tab is hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    // keyboard arrows when carousel has focus
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(); restart(); }
      else if (e.key === "ArrowRight") { next(); restart(); }
    });

    // basic touch swipe
    let x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      x0 = null; start();
    }, { passive: true });

    render();
    start();
  });
})();
