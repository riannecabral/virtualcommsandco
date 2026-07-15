/* Brivon — free HTML template. Minimal vanilla JS: mobile drawer + scroll-reveal. */
(function () {
  'use strict';

  // Mobile drawer
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = drawer && drawer.querySelector('.drawer-close');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle) toggle.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
  });

  // Reveal on intersect (respects prefers-reduced-motion)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.reveal');
    if (els.length) {
      els.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
      });
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
      els.forEach(function (el) { io.observe(el); });
    }
  }

  // Sticky header subtle shadow on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    let last = 0;
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      if (y > 4 && last <= 4) header.style.boxShadow = '0 8px 24px -16px rgba(0,0,0,0.6)';
      if (y <= 4 && last > 4) header.style.boxShadow = 'none';
      last = y;
    }, { passive: true });
  }

  // Carry a selected service into the inquiry form and provide a local confirmation.
  const serviceCards = document.querySelectorAll('[data-service-choice]');
  const serviceSelect = document.querySelector('#f-service');
  serviceCards.forEach(function (card) {
    card.addEventListener('change', function () {
      if (serviceSelect) serviceSelect.value = card.getAttribute('data-service-choice');
      const form = document.querySelector('#inquiry');
      if (form) form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
  const inquiryForm = document.querySelector('[data-vcc-form]');
  if (inquiryForm) {
    function openInquiryEmail(payload, status) {
      const lines = [
        'New Virtual Comms and Co. discovery inquiry',
        '',
        'Name: ' + (payload.name || ''),
        'Email: ' + (payload.email || ''),
        'Company: ' + (payload.company || ''),
        'Service: ' + (payload.service || ''),
        'Monthly budget: ' + (payload.budget || ''),
        'Ideal start: ' + (payload.timeline || ''),
        '',
        'Goal:',
        payload.goal || ''
      ];
      const mailto = 'mailto:virtualcommsandco@gmail.com' +
        '?cc=' + encodeURIComponent('cabral.rianne@gmail.com') +
        '&subject=' + encodeURIComponent('New Virtual Comms and Co. discovery inquiry') +
        '&body=' + encodeURIComponent(lines.join('\n'));
      if (status) status.textContent = 'Your email draft is opening. Please review it and press Send.';
      window.location.href = mailto;
    }

    inquiryForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const status = inquiryForm.querySelector('.form-status');
      const submitButton = inquiryForm.querySelector('button[type="submit"]');
      const formData = new FormData(inquiryForm);
      const payload = Object.fromEntries(formData.entries());

      if (window.location.protocol === 'file:') {
        openInquiryEmail(payload, status);
        return;
      }

      if (submitButton) submitButton.disabled = true;
      if (status) status.textContent = 'Sending your inquiry…';

      try {
        const response = await fetch('https://formsubmit.co/ajax/virtualcommsandco@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to send');
        inquiryForm.reset();
        if (status) status.textContent = 'Thank you — your inquiry has been sent successfully.';
      } catch (error) {
        openInquiryEmail(payload, status);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
})();
