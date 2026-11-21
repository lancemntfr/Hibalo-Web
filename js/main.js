// Progressive enhancement for the gallery tabs, the FAQ accordion and the
// Levels, Built with and Team dropdowns. Without JavaScript every gallery panel
// and FAQ answer stays visible, and the dropdowns still open and close natively.

(function () {
  'use strict';

  /* Gallery tabs (WAI-ARIA tabs pattern, automatic activation) */

  function initGallery() {
    var tablist = document.querySelector('.tabs[role="tablist"]');
    if (!tablist) return;

    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });

    function select(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      var shots = panels[index].querySelector('.shots');
      if (shots) shots.scrollLeft = 0;
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        select(index, false);
      });

      tab.addEventListener('keydown', function (event) {
        var last = tabs.length - 1;
        var next = null;
        switch (event.key) {
          case 'ArrowRight': next = index === last ? 0 : index + 1; break;
          case 'ArrowLeft': next = index === 0 ? last : index - 1; break;
          case 'Home': next = 0; break;
          case 'End': next = last; break;
        }
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });

    panels.forEach(function (panel) {
      initDots(panel.querySelector('.shots'));
    });

    select(0, false);
  }

  /* Page dots for the swipeable screen row on small screens */

  function initDots(shots) {
    if (!shots) return;
    var items = shots.querySelectorAll('.shot');
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < items.length; i++) {
      var dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' dot--active' : '');
      dots.appendChild(dot);
    }
    shots.after(dots);

    var frame = null;
    shots.addEventListener('scroll', function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
        var active = Math.round(shots.scrollLeft / step);
        if (shots.scrollLeft + shots.clientWidth >= shots.scrollWidth - 2) active = items.length - 1;
        for (var j = 0; j < dots.children.length; j++) {
          dots.children[j].classList.toggle('dot--active', j === active);
        }
      });
    }, { passive: true });
  }

  /* FAQ accordion on small screens. On wider screens every answer is shown,
     as in the desktop design. */

  var CHEVRON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/></svg>';

  function initFaq() {
    var list = document.querySelector('[data-faq]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));
    var query = window.matchMedia('(max-width: 767px)');

    var parts = items.map(function (item, i) {
      var heading = item.querySelector('h3');
      var answer = item.querySelector('.faq-item__answer');
      var question = heading.textContent;
      answer.id = 'faq-answer-' + (i + 1);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'faq-item__button';
      button.id = 'faq-question-' + (i + 1);
      button.setAttribute('aria-controls', answer.id);
      button.innerHTML = '<span></span>' + CHEVRON;
      button.firstChild.textContent = question;
      button.addEventListener('click', function () {
        var open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        answer.hidden = open;
      });

      return { item: item, heading: heading, answer: answer, question: question, button: button };
    });

    function apply() {
      parts.forEach(function (part, i) {
        if (query.matches) {
          var open = i === 0;
          part.heading.textContent = '';
          part.heading.appendChild(part.button);
          part.button.setAttribute('aria-expanded', String(open));
          part.answer.hidden = !open;
          part.answer.setAttribute('role', 'region');
          part.answer.setAttribute('aria-labelledby', part.button.id);
          part.item.classList.add('faq-item--accordion');
        } else {
          part.heading.textContent = part.question;
          part.answer.hidden = false;
          part.answer.removeAttribute('role');
          part.answer.removeAttribute('aria-labelledby');
          part.item.classList.remove('faq-item--accordion');
        }
      });
    }

    apply();
    query.addEventListener('change', apply);
  }

  /* Levels, Built with and Team dropdowns. Below 768px they start closed and
     open and close natively. From 768px up every row is open and the title
     row cannot close it, as in the desktop design. */

  function initDropdowns() {
    var dropdowns = Array.prototype.slice.call(
      document.querySelectorAll('details.level-card, details.info-card, details.team-card')
    );
    if (!dropdowns.length) return;
    var desktop = window.matchMedia('(min-width: 768px)');

    function apply() {
      dropdowns.forEach(function (details) {
        var summary = details.querySelector('summary');
        details.open = desktop.matches;
        if (desktop.matches) summary.tabIndex = -1;
        else summary.removeAttribute('tabindex');
      });
    }

    dropdowns.forEach(function (details) {
      details.querySelector('summary').addEventListener('click', function (event) {
        if (desktop.matches) event.preventDefault();
      });
    });

    apply();
    desktop.addEventListener('change', apply);
  }

  initGallery();
  initFaq();
  initDropdowns();
})();
