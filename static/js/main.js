(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Generate topographic contour lines in the hero SVG
  --------------------------------------------------------- */
  function buildContours() {
    var svg = document.getElementById("contourSvg");
    if (!svg) return;

    var W = 1200, H = 800;
    var bands = 9;
    var colors = ["#5EEAD4", "#5EEAD4", "#8FB6FF", "#8FB6FF", "#E8A865", "#E8A865", "#C792EA"];

    // a few smooth pseudo-random seeds so each line undulates differently
    var seeds = [];
    for (var s = 0; s < bands; s++) {
      seeds.push({
        a1: 30 + Math.random() * 50,
        a2: 14 + Math.random() * 30,
        f1: 0.0021 + Math.random() * 0.0014,
        f2: 0.0045 + Math.random() * 0.002,
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2
      });
    }

    function lineY(seed, x, baseY) {
      return baseY +
        Math.sin(x * seed.f1 + seed.p1) * seed.a1 +
        Math.sin(x * seed.f2 + seed.p2) * seed.a2;
    }

    function pathFor(seed, baseY) {
      var step = 20;
      var d = "";
      for (var x = -step; x <= W * 2 + step; x += step) {
        var y = lineY(seed, x, baseY);
        d += (x === -step ? "M " : "L ") + x + " " + y + " ";
      }
      return d;
    }

    var frag = document.createDocumentFragment();
    for (var i = 0; i < bands; i++) {
      var baseY = (H / (bands + 1)) * (i + 1);
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathFor(seeds[i], baseY));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", colors[i % colors.length]);
      path.setAttribute("stroke-width", "1");
      path.setAttribute("opacity", (0.10 + (i % 3) * 0.05).toFixed(2));
      path.classList.add("contour-line");
      if (!reduceMotion) {
        path.style.animation = "contourDrift " + (60 + i * 9) + "s linear infinite";
        path.style.animationDirection = i % 2 === 0 ? "normal" : "reverse";
      }
      frag.appendChild(path);
    }
    svg.appendChild(frag);

    // inject keyframes once
    if (!reduceMotion && !document.getElementById("contourKeyframes")) {
      var style = document.createElement("style");
      style.id = "contourKeyframes";
      style.textContent =
        "@keyframes contourDrift{ from{ transform:translateX(0); } to{ transform:translateX(-" + W + "px); } }";
      document.head.appendChild(style);
    }
  }

  /* ---------------------------------------------------------
     2. Scroll-triggered reveal
  --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     3. Elevation / bearing readout tied to scroll position
  --------------------------------------------------------- */
  function initReadout() {
    var valueEl = document.getElementById("readoutValue");
    var compassEl = document.querySelector(".readout__compass");
    if (!valueEl) return;

    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var progress = Math.min(Math.max(window.scrollY / max, 0), 1);
      var elevation = Math.round(progress * 842); // arbitrary "summit" figure
      valueEl.textContent = String(elevation).padStart(3, "0");
      if (compassEl) {
        compassEl.style.transform = "rotate(" + Math.round(progress * 360) + "deg)";
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildContours();
    initReveal();
    initReadout();
  });
})();
