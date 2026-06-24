document.addEventListener('DOMContentLoaded', () => {

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

    // Collect all image sources and captions from the current page
    const imagesData = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      const overlaySpan = item.querySelector('.gallery-overlay span');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        caption: overlaySpan ? overlaySpan.textContent : (img ? img.getAttribute('alt') : '')
      };
    });

    function showLightboxImage(index) {
      currentIndex = (index + imagesData.length) % imagesData.length;
      const data = imagesData[currentIndex];
      if (data) {
        lightboxImg.setAttribute('src', data.src);
        lightboxImg.setAttribute('alt', data.alt);
        lightboxCaption.textContent = data.caption;
      }
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

    // Attach click events to items
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
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
