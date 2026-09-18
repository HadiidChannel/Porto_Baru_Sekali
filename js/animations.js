/* ==========================================================================
   ANIMATIONS & VISUAL EFFECTS - ANIMATIONS.JS
   Typewriter Effect, Intersection Observer, Ambient Canvas Glow
   Performance: Zero Jank, Battery Friendly (Pauses when tab hidden)
   ========================================================================== */

const Animations = {
  // 1. Typewriter Effect
  initTypewriter(elementId, words, period = 2000) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let loopNum = 0;
    let isDeleting = false;
    let txt = '';

    function tick() {
      const i = loopNum % words.length;
      const fullTxt = words[i];

      if (isDeleting) {
        txt = fullTxt.substring(0, txt.length - 1);
      } else {
        txt = fullTxt.substring(0, txt.length + 1);
      }

      el.textContent = txt;

      let delta = 150 - Math.random() * 50;

      if (isDeleting) {
        delta /= 2;
      }

      if (!isDeleting && txt === fullTxt) {
        delta = period;
        isDeleting = true;
      } else if (isDeleting && txt === '') {
        isDeleting = false;
        loopNum++;
        delta = 400;
      }

      setTimeout(tick, delta);
    }

    tick();
  },

  // 2. IntersectionObserver for Reveal Elements
  initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(el => observer.observe(el));
  },

  // 3. Ultra-Lightweight Ambient Background Particles
  initAmbientCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let isVisible = true;
    let animationFrameId = null;

    // Responsive resize
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Pause when tab is not visible to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animationFrameId) {
        render();
      }
    });

    // Particle pool (only 25-30 particles for zero performance hit)
    const particleCount = window.innerWidth < 768 ? 16 : 28;
    const particles = [];

    const colors = [
      'rgba(37, 244, 238, ',   // TikTok Cyan #25f4ee
      'rgba(254, 44, 85, ',    // TikTok Neon Red/Pink #fe2c55
      'rgba(142, 81, 255, '   // Cyber Violet #8e51ff
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }

    function render() {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.colorBase + p.alpha + ')';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  },

  // 4. Number Counting Animation
  initStatCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = +entry.target.getAttribute('data-target');
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              entry.target.textContent = target + '+';
              clearInterval(timer);
            } else {
              entry.target.textContent = current + '+';
            }
          }, 40);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }
};

window.PortfolioAnimations = Animations;
