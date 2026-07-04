(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const allAnchors = document.querySelectorAll('a[href^="#"]');
  const revealElements = document.querySelectorAll('.reveal');
  const contactForm = document.getElementById('contactForm');

  /* ── Local media paths (add files to these folders) ── */
  const TEMPLE_IMAGES_DIR = 'images/temple/';
  const TEMPLE_VIDEOS_DIR = 'videos/temple/';
  const TEMPLE_IMAGE_FILES = ['hero.jpg', '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'];
  const TEMPLE_VIDEO_FILES = ['01.mp4', '02.mp4', 'tour.mp4'];

  function probeImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function probeVideo(src) {
    return new Promise(resolve => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve(src);
      video.onerror = () => resolve(null);
      video.src = src;
    });
  }

  async function loadExistingFiles(dir, files, probe) {
    const results = await Promise.all(
      files.map(file => probe(`${dir}${file}`))
    );
    return results.filter(Boolean);
  }

  async function initTempleMedia() {
    const heroImg = document.getElementById('templeHeroImg');
    const galleryEl = document.getElementById('templeGallery');
    const videosEl = document.getElementById('templeVideos');
    if (!heroImg || !galleryEl || !videosEl) return;

    const fallback = heroImg.dataset.fallback;
    const images = await loadExistingFiles(TEMPLE_IMAGES_DIR, TEMPLE_IMAGE_FILES, probeImage);
    const videos = await loadExistingFiles(TEMPLE_VIDEOS_DIR, TEMPLE_VIDEO_FILES, probeVideo);

    const heroSrc = images.find(src => src.endsWith('hero.jpg')) || images[0] || fallback;
    heroImg.src = heroSrc;
    heroImg.onerror = () => { heroImg.src = fallback; };

    const galleryImages = images.filter(src => !src.endsWith('hero.jpg'));

    if (galleryImages.length) {
      galleryEl.innerHTML = galleryImages.map(src => `
        <figure class="temple-gallery-item">
          <img src="${src}" alt="Sri Lakshmi Narasimha Swamy Temple">
        </figure>
      `).join('');
    } else {
      galleryEl.innerHTML = '<p class="temple-media-empty">Add photos to <code>images/temple/</code> (e.g. 01.jpg, 02.jpg)</p>';
    }

    if (videos.length) {
      videosEl.innerHTML = videos.map(src => `
        <div class="temple-video-item">
          <video controls preload="metadata" playsinline>
            <source src="${src}" type="video/mp4">
          </video>
        </div>
      `).join('');
    } else {
      videosEl.innerHTML = '<p class="temple-media-empty">Add videos to <code>videos/temple/</code> (e.g. 01.mp4, tour.mp4)</p>';
    }
  }

  initTempleMedia();

  /* ── Sticky header ── */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile navigation ── */
  function closeNav() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navAnchors.forEach(link => {
    link.addEventListener('click', closeNav);
  });

  /* ── Smooth scroll for anchor links ── */
  allAnchors.forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#' || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = header.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Active nav link highlighting ── */
  const sections = document.querySelectorAll('section[id], article[id]');

  function highlightNav() {
    const scrollPos = window.scrollY + header.offsetHeight + 80;
    let current = 'home';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        current = id;
      }
    });

    navAnchors.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  /* ── Scroll reveal with Intersection Observer ── */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));

  /* ── Staggered reveal for grids ── */
  const staggerGrids = [
    '.attractions-grid',
    '.gallery-grid',
    '.festival-grid',
    '.contact-grid'
  ];

  staggerGrids.forEach(selector => {
    document.querySelectorAll(selector).forEach(grid => {
      grid.querySelectorAll('.reveal').forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.08}s`;
      });
    });
  });

  /* ── Gallery light hover parallax ── */
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.zIndex = '2';
    });
    item.addEventListener('mouseleave', () => {
      item.style.zIndex = '';
    });
  });

  /* ── Attraction card tilt on hover (desktop) ── */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.attraction-card:not(.temple-section)').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-8px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Contact form ── */
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Message Sent!';
      btn.disabled = true;
      btn.style.opacity = '0.85';

      setTimeout(() => {
        contactForm.reset();
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
      }, 2500);
    });
  }

  /* ── Close mobile nav on resize ── */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
  });
})();
