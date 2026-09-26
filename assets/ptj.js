/*=====================================================================
  Milan Sapkota — Portfolio interactions

  Always on:   fit-to-width type, menu, header theme, counters, year.
  With GSAP:   Lenis smooth scroll, signature intro, hero-name → logo,
               split-text reveals, bracket headings, parallax, the pinned
               blue draw, pinned services accordion, orbit carousel,
               flying "contact" words, footer reveal, cursor image trail.
  Fallback:    if GSAP is missing or the visitor prefers reduced motion,
               the page stays static and every control still works.
=====================================================================*/
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap =
    typeof window.gsap !== "undefined" &&
    typeof window.ScrollTrigger !== "undefined" &&
    typeof window.SplitText !== "undefined" &&
    typeof window.DrawSVGPlugin !== "undefined";
  const animate = hasGsap && !reduceMotion;

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const pad = (v) => String(v).padStart(2, "0");

  let lenis = null;
  let wipeProgress = 0;

  /*==================== FIT TEXT ====================*/
  // Size .fit elements so they span their container's content width exactly.
  function fitAll() {
    $$(".fit").forEach((el) => {
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
  window.addEventListener("resize", fitAll);

  /*==================== MENU ====================*/
  const menu = $("#menu");
  const navToggle = $("#nav-toggle");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  }

  $$(".menu a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  /*==================== HEADER THEME ====================*/
  // Match header colours to whatever section sits beneath it.
  const header = $("#header");
  const wipe = $("#wipe");
  const themedBlocks = $$("[data-nav]");

  function updateHeader() {
    if (!header) return;
    const probe = header.offsetHeight / 2;
    for (const block of themedBlocks) {
      const r = block.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        let theme = block.dataset.nav;
        if (block === wipe && wipeProgress > 0.45) theme = "blue";
        if (header.dataset.theme !== theme) header.dataset.theme = theme;
        break;
      }
    }
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateHeader);

  /*==================== COUNTERS & YEAR ====================*/
  function countUp(el) {
    const target = Number(el.dataset.count) || 0;
    if (reduceMotion) return;
    const obj = { v: 0 };
    if (hasGsap) {
      gsap.to(obj, {
        v: target,
        duration: 1.4,
        ease: "power3.out",
        onUpdate: () => (el.textContent = String(Math.round(obj.v))),
      });
    }
  }

  const yearEl = $("#footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /*==================== STATIC FALLBACK ====================*/
  if (!animate) {
    const loader = $("#loader");
    if (loader) loader.style.display = "none";
    updateHeader();
    initStaticOrbit();
    return;
  }

  /*==================== ANIMATED BUILD ====================*/
  root.classList.add("gsap", "logo-scroll");
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  }
  const OSMO = window.CustomEase ? "osmo" : "power3.inOut";
  gsap.defaults({ ease: OSMO, duration: 0.6 });
  history.scrollRestoration = "manual";

  initLenis();

  // Split text measures lines, so wait for the web font (but never too long).
  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    fitAll();
    initLogoScroll();
    initSplits();
    initBrackets();
    initParallax();
    initReveals();
    initDrawTransition();
    initServices();
    initOrbit();
    initContact();
    initFooter();
    initTrail();
    ScrollTrigger.addEventListener("refresh", updateHeader);
    ScrollTrigger.refresh();
    updateHeader();
    runIntro();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  setTimeout(boot, 1500);

  /*==================== LENIS ====================*/
  function initLenis() {
    if (typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    const easeInOutQuart = (t) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    // In-page anchors glide instead of jumping.
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id === "#" || id === "#home" ? 0 : $(id);
        if (target === null) return;
        event.preventDefault();
        setMenu(false);
        lenis.scrollTo(target, { duration: 1.2, easing: easeInOutQuart });
      });
    });
  }

  /*==================== INTRO ====================*/
  // Signature draws stroke by stroke, then the fat blue ribbon retracts along
  // its own path to uncover the page, and the hero rises in.
  function runIntro() {
    const loader = $("#loader");
    const shape = $$(".loader__shape path");
    const sigWrap = $(".loader__sig-wrap");
    const sig = $$(".loader__sig path");
    const reveals = [$(".brand__text"), ...$$("[data-reveal]")].filter(Boolean);

    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
      sessionStorage.setItem("intro-seen", "1");
    } catch (e) {
      /* storage blocked — just play it */
    }

    const done = () => {
      if (loader) loader.style.display = "none";
      if (lenis) lenis.start();
      loadTrailImages();
    };

    if (!loader || !shape.length || seen) {
      if (loader) loader.style.display = "none";
      gsap.fromTo(
        reveals,
        { yPercent: 25, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: "expo.out", onComplete: done }
      );
      return;
    }

    if (lenis) lenis.stop();
    window.scrollTo(0, 0);

    const tl = gsap.timeline({ onComplete: done });
    tl.set(reveals, { yPercent: 25, autoAlpha: 0 })
      .set(shape, { drawSVG: "0% 100%", strokeWidth: "80%" })
      .set(sig, { drawSVG: "0% 0%" })
      .set(sigWrap, { visibility: "visible" })
      // Longer strokes take a little longer, like a real pen.
      .to(sig, {
        drawSVG: "0% 100%",
        duration: (i, el) => gsap.utils.mapRange(0, 2600, 0.25, 0.6, el.getTotalLength()),
        stagger: 0.11,
        ease: "power1.inOut",
      })
      .to({}, { duration: 0.35 })
      .to(sig, { drawSVG: "100% 100%", duration: 0.8, stagger: 0.03, ease: "power2.inOut" })
      .to(shape, { drawSVG: "100% 100%", strokeWidth: "5%", duration: 1.25, ease: "power1.inOut" }, "<0.35")
      .set(sigWrap, { visibility: "hidden" })
      .to(reveals, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "expo.out" }, "<0.15");
  }

  /*==================== HERO NAME → HEADER LOGO ====================*/
  // The header logo starts at the size and spot of the hero name and shrinks
  // into the corner as the hero scrolls away.
  function initLogoScroll() {
    const brand = $("#brand");
    const target = $("#hero-name .fit");
    const hero = $("#home");
    if (!brand || !target || !hero) return;

    const m = { small: 17, big: 17, y: 0 };
    const measure = () => {
      gsap.set(brand, { clearProps: "fontSize,y" });
      m.small = parseFloat(getComputedStyle(brand).fontSize);
      m.big = parseFloat(getComputedStyle(target).fontSize);
      gsap.set(brand, { fontSize: m.big });
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      m.y = targetTop - brand.getBoundingClientRect().top;
      gsap.set(brand, { clearProps: "fontSize" });
    };
    measure();

    gsap.fromTo(
      brand,
      { fontSize: () => m.big, y: () => m.y },
      {
        fontSize: () => m.small,
        y: 0,
        ease: "none",
        immediateRender: true,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onToggle: (self) => brand.classList.toggle("is-top", self.isActive && self.progress < 0.5),
        },
      }
    );
  }

  /*==================== SPLIT TEXT ====================*/
  function initSplits() {
    // Lines slide up out of masks.
    $$("[data-split-lines]").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }),
      });
    });

    // Characters roll up in 3D, like a flip board.
    $$("[data-split-roll]").forEach((el) => {
      SplitText.create(el, {
        type: "chars, lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          const depth = 0.6 * parseFloat(getComputedStyle(el).fontSize);
          gsap.set(self.lines, { perspective: 500 });
          return gsap.fromTo(
            self.chars,
            { rotationX: -110, z: -depth, y: depth, opacity: 0, transformOrigin: `50% 50% -${depth}px` },
            {
              rotationX: 0,
              z: 0,
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power4.out",
              stagger: 0.03,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        },
      });
    });

    // Letters start scattered and blurred, and assemble as you scroll.
    $$("[data-split-random]").forEach((el) => {
      const inWipe = el.closest("#wipe");
      SplitText.create(el, {
        type: "chars",
        charsClass: "split-char",
        onSplit(self) {
          const spread = Math.min(
            3 * parseFloat(getComputedStyle(el).fontSize),
            0.2 * Math.min(window.innerWidth, window.innerHeight)
          );
          const rnd = gsap.utils.random;
          return gsap.fromTo(
            self.chars,
            {
              x: () => rnd(-spread, spread),
              y: () => rnd(-spread, spread),
              rotation: () => rnd(-90, 90),
              scale: () => rnd(0.5, 1.4),
              filter: "blur(8px)",
            },
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              filter: "blur(0px)",
              ease: "none",
              stagger: { each: 0.03, from: "random" },
              scrollTrigger: inWipe
                ? { trigger: inWipe, start: "top bottom", end: "top top", scrub: true }
                : { trigger: el, start: "top bottom", end: "top 25%", scrub: true },
            }
          );
        },
      });
    });
  }

  /*==================== BRACKET HEADINGS ====================*/
  // "[" and "]" slide in from the sides as the heading scrolls up.
  function initBrackets() {
    $$("[data-bracket]").forEach((el) => {
      const l = $(".bracket__l", el);
      const r = $(".bracket__r", el);
      if (!l || !r) return;
      const inWipe = el.closest("#wipe");
      const st = inWipe
        ? { trigger: inWipe, start: "top bottom", end: "top top", scrub: true }
        : { trigger: el, start: "top bottom", end: "top 40%", scrub: true };
      gsap.fromTo(l, { xPercent: -160 }, { xPercent: 0, ease: "none", scrollTrigger: st });
      gsap.fromTo(r, { xPercent: 160 }, { xPercent: 0, ease: "none", scrollTrigger: { ...st } });
    });
  }

  /*==================== PARALLAX ====================*/
  function initParallax() {
    $$("[data-parallax]").forEach((el) => {
      const amount = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "clamp(top bottom)",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  }

  /*==================== GENERIC REVEALS ====================*/
  function initReveals() {
    $$(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => $$("[data-count]", el).forEach(countUp),
        },
      });
    });
  }

  /*==================== PINNED DRAW TRANSITION ====================*/
  // The section pins while a marker scribble draws across it; a quarter of
  // the way in the stroke starts fattening until the whole screen is blue —
  // the handoff into the services block.
  function initDrawTransition() {
    const path = $(".wipe__draw path");
    if (!wipe || !path) return;
    gsap.set(path, { drawSVG: "0% 0%", strokeWidth: "5%" });
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wipe,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            wipeProgress = self.progress;
            updateHeader();
          },
        },
      })
      .to(path, { drawSVG: "0% 85%", duration: 1, ease: "none" }, 0)
      .to(path, { strokeWidth: "80%", duration: 0.75, ease: "none" }, 0.25)
      .to(".wipe__fill", { opacity: 1, duration: 0.08, ease: "none" }, 0.92);
  }

  /*==================== SERVICES ACCORDION ====================*/
  // Desktop: the block pins; each panel collapses while the next picture
  // wipes in from the left and the old one slides off to the right. The row
  // stack slides up so only the last two bars stay above the open panel.
  function initServices() {
    const section = $("#services");
    const list = $(".svc-list", section);
    if (!section || !list) return;
    const items = $$(".svc", section).map((item) => ({
      row: $(".svc__bar", item),
      visual: $(".svc__visual", item),
      media: $(".svc__media", item),
    }));
    if (items.length < 2) return;

    gsap.matchMedia().add("(min-width: 992px)", () => {
      root.classList.add("svc-pin");

      const size = () => {
        const headerH = header ? header.offsetHeight : 0;
        section.style.paddingTop = headerH + "px";
        items.forEach(({ row, visual }, i) => {
          const prev = i > 0 ? items[i - 1].row.offsetHeight : 0;
          gsap.set(visual, {
            height: Math.max(window.innerHeight - headerH - row.offsetHeight - prev, 0),
          });
        });
      };
      size();

      gsap.set(list, { y: 0 });
      items.forEach(({ media }, i) => gsap.set(media, { left: "29%", width: i === 0 ? "71%" : "0%" }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * items.length,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: size,
        },
      });

      items.slice(0, -1).forEach((cur, i) => {
        const next = items[i + 1];
        const shift = () => {
          let y = 0;
          for (let k = 0; k <= i - 1; k++) y += items[k].row.offsetHeight;
          return -y;
        };
        tl.to(cur.visual, { height: 0, duration: 1, ease: "none" }, i)
          .to(cur.media, { left: "100%", width: "0%", duration: 1, ease: "none" }, i)
          .to(next.media, { left: "29%", width: "71%", duration: 1, ease: "none" }, i)
          .to(list, { y: shift, duration: 1, ease: "none" }, i);
      });

      return () => {
        root.classList.remove("svc-pin");
        section.style.paddingTop = "";
        gsap.set([list, ...items.map((it) => it.visual), ...items.map((it) => it.media)], {
          clearProps: "all",
        });
      };
    });
  }

  /*==================== ORBIT CAROUSEL ====================*/
  // Cards sit on a ring: position = sin(angle) along an axis that itself
  // spins slowly; cards facing us are big and sharp, the rest shrink and
  // blur. The front card widens by 15% and its mask opens top and bottom.
  function initOrbit() {
    const orbit = $("#orbit");
    const ring = $("#orbit-ring");
    if (!orbit || !ring) return;

    const tiles = $$(".orbit__tile", ring);
    const cards = tiles.map((t) => $(".orbit__card", t));
    const masks = tiles.map((t) => $(".orbit__mask", t));
    const items = $$(".orbit__item", orbit);
    const current = $("#orbit-current");
    const total = $("#orbit-total");
    const n = tiles.length;
    if (n < 2) return;
    if (total) total.textContent = pad(n);

    const wrap = gsap.utils.wrap(0, n);
    const lerp = gsap.utils.interpolate;
    const state = { step: 0, spin: 0, width: 0 };
    let target = 0;
    let active = 0;
    let shown = -1;
    let inView = false;
    let focused = false;
    let stepTween = null;
    let widthTween = null;

    const natural = () => {
      gsap.set(cards, { clearProps: "width" });
      return cards[0].offsetWidth;
    };
    let base = natural();
    state.width = base * 1.15;

    // Mask opens as --reveal goes 0 → 1.
    function paintMask(i, reveal) {
      const inset = 0.18 * cards[i].offsetHeight * (1 - reveal);
      const v = inset <= 0.5 ? 0 : inset;
      masks[i].style.clipPath = `inset(${v}px 0px ${v}px 0px round 0.65em)`;
    }

    function layout() {
      const radius = 0.62 * state.width;
      gsap.set(ring, { rotation: state.spin });
      tiles.forEach((tile, i) => {
        const angle = ((i - state.step) / n) * Math.PI * 2;
        const facing = Math.pow((Math.cos(angle) + 1) / 2, 1.3);
        gsap.set(tile, {
          xPercent: -50,
          yPercent: -50,
          x: Math.sin(angle) * radius,
          y: 0,
          scale: lerp(0.2, 1, facing),
          rotation: -state.spin,
          filter: `blur(${lerp(0.04 * state.width, 0, facing).toFixed(2)}px)`,
          zIndex: Math.round(1000 * facing),
        });
      });
    }

    function setActiveCard(i) {
      cards.forEach((card, k) => {
        const on = k === i;
        card.style.pointerEvents = on && card.hasAttribute("href") ? "auto" : "none";
        card.tabIndex = on ? 0 : -1;
      });
    }

    function open(i, animated) {
      const card = cards[i];
      const w = base * 1.15;
      const r = { v: animated ? 0 : 1 };
      if (!animated) {
        gsap.set(card, { width: w });
        paintMask(i, 1);
        return;
      }
      gsap.to(card, { width: w, duration: 0.75, ease: OSMO, overwrite: true });
      gsap.to(r, { v: 1, duration: 0.75, ease: OSMO, onUpdate: () => paintMask(i, r.v) });
    }

    function close(i) {
      const card = cards[i];
      const r = { v: 1 };
      gsap.to(card, { width: base, duration: 0.55, ease: OSMO, overwrite: true });
      gsap.to(r, { v: 0, duration: 0.55, ease: OSMO, onUpdate: () => paintMask(i, r.v) });
    }

    // Text: lines of the old project roll up and out, the new ones roll in.
    const texts = items.map((item) => ({
      item,
      lines: $$("[data-orbit-lines]", item).flatMap(
        (el) => SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" }).lines
      ),
    }));
    let textTl = null;

    function showText(i, animated) {
      if (i === shown) return;
      const prev = shown >= 0 ? texts[shown] : null;
      const next = texts[i];
      shown = i;
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      textTl && textTl.kill();
      texts.forEach((t, k) => {
        if (k !== i && t !== prev) gsap.set(t.item, { autoAlpha: 0 });
      });
      if (!animated) {
        gsap.set(next.item, { autoAlpha: 1 });
        gsap.set(next.lines, { yPercent: 0 });
        return;
      }
      textTl = gsap.timeline();
      if (prev) {
        textTl
          .to(prev.lines, { yPercent: -110, duration: 0.35, stagger: 0.025, ease: "power3.in" })
          .set(prev.item, { autoAlpha: 0 });
      }
      textTl
        .set(next.item, { autoAlpha: 1 })
        .fromTo(
          next.lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, stagger: 0.055, ease: "power4.out" },
          prev ? "-=0.1" : 0
        );
    }

    function showCount(i, animated) {
      if (!current) return;
      if (!animated) {
        current.textContent = pad(i + 1);
        return;
      }
      gsap
        .timeline()
        .to(current, { yPercent: -100, autoAlpha: 0, duration: 0.3, ease: "power3.in" })
        .call(() => (current.textContent = pad(i + 1)))
        .set(current, { yPercent: 100 })
        .to(current, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
    }

    function go(dir) {
      const prev = active;
      target += dir;
      active = wrap(target);
      close(prev);
      showCount(active, true);
      showText(active, true);
      setActiveCard(active);

      widthTween && widthTween.kill();
      widthTween = gsap.to(state, { width: base, duration: 0.55, ease: OSMO, onUpdate: layout });
      stepTween && stepTween.kill();
      stepTween = gsap.to(state, {
        step: target,
        duration: 0.7,
        ease: OSMO,
        onUpdate: layout,
        onComplete: () => {
          open(active, true);
          widthTween && widthTween.kill();
          widthTween = gsap.to(state, { width: base * 1.15, duration: 0.75, ease: OSMO, onUpdate: layout });
        },
      });
    }

    // Initial state.
    texts.forEach((t) => {
      gsap.set(t.item, { autoAlpha: 0 });
      gsap.set(t.lines, { yPercent: 110 });
    });
    cards.forEach((_, i) => paintMask(i, 0));
    open(0, false);
    showText(0, false);
    showCount(0, false);
    setActiveCard(0);
    layout();

    // Slow continuous spin of the ring's axis, only while it's on screen.
    const spin = gsap.to(state, { spin: 360, duration: 24, ease: "none", repeat: -1, paused: true, onUpdate: layout });
    ScrollTrigger.create({
      trigger: orbit,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        inView = self.isActive;
        inView ? spin.play() : spin.pause();
      },
    });
    ScrollTrigger.create({
      trigger: orbit,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => (focused = self.isActive),
    });

    $("#orbit-prev").addEventListener("click", () => go(-1));
    $("#orbit-next").addEventListener("click", () => go(1));

    window.addEventListener("keydown", (event) => {
      if (!focused) return;
      const el = document.activeElement;
      if (el && el.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    });

    let touchX = null;
    orbit.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    orbit.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      touchX = null;
    });

    new ResizeObserver(() => {
      base = natural();
      state.width = base * 1.15;
      open(active, false);
      cards.forEach((_, i) => i !== active && paintMask(i, 0));
      layout();
    }).observe(orbit);
  }

  // Reduced motion / no GSAP: a scrollable strip plus working prev/next.
  function initStaticOrbit() {
    const ring = $("#orbit-ring");
    const items = $$(".orbit__item");
    const current = $("#orbit-current");
    if (!ring || !items.length) return;
    let active = 0;
    const show = (i) => {
      active = (i + items.length) % items.length;
      items.forEach((it, k) => it.classList.toggle("is-active", k === active));
      if (current) current.textContent = pad(active + 1);
      const tile = ring.children[active];
      if (tile) ring.scrollTo({ left: tile.offsetLeft - ring.offsetLeft, behavior: "auto" });
    };
    const prev = $("#orbit-prev");
    const next = $("#orbit-next");
    if (prev) prev.addEventListener("click", () => show(active - 1));
    if (next) next.addEventListener("click", () => show(active + 1));
  }

  /*==================== CONTACT: FLYING WORDS ====================*/
  // Fifty words start deep in the scene, fly toward the viewer past the
  // heading and vanish; the heading itself sharpens into focus.
  function initContact() {
    const track = $("#contact-track");
    const content = $("#contact-content");
    const box = $("#contact-words");
    if (!track || !content || !box) return;

    gsap.fromTo(
      content,
      { autoAlpha: 0, yPercent: 25, scale: 0.96, filter: "blur(0.5rem)" },
      {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        filter: "blur(0rem)",
        ease: "none",
        scrollTrigger: { trigger: track, start: "top 60%", end: "top 25%", scrub: true },
      }
    );

    const words = [
      "CONTACT", "सम्पर्क", "CONTACTO", "CONTACTEZ", "CONTATTO", "KONTAKT",
      "संपर्क", "CONTATO", "ΕΠΙΚΟΙΝΩΝΙΑ", "連絡", "연락", "تواصل",
    ];
    // Sixteen anchor points around the centre, in vw / vh.
    const spots = [
      [-38, -38], [-14, -40], [14, -40], [38, -38],
      [-42, -14], [-18, -18], [18, -18], [42, -14],
      [-42, 14], [-18, 18], [18, 18], [42, 14],
      [-38, 38], [-14, 40], [14, 40], [38, 38],
    ];
    const rnd = gsap.utils.random;
    const count = window.innerWidth < 768 ? 30 : 50;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
    });

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "contact__word";
      el.textContent = words[i % words.length];
      box.appendChild(el);

      const [sx, sy] = spots[i % spots.length];
      const wave = 0.12 * Math.floor(i / spots.length);
      const at = rnd(0, 0.52) + wave;
      const inDur = rnd(0.12, 0.18);
      const outDur = rnd(0.12, 0.18);
      const x0 = sx * rnd(0.08, 0.22);
      const y0 = sy * rnd(0.08, 0.22);
      const x1 = sx + rnd(-4, 4);
      const y1 = sy + rnd(-4, 4);
      const size = rnd(0.7, 1.3);

      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: `${x0}vw`,
        y: `${y0}vh`,
        z: rnd(-1600, -1100),
        scale: 0.35 * size,
        autoAlpha: 0,
        filter: "blur(0.65rem)",
      });
      tl.to(
        el,
        {
          x: `${x1}vw`,
          y: `${y1}vh`,
          z: 0,
          scale: size,
          autoAlpha: rnd(0.25, 0.62),
          filter: "blur(0rem)",
          duration: inDur,
          ease: "power1.inOut",
        },
        at
      ).to(
        el,
        {
          x: `${x1 + rnd(-3, 3)}vw`,
          y: `${y1 + rnd(-3, 3)}vh`,
          z: rnd(800, 1200),
          scale: size * rnd(1.3, 1.65),
          autoAlpha: 0,
          filter: "blur(0.5rem)",
          duration: outDur,
          ease: "power1.in",
        },
        at + inDur
      );
    }
  }

  /*==================== FOOTER REVEAL ====================*/
  // The footer content slides out from under the page above it.
  function initFooter() {
    const footer = $("#footer");
    const inner = $("#footer-inner");
    if (!footer || !inner) return;
    gsap.matchMedia().add("(min-width: 768px)", () => {
      gsap.from(inner, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: { trigger: footer, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true },
      });
    });
  }

  /*==================== CURSOR IMAGE TRAIL ====================*/
  // Moving the mouse across the hero drops project screenshots that pop,
  // drift along the cursor's path and shrink away.
  function loadTrailImages() {
    $$(".trail img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  function initTrail() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const hero = $("[data-trail]");
    const sources = $$(".trail img", hero || document);
    if (!hero || !sources.length) return;

    const threshold = window.innerWidth / 7;
    let travelled = 0;
    let lastX = 0;
    let lastY = 0;
    let started = false;
    let index = 0;

    hero.addEventListener("mousemove", (event) => {
      const box = hero.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      if (!started) {
        lastX = event.clientX;
        lastY = event.clientY;
        started = true;
        return;
      }
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      travelled += Math.abs(dx) + Math.abs(dy);
      if (travelled < threshold) return;
      travelled = 0;

      const src = sources[index % sources.length];
      index++;
      if (!src.currentSrc && !src.src) return;
      const img = document.createElement("img");
      img.className = "trail-img";
      img.src = src.currentSrc || src.src;
      img.alt = "";
      hero.appendChild(img);

      gsap
        .timeline({ onComplete: () => img.remove() })
        .fromTo(
          img,
          { xPercent: 80 * (Math.random() - 0.5) - 50, yPercent: 10 * (Math.random() - 0.5) - 50, scale: 1.3 },
          { scale: 1, ease: "elastic.out(2, 0.6)", duration: 0.6 }
        )
        .fromTo(
          img,
          { x, y, rotation: 20 * (Math.random() - 0.5) },
          { x: "+=" + dx * 4, y: "+=" + dy * 4, rotation: 20 * (Math.random() - 0.5), ease: "power4.out", duration: 1.5 },
          "<"
        )
        .to(img, { scale: 0.5, autoAlpha: 0, duration: 0.3, delay: 0.1, ease: "back.in(1.5)" });
    });
  }
})();
