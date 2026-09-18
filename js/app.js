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

  // 7. Contact Form Handler (Option A: Formspree AJAX to Gmail + Local Storage + Fallback)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        PortfolioUI.showToast('Mohon lengkapi semua kolom formulir.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i data-lucide="loader-2" class="spin" style="width: 18px; height: 18px; animation: spinSlow 1s linear infinite;"></i>
        Mengirim Pesan...
      `;
      if (window.lucide) lucide.createIcons();

      const formAction = contactForm.getAttribute('action') || '';
      const isFormspreeConfigured = formAction.includes('formspree.io/f/') && !formAction.includes('YOUR_FORMSPREE_ID');

      let isSentViaFormspree = false;

      // 1. Kirim via Formspree AJAX jika ID form sudah diisi
      if (isFormspreeConfigured) {
        try {
          const formData = new FormData(contactForm);
          const response = await fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            isSentViaFormspree = true;
          }
        } catch (err) {
          console.warn('[Formspree] Pengiriman via internet gagal:', err);
        }
      }

      // 2. Simpan juga salinan ke server lokal jika sedang aktif (/api/contact)
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
      } catch (err) {
        // Mode offline / statis (misal GitHub Pages)
      }

      // 3. Kembalikan state tombol form
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
      contactForm.reset();

      // 4. Feedback ke Pengguna
      if (isSentViaFormspree) {
        PortfolioUI.showToast(`Terima kasih ${name}, pesan Anda berhasil terkirim langsung ke Gmail Hadiid!`, 'success');
      } else if (!isFormspreeConfigured) {
        // Jika Formspree ID belum dimasukkan oleh user, beri notifikasi dan buka aplikasi email sebagai backup
        PortfolioUI.showToast(`Pesan tercatat! Membuka aplikasi email Anda ke hadiidarraad622@gmail.com...`, 'success');
        const mailtoUrl = `mailto:hadiidarraad622@gmail.com?subject=${encodeURIComponent('Pesan Portofolio dari ' + name)}&body=${encodeURIComponent('Halo Hadiid,\n\nNama: ' + name + '\nEmail: ' + email + '\n\nPesan:\n' + message)}`;
        window.open(mailtoUrl, '_blank');
      } else {
        PortfolioUI.showToast(`Terima kasih ${name}, pesan Anda berhasil dikirim!`, 'success');
      }
    });
  }

  // 8. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});
