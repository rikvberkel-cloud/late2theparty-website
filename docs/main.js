/* ============================================
   R-010 — main.js
   ============================================ */

(function () {
  'use strict';

  /* JavaScript draait, dus animaties mogen aan. Zonder deze klasse blijft
     alle inhoud gewoon zichtbaar in plaats van op opacity 0 te hangen. */
  document.documentElement.classList.add('js');

  /* ------------------------------------------
     1. CURSOR GLOW (desktop only)
     ------------------------------------------ */
  var cursorGlow = document.getElementById('cursorGlow');
  var isTouch = window.matchMedia('(hover: none)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (cursorGlow && !isTouch && !prefersReducedMotion) {
    var glowX = 0, glowY = 0, currentX = 0, currentY = 0;
    var glowActive = false;

    document.addEventListener('mousemove', function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      if (!glowActive) {
        glowActive = true;
        cursorGlow.classList.add('cursor-glow--visible');
        updateGlow();
      }
    });

    document.addEventListener('mouseleave', function () {
      glowActive = false;
      cursorGlow.classList.remove('cursor-glow--visible');
    });

    function updateGlow() {
      if (!glowActive) return;
      currentX += (glowX - currentX) * 0.15;
      currentY += (glowY - currentY) * 0.15;
      cursorGlow.style.transform = 'translate(' + (currentX - 160) + 'px,' + (currentY - 160) + 'px)';
      requestAnimationFrame(updateGlow);
    }
  }

  /* ------------------------------------------
     3. SKILL TREE SCROLL ANIMATION
     ------------------------------------------ */
  var skillTree = document.querySelector('.skill-tree--animate');

  if (skillTree && 'IntersectionObserver' in window) {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('skill-tree--visible');
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillObserver.observe(skillTree);
  } else if (skillTree) {
    skillTree.classList.add('skill-tree--visible');
  }

  /* ------------------------------------------
     4. FADE-IN ON SCROLL (IntersectionObserver)
     ------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('fade-in--visible');
    });
  }

  /* ------------------------------------------
     5. SCROLL-SPY (actieve nav-link markeren)
     ------------------------------------------ */
  var navLinks = document.querySelectorAll('.site-nav__link');

  if (navLinks.length && 'IntersectionObserver' in window) {
    var spyTargets = [];
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var hash = href.indexOf('#') === -1 ? '' : href.slice(href.indexOf('#') + 1);
      var target = hash ? document.getElementById(hash) : null;
      if (target) spyTargets.push(target);
    });

    function setActive(id) {
      navLinks.forEach(function (link) {
        link.classList.toggle('site-nav__link--active', link.getAttribute('href') === '#' + id);
      });
    }

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spyTargets.forEach(function (t) { spyObserver.observe(t); });
  }

  /* ------------------------------------------
     6. AGENDA TABBLADEN
     ------------------------------------------ */
  var agendaTabs = document.querySelectorAll('.agenda-tab');

  if (agendaTabs.length) {
    var tabsArray = Array.prototype.slice.call(agendaTabs);

    function activeerTab(tab, verplaatsFocus) {
      var doel = tab.getAttribute('data-paneel');

      tabsArray.forEach(function (t) {
        var actief = t === tab;
        t.classList.toggle('agenda-tab--on', actief);
        t.setAttribute('aria-selected', actief ? 'true' : 'false');
        t.tabIndex = actief ? 0 : -1;
      });

      document.querySelectorAll('.agenda-paneel').forEach(function (paneel) {
        paneel.hidden = paneel.id !== 'paneel-' + doel;
      });

      if (verplaatsFocus) tab.focus();
    }

    tabsArray.forEach(function (tab, index) {
      /* Roving tabindex: alleen de actieve tab is met Tab bereikbaar,
         binnen de tablist navigeer je met de pijltjestoetsen. */
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

      tab.addEventListener('click', function () {
        activeerTab(tab, false);
      });

      tab.addEventListener('keydown', function (e) {
        var nieuw = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nieuw = tabsArray[(index + 1) % tabsArray.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nieuw = tabsArray[(index - 1 + tabsArray.length) % tabsArray.length];
        } else if (e.key === 'Home') {
          nieuw = tabsArray[0];
        } else if (e.key === 'End') {
          nieuw = tabsArray[tabsArray.length - 1];
        }
        if (nieuw) {
          e.preventDefault();
          activeerTab(nieuw, true);
        }
      });
    });
  }

  /* ------------------------------------------
     7. MOBIELE NAV
     ------------------------------------------ */
  var nav = document.getElementById('siteNav') || document.querySelector('.site-nav');
  var navToggle = document.getElementById('navToggle');
  var navLinksBox = document.getElementById('siteNavLinks');

  function setNavOpen(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.textContent = open ? 'Sluit' : 'Menu';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('is-open'));
    });
    if (navLinksBox) {
      navLinksBox.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setNavOpen(false); });
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNavOpen(false);
    });
  }

  /* ------------------------------------------
     8. SPOTIFY: desktop meteen, mobiel na tap
     ------------------------------------------ */
  function mountSpotify(box, autoplay) {
    if (!box || box.classList.contains('spotify-embed--on')) return;
    var src = box.getAttribute('data-spotify');
    var title = box.getAttribute('data-title') || 'Spotify';
    if (!src) return;
    if (autoplay) {
      src += (src.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
    }
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '152';
    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');
    iframe.title = title;
    iframe.style.borderRadius = '12px';
    var playBtn = box.querySelector('.spotify-embed__play');
    if (playBtn) playBtn.remove();
    box.appendChild(iframe);
    box.classList.add('spotify-embed--on');
  }

  var compactSpotify = window.matchMedia('(max-width: 640px)');

  function wireSpotify() {
    var compact = compactSpotify.matches;
    document.querySelectorAll('.spotify-embed[data-spotify]').forEach(function (box) {
      if (!compact) {
        mountSpotify(box);
        return;
      }
      var playBtn = box.querySelector('.spotify-embed__play');
      if (playBtn && !playBtn.getAttribute('data-wired')) {
        playBtn.setAttribute('data-wired', '1');
        playBtn.addEventListener('click', function () { mountSpotify(box, true); });
      }
    });
  }

  wireSpotify();
  if (compactSpotify.addEventListener) {
    compactSpotify.addEventListener('change', wireSpotify);
  }

  /* ------------------------------------------
     9. AGENDA "BOEK ME" (lege komende lijst)
     ------------------------------------------ */
  document.querySelectorAll('.agenda-leeg__knop').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView();
    });
  });

  /* ------------------------------------------
     10. INSCHRIJVEN
     Inline embed op #aanmelden. Geen ml('show'):
     dat is de balk-popup (6erjz7, paused in dashboard).

     FORMULIER: Embedded form aK1pC9 in de HTML.
     Universal JS alleen laden als die embed op de pagina staat.
     ------------------------------------------ */
  var ML_ACCOUNT = '2547241';

  if (document.querySelector('.ml-embedded')) {
    if (!document.getElementById('mailerlite-universal')) {
      window.ml = window.ml || function () {
        (window.ml.q = window.ml.q || []).push(arguments);
      };
      window.ml('account', ML_ACCOUNT);
      var s = document.createElement('script');
      s.id = 'mailerlite-universal';
      s.src = 'https://assets.mailerlite.com/js/universal.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }
})();
