/*=====================================================================
  Milan Sapkota — Portfolio interactions
  Navigation, theme, scroll-spy, scroll progress and reveal animations.
=====================================================================*/
(function () {
  "use strict";

  /*==================== MOBILE NAVIGATION ====================*/
  const navMenu = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");
  const navClose = document.getElementById("nav-close");
  const navBackdrop = document.getElementById("nav-backdrop");

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add("show-menu");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    if (navBackdrop) {
      navBackdrop.hidden = false;
      requestAnimationFrame(() => navBackdrop.classList.add("is-open"));
    }
  }

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("show-menu");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    if (navBackdrop) {
      navBackdrop.classList.remove("is-open");
      setTimeout(() => {
        if (!navBackdrop.classList.contains("is-open")) navBackdrop.hidden = true;
      }, 300);
    }
  }

  if (navToggle) navToggle.addEventListener("click", openMenu);
  if (navClose) navClose.addEventListener("click", closeMenu);
  if (navBackdrop) navBackdrop.addEventListener("click", closeMenu);

  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  /*==================== DARK / LIGHT THEME ====================*/
  const themeButton = document.getElementById("theme-button");
  const themeIcon = themeButton ? themeButton.querySelector("i") : null;
  const DARK_CLASS = "dark-theme";

  function setTheme(isDark) {
    document.body.classList.toggle(DARK_CLASS, isDark);
    document.documentElement.classList.remove("theme-dark-preload");

    if (themeIcon) {
      themeIcon.classList.toggle("uil-sun", isDark);
      themeIcon.classList.toggle("uil-moon", !isDark);
    }
    if (themeButton) {
      themeButton.setAttribute("aria-pressed", String(isDark));
      themeButton.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#0a0c14" : "#7c3aed");
  }

  // Restore the stored choice, otherwise follow the OS preference.
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("selected-theme");
  } catch (e) {
    /* storage blocked (private mode) — fall through to the OS preference */
  }

  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(storedTheme ? storedTheme === "dark" : prefersDark);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const isDark = !document.body.classList.contains(DARK_CLASS);
      setTheme(isDark);
      try {
        localStorage.setItem("selected-theme", isDark ? "dark" : "light");
      } catch (e) {
        /* nothing to persist to — the toggle still works for this session */
      }
    });
  }

  /*==================== SCROLL: HEADER, SPY, TOP ====================*/
  const header = document.getElementById("header");
  const scrollUp = document.getElementById("scroll-up");
  const sections = document.querySelectorAll("main section[id]");

  function onScroll() {
    const scrollY = window.pageYOffset;

    if (header) header.classList.toggle("scroll-header", scrollY >= 40);
    if (scrollUp) scrollUp.classList.toggle("show-scroll", scrollY >= 420);

    // Scroll-spy: highlight the section currently under the header.
    const offset = scrollY + (header ? header.offsetHeight : 0) + 80;
    let currentId = null;

    sections.forEach((section) => {
      if (offset >= section.offsetTop) currentId = section.getAttribute("id");
    });

    // Near the bottom of the page the last section may never win on offset alone.
    if (
      scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4
    ) {
      const last = sections[sections.length - 1];
      if (last) currentId = last.getAttribute("id");
    }

    document.querySelectorAll(".nav__link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active-link", href === "#" + currentId);
    });
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
  onScroll();

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
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((el, index) => {
      // Stagger siblings slightly so grids cascade instead of popping at once.
      el.style.transitionDelay = (index % 4) * 70 + "ms";
      observer.observe(el);
    });
  }

  /*==================== FOOTER YEAR ====================*/
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
