/* ============================================
   all-electric · main.js
   Beweging volgt het design system: alleen korte overgangen van kleur,
   gloed en schaduw. Geen parallax, geen fades bij laden.
   ============================================ */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ------------------------------------------
     1. STOPLICHTSCHEMA: lampjes aan bij scrollen
     De vakken staan zonder JavaScript gewoon aan.
     ------------------------------------------ */
  var skill = document.querySelector('.ae-skill--animate');

  if (skill && 'IntersectionObserver' in window) {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-on');
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    skillObserver.observe(skill);
  } else if (skill) {
    skill.classList.add('is-on');
  }

  /* ------------------------------------------
     2. EERSTVOLGEND OPTREDEN IN DE HERO
     Eén bron: de bovenste rij onder Komend in de agenda.
     ------------------------------------------ */
  var heroNext = document.getElementById('heroNext');
  var eerste = document.querySelector('#paneel-komend .ae-agenda__row');

  if (heroNext && eerste) {
    var datum = eerste.querySelector('.ae-agenda__date');
    var naam = eerste.querySelector('.ae-agenda__name');
    var plek = eerste.querySelector('.ae-agenda__loc');

    function deel(cls, tekst) {
      var s = document.createElement('span');
      s.className = cls;
      s.textContent = tekst;
      return s;
    }

    heroNext.appendChild(deel('ae-hero__next-k', 'Komend'));
    if (datum) heroNext.appendChild(deel('ae-hero__next-d', datum.textContent.trim()));
    if (naam) heroNext.appendChild(deel('ae-hero__next-n', naam.textContent.trim()));
    if (plek) {
      var l = document.createElement('span');
      l.className = 'ae-hero__next-l';
      l.innerHTML = plek.innerHTML;
      heroNext.appendChild(l);
    }
    heroNext.hidden = false;
  }

  /* ------------------------------------------
     3. SCROLL-SPY: actieve link in de navigatie
     ------------------------------------------ */
  var navLinks = document.querySelectorAll('.ae-nav__link[href^="#"]');

  if (navLinks.length && 'IntersectionObserver' in window) {
    var spyTargets = [];
    navLinks.forEach(function (link) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) spyTargets.push(target);
    });

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spyTargets.forEach(function (t) { spyObserver.observe(t); });
  }

  /* ------------------------------------------
     4. AGENDA-TABS (klik en pijltjestoetsen)
     ------------------------------------------ */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ae-tab[data-paneel]'));

  function activeerTab(tab, verplaatsFocus) {
    tabs.forEach(function (t) {
      var actief = t === tab;
      t.setAttribute('aria-selected', actief ? 'true' : 'false');
      t.tabIndex = actief ? 0 : -1;
    });
    document.querySelectorAll('.agenda-paneel').forEach(function (paneel) {
      paneel.hidden = paneel.id !== 'paneel-' + tab.getAttribute('data-paneel');
    });
    if (verplaatsFocus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', function () { activeerTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var nieuw = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nieuw = tabs[(index + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nieuw = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') nieuw = tabs[0];
      else if (e.key === 'End') nieuw = tabs[tabs.length - 1];
      if (nieuw) {
        e.preventDefault();
        activeerTab(nieuw, true);
      }
    });
  });

  /* ------------------------------------------
     5. SPOTIFY: desktop meteen, mobiel na tik
     ------------------------------------------ */
  function mountSpotify(box, autoplay) {
    if (!box || box.classList.contains('is-loaded')) return;
    var src = box.getAttribute('data-spotify');
    if (!src) return;
    if (autoplay) src += (src.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '152';
    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    iframe.setAttribute('loading', 'lazy');
    iframe.title = box.getAttribute('data-title') || 'Spotify';
    var knop = box.querySelector('.listen-card__play');
    if (knop) knop.remove();
    box.appendChild(iframe);
    box.classList.add('is-loaded');
  }

  var compact = window.matchMedia('(max-width: 640px)');

  function wireSpotify() {
    document.querySelectorAll('.listen-card[data-spotify]').forEach(function (box) {
      if (!compact.matches) {
        mountSpotify(box);
        return;
      }
      var knop = box.querySelector('.listen-card__play');
      if (knop && !knop.getAttribute('data-wired')) {
        knop.setAttribute('data-wired', '1');
        knop.addEventListener('click', function () { mountSpotify(box, true); });
      }
    });
  }

  wireSpotify();
  if (compact.addEventListener) compact.addEventListener('change', wireSpotify);

  /* ------------------------------------------
     6. INSCHRIJVEN
     Inline embed aK1pC9 op #aanmelden en /nieuwsbrief/. Geen ml('show'):
     dat is de popup (6erjz7, paused in het dashboard).
     Universal JS alleen laden als de embed op de pagina staat.
     ------------------------------------------ */
  var ML_ACCOUNT = '2547241';

  if (document.querySelector('.ml-embedded') && !document.getElementById('mailerlite-universal')) {
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
})();
