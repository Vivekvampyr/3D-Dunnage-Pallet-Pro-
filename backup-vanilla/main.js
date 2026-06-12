/* ============================================
   DUNNAGE PRO — Cinematic Animation Engine
   GSAP ScrollTrigger + Swiper + Lenis Smooth Scroll
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     DOM REFERENCES
     ------------------------------------------ */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const preloader       = $('#preloader');
  const preloaderBar     = $('#preloader-progress');
  const heroBg          = $('#hero-bg');
  const enterBtn        = $('#enter-btn');
  const scrollHint      = $('#scroll-hint');
  const gateContainer   = $('#gate-container');
  const gateVideo       = $('#gate-video');
  const lightBeams      = $('#light-beams');
  const transitionOvl   = $('#transition-overlay');
  const warehouseVideo  = $('#warehouse-video');
  const particlesCanvas = $('#particles');
  const siteHeader      = $('#site-header');
  const menuToggle      = $('#menu-toggle');
  const mobileSidebar   = $('#mobile-sidebar');
  const sidebarOverlay  = $('#sidebar-overlay');

  let lenis = null;
  let gateOpened = false;
  let particlesRAF = null;
  let problemsSwiper = null;


  /* ------------------------------------------
     PRELOADER
     ------------------------------------------ */
  function runPreloader() {
    return new Promise((resolve) => {
      const critical = [
        new Promise((r) => {
          const img = new Image();
          img.onload = img.onerror = r;
          img.src = 'assets/Warehouse_Exterior_Image.png';
        }),
        new Promise((r) => {
          if (gateVideo.readyState >= 2) return r();
          gateVideo.oncanplaythrough = r;
          gateVideo.onerror = r;
          setTimeout(r, 4000);
        }),
      ];

      let progress = 0;
      const tick = setInterval(() => {
        progress = Math.min(progress + 0.02, 0.85);
        preloaderBar.style.transform = `scaleX(${progress})`;
      }, 30);

      Promise.all(critical).then(() => {
        clearInterval(tick);
        preloaderBar.style.transform = 'scaleX(1)';

        setTimeout(() => {
          preloader.classList.add('hidden');
          setTimeout(resolve, 700);
        }, 400);
      });
    });
  }


  /* ------------------------------------------
     HERO INTRO ANIMATION
     ------------------------------------------ */
  function animateHero() {
    requestAnimationFrame(() => heroBg.classList.add('zoom-in'));

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to('#login-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
    })
    .to('#hero-headline', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.6')
    .to('#hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5')
    .to(['.login-field', '.login-options'], {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
    }, '-=0.4')
    .to('.login-form .enter-btn', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.3');
  }


  /* ------------------------------------------
     GATE OPENING SEQUENCE (Optimized for less lag)
     ------------------------------------------ */
  function openGate() {
    if (gateOpened) return;
    gateOpened = true;

    enterBtn.style.pointerEvents = 'none';

    gateVideo.currentTime = 0;

    const tl = gsap.timeline();

    // Quick fade out hero
    tl.to('.hero-content', {
      opacity: 0,
      y: -30,
      duration: 0.5,
      ease: 'power2.in',
    })
    .call(() => {
      gateContainer.classList.add('active');
      gateVideo.play().catch(() => {
        transitionToWarehouse();
      });
    })
    .call(() => {
      lightBeams.classList.add('active');
    }, [], '+=0.4');

    gateVideo.addEventListener('timeupdate', onGateProgress);
    gateVideo.addEventListener('ended', () => transitionToWarehouse());

    // Reduced safety timeout
    setTimeout(() => {
      if (!document.body.classList.contains('gate-done')) {
        transitionToWarehouse();
      }
    }, 6000);
  }

  function onGateProgress() {
    if (gateVideo.duration && gateVideo.currentTime >= gateVideo.duration - 0.5) {
      gateVideo.removeEventListener('timeupdate', onGateProgress);
      transitionToWarehouse();
    }
  }

  function transitionToWarehouse() {
    if (document.body.classList.contains('gate-done')) return;
    document.body.classList.add('gate-done');

    const tl = gsap.timeline();

    // Faster fade to black
    tl.to(transitionOvl, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.inOut',
    })
    .call(() => {
      gateContainer.classList.remove('active');
      lightBeams.classList.remove('active');
      gateVideo.pause();
      gateVideo.removeAttribute('src');
      gateVideo.load();

      document.body.classList.remove('no-scroll');

      // Scroll to warehouse section start
      const warehouseSection = document.getElementById('warehouse');
      if (warehouseSection) {
        window.scrollTo({ top: warehouseSection.offsetTop, behavior: 'instant' });
      } else {
        window.scrollTo({ top: window.innerHeight + 2, behavior: 'instant' });
      }

      requestAnimationFrame(() => {
        initLenis();
        initScrollAnimations();
        initParticles();
        initProblemsSlider();
      });
    })
    // Reveal
    .to(transitionOvl, {
      opacity: 0,
      duration: 1.4,
      ease: 'power2.out',
    }, '+=0.15')
    .set(transitionOvl, { pointerEvents: 'none' })
    .call(() => {
      animateHeaderLinks();
    });
  }


  /* ------------------------------------------
     LENIS SMOOTH SCROLL
     ------------------------------------------ */
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[DunnagePro] Lenis not loaded.');
      return;
    }

    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }


  /* ------------------------------------------
     SCROLL ANIMATIONS
     ------------------------------------------ */
  function initScrollAnimations() {
    warehouseScrollSetup();
    problemsIntroAnimation();
    initSolutionReveal();
    ctaAnimations();
  }


  /* --- Warehouse Video Scrub + Text Panels --- */
  function warehouseScrollSetup() {
    let targetTime = 0;
    let isSeeking = false;

    warehouseVideo.addEventListener('seeked', () => {
      isSeeking = false;
    });

    function renderVideo() {
      if (warehouseVideo.readyState >= 2 && !isSeeking && Math.abs(warehouseVideo.currentTime - targetTime) > 0.05) {
        isSeeking = true;
        warehouseVideo.currentTime = targetTime;
      }
      requestAnimationFrame(renderVideo);
    }

    function bindScrub() {
      const dur = warehouseVideo.duration;
      if (!dur || isNaN(dur)) return;

      const proxy = { t: 0 };

      gsap.to(proxy, {
        t: dur,
        ease: 'none',
        scrollTrigger: {
          trigger: '#warehouse',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
        onUpdate() {
          targetTime = proxy.t;
        },
      });

      requestAnimationFrame(renderVideo);
    }

    if (warehouseVideo.readyState >= 1) {
      bindScrub();
    } else {
      warehouseVideo.addEventListener('loadedmetadata', bindScrub, { once: true });
    }

    const panels = $$('.warehouse-text');
    panels.forEach((panel, i) => {
      const enter = 10 + i * 28;
      const peak  = enter + 8;
      const exit  = enter + 22;

      gsap.fromTo(panel,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#warehouse',
            start: `${enter}% top`,
            end: `${peak}% top`,
            scrub: true,
          },
        }
      );

      gsap.to(panel, {
        opacity: 0,
        y: -40,
        scale: 0.97,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '#warehouse',
          start: `${peak + 4}% top`,
          end: `${exit}% top`,
          scrub: true,
        },
      });
    });
  }


  /* ------------------------------------------
     PROBLEMS — Intro Animation (scroll-triggered)
     ------------------------------------------ */
  function problemsIntroAnimation() {
    const introEl = $('#problems-intro');
    if (!introEl) return;

    gsap.from('.problems-intro-inner', {
      scrollTrigger: {
        trigger: '.problems-intro',
        start: 'top 75%',
      },
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
    });
  }


  /* ------------------------------------------
     PROBLEM STATEMENTS — Scroll-Driven Slider
     ------------------------------------------ */
  function initProblemsSlider() {
    const slides = $$('.problem-slide');
    const dots = $$('.progress-dot');
    const counterEl = $('#counter-current');
    const headerEl = $('#problems-intro');
    const progressEl = $('#problem-progress');
    const totalSlides = slides.length;

    if (!totalSlides) return;

    let currentSlide = -1;

    function activateSlide(index) {
      if (index === currentSlide) return;

      const prev = currentSlide;
      currentSlide = index;

      if (counterEl) {
        counterEl.textContent = String(index + 1).padStart(2, '0');
      }

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      if (prev >= 0 && prev < totalSlides) {
        slides[prev].classList.remove('active');
      }

      slides[index].classList.add('active');
    }

    ScrollTrigger.create({
      trigger: '#problems',
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate(self) {
        const progress = self.progress;

        // First 8%: show header, hide slides
        if (progress < 0.08) {
          gsap.to(headerEl, { opacity: 1, duration: 0.5 });
          gsap.to(progressEl, { opacity: 0, duration: 0.3, pointerEvents: 'none' });
          if (currentSlide >= 0) {
            slides[currentSlide].classList.remove('active');
            currentSlide = -1;
          }
          return;
        }

        // Hide header, show progress
        gsap.to(headerEl, { opacity: 0, duration: 0.4 });
        gsap.to(progressEl, { opacity: 1, duration: 0.5, pointerEvents: 'auto' });

        // Map remaining progress to slide index
        const slideProgress = (progress - 0.08) / 0.92;
        const targetIndex = Math.min(
          totalSlides - 1,
          Math.floor(slideProgress * totalSlides)
        );

        activateSlide(targetIndex);
      },
    });
  }


  /* ------------------------------------------
     SOLUTION SECTION — Pinned Cinematic Reveal & Vertical Scroll
     ------------------------------------------ */
  function initSolutionReveal() {
    const solutionSec = $('#solution');
    const track = $('#benefits-track');
    
    if (!solutionSec || !track) return;

    // Calculate vertical scroll amount
    function getScrollAmount() {
      // track height minus viewport height + some padding
      let trackHeight = track.scrollHeight;
      return -(trackHeight - window.innerHeight + window.innerHeight * 0.1); 
    }

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: solutionSec,
          start: 'top top',
          end: '+=400%', // 400vh pin duration
          pin: true,
          scrub: 1, // Smooth scrubbing
          invalidateOnRefresh: true, // Recalculate values on resize
        }
      });

      // Phase 1: Product scales in from dark
      tl.to('#product-image', { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 1 }, 0)
      .to('#product-spotlight', { opacity: 1, ease: 'power2.out', duration: 1 }, 0)
      .to('#solution-bg-text', { opacity: 0.06, scale: 1.1, ease: 'none', duration: 1.5 }, 0)
      .to('#solution-headline', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 0.2);

      // Pause slightly when fully revealed
      tl.to({}, { duration: 0.5 });

      // Phase 2: Vertical scroll of benefits track on left, product moves to right
      tl.to(track, { y: getScrollAmount, ease: 'none', duration: 3 }, 'phase2')
      .to('#product-showcase', { x: '25vw', opacity: 1, scale: 0.95, ease: 'power1.inOut', duration: 1 }, 'phase2')
      .to('#solution-headline', { opacity: 0, y: -50, ease: 'power1.in', duration: 1 }, 'phase2');
    });

    mm.add("(max-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: solutionSec,
          start: 'top top',
          end: '+=400%', 
          pin: true,
          scrub: 1, 
          invalidateOnRefresh: true, 
        }
      });

      // Phase 1: Product scales in from dark
      tl.to('#product-image', { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 1 }, 0)
      .to('#product-spotlight', { opacity: 1, ease: 'power2.out', duration: 1 }, 0)
      .to('#solution-bg-text', { opacity: 0.06, scale: 1.1, ease: 'none', duration: 1.5 }, 0)
      .to('#solution-headline', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 0.2);

      tl.to({}, { duration: 0.5 });

      // Phase 2: On mobile, product stays centered but fades to background
      tl.to(track, { y: getScrollAmount, ease: 'none', duration: 3 }, 'phase2')
      .to('#product-showcase', { opacity: 0.15, scale: 0.9, ease: 'power1.inOut', duration: 1 }, 'phase2')
      .to('#solution-headline', { opacity: 0, y: -50, ease: 'power1.in', duration: 1 }, 'phase2');
    });
  }


  /* --- CTA Section --- */
  function ctaAnimations() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#cta',
        start: 'top 72%',
      },
    });

    tl.from('#cta-headline', {
      opacity: 0, y: 45, duration: 1, ease: 'power3.out',
    })
    .from('#cta-subtitle', {
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
    }, '-=0.5')
    .from('#cta-buttons', {
      opacity: 0, y: 25, duration: 0.8, ease: 'power3.out',
    }, '-=0.4')
    .from('#contact-form', {
      opacity: 0, y: 35, duration: 0.9, ease: 'power3.out',
    }, '-=0.3')
    .from('#trust-indicators', {
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
    }, '-=0.3');
  }


  /* ------------------------------------------
     PARTICLE SYSTEM (Warehouse Dust)
     ------------------------------------------ */
  function initParticles() {
    const canvas = particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let isParticlesVisible = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = Math.min(40, Math.floor(window.innerWidth / 30));
    const particles = [];

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.15 - 0.08,
        o: Math.random() * 0.25 + 0.05,
        oDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.o += p.oDir * 0.001;
        if (p.o > 0.3 || p.o < 0.03) p.oDir *= -1;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.y > canvas.height + 5) p.y = -5;
        if (p.y < -5) p.y = canvas.height + 5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 190, 160, ${p.o})`;
        ctx.fill();
      }

      if (isParticlesVisible) {
        particlesRAF = requestAnimationFrame(draw);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isParticlesVisible) {
            isParticlesVisible = true;
            draw();
          }
        } else {
          isParticlesVisible = false;
          if (particlesRAF) cancelAnimationFrame(particlesRAF);
        }
      });
    }, { threshold: 0 });

    const warehouseSec = document.getElementById('warehouse');
    if (warehouseSec) {
      observer.observe(warehouseSec);
    } else {
      isParticlesVisible = true;
      draw();
    }
  }


  /* ------------------------------------------
     FORM INTERACTION
     ------------------------------------------ */
  function initForm() {
    const form = $('#inquiry-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = $('#form-submit-btn');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Sent Successfully
      `;
      btn.style.background = '#2d8a4e';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.pointerEvents = '';
        form.reset();
      }, 3500);
    });

    $('#btn-quote')?.addEventListener('click', () => {
      const formEl = $('#contact-form');
      if (formEl) {
        if (lenis) {
          lenis.scrollTo(formEl, { offset: -40 });
        } else {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    $('#btn-contact')?.addEventListener('click', () => {
      const formEl = $('#contact-form');
      if (formEl) {
        if (lenis) {
          lenis.scrollTo(formEl, { offset: -40 });
        } else {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => $('#form-name')?.focus(), 600);
      }
    });
  }


  /* ------------------------------------------
     MOBILE SIDEBAR & NAVIGATION INTERACTIVITY
     ------------------------------------------ */
  function openMobileSidebar() {
    menuToggle?.classList.add('active');
    menuToggle?.setAttribute('aria-expanded', 'true');
    mobileSidebar?.classList.add('open');
    mobileSidebar?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sidebar-open');
    
    // Stagger transition on the sidebar links
    const links = $$('.sidebar-link');
    links.forEach((link, idx) => {
      link.style.transitionDelay = `${0.1 + idx * 0.05}s`;
    });
  }

  function closeMobileSidebar() {
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileSidebar?.classList.remove('open');
    mobileSidebar?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sidebar-open');
    
    const links = $$('.sidebar-link');
    links.forEach((link) => {
      link.style.transitionDelay = '0s';
    });
  }

  function toggleMobileSidebar() {
    const isOpen = mobileSidebar?.classList.contains('open');
    if (isOpen) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  }

  function updateActiveNavLink(activeId) {
    const allNavLinks = $$('.nav-link');
    const allSidebarLinks = $$('.sidebar-link');
    
    allNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${activeId}`);
    });
    
    allSidebarLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${activeId}`);
    });
  }

  function animateHeaderLinks() {
    gsap.from('.nav-link', {
      opacity: 0,
      y: -20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.5
    });
  }

  function initNavigation() {
    // Hamburger menu toggle
    menuToggle?.addEventListener('click', toggleMobileSidebar);
    
    // Close sidebar on overlay click
    sidebarOverlay?.addEventListener('click', closeMobileSidebar);

    // Intercept clicks on nav links for smooth scroll using Lenis
    const allLinks = $$('.nav-link, .sidebar-link, .header-logo');
    allLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        
        e.preventDefault();
        
        // Close sidebar if open
        closeMobileSidebar();
        
        const target = $(href);
        if (target) {
          if (lenis) {
            // Subtract header height from scroll target offset
            const offset = window.innerWidth <= 768 ? -70 : -80;
            lenis.scrollTo(target, { offset: offset });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Update active state of links based on ScrollTrigger
    const sections = ['hero', 'warehouse', 'problems', 'solution', 'cta'];
    sections.forEach((secId) => {
      const section = $(`#${secId}`);
      if (!section) return;
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle(self) {
          if (self.isActive) {
            updateActiveNavLink(secId);
          }
        }
      });
    });
  }


  /* ------------------------------------------
     BOOTSTRAP
     ------------------------------------------ */
  async function boot() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('[DunnagePro] GSAP not loaded.');
      preloader?.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initForm();
    initNavigation();

    await runPreloader();
    animateHero();
  }

  // --- LOGIN FORM HANDLER ---
  const loginForm = $('#login-form');
  const loginError = $('#login-error');
  const loginCard = $('#login-card');

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.add('visible');
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 550);
  }

  function clearLoginError() {
    loginError.classList.remove('visible');
    loginError.textContent = '';
  }

  function validateLogin(email, password) {
    if (!email.trim()) {
      $('#login-field-email')?.classList.add('error');
      showLoginError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      $('#login-field-email')?.classList.add('error');
      showLoginError('Please enter a valid email address.');
      return false;
    }
    if (!password.trim()) {
      $('#login-field-password')?.classList.add('error');
      showLoginError('Please enter your password.');
      return false;
    }
    if (password.trim().length < 3) {
      $('#login-field-password')?.classList.add('error');
      showLoginError('Password must be at least 3 characters.');
      return false;
    }
    return true;
  }

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    clearLoginError();
    $$('.login-field.error').forEach((f) => f.classList.remove('error'));

    const email = $('#login-email')?.value || '';
    const password = $('#login-password')?.value || '';

    if (!validateLogin(email, password)) return;

    openGate();
  });

  $$('.login-input-wrap input').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.login-field')?.classList.remove('error');
      clearLoginError();
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
