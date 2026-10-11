/**
 * main.js — Sesethu Batala Portfolio
 *
 * Handles:
 *  1. Navigation scroll state (header shadow on scroll)
 *  2. Mobile navigation toggle (open / close)
 *  3. Close mobile menu on nav-link click or outside click
 *  4. Active nav-link highlighting based on scroll position
 *  5. Scroll-reveal animation for section elements
 *  6. Smooth-scroll polyfill for browsers without native support
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */
  const header     = document.querySelector('.site-header');
  const navToggle  = document.querySelector('.nav-toggle');
  const navMenu    = document.querySelector('.nav-menu');
  const navLinks   = document.querySelectorAll('.nav-link');
  const sections   = document.querySelectorAll('section[id]');

  /* ----------------------------------------------------------
     1. HEADER SCROLL STATE
     Adds `.scrolled` class once the user scrolls past 8px,
     which triggers the border and shadow in CSS.
  ---------------------------------------------------------- */
  function updateHeaderState() {
    if (window.scrollY > 8) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState(); // run once on load

  /* ----------------------------------------------------------
     2. MOBILE NAV TOGGLE
  ---------------------------------------------------------- */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.contains('open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  function openMenu() {
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    // Trap focus loosely — move focus to first link
    const firstLink = navMenu.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  /* ----------------------------------------------------------
     3a. CLOSE MENU ON NAV-LINK CLICK (mobile)
  ---------------------------------------------------------- */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  });

  /* ----------------------------------------------------------
     3b. CLOSE MENU ON OUTSIDE CLICK / ESC KEY
  ---------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    if (
      navMenu &&
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  /* ----------------------------------------------------------
     4. ACTIVE NAV-LINK HIGHLIGHTING
     Uses IntersectionObserver to track which section is in view.
     Falls back gracefully if the API is unavailable.
  ---------------------------------------------------------- */
  if ('IntersectionObserver' in window && sections.length) {
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64',
      10
    );

    const observerOptions = {
      root: null,
      // Trigger when the top of a section crosses just below the nav
      rootMargin: '-' + navHeight + 'px 0px -60% 0px',
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          setActiveLink(id);
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    function setActiveLink(id) {
      navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === '#' + id) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
  }

  /* ----------------------------------------------------------
     5. SCROLL-REVEAL ANIMATION
     Adds `.reveal` to animatable elements, then uses
     IntersectionObserver to add `.visible` once they enter
     the viewport. Respects prefers-reduced-motion via CSS.
  ---------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    // Elements to animate — be specific to avoid layout shifts
    const revealTargets = document.querySelectorAll(
      '.interest-card, .work-card, .capability-group, .education-item, ' +
      '.quality-item, .contact-item, .about-text, .about-qualities, .section-intro'
    );

    // Stagger cards within grids for a cascading effect
    const staggerParents = document.querySelectorAll(
      '.interests-grid, .work-grid, .capabilities-grid, .qualities-list, .contact-links'
    );

    staggerParents.forEach(function (parent) {
      const children = parent.querySelectorAll(
        '.interest-card, .work-card, .capability-group, .quality-item, .contact-item'
      );
      children.forEach(function (child, index) {
        child.style.transitionDelay = (index * 60) + 'ms';
      });
    });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after reveal — no need to watch further
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     6. SMOOTH-SCROLL POLYFILL
     Native scroll-behavior: smooth is in CSS. This handles
     older browsers and ensures offset accounts for the fixed nav.
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navHeight = header ? header.offsetHeight : 0;
      const targetTop =
        targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

      // Use native smooth scroll if available
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        window.scrollTo(0, targetTop);
      }

      // Move focus to the target section for keyboard/screen-reader users
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
      targetEl.addEventListener(
        'blur',
        function () {
          targetEl.removeAttribute('tabindex');
        },
        { once: true }
      );
    });
  });

})();
