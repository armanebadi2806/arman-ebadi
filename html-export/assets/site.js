(function () {
  const header = document.querySelector('[data-site-header]');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const insightNode = document.querySelector('[data-hero-insight]');
  const insightPrev = document.querySelector('[data-insight-prev]');
  const insightNext = document.querySelector('[data-insight-next]');
  const insightDots = Array.from(document.querySelectorAll('[data-insight-dot]'));
  const signalNodes = document.querySelectorAll('[data-signal-value]');
  const signalCountNodes = document.querySelectorAll('[data-signal-count]');
  const msFillNode = document.querySelector('[data-ms-fill]');
  const msCountNode = document.querySelector('[data-ms-count]');
  const progressNode = document.querySelector('[data-scroll-progress]');
  const sectionLinks = Array.from(document.querySelectorAll('.top-nav a[href^="#"]'));
  const heroIntel = document.querySelector('.landing-page .hero-intel');
  const mobileStickyCta = document.querySelector('.mobile-sticky-cta');
  const drawer = document.querySelector('[data-mobile-drawer]');
  const drawerOpen = document.querySelector('[data-mobile-menu-open]');
  const drawerCloseButtons = Array.from(document.querySelectorAll('[data-mobile-menu-close]'));
  const drawerLinks = drawer ? Array.from(drawer.querySelectorAll('a[href]')) : [];
  let lastFocused = null;
  const sectionTargets = sectionLinks
    .map((link) => {
      const id = link.getAttribute('href');
      const target = id ? document.querySelector(id) : null;
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lastFocused = document.activeElement;
    const panel = drawer.querySelector('.mobile-drawer-panel');
    const focusable = panel
      ? Array.from(panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
      : [];
    if (focusable.length) {
      focusable[0].focus();
    }
    updateMobileStickyCta();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    updateMobileStickyCta();
  }

  if (drawerOpen) {
    drawerOpen.addEventListener('click', openDrawer);
  }

  if (drawerCloseButtons.length) {
    drawerCloseButtons.forEach((btn) => btn.addEventListener('click', closeDrawer));
  }

  if (drawerLinks.length) {
    drawerLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const target = document.querySelector(targetId);
          if (target) {
            event.preventDefault();
            closeDrawer();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        closeDrawer();
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    const panel = drawer.querySelector('.mobile-drawer-panel');
    const focusable = panel
      ? Array.from(panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
      : [];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function updateMobileStickyCta() {
    if (!mobileStickyCta) return;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const pastThreshold = window.scrollY > 300;
    const drawerOpenState = drawer && drawer.classList.contains('is-open');
    if (mobile && pastThreshold && !drawerOpenState) {
      mobileStickyCta.classList.add('is-visible');
    } else {
      mobileStickyCta.classList.remove('is-visible');
    }
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function updateScrollProgress() {
    if (!progressNode) return;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
    progressNode.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
  }

  function updateActiveSection() {
    if (!sectionTargets.length) return;
    const pivot = window.scrollY + window.innerHeight * 0.28;
    let active = sectionTargets[0];

    sectionTargets.forEach((item) => {
      if (item.target.offsetTop <= pivot) active = item;
    });

    sectionTargets.forEach((item) => {
      item.link.classList.toggle('is-active', item === active);
    });
  }

  updateScrollProgress();
  updateActiveSection();
  window.addEventListener(
    'scroll',
    () => {
      updateScrollProgress();
      updateActiveSection();
      updateMobileStickyCta();
    },
    { passive: true }
  );
  window.addEventListener('resize', updateMobileStickyCta, { passive: true });
  updateMobileStickyCta();

  if (sectionLinks.length) {
    sectionLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => {
      item.classList.add('fade-item');
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  function animateRange(duration, onFrame) {
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      onFrame(eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (signalNodes.length || msFillNode) {
    window.setTimeout(() => {
      signalNodes.forEach((node) => {
        const target = Number(node.getAttribute('data-signal-value') || 0);
        const countNode = node
          .closest('.hero-signal-item')
          ?.querySelector('[data-signal-count]');

        animateRange(1150, (eased) => {
          const current = Math.round(target * eased);
          node.style.width = `${Math.max(0, Math.min(current, 100))}%`;
          if (countNode) countNode.textContent = String(current);
        });
      });

      if (msFillNode && msCountNode) {
        const msFillTarget = Number(msFillNode.getAttribute('data-ms-fill') || 100);
        const msTarget = Number(msCountNode.getAttribute('data-ms-count') || 50);

        animateRange(1050, (eased) => {
          const currentFill = Math.max(0, Math.min(msFillTarget * eased, 100));
          const currentMs = Math.round(msTarget * eased);
          msFillNode.style.width = `${currentFill}%`;
          msCountNode.textContent = String(currentMs);
        });
      }
    }, 220);
  }

  if (insightNode) {
    const lines = [
      'Zu viele Optionen und unklare Reihenfolge in der Nutzerführung.',
      'Keine klare Priorität zwischen Information, Vertrauen und Anfrage.',
      'Hohe kognitive Reibung durch unnötige Entscheidungsstufen.'
    ];
    let current = 0;
    let insightTimer = null;

    function applyInsightAnimation(direction, text) {
      if (!insightNode) {
        insightNode.textContent = text;
        return;
      }

      const outClass = direction === 'back' ? 'is-swipe-out-right' : 'is-swipe-out-left';
      const inClass = direction === 'back' ? 'is-swipe-in-right' : 'is-swipe-in-left';

      insightNode.classList.remove('is-swipe-out-left', 'is-swipe-in-left', 'is-swipe-out-right', 'is-swipe-in-right');
      insightNode.classList.add(outClass);

      window.setTimeout(() => {
        insightNode.textContent = text;
        insightNode.classList.remove(outClass);
        insightNode.classList.add(inClass);
        window.setTimeout(() => {
          insightNode.classList.remove(inClass);
        }, 360);
      }, 220);
    }

    function renderInsight(index, direction) {
      const safeIndex = ((index % lines.length) + lines.length) % lines.length;
      current = safeIndex;
      applyInsightAnimation(direction || 'next', lines[safeIndex]);
      insightDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === safeIndex);
      });
    }

    function startInsightTimer() {
      if (insightTimer) window.clearInterval(insightTimer);
      insightTimer = window.setInterval(() => {
        renderInsight(current + 1);
      }, 4200);
    }

    if (insightPrev) {
      insightPrev.addEventListener('click', () => {
        renderInsight(current - 1, 'back');
        startInsightTimer();
      });
    }

    if (insightNext) {
      insightNext.addEventListener('click', () => {
        renderInsight(current + 1, 'next');
        startInsightTimer();
      });
    }

    if (insightDots.length) {
      insightDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          renderInsight(index, index < current ? 'back' : 'next');
          startInsightTimer();
        });
      });
    }

    insightNode.textContent = lines[0];
    insightDots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === 0));
    startInsightTimer();
  }

  if (heroIntel && window.matchMedia('(hover: hover)').matches) {
    heroIntel.addEventListener('mousemove', (event) => {
      const rect = heroIntel.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = ((event.clientY - centerY) / rect.height) * -5.5;
      const rotateY = ((event.clientX - centerX) / rect.width) * 6;
      heroIntel.classList.add('is-interactive');
      heroIntel.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    heroIntel.addEventListener('mouseleave', () => {
      heroIntel.classList.remove('is-interactive');
      heroIntel.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }
})();
