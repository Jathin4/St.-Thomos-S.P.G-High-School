document.addEventListener('DOMContentLoaded', () => {

  /* ── Card Rails: drag-to-scroll + continuous smooth auto-scroll (each rail runs independently) ── */
  document.querySelectorAll('.card-rail').forEach((rail) => {
    // Always duplicate at least once so there's a matching second set to loop into seamlessly.
    // The wrap point (setWidth) must stay reachable within the native max scroll, so keep
    // adding copies of the original set (one at a time, not doubling — doubling overshoots,
    // e.g. jumping a 2-card row straight to 8 instead of the 6 it actually needs) until
    // scrollWidth - clientWidth >= setWidth — otherwise the glide stalls partway, waiting
    // for a scrollLeft the browser will never let it reach.
    const setWidth = rail.scrollWidth; // true single-set width, measured before any duplication
    const originalHTML = rail.innerHTML; // the pristine original set, appended fresh each pass
    let guard = 0;
    do {
      rail.insertAdjacentHTML('beforeend', originalHTML);
      guard++;
    } while (rail.scrollWidth - rail.clientWidth < setWidth && guard < 8);

    let dragging = false, startX = 0, startScroll = 0;

    const pxPerSecond = 45; // a slow, steady crawl — not a card-per-second sprint
    let lastTime = null;

    const glide = (time) => {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      // check hover live via :hover instead of a mouseenter/mouseleave flag — on touch
      // devices "enter" can fire without a matching "leave", which used to freeze this
      // permanently; matches(':hover') can never get stuck since it's read fresh each frame
      if (!dragging && !rail.matches(':hover')) {
        rail.scrollLeft += pxPerSecond * dt;
        // wrap the seam invisibly and instantly — unnoticeable since the duplicate set is pixel-identical
        if (rail.scrollLeft >= setWidth) rail.scrollLeft -= setWidth;
      }
      requestAnimationFrame(glide);
    };
    requestAnimationFrame(glide);

    rail.addEventListener('mouseleave', () => { dragging = false; rail.classList.remove('dragging'); });
    rail.addEventListener('mousedown', (e) => {
      dragging = true;
      rail.classList.add('dragging');
      startX = e.pageX;
      startScroll = rail.scrollLeft;
    });
    window.addEventListener('mouseup', () => { dragging = false; rail.classList.remove('dragging'); });
    rail.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      rail.scrollLeft = startScroll - (e.pageX - startX);
    });
  });

  /* ── Mobile Menu Toggle ── */
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  /* ── Sticky Header Shadow & Size ── */
  const header = document.querySelector('.main-header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }

  /* ── Hero Slider (Carousels) ── */
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  let current  = 0;
  let sliderInterval;

  function goTo(i) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startSlider() {
    if (!slides.length) return;
    sliderInterval = setInterval(() => goTo(current + 1), 6000);
  }

  function stopSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
  }

  if (slides.length) {
    goTo(0);
    startSlider();
    dots.forEach((d, i) => d.addEventListener('click', () => {
      stopSlider();
      goTo(i);
      startSlider();
    }));
  }

  /* ── Scroll Reveal System ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── Counter Animation ── */
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        let count = 0;
        const duration = 1500; // Total duration in ms
        const frameRate = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameRate);
        const inc = target / totalFrames;
        
        let frame = 0;
        const step = () => {
          frame++;
          count = Math.min(inc * frame, target);
          el.textContent = Math.floor(count).toLocaleString() + suffix;
          if (frame < totalFrames) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        };
        step();
        statsObserver.unobserve(el);
      });
    }, { threshold: 0.2 });
    counters.forEach(c => statsObserver.observe(c));
  }

  /* ── Quick Nav: Active-Section Highlight (nav itself is sticky in-flow now) ── */
  const quickNavLinks = document.querySelectorAll('.quick-nav a[href^="#"]');
  if (quickNavLinks.length) {
    const qnTargets = Array.from(quickNavLinks)
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const highlightQuickNav = () => {
      const offset = (header ? header.offsetHeight : 80) + 40;
      let currentIndex = 0;
      qnTargets.forEach((el, i) => {
        if (el.getBoundingClientRect().top - offset <= 0) currentIndex = i;
      });
      quickNavLinks.forEach((a, i) => a.classList.toggle('active', i === currentIndex));
    };
    window.addEventListener('scroll', highlightQuickNav, { passive: true });
    highlightQuickNav();
  }

  /* ── Smooth Scroll for Anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      
      if (navLinks) navLinks.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
      
      const offset = header ? header.offsetHeight : 80;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });

  /* ── Gallery Lightbox System ── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    // Dynamically create Lightbox DOM
    let lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close Lightbox"><i class="fas fa-times"></i></button>
          <button class="lightbox-prev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
          <img src="" alt="School Gallery Image">
          <div class="lightbox-caption"></div>
          <button class="lightbox-next" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
        </div>
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;

    // Collect image sources and captions, de-duplicated by src — auto-scroll rails clone their
    // cards in the DOM to loop seamlessly, and without this the lightbox would treat each clone
    // as a new photo, so "next" never really reached the end, it just kept revealing repeats.
    const seenSrc = new Set();
    const imagesData = [];
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      const src = img ? img.getAttribute('src') : '';
      if (seenSrc.has(src)) return;
      seenSrc.add(src);
      const overlaySpan = item.querySelector('.gallery-overlay span');
      imagesData.push({
        src,
        alt: img ? img.getAttribute('alt') : '',
        caption: overlaySpan ? overlaySpan.textContent : (img ? img.getAttribute('alt') : '')
      });
    });

    function showLightboxImage(index) {
      // clamp instead of wrap — next/prev stop at the first/last photo instead of looping forever
      currentIndex = Math.max(0, Math.min(index, imagesData.length - 1));
      const data = imagesData[currentIndex];
      if (data) {
        lightboxImg.setAttribute('src', data.src);
        lightboxImg.setAttribute('alt', data.alt);
        lightboxCaption.textContent = data.caption;
      }
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === imagesData.length - 1;
    }

    function openLightbox(index) {
      showLightboxImage(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Stop page scrolling
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.setAttribute('src', '');
        lightboxCaption.textContent = '';
      }, 300);
    }

    // Attach click events to items — look up the de-duplicated index by src, so clicking a
    // rail clone still opens the one real entry instead of a phantom extra slot
    galleryItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const img = item.querySelector('img');
        const src = img ? img.getAttribute('src') : '';
        const idx = imagesData.findIndex(d => d.src === src);
        openLightbox(idx >= 0 ? idx : 0);
      });
    });

    // Close events
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Nav click events
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentIndex + 1);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
    });
  }

});
