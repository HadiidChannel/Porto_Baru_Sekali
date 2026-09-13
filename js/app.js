/* ==========================================================================
   MAIN APPLICATION BOOTSTRAP - APP.JS
   Event Listeners, Mobile Drawer, Contact Form, App Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Visual Effects & Animations
  PortfolioAnimations.initAmbientCanvas('ambient-canvas');
  PortfolioAnimations.initScrollReveal();
  PortfolioAnimations.initStatCounters();

  PortfolioAnimations.initTypewriter('hero-typewriter', [
    'Web Application Engineer',
    'Creative Front-End Developer',
    'Internet Of Things',
    'Clean Code & Performance'
  ]);

  // Muat data terbaru dari disk/server (data/portfolio.json) jika ada
  await PortfolioStore.loadFromServer();

  // 2. Initialize UI & Data Layer
  PortfolioUI.init();

  // 3. Navbar Scrolled State
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // 4. Mobile Navigation Drawer Controls
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const navBackdrop = document.getElementById('nav-backdrop');

  function toggleMobileMenu(forceClose = false) {
    const isOpen = forceClose ? false : !navLinks.classList.contains('active');
    navLinks.classList.toggle('active', isOpen);
    navBackdrop.classList.toggle('active', isOpen);
    
    // Switch icon between menu and x
    if (mobileToggle) {
      mobileToggle.innerHTML = isOpen
        ? '<i data-lucide="x" style="width: 26px; height: 26px;"></i>'
        : '<i data-lucide="menu" style="width: 26px; height: 26px;"></i>';
      if (window.lucide) lucide.createIcons();
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => toggleMobileMenu());
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => toggleMobileMenu(true));
  }

  // Close mobile drawer when clicking navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu(true);
    });
  });

  // 5. Open Management Modal Handlers
  const openManageBtns = document.querySelectorAll('.open-manage-modal');
  openManageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleMobileMenu(true);
      // Reset form dan state upload untuk entri baru
      const formProj = document.getElementById('form-project');
      const formCert = document.getElementById('form-cert');
      if (formProj) formProj.reset();
      if (formCert) formCert.reset();
      
      const projIdEl = document.getElementById('proj-id');
      const certIdEl = document.getElementById('cert-id');
      if (projIdEl) projIdEl.value = '';
      if (certIdEl) certIdEl.value = '';

      PortfolioUI.uploadedProjectImages = [];
      PortfolioUI.renderProjectImagesPreview();
      PortfolioUI.uploadedCertImage = '';
      PortfolioUI.renderCertImagePreview();

      const projSubmitBtn = document.getElementById('btn-submit-project');
      if (projSubmitBtn) projSubmitBtn.textContent = 'Simpan Proyek';
      const certSubmitBtn = document.getElementById('btn-submit-cert');
      if (certSubmitBtn) certSubmitBtn.textContent = 'Simpan Sertifikat';
      PortfolioUI.openModal('admin-modal');
    });
  });

  // 6. Copy Email to Clipboard Feature
  const copyEmailBtn = document.getElementById('btn-copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'alexander.dev@example.com';
      try {
        await navigator.clipboard.writeText(email);
        PortfolioUI.showToast(`Email (${email}) berhasil disalin ke clipboard!`, 'success');
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        PortfolioUI.showToast(`Email (${email}) berhasil disalin!`, 'success');
      }
    });
  }

  // 7. Contact Form Interactive Handler (Interactive feedback)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i data-lucide="loader-2" class="spin" style="width: 18px; height: 18px; animation: spinSlow 1s linear infinite;"></i>
        Mengirim Pesan...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        PortfolioUI.showToast(`Terima kasih ${name || 'Sobat'}, pesan Anda berhasil terkirim!`, 'success');
        if (window.lucide) lucide.createIcons();
      }, 1000);
    });
  }

  // 8. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});
