/* ============================================
   ИВАН ТЮФЯКИН — Enhanced JS v3
   Story Carousel · Diploma Gallery · Lightbox
   Touch Swipe · Animations · 3D Tilt
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- STICKY HEADER ---------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ---------- BURGER MENU ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-3d, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 3D TILT ON CARDS ---------- */
  const tiltCards = document.querySelectorAll('.problem-card, .method-card, .result-card, .review-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- HERO IMAGE TILT ---------- */
  const heroImage = document.querySelector('.hero-image');
  heroImage?.addEventListener('mousemove', e => {
    const rect = heroImage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroImage.querySelector('img').style.transform =
      `perspective(1200px) rotateY(${x * 6}deg) rotateX(${y * -4}deg) scale(1.02)`;
  });
  heroImage?.addEventListener('mouseleave', () => {
    const img = heroImage.querySelector('img');
    if (img) img.style.transform = '';
  });

  /* ---------- BUTTON RIPPLE ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute; border-radius:50%; background:rgba(255,255,255,.35);
        width:0; height:0; left:${e.clientX - rect.left}px; top:${e.clientY - rect.top}px;
        transform:translate(-50%,-50%); pointer-events:none; animation: rippleAnim .6s ease-out forwards;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Add ripple animation
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `@keyframes rippleAnim { to { width:300px; height:300px; opacity:0; } }`;
    document.head.appendChild(style);
  }

  /* ---------- PARALLAX (desktop only) ---------- */
  if (window.innerWidth > 1024) {
    const orbs = document.querySelectorAll('.orb');
    const shapes = document.querySelectorAll('.shape-3d');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          orbs.forEach((orb, i) => {
            orb.style.transform = `translateY(${scrolled * (0.03 + i * 0.01)}px)`;
          });
          shapes.forEach((shape, i) => {
            shape.style.transform += ` translateY(${scrolled * (0.02 + i * 0.008)}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* ============================================
     STORY CAROUSEL
     ============================================ */
  const storyCarousel = (() => {
    const track = document.querySelector('.story-track');
    const slides = document.querySelectorAll('.story-slide');
    const prevBtn = document.querySelector('.story-arrow--prev');
    const nextBtn = document.querySelector('.story-arrow--next');
    const dotsContainer = document.querySelector('.story-dots');
    const currentEl = document.querySelector('.story-current');
    const totalEl = document.querySelector('.story-total');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    // Set total
    if (totalEl) totalEl.textContent = total;

    // Create dots
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, total - 1));
      track.style.transform = `translateX(-${current * 100}%)`;

      // Update dots
      dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });

      // Update counter
      if (currentEl) currentEl.textContent = current + 1;

      // Update arrows
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let startX = 0, isDragging = false;
    const wrapper = document.querySelector('.story-track-wrapper');

    wrapper?.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    wrapper?.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
      }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', e => {
      const storySection = document.getElementById('story');
      if (!storySection) return;
      const rect = storySection.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    goTo(0);
  })();


  /* ============================================
     GALLERIES (Diplomas, Reviews, etc.)
     ============================================ */
  const galleries = document.querySelectorAll('.gallery');

  galleries.forEach((galleryEl) => {
    const track = galleryEl.querySelector('.gallery-track');
    const items = galleryEl.querySelectorAll('.gallery-item');
    const prevBtn = galleryEl.querySelector('.gallery-arrow--prev');
    const nextBtn = galleryEl.querySelector('.gallery-arrow--next');
    const currentEl = galleryEl.querySelector('.gallery-current');
    const totalEl = galleryEl.querySelector('.gallery-total');

    if (!track || items.length === 0) return;

    let current = 0;
    const total = items.length;
    if (totalEl) totalEl.textContent = total;

    function getItemsPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, total - getItemsPerView());
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, getMaxIndex()));

      const perView = getItemsPerView();
      const gapPx = 16;
      
      const trackWrapper = galleryEl.querySelector('.gallery-track-wrapper');
      if (!trackWrapper) return;
      const wrapperWidth = trackWrapper.offsetWidth;
      const itemWidth = (wrapperWidth - gapPx * (perView - 1)) / perView;
      const offset = current * (itemWidth + gapPx);

      track.style.transform = `translateX(-${offset}px)`;

      if (currentEl) currentEl.textContent = current + 1;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= getMaxIndex();
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let startX = 0, isDragging = false;
    const wrapper = galleryEl.querySelector('.gallery-track-wrapper');

    wrapper?.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    wrapper?.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
      }
    }, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current), 150);
    });

    goTo(0);
  });

  /* ============================================
     LIGHTBOX (Dynamic per gallery)
     ============================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-arrow--prev');
  const lightboxNext = document.querySelector('.lightbox-arrow--next');
  const lightboxCurrentEl = document.querySelector('.lightbox-current');
  const lightboxTotalEl = document.querySelector('.lightbox-total');

  let currentLightboxSrcs = [];
  let lightboxIndex = 0;

  function openLightbox(galleryItem) {
    if (!lightbox) return;
    
    // Find the parent gallery of the clicked item
    const parentGallery = galleryItem.closest('.gallery');
    if (!parentGallery) return;

    // Get all images within this specific gallery
    const galleryItems = Array.from(parentGallery.querySelectorAll('.gallery-item'));
    currentLightboxSrcs = galleryItems.map(item => item.querySelector('img').src);
    
    // Set total count for this specific gallery
    if (lightboxTotalEl) lightboxTotalEl.textContent = currentLightboxSrcs.length;
    
    // Find index of the clicked item relative to this gallery
    lightboxIndex = galleryItems.indexOf(galleryItem);
    
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    if (!lightboxImg || currentLightboxSrcs.length === 0) return;
    lightboxImg.src = currentLightboxSrcs[lightboxIndex];
    if (lightboxCurrentEl) lightboxCurrentEl.textContent = lightboxIndex + 1;
  }

  // Attach click events
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  lightboxClose?.addEventListener('click', closeLightbox);

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxPrev?.addEventListener('click', e => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex - 1 + currentLightboxSrcs.length) % currentLightboxSrcs.length;
    updateLightbox();
  });

  lightboxNext?.addEventListener('click', e => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex + 1) % currentLightboxSrcs.length;
    updateLightbox();
  });

  // Lightbox keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + currentLightboxSrcs.length) % currentLightboxSrcs.length;
      updateLightbox();
    }
    if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % currentLightboxSrcs.length;
      updateLightbox();
    }
  });

  // Lightbox touch swipe
  let lbStartX = 0;
  lightbox?.addEventListener('touchstart', e => {
    lbStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox?.addEventListener('touchend', e => {
    const diff = lbStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) {
        lightboxIndex = (lightboxIndex + 1) % currentLightboxSrcs.length;
      } else {
        lightboxIndex = (lightboxIndex - 1 + currentLightboxSrcs.length) % currentLightboxSrcs.length;
      }
      updateLightbox();
    }
  }, { passive: true });

});
