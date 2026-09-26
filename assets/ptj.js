/*=====================================================================
  Milan Sapkota — Portfolio interactions
  Intro loader, fit-to-width type, header, menu, the blue wipe, reveals,
  counters and the projects carousel.
=====================================================================*/
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /*==================== FIT TEXT ====================*/
  // Size .fit elements so they span their container's content width exactly.
  const fitEls = Array.from(document.querySelectorAll(".fit"));

  function fitAll() {
    fitEls.forEach((el) => {
      const box = el.parentElement;
      const style = getComputedStyle(box);
      const available =
        box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      el.style.fontSize = "100px";
      const natural = el.scrollWidth;
      if (natural > 0) el.style.fontSize = (100 * available) / natural + "px";
    });
  }

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("resize", fitAll);

  /*==================== INTRO LOADER ====================*/
  const loader = document.getElementById("loader");
  let introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    root.classList.add("is-ready");
    if (loader) setTimeout(() => (loader.style.display = "none"), 1200);
  }

  // Only play the intro once per browser session.
  let seenIntro = false;
  try {
    seenIntro = sessionStorage.getItem("intro-seen") === "1";
    sessionStorage.setItem("intro-seen", "1");
  } catch (e) {
    /* storage blocked — just play it */
  }

  if (!loader || reduceMotion || seenIntro) {
    if (loader) loader.style.display = "none";
    requestAnimationFrame(finishIntro);
  } else {
    // The signature draws itself in CSS; lift the curtain once it has filled.
    setTimeout(finishIntro, 2300);
  }

  /*==================== MENU ====================*/
  const menu = document.getElementById("menu");
  const navToggle = document.getElementById("nav-toggle");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
  }

  if (navToggle) {
    navToggle.addEventListener("click", () =>
      setMenu(!body.classList.contains("menu-open"))
    );
  }

  document
    .querySelectorAll(".menu a, .nav__talk")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  /*==================== SCROLL ====================*/
  const header = document.getElementById("header");
  const heroName = document.getElementById("hero-name");
  const wipe = document.getElementById("wipe");
  const themedBlocks = document.querySelectorAll("[data-nav]");

  function onScroll() {
    const vh = window.innerHeight;

    // Blue shape sweeps over the statement as the wipe block scrolls by.
    let wipeP = 0;
    if (wipe) {
      const r = wipe.getBoundingClientRect();
      const travel = r.height - vh;
      wipeP = Math.min(Math.max(-r.top / (travel * 0.85), 0), 1);
      wipe.style.setProperty("--p", wipeP.toFixed(4));
    }

    if (header) {
      // Small logo appears once the big hero name has scrolled away.
      if (heroName) {
        header.classList.toggle(
          "show-logo",
          heroName.getBoundingClientRect().bottom < header.offsetHeight
        );
      }

      // Match header colours to whatever sits beneath it.
      const probe = header.offsetHeight / 2;
      themedBlocks.forEach((block) => {
        const r = block.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          let theme = block.dataset.nav;
          if (block === wipe && wipeP > 0.55) theme = "blue";
          header.dataset.theme = theme;
        }
      });
    }
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", onScroll);
  onScroll();

  /*==================== COUNTERS ====================*/
  function countUp(el) {
    const target = Number(el.dataset.count) || 0;
    if (reduceMotion) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /*==================== REVEAL ON SCROLL ====================*/
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          entry.target.querySelectorAll("[data-count]").forEach(countUp);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((el) => {
      // Stagger siblings slightly so lists cascade instead of popping at once.
      const siblings = Array.from(el.parentElement.children).filter((c) =>
        c.classList.contains("reveal")
      );
      el.style.transitionDelay = (siblings.indexOf(el) % 4) * 80 + "ms";
      observer.observe(el);
    });
  }

  /*==================== PROJECTS CAROUSEL ====================*/
  const orbit = document.getElementById("orbit");

  if (orbit) {
    const cards = Array.from(orbit.querySelectorAll(".orbit__card"));
    const items = Array.from(orbit.querySelectorAll(".orbit__item"));
    const currentEl = document.getElementById("orbit-current");
    const totalEl = document.getElementById("orbit-total");
    const n = cards.length;
    const pad = (v) => String(v).padStart(2, "0");
    let active = 0;

    if (totalEl) totalEl.textContent = pad(n);

    // Fan the cards out around the active one: neighbours shrink, lift,
    // blur and fade the further they are from the centre.
    function layout() {
      cards.forEach((card, i) => {
        let d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const a = Math.abs(d);
        card.style.setProperty("--tx", d * 58 + "%");
        card.style.setProperty("--ty", -a * 9 + "%");
        card.style.setProperty("--sc", String(Math.max(1 - a * 0.2, 0.4)));
        card.style.setProperty("--bl", a === 0 ? "0px" : a * 2.5 + "px");
        card.style.setProperty("--op", a > 2 ? "0" : String(1 - a * 0.28));
        card.style.zIndex = String(10 - a);
      });
    }

    function go(next) {
      active = (next + n) % n;
      items.forEach((item, i) => item.classList.toggle("is-active", i === active));
      if (currentEl) currentEl.textContent = pad(active + 1);
      layout();
    }

    const prev = document.getElementById("orbit-prev");
    const nextBtn = document.getElementById("orbit-next");
    if (prev) prev.addEventListener("click", () => go(active - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(active + 1));

    // Clicking a side card brings it to the front.
    cards.forEach((card, i) => card.addEventListener("click", () => go(i)));

    orbit.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") go(active - 1);
      if (event.key === "ArrowRight") go(active + 1);
    });

    // Swipe on touch screens.
    let touchX = null;
    orbit.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), {
      passive: true,
    });
    orbit.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    layout();
  }

  /*==================== FOOTER YEAR ====================*/
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
